import type { Express, Request, Response } from "express";
import { getGoogleDriveAccessToken } from "./googleDrive";

const DRIVE_FILE_ID_RE = /^[A-Za-z0-9_-]{10,128}$/;

export function registerPostcardImageProxy(app: Express) {
  app.get("/api/postcards/image/:fileId", async (req: Request, res: Response) => {
    const fileId = req.params.fileId;
    if (!DRIVE_FILE_ID_RE.test(fileId)) {
      res.status(400).send("Invalid postcard image id");
      return;
    }

    try {
      const accessToken = await getGoogleDriveAccessToken();
      const driveResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
        {
          headers: { authorization: `Bearer ${accessToken}` },
        },
      );

      if (!driveResponse.ok) {
        const detail = await driveResponse.text().catch(() => driveResponse.statusText);
        console.warn(`[Postcards] Drive image fetch failed (${driveResponse.status}): ${detail}`);
        res.status(driveResponse.status).send("Postcard image unavailable");
        return;
      }

      const contentType = driveResponse.headers.get("content-type") || "image/svg+xml";
      const data = Buffer.from(await driveResponse.arrayBuffer());
      res.setHeader("content-type", contentType.includes("svg") ? "image/svg+xml; charset=utf-8" : contentType);
      res.setHeader("cache-control", "private, max-age=3600");
      res.send(data);
    } catch (error) {
      console.warn("[Postcards] Image proxy failed:", error);
      res.status(500).send("Postcard image unavailable");
    }
  });
}
