import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { tarotRouter } from "./routers/tarot";
import { ziweiRouter } from "./routers/ziwei";
import { fortuneRouter } from "./routers/fortune";
import { historyRouter } from "./routers/history";
import { mochiRouter } from "./routers/mochi";
import { creditsRouter } from "./routers/credits";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
  history: historyRouter,
  mochi: mochiRouter,
  credits: creditsRouter,
});

export type AppRouter = typeof appRouter;
