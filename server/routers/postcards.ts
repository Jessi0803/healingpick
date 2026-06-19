import { z } from "zod";
import { markPostcardOpened } from "../db";
import { getPendingPostcard, handleAuthenticatedOpen } from "../_core/postcards";
import { protectedProcedure, router } from "../_core/trpc";

export const postcardsRouter = router({
  onAuthenticatedOpen: protectedProcedure.mutation(async ({ ctx }) => {
    return handleAuthenticatedOpen(ctx.user.id);
  }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    return getPendingPostcard(ctx.user.id);
  }),

  open: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const postcard = await markPostcardOpened(ctx.user.id, input.id);
      return { success: Boolean(postcard) };
    }),
});
