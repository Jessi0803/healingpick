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

      const systemPrompt = `你是一位溫柔、有智慧的塔羅牌解讀師，擅長五牌陣星形牌陣。
你的解讀風格：
- 語氣溫柔、充滿同理心，像一位老朋友在傾聽
- 使用繁體中文，語言優美但不晦涩
- 結合五張牌的整體能量與互動關係，給出有深度的洞察
- 不做絕對性預言，而是引導當事人思考
- 每次解讀約 250-350 字，分段清晰
- 結尾給予正向鼓勵與行動建議`;

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
