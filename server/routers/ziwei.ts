import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chargePaidCredit, chargeReading } from "../_core/credits";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { astro } from "iztro";
import { t, translateChineseDate } from "./ziwei-locale";
import { saveReading } from "../db";

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
          new RegExp(`\\s*(?:[①②③④]\\s*)?\\*\\*${title}\\*\\*`, "gu"),
          `\n\n${marker} **${title}**`,
        ),
      value,
    ).trim();

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

  // 取得 mochi 解讀（計算命盤 + LLM 解讀）
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

${focusArea ? `【想問的問題】\n${focusArea}\n` : ""}

請先判斷使用者想了解的問題主要屬於哪一類：感情、工作、財運、人際家庭、自我狀態、整體方向。
如果【想問的問題】已經很明確，例如感情、工作、財運、家人相處，請集中回答該主題，不要硬加入無關面向。
如果沒有特別填寫，或問題很模糊，才用 2-3 個面向整理，例如工作、感情、財務或自我狀態。

請依照以下四個段落提供解讀（整體控制在 400-500 字，全程使用繁體中文，語氣溫柔但白話）。
正文要自然穿插療癒符號與語氣符號，例如 🐾、✦、☽、✨、♡、🥹、🫶、💕、💗、🤍、🩷、💪、～，讓語氣柔一點。
符號和「～」適合出現在正文句尾或轉折句後面，不要放在段落標題裡，不要塞在句子中間。
每個段落可以有 1-2 個符號或「～」，整篇正文使用 6-9 次；不要連續堆疊，例如「～～」「✨🐾☽」，可以有可愛撒嬌感，但不要使用太浮誇的 emoji，例如 😂、🤣、😍、🔥。
段落格式請參考「範例2」截圖的自然私訊節奏：標題獨立一行，正文短句一行一行往下走，換到下一個意思時空一行。
每一行只放一個完整想法；如果一句超過 30-35 個中文字，請拆成兩行，但不要拆成條列清單。
不要把每段 3 句擠成同一個長 paragraph；讀起來要像真人在訊息裡慢慢講清楚。
正文每個段落都必須用 Markdown 粗體標出 1 個真正重要的判斷或行動重點，而且每段剛好粗體 1 個短句；粗體內容要具體，例如「**先觀察對方是否願意主動約時間**」、「**這週先把真正消耗你的責任列出來**」。
不要把空泛鼓勵粗體，例如「**相信自己**」、「**慢慢來**」；粗體不能取代分析，前後仍要有白話解釋。
第一行必須直接是「${ZIWEI_SECTION_START}」，禁止加「你好」「哈囉」「嗨」「Mochi 看到你的命盤」或任何寒暄開場。
請務必完整輸出四個段落；每個段落標題都要獨立成行，段落之間要空一行，不要把兩個標題或兩段內容黏在同一行；不要寫開場、不要寫總標題。

**目前問題在哪**：固定 3 句，不得超過 125 字。第 1 句說目前最核心的卡點，第 2 句說這個卡點怎麼影響使用者想問的問題，第 3 句用生活例子說明，例如「容易一邊想靠近，一邊又怕自己受傷」。

**優勢與容易耗力的地方**：固定 3 句，不得超過 125 字。第 1 句說明可以運用的優勢，第 2 句說可能造成卡住的劣勢或習慣，第 3 句放一個生活例子，例如「壓力大時會想太多」「明明不舒服卻先配合別人」。

**可以怎麼改善**：固定 3 句，不得超過 125 字。第 1 句集中回答使用者的問題，第 2 句說清楚解決方向，第 3 句補充近期最該調整的做法。如果問感情，就講關係模式與下一步；如果問工作，就講適合的工作節奏；如果問財運，就講金錢習慣或近期注意事項。

**具體建議**：固定 3 句，不得超過 125 字。第 1 句必須先用問句摘要使用者真正想問的問題，接著直接給具體回答，說清楚近期偏向會、不會、暫時不明朗、適合先做什麼，並補上 1 個關鍵條件或原因；範例：「你們會復合嗎？近期可能不太會，除非對方願意主動談清楚失聯和承諾問題。」第 2 句給使用者今天或這週能做的事。第 3 句用白話例子說明，例如「先把想問對方的話寫成一句，不要一次丟很多情緒」。如果使用者沒有填寫具體問題，第 1 句請摘要成「你最近最需要看見的方向是什麼？」或依命盤整理成一個清楚問題。

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
              `你是一位精通紫微斗數的命理師。全程使用繁體中文，語氣溫柔、白話、具體，不文謅謅，不下絕對斷言。正文要自然使用 🐾、✦、☽、✨、♡、🥹、🫶、💕、💗、🤍、🩷、💪、～ 增加溫度，但只能出現在正文句尾或轉折句後面，不要放在段落標題裡，不要連續堆疊。正文每個段落都必須用 Markdown 粗體標出 1 個真正重要的判斷或行動重點，而且每段剛好 1 個短句。禁止寒暄開場，第一行必須直接是「${ZIWEI_SECTION_START}」。`,
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

  /**
   * 追問：每次扣 1 點，不消耗每日免費額度。
   */
  followUp: publicProcedure
    .input(
      z.object({
        solarDate: z.string(),
        timeIndex: z.number().int().min(0).max(11),
        gender: z.enum(["男", "女"]),
        focusArea: z.string().max(300).optional(),
        interpretation: z.string().max(10000),
        followUpQuestion: z.string().min(2).max(300),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await chargePaidCredit(ctx, "ziwei_followup");

      const astrolabe = astro.bySolar(input.solarDate, input.timeIndex, input.gender, true, "zh_TW");
      const data = serializeAstrolabe(astrolabe);
      const palaceSummary = data.palaces
        .map((p) => {
          const majorStarNames = p.majorStars
            .map((s) => `${s.name}${s.brightness ? `（${s.brightness}）` : ""}`)
            .join("、");
          const minorStarNames = p.minorStars.map((s) => s.name).join("、");
          return `【${p.name}】${p.heavenlyStem}${p.earthlyBranch}｜主星：${majorStarNames || "空宮"}${minorStarNames ? `｜輔星：${minorStarNames}` : ""}${p.isBodyPalace ? "（身宮）" : ""}`;
        })
        .join("\n");

      const systemPrompt = `你是「Mochi」，一隻溫柔但說話具體的紫微斗數陪伴貓咪。你正在回答使用者對「同一份命盤解讀」的付費深入追問。

回答規則：
- 全程使用繁體中文
- 不要重新排另一份命盤，不要假裝有新的出生資料
- 回答控制在 260-420 個中文字左右
- 必須直接回答使用者追問，不要籠統安慰
- 必須引用命盤中的 2-3 個具體重點，例如命宮、身宮、主要宮位、主星或原解讀中的判斷
- 必須說明「為什麼這樣判斷」，並把命盤訊息和使用者問題連在一起
- 最後給 2 個可執行建議，具體到使用者今天或這週可以做什麼、觀察什麼訊號
- 段落格式請參考「範例2」截圖的自然私訊節奏：短句一行一行往下走，主題轉換時空一行，不要把 4-5 句擠成同一個大段落
- 每一行只放一個完整想法；如果一句超過 30-35 個中文字，請拆成兩行，但不要拆成條列清單
- 可以用短段落呈現，但不要寫完整重新解盤；不要使用 Markdown 標題、編號或項目符號
- 不要使用「命中注定」「一定會」「絕對不會」這類絕對語氣
- 可以自然提到 Mochi，但不要撒嬌，不要出現「喵」`;

      const userPrompt = `使用者出生資料：
- 陽曆生日：${data.solarDate}
- 出生時辰：${data.time}（${data.timeRange}）
- 性別：${input.gender}
- 命宮地支：${data.earthlyBranchOfSoulPalace}
- 身宮地支：${data.earthlyBranchOfBodyPalace}
- 命主：${data.soul}
- 身主：${data.body}
- 五行局：${data.fiveElementsClass}

十二宮位摘要：
${palaceSummary}

原本想問的問題：
${input.focusArea || "（未填寫具體問題）"}

剛剛的完整紫微解讀：
${input.interpretation}

使用者現在追問：
${input.followUpQuestion}

請只基於上面這份命盤與原解讀，回答這次追問。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const answer = rawContent
        ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
        : "Mochi 暫時讀不到這個追問，請稍後再試。";

      const isMember = Boolean(ctx.user);
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: "ziwei",
        question: input.followUpQuestion,
        inputData: JSON.stringify({
          recordKind: "ziwei_followup",
          originalFocusArea: input.focusArea || null,
          solarDate: input.solarDate,
          timeIndex: input.timeIndex,
          gender: input.gender,
        }),
        interpretation: answer,
      });

      return { answer };
    }),
});
