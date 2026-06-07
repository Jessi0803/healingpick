import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { chargePaidCredit, chargeReading } from "../_core/credits";
import { saveReading } from "../db";

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

const EXAMPLE2_MESSAGE_STYLE = `請完全照「範例2」那種私訊解讀感來寫：
- 像真人在 LINE 裡認真回朋友，不像顧問報告、占卜文章、心靈粉專。
- 第一行必須直接回答使用者問的事，控制在 35 個中文字以內；不要只寫泛泛的「有機會」「可以喔」「會變好」。
- 第一行要帶到使用者問題裡的核心對象或動作，例如占卜網站、顧客、回來、喜歡用、追問、購買、復合、聯絡；讓人一看就知道你有回答到問題。
- 第一行像朋友直接回訊息，例如「你的占卜網站要提升黏著度，先接住抽完牌的人～」。
- 第一行不要塞原因、但書和完整建議；先短短回答，第二行以後再慢慢說。
- 不要硬寫成絕對預言或口號；不要寫「顧客會喜歡」「他會回來」「一定會成功」這種太滿的保證句。
- 每行只講一個想法，短句分行；換到下一個意思時空一行。
- 語氣可以溫柔、可愛、帶一點驚訝或心疼；emoji、～、！自然穿插，幾乎每 1-2 行可以有 1 個，但不要連續堆成一串。
- 多寫人真的會遇到的畫面，例如「對方會不敢回」「顧客會不知道要按哪裡」「你會想很多但不好意思問」。
- 不要用顧問式詞語，例如核心體驗、目標族群、網站方向、使用者流程、品牌定位；改成第一次進來的人看見什麼、卡在哪一步、心裡會不會想繼續。
- 不要用空泛療癒句、靈性文章腔或直接翻牌義，例如相信自己、宇宙會安排、內在智慧、能量流動、覺醒、召喚、重生、命運、網站的心、被指引、內在力量、開啟大門、獲得力量、價值觀契合；每個提醒都要接到一個實際動作。
- 如果問題在問網站、顧客、黏著度、服務、銷售或經營，請站在「顧客實際使用時會不會想再回來」的角度回答；不要把黏著度解讀成依賴、綁住、操縱、控制或讓顧客離不開。
- 這類經營問題要講占卜網站的真實畫面：顧客抽完牌之後有沒有下一步、能不能追問、會不會想存下紀錄、明天有沒有理由回來、付費前會不會安心。
- 經營問題少講抽象價值觀，多講頁面、按鈕、流程、解讀內容、追問入口、收藏紀錄、每日提醒這些顧客真的會遇到的地方。
- 經營問題前半段就要出現 2-3 個具體產品畫面，不要等到最後才給建議。
- 不要寫「Mochi 感覺啊」或一直提 Mochi；直接跟使用者說話。
- 不要用 Markdown 標題、編號、項目符號或粗體；只用自然換行。`;

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
      await chargeReading(ctx, "tarot");

      const cardsSummary = input.cards
        .map(
          (c, i) =>
            `${i + 1}. 位置「${c.position}」（${c.positionDesc}）：${c.name}（${c.en}）${c.reversed ? "【逆位】" : "【正位】"} — ${c.reversed ? "逆位含義：" + c.meaning : "含義：" + c.meaning}`
        )
        .join("\n");

      const systemPrompt = `你是「Mochi」，一位說話像朋友的塔羅解讀者。

${EXAMPLE2_MESSAGE_STYLE}

這次是五牌陣完整解讀：
- 正文 280-420 字，直接回答使用者真正問的那件事。
- 第一段先用一句短話直接回答問題，再講原因；第一句不要超過 35 個中文字，不要先鋪牌義、氣氛或抽象比喻。
- 牌只放在背後判斷，不要逐張解牌；除非很必要，正文不要提牌名。
- 如果使用者問很多題，只回答最主要的一題，結尾提醒其他問題可以追問。

完整解讀結束後，最後另起一行輸出：
RECOMMENDATION_JSON: {"category":"<protect|wish|courage|calm|wealth>","message":"<依本次牌面重新生成的短句>","reason":"<依本次牌面與解讀產生的推薦原因>"}
message 不要包含「今天的訊息是」，reason 不要提商品名稱。`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}

請根據以上五張牌，寫一段像範例2那樣的私訊式完整解讀。
第一句要直接回答「求問者的問題」，不要只給泛泛方向；如果第一句超過 35 個中文字，請先重寫到更短。
不要寫標題或條列。
最後必須附上 RECOMMENDATION_JSON。`;

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
      const { interpretation, recommendation } = extractRecommendation(textContent);
      const finalRecommendation =
        recommendation ??
        (await generateRecommendation({
          questionType: input.questionType,
          question: input.question,
          cardsSummary,
          interpretation,
        }));

      return { interpretation, recommendation: finalRecommendation };
    }),

  /**
   * 追問：每次扣 1 點，不消耗每日免費額度。
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
      await chargePaidCredit(ctx, "tarot_followup");

      const cardsSummary = input.cards
        .map(
          (c, i) =>
            `${i + 1}. 位置「${c.position}」（${c.positionDesc}）：${c.name}（${c.en}）${c.reversed ? "【逆位】" : "【正位】"} — ${c.reversed ? "逆位含義：" + c.meaning : "含義：" + c.meaning}`
        )
        .join("\n");

      const systemPrompt = `你是「Mochi」，正在根據剛剛同一份塔羅解讀回答追問。

${EXAMPLE2_MESSAGE_STYLE}

追問回答規則：
- 正文 220-360 字，第一段直接回答追問。
- 不要重新抽牌，不要假裝有新的牌；只基於原牌面和原解讀延伸。
- 如果追問有很多題，只回答最主要的一題。
- 最後給一個今天或這週能做的小動作。`;

      const userPrompt = `使用者原本的問題類型：${input.questionType}
使用者原本的問題：${input.question || "（未填寫具體問題）"}

本次五牌陣：
${cardsSummary}

剛剛的完整塔羅解讀：
${input.interpretation}

使用者現在追問：
${input.followUpQuestion}

請只基於上面這份牌面與原解讀，回答這次追問；一次只回答一個問題，如果追問包含多個小問題，請只回答第一個或最主要的問題，並提醒其他問題可以放到下一次繼續追問裡問。`;

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
        type: "tarot",
        question: input.followUpQuestion,
        inputData: JSON.stringify({
          recordKind: "tarot_followup",
          originalQuestion: input.question || null,
          questionType: input.questionType,
          cards: input.cards.map((card) => ({
            name: card.name,
            position: card.position,
            reversed: card.reversed,
          })),
        }),
        interpretation: answer,
      });

      return { answer };
    }),
});
