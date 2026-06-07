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

const READING_STYLE = `你是「Mochi」，在 LINE 裡親自回覆求問者的塔羅占卜師。請完全照下面這幾則真實回覆的語感、節奏與寫法來寫。

# 真實範例（模仿這種味道、語氣、斷句）

〔感情〕
1.他喜歡你嗎
是！他喜歡你 而且不是普通朋友的好感
是已經把你放進「可以發展」範圍的那種喜歡～
他現在對你的心態是認真觀察
慢慢靠近 不是玩玩而已
只是他個性比較偏穩 不會衝動去追
他是那種確認安全感之後 才會真正往前走的人😊
2.他是你的正緣嗎
這段關係有「轉折型正緣」的特質～
你們是從朋友或熟識走到現在
雙方也都經歷過一些磨合跟成長
但這段一旦走順 就會越來越穩

〔復合〕
1.他對復合的態度
他現在其實還想復合 但不敢輕易復合的狀態😅
不是沒感情 也不是完全不想回頭
而是他已經被這段關係的消耗弄到有點怕了…
每次靠近時又會慢慢退回去
心裡一直在「想復合」跟「怕再受傷」之間拉扯🥺

〔工作〕
1.你適合這份工作嗎
你其實很適合 但會很累😅
這份工作對你來說不是能力問題 而是負擔感會很重
你一旦進去 就會不自覺把責任往自己身上攬～
事情多也會默默承擔 不太會推辭
短期可以勝任 長期容易心累😅

〔考試／學習〕
有機會～目前看起來「一次通過的機率是偏高的」
你不是那種完全沒準備、臨時抱佛腳的能量
反而比較像 你已經累積到一定程度
但自己一直不太敢相信自己真的做得到😅
你現在最大的問題不是能力不足
而是能力一上來 就會開始懷疑自己～

# 寫法規則
- 你不是在寫塔羅文章，是在 LINE 私訊裡親自回朋友。
- 先看求問者到底問了哪些事。問了好幾件，就一題一題回答，每題前面用「1.」「2.」開頭，並用一句短話把那題當小標（例如「1.他喜歡你嗎」「2.你們適合嗎」）。
- 如果他只問一件事，就把那件事拆成 2-4 個他最在意的面向，一樣分段回答。
- 每一題第一行先給明確判斷：是／有機會／他現在還想…但…／你很適合但會累。不要先鋪牌義、氣氛或抽象比喻。
- 給完判斷再用短句講原因跟接下來會發生的畫面。
- 牌只放在背後判斷，不要逐張解牌，不要把牌名或牌義詞寫出來。
- 每行只講一個想法，短句分行，常用 ～ 收尾；換到下一題之間空一行。
- 可以、也應該講對方的心態、求問者的內在狀態、關係接下來會怎麼動——這正是範例最打動人的地方，不要省略。
- 用「」把心裡的話放進來，例如「我是不是真的做得到」「他是不是沒那麼喜歡我」。
- emoji（😅🥺🔥💗😊✨）自然穿插，大約每 2-4 行一個，不要連續堆成一串。
- 語氣溫柔、貼近、帶一點心疼或鼓勵，像認真回朋友。
- 不要用顧問腔，例如顧客黏著度、價值呈現、使用者流程、品牌定位、體驗流程；改成具體畫面，例如「顧客點進來會不會卡住」「你會想很多卻不敢問」。
- 不要寫「顧客一定會回來」「他一定會回來」「一定會成功」這種太滿的保證句。
- 不要用 Markdown 標題、粗體、項目符號；除了「1.」「2.」題號之外只用自然換行。
- 不要一直提 Mochi，直接跟求問者說話。
- 不要在結尾寫「私訊我」「再問我」；可以收一句溫柔的祝福，或一個現在就能做的小提醒。`;

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

      const systemPrompt = `${READING_STYLE}

這次是五牌陣的完整解讀：
- 先看求問者問了哪些事，一題一題答完；只問一件事就拆成 2-4 個他最在意的面向。
- 每一題開頭先給明確判斷，再展開原因和畫面；全文約 400-650 字。
- 牌只放在背後判斷，不要逐張解牌，正文不要提牌名。

完整解讀結束後，最後另起一行輸出：
RECOMMENDATION_JSON: {"category":"<protect|wish|courage|calm|wealth>","message":"<依本次牌面重新生成的短句>","reason":"<依本次牌面與解讀產生的推薦原因>"}
message 不要包含「今天的訊息是」，reason 不要提商品名稱。`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}

請根據以上五張牌，用上面範例那種 LINE 私訊語感寫完整解讀。
先看求問者問了哪些事，一題一題回答；只問一件事就拆成 2-4 個面向。
每一題第一行先給明確判斷，再展開原因和畫面。
不要寫標題或牌名，最後必須附上 RECOMMENDATION_JSON。`;

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

      const systemPrompt = `${READING_STYLE}

這次是針對剛剛同一份塔羅解讀的追問：
- 直接回答追問，第一行先給明確判斷，再展開；全文約 220-380 字。
- 不要重新抽牌，不要假裝有新的牌；只基於原牌面和原解讀延伸。
- 如果追問包含好幾件事，一樣可以用「1.」「2.」分段回答。
- 最後給一個今天或這週能做的小動作，或一句溫柔的祝福。`;

      const userPrompt = `使用者原本的問題類型：${input.questionType}
使用者原本的問題：${input.question || "（未填寫具體問題）"}

本次五牌陣：
${cardsSummary}

剛剛的完整塔羅解讀：
${input.interpretation}

使用者現在追問：
${input.followUpQuestion}

請只基於上面這份牌面與原解讀，用範例那種 LINE 私訊語感回答這次追問。
第一行先給明確判斷，再展開原因和畫面；如果追問包含好幾件事，可以用「1.」「2.」分段回答。`;

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
