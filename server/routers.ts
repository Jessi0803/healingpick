import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { tarotRouter } from "./routers/tarot";
import { ziweiRouter } from "./routers/ziwei";
import { fortuneRouter } from "./routers/fortune";
import { historyRouter } from "./routers/history";
import { mochiRouter } from "./routers/mochi";
import { creditsRouter } from "./routers/credits";
import { adminRouter } from "./routers/admin";
import { feedbackRouter } from "./routers/feedback";

function getCookieHost(req: TrpcContext["req"]) {
  return String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0];
}

function clearSessionCookieVariants(ctx: TrpcContext) {
  const cookieOptions = getSessionCookieOptions(ctx.req);
  const host = getCookieHost(ctx.req);
  const domains = Array.from(new Set([
    undefined,
    host || undefined,
    host && !host.startsWith(".") ? `.${host}` : undefined,
  ]));
  const sameSites = ["lax", "none"] as const;

  for (const domain of domains) {
    for (const sameSite of sameSites) {
      ctx.res.clearCookie(COOKIE_NAME, {
        ...cookieOptions,
        domain,
        sameSite,
        secure: sameSite === "none" ? true : cookieOptions.secure,
        expires: new Date(0),
        maxAge: -1,
      });
    }
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearSessionCookieVariants(ctx);
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
  admin: adminRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
