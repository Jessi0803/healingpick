import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getReadingsByUser,
  saveReading,
} from "../db";
import { buildReadingSummary } from "../_core/readingMemory";

export const historyRouter = router({
  /**
   * 取得使用者的占卜歷史（塔羅、紫微、每日運勢、解夢）
   */
  getReadings: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const readings = await getReadingsByUser(ctx.user.id, input.limit);
      return readings;
    }),

  /**
   * 儲存占卜記錄。登入會員以 userId 記錄；未登入訪客則以 anonId / ipHash 記錄，
   * 讓後台也能看到訪客問過的問題與 AI 回答。
   */
  saveReading: publicProcedure
    .input(
      z.object({
        type: z.enum(["tarot", "ziwei", "fortune", "dream"]),
        question: z.string().max(500).optional(),
        inputData: z.string().max(5000).optional(),
        interpretation: z.string().max(10000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isMember = Boolean(ctx.user);
      const summary = isMember
        ? await buildReadingSummary({
            type: input.type,
            question: input.question,
            inputData: input.inputData,
            interpretation: input.interpretation,
          })
        : null;
      await saveReading({
        userId: ctx.user?.id ?? null,
        anonId: isMember ? null : ctx.anonId,
        ipHash: isMember ? null : ctx.ipHash,
        type: input.type,
        question: input.question ?? null,
        inputData: input.inputData ?? null,
        interpretation: input.interpretation ?? null,
        summary,
      });
      return { success: true };
    }),
});
