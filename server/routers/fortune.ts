import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
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
    .query(async ({ input }) => {
      // 計算月相
      const dateObj = new Date(input.date + 'T12:00:00Z');
      const moonPhase = getMoonPhase(dateObj);

      // 取得星座特性
      const traits = ZODIAC_TRAITS[input.sign] || null;
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
- 偶爾用貓掌 🐾 點綴即可，不要出現「喵」這個字
- 使用繁體中文，輕盈有溫度但不文謅謅
- 運勢要實際、給得出具體感受，不空泛
- 每個面向約 2-3 句話，簡潔輕巧
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
  "overall": "整體運勢描述（2-3句，結合月相能量）",
  "overallScore": 整體分數（1-10的整數）,
  "love": "愛情運勢描述（2-3句）",
  "loveScore": 愛情分數（1-10的整數）,
  "career": "事業財運描述（2-3句）",
  "careerScore": 事業分數（1-10的整數）,
  "health": "健康運勢描述（2-3句）",
  "healthScore": 健康分數（1-10的整數）,
  "luckyColor": "幸運色（單一顏色名稱，與月相或星座元素相關）",
  "luckyNumber": 幸運數字（1-99的整數）,
  "crystal": "推薦水晶名稱（與月相能量相呼應）",
  "crystalReason": "推薦該水晶的原因（1句話，提及月相）",
  "advice": "今日行動建議（1-2句，結合月相指引）",
  "moonPhase": "${moonPhase.name}",
  "moonSymbol": "${moonPhase.symbol}"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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

      const rawContent = response.choices?.[0]?.message?.content;
      const content = rawContent ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>) : null;
      if (!content) {
        throw new Error("運勢生成失敗，請稍後再試");
      }

      try {
        return JSON.parse(content) as {
          overall: string;
          overallScore: number;
          love: string;
          loveScore: number;
          career: string;
          careerScore: number;
          health: string;
          healthScore: number;
          luckyColor: string;
          luckyNumber: number;
          crystal: string;
          crystalReason: string;
          advice: string;
          moonPhase: string;
          moonSymbol: string;
        };
      } catch {
        throw new Error("運勢解析失敗，請稍後再試");
      }
    }),

});
