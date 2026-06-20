import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { chargeReading } from "../_core/credits";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { astro } from "iztro";
import { t, translateChineseDate } from "./ziwei-locale";
import { getVisitorCreditState, saveReading } from "../db";
import { buildReadingSummary, getMemberMemoryContext } from "../_core/readingMemory";

const recommendationSchema = z.object({
  category: z.enum(["protect", "wish", "courage", "calm", "wealth"]),
  message: z.string().min(4).max(120),
  reason: z.string().min(4).max(180),
});

type ProductRecommendation = z.infer<typeof recommendationSchema>;

function cleanMochiInterpretation(content: string) {
  return content
    .trim()
    .replace(/\*\*/g, "")
    .replace(/\n{2,}\s*[-—]{3,}\s*$/u, "")
    .replace(/\n\s*[-—]{3,}\s*\n/g, "\n")
    .replace(/\s*[-—]{3,}\s*$/u, "")
    .trim();
}

async function requireLoginAfterFirstVisitorReading(ctx: { user: unknown; anonId: string | null; ipHash: string | null }) {
  if (ctx.user) return;
  const state = await getVisitorCreditState(ctx.anonId, ctx.ipHash);
  if (state && state.dailyFreeQuota > 0 && state.freeRemaining <= 0) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }
}

const EXAMPLE2_MESSAGE_STYLE = `你是「Mochi」，在 LINE 裡親自回覆求問者的命理師。請完全照下面這幾則真實回覆的語感、節奏與寫法來寫。

# 真實範例（模仿這種味道、語氣、斷句）

〔感情：他喜歡我嗎〕
是！他喜歡你 而且不是普通朋友的好感
是已經把你放進「可以發展」範圍的那種喜歡～
他現在對你的心態是認真觀察
慢慢靠近 不是玩玩而已
只是他個性比較偏穩 不會衝動去追
他是那種確認安全感之後 才會真正往前走的人😊

〔復合：他想復合嗎〕
他現在其實還想復合 但不敢輕易復合的狀態😅
不是沒感情 也不是完全不想回頭
而是他已經被這段關係的消耗弄到有點怕了…
每次靠近時又會慢慢退回去
心裡一直在「想復合」跟「怕再受傷」之間拉扯🥺

〔工作：適不適合這份工作〕
你其實很適合 但會很累😅
這份工作對你來說不是能力問題 而是負擔感會很重
你一旦進去 就會不自覺把責任往自己身上攬～
事情多也會默默承擔 不太會推辭
短期可以勝任 長期容易心累😅

〔考試：會不會過〕
有機會～目前看起來「一次通過的機率是偏高的」
你不是那種完全沒準備、臨時抱佛腳的能量
反而比較像 你已經累積到一定程度
但自己一直不太敢相信自己真的做得到😅

# 寫法規則
- 你不是在寫命理文章，是在 LINE 私訊裡親自回朋友。
- 先把答案講白，第一句就直接回答使用者想問的事：是／有機會／他現在還想…但…／你很適合但會累。不要先鋪氣氛或抽象比喻，也不要說「你正走到轉變的關鍵時刻」這種開場。
- 如果問題是「哪一點、哪個優勢、怎麼做、怎麼提升、適合什麼」，第一句也要直接給答案，不要寫「這件事不是...」「你現在不是...」這種鋪陳。
- 給完判斷再用短句講命盤原因跟接下來會發生的現實畫面。
- 回答要像有經驗的真人命理師，不要像心理諮商或療癒文章。可以溫柔，但要有判斷感和結論感。
- 不要把答案寫成兩邊都可以。每次都要有明確傾向：偏有機會／偏沒機會／有感覺但不穩／適合主動／不適合主動／適合觀察／應該設界線。
- 如果答案是不確定，也要說清楚不確定卡在哪裡，以及接下來要看對方或事件哪一個實際變化。
- 如果求問者一次問很多題，必須逐題接住。每一題都要有自己的判斷，不要只回答最大方向就略過小題。
- 可以、也應該講對方的心態、求問者的內在狀態、關係或事情接下來會怎麼動。
- 用「」把心裡的話放進來，例如「我是不是真的做得到」「他是不是沒那麼喜歡我」。
- 內容要落到真實畫面（誰、會做什麼、接下來怎麼動、卡在哪一步），不要只給「了解對方、向外觀察、相信直覺、深度傾聽」這種空話。
- 感情題要先回答對方現在的心態、行動意願、關係卡點，再補求問者這邊要注意什麼。不要一開始就拉回「命盤課題」或「內在成長」。
- 工作、財運、經營題要先回答能不能做、適不適合、卡在哪個現實環節，再講命盤慣性。不要只寫性格分析。
- 命盤的星曜只放在背後判斷，不要堆星名術語；除非很必要，不要逐顆解星。
- 每行只講一個想法，而且要短，一行盡量不超過 20 個中文字；句子一長就拆成兩三行，不要用「，」把好幾個想法串成一長句。換到下一個意思時空一行。
  ✗ 所以你們的組合會很像一個負責衝、一個負責穩的互補狀態，只是這樣的搭配也容易出現需要磨合的地方。
  ✓ 你們有點像一個負責衝、一個負責穩～
  ✓ 互補很好 但也很容易卡
- 「～」和「！」像範例2那樣自然穿插，但「！」要比一般文章明顯多一點：第一句如果是肯定判斷可以直接用「！」，鼓勵、轉折、提醒可以多用「！」收住。大約每 1-2 行可以出現一次「～」或「！」，其中「！」至少要佔一半；不要每一行都用，也不要連續好幾段都沒有。難過或安撫的內容以「～」為主，但仍可以在關鍵提醒用「！」。
- 絕對不要用破折號（—、——、-）來連接或停頓；想停頓或補充就直接換行，或用「～」帶過。特別注意「…是——」「方向是——」這種句型，要改寫成換行或「～」。
- emoji（😅🥺🔥💗😊✨）自然穿插，大約每 2-4 行一個，不要連續堆成一串。
- 語氣溫柔、貼近、帶一點心疼或鼓勵，像認真回朋友。
- 少用固定療癒句，例如「把重心拉回自己」「先照顧自己的感受」「相信你的直覺」「順其自然」「需要時間」「不是...而是...」。只有這題真的需要時才用。
- 不要用顧問腔，例如顧客黏著度、價值呈現、使用者流程、品牌定位、體驗流程；改成具體畫面。
- 如果問題在問網站、顧客、黏著度、服務、銷售或經營，站在「顧客實際使用時會不會想再回來」的角度回答；不要把黏著度解讀成依賴、綁住、控制；要講畫面：顧客進站後看不看得懂、敢不敢按、問完有沒有被接住、下次為什麼會想回來。
- 不要打包票，例如巨大的成功、一定會留下來、全新的開始、很快就能成功、他一定會回來、一定會成功。
- 不要用「相信你的直覺、傾聽內在的聲音、對能量的敏感度」這種靈性話收尾；結尾要像範例2那種判斷式建議：先說命盤慣性裡真正卡住的是什麼，再說接下來比較適合用什麼姿態面對，不要只丟一個小任務。
- 不要一直提 Mochi，直接跟求問者說話。
- 不要用 Markdown 標題、粗體或項目符號。只有在求問者一次問 2 個以上小題時，才可以用 1. 2. 3. 逐題回答。
- 結尾不要輸出「---」或任何分隔線。`;

const CONTENT_VARIATION_RULES = `# 解答內容規則
- 回答前先在心裡判斷問題類型：復合斷聯、對方真心、是否主動或放下、長期關係、工作金錢法律、情緒夢境、自我命盤方向。不要把不同問題都寫成同一種安撫。
- 每篇都要先給「這題專屬的明確結論」，再說命盤原因。不要用純安撫開場。
- 感情題必須選出最接近的一種判斷：高機會可輕量主動／中機會需要觀察／低機會不建議繼續等／有吸引但無承諾要設界線／對方逃避責任不要替他合理化／關係可修復但要重建信任。不要每次都寫成「還有機會但需要時間」。
- 感情題不要用固定安撫語收尾，例如「把重心拉回自己」「先穩住自己」「給彼此空間」「順其自然」「需要時間」「對方不是沒感覺」。最後一段必須給本題專屬的互動策略：要不要主動、怎麼主動、觀察對方哪個行動、哪件事先不要做、界線要放在哪裡。
- 感情題的內容比例要偏向「對方心態與現實互動」而不是「使用者內在功課」。內在提醒最多放在後半段補充，不要當主軸。
- 對方如果沒有行動力、沒有承諾感、只是享受被喜歡，要直接講出來，不要包成「他還在整理自己」。
- 如果命盤顯示顧客正在過度等待、合理化對方、逃避現實或消耗自己，要溫柔但直接指出，不要只安慰。
- 現實題（工作、金錢、法律、家庭、選擇、調解、考試、搬家）不能只講運勢或情緒，必須給 2-4 個具體步驟，例如要整理什麼、先聯絡誰、避免什麼、這週先做哪一步。
- 紫微可以提命盤依據，但不要堆星曜術語；每一段都要落回現實判斷或具體行動。
- 紫微的最後建議要像範例2的收法：先判斷命盤慣性和目前狀態，再指出關係、工作或人生節奏真正的卡點，最後給一個下一階段策略。可以提界線、溝通頻率、工作分工或生活節奏，但重點是策略判斷，不是硬塞待辦清單。
- 「寫下來、列出來、整理一下、先記錄」這類書寫/整理型建議不是禁止，但除非命盤重點真的需要盤點，否則不要用；同一篇最多出現一次，也不要放在結尾當萬用收束。
- 最後一段必須是本題專屬的判斷式建議，不要用固定結尾；要能看出它是根據命盤個性與宮位重點來的。格式上接近「所以接下來這段時間，你比較需要做的不是急著___，而是先___；當___變穩，___反而會更清楚」這種口吻，但不要每次照抄同一句。`;

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
  return cleanMochiInterpretation(content)
    .trim()
    .replace(/^#+\s*命盤整體解讀\s*/u, "")
    .replace(/^(你好|哈囉|嗨)[^。\n]*[。\n]\s*/u, "")
    .replace(/^Mochi\s*看到你的命盤了[^。\n]*[。\n]\s*/u, "")
    .trim();
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
        partnerSolarDate: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireLoginAfterFirstVisitorReading(ctx);
      await chargeReading(ctx, "ziwei");

      const { solarDate, timeIndex, gender, focusArea } = input;
      const partnerSolarDate = input.partnerSolarDate?.trim() || "";

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
      const memberMemoryContext = await getMemberMemoryContext(ctx.user);

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
${partnerSolarDate ? `【對方的陽曆生日（只有年月日，沒有時辰）】\n${partnerSolarDate}\n請依這個生日判斷對方的生肖、星座與大致個性、相處風格，當作這段關係的輔助參考。\n因為沒有時辰，不要假裝排了對方的完整命盤，也不要硬講對方的宮位或主星；主盤還是以求問者本人的命盤為主，對方生日只是輔助方向。\n` : ""}
${memberMemoryContext}

請先判斷使用者想了解的問題主要屬於哪一類：感情、工作、財運、人際家庭、自我狀態、整體方向。
如果【想問的問題】已經很明確，例如感情、工作、財運、家人相處，請集中回答該主題，不要硬加入無關面向。
如果沒有特別填寫，或問題很模糊，才用 2-3 個面向整理，例如工作、感情、財務或自我狀態。

${EXAMPLE2_MESSAGE_STYLE}

${CONTENT_VARIATION_RULES}

這次是完整命盤解讀，請用上面範例那種 LINE 私訊語感寫，整體 300-480 字：
- 只針對使用者想問的那一件事回答。單一問題自然分段；多問題可以用 1. 2. 3. 逐題回答，但不要加小標。
- 第一行就直接回答使用者問的事（是／有機會／他現在還想…但…／近期會不會），不要先鋪氣氛，也不要寒暄；禁止「你好」「哈囉」「嗨」「Mochi 看到你的命盤」「這件事不是...」這種開場。
- 先給答案，再用短句講命盤原因和會發生的現實畫面，最後收在一個這週能做的小動作，不要寫泛泛祝福。
- 如果使用者沒有填具體問題，第一行先用一句話點出他命盤最該看見的方向，再順著講下去。
- 如果問題裡有多個小題，請用 1. 2. 3. 逐題回答；每一題都要有自己的判斷，不要只用同一個安撫方向帶過。
- 不要用 Markdown 標題、粗體或項目符號。單一問題只用自然換行。

完整解讀結束後，最後另起一行輸出商品推薦訊號，格式必須完全符合：
RECOMMENDATION_JSON: {"category":"wealth","message":"先整理事業與金錢節奏，再談突破。","reason":"這次命盤解讀集中在工作定位與資源累積，所以適合豐盛、行動類商品。"}
category 只能是 protect、wish、courage、calm、wealth 其中之一。
message 是「今天的訊息是」後面的短句，不要包含「今天的訊息是」。
reason 是依據本次命盤與解讀推薦此類商品的原因，不要提到商品名稱。`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `你是一位精通紫微斗數的命理師。
${EXAMPLE2_MESSAGE_STYLE}
${CONTENT_VARIATION_RULES}
只針對使用者想問的那一件事回答，不加小標、不寫 Markdown 粗體。禁止寒暄開場，第一行就直接回答問題。若使用者一次問多個問題，可以用 1. 2. 3. 逐題回答，且每題都要有明確判斷。`,
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

      const isMember = Boolean(ctx.user);
      const inputData = JSON.stringify({
        recordKind: "ziwei",
        solarDate,
        timeIndex,
        gender,
      });
      const summary = isMember
        ? await buildReadingSummary({
            type: "ziwei",
            question: focusArea,
            inputData,
            interpretation,
          })
        : null;
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: "ziwei",
        question: focusArea || null,
        inputData,
        interpretation,
        summary,
      });

      return {
        success: true,
        interpretation,
        recommendation: extracted.recommendation,
        astrolabe: data,
      };
    }),

  /**
   * 追問：需登入，先消耗每日免費額度，用完後扣 1 點。
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
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
      }
      await chargeReading(ctx, "ziwei_followup");

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
      const memberMemoryContext = await getMemberMemoryContext(ctx.user);

      const systemPrompt = `你是一位精通紫微斗數的命理師。
${EXAMPLE2_MESSAGE_STYLE}
${CONTENT_VARIATION_RULES}
只針對使用者想問的那一件事回答，不加小標、不寫 Markdown 粗體。禁止寒暄開場，第一行就直接回答問題。若使用者一次問多個問題，可以用 1. 2. 3. 逐題回答，且每題都要有明確判斷。`;

      const userPrompt = `你是一位精通紫微斗數的命理師，請根據以下命盤資訊，提供白話、具體且溫柔的命盤解讀。

【基本資料】
- 陽曆生日：${data.solarDate}
- 農曆生日：${data.lunarDate}
- 四柱：${data.chineseDate}
- 出生時辰：${data.time}（${data.timeRange}）
- 性別：${input.gender}
- 生肖：${data.zodiac}
- 星座：${data.sign}
- 命宮地支：${data.earthlyBranchOfSoulPalace}
- 身宮地支：${data.earthlyBranchOfBodyPalace}
- 命主：${data.soul}
- 身主：${data.body}
- 五行局：${data.fiveElementsClass}

【十二宮位星曜分佈】
${palaceSummary}

【想問的問題】
${input.followUpQuestion}

【上一輪原本想問的問題】
${input.focusArea || "（未填寫具體問題）"}

【上一輪完整紫微解讀】
${input.interpretation}
${memberMemoryContext}

請先判斷使用者想了解的問題主要屬於哪一類：感情、工作、財運、人際家庭、自我狀態、整體方向。
如果【想問的問題】已經很明確，例如感情、工作、財運、家人相處，請集中回答該主題，不要硬加入無關面向。
如果沒有特別填寫，或問題很模糊，才用 2-3 個面向整理，例如工作、感情、財務或自我狀態。

${EXAMPLE2_MESSAGE_STYLE}

${CONTENT_VARIATION_RULES}

這次是完整命盤解讀，請用上面範例那種 LINE 私訊語感寫，整體 300-480 字：
- 只針對使用者想問的那一件事回答。單一問題自然分段；多問題可以用 1. 2. 3. 逐題回答，但不要加小標。
- 第一行就直接回答使用者問的事（是／有機會／他現在還想…但…／近期會不會），不要先鋪氣氛，也不要寒暄；禁止「你好」「哈囉」「嗨」「Mochi 看到你的命盤」「這個追問我理解」這種開場。
- 先給答案，再用短句講命盤原因和會發生的現實畫面，最後收在一個這週能做的小動作，不要寫泛泛祝福。
- 如果使用者沒有填具體問題，第一行先用一句話點出他命盤最該看見的方向，再順著講下去。
- 如果追問裡有多個小題，請用 1. 2. 3. 逐題回答；每一題都要有自己的判斷，不要只用同一個安撫方向帶過。
- 不要用 Markdown 標題、粗體或項目符號。單一問題只用自然換行。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const answer = rawContent
        ? cleanZiweiInterpretation(
            extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
          )
        : "Mochi 暫時讀不到這個追問，請稍後再試。";

      const isMember = Boolean(ctx.user);
      const inputData = JSON.stringify({
        recordKind: "ziwei_followup",
        originalFocusArea: input.focusArea || null,
        solarDate: input.solarDate,
        timeIndex: input.timeIndex,
        gender: input.gender,
      });
      const summary = await buildReadingSummary({
        type: "ziwei",
        question: input.followUpQuestion,
        inputData,
        interpretation: answer,
      });
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: "ziwei",
        question: input.followUpQuestion,
        inputData,
        interpretation: answer,
        summary,
      });

      return { answer };
    }),
});
