import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { addCredits, getCreditState, getUserByEmail } from "../db";
import { isCreditsEnabled } from "../_core/credits";

export const creditsRouter = router({
  /** Current balance + remaining daily free quota for the signed-in user. */
  state: publicProcedure.query(async ({ ctx }) => {
    const enabled = isCreditsEnabled();
    if (!enabled || !ctx.user) {
      return {
        enabled,
        signedIn: Boolean(ctx.user),
        credits: 0,
        freeRemaining: 0,
        dailyFreeQuota: 0,
      };
    }
    const s = await getCreditState(ctx.user.id);
    return {
      enabled: true,
      signedIn: true,
      credits: s?.credits ?? 0,
      freeRemaining: s?.freeRemaining ?? 0,
      dailyFreeQuota: s?.dailyFreeQuota ?? 0,
    };
  }),

  /** Admin-only manual top-up (used for testing before real payment exists). */
  adminTopup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        amount: z.number().int().positive().max(100000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "ADMIN_ONLY" });
      }
      const target = await getUserByEmail(input.email);
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "USER_NOT_FOUND" });
      }
      const updated = await addCredits(target.id, input.amount, "admin_topup");
      return { email: input.email, credits: updated?.credits ?? null };
    }),
});
