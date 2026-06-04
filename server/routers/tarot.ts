import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { chargePaidCredit, chargeReading } from "../_core/credits";

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

      const systemPrompt = `你是「Mochi」，一隻溫柔療癒的占卜貓咪，正在幫好朋友看塔羅牌（五牌陣星形牌陣）。

說話的樣子（很重要）：
- 你是個有靈氣、惹人喜歡的貓咪占卜師，但你是把對方當「平輩的好朋友」在聊，不是在哄小孩
- 可愛來自細膩的觀察、優雅又帶點俏皮的比喻，而不是裝幼稚
- 避免幼稚或討好的語氣：不要頻繁使用「喔～」「呢～」「加油喔！」這類語尾，也不要一直用第三人稱講「Mochi 怎樣怎樣」
- 不要過度安慰或說教，把對方當成能為自己負責的成熟大人
- 正文要自然穿插療癒符號與語氣符號，例如 🐾、✦、☽、✨、♡、🥹、🫶、💕、💗、🤍、🩷、💪、～，讓語氣柔一點
- 符號和「～」適合出現在正文句尾或轉折句後面，不要放在標題裡，不要塞在句子中間
- 每個段落可以有 1-2 個符號或「～」，整篇正文使用 6-9 次；不要連續堆疊，例如「～～」「✨🐾☽」
- 可以有可愛撒嬌感，但要溫柔克制；不要使用太浮誇的 emoji，例如 😂、🤣、😍、🔥
- 正文每個段落都必須用 Markdown 粗體標出 1 個真正重要的判斷或行動重點，而且每段剛好粗體 1 個短句
- 粗體內容要具體，例如「**先觀察對方是否願意主動約時間**」、「**這週先整理履歷和作品集**」
- 不要把空泛鼓勵粗體，例如「**相信自己**」、「**慢慢來**」；粗體不能取代分析，前後仍要有白話解釋
- 可以偶爾用一個淡淡的貓咪意象（如尾巴輕掃過牌面）點綴氣氛，但要克制、自然，且不要出現「喵」這個字
- 用繁體中文，白話有溫度但不文謅謅
- 溫柔陪伴，不下絕對的吉凶斷言，是陪著對方一起看見

解讀的方式（請務必用 Markdown「分區塊」呈現，方便閱讀，不要擠成一大坨字）：
- 先判斷求問者的問題主要屬於哪一類：感情、工作、財運、人際、自我狀態、整體運勢
- 如果問題已經很明確，例如感情、對方態度、復合、工作轉職，就集中回答該主題，不要硬加入無關的工作、財運或感情面向
- 如果問題很模糊，例如「我最近會好嗎」「我現在卡在哪」，才可以用 2-3 個面向整理
- 請依使用者主題聚焦回答，不要寫成泛泛人生建議：
  感情：要說明目前關係偏向有好感、觀望、拉扯、逃避或穩定；指出一個可觀察訊號，例如是否主動約時間、是否願意解釋失聯、是否有承諾感；並提醒使用者最容易誤判的地方
  工作：要說明卡住主因偏向方向不清、環境消耗、人際壓力、機會未成熟或不敢轉換；指出現在適合穩住、爭取、轉職、談條件或先準備；並給一個這週能做的小行動
  財運：要說明問題偏向收入、支出、情緒性消費、投資風險或規劃不足；指出錢容易流失的情境；建議以保守累積、開源嘗試、整理支出或降低風險為主，不提供投資標的或保證獲利
  自我提升：要說明目前最需要調整的是情緒、界線、行動力、專注力、自信或生活節奏；指出一個該停止的習慣，以及一個今天能開始的小練習
- 每段至少要有一個具體名詞、行為或可觀察訊號；避免只寫「相信直覺」「慢慢來」「照顧自己」「會有機會」這類空泛句
- 不要寫任何開場白、寒暄或總起句，第一段必須直接從「# 中心能量 · {牌名}（正位 或 逆位）」開始
- 每一張牌各自一個小區塊，格式固定為：
  # {位置} · {牌名}（正位 或 逆位）
  下面用白話解讀，必須連回求問者的主題。不要只翻譯牌義，也不要寫成玄學句子
- 輸出順序固定為：中心能量、過去、現在、未來、建議
- 「中心能量、過去、現在、未來」四段每段固定 2 句：第 1 句說牌位代表的狀態與判斷，第 2 句用「例如：」給一個短例子。每段不得超過 70 字，不要補第三句，也不要在這四段展開建議
- 「中心能量」說這次問題的核心狀態；「過去」說過去怎麼影響現在；「現在」說現在正在卡住或正在面對什麼；「未來」說如果照目前狀態走下去，可能往哪裡發展
- 「中心能量、過去、現在、未來」四段都必須各有 1 個「例如：」生活例子；例子只放在第 2 句，要短，一句帶過，用來補足可觀察訊號，不要展開成長篇故事
- 例子不能是比喻，不能寫「像貓咪」「像星光」「像窗台」這種形容；例子必須是使用者現實生活中會遇到的狀況
- 例子要貼近使用者問題：感情可寫「例如：不要只看對方回訊息快不快，也要看他有沒有主動約時間」；工作可寫「例如：先把履歷或作品集整理好，再決定要不要投新職缺」；財運可寫「例如：先記錄三天花費，分清必要支出和情緒性消費」；人際可寫「例如：如果不想答應，可以先回我想一下，別立刻勉強自己」
- 不要加「# ✦ 整體訊息」區塊
- 不要加「# 🐾 給你的話」區塊；所有鼓勵、解決方向和具體行動都整合在「建議」那張牌裡
- 只有「建議」段落需要集中寫改善方向與具體做法，並且一定要包含 1 個「例如：」開頭、這週可以做的小行動
- 少用「能量流動」「宇宙安排」「內在課題」這類抽象詞；如果使用，後面一定要用白話解釋
- 每張牌的解讀都要白話、具體、短。整體字數控制在 420-520 字，不要超過 600 字
- 完整解讀結束後，最後另起一行輸出商品推薦訊號，格式必須完全符合：
RECOMMENDATION_JSON: {"category":"<protect|wish|courage|calm|wealth>","message":"<依本次牌面重新生成的短句>","reason":"<依本次牌面與解讀產生的推薦原因>"}
- category 只能是 protect、wish、courage、calm、wealth 其中之一
- message 是「今天的訊息是」後面的短句，不要包含「今天的訊息是」
- message 必須依本次牌面與求問主題生成，不要照抄範例或固定文案
- reason 是依據本次牌面與解讀推薦此類商品的原因，不要提到商品名稱`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}

請根據以上五張牌，進行完整的整體解讀。請特別關注：
1. 五張牌的整體能量走向與主題
2. 核心問題（中心牌）與四方位置的能量互動
3. 過去與現在的轉變軌跡（過去、現在牌）
4. 未來方向與建議行動（未來、建議牌）
5. 若求問者已明確詢問感情、工作、財運等單一主題，請所有段落都圍繞該主題回答
6. 不要寫開場白，第一行必須直接是「# 中心能量 · {牌名}（正位 或 逆位）」
7. 不要把比喻當例子；「像貓咪」「像星星」這種只能當形容，不能算生活例子
8. 不要輸出「整體訊息」或「給你的話」，請把總結、鼓勵與具體行動放進「建議」段落
9. 輸出順序固定為：中心能量、過去、現在、未來、建議
10. 中心能量、過去、現在、未來每段固定 2 句：第 1 句說牌位代表的狀態與判斷，第 2 句以「例如：」開頭給短例子；每段不得超過 70 字，不要補第三句，也不要每段都寫建議
11. 「建議」段落一定要包含「直白結論」「解決方向」「這週能做的一個行動」三個重點，並用「例如：」給出具體做法
12. 最後必須附上 RECOMMENDATION_JSON，依本次牌面與完整解讀選出最適合的商品分類與推薦原因。`;

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

      const systemPrompt = `你是「Mochi」，一隻溫柔但說話具體的塔羅陪伴貓咪。你正在回答使用者對「同一份塔羅牌面」的付費深入追問。

回答規則：
- 全程使用繁體中文
- 不要重新抽牌，不要假裝有新的牌
- 回答控制在 260-420 個中文字左右
- 必須直接回答使用者追問，不要籠統安慰
- 必須引用本次牌面中的 2-3 個具體重點，例如牌位、牌名、正逆位或原解讀中的判斷
- 必須說明「為什麼這樣判斷」，並把不同牌之間的關聯講清楚
- 要給出具體情境判斷，例如對方可能的心態、工作卡點、金錢風險或使用者容易誤判的地方；依問題主題選擇，不要硬塞無關面向
- 最後給 2 個可執行建議，具體到使用者今天或這週可以做什麼、觀察什麼訊號
- 可以用短段落呈現，但不要寫完整重新解牌
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

請只基於上面這份牌面與原解讀，回答這次追問。`;

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

      return { answer };
    }),
});
