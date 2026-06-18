const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const REDIRECT_URI = "http://localhost:8787/oauth2callback";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function exchangeCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Token exchange failed (${response.status}): ${detail}`);
  }

  const token = (await response.json()) as {
    refresh_token?: string;
    access_token: string;
    expires_in: number;
  };

  if (!token.refresh_token) {
    console.log("Google did not return a refresh token.");
    console.log("Try again after removing app access from your Google Account, then re-authorize.");
    return;
  }

  console.log("\nAdd this to .env:");
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token}`);
}

function printAuthUrl() {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", requiredEnv("GOOGLE_OAUTH_CLIENT_ID"));
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DRIVE_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  console.log("\nOpen this URL, approve access, then copy the code= value from the redirected URL:");
  console.log(url.toString());
  console.log("\nThen run:");
  console.log("GOOGLE_OAUTH_CODE='PASTE_CODE_HERE' pnpm tsx scripts/google-drive-oauth.ts");
}

const code = process.env.GOOGLE_OAUTH_CODE;
if (code) {
  await exchangeCode(code);
} else {
  printAuthUrl();
}
