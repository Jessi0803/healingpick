// Vercel serverless entry: lazily builds the Express app and forwards the
// request to it. Boot/import errors are surfaced in the response so they are
// visible instead of an opaque FUNCTION_INVOCATION_FAILED.
import type { IncomingMessage, ServerResponse } from "http";

let appPromise: Promise<(req: IncomingMessage, res: ServerResponse) => void> | null =
  null;

function getApp() {
  if (!appPromise) {
    appPromise = import("../server/_core/app").then((m) => m.createApp());
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
