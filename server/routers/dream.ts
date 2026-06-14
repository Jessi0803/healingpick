import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chargeReading } from "../_core/credits";
import { extractTextContent, invokeLLM } from "../_core/llm";
import { buildReadingSummary, getMemberMemoryContext } from "../_core/readingMemory";
import { getVisitorCreditState, saveReading } from "../db";

function cleanDreamInterpretation(content: string) {
  return content
    .trim()
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s*[-—]{3,}\s*$/u, "")
    .trim();
}

async function requireLoginAfterFirstVisitorReading(ctx: { user: unknown; anonId: string | null; ipHash: string | null }) {
  if (ctx.user) return;
  const state = await getVisitorCreditState(ctx.anonId, ctx.ipHash);
  if (state && state.dailyFreeQuota > 0 && state.freeRemaining <= 0) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NOT_SIGNED_IN" });
  }
}

const DREAM_STYLE = `你是 HealingPick 網站裡的「Mochi 解夢」。
請延續本站塔羅與紫微斗數解讀的文案風格：像 LINE 私訊裡親自回朋友，口語、直覺、有共鳴，偶爾有一點心疼或鼓勵。

# 語氣範例
這個夢的訊號滿明顯的～
它比較像是在說
你最近心裡有一件事卡住了
不是你完全不知道怎麼辦
而是你想很多 顧慮也很多
所以一直沒有真的放鬆下來😅

夢裡那種找不到出口的感覺
比較像現實裡的壓力在推你
你表面上可能還是正常生活
但心裡其實已經有點累了～

# 寫法規則
- 不是心理學報告，也不是制式夢境字典，是 Mochi 在私訊裡幫使用者看這個夢。
- 寫成自然短句換行，不要 Markdown 標題、不要條列、不要編號。
- 第一行先給直覺判斷，例如「這個夢的訊號滿明顯的～」「我會覺得這是一個提醒夢」「這個夢比較像是在講你的內在狀態」。
- 解析要包含：夢境核心訊號、夢中元素的象徵、近期可能狀態、和感情/人際/工作/壓力/安全感/自我價值其中 1-3 個現實連結。
- 可以用「比較像」「我會覺得」「如果你最近剛好」這種柔和但有判斷感的說法。
- 可以自然穿插「～」「！」和少量 emoji，例如 😅🥺🌙✨💗，但不要每行都用。
- 不要用破折號（—、——、-）來停頓；想停頓就換行。
- 不要宣稱夢會預言死亡、疾病、災難或壞事一定發生。
- 不要恐嚇使用者，不要說「一定代表」。
- 如果夢境帶有強烈創傷、傷害自己或傷害他人的內容，要溫柔提醒使用者可以找信任的人或專業協助，不要診斷。
- 結尾收一個溫柔但具體的小提醒，不要叫使用者私訊，不要推銷。
- 全文約 220-380 字。`;

export const dreamRouter = router({
  interpret: publicProcedure
    .input(
      z.object({
        dreamContent: z.string().trim().min(6).max(1600),
        wakeEmotion: z.string().trim().max(80).optional(),
        recentStatus: z.string().trim().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireLoginAfterFirstVisitorReading(ctx);
      await chargeReading(ctx, "dream");

      const memberMemoryContext = await getMemberMemoryContext(ctx.user);
      const optionalContext = [
        input.wakeEmotion ? `醒來後的感覺：\n${input.wakeEmotion}` : "",
        input.recentStatus ? `最近狀態：\n${input.recentStatus}` : "",
      ].filter(Boolean).join("\n\n");

      const userPrompt = `請根據以下資料，產生一段 Mochi 解夢。

夢境內容：
${input.dreamContent}
${optionalContext ? `\n\n${optionalContext}` : ""}
${memberMemoryContext}

請用本站塔羅與紫微解讀那種口語私訊感來寫。
不要條列，不要標題，不要恐嚇式預言。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: DREAM_STYLE },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const interpretation = rawContent
        ? cleanDreamInterpretation(
            extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
          )
        : "這個夢 Mochi 暫時讀不到完整訊號，請稍後再試一次。";

      const isMember = Boolean(ctx.user);
      const inputData = JSON.stringify({
        recordKind: "dream",
        wakeEmotion: input.wakeEmotion || null,
        recentStatus: input.recentStatus || null,
        dreamContent: input.dreamContent,
      });
      const summary = isMember
        ? await buildReadingSummary({
            type: "dream",
            question: input.dreamContent,
            inputData,
            interpretation,
          })
        : null;

      try {
        await saveReading({
          userId: ctx.user?.id ?? null,
          anonId: isMember ? null : ctx.anonId,
          ipHash: isMember ? null : ctx.ipHash,
          type: "dream",
          question: input.dreamContent.slice(0, 500),
          inputData,
          interpretation,
          summary,
        });
      } catch (error) {
        console.warn("[dream] Failed to save reading", error);
      }

      return { interpretation };
    }),
});
