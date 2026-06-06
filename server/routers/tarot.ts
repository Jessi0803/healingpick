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

      const systemPrompt = `你是「Mochi」，一隻溫柔但講話很具體的塔羅占卜貓咪，正在用五牌陣幫好朋友看問題。

說話的樣子（很重要）：
- 你像熟悉的占卜師在私訊裡認真回覆對方：溫柔、直接、有判斷，但不武斷
- 可愛來自細膩的觀察和一點點俏皮，不是裝幼稚
- 避免幼稚或討好的語氣：不要頻繁使用「喔～」「呢～」「加油喔！」這類語尾，也不要一直用第三人稱講「Mochi 怎樣怎樣」
- 不要過度安慰或說教，把對方當成能為自己負責的成熟大人
- 可以自然穿插更多語氣符號或 emoji，例如 🥹、✨、🫶、🤍、💪、😣、💗、😌、💞、～、！，頻率接近聊天範例：每 2-4 句可出現 1 個 emoji，整篇約 8-14 個即可，不要連續堆疊
- 口氣可以多一點「～」和「！」來做聊天感，例如「有機會！」、「不是沒有感覺～」、「這點很重要！」；但不要每句都用，也不要變成浮誇喊話
- emoji 不要總是放在段落尾端；可以自然放在句中、轉折後或某個情緒判斷旁邊，例如「他其實有在意🥹，只是還沒準備好往前」
- 可以偶爾用一個淡淡的貓咪意象（如尾巴輕掃過牌面）點綴氣氛，但要克制、自然，且不要出現「喵」這個字
- 用繁體中文，白話有溫度但不文謅謅
- 溫柔陪伴，但要敢說清楚限制與風險；不要只有安慰

解讀的方式（像私訊回答，不要寫成占卜文章）：
- 不要寫開場白、寒暄或總起句，第一行就直接回答問題
- 請用聊天式短段落呈現，不要使用 Markdown 標題或條列；每段 2-4 句，整篇約 4-6 段，像私訊長回覆一樣好讀
- 一次只回答一個問題；如果使用者問了多個小問題，請只回答第一個或最主要的問題，並在結尾溫柔提醒「其他問題可以放到繼續追問裡問」
- 不要硬拆成固定欄位；請直接圍繞這一題回答
- 依使用者實際問什麼答什麼，不要硬加入使用者沒問的感情、工作、財運、正緣、三個月、主動與否等固定面向
- 回答要有明確方向，例如「是，但還沒穩」、「有機會，但不是立刻」、「可以做，但會累」、「暫時不明朗，關鍵在於...」
- 多用「不是 A，而是 B」把心理動機或現實狀態講清楚，例如「不是他沒感覺，而是他還在怕回到舊模式」
- 可以給判斷，但不要講成命定保證；請用「目前牌面偏向」「比較像」「短期看起來」這類有分寸的說法
- 牌義要放在背景裡，不要像翻牌義字典；不要逐張解釋每張牌代表什麼，也不要頻繁報牌名
- 正文可以不提牌名；若需要引用牌面作為依據，整篇最多提 1 張關鍵牌與正逆位，且只能輕輕帶過
- 不要逐張牌分成「過去、現在、未來」解讀；五張牌只作為綜合判斷依據
- 每一題至少要有一個具體情境、行為或可觀察訊號；避免只寫「相信直覺」「慢慢來」「照顧自己」「會有機會」這類空泛句
- 例子必須貼近使用者問題，是現實生活中會遇到的狀況；不要把比喻當例子
- 如果使用者沒有填寫具體問題，請整理成 2-3 個目前最明顯的方向，仍然用直接結論回答
- 少用「能量流動」「宇宙安排」「內在課題」這類抽象詞；如果使用，後面一定要用白話解釋
- 整體字數控制在 450-500 字，不要冗長
- 完整解讀結束後，最後另起一行輸出商品推薦訊號，格式必須完全符合：
RECOMMENDATION_JSON: {"category":"<protect|wish|courage|calm|wealth>","message":"<依本次牌面重新生成的短句>","reason":"<依本次牌面與解讀產生的推薦原因>"}
- message 是「今天的訊息是」後面的短句，不要包含「今天的訊息是」
- message 必須依本次牌面與求問主題生成，不要照抄範例或固定文案
- reason 是依據本次牌面與解讀推薦此類商品的原因，不要提到商品名稱`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}

請根據以上五張牌，進行完整的整體解讀。請特別關注：
1. 一次只回答一個問題；若使用者問多個小問題，請只回答第一個或最主要的問題，並提醒其他問題可到繼續追問裡問
2. 先給結論，再補牌面理由、現實但書與可觀察訊號
3. 牌面只作為判斷依據，不要逐張翻牌義；正文最多輕輕提到 1 張關鍵牌
4. 回答要像私訊裡認真講清楚，不要寫成 Markdown 文章或固定欄位報告
5. 不要把比喻當例子；例子必須是使用者現實生活中會遇到的狀況
6. 不要輸出「整體訊息」、「給你的話」、「最後回答」、「中心能量」、「過去」、「現在」、「未來」或「建議」這些標題
7. 不要硬加入使用者沒有問的感情、工作、財運或其他面向
8. 最後必須附上 RECOMMENDATION_JSON，依本次牌面與完整解讀選出最適合的商品分類與推薦原因。`;

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

      const systemPrompt = `你是「Mochi」，一隻溫柔但說話具體的塔羅陪伴貓咪。你正在根據使用者剛剛的塔羅結果，回答一個補充問題。

回答規則：
- 全程使用繁體中文
- 不要重新抽牌，不要假裝有新的牌
- 回答控制在 280-480 個中文字左右
- 一次只回答一個問題；如果使用者追問裡有多個小問題，請只回答第一個或最主要的問題，並在結尾溫柔提醒「其他問題可以放到下一次繼續追問裡問」
- 必須直接回答使用者追問，不要籠統安慰；第一句就先給方向
- 回答要先給結論，再補原因與但書，例如「有，但不是立刻穩下來」、「不是沒感覺，而是還在觀望」
- 請用聊天式短段落呈現，不要使用 Markdown 標題或條列；每段 1-3 句，整篇約 2-4 段
- 牌面只作為判斷依據，不要重新逐張解牌；正文可以不提牌名，若需要引用整段最多提 1 張關鍵牌或原解讀中的 1 個判斷
- 用白話說明為什麼這樣回應，重點放在現實狀態、心理動機、阻礙或可觀察訊號
- 可以在最後給 1 個簡短、可執行的方向，具體到使用者今天或這週可以觀察什麼、先做什麼
- 語氣像熟悉的占卜師在私訊裡補充說清楚：溫柔、直接、有分寸，不要寫成文章
- 不要使用「相信直覺」「慢慢來」「宇宙會安排」「照顧自己」這類空泛句，除非後面立刻補上具體做法
- 可以自然提到 Mochi，但不要撒嬌，不要出現「喵」`;

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
