import { readFile } from "node:fs/promises";
import { SignJWT, importPKCS8 } from "jose";
import { ENV } from "./_core/env";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type DriveUploadResult = {
  fileId: string;
  imageUrl: string;
  webViewLink?: string;
};

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

let cachedCredentials: ServiceAccountCredentials | null = null;
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function assertDriveConfig() {
  if (!ENV.googleDrivePostcardFolderId) {
    throw new Error("GOOGLE_DRIVE_POSTCARD_FOLDER_ID is not configured");
  }
  if (
    !hasOAuthRefreshTokenConfig() &&
    !ENV.googleServiceAccountJson &&
    !ENV.googleServiceAccountJsonPath
  ) {
    throw new Error("Google Drive credentials are not configured");
  }
}

function hasOAuthRefreshTokenConfig() {
  return Boolean(
    ENV.googleOAuthClientId &&
      ENV.googleOAuthClientSecret &&
      ENV.googleOAuthRefreshToken,
  );
}

async function getServiceAccountCredentials(): Promise<ServiceAccountCredentials> {
  if (cachedCredentials) return cachedCredentials;
  assertDriveConfig();

  const raw = ENV.googleServiceAccountJson
    ? ENV.googleServiceAccountJson
    : await readFile(ENV.googleServiceAccountJsonPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<ServiceAccountCredentials>;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Google service account JSON is missing client_email or private_key");
  }

  cachedCredentials = {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri,
  };
  return cachedCredentials;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.accessToken;
  }

  if (hasOAuthRefreshTokenConfig()) {
    return getOAuthAccessToken(now);
  }

  const credentials = await getServiceAccountCredentials();
  const privateKey = await importPKCS8(credentials.private_key, "RS256");
  const issuedAt = Math.floor(now / 1000);
  const jwt = await new SignJWT({ scope: DRIVE_SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(credentials.client_email)
    .setSubject(credentials.client_email)
    .setAudience(credentials.token_uri || TOKEN_URL)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + 3600)
    .sign(privateKey);

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const response = await fetch(credentials.token_uri || TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Google token request failed (${response.status}): ${detail}`);
  }

  const token = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

async function getOAuthAccessToken(now: number): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: ENV.googleOAuthClientId,
      client_secret: ENV.googleOAuthClientSecret,
      refresh_token: ENV.googleOAuthRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Google OAuth refresh failed (${response.status}): ${detail}`);
  }

  const token = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

export function googleDrivePostcardsConfigured() {
  return Boolean(
    ENV.googleDrivePostcardFolderId &&
      (hasOAuthRefreshTokenConfig() ||
        ENV.googleServiceAccountJson ||
        ENV.googleServiceAccountJsonPath),
  );
}

function googleDriveImageUrl(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
}

export async function uploadPostcardToGoogleDrive(
  fileName: string,
  data: Buffer | Uint8Array | string,
  mimeType: string,
): Promise<DriveUploadResult> {
  const accessToken = await getAccessToken();
  const boundary = `soul-ease-${crypto.randomUUID()}`;
  const metadata = {
    name: fileName,
    parents: [ENV.googleDrivePostcardFolderId],
  };

  const fileBuffer =
    typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data);
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\ncontent-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    ),
    Buffer.from(`--${boundary}\r\ncontent-type: ${mimeType}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const uploadUrl = new URL("https://www.googleapis.com/upload/drive/v3/files");
  uploadUrl.searchParams.set("uploadType", "multipart");
  uploadUrl.searchParams.set("fields", "id,name,webViewLink");
  uploadUrl.searchParams.set("supportsAllDrives", "true");

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": `multipart/related; boundary=${boundary}`,
      "content-length": String(body.length),
    },
    body,
  });

  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text().catch(() => uploadResponse.statusText);
    throw new Error(`Google Drive upload failed (${uploadResponse.status}): ${detail}`);
  }

  const uploaded = (await uploadResponse.json()) as {
    id: string;
    webViewLink?: string;
  };

  const permissionsUrl = new URL(
    `https://www.googleapis.com/drive/v3/files/${uploaded.id}/permissions`,
  );
  permissionsUrl.searchParams.set("supportsAllDrives", "true");

  const permissionResponse = await fetch(permissionsUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ type: "anyone", role: "reader" }),
  });

  if (!permissionResponse.ok) {
    const detail = await permissionResponse.text().catch(() => permissionResponse.statusText);
    throw new Error(
      `Google Drive permission update failed (${permissionResponse.status}): ${detail}`,
    );
  }

  return {
    fileId: uploaded.id,
    imageUrl: googleDriveImageUrl(uploaded.id),
    webViewLink: uploaded.webViewLink,
  };
}
