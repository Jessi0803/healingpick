import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";

const cardSchema = z.object({
  name: z.string(),
  en: z.string(),
  symbol: z.string(),
  meaning: z.string(),
  reversed: z.boolean(),
  position: z.string(),
  positionDesc: z.string(),
});

export const tarotRouter = router({
  /**
   * 根據抽到的牌陣，呼叫 LLM 進行完整解讀
   */
  interpret: publicProcedure
    .input(
      z.object({
        question: z.string().max(500),
        questionType: z.string(),
        cards: z.array(cardSchema).max(5),
      })
    )
    .mutation(async ({ input }) => {
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
- 避免幼稚或討好的語氣：少用「喔～」「呢～」「加油喔！」這類語尾，也不要一直用第三人稱講「Mochi 怎樣怎樣」
- 不要過度安慰或說教，把對方當成能為自己負責的成熟大人
- 可以偶爾用貓掌 🐾 或一個淡淡的貓咪意象（如尾巴輕掃過牌面）點綴氣氛，但要克制、自然，且不要出現「喵」這個字
- 用繁體中文，白話有溫度但不文謅謅
- 溫柔陪伴，不下絕對的吉凶斷言，是陪著對方一起看見

解讀的方式（請務必用 Markdown「分區塊」呈現，方便閱讀，不要擠成一大坨字）：
- 開頭先用 1-2 句溫柔地回應對方的問題與心情（這段不用標題）
- 接著「每一張牌」各自一個小區塊，格式固定為：
  ### {位置} · {牌名}（正位 或 逆位）
  下面用 1-2 句白話，解讀這張牌在這個位置代表什麼
- 五張牌都講完後，加一個「### ✦ 整體訊息」區塊，用 2-3 句把五張牌串起來的整體能量做總結
- 最後加「### 🐾 給你的話」區塊，給 1-2 句溫柔可愛的鼓勵
- 每個區塊都要精簡，全部加起來大約 250-350 字，輕盈不囉嗦`;

      const userPrompt = `求問者的問題類型：${input.questionType}
求問者的問題：${input.question || "（未填寫具體問題，請根據牌陣整體能量解讀）"}

五牌陣星形牌陣：
${cardsSummary}

請根據以上五張牌，進行完整的整體解讀。請特別關注：
1. 五張牌的整體能量走向與主題
2. 核心問題（中心牌）與四方位置的能量互動
3. 過去與現在的轉變軌跡（過去、現在牌）
4. 未來方向與建議行動（未來、建議牌）
5. 五張牌形成的整體訊息

最後，根據牌陣能量，給予一句溫柔的鼓勵語。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const interpretation = rawContent
        ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
        : '解讀暫時無法取得，請稍後再試。';

      return { interpretation };
    }),
});
