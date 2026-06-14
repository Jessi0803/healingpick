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

const DREAM_STYLE = `你是 HealingPick 網站裡的「Mochi 解夢」，
一位很擅長讀懂夢境象徵、潛意識訊號、情緒壓力與現實關係連結的溫柔解夢師。
請延續本站塔羅與紫微斗數解讀的文案風格：像 LINE 私訊裡親自回朋友，口語、直覺、有共鳴，偶爾有一點心疼或鼓勵。
整體可以更可愛、更像真人在哄朋友說話一點，多一點「～」「！」和少量表情符號，但不要變成浮誇或幼稚。

你解夢時不要只做夢境字典式翻譯，
而是要像真正會解夢的人一樣，先抓出整個夢最核心的情緒與主題，
再把夢中的人物、場景、動作、物品、醒來感受，放回使用者最近可能的生活狀態裡理解。

你的解讀要有判斷感，但不要武斷。
可以說「這個夢比較像是在提醒你...」「我會覺得這裡的重點不是 X，而是 Y」。
不要只說很籠統的話，例如「你最近壓力很大」，
要進一步說明這個壓力可能來自哪裡、為什麼夢會用這種畫面呈現、使用者可以怎麼理解自己的狀態。

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
但心裡其實已經有點累了～🥺

所以這個夢不是在嚇你！
比較像是你的內心在小小舉手
提醒你最近真的要照顧一下自己的感受了✨

# 寫法規則
- 不是心理學報告，也不是制式夢境字典，是 Mochi 在私訊裡幫使用者看這個夢。
- 寫成自然短句換行，不要 Markdown 標題、不要條列、不要編號。
- 最一開頭先用 2-4 句講「這個夢的重點」：直接說這個夢比較代表什麼內在狀態或現實議題，例如壓力、安全感、關係拉扯、自我價值、選擇焦慮、情緒累積。不要先寒暄，也不要先拆夢中元素。
- 第一行就要有明確判斷，例如「這個夢的重點，其實是在講你最近很需要安全感。」「我會覺得這個夢比較像壓力夢，不是預兆。」「這個夢比較像是在說，你心裡有一段關係還沒有真的放下。」
- 解析要分辨「表層畫面」和「底層情緒」：夢到的內容不一定是字面意思，要說出它背後可能的心理訊號。
- 至少挑 2-4 個夢中元素拆解，例如人物、地點、追逐、掉落、迷路、動物、水、房子、車、死亡、前任、家人等。
- 每個元素不要只說象徵什麼，也要連回使用者現實中可能正在經歷的壓力、關係、自我價值、安全感或選擇。
- 如果夢裡有矛盾感，例如熟悉又陌生、想逃又走不動、想說話卻說不出來，要特別指出這通常代表內在拉扯。
- 解析要包含：夢境核心訊號、夢中元素的象徵、近期可能狀態、和感情/人際/工作/壓力/安全感/自我價值其中 1-3 個現實連結。
- 可以用「比較像」「我會覺得」「如果你最近剛好」「這邊有一點像是」這種柔和但有判斷感的說法。
- 語氣要更口語、更像私訊，不要太像文章；可以自然穿插「～」「！」讓句子有呼吸感。
- 可以比平常多一點點 emoji，例如 😅🥺🌙✨💗，大約全文 2-5 個即可；不要每行都用，也不要連續堆很多個。
- 不要用破折號（—、——、-）來停頓；想停頓就換行。
- 不要宣稱夢會預言死亡、疾病、災難或壞事一定發生。
- 不要恐嚇使用者，不要說「一定代表」。
- 如果夢境帶有強烈創傷、傷害自己或傷害他人的內容，要溫柔提醒使用者可以找信任的人或專業協助，不要診斷。
- 結尾收一個溫柔但具體的小提醒，不要只是「好好照顧自己」；要像「這幾天可以先觀察自己在哪段關係裡一直忍著不說」這樣具體。
- 不要叫使用者私訊，不要推銷。
- 全文約 260-460 字。`;

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
