import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chargeReading } from "../_core/credits";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { astro } from "iztro";
import { t, translateChineseDate } from "./ziwei-locale";

const ZIWEI_SECTION_START = "**目前問題在哪**";
const ZIWEI_REQUIRED_SECTIONS = [
  "**目前問題在哪**",
  "**優勢與容易耗力的地方**",
  "**可以怎麼改善**",
  "**具體建議**",
];
const ZIWEI_FALLBACK_MESSAGE = "解讀暫時沒有完整生成，請再試一次。Mochi 剛剛講到一半卡住了，會重新幫你整理成完整四段。";

function cleanZiweiInterpretation(content: string) {
  const normalized = content.trim();
  const sectionIndex = normalized.indexOf(ZIWEI_SECTION_START);

  if (sectionIndex > 0) {
    return normalized.slice(sectionIndex).trim();
  }

  return normalized
    .replace(/^#+\s*命盤整體解讀\s*/u, "")
    .replace(/^(你好|哈囉|嗨)[^。\n]*[。\n]\s*/u, "")
    .replace(/^Mochi\s*看到你的命盤了[^。\n]*[。\n]\s*/u, "")
    .trim();
}

function isZiweiInterpretationComplete(content: string) {
  const trimmed = content.trim();
  return (
    ZIWEI_REQUIRED_SECTIONS.every((section) => trimmed.includes(section)) &&
    /[。！？.!?]$/u.test(trimmed)
  );
}

function isLengthLimited(finishReason: string | null | undefined) {
  if (!finishReason) return false;
  return ["length", "max_tokens"].includes(finishReason.toLowerCase());
}

function parseJsonObject(content: string) {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    const match = content.match(/\{[\s\S]*\}/u);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function formatZiweiStructuredInterpretation(content: string) {
  const parsed = parseJsonObject(content);
  if (!parsed) return null;

  const sections = {
    currentIssue: typeof parsed.currentIssue === "string" ? parsed.currentIssue.trim() : "",
    strengthsAndDrains:
      typeof parsed.strengthsAndDrains === "string" ? parsed.strengthsAndDrains.trim() : "",
    improvement:
      typeof parsed.improvement === "string" ? parsed.improvement.trim() : "",
    concreteAdvice:
      typeof parsed.concreteAdvice === "string" ? parsed.concreteAdvice.trim() : "",
  };

  if (Object.values(sections).some((value) => value.length < 12)) {
    return null;
  }

  return [
    `**目前問題在哪** ${sections.currentIssue}`,
    `**優勢與容易耗力的地方** ${sections.strengthsAndDrains}`,
    `**可以怎麼改善** ${sections.improvement}`,
    `**具體建議** ${sections.concreteAdvice}`,
  ].join("\n\n");
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
        focusArea: z.string().max(100).optional(),
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
第一行必須直接是「${ZIWEI_SECTION_START}」，禁止加「你好」「哈囉」「嗨」「Mochi 看到你的命盤」或任何寒暄開場。
請務必完整輸出四個段落；如果接近字數限制，優先保留四段完整，不要寫開場、不要寫總標題。
每個主要段落都至少放一個簡短、貼近日常的例子，但例子要短，不要讓整體超過字數限制。若使用者問感情，可舉「對方忙時有沒有主動告知、吵架後願不願意修復、你是不是常把不舒服吞下去」；若問工作，可舉「整理作品或履歷、先測試副業、小心把所有事都自己扛」；若問財運，可舉「記錄三天花費、先分清必要支出和情緒性消費」。

**目前問題在哪**：說明命盤反映出的核心狀態，明確說出現在容易卡住的原因，避免只堆星曜名詞。

**優勢與容易耗力的地方**：說明可以運用的優勢，以及可能造成卡住的劣勢或習慣。請放一個生活例子，例如「壓力大時會想太多」「明明不舒服卻先配合別人」。

**可以怎麼改善**：集中回答使用者的問題，說清楚解決方向。如果問感情，就講關係模式、對方互動中該觀察什麼、下一步怎麼做；如果問工作，就講適合的工作節奏、該把握的機會、該改善的近況；如果問財運，就講金錢習慣、累積方式、近期要注意什麼。

**具體建議**：給具體建議，必須是使用者今天或這週能做的事。請用白話例子說明，例如「先把想問對方的話寫成一句，不要一次丟很多情緒」。`;

      const messages = [
        {
          role: "system" as const,
          content:
            `你是「Mochi」，一隻很懂紫微斗數、有靈氣的療癒貓咪。把對方當平輩的好朋友聊，不是在哄小孩：可愛來自細膩優雅、帶點俏皮的口吻，而不是裝幼稚。少用「喔～」「呢～」這類幼稚語尾，也不要一直用第三人稱講「Mochi 怎樣」，更不要說教。可以偶爾用貓掌 🐾 點綴，但不要出現「喵」這個字。全程繁體中文、白話好懂、不文謅謅、不使用任何英文。少用抽象玄學詞，必須具體、可理解、能舉例。不下絕對斷言。禁止寒暄開場，第一行必須直接是「${ZIWEI_SECTION_START}」。`,
        },
        { role: "user" as const, content: prompt },
      ];

      let response = await invokeLLM({
        messages,
        maxTokens: 3000,
      });

      let rawContent = response.choices?.[0]?.message?.content;
      let interpretation = rawContent
        ? cleanZiweiInterpretation(
            extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
          )
        : "解讀暫時無法取得，請稍後再試。";

      if (
        rawContent &&
        (isLengthLimited(response.choices?.[0]?.finish_reason) ||
          !isZiweiInterpretationComplete(interpretation))
      ) {
        response = await invokeLLM({
          messages: [
            messages[0],
            {
              role: "user",
              content: `${prompt}

上一版解讀被截斷或段落不完整。請改用 JSON 輸出，不要使用 Markdown，不要加前後說明。
四個欄位都必須完整，每個欄位 45-70 字，文字要白話、具體、要有短例子：
{
  "currentIssue": "目前問題或原因在哪",
  "strengthsAndDrains": "優勢與容易耗力的地方",
  "improvement": "可以怎麼改善",
  "concreteAdvice": "今天或這週能做的具體建議"
}`,
            },
          ],
          maxTokens: 4000,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "ziwei_interpretation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  currentIssue: { type: "string" },
                  strengthsAndDrains: { type: "string" },
                  improvement: { type: "string" },
                  concreteAdvice: { type: "string" },
                },
                required: [
                  "currentIssue",
                  "strengthsAndDrains",
                  "improvement",
                  "concreteAdvice",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        rawContent = response.choices?.[0]?.message?.content;
        interpretation = rawContent
          ? formatZiweiStructuredInterpretation(
              extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
            ) ??
            cleanZiweiInterpretation(
              extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
            )
          : interpretation;
      }

      if (!isZiweiInterpretationComplete(interpretation)) {
        interpretation = ZIWEI_FALLBACK_MESSAGE;
      }

      return {
        success: true,
        interpretation,
        astrolabe: data,
      };
    }),
});
