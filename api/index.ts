// Vercel serverless entry. The Express app is pre-bundled by the build step
// (see package.json "build:vercel") into ./_app.mjs — a self-contained ESM
// file with all server source transpiled and inlined, so Vercel's function
// bundler never has to resolve the TypeScript server/ tree at runtime.
import type { IncomingMessage, ServerResponse } from "http";

let appPromise: Promise<(req: IncomingMessage, res: ServerResponse) => void> | null =
  null;

function getApp() {
  if (!appPromise) {
    // @ts-expect-error generated at build time
    appPromise = import("./_app.mjs").then((m) => m.createApp());
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: unknown) {
    const e = err as { stack?: string; message?: string };
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("BOOT ERROR:\n" + (e?.stack || e?.message || String(err)));
  }
}
