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
  "今天也有好好往前一點點，Mochi 有看見。",
  "慢慢來也沒關係，先把今天過好就好。",
  "今天不用想太多，先照顧好自己就很棒。",
  "希望今天有一件小事，讓你覺得輕鬆一點。",
  "不用一次變勇敢，先做一點點就很好。",
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

function normalizeMessage(value: string) {
  const firstLine = value
    .replace(/[「」"“”]/g, "")
    .replace(/^[-*•\d.、\s]+/, "")
    .split(/\n+/)[0]
    ?.trim();
  return compactText(firstLine || FALLBACK_MESSAGES[0], 42);
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
    return FALLBACK_MESSAGES[userId % FALLBACK_MESSAGES.length];
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
            "你是 Healing Pick 的小貓郵差。你會把會員最近問過的事，變成一張簡短、白話、像朋友輕輕提醒的明信片。只輸出一句繁體中文短句，不要標題、不要 Markdown、不要引號。",
        },
        {
          role: "user",
          content: `請根據會員近期問過的內容與摘要，寫一句 16-28 字的白話明信片文字。

寫法要求：
- 優先回應「最近一筆最在意的事」，再用「重複出現的主題」當底色。
- 如果多筆都在問同一類事，就回應那個反覆出現的卡點，不要平均分配。
- 句子要像朋友或小貓郵差輕輕講一句話，可以有「你」「今天」「慢慢」「先」這種親近語氣。
- 用日常說法，不要太詩意、不要太像廣告文案、不要用抽象比喻。
- 少用「光」「宇宙」「能量」「綻放」「被接住」「溫柔地」這類文青或靈性詞。
- 可以參考會員稱呼，但只有在自然時才用，不要每次都硬塞名字。
- 不要直接說出隱私細節、人名、日期、具體事件。
- 不要提到「紀錄」「摘要」「占卜歷史」「我看到你問過」。
- 不要提病症、診斷或沉重字眼。
- 不要寫成泛用雞湯；要讓使用者感覺「這句話好像懂我最近卡在哪裡」。
- 句子要簡短，適合放在明信片底部，不要超過 28 字。

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
    return normalizeMessage(text);
  } catch {
    return FALLBACK_MESSAGES[userId % FALLBACK_MESSAGES.length];
  }
}

function serializePostcard(postcard: UserPostcard | undefined): PostcardPayload | null {
  if (!postcard) return null;
  return {
    id: postcard.id,
    imageUrl: postcard.imageUrl,
    message: postcard.message,
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
