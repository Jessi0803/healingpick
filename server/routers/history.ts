import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getReadingsByUser,
  saveReading,
} from "../db";

export const historyRouter = router({
  /**
   * 取得使用者的占卜歷史（塔羅、紫微、每日運勢）
   */
  getReadings: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const readings = await getReadingsByUser(ctx.user.id, input.limit);
      return readings;
    }),

  /**
   * 儲存占卜記錄
   */
  saveReading: protectedProcedure
    .input(
      z.object({
        type: z.enum(["tarot", "ziwei", "fortune"]),
        question: z.string().max(500).optional(),
        inputData: z.string().max(5000).optional(),
        interpretation: z.string().max(10000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await saveReading({
        userId: ctx.user.id,
        type: input.type,
        question: input.question ?? null,
        inputData: input.inputData ?? null,
        interpretation: input.interpretation ?? null,
      });
      return { success: true };
    }),
});
