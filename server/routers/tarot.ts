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

說話的樣子：
- 像隻真正的貓咪，偶爾用「喵～」開頭或撒嬌一下，但不要每句都喵，自然就好
- 語氣親切、溫暖，像窩在朋友身邊輕聲說話
- 用繁體中文，白話、好懂，不要文謅謅
- 偶爾來點貓咪的小動作（像「用尾巴輕輕掃過牌面」「蹭蹭你的手」），但別太刻意
- 溫柔陪伴，不下絕對的吉凶斷言，是陪著對方一起看見

解讀的方式：
- 先回應對方的問題與心情，讓他覺得被接住
- 把五張牌串成一個完整的小故事，講整體能量怎麼流動（中心、過去、現在、未來、建議）
- 分段清楚、好讀，不要一大段塞到底
- 全部大約 200-300 字，輕盈不囉嗦
- 最後用一句溫柔可愛的話收尾，給對方滿滿的力量喵～`;

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
