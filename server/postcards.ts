import { MemberPostcard } from "../drizzle/schema";
import * as db from "./db";
import {
  googleDrivePostcardsConfigured,
  uploadPostcardToGoogleDrive,
} from "./googleDrive";
import { ENV } from "./_core/env";
import { generateImageData } from "./_core/imageGeneration";

const POSTCARD_COOLDOWN_DAYS = 7;
const RETURNS_PER_POSTCARD = 2;
const PREPARED_RETURN_COUNT = 1;

export type ReturnPostcardResult =
  | { status: "none"; postcard: null }
  | { status: "prepared"; postcard: MemberPostcard | null }
  | { status: "ready"; postcard: MemberPostcard };

function daysSince(date: Date) {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

function minutesSince(date: Date) {
  return (Date.now() - date.getTime()) / (1000 * 60);
}

function returnDedupeMinutes() {
  const value = Number.parseInt(ENV.postcardReturnDedupeMinutes, 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function memberPostcardsEnabledForUser(user: { email: string | null }) {
  const normalizedEmail = user.email?.trim().toLowerCase();
  const emails = ENV.postcardPilotEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes("*") || (normalizedEmail ? emails.includes(normalizedEmail) : false);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text: string, maxChars: number) {
  const chars = Array.from(text);
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += maxChars) {
    lines.push(chars.slice(i, i + maxChars).join(""));
  }
  return lines.slice(0, 5);
}

function buildPostcardMessage(context: Awaited<ReturnType<typeof db.getRecentReadingSummaries>>) {
  const latest = context[0];
  const base = latest?.summary || latest?.question || latest?.interpretation || "";

  if (base.includes("感情") || base.includes("關係") || base.includes("愛")) {
    return "關係裡的答案不用急著逼出來。先把自己的心安放好，你值得被溫柔對待。";
  }
  if (base.includes("工作") || base.includes("事業") || base.includes("錢")) {
    return "你正在整理前進的方向。慢慢來，今天先完成一件小事，也是在替未來鋪路。";
  }
  if (base.includes("夢") || latest?.type === "dream") {
    return "有些訊息會先以夢的形狀靠近你。醒來後，記得也給現實中的自己一點耐心。";
  }
  if (base.includes("累") || base.includes("壓力") || base.includes("焦慮")) {
    return "累的時候，不必立刻變勇敢。先好好呼吸，讓自己被今天輕輕接住。";
  }
  return "你不需要一次想清楚所有答案。願你今天先靠近自己一點點，那也是很珍貴的前進。";
}

function buildCatPhotoPrompt(message: string) {
  return [
    "A warm, healing postcard-style photo of a calm cat in soft natural window light.",
    "The cat should feel comforting, gentle, serene, and emotionally supportive.",
    "Use a cozy Taiwanese cafe or quiet bedroom mood, soft blanket texture, warm sunlight, shallow depth of field.",
    "No text, no letters, no signs, no watermark, no logo, no typography anywhere in the image.",
    "Leave calm empty space on the left or lower third for overlaid Chinese text.",
    `Emotional theme: ${message}`,
  ].join(" ");
}

async function generateCatBackgroundDataUrl(message: string) {
  try {
    const image = await generateImageData({ prompt: buildCatPhotoPrompt(message) });
    return image.dataUrl;
  } catch (error) {
    console.warn("[Postcards] AI cat background generation failed, using fallback:", error);
    return null;
  }
}

function renderPostcardSvg(
  message: string,
  displayName: string | null,
  backgroundImageDataUrl: string | null,
) {
  const lines = wrapText(message, 18);
  const greeting = displayName ? `${displayName}，給你的一張小卡` : "給你的一張小卡";
  const lineNodes = lines
    .map(
      (line, index) =>
        `<text x="88" y="${310 + index * 50}" class="message">${escapeXml(line)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#F7E7DD"/>
      <stop offset="48%" stop-color="#E7EFF1"/>
      <stop offset="100%" stop-color="#F8F3D8"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#574C45" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="textShade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#FFFDF8" stop-opacity="0.88"/>
      <stop offset="62%" stop-color="#FFFDF8" stop-opacity="0.68"/>
      <stop offset="100%" stop-color="#FFFDF8" stop-opacity="0.16"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#sky)"/>
  ${
    backgroundImageDataUrl
      ? `<image href="${backgroundImageDataUrl}" x="0" y="0" width="1200" height="800" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1200" height="800" fill="#2F3437" opacity="0.1"/>
  <rect width="820" height="800" fill="url(#textShade)"/>`
      : `<path d="M0 540 C180 470 310 585 485 520 C690 444 795 540 1200 430 L1200 800 L0 800 Z" fill="#8BA79A" opacity="0.36"/>
  <path d="M0 635 C230 560 395 700 620 610 C825 528 975 640 1200 575 L1200 800 L0 800 Z" fill="#B08D74" opacity="0.28"/>
  <circle cx="955" cy="170" r="78" fill="#FFF8DC" opacity="0.82"/>`
  }
  <rect x="52" y="56" width="1096" height="688" rx="28" fill="#FFFDF7" opacity="${backgroundImageDataUrl ? "0.42" : "0.72"}" filter="url(#softShadow)"/>
  <rect x="76" y="80" width="1048" height="640" rx="18" fill="none" stroke="#F4E9D6" stroke-width="3" stroke-dasharray="14 13" opacity="0.82"/>
  <text x="88" y="155" class="eyebrow">SOUL EASE POSTCARD</text>
  <text x="88" y="210" class="title">${escapeXml(greeting)}</text>
  ${lineNodes}
  <text x="88" y="640" class="sign">願你今天被自己溫柔地陪伴</text>
  <style>
    .eyebrow { font: 600 25px system-ui, -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif; letter-spacing: 5px; fill: #7E6B5B; }
    .title { font: 600 42px system-ui, -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif; fill: #2F3437; }
    .message { font: 500 38px system-ui, -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif; fill: #354044; }
    .sign { font: 500 27px system-ui, -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif; fill: #806F5D; }
  </style>
</svg>`;
}

export async function maybeCreatePostcardForUser(
  user: { id: number; name: string | null; email?: string | null },
  options: { force?: boolean } = {},
): Promise<MemberPostcard | null> {
  if (!options.force && !memberPostcardsEnabledForUser({ email: user.email ?? null })) {
    return null;
  }
  const unread = await db.getLatestUnreadPostcard(user.id);
  if (unread) return unread;
  if (!googleDrivePostcardsConfigured()) return null;

  const latest = await db.getLatestPostcard(user.id);
  if (!options.force) {
    if (latest && daysSince(latest.createdAt) < POSTCARD_COOLDOWN_DAYS) return null;
  }

  const context = await db.getRecentReadingSummaries(user.id);
  const message = buildPostcardMessage(context);
  const catBackgroundDataUrl = await generateCatBackgroundDataUrl(message);
  const svg = renderPostcardSvg(message, user.name, catBackgroundDataUrl);
  const uploaded = await uploadPostcardToGoogleDrive(
    `soul-ease-postcard-${user.id}-${Date.now()}.svg`,
    svg,
    "image/svg+xml",
  );

  return (
    (await db.createMemberPostcard({
      userId: user.id,
      message,
      googleFileId: uploaded.fileId,
      imageUrl: uploaded.imageUrl,
      status: "ready",
    })) ?? null
  );
}

export async function recordReturnAndMaybeCreatePostcard(user: {
  id: number;
  name: string | null;
  email: string | null;
}): Promise<ReturnPostcardResult> {
  if (!memberPostcardsEnabledForUser(user)) {
    return { status: "none", postcard: null };
  }

  const now = new Date();
  const state = await db.getMemberPostcardState(user.id);
  if (
    state?.lastReturnAt &&
    minutesSince(state.lastReturnAt) < returnDedupeMinutes()
  ) {
    return { status: "none", postcard: null };
  }

  const unread = await db.getLatestUnreadPostcard(user.id);
  if (unread) {
    if ((state?.returnsSincePostcard ?? 0) >= RETURNS_PER_POSTCARD - 1) {
      await db.updateMemberPostcardReturnState(user.id, {
        returnsSincePostcard: RETURNS_PER_POSTCARD,
        lastReturnAt: now,
      });
      return { status: "ready", postcard: unread };
    }
  }

  const returnsSincePostcard = (state?.returnsSincePostcard ?? 0) + 1;
  if (returnsSincePostcard === PREPARED_RETURN_COUNT) {
    const postcard = await maybeCreatePostcardForUser(user, { force: true });
    if (!postcard) {
      return { status: "none", postcard: null };
    }
    await db.updateMemberPostcardReturnState(user.id, {
      returnsSincePostcard,
      lastReturnAt: now,
    });
    return { status: "prepared", postcard };
  }

  if (unread && returnsSincePostcard >= RETURNS_PER_POSTCARD) {
    await db.updateMemberPostcardReturnState(user.id, {
      returnsSincePostcard: RETURNS_PER_POSTCARD,
      lastReturnAt: now,
    });
    return { status: "ready", postcard: unread };
  }

  const postcard = await maybeCreatePostcardForUser(user, { force: true });
  if (postcard) {
    await db.updateMemberPostcardReturnState(user.id, {
      returnsSincePostcard: RETURNS_PER_POSTCARD,
      lastReturnAt: now,
    });
    return { status: "ready", postcard };
  }
  return { status: "none", postcard: null };
}
