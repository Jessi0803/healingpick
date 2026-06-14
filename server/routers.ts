import { COOKIE_NAME } from "../shared/const";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { tarotRouter } from "./routers/tarot";
import { ziweiRouter } from "./routers/ziwei";
import { fortuneRouter } from "./routers/fortune";
import { dreamRouter } from "./routers/dream";
import { historyRouter } from "./routers/history";
import { mochiRouter } from "./routers/mochi";
import { creditsRouter } from "./routers/credits";
import { adminRouter } from "./routers/admin";
import { feedbackRouter } from "./routers/feedback";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().trim().max(60).nullable(),
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
        birthTime: z.enum(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]).nullable(),
        gender: z.enum(["男", "女"]).nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updated = await db.updateUserProfile(ctx.user.id, input);
        return updated ?? ctx.user;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tarot: tarotRouter,
  ziwei: ziweiRouter,
  fortune: fortuneRouter,
  dream: dreamRouter,
  history: historyRouter,
  mochi: mochiRouter,
  credits: creditsRouter,
  admin: adminRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
