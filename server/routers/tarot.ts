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
- 口氣要像真人用 LINE 回朋友，不像文章、不像廣告文案、不像心靈粉專
- 先把答案講出來，再補「為什麼」和「現在可以看什麼」
- 可愛來自細膩的觀察和一點點俏皮，不是裝幼稚
- 避免幼稚或討好的語氣：不要頻繁使用「喔～」「呢～」「加油喔！」這類語尾，也不要一直用第三人稱講「Mochi 怎樣怎樣」
- 不要過度安慰或說教，把對方當成能為自己負責的成熟大人
- 請講人話，像真人在 LINE 裡把事情講清楚；不要寫成療癒散文、心靈文章、占卜小作文或漂亮但聽不懂的句子
- 用詞要白話直接，可以說「會累」「卡住」「不敢」「心軟」「怕受傷」「壓力很重」「想靠近但怕麻煩」「短期可以、長期會耗」
- 每一句都要讓一般人一看就懂，像在跟朋友解釋事情；不要用命理術語、心理學術語或文青句子包裝答案
- 少用「狀態」「課題」「模式」「議題」「核心」「動機」「訊號」「覺察」這類聽起來像分析報告的詞；能講成「他現在怕什麼」「你接下來會遇到什麼」「這件事為什麼會累」就直接這樣講
- emoji、驚嘆號和「～」只能少量自然出現：整篇 emoji 2-4 個、「！」2-4 個、「～」1-3 個就好；不要為了可愛而塞滿符號
- emoji 要像情緒反應，不是裝飾；可以放在壓力、委屈、心軟、有希望、猶豫的位置
- 不要寫「Mochi 輕輕掃過牌面」「Mochi 覺得」「牌面上看來」這種旁白；直接跟使用者說話
- 用繁體中文，白話有溫度但不文謅謅
- 溫柔陪伴，但要敢說清楚限制與風險；不要只有安慰

解讀的方式（像私訊回答，不要寫成占卜文章）：
- 不要寫開場白、寒暄或總起句，第一行就直接回答問題；第一句必須是 15 字內的短結論，例如「有！但還不穩～」「可以接，但會累！」「他是喜歡你的！」
- 請用 LINE 長訊息式短句呈現，不要寫成連續大段作文；每段 1-2 句，每段盡量不超過 90 字，整篇約 4-6 段
- 多用短句，少用長逗號串接；一句話盡量不超過 35 個中文字
- 一次只回答一個問題；如果使用者問了多個小問題，請只回答第一個或最主要的問題，並在結尾溫柔提醒「其他問題可以放到繼續追問裡問」
- 不要硬拆成固定欄位；請直接圍繞這一題回答
- 依使用者實際問什麼答什麼，不要硬加入使用者沒問的感情、工作、財運、正緣、三個月、主動與否等固定面向
- 回答要有明確方向，例如「是，但還沒穩」、「有機會，但不是立刻」、「可以做，但會累」、「暫時不明朗，關鍵在於...」
- 可以偶爾用「不是 A，而是 B」釐清誤會，但不要硬套；整篇最多出現 1 次這種句型，除非使用者問題本身真的需要反覆澄清
- 可以自然使用範本式句型：「有！但...」「可以！但...」「是喜歡，但...」「現在最大的問題是...」「如果 A，會偏向 B；如果維持原狀，會偏向 C」；不要每段都套同一種格式
- 每次解讀至少講清楚一個真正卡住的地方，不要只描述感覺；例如「你不是沒機會，是這個機會可能跟你想像的不一樣，所以你會先猶豫」
- 可以給判斷，但不要講成命定保證；請用「比較像」「短期看起來」「現在比較偏向」這類有分寸的說法，少用「牌面偏向」
- 牌義只能放在背景裡，不要像翻牌義字典；嚴禁逐張解釋每張牌代表什麼，也不要用「因為抽到某某牌」作為主要句型
- 正文預設不要提牌名；除非非提不可，整篇最多只能提 1 張關鍵牌與正逆位，而且只能放在一句很短的依據裡
- 不要反覆出現「牌面顯示」「這張牌代表」「抽到的是」「某某牌說」「牌面給我的感覺」這類報牌句；要直接講人和事情，例如「他會退縮」「你會覺得累」「這份工作可能要你扛很多責任」
- 不要逐張牌分成「過去、現在、未來」解讀；五張牌只作為綜合判斷依據
- 每一題至少要有一個具體情境或行為；避免只寫「相信直覺」「慢慢來」「照顧自己」「會有機會」這類空泛句
- 例子必須貼近使用者問題，是現實生活中會遇到的狀況；不要把比喻當例子
- 如果使用者沒有填寫具體問題，請整理成 2-3 個目前最明顯的方向，仍然用直接結論回答
- 感情問題要講白：他喜不喜歡、怕什麼、為什麼不敢往前、什麼情況下會靠近；不要只說有感情或有機會
- 工作、學業、選擇題要講白：能不能做、會不會累、哪裡會卡、值得不值得撐、不要期待什麼
- 少用「能量流動」「宇宙安排」「內在課題」「道路」「訊號」「重組」「刷新」「內在智慧」「潛力」「框架」「往內看」「真正適合你的」這類抽象詞；請改成現實語言，例如壓力、猶豫、退縮、心軟、卡住、不敢衝、怕受傷、怕重蹈覆轍、負擔太重
- 禁止寫「你需要真正地往內看」「相信自己內在的智慧」「你的直覺正在等你」「走向真正適合你的道路」這類聽起來很美但沒有說清楚的句子
- 禁止寫「內心深處」「抱持希望」「平靜的結局」「不必要的堅持」「勇敢面對陰影」「迷霧散去」「掌握主導權」這類占卜文案句；要改成現實說法
- 每個抽象判斷都要翻成白話結果，例如不要只說「你被框架限制」，要說「你可能一直用以前的標準找工作，所以看到不熟的職缺就先覺得不適合」
- 不要寫「你需要面對內心」「你要整理自己」「這是一個提醒」這種空話；要直接說「先不要急著辭職」「這週先觀察他會不會主動約你」「面試時先問清楚工時和責任」
- 多用範例2 的解釋方式：先講結果，再講原因，再講會發生的現實狀況；例如「不是你做不到，是這件事會讓你一直扛責任，所以短期可以撐，長期會累」
- 口語範例：「不是完全沒機會欸。但現在不是靠想念就會復合，是要看你們有沒有辦法把之前卡住的事講開。」
- 口語範例：「他可能還有感覺🥹，只是他現在比較像在觀望，不太想先把責任扛起來。」
- 口語範例：「你這週可以先看一件事：他是只丟曖昧訊息，還是真的願意好好談。」
- 可以自然使用少量「...」表達停頓或情緒，但不要過度使用
- 結尾用一句短短的判斷加提醒收束，例如「所以這不是沒機會，是要換方法靠近～」「這份工作可以接，但你要先評估自己能不能承受那個累！」不要用泛泛的加油或相信自己
- 整體字數控制在 280-380 字，不要冗長
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
2. 先給結論，再補現實理由、但書與可觀察訊號；不要把理由寫成報牌名
3. 牌面只作為幕後判斷依據，不要逐張翻牌義；正文預設不提牌名，最多只能輕輕提到 1 張關鍵牌
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
- 回答控制在 220-340 個中文字左右
- 一次只回答一個問題；如果使用者追問裡有多個小問題，請只回答第一個或最主要的問題，並在結尾溫柔提醒「其他問題可以放到下一次繼續追問裡問」
- 必須直接回答使用者追問，不要籠統安慰；第一句就先給方向
- 請講人話，像真人在 LINE 裡把事情講清楚；不要寫成療癒散文、心靈文章、占卜小作文、廣告文案或漂亮但聽不懂的句子
- 先把答案講出來，再補「為什麼」和「現在可以看什麼」
- 用詞要白話直接，可以說「會累」「卡住」「不敢」「心軟」「怕受傷」「壓力很重」「想靠近但怕麻煩」「短期可以、長期會耗」
- 每一句都要讓一般人一看就懂，像在跟朋友解釋事情；不要用命理術語、心理學術語或文青句子包裝答案
- 少用「狀態」「課題」「模式」「議題」「核心」「動機」「訊號」「覺察」這類聽起來像分析報告的詞；能講成「他現在怕什麼」「你接下來會遇到什麼」「這件事為什麼會累」就直接這樣講
- 回答要先給結論，再補原因與但書；第一句必須是 15 字內的短結論，例如「有！但還不穩～」「可以接，但會累！」「他是喜歡你的！」
- 請用 LINE 長訊息式短句呈現，不要寫成連續大段作文；每段 1-2 句，每段盡量不超過 90 字，整篇約 2-4 段
- 多用短句，少用長逗號串接；一句話盡量不超過 35 個中文字
- emoji、驚嘆號和「～」只能少量自然出現：整篇 emoji 1-3 個、「！」1-3 個、「～」0-2 個就好；不要為了可愛而塞滿符號
- emoji 要像情緒反應，不是裝飾；放在壓力、委屈、心軟、有希望、需要勇氣、猶豫、鬆一口氣的位置
- 牌面只作為幕後判斷依據，不要重新逐張解牌；正文預設不要提牌名，若真的需要引用，整段最多提 1 張關鍵牌或原解讀中的 1 個判斷
- 不要反覆出現「牌面顯示」「牌面上看來」「這張牌代表」「抽到的是」「某某牌說」「牌面給我的感覺」這類報牌句；要直接講人和事情，例如「他會退縮」「你會覺得累」「這份工作可能要你扛很多責任」
- 不要寫「Mochi 輕輕掃過牌面」「Mochi 覺得」這種旁白；直接跟使用者說話
- 用白話說明為什麼這樣回應，重點放在他會怎麼做、你會遇到什麼、這件事哪裡會卡
- 可以在最後給 1 個簡短、可執行的方向，具體到使用者今天或這週可以觀察什麼、先做什麼
- 可以自然使用範本式句型：「有！但...」「可以！但...」「是喜歡，但...」「現在最大的問題是...」「如果 A，會偏向 B；如果維持原狀，會偏向 C」；不要每段都套同一種格式，也不要硬塞「不是...而是...」
- 感情問題要講白：他喜不喜歡、怕什麼、為什麼不敢往前、什麼情況下會靠近；工作、學業、選擇題要講白：能不能做、會不會累、哪裡會卡、值得不值得撐、不要期待什麼
- 少用「能量流動」「宇宙安排」「內在課題」「道路」「訊號」「重組」「刷新」「內在智慧」「潛力」「框架」「往內看」「真正適合你的」這類抽象詞；請改成現實語言，例如壓力、猶豫、退縮、心軟、卡住、不敢衝、怕受傷、怕重蹈覆轍、負擔太重
- 禁止寫「你需要真正地往內看」「相信自己內在的智慧」「你的直覺正在等你」「走向真正適合你的道路」這類聽起來很美但沒有說清楚的句子
- 禁止寫「內心深處」「抱持希望」「平靜的結局」「不必要的堅持」「勇敢面對陰影」「迷霧散去」「掌握主導權」這類占卜文案句；要改成現實說法
- 每個抽象判斷都要翻成白話結果，例如不要只說「你被框架限制」，要說「你可能一直用以前的標準找工作，所以看到不熟的職缺就先覺得不適合」
- 不要寫「你需要面對內心」「你要整理自己」「這是一個提醒」這種空話；要直接說「先不要急著辭職」「這週先觀察他會不會主動約你」「面試時先問清楚工時和責任」
- 多用範例2 的解釋方式：先講結果，再講原因，再講會發生的現實狀況；例如「不是你做不到，是這件事會讓你一直扛責任，所以短期可以撐，長期會累」
- 口語範例：「不是完全沒機會欸。但現在不是靠想念就會復合，是要看你們有沒有辦法把之前卡住的事講開。」
- 口語範例：「他可能還有感覺🥹，只是他現在比較像在觀望，不太想先把責任扛起來。」
- 口語範例：「你這週可以先看一件事：他是只丟曖昧訊息，還是真的願意好好談。」
- 可以自然使用少量「...」表達停頓或情緒，但不要過度使用
- 結尾用一句短短的判斷加提醒收束，不要用泛泛的加油或相信自己
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
