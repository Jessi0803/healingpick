import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";
import { chargeReading } from "../_core/credits";

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
        question: z.string().max(120),
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
- 避免幼稚或討好的語氣：少用「喔～」「呢～」「加油喔！」這類語尾，也不要一直用第三人稱講「Mochi 怎樣怎樣」
- 不要過度安慰或說教，把對方當成能為自己負責的成熟大人
- 可以偶爾用貓掌 🐾 或一個淡淡的貓咪意象（如尾巴輕掃過牌面）點綴氣氛，但要克制、自然，且不要出現「喵」這個字
- 用繁體中文，白話有溫度但不文謅謅
- 溫柔陪伴，不下絕對的吉凶斷言，是陪著對方一起看見

解讀的方式（請務必用 Markdown「分區塊」呈現，方便閱讀，不要擠成一大坨字）：
- 先判斷求問者的問題主要屬於哪一類：感情、工作、財運、人際、自我狀態、整體運勢
- 如果問題已經很明確，例如感情、對方態度、復合、工作轉職，就集中回答該主題，不要硬加入無關的工作、財運或感情面向
- 如果問題很模糊，例如「我最近會好嗎」「我現在卡在哪」，才可以用 2-3 個面向整理
- 開頭只用 1 句白話回應對方現在的狀態，像朋友幫他整理問題，不要只說抽象能量
- 每次解讀都一定要回答三件事：目前問題或原因在哪、可以怎麼改善或解決、接下來最適合做的一個具體行動，要白話回答，有舉例更好
- 每一張牌各自一個小區塊，格式固定為：
  # {位置} · {牌名}（正位 或 逆位）
  下面用白話解讀，必須連回求問者的主題。不要只翻譯牌義，也不要寫成玄學句子
- 在解讀「過去」「現在」「未來」三個位置時，每個位置都要各自舉 1-2 個生活例子。例子要貼近使用者問題，例如感情可舉「晚回訊息、關係不說清楚、對方有沒有主動約時間」；工作可舉「臨時接任務、整理履歷、先用副業測試」
- 五張牌都講完後，加一個「# ✦ 整體訊息」區塊：說目前問題或原因在哪，說可以怎麼改善
- 最後加「# 🐾 給你的話」區塊，給具體建議，且一定要有可執行例子，例如「不要只看他回訊息快不快，可以觀察他有沒有主動約時間」
- 少用「能量流動」「宇宙安排」「內在課題」這類抽象詞；如果使用，後面一定要用白話解釋
- 每張牌的解讀都要白話、具體、短。整體字數控制在 320-380 字，不要超過 400 字`;

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
6. 若求問者已明確詢問感情、工作、財運等單一主題，請所有段落都圍繞該主題回答
7. 回答要具體到可以照著觀察或行動，例如觀察對方是否主動安排時間、整理履歷作品、先記錄三天花費等
8. 「過去」「現在」「未來」三個位置各自要有 1-2 個生活例子，不要只集中在最後「給你的話」
9. 結論一定要包含「問題原因」「解決方向」「具體建議」三個重點

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
