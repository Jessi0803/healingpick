import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chargePaidCredit, chargeReading } from "../_core/credits";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { astro } from "iztro";
import { t, translateChineseDate } from "./ziwei-locale";
import { saveReading } from "../db";

const recommendationSchema = z.object({
  category: z.enum(["protect", "wish", "courage", "calm", "wealth"]),
  message: z.string().min(4).max(120),
  reason: z.string().min(4).max(180),
});

type ProductRecommendation = z.infer<typeof recommendationSchema>;

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
- 給完判斷再用短句講命盤原因跟接下來會發生的現實畫面。
- 可以、也應該講對方的心態、求問者的內在狀態、關係或事情接下來會怎麼動。
- 用「」把心裡的話放進來，例如「我是不是真的做得到」「他是不是沒那麼喜歡我」。
- 內容要落到真實畫面（誰、會做什麼、接下來怎麼動、卡在哪一步），不要只給「了解對方、向外觀察、相信直覺、深度傾聽」這種空話。
- 命盤的星曜只放在背後判斷，不要堆星名術語；除非很必要，不要逐顆解星。
- 每行只講一個想法，而且要短，一行盡量不超過 20 個中文字；句子一長就拆成兩三行，不要用「，」把好幾個想法串成一長句。換到下一個意思時空一行。
  ✗ 所以你們的組合會很像一個負責衝、一個負責穩的互補狀態，只是這樣的搭配也容易出現需要磨合的地方。
  ✓ 你們有點像一個負責衝、一個負責穩～
  ✓ 互補很好 但也很容易卡
- 「～」用在柔軟、慢慢說的句子句尾。「！」要用得夠：只要是肯定、鼓勵、替對方開心、想強調的地方就用「！」，不要客氣，正向的題一篇大概 4-6 個「！」。就算是難過、安撫的題，裡面也一定有肯定對方、替對方打氣的句子，那些就用「！」，所以每一篇至少都要有 3 個「！」。純粹難過、心疼的句子才用「～」，不要硬塞「！」。兩者都不要每一行都用、也不要連續好幾段都沒有。
- 絕對不要用破折號（—、——、-）來連接或停頓；想停頓或補充就直接換行，或用「～」帶過。特別注意「…是——」「方向是——」這種句型，要改寫成換行或「～」。
- emoji（😅🥺🔥💗😊✨）自然穿插，大約每 2-4 行一個，不要連續堆成一串。
- 語氣溫柔、貼近、帶一點心疼或鼓勵，像認真回朋友。
- 不要用顧問腔，例如顧客黏著度、價值呈現、使用者流程、品牌定位、體驗流程；改成具體畫面。
- 如果問題在問網站、顧客、黏著度、服務、銷售或經營，站在「顧客實際使用時會不會想再回來」的角度回答；不要把黏著度解讀成依賴、綁住、控制；要講畫面：顧客進站後看不看得懂、敢不敢按、問完有沒有被接住、下次為什麼會想回來。
- 不要打包票，例如巨大的成功、一定會留下來、全新的開始、很快就能成功、他一定會回來、一定會成功。
- 不要用「相信你的直覺、傾聽內在的聲音、對能量的敏感度」這種靈性話收尾；結尾收一個具體的小動作。
- 不要一直提 Mochi，直接跟求問者說話。`;

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
  return content
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

請先判斷使用者想了解的問題主要屬於哪一類：感情、工作、財運、人際家庭、自我狀態、整體方向。
如果【想問的問題】已經很明確，例如感情、工作、財運、家人相處，請集中回答該主題，不要硬加入無關面向。
如果沒有特別填寫，或問題很模糊，才用 2-3 個面向整理，例如工作、感情、財務或自我狀態。

${EXAMPLE2_MESSAGE_STYLE}

這次是完整命盤解讀，請用上面範例那種 LINE 私訊語感寫，整體 300-480 字：
- 只針對使用者想問的那一件事回答，整段一路講完，不要分段落、不要編號、不要加任何小標。
- 第一行就直接回答使用者問的事（是／有機會／他現在還想…但…／近期會不會），不要先鋪氣氛，也不要寒暄；禁止「你好」「哈囉」「嗨」「Mochi 看到你的命盤」這種開場。
- 先給答案，再用短句講命盤原因和會發生的現實畫面，最後收在一個這週能做的小動作，不要寫泛泛祝福。
- 如果使用者沒有填具體問題，第一行先用一句話點出他命盤最該看見的方向，再順著講下去。
- 不要用 Markdown 標題、粗體、項目符號或編號，只用自然換行。

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
只針對使用者想問的那一件事回答，整段直接寫完，不分段落、不加小標、不寫 Markdown 粗體。禁止寒暄開場，第一行就直接回答問題。`,
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
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: "ziwei",
        question: focusArea || null,
        inputData: JSON.stringify({
          recordKind: "ziwei",
          solarDate,
          timeIndex,
          gender,
        }),
        interpretation,
      });

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

      const systemPrompt = `你是「Mochi」，正在根據同一份紫微命盤解讀回答追問。

${EXAMPLE2_MESSAGE_STYLE}

追問回答規則：
- 正文 260-440 字，第一段直接回答追問。
- 不重新排命盤，不假裝有新的出生資料。
- 可以引用命宮、身宮、主星、宮位或原解讀中的 2-3 個重點，但要翻成白話。
- 最後給 1-2 個今天或這週能做的小動作。
- 不要使用 Markdown 標題、編號或項目符號。`;

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
