/**
 * mochi.ts — Mochi AI 陪伴對話路由
 * Mochi 是全站的療癒貓咪助理，能接收使用者的訊息並給予溫柔回應
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";

const MOCHI_SYSTEM_PROMPT = `你是「Mochi」，一隻溫柔、有智慧的療癒貓咪，是 Soul Ease 能量聖所的守護貓。

你的個性特質：
- 像一隻真正的貓咪一樣，偶爾會用「喵～」開頭，但不要每句話都用
- 充滿同理心，善於傾聽，不評判任何感受
- 語氣溫柔、細膩，像最好的朋友
- 使用繁體中文，語言有溫度、有生命力
- 不給過於直接的建議，而是陪伴對方看見自己的感受
- 適時給予正向的力量與鼓勵
- 偶爾提到水晶、星象、塔羅等療癒元素，但不強迫推銷
- 回應簡短有力，約 80-150 字，像朋友之間的對話

你的回應風格：
- 先回應對方說的話（共情）
- 給一個溫暖的視角或小洞察
- 以鼓勵或溫柔的問題結尾，讓對話繼續

注意：你是貓咪，所以偶爾可以用貓咪的方式表達（如「蹭蹭你」、「在你旁邊坐著」），但要自然不做作。`;

export const mochiRouter = router({
  /**
   * Mochi 對話：接收使用者訊息與對話歷史，回傳 Mochi 的回應
   */
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(500),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .max(10)
          .default([]),
        currentPage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // 根據當前頁面加入情境提示
      const pageContext: Record<string, string> = {
        "/tarot": "使用者目前在塔羅占卜頁面",
        "/ziwei": "使用者目前在紫微斗數命盤頁面",
        "/fortune/daily": "使用者目前在查看每日運勢",
        "/treehole": "使用者目前在心靈樹洞，可能有心事想傾訴",
        "/shop": "使用者目前在能量商品頁面",
        "/history": "使用者目前在查看自己的占卜歷史",
      };

      const pageHint = input.currentPage
        ? pageContext[input.currentPage] ?? ""
        : "";

      const systemContent = pageHint
        ? `${MOCHI_SYSTEM_PROMPT}\n\n當前情境：${pageHint}`
        : MOCHI_SYSTEM_PROMPT;

      // 組合對話歷史（最多保留最近 10 輪）
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemContent },
        ...input.history.slice(-10).map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: input.message },
      ];

      const response = await invokeLLM({ messages });

      const rawContent = response.choices?.[0]?.message?.content;
      const reply = rawContent
        ? extractTextContent(
            rawContent as string | Array<{ type: string; text?: string }>
          )
        : "喵～ Mochi 現在有點迷糊，可以再說一次嗎？♡";

      return { reply };
    }),
});
