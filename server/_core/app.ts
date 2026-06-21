import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerLineRoutes } from "./line";
import { registerPostcardImageProxy } from "./postcardImageProxy";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { handleGumroadPing } from "./gumroad";
import { resetDailyFreeQuotas } from "../db";
import { sendReadingFollowups } from "./readingFollowups";

// Builds the API-only Express app (no Vite, no static, no listen).
// Reused by the local dev server (server/_core/index.ts) and the Vercel
// serverless function (api/index.ts).
export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerPostcardImageProxy(app);
  registerLineRoutes(app);
  app.post("/api/gumroad-webhook", handleGumroadPing);
  app.get("/api/cron/reset-free-quota", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }

    try {
      const result = await resetDailyFreeQuotas();
      return res.json({ ok: true, result });
    } catch (error) {
      console.error("[Cron] Failed to reset free quotas:", error);
      return res.status(500).json({ ok: false, error: "reset_failed" });
    }
  });
  app.get("/api/cron/send-reading-followups", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }

    try {
      const result = await sendReadingFollowups();
      return res.json({ ok: true, result });
    } catch (error) {
      console.error("[Cron] Failed to send reading followups:", error);
      return res.status(500).json({ ok: false, error: "followup_failed" });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
