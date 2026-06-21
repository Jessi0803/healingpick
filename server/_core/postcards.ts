import type { UserPostcard } from "../../drizzle/schema";
import {
  createScheduledPostcard,
  getCurrentNotifiedPostcard,
  getPostcardForDelivery,
  getRecentReadingSummariesByUser,
  getUserById,
  incrementUserLoginCount,
  markPostcardNotified,
} from "../db";
import { extractTextContent, invokeLLM } from "./llm";

const DEFAULT_POSTCARD_IMAGE_IDS = [
  "1h6jPMTDCWny3T56Nnyi9wc9XHrIBFLMd",
  "1dnmIZoGlkbzbs1Q-WKMEqqYePdBqb0h_",
  "1kcjIOTiXDikvJZiT9uNJD743NLaOi-Zf",
  "1fmSzfIiFaWXrb0L3KrSU2hUTTum583GR",
  "1x1MWr-G0nC4ZwfcIZrnr_ttXKpPsJJCE",
  "1J_PVEpEqifmeZg3258FNEdO8CwFMwykK",
  "1-HbZCnR_y506z82FXTx-WXRR1uOu02WA",
  "1PaD6ODtMCUw9PO3A07sx2xrpOHTArsB_",
  "16y5LTYPPL-yjlpUVAiV45Cb3n12nwo4M",
  "1LGy0257bJ9Ult6iY7QlGYCPhDcz0-iib",
];

const FALLBACK_MESSAGES = [
  "你今天已經很努力了，先休息一下吧。",
  "不用急，先把眼前這一步走好就好。",
  "想不清楚也沒關係，先讓自己喘口氣。",
  "今天先別逼自己太多，一點點也算前進。",
  "先照顧好自己，答案會慢慢清楚一點。",
];

const UNCLEAR_MESSAGE_PATTERNS = [
  /[…]/u,
  /(缺口|留白|留著才有|宇宙|能量|靈魂|課題|頻率|綻放|被接住|顯化)/u,
  /(分析一下|分析一點|看透|看清對方|對方看透)/u,
];

const READING_TYPE_LABELS = {
  tarot: "塔羅",
  ziwei: "紫微",
  fortune: "運勢",
  dream: "解夢",
} as const;

const THEME_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "感情與關係", pattern: /(感情|喜歡|曖昧|前任|分手|對象|關係|告白|聊天|聯絡|復合|愛情|婚)/u },
  { label: "工作與方向", pattern: /(工作|職場|離職|轉職|面試|老闆|同事|事業|方向|選擇|專案|升遷)/u },
  { label: "等待與結果", pattern: /(等待|結果|消息|通知|回覆|錄取|會不會|何時|進展|機會)/u },
  { label: "焦慮與壓力", pattern: /(焦慮|壓力|累|害怕|擔心|不安|卡住|煩|緊張|失眠)/u },
  { label: "自信與行動", pattern: /(自信|勇敢|行動|跨出去|決定|開始|改變|主動|相信自己)/u },
  { label: "金錢與生活", pattern: /(金錢|錢|收入|財運|花費|存款|生活|搬家|家人|家庭)/u },
];

export type PostcardPayload = Pick<
  UserPostcard,
  "id" | "imageUrl" | "message" | "createdLoginCount" | "deliverLoginCount" | "status"
>;

function driveImageUrl(id: string) {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

function configuredImageUrls() {
  const rawIds = process.env.POSTCARD_IMAGE_IDS;
  if (rawIds) {
    const urls = rawIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .map(driveImageUrl);
    if (urls.length > 0) return urls;
  }

  const rawUrls = process.env.POSTCARD_IMAGE_URLS;
  if (!rawUrls) return DEFAULT_POSTCARD_IMAGE_IDS.map(driveImageUrl);
  const urls = rawUrls
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  return urls.length > 0 ? urls : DEFAULT_POSTCARD_IMAGE_IDS.map(driveImageUrl);
}

function pickImageUrl(userId: number, loginCount: number) {
  const urls = configuredImageUrls();
  const postcardSequence = Math.max(0, Math.floor((loginCount - 1) / 2));
  const index = (Math.abs(userId) + postcardSequence) % urls.length;
  return urls[index];
}

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function fallbackMessage(seed: number) {
  return FALLBACK_MESSAGES[Math.abs(seed) % FALLBACK_MESSAGES.length];
}

function isClearPostcardMessage(value: string) {
  const text = value.trim();
  if (text.length < 8 || text.length > 28) return false;
  if (UNCLEAR_MESSAGE_PATTERNS.some((pattern) => pattern.test(text))) return false;
  if ((text.match(/[，、。！？]/gu)?.length ?? 0) > 2) return false;
  return true;
}

function normalizeMessage(value: string, seed: number) {
  const firstLine = value
    .replace(/[「」"“”]/g, "")
    .replace(/^[-*•\d.、\s]+/, "")
    .split(/\n+/)[0]
    ?.trim();
  return firstLine && isClearPostcardMessage(firstLine) ? firstLine : fallbackMessage(seed);
}

function inferThemes(text: string) {
  return THEME_PATTERNS
    .filter((entry) => entry.pattern.test(text))
    .map((entry) => entry.label);
}

function buildRecentFocus(
  summaries: Array<{ type: string; question: string | null; summary: string | null }>
) {
  return summaries
    .slice(0, 2)
    .map((row, index) => {
      const question = compactText(row.question ?? row.summary ?? "", 60);
      return `${index + 1}. ${READING_TYPE_LABELS[row.type as keyof typeof READING_TYPE_LABELS] ?? row.type}：${question || "沒有明確問題"}`;
    })
    .join("\n");
}

function buildRecurringThemes(
  summaries: Array<{ type: string; question: string | null; summary: string | null }>
) {
  const counts = new Map<string, number>();
  for (const row of summaries) {
    const base = `${row.question ?? ""} ${row.summary ?? ""}`;
    for (const theme of inferThemes(base)) {
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => `${label} x${count}`)
    .join("、");
}

async function generatePostcardMessage(userId: number) {
  const [user, summaries] = await Promise.all([
    getUserById(userId),
    getRecentReadingSummariesByUser(userId, 5),
  ]);
  if (summaries.length === 0) {
    return fallbackMessage(userId);
  }

  const displayName = compactText((user?.name ?? "").trim(), 18);
  const latestQuestion = compactText(summaries[0]?.question ?? summaries[0]?.summary ?? "", 70);
  const recurringThemes = buildRecurringThemes(summaries);
  const recentFocus = buildRecentFocus(summaries);
  const memory = summaries
    .map((row, index) => {
      const question = row.question ? `使用者問：${compactText(row.question, 90)}` : "使用者沒有留下明確問題";
      const typeLabel = READING_TYPE_LABELS[row.type as keyof typeof READING_TYPE_LABELS] ?? row.type;
      return `${index + 1}. ${typeLabel}｜${question}｜摘要：${compactText(row.summary ?? "", 150)}`;
    })
    .join("\n");

  try {
    const response = await invokeLLM({
      maxTokens: 120,
      messages: [
        {
          role: "system",
          content:
            "你是 Healing Pick 的小貓郵差。你會把會員最近問過的事，改寫成一句很白話、像朋友傳訊息提醒的明信片文字。只輸出一句繁體中文短句，不要標題、不要 Markdown、不要引號。",
        },
        {
          role: "user",
          content: `請根據會員近期問過的內容與摘要，寫一句 12-24 字的白話明信片文字。

寫法要求：
- 優先回應「最近一筆最在意的事」，再用「重複出現的主題」當底色。
- 如果多筆都在問同一類事，就回應那個反覆出現的卡點，不要平均分配。
- 句子要像朋友用 LINE 傳來的一句話，可以有「你」「今天」「先」「沒關係」「慢慢來」這種親近語氣。
- 用日常講法，越像真人說話越好，不要像占卜結論、廣告文案、詩句或心理測驗結果。
- 可以用簡單口語，例如：「先別急著決定」「你其實已經很努力了」「這件事慢慢看就好」。
- 不要用「看透」「分析」「缺口」「留白」這類不好懂或不自然的說法。
- 少用「光」「宇宙」「能量」「綻放」「被接住」「溫柔地」這類文青或靈性詞。
- 避免「相信宇宙安排」「內在力量」「靈魂課題」這類抽象說法。
- 可以參考會員稱呼，但只有在自然時才用，不要每次都硬塞名字。
- 不要直接說出隱私細節、人名、日期、具體事件。
- 不要提到「紀錄」「摘要」「占卜歷史」「我看到你問過」。
- 不要提病症、診斷或沉重字眼。
- 不要寫成泛用雞湯；要讓使用者感覺「這句話好像懂我最近卡在哪裡」。
- 句子要簡短，適合放在明信片底部，不要超過 24 字。

會員稱呼：${displayName || "未提供"}
最近一筆重點：${latestQuestion || "未提供"}
重複主題：${recurringThemes || "沒有明顯重複"}
最近兩筆聚焦：
${recentFocus}

完整近期脈絡：
${memory}`,
        },
      ],
    });
    const raw = response.choices?.[0]?.message?.content;
    const text = raw ? extractTextContent(raw as string | Array<{ type: string; text?: string }>) : "";
    return normalizeMessage(text, userId);
  } catch {
    return fallbackMessage(userId);
  }
}

function serializePostcard(postcard: UserPostcard | undefined): PostcardPayload | null {
  if (!postcard) return null;
  return {
    id: postcard.id,
    imageUrl: postcard.imageUrl,
    message: normalizeMessage(postcard.message, postcard.userId),
    createdLoginCount: postcard.createdLoginCount,
    deliverLoginCount: postcard.deliverLoginCount,
    status: postcard.status,
  };
}

export async function handleAuthenticatedOpen(userId: number) {
  const pendingPostcard = await getCurrentNotifiedPostcard(userId);
  if (pendingPostcard) {
    return { loginCount: null, postcard: serializePostcard(pendingPostcard) };
  }

  const loginCount = await incrementUserLoginCount(userId);
  if (!loginCount) {
    return { loginCount: null, postcard: null };
  }

  if (loginCount % 2 === 1) {
    const message = await generatePostcardMessage(userId);
    await createScheduledPostcard({
      userId,
      createdLoginCount: loginCount,
      deliverLoginCount: loginCount + 1,
      imageUrl: pickImageUrl(userId, loginCount),
      message,
      status: "scheduled",
    });
    return { loginCount, postcard: null };
  }

  const scheduled = await getPostcardForDelivery(userId, loginCount);
  const notified = scheduled ? await markPostcardNotified(scheduled.id) : await getCurrentNotifiedPostcard(userId);
  return { loginCount, postcard: serializePostcard(notified) };
}

export async function getPendingPostcard(userId: number) {
  return serializePostcard(await getCurrentNotifiedPostcard(userId));
}
