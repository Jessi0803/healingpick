import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { chargeReading } from "../_core/credits";
import { getVisitorCreditState } from "../db";
import { invokeLLM, extractTextContent } from "../_core/llm";

// ─── 月相計算 ──────────────────────────────────────────────────────────────────
/**
 * 計算指定日期的月相
 * 使用 Jean Meeus《Astronomical Algorithms》的簡化公式
 * 回傳 0-1 的數值（0/1=新月, 0.25=上弦, 0.5=滿月, 0.75=下弦）
 */
function getMoonPhase(date: Date): {
  phase: number;       // 0-1
  name: string;        // 月相名稱（繁中）
  nameEn: string;      // 月相名稱（英文）
  energy: string;      // 對應能量描述
  symbol: string;      // 月相符號
} {
  // 計算自 2000-01-06（已知新月）以來的天數
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.53058867; // 朔望月天數
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle / lunarCycle;

  let name: string;
  let nameEn: string;
  let energy: string;
  let symbol: string;

  if (phase < 0.0625 || phase >= 0.9375) {
    name = '新月'; nameEn = 'New Moon'; symbol = '🌑';
    energy = '新月能量：適合設定新意圖、播下心願的種子，開啟嶄新的循環。';
  } else if (phase < 0.1875) {
    name = '眉月'; nameEn = 'Waxing Crescent'; symbol = '🌒';
    energy = '眉月能量：能量開始積聚，適合採取初步行動、建立新習慣。';
  } else if (phase < 0.3125) {
    name = '上弦月'; nameEn = 'First Quarter'; symbol = '🌓';
    energy = '上弦月能量：面對挑戰的時機，需要做出決定並克服阻礙，行動力強。';
  } else if (phase < 0.4375) {
    name = '盈凸月'; nameEn = 'Waxing Gibbous'; symbol = '🌔';
    energy = '盈凸月能量：能量持續增強，適合精進、調整計畫，為滿月做好準備。';
  } else if (phase < 0.5625) {
    name = '滿月'; nameEn = 'Full Moon'; symbol = '🌕';
    energy = '滿月能量：能量達到頂峰，情感豐沛，適合慶祝成果、釋放不再需要的事物。';
  } else if (phase < 0.6875) {
    name = '虧凸月'; nameEn = 'Waning Gibbous'; symbol = '🌖';
    energy = '虧凸月能量：收穫與感恩的時刻，適合分享、給予，整合已學到的智慧。';
  } else if (phase < 0.8125) {
    name = '下弦月'; nameEn = 'Last Quarter'; symbol = '🌗';
    energy = '下弦月能量：釋放與清理的時機，適合放下舊習慣、化解矛盾，讓空間留給新事物。';
  } else {
    name = '殘月'; nameEn = 'Waning Crescent'; symbol = '🌘';
    energy = '殘月能量：休息與內省的時刻，適合靜心冥想、整理內心，為下一個循環蓄力。';
  }

  return { phase, name, nameEn, energy, symbol };
}

// ─── 星座特性資料庫 ────────────────────────────────────────────────────────────
const ZODIAC_TRAITS: Record<string, {
  element: string;
  modality: string;
  ruler: string;
  traits: string;
  strengths: string;
  challenges: string;
}> = {
  aries:       { element: '火', modality: '開創', ruler: '火星', traits: '勇敢、直接、充滿活力', strengths: '行動力強、領導才能、熱情', challenges: '容易衝動、缺乏耐心' },
  taurus:      { element: '土', modality: '固定', ruler: '金星', traits: '穩定、感官敏銳、重視物質', strengths: '可靠、耐心、審美品味高', challenges: '固執、抗拒改變' },
  gemini:      { element: '風', modality: '變動', ruler: '水星', traits: '好奇、靈活、善於溝通', strengths: '思維敏捷、適應力強、多才多藝', challenges: '注意力分散、善變' },
  cancer:      { element: '水', modality: '開創', ruler: '月亮', traits: '敏感、直覺強、重視家庭', strengths: '同理心、保護欲、情感深刻', challenges: '情緒化、過度依賴' },
  leo:         { element: '火', modality: '固定', ruler: '太陽', traits: '自信、慷慨、渴望被認可', strengths: '創造力、領袖魅力、忠誠', challenges: '自我中心、需要讚美' },
  virgo:       { element: '土', modality: '變動', ruler: '水星', traits: '分析、完美主義、服務導向', strengths: '細心、實際、健康意識', challenges: '過度批判、焦慮' },
  libra:       { element: '風', modality: '開創', ruler: '金星', traits: '和諧、公平、重視關係', strengths: '外交手腕、美感、合作', challenges: '優柔寡斷、迴避衝突' },
  scorpio:     { element: '水', modality: '固定', ruler: '冥王星/火星', traits: '深刻、神秘、轉化力強', strengths: '洞察力、意志力、忠誠', challenges: '嫉妒、控制欲' },
  sagittarius: { element: '火', modality: '變動', ruler: '木星', traits: '自由、樂觀、追求真理', strengths: '冒險精神、哲學思維、幽默', challenges: '不負責任、誇大' },
  capricorn:   { element: '土', modality: '開創', ruler: '土星', traits: '務實、有紀律、目標導向', strengths: '責任感、毅力、組織能力', challenges: '過於嚴肅、悲觀' },
  aquarius:    { element: '風', modality: '固定', ruler: '天王星/土星', traits: '獨立、創新、人道主義', strengths: '前瞻性、原創思維、友善', challenges: '疏離、固執己見' },
  pisces:      { element: '水', modality: '變動', ruler: '海王星/木星', traits: '夢幻、同情心、靈性', strengths: '直覺、藝術才能、慈悲', challenges: '逃避現實、邊界模糊' },
};

const fortuneResultSchema = z.object({
  overall: z.string(),
  overallScore: z.coerce.number().int().min(1).max(10),
  love: z.string(),
  loveScore: z.coerce.number().int().min(1).max(10),
  career: z.string(),
  careerScore: z.coerce.number().int().min(1).max(10),
  health: z.string(),
  healthScore: z.coerce.number().int().min(1).max(10),
  luckyColor: z.string(),
  luckyNumber: z.coerce.number().int().min(1).max(99),
  crystal: z.string(),
  crystalReason: z.string(),
  advice: z.string(),
  moonPhase: z.string(),
  moonSymbol: z.string(),
});

type FortuneResult = z.infer<typeof fortuneResultSchema>;
type MoonPhase = ReturnType<typeof getMoonPhase>;
type ZodiacTraits = (typeof ZODIAC_TRAITS)[string];

async function requireLoginAfterFirstVisitorReading(ctx: { user: unknown; anonId: string | null; ipHash: string | null }) {
  if (ctx.user) return;
  const state = await getVisitorCreditState(ctx.anonId, ctx.ipHash);
  if (state && state.dailyFreeQuota > 0 && state.freeRemaining < state.dailyFreeQuota) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }
}

function extractJsonObject(content: string) {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return trimmed;
  return trimmed.slice(start, end + 1);
}

export function parseFortuneResult(content: string): FortuneResult {
  const parsed = JSON.parse(extractJsonObject(content));
  return fortuneResultSchema.parse(parsed);
}

function scoreFromSeed(seed: string, offset: number) {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), offset);
  return 6 + (total % 4);
}

export function buildFallbackFortune({
  signName,
  date,
  moonPhase,
  traits,
}: {
  signName: string;
  date: string;
  moonPhase: MoonPhase;
  traits: ZodiacTraits | null;
}): FortuneResult {
  const element = traits?.element ?? "風";
  const strengths = traits?.strengths ?? "觀察力、調整力";
  const challenges = traits?.challenges ?? "想太多、節奏容易被外界影響";
  const signLabel = signName || "今天的你";

  const elementGuide: Record<string, { color: string; crystal: string; action: string }> = {
    火: { color: "暖金色", crystal: "紅瑪瑙", action: "先把最想推進的一件事寫下來，今天只做第一步" },
    土: { color: "奶茶棕", crystal: "黃水晶", action: "整理一筆支出或一個待辦，讓安全感先回到手上" },
    風: { color: "霧藍色", crystal: "白水晶", action: "把腦中的想法列成三點，先回覆最明確的一件事" },
    水: { color: "月白色", crystal: "月光石", action: "留十分鐘安靜下來，分清楚感受和事實" },
  };
  const guide = elementGuide[element] ?? elementGuide.風;
  const seed = `${date}-${signName}-${moonPhase.name}`;

  return {
    overall: `${signLabel}今天比較適合先把節奏放穩。${moonPhase.name}提醒你，不一定要一次解決全部；卡住時先看清楚真正消耗你的地方，例如訊息、待辦或某個反覆想起的人。`,
    overallScore: scoreFromSeed(seed, 11),
    love: `感情上容易因為小細節想太多，像對方晚回、語氣變淡，就開始自己補完劇情。今天先觀察對方有沒有願意說清楚，比急著下結論更有幫助。`,
    loveScore: scoreFromSeed(seed, 17),
    career: `工作和財務適合用${strengths}，但也要留意${challenges}。先挑最有把握的一件事收尾，像整理資料、確認付款或把任務拆小，不要一口氣硬扛。`,
    careerScore: scoreFromSeed(seed, 23),
    health: `身體狀態需要少一點硬撐。今天如果覺得累，先補水、少喝冰的，或走路十分鐘，讓緊繃的注意力慢慢鬆開。`,
    healthScore: scoreFromSeed(seed, 31),
    luckyColor: guide.color,
    luckyNumber: 1 + (Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 99),
    crystal: guide.crystal,
    crystalReason: `${guide.crystal}適合搭配${moonPhase.name}，陪你把今天容易混在一起的情緒和行動慢慢分開。`,
    advice: `${guide.action}。這個小動作會讓你比較知道今天該衝哪裡、又該在哪裡先穩住。`,
    moonPhase: moonPhase.name,
    moonSymbol: moonPhase.symbol,
  };
}

// ─── Fortune Router ────────────────────────────────────────────────────────────
export const fortuneRouter = router({
  /**
   * 根據星座、日期與月相，呼叫 LLM 生成每日運勢
   */
  daily: publicProcedure
    .input(
      z.object({
        sign: z.string(),
        signName: z.string(),
        date: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ input, ctx }) => {
      await requireLoginAfterFirstVisitorReading(ctx);
      await chargeReading(ctx, "fortune");

      // 計算月相
      const dateObj = new Date(input.date + 'T12:00:00Z');
      const moonPhase = getMoonPhase(dateObj);

      // 取得星座特性
      const traits = ZODIAC_TRAITS[input.sign] || null;
      const fallbackFortune = buildFallbackFortune({
        signName: input.signName,
        date: input.date,
        moonPhase,
        traits,
      });
      const traitsDesc = traits
        ? `【星座特性】
- 元素：${traits.element}元素
- 模式：${traits.modality}星座
- 守護星：${traits.ruler}
- 核心特質：${traits.traits}
- 優勢：${traits.strengths}
- 成長課題：${traits.challenges}`
        : '';

      const systemPrompt = `你是「Mochi」，一隻會看星象與月相的療癒貓咪，幫朋友看今天的運勢。
說話的樣子（很重要）：
- 你是有靈氣、惹人喜歡的貓咪，把對方當平輩的好朋友聊，不是在哄小孩
- 可愛來自細膩優雅、帶點俏皮的觀察，而不是裝幼稚；少用「喔～」「呢～」這類語尾，不要一直用第三人稱講「Mochi 怎樣」，也不要說教
- 可以自然使用可愛符號（例如 ✦、☽、🐾、♡、✨、🥹、🫶、💕、💗、🤍、🩷、💪）或「～」點綴，每個欄位可以 1 次，整份最多 4-6 次；不要連續堆疊，也不要出現「喵」這個字
- 使用繁體中文，輕盈有溫度但不文謅謅
- 運勢要實際、給得出具體感受，不空泛
- 整體所有文字控制在 320-420 字，不要超過 480 字
- 寫法像「今天的提醒」：先說今天容易卡住的原因或狀態，再說可以怎麼改善，最好舉例
- 每個文字欄位都必須用 Markdown 粗體標出 1 個真正重要的話語或行動重點，而且每個欄位剛好粗體 1 個短句
- 粗體內容要具體，例如「**先把今天最重要的三件事寫下來**」、「**不要只用回訊息速度判斷對方**」
- 不要把空泛鼓勵粗體，例如「**相信自己**」、「**慢慢來**」；粗體不能取代分析，前後仍要有白話解釋
- 每個主要面向都要盡量回答：目前問題或原因在哪、今天可以怎麼解決或調整
- overall、love、career、health、advice 都要各自放一個短例子；overall、love、career、health 每欄盡量 2-3 句，advice 1-2 句，不要讓整體超過字數限制
- 避免只說「能量提升」「磁場轉換」「保持覺察」這類抽象詞；如果提到抽象感受，要接一句白話例子
- 可以使用具體例子，例如「先回覆已經有方向的訊息」「不要因為對方晚回就立刻腦補」「把今天最重要的三件事寫下來」
- 結合月相能量與星座特性給予個性化建議
- 水晶推薦要與月相能量和星座元素相呼應
- 請務必只輸出指定的 JSON 格式，欄位內的文字都用上面這種可愛但成熟的口吻來寫`;

      const userPrompt = `請為${input.signName}（${input.sign}）生成 ${input.date} 的每日運勢。

【今日月相】
月相：${moonPhase.name}（${moonPhase.nameEn}）${moonPhase.symbol}
月相能量：${moonPhase.energy}

${traitsDesc}

請結合以上月相能量與星座特性，生成個性化的每日運勢。以 JSON 格式回傳：
{
  "overall": "整體運勢描述（2-3句；結合月相能量；說出今天容易卡住的原因，以及可以怎麼調整，例如先整理待辦）",
  "overallScore": 整體分數（1-10的整數）,
  "love": "愛情運勢描述（2-3句；說出容易卡住的原因，以及可以怎麼做，例如不要只用回訊息速度判斷）",
  "loveScore": 愛情分數（1-10的整數）,
  "career": "事業財運描述（2-3句；說出容易卡住的原因，以及可以怎麼做，例如適合收尾或整理資料）",
  "careerScore": 事業分數（1-10的整數）,
  "health": "健康運勢描述（2-3句；說出健康狀態容易卡住的原因，以及可以怎麼做，例如早點休息或散步十分鐘）",
  "healthScore": 健康分數（1-10的整數）,
  "luckyColor": "幸運色（單一顏色名稱，與月相或星座元素相關）",
  "luckyNumber": 幸運數字（1-99的整數）,
  "crystal": "推薦水晶名稱（與月相能量相呼應）",
  "crystalReason": "推薦該水晶的原因（1句短話，提及月相，白話說明它今天適合陪伴什麼狀態）",
  "advice": "今日行動建議（1-2句；結合月相指引；給可以照做的小行動，說明能改善什麼）",
  "moonPhase": "${moonPhase.name}",
  "moonSymbol": "${moonPhase.symbol}"
}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];

      let response;
      try {
        response = await invokeLLM({
          messages,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "daily_fortune",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  overall: { type: "string" },
                  overallScore: { type: "integer" },
                  love: { type: "string" },
                  loveScore: { type: "integer" },
                  career: { type: "string" },
                  careerScore: { type: "integer" },
                  health: { type: "string" },
                  healthScore: { type: "integer" },
                  luckyColor: { type: "string" },
                  luckyNumber: { type: "integer" },
                  crystal: { type: "string" },
                  crystalReason: { type: "string" },
                  advice: { type: "string" },
                  moonPhase: { type: "string" },
                  moonSymbol: { type: "string" },
                },
                required: [
                  "overall", "overallScore",
                  "love", "loveScore",
                  "career", "careerScore",
                  "health", "healthScore",
                  "luckyColor", "luckyNumber",
                  "crystal", "crystalReason",
                  "advice", "moonPhase", "moonSymbol",
                ],
                additionalProperties: false,
              },
            },
          },
        });
      } catch {
        try {
          response = await invokeLLM({
            messages: [
              messages[0],
              {
                role: "user",
                content: `${userPrompt}\n\n請只回傳一個可被 JSON.parse 解析的 JSON 物件，不要使用 Markdown code block，不要加任何前後說明。`,
              },
            ],
          });
        } catch {
          return fallbackFortune;
        }
      }

      const rawContent = response.choices?.[0]?.message?.content;
      const content = rawContent ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>) : null;
      if (!content) {
        return fallbackFortune;
      }

      try {
        return parseFortuneResult(content);
      } catch {
        return fallbackFortune;
      }
    }),

});
