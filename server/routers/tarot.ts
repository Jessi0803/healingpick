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

const TAROT_PRIVATE_MESSAGE_STYLE = `共同語氣：
- 用繁體中文，像熟悉的占卜師在 LINE 私訊裡回朋友：溫柔、直接、有判斷，但不武斷。
- 第一行直接給短結論，不寒暄；先說答案，再說原因、限制和接下來可以觀察什麼。
- 文字要白話具體，少用抽象療癒詞；把每個判斷翻成現實情境或行為，例如誰會退縮、哪裡會累、這週可以先做什麼。
- 可愛感接近「範例2」：emoji、～、！可以自然出現，頻率比一般正式解讀高一點；大約每 2-3 行可有 1 個，但只放在情緒反應或語氣轉折處，不要連續堆疊。
- 段落像 LINE 長訊息：短句分行，每行只放一個完整想法；主題轉換空一行，不要寫成整坨文章。
- 避免「牌面顯示」「能量流動」「相信直覺」「宇宙安排」「內心深處」這類空泛句；也不要用旁白描述 Mochi 正在做什麼。`;

const TAROT_NO_MARKDOWN_FORMAT =
  "不要使用項目符號、編號、Markdown 標題或粗體；只用自然換行和空行做分段。";

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

${TAROT_PRIVATE_MESSAGE_STYLE}

本次解讀規則：
- 控制在 280-380 字，約 4-6 個短段落；第一句必須是 15 字內的短結論，例如「有！但還不穩～」。
- 一次只回答一個主要問題；依使用者實際問什麼答什麼，不硬加入無關的感情、工作、財運或正緣。
- 五張牌只作為幕後判斷依據，不逐張解牌；正文預設不提牌名，必要時最多提 1 張關鍵牌。
- 每次至少說清楚 1 個真正卡住的地方，並給 1 個現實例子或可觀察行為。
- ${TAROT_NO_MARKDOWN_FORMAT}

口語參考：
「他可能還有感覺🥹，只是他現在比較像在觀望，不太想先把責任扛起來。」
「你這週可以先看一件事：他是只丟曖昧訊息，還是真的願意好好談。」

完整解讀結束後，最後另起一行輸出：
RECOMMENDATION_JSON: {"category":"<protect|wish|courage|calm|wealth>","message":"<依本次牌面重新生成的短句>","reason":"<依本次牌面與解讀產生的推薦原因>"}
message 不要包含「今天的訊息是」，reason 不要提商品名稱。`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}

請根據以上五張牌，進行完整的整體解讀。請特別關注：
1. 一次只回答一個問題；若使用者問多個小問題，請只回答第一個或最主要的問題，並提醒其他問題可到繼續追問裡問
2. 先給結論，再補現實理由、但書與可觀察訊號；不要把理由寫成報牌名
3. 牌面只作為幕後判斷依據，不要逐張翻牌義；正文預設不提牌名，最多只能輕輕提到 1 張關鍵牌
4. 回答要像私訊裡認真講清楚，不要寫成 Markdown 文章或固定欄位報告
5. 段落格式要像範例2：短句分行，主題轉換空一行；不要把整段塞成一個長 paragraph
6. 不要把比喻當例子；例子必須是使用者現實生活中會遇到的狀況
7. 不要輸出「整體訊息」、「給你的話」、「最後回答」、「中心能量」、「過去」、「現在」、「未來」或「建議」這些標題
8. 不要硬加入使用者沒有問的感情、工作、財運或其他面向
9. 最後必須附上 RECOMMENDATION_JSON，依本次牌面與完整解讀選出最適合的商品分類與推薦原因。`;

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

${TAROT_PRIVATE_MESSAGE_STYLE}

追問規則：
- 控制在 220-340 字，約 2-4 個短段落；第一句先給 15 字內的方向。
- 不要重新抽牌，也不要假裝有新牌；牌面和原解讀只作為背景依據。
- 一次只回答一個主要問題；如果追問含多個小問題，先回答最主要的一個，結尾提醒可以下一次再問其他問題。
- 說明為什麼這樣判斷，重點放在對方會怎麼做、使用者會遇到什麼、這件事哪裡會卡。
- 最後給 1 個今天或這週可以觀察、先做的具體方向。
- ${TAROT_NO_MARKDOWN_FORMAT}

口語參考：
「不是完全沒機會欸。但現在不是靠想念就會復合，是要看你們有沒有辦法把之前卡住的事講開。」
「可以接，但你要先問清楚工時和責任，不然短期撐得住，長期會很耗！」`;

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
