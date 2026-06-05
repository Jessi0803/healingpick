import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLineRoutes } from "./line";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { handleGumroadPing } from "./gumroad";

// Builds the API-only Express app (no Vite, no static, no listen).
// Reused by the local dev server (server/_core/index.ts) and the Vercel
// serverless function (api/index.ts).
export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerLineRoutes(app);
  app.post("/api/gumroad-webhook", handleGumroadPing);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
