import { z } from "zod";
import * as db from "../db";
import {
  maybeCreatePostcardForUser,
  memberPostcardsEnabledForUser,
  recordReturnAndMaybeCreatePostcard,
} from "../postcards";
import { protectedProcedure, router } from "../_core/trpc";

export const postcardsRouter = router({
  latestUnread: protectedProcedure.query(async ({ ctx }) => {
    if (!memberPostcardsEnabledForUser(ctx.user)) return null;
    const state = await db.getMemberPostcardState(ctx.user.id);
    if ((state?.returnsSincePostcard ?? 0) < 2) return null;
    return (await db.getLatestUnreadPostcard(ctx.user.id)) ?? null;
  }),

  maybeCreate: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      return await recordReturnAndMaybeCreatePostcard(ctx.user);
    } catch (error) {
      console.warn("[Postcards] Return-triggered postcard failed:", error);
      return { status: "none" as const, postcard: null };
    }
  }),

  forceCreate: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("FORBIDDEN");
    }
    return maybeCreatePostcardForUser(ctx.user, { force: true });
  }),

  markSeen: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const postcard = (await db.markPostcardSeen(ctx.user.id, input.id)) ?? null;
      await db.updateMemberPostcardReturnState(ctx.user.id, {
        returnsSincePostcard: 0,
        lastReturnAt: new Date(),
      });
      return postcard;
    }),
});
