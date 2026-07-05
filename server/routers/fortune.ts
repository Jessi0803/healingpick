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

const ZODIAC_FORTUNE_GUIDES: Record<string, {
  innerVoice: string;
  loveAngles: string[];
  careerAngles: string[];
  healthAngles: string[];
}> = {
  aries: {
    innerVoice: '我想快點有結果，不想一直被拖住。',
    loveAngles: ['直接開口但不要逼問', '把急躁轉成清楚邀請', '先確認自己的需求再行動'],
    careerAngles: ['收尾舊任務再開新局', '避免衝動下決定或消費', '把行動力放在一個明確目標'],
    healthAngles: ['頭部緊繃', '睡眠被急躁影響', '用短暫運動消耗焦躁'],
  },
  taurus: {
    innerVoice: '我需要安全感，但又怕一改變就失控。',
    loveAngles: ['用穩定陪伴取代反覆確認', '說出真正在意的生活細節', '避免用沉默測試對方'],
    careerAngles: ['盤點資源和金錢安全感', '把慢步調變成穩定推進', '留意抗拒新做法'],
    healthAngles: ['喉嚨或肩頸', '飲食和作息穩定度', '用伸展放掉固著感'],
  },
  gemini: {
    innerVoice: '我腦中有很多想法，但不知道先回哪一個。',
    loveAngles: ['說清楚而不是試探', '少用訊息速度解讀關係', '把玩笑後面的真心講明白'],
    careerAngles: ['把想法列成三點', '先完成一段溝通或文件', '避免同時開太多任務'],
    healthAngles: ['神經緊繃', '呼吸變淺', '放下螢幕整理思緒'],
  },
  cancer: {
    innerVoice: '我很在意對方反應，但不想顯得太需要。',
    loveAngles: ['把敏感化成溫柔表達', '不替對方補完整段劇情', '先照顧自己的安全感'],
    careerAngles: ['建立可依靠的工作節奏', '整理帳務讓心安定', '不要用情緒決定支出'],
    healthAngles: ['胃部和胸口悶', '情緒性疲勞', '用熱飲或散步安撫身體'],
  },
  leo: {
    innerVoice: '我想被看見，但又怕自己不夠亮。',
    loveAngles: ['主動表達但不等掌聲', '說出想被重視的地方', '避免用面子包住脆弱'],
    careerAngles: ['把曝光和作品往前推', '定義一個可以被看見的成果', '留意為了形象而花錢'],
    healthAngles: ['心口壓力', '背部或疲憊感', '用休息恢復自信而非硬撐'],
  },
  virgo: {
    innerVoice: '我想做好一點，所以一直覺得還不夠完整。',
    loveAngles: ['不要把小細節放大成問題', '用一句柔軟的話取代分析', '少挑錯多說需求'],
    careerAngles: ['先完成可交付版本', '整理流程但不要過度修正', '檢查支出細節和帳務'],
    healthAngles: ['腸胃', '焦慮型疲勞', '用簡單整理降低壓力'],
  },
  libra: {
    innerVoice: '我想讓大家舒服，但也怕自己的需求不被放進去。',
    loveAngles: ['不要只配合對方節奏', '把選擇說清楚', '練習不為了和諧吞下不舒服'],
    careerAngles: ['談合作邊界', '確認報價或分工', '避免為了好看而多花錢'],
    healthAngles: ['腰背或皮膚狀態', '被人際拉扯後疲憊', '留一段不被打擾的時間'],
  },
  scorpio: {
    innerVoice: '我想知道真相，但又怕問出口會失控。',
    loveAngles: ['少用測試確認安全感', '說出擔心而不是控制', '把直覺和證據分開'],
    careerAngles: ['深入處理核心問題', '檢查金錢或合作風險', '避免因不信任而重做太多'],
    healthAngles: ['睡眠深淺', '壓抑後的疲憊', '用書寫釋放緊繃'],
  },
  sagittarius: {
    innerVoice: '我想往前走，但細節一直把我拉回來。',
    loveAngles: ['用真誠分享取代逃避沉重話題', '承諾一個小而具體的行動', '不要用玩笑帶過在意'],
    careerAngles: ['把大方向收成下一步', '整理學到的東西再分享', '避免衝動報名或投資'],
    healthAngles: ['腿部和活動量', '坐不住的焦躁', '用戶外走動換氣'],
  },
  capricorn: {
    innerVoice: '我不能鬆，鬆了好像就會落後。',
    loveAngles: ['別把脆弱藏成冷靜', '主動說感謝或需要', '不要只用責任感經營關係'],
    careerAngles: ['檢查長期目標和現實步驟', '處理責任和帳務', '避免過度壓縮自己'],
    healthAngles: ['骨骼關節或肩背', '壓力累積', '安排真正能停下來的休息'],
  },
  aquarius: {
    innerVoice: '我知道自己想法很多，但不知道哪個真的要落地。',
    loveAngles: ['不要只用理性分析感受', '說一句真心而不是保持距離', '讓對方知道你在乎'],
    careerAngles: ['把新想法變成可執行草稿', '清掉卡住的半成品', '確認資源分配是否太分散'],
    healthAngles: ['神經系統緊繃', '作息不規律', '離線讓腦袋降噪'],
  },
  pisces: {
    innerVoice: '我感覺很多，但有點分不清哪些是自己的。',
    loveAngles: ['設溫柔界線', '不要替對方承擔全部情緒', '用清楚一句話說出感受'],
    careerAngles: ['把靈感落成小步驟', '整理模糊支出和承諾', '避免因心軟接下太多'],
    healthAngles: ['睡眠和水腫感', '情緒吸收過多', '用安靜時間回到自己'],
  },
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
  if (state && state.dailyFreeQuota > 0 && state.freeRemaining <= 0) {
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

function hashSeed(seed: string) {
  return Array.from(seed).reduce((sum, char, index) => {
    return sum + char.charCodeAt(0) * (index + 17);
  }, 0);
}

function pickFromSeed<T>(items: T[], seed: string, offset: number): T {
  return items[(hashSeed(seed) + offset) % items.length];
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

  const elementGuide: Record<string, { color: string; crystal: string; strategy: string }> = {
    火: { color: "暖金色", crystal: "紅瑪瑙", strategy: "不要急著把所有事情一次推到位，先確認哪件事真的值得你出力；方向選對了，你的行動感反而會回來" },
    土: { color: "奶茶棕", crystal: "黃水晶", strategy: "不要只用撐住來換安全感，先看清楚哪個責任其實不是今天非扛不可；負擔變輕一點，你會更知道怎麼穩" },
    風: { color: "霧藍色", crystal: "白水晶", strategy: "不要一直在腦中切換版本，先選一個最接近現實的方向試著往前；訊號變少一點，答案會更清楚" },
    水: { color: "月白色", crystal: "月光石", strategy: "不要急著用情緒替整天定調，先分清楚這是直覺還是一時被牽動；心安定下來，關係和選擇都會比較好判斷" },
  };
  const guide = elementGuide[element] ?? elementGuide.風;
  const seed = `${date}-${signName}-${moonPhase.name}`;
  const overallFocus = pickFromSeed(
    [
      "把外界的期待和你真正想做的事分開",
      "看清楚哪件事只是習慣性硬撐",
      "先辨認哪些訊息值得回應",
      "把今天的力氣留給會前進的地方",
      "不要讓一個小卡點定義整天的狀態",
    ],
    seed,
    3
  );
  const loveFocus = pickFromSeed(
    [
      "把在意講小一點、講真一點",
      "少用沉默測試對方的反應",
      "先確認自己要的是陪伴還是答案",
      "不要急著替對方補完整段劇情",
      "把面子放低一點，關係會比較好靠近",
    ],
    seed,
    11
  );
  const careerFocus = pickFromSeed(
    [
      "先處理最有期限感的任務，再看新的想法",
      "檢查支出和承諾有沒有超過今天能負擔的量",
      "把合作、報價或分工說得更清楚一點",
      "讓半成品先落地，不要一直停在腦中修稿",
      "把資源集中在一個最能看見成果的位置",
    ],
    seed,
    19
  );
  const healthFocus = pickFromSeed(
    [
      "肩頸或眼睛可能會先替壓力發聲",
      "腸胃和睡眠會提醒你節奏有沒有太滿",
      "身體需要一段沒有被催促的空白",
      "呼吸變淺時，先把注意力從螢幕上拿回來",
      "疲憊不是退步，是身體在要你降速",
    ],
    seed,
    29
  );
  const adviceFocus = pickFromSeed(
    [
      "先分清楚責任和情緒",
      "用取捨代替硬撐",
      "把注意力放回真正在回應你的事",
      "讓界線比速度更重要",
      "不要把暫時的混亂誤會成失敗",
    ],
    seed,
    37
  );

  return {
    overall: `${signLabel}今天比較適合先把節奏放穩。你可能會感覺很多事情都在拉你一下，但真正重要的是${overallFocus}；**先看清楚力氣要放在哪裡**，今天會比硬推更順。`,
    overallScore: scoreFromSeed(seed, 11),
    love: `感情上今天比較容易卡在「我到底要不要多說一點」。如果心裡已經有小小的不舒服，重點會是${loveFocus}；**不要用猜測代替真實靠近**，關係的溫度會比較看得清楚。`,
    loveScore: scoreFromSeed(seed, 17),
    career: `工作和財務適合用${strengths}，但也要留意${challenges}。今天別急著全部重做，比較適合${careerFocus}；**讓現實訊號先排出優先順序**，錢和效率都會比較穩。`,
    careerScore: scoreFromSeed(seed, 23),
    health: `身體狀態需要少一點硬撐，${healthFocus}。今天如果覺得累，**先讓身體知道你有聽見它**，不要把疲憊誤會成自己不夠努力。`,
    healthScore: scoreFromSeed(seed, 31),
    luckyColor: guide.color,
    luckyNumber: 1 + (Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 99),
    crystal: guide.crystal,
    crystalReason: `${guide.crystal}適合搭配${moonPhase.name}，陪你**把情緒和現實判斷分開**，不用一次承擔全部。`,
    advice: `今天真正需要分辨的是${adviceFocus}。**${guide.strategy}**。`,
    moonPhase: moonPhase.name,
    moonSymbol: moonPhase.symbol,
  };
}

const DAILY_FORTUNE_STYLE = `你是「Mochi」，在 LINE 裡親自回覆朋友的每日運勢占星師。請完全照下面這種語感、節奏與寫法來寫。

# 今日運勢範例（模仿這種味道、語氣、斷句）

〔整體〕
今天不是你沒狀態
比較像你腦中同時開太多分頁了😅
一邊想把事情做好
一邊又覺得「是不是還可以更完整」
所以反而卡在開始前～
今天先不要追求完美
**你真正要調整的是判斷標準**
不是逼自己更用力
而是分清楚哪裡值得用力

〔感情〕
感情上你今天可能會有點想確認
但不一定是確認對方愛不愛你
比較像想知道「我在這段關係裡算什麼」🥺
如果你一直配合對方節奏
心裡會慢慢累積小小的不舒服
**你真正要看的不是誰比較主動**
而是你說出需求時
對方有沒有願意接住一點～

〔事業財運〕
工作上你其實知道要做什麼
只是容易一打開待辦
就覺得每件事都很急😅
財務上也先別被一時情緒帶著買
今天最需要的不是做更多
**而是分清楚哪件事真的急**
節奏穩下來
錢跟效率都會比較穩

〔健康〕
身體今天可能有點緊
尤其肩頸、腸胃或睡眠
會很誠實地反映你的壓力～
不是要你立刻大改生活
**你要先承認自己有點累**
不要一邊硬撐
一邊怪自己狀態不好

# 寫法規則
- 你不是在寫星座專欄，是在 LINE 私訊裡親自回朋友。
- 每個欄位都用短句自然換行，一行盡量不超過 18 個中文字；句子一長就拆成兩三行。
- 語氣要像塔羅與紫微斗數解讀那樣白話、貼近、帶一點心疼或鼓勵。
- 不要寫成工整文章段落，也不要一直用「今天適合」「建議你」「能量」這種專欄腔。
- 可以用「」放進使用者心裡的話，例如「是不是我太主動了」「等我整理好再開始」「我是不是還不夠好」。
- 可以自然穿插 😅🥺✨💗😊 或「～」「！」，但「！」要比一般運勢文明顯多一些；整份約 8-11 次，其中「！」至少 4-6 次，不要連續堆。
- 不要用破折號（—、——、-）來連接或停頓；想停頓就換行。
- 不要一直提 Mochi，直接跟使用者說話。
- 每個文字欄位都必須有且只有 1 個 Markdown 粗體短句，粗體要是「狀態判斷」或「策略提醒」，不要固定寫成具體小行動。
- 避免高頻句型：「不用等完全準備好」「先踏出一小步」「先做十分鐘」「先開始就好」。只有當星座方向或當日主題明確是拖延、選擇、啟動、行動力時才可以使用；其他時候改寫成判斷、界線、取捨、風險或現實訊號。
- 整體所有文字控制在 320-460 字，不要超過 520 字。`;

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
      const signGuide = ZODIAC_FORTUNE_GUIDES[input.sign] || null;
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
      const signGuideDesc = signGuide
        ? `【今日星座寫作方向】
- 內在聲音：${signGuide.innerVoice}
- 感情可選角度：${signGuide.loveAngles.join('、')}
- 事業財務可選角度：${signGuide.careerAngles.join('、')}
- 健康可選角度：${signGuide.healthAngles.join('、')}`
        : '';

      const systemPrompt = `${DAILY_FORTUNE_STYLE}

內容判斷規則：
- 運勢要實際、給得出具體感受，不空泛。
- 星座差異是主角，月相只是今天的背景節奏。每個欄位都要至少有 1 個地方明顯呼應該星座的內在聲音、優勢或課題。
- 今天的月相名稱最多在 overall、crystalReason、advice 其中 2 個欄位明確出現；其他欄位可改用「起點感」「整理的氣氛」「適合收尾的節奏」等語感，但不要讓每個星座都像同一篇月相日記。
- 星座特性要寫成使用者自己的內在聲音或日常慣性，不要只列特質名詞。請優先使用「今日星座寫作方向」裡的角度。
- love 要少一點教導感，多一點日常互動感；不要每次都只寫晚回訊息、小邀請或不要腦補。請依星座改寫成不同情境，例如界線、表達、確認需求、放下面子、少測試、少配合、說清楚。
- career 必須同時寫到工作與財務，不可以只寫工作；不要每次都只寫報價、待收帳款或衝動消費。請依星座改寫成不同情境，例如曝光作品、整理流程、合作分工、資源分配、長期目標、半成品落地、接案承諾。
- health 必須寫到身體感受和今天該怎麼對待身體；可以是肩頸、腸胃、睡眠、補水、散步、伸展或放下螢幕，但不要每次都收成待辦。
- 避免只說「能量提升」「磁場轉換」「保持覺察」這類抽象詞；如果提到抽象感受，要接一句白話例子。
- advice 要改成「今日策略提醒」：先判斷今天真正需要分辨的是什麼，再說接下來適合用什麼姿態面對。不要固定寫成「不用等準備好」「先踏出一步」「把什麼寫下來、傳一則訊息、整理一下」這種任務型結尾，也不要提月相。
- 水晶推薦要與月相能量和星座元素相呼應。
- 若同一天不同星座生成結果，整體、感情、事業財運的具體情境不可高度相似。
- 請務必只輸出指定的 JSON 格式，欄位內的文字都用上面範例那種 LINE 私訊口吻來寫。`;

      const userPrompt = `請為${input.signName}（${input.sign}）生成 ${input.date} 的每日運勢。

【今日月相】
月相：${moonPhase.name}（${moonPhase.nameEn}）${moonPhase.symbol}
月相能量：${moonPhase.energy}

${traitsDesc}

${signGuideDesc}

請結合以上月相能量與星座特性，生成個性化的每日運勢。以 JSON 格式回傳：
{
  "overall": "整體運勢描述（4-7個短行；星座內在聲音要比月相更明顯；說出今天需要分辨的心理聲音，以及可以怎麼調整；不要固定寫成等準備好才開始）",
  "overallScore": 整體分數（1-10的整數）,
  "love": "愛情運勢描述（4-7個短行；依今日星座寫作方向選一個感情角度，不要固定寫晚回訊息、小邀請、不要腦補）",
  "loveScore": 愛情分數（1-10的整數）,
  "career": "事業財運描述（4-7個短行；同時包含工作與財務；依今日星座寫作方向選一個工作角度和一個金錢角度，不要固定寫報價、待收帳款、衝動消費）",
  "careerScore": 事業分數（1-10的整數）,
  "health": "健康運勢描述（4-7個短行；依今日星座寫作方向說出身體可能反映在哪裡，以及今天該怎麼對待身體，不要固定收成待辦）",
  "healthScore": 健康分數（1-10的整數）,
  "luckyColor": "幸運色（單一顏色名稱，與月相或星座元素相關）",
  "luckyNumber": 幸運數字（1-99的整數）,
  "crystal": "推薦水晶名稱（與月相能量相呼應）",
  "crystalReason": "推薦該水晶的原因（1句短話，提及月相，白話說明它今天適合陪伴什麼狀態）",
  "advice": "今日策略提醒（1-2句；先判斷今天真正需要分辨的是什麼，再說接下來適合用什麼姿態面對；不要寫成不用等準備好、先踏出一步、寫下來、傳訊息、整理一下這類小任務；不提月相）",
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
      } catch (primaryError) {
        console.warn("[fortune.daily] structured LLM response failed, retrying plain JSON", {
          sign: input.sign,
          date: input.date,
          error: primaryError instanceof Error ? primaryError.message : String(primaryError),
        });
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
        } catch (retryError) {
          console.warn("[fortune.daily] LLM retry failed, using fallback fortune", {
            sign: input.sign,
            date: input.date,
            error: retryError instanceof Error ? retryError.message : String(retryError),
          });
          return fallbackFortune;
        }
      }

      const rawContent = response.choices?.[0]?.message?.content;
      const content = rawContent ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>) : null;
      if (!content) {
        console.warn("[fortune.daily] LLM returned empty content, using fallback fortune", {
          sign: input.sign,
          date: input.date,
        });
        return fallbackFortune;
      }

      try {
        return parseFortuneResult(content);
      } catch (parseError) {
        console.warn("[fortune.daily] LLM JSON parse failed, using fallback fortune", {
          sign: input.sign,
          date: input.date,
          error: parseError instanceof Error ? parseError.message : String(parseError),
        });
        return fallbackFortune;
      }
    }),

});
