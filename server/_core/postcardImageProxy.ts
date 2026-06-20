import type { Express, Request, Response } from "express";

const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

export function registerPostcardImageProxy(app: Express) {
  app.get("/api/postcards/image/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!DRIVE_FILE_ID_PATTERN.test(id)) {
      res.status(400).json({ error: "Invalid postcard image id" });
      return;
    }

    try {
      const upstream = await fetch(`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`);
      if (!upstream.ok) {
        res.status(upstream.status).json({ error: "Unable to load postcard image" });
        return;
      }

      const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
      const data = Buffer.from(await upstream.arrayBuffer());
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.send(data);
    } catch {
      res.status(502).json({ error: "Unable to load postcard image" });
    }
  });
}
