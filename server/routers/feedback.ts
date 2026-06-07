import { z } from "zod";
import { saveReadingFeedback } from "../db";
import { notifyOwner } from "../_core/notification";
import { publicProcedure, router } from "../_core/trpc";

const feedbackSourceSchema = z.enum(["tarot", "ziwei"]);

const sourceLabels: Record<z.infer<typeof feedbackSourceSchema>, string> = {
  tarot: "塔羅牌占卜",
  ziwei: "紫微斗數",
};

export const feedbackRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        source: feedbackSourceSchema,
        message: z.string().trim().min(2, "請至少輸入 2 個字").max(1000, "回饋最多 1000 字"),
        context: z.string().trim().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sourceLabel = sourceLabels[input.source];
      const userLabel = ctx.user
        ? `${ctx.user.email ?? ctx.user.id} (${ctx.user.id})`
        : "未登入使用者";

      await saveReadingFeedback({
        userId: ctx.user?.id ?? null,
        anonId: ctx.anonId,
        ipHash: ctx.ipHash,
        source: input.source,
        message: input.message,
        context: input.context ?? null,
      });

      const notificationPayload = {
        title: `新的${sourceLabel}回饋`,
        content: [
          `來源：${sourceLabel}`,
          `使用者：${userLabel}`,
          input.context ? `情境：${input.context}` : null,
          "",
          "回饋內容：",
          input.message,
        ].filter(Boolean).join("\n"),
      };

      const delivered = await notifyOwner(notificationPayload).catch((error) => {
        console.warn("[Feedback] Saved feedback, but owner notification failed:", error);
        return false;
      });

      return { success: true, notified: delivered } as const;
    }),
});
