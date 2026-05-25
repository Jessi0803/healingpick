import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getReadingsByUser,
  getTreeholeSessionsByUser,
  saveReading,
  saveTreeholeSession,
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

  /**
   * 取得使用者的心靈樹洞對話歷史
   */
  getTreeholeSessions: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const sessions = await getTreeholeSessionsByUser(ctx.user.id, input.limit);
      return sessions;
    }),

  /**
   * 儲存心靈樹洞對話記錄
   */
  saveTreeholeSession: protectedProcedure
    .input(
      z.object({
        mood: z.string().max(32).optional(),
        userText: z.string().min(1).max(2000),
        aiResponse: z.string().max(5000).optional(),
        crystalName: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await saveTreeholeSession({
        userId: ctx.user.id,
        mood: input.mood ?? null,
        userText: input.userText,
        aiResponse: input.aiResponse ?? null,
        crystalName: input.crystalName ?? null,
      });
      return { success: true };
    }),
});
