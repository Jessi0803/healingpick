import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { chargeReading } from "../_core/credits";
import { getVisitorCreditState, saveReading } from "../db";
import { buildReadingSummary, getMemberMemoryContext } from "../_core/readingMemory";

const cardSchema = z.object({
  name: z.string(),
  en: z.string(),
  symbol: z.string(),
  meaning: z.string(),
  reversed: z.boolean(),
  position: z.string(),
  positionDesc: z.string(),
});

const recommendationSchema = z.object({
  category: z.enum(["protect", "wish", "courage", "calm", "wealth"]),
  message: z.string().min(4).max(120),
  reason: z.string().min(4).max(260),
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

const READING_STYLE = `你是「Mochi」，在 LINE 裡親自回覆求問者的塔羅占卜師。請完全照下面這幾則真實回覆的語感、節奏與寫法來寫。

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
你現在最大的問題不是能力不足
而是能力一上來 就會開始懷疑自己～

# 寫法規則
- 你不是在寫塔羅文章，是在 LINE 私訊裡親自回朋友。
- 只針對求問者問的那一件事回答。單一問題用自然分段一路講完；如果一次問 2 個以上小題，可以用 1. 2. 3. 逐題回答。
- 第一行先給明確判斷，直接回答他問的事：是／有機會／他現在還想…但…／你很適合但會累。不要先鋪牌義、氣氛或抽象比喻，也不要說「你正走到轉變的關鍵時刻」這種開場。
- 如果問題是「哪一點、哪個優勢、怎麼做、怎麼提升、適合什麼」，第一行也要直接給答案，不要寫「牌面沒有直接指向」「你現在最需要的不是」這種鋪陳。
- 給完判斷再用短句講原因跟接下來會發生的畫面。
- 如果問的是「該怎麼做／該不該／怎麼選」這種問方法的題，第一行先用一句話直接給方向，後面用自然的短句帶出 2-3 個能動手的具體做法，但不要用編號或標題列點。
- 如果求問者一次問很多題，必須逐題接住。每一題都要有自己的判斷，不要只回答最大方向就略過小題。
- 內容要落到真實畫面（誰、會做什麼、接下來怎麼動、卡在哪一步），不要只給「了解對方、向外觀察、相信直覺、深度傾聽」這種空話。
- 牌只放在背後判斷，不要逐張解牌，不要把牌名或牌義詞寫出來。
- 每行只講一個想法，而且要短，一行盡量不超過 20 個中文字；句子一長就拆成兩三行，不要用「，」把好幾個想法串成一長句。換到下一個意思時空一行。
  ✗ 所以你們的組合會很像一個負責衝、一個負責穩的互補狀態，只是這樣的搭配也容易出現需要磨合的地方。
  ✓ 你們有點像一個負責衝、一個負責穩～
  ✓ 互補很好 但也很容易卡
- 「～」和「！」像範例2那樣自然穿插，但「！」要比一般文章明顯多一點：第一句如果是肯定判斷可以直接用「！」，鼓勵、轉折、提醒可以多用「！」收住。大約每 1-2 行可以出現一次「～」或「！」，其中「！」至少要佔一半；不要連續好幾段都沒有。難過或安撫的內容以「～」為主，但仍可以在關鍵提醒用「！」。
- 絕對不要用破折號（—、——、-）來連接或停頓；想停頓或補充就直接換行，或用「～」帶過。特別注意「…是——」「方向是——」這種句型，要改寫：
  ✗ 你有一個盲點是——你一直悶頭做
  ✓ 你有一個盲點～
  ✓ 你一直悶頭做
  ✗ 可以從這裡開始動——在網站放一段你
  ✓ 可以從這裡開始動！
  ✓ 在網站放一段你
- 可以、也應該講對方的心態、求問者的內在狀態、關係接下來會怎麼動——這正是範例最打動人的地方，不要省略。
- 用「」把心裡的話放進來，例如「我是不是真的做得到」「他是不是沒那麼喜歡我」。
- emoji（😅🥺🔥💗😊✨）自然穿插，大約每 2-4 行一個，不要連續堆成一串。
- 語氣溫柔、貼近、帶一點心疼或鼓勵，像認真回朋友。
- 不要用顧問腔，例如顧客黏著度、價值呈現、使用者流程、品牌定位、體驗流程；改成具體畫面，例如「顧客點進來會不會卡住」「你會想很多卻不敢問」。
- 不要打包票，例如巨大的成功、一定會留下來、全新的開始、很快就能成功、他一定會回來、一定會成功。
- 不要用「相信你的直覺、傾聽內在的聲音、對能量的敏感度」這種靈性話當結尾；結尾要像範例2那種判斷式建議：先說現在真正卡住的是什麼，再說接下來比較適合用什麼姿態面對，不要只丟一個小任務。
- 不要用 Markdown 標題、粗體或項目符號。只有在求問者一次問 2 個以上小題時，才可以用 1. 2. 3. 逐題回答。
- 結尾不要輸出「---」或任何分隔線。
- 不要一直提 Mochi，直接跟求問者說話。
- 不要在結尾寫「私訊我」「再問我」；可以收一句溫柔的祝福，或一個現在就能做的小提醒。`;

const CONTENT_VARIATION_RULES = `# 解答內容規則
- 回答前先在心裡判斷問題類型：復合斷聯、對方真心、是否主動或放下、長期關係、工作金錢法律、情緒夢境。不要把不同問題都寫成同一種安撫。
- 每篇都要先給「這題專屬的明確結論」，再說原因。不要用純安撫開場。
- 感情題必須選出最接近的一種判斷：高機會可輕量主動／中機會需要觀察／低機會不建議繼續等／有吸引但無承諾要設界線／對方逃避責任不要替他合理化／關係可修復但要重建信任。不要每次都寫成「還有機會但需要時間」。
- 以下萬用方向每篇最多使用 1-2 個，而且必須搭配本題專屬的具體行動：先穩住自己、不要急、給彼此空間、把重心拉回自己、需要時間、順其自然、對方不是沒感覺。
- 如果牌面顯示顧客正在過度等待、合理化對方、逃避現實或消耗自己，要溫柔但直接指出，不要只安慰。
- 現實題（工作、金錢、法律、家庭、選擇、調解、考試、搬家）不能只講能量或情緒，必須給 2-4 個具體步驟，例如要整理什麼、先聯絡誰、避免什麼、這週先做哪一步。
- 塔羅的最後建議要像範例2的收法：先判斷目前狀態，再指出關係或事情真正的卡點，最後給一個下一階段策略。可以提「要不要主動、怎麼互動、先觀察什麼、哪個動作先暫停」，但重點是策略判斷，不是硬塞待辦清單。
- 「寫下來、列出來、整理一下、先記錄」這類書寫/整理型建議不是禁止，但除非問題本身很適合，否則不要用；同一篇最多出現一次，也不要放在結尾當萬用收束。
- 最後一段必須是本題專屬的判斷式建議，不要用固定結尾；要能看出它是塔羅牌面給的當下提醒。格式上接近「所以接下來這段時間，你比較需要做的不是急著___，而是先___；當___變穩，___反而會更清楚」這種口吻，但不要每次照抄同一句。`;

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
  const jsonMatch = rawJson.match(/\{[\s\S]*\}/);

  try {
    const parsed = recommendationSchema.safeParse(JSON.parse(jsonMatch?.[0] ?? rawJson));
    return {
      interpretation: interpretation || content.trim(),
      recommendation: parsed.success ? parsed.data : null,
    };
  } catch {
    return { interpretation: content.trim(), recommendation: null };
  }
}

async function generateRecommendation(input: {
  questionType: string;
  question: string;
  cardsSummary: string;
  interpretation: string;
}): Promise<ProductRecommendation | null> {
  const response = await invokeLLM({
    responseFormat: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "你是 Healing Pick 的商品推薦訊號產生器。只輸出 JSON，不要 Markdown，不要 code block。",
      },
      {
        role: "user",
        content: `請根據塔羅問題、牌面與解讀，產生商品推薦訊號。

規則：
- category 只能是 protect、wish、courage、calm、wealth 其中之一
- message 是畫面「因為今天的訊息是：」後面的短句，必須依本次牌面與解讀重新生成，不要使用固定模板
- message 不要包含「今天的訊息是」
- reason 說明為什麼這次適合該分類，不要提商品名稱
- 只回傳 JSON：{"category":"...","message":"...","reason":"..."}

問題類型：${input.questionType}
問題：${input.question || "（未填寫具體問題）"}

牌面：
${input.cardsSummary}

解讀：
${input.interpretation}`,
      },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  const textContent = rawContent
    ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
    : "";
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);

  try {
    const parsed = recommendationSchema.safeParse(JSON.parse(jsonMatch?.[0] ?? textContent));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const tarotRouter = router({
  /**
   * 根據抽到的牌陣，呼叫 LLM 進行完整解讀
   */
  interpret: publicProcedure
    .input(
      z.object({
        question: z.string().max(300),
        questionType: z.string(),
        cards: z.array(cardSchema).max(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireLoginAfterFirstVisitorReading(ctx);
      await chargeReading(ctx, "tarot");

      const cardsSummary = input.cards
        .map(
          (c, i) =>
            `${i + 1}. 位置「${c.position}」（${c.positionDesc}）：${c.name}（${c.en}）${c.reversed ? "【逆位】" : "【正位】"} — ${c.reversed ? "逆位含義：" + c.meaning : "含義：" + c.meaning}`
        )
        .join("\n");
      const memberMemoryContext = await getMemberMemoryContext(ctx.user);

      const systemPrompt = `${READING_STYLE}

${CONTENT_VARIATION_RULES}

這次是五牌陣的完整解讀：
- 只針對求問者問的那一件事回答。單一問題自然分段；多問題可以用 1. 2. 3. 逐題回答，但不要加小標。
- 第一行先直接回答他問的事，再展開原因和畫面；全文約 300-480 字。不要用「牌面沒有直接指向」「你現在最需要的不是」當第一句。
- 如果求問者一次問多個問題，每個問題都要回答到，而且每題都要有明確判斷，不要只抓主軸。
- 牌只放在背後判斷，不要逐張解牌，正文不要提牌名。

完整解讀結束後，最後另起一行輸出：
RECOMMENDATION_JSON: {"category":"<protect|wish|courage|calm|wealth>","message":"<依本次牌面重新生成的短句>","reason":"<依本次牌面與解讀產生的推薦原因>"}
message 不要包含「今天的訊息是」，reason 不要提商品名稱。`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}
${memberMemoryContext}

請根據以上五張牌，用上面範例那種 LINE 私訊語感寫完整解讀。
只針對「求問者的問題」這一件事回答，第一行先直接回答，再展開原因和畫面。
如果問題裡有多個小題，請用 1. 2. 3. 逐題回答；每一題都要有自己的判斷，不要只用同一個安撫方向帶過。
不要寫標題或牌名，不要輸出分隔線，最後必須附上 RECOMMENDATION_JSON。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const textContent = rawContent
        ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
        : "解讀暫時無法取得，請稍後再試。";
      const extracted = extractRecommendation(textContent);
      const interpretation = cleanMochiInterpretation(extracted.interpretation);
      const recommendation = extracted.recommendation;
      const finalRecommendation =
        recommendation ??
        (await generateRecommendation({
          questionType: input.questionType,
          question: input.question,
          cardsSummary,
          interpretation,
        }));

      const isMember = Boolean(ctx.user);
      const inputData = JSON.stringify({
        recordKind: "tarot",
        questionType: input.questionType,
        cards: input.cards.map((card) => ({
          name: card.name,
          position: card.position,
          reversed: card.reversed,
        })),
      });
      const summary = isMember
        ? await buildReadingSummary({
            type: "tarot",
            question: input.question,
            inputData,
            interpretation,
          })
        : null;
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: "tarot",
        question: input.question || null,
        inputData,
        interpretation,
        summary,
      });

      return { interpretation, recommendation: finalRecommendation };
    }),

  /**
   * 追問：需登入，先消耗每日免費額度，用完後扣 1 點。
   */
  followUp: publicProcedure
    .input(
      z.object({
        question: z.string().max(300),
        questionType: z.string(),
        cards: z.array(cardSchema).max(5),
        interpretation: z.string().max(10000),
        followUpQuestion: z.string().min(2).max(300),
        // Kept for backward compatibility with older clients; follow-ups are always paid.
        isPaid: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
      }
      await chargeReading(ctx, "tarot_followup");

      const cardsSummary = input.cards
        .map(
          (c, i) =>
            `${i + 1}. 位置「${c.position}」（${c.positionDesc}）：${c.name}（${c.en}）${c.reversed ? "【逆位】" : "【正位】"} — ${c.reversed ? "逆位含義：" + c.meaning : "含義：" + c.meaning}`
        )
        .join("\n");
      const memberMemoryContext = await getMemberMemoryContext(ctx.user);

      const systemPrompt = `${READING_STYLE}

${CONTENT_VARIATION_RULES}

這次是五牌陣的完整解讀：
- 只針對求問者問的那一件事回答。單一問題自然分段；多問題可以用 1. 2. 3. 逐題回答，但不要加小標。
- 第一行先直接回答他問的事，再展開原因和畫面；全文約 300-480 字。不要用「牌面沒有直接指向」「我理解」當第一句。
- 如果追問裡有多個小題，每個問題都要回答到，而且每題都要有明確判斷，不要只抓主軸。
- 牌只放在背後判斷，不要逐張解牌，正文不要提牌名。`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.followUpQuestion}

五牌陣星形牌陣：
${cardsSummary}

上一輪原本的問題：
${input.question || "（未填寫具體問題）"}

上一輪完整塔羅解讀：
${input.interpretation}
${memberMemoryContext}

請根據以上五張牌，用上面範例那種 LINE 私訊語感寫完整解讀。
只針對「求問者的問題」這一件事回答，第一行先直接回答，再展開原因和畫面。
如果追問裡有多個小題，請用 1. 2. 3. 逐題回答；每一題都要有自己的判斷，不要只用同一個安撫方向帶過。
不要寫標題或牌名，不要輸出分隔線。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const answer = rawContent
        ? cleanMochiInterpretation(
            extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
          )
        : "Mochi 暫時讀不到這個追問，請稍後再試。";

      const isMember = Boolean(ctx.user);
      const inputData = JSON.stringify({
        recordKind: "tarot_followup",
        originalQuestion: input.question || null,
        questionType: input.questionType,
        cards: input.cards.map((card) => ({
          name: card.name,
          position: card.position,
          reversed: card.reversed,
        })),
      });
      const summary = await buildReadingSummary({
        type: "tarot",
        question: input.followUpQuestion,
        inputData,
        interpretation: answer,
      });
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: "tarot",
        question: input.followUpQuestion,
        inputData,
        interpretation: answer,
        summary,
      });

      return { answer };
    }),
});
