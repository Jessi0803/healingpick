// Vercel serverless entry: exports the API-only Express app as the handler.
// All /api/* and /manus-storage/* requests are routed here by vercel.json.
import { createApp } from "../server/_core/app";

export default createApp();
