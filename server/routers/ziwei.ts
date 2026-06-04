import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chargeReading } from "../_core/credits";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { astro } from "iztro";
import { t, translateChineseDate } from "./ziwei-locale";

const ZIWEI_SECTION_START = "**目前問題在哪**";
const ZIWEI_SECTION_MARKERS: Array<[string, string]> = [
  ["目前問題在哪", "①"],
  ["優勢與容易耗力的地方", "②"],
  ["可以怎麼改善", "③"],
  ["具體建議", "④"],
];

const recommendationSchema = z.object({
  category: z.enum(["protect", "wish", "courage", "calm", "wealth"]),
  message: z.string().min(4).max(120),
  reason: z.string().min(4).max(180),
});

type ProductRecommendation = z.infer<typeof recommendationSchema>;

function extractRecommendation(content: string): {
  interpretation: string;
  recommendation: ProductRecommendation | null;
} {
  const marker = "RECOMMENDATION_JSON:";
  const markerIndex = content.lastIndexOf(marker);
  if (markerIndex === -1) {
    return { interpretation: content.trim(), recommendation: null };
  }

  const interpretation = content.slice(0, markerIndex).trim();
  const rawJson = content.slice(markerIndex + marker.length).trim();

  try {
    const parsed = recommendationSchema.safeParse(JSON.parse(rawJson));
    return {
      interpretation: interpretation || content.trim(),
      recommendation: parsed.success ? parsed.data : null,
    };
  } catch {
    return { interpretation: content.trim(), recommendation: null };
  }
}

function cleanZiweiInterpretation(content: string) {
  const normalized = content.trim();
  const sectionIndex = normalized.indexOf(ZIWEI_SECTION_START);
  const markSections = (value: string) =>
    ZIWEI_SECTION_MARKERS.reduce(
      (result, [title, marker]) =>
        result.replace(
          new RegExp(`(^|\\n)(?:[①②③④]\\s*)?\\*\\*${title}\\*\\*`, "gu"),
          `$1${marker} **${title}**`,
        ),
      value,
    );

  if (sectionIndex > 0) {
    return markSections(normalized.slice(sectionIndex).trim());
  }

  return markSections(
    normalized
      .replace(/^#+\s*命盤整體解讀\s*/u, "")
      .replace(/^(你好|哈囉|嗨)[^。\n]*[。\n]\s*/u, "")
      .replace(/^Mochi\s*看到你的命盤了[^。\n]*[。\n]\s*/u, "")
      .trim(),
  );
}

// 時辰選項（供前後端共用）
export const SHICHEN_OPTIONS = [
  "子時 (23:00-01:00)",
  "丑時 (01:00-03:00)",
  "寅時 (03:00-05:00)",
  "卯時 (05:00-07:00)",
  "辰時 (07:00-09:00)",
  "巳時 (09:00-11:00)",
  "午時 (11:00-13:00)",
  "未時 (13:00-15:00)",
  "申時 (15:00-17:00)",
  "酉時 (17:00-19:00)",
  "戌時 (19:00-21:00)",
  "亥時 (21:00-23:00)",
];

// 序列化 iztro 星盤資料（全部翻譯為繁體中文）
function serializeAstrolabe(astrolabe: ReturnType<typeof astro.bySolar>) {
  return {
    solarDate: astrolabe.solarDate as string,
    lunarDate: astrolabe.lunarDate as string,
    chineseDate: translateChineseDate(astrolabe.chineseDate as string),
    time: t(astrolabe.time as string),
    timeRange: astrolabe.timeRange as string,
    sign: t(astrolabe.sign as string),
    zodiac: t(astrolabe.zodiac as string),
    earthlyBranchOfSoulPalace: t(astrolabe.earthlyBranchOfSoulPalace as string),
    earthlyBranchOfBodyPalace: t(astrolabe.earthlyBranchOfBodyPalace as string),
    soul: t(astrolabe.soul as string),
    body: t(astrolabe.body as string),
    fiveElementsClass: t(astrolabe.fiveElementsClass as string),
    palaces: (astrolabe.palaces as unknown as Array<Record<string, unknown>>).map((palace) => ({
      name: t(palace.name as string),
      isBodyPalace: palace.isBodyPalace as boolean,
      isOriginalPalace: palace.isOriginalPalace as boolean,
      heavenlyStem: t(palace.heavenlyStem as string),
      earthlyBranch: t(palace.earthlyBranch as string),
      majorStars: (palace.majorStars as Array<Record<string, string>>).map((s) => ({
        name: t(s.name),
        brightness: s.brightness ? t(s.brightness) : "",
        type: s.type,
      })),
      minorStars: (palace.minorStars as Array<Record<string, string>>).map((s) => ({
        name: t(s.name),
        brightness: s.brightness ? t(s.brightness) : "",
        type: s.type,
      })),
      adjectiveStars: (palace.adjectiveStars as Array<Record<string, string>>).map((s) => ({
        name: t(s.name),
        type: s.type,
      })),
      changsheng12: palace.changsheng12 ? t(palace.changsheng12 as string) : "",
      stage: palace.stage as { range: number[]; heavenlyStem: string } | undefined,
      ages: palace.ages as number[],
    })),
  };
}

export const ziweiRouter = router({
  // 計算紫微斗數命盤（純計算，不呼叫 LLM）
  calculate: publicProcedure
    .input(
      z.object({
        solarDate: z.string(), // 陽曆生日 "YYYY-MM-DD"
        timeIndex: z.number().int().min(0).max(11), // 時辰索引 0-11
        gender: z.enum(["男", "女"]),
      })
    )
    .mutation(async ({ input }) => {
      const { solarDate, timeIndex, gender } = input;
      const astrolabe = astro.bySolar(solarDate, timeIndex, gender, true, "zh_TW");
      return {
        success: true,
        astrolabe: serializeAstrolabe(astrolabe),
      };
    }),

  // 取得 AI 解讀（計算命盤 + LLM 解讀）
  interpret: publicProcedure
    .input(
      z.object({
        solarDate: z.string(),
        timeIndex: z.number().int().min(0).max(11),
        gender: z.enum(["男", "女"]),
        focusArea: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await chargeReading(ctx, "ziwei");

      const { solarDate, timeIndex, gender, focusArea } = input;

      const astrolabe = astro.bySolar(solarDate, timeIndex, gender, true, "zh_TW");
      const data = serializeAstrolabe(astrolabe);

      // 整理宮位摘要
      const palaceSummary = data.palaces
        .map((p) => {
          const majorStarNames = p.majorStars
            .map((s) => `${s.name}${s.brightness ? `（${s.brightness}）` : ""}`)
            .join("、");
          const minorStarNames = p.minorStars.map((s) => s.name).join("、");
          return `【${p.name}】${p.heavenlyStem}${p.earthlyBranch}｜主星：${majorStarNames || "空宮"}${minorStarNames ? `｜輔星：${minorStarNames}` : ""}${p.isBodyPalace ? "（身宮）" : ""}`;
        })
        .join("\n");

      const prompt = `你是一位精通紫微斗數的命理師，請根據以下命盤資訊，提供白話、具體且溫柔的命盤解讀。

【基本資料】
- 陽曆生日：${data.solarDate}
- 農曆生日：${data.lunarDate}
- 四柱：${data.chineseDate}
- 出生時辰：${data.time}（${data.timeRange}）
- 性別：${gender}
- 生肖：${data.zodiac}
- 星座：${data.sign}
- 命宮地支：${data.earthlyBranchOfSoulPalace}
- 身宮地支：${data.earthlyBranchOfBodyPalace}
- 命主：${data.soul}
- 身主：${data.body}
- 五行局：${data.fiveElementsClass}

【十二宮位星曜分佈】
${palaceSummary}

${focusArea ? `【特別想了解的面向】\n${focusArea}\n` : ""}

請先判斷使用者想了解的問題主要屬於哪一類：感情、工作、財運、人際家庭、自我狀態、整體方向。
如果【特別想了解的面向】已經很明確，例如感情、工作、財運、家人相處，請集中回答該主題，不要硬加入無關面向。
如果沒有特別填寫，或問題很模糊，才用 2-3 個面向整理，例如工作、感情、財務或自我狀態。

請依照以下段落提供解讀（整體控制在 260-320 字，全程使用繁體中文，語氣溫柔但白話）。
正文可以自然穿插少量療癒符號與語氣符號，例如 🐾、✦、☽、✨、～，讓語氣柔一點。
符號和「～」只能偶爾出現在正文句尾或轉折句後面，不要放在段落標題裡，不要塞在句子中間。
每個段落最多 1 個符號或 1 個「～」，整篇正文最多使用 4-6 次；不要連續堆疊，例如「～～」「✨🐾☽」，也不要使用太浮誇或太撒嬌的 emoji，例如 😂、🥺、😍、🔥。
正文中可以用 Markdown 粗體標出真正重要的判斷或行動重點，每段最多粗體 1 個短句；粗體內容要具體，例如「**先觀察對方是否願意主動約時間**」、「**這週先把真正消耗你的責任列出來**」。
不要把空泛鼓勵粗體，例如「**相信自己**」、「**慢慢來**」；粗體不能取代分析，前後仍要有白話解釋。
第一行必須直接是「${ZIWEI_SECTION_START}」，禁止加「你好」「哈囉」「嗨」「Mochi 看到你的命盤」或任何寒暄開場。
請務必完整輸出四個段落；不要寫開場、不要寫總標題。

**優勢與容易耗力的地方**：說明可以運用的優勢，以及可能造成卡住的劣勢或習慣。請放一個生活例子，例如「壓力大時會想太多」「明明不舒服卻先配合別人」。不得超過 100 字

**可以怎麼改善**：集中回答使用者的問題，說清楚解決方向。如果問感情，就講關係模式、對方互動中該觀察什麼、下一步怎麼做；如果問工作，就講適合的工作節奏、該把握的機會、該改善的近況；如果問財運，就講金錢習慣、累積方式、近期要注意什麼。不得超過 100 字

**具體建議**：給具體建議，必須是使用者今天或這週能做的事。請用白話例子說明，例如「先把想問對方的話寫成一句，不要一次丟很多情緒」。不得超過 100字

完整解讀結束後，最後另起一行輸出商品推薦訊號，格式必須完全符合：
RECOMMENDATION_JSON: {"category":"wealth","message":"先整理事業與金錢節奏，再談突破。","reason":"這次命盤解讀集中在工作定位與資源累積，所以適合豐盛、行動類商品。"}
category 只能是 protect、wish、courage、calm、wealth 其中之一。
message 是「今天的訊息是」後面的短句，不要包含「今天的訊息是」。
reason 是依據本次命盤與解讀推薦此類商品的原因，不要提到商品名稱。`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              `你是一位精通紫微斗數的命理師。全程使用繁體中文，語氣溫柔、白話、具體，不文謅謅，不下絕對斷言。正文可以少量使用 🐾、✦、☽、✨、～ 增加溫度，但只能自然出現在正文句尾或轉折句後面，不要放在段落標題裡，不要連續堆疊。正文可以用 Markdown 粗體標出真正重要的判斷或行動重點，每段最多 1 個短句。禁止寒暄開場，第一行必須直接是「${ZIWEI_SECTION_START}」。`,
          },
          { role: "user", content: prompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const textContent = rawContent
        ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
        : "解讀暫時無法取得，請稍後再試。";
      const extracted = extractRecommendation(textContent);
      const interpretation = cleanZiweiInterpretation(extracted.interpretation);

      return {
        success: true,
        interpretation,
        recommendation: extracted.recommendation,
        astrolabe: data,
      };
    }),
});
