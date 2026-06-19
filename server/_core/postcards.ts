import type { UserPostcard } from "../../drizzle/schema";
import {
  createScheduledPostcard,
  getCurrentNotifiedPostcard,
  getPostcardForDelivery,
  getRecentReadingSummariesByUser,
  incrementUserLoginCount,
  markPostcardNotified,
} from "../db";
import { extractTextContent, invokeLLM } from "./llm";

const DEFAULT_POSTCARD_IMAGE_IDS = [
  "1h6jPMTDCWny3T56Nnyi9wc9XHrIBFLMd",
  "1dnmIZoGlkbzbs1Q-WKMEqqYePdBqb0h_",
  "1kcjIOTiXDikvJZiT9uNJD743NLaOi-Zf",
  "1fmSzfIiFaWXrb0L3KrSU2hUTTum583GR",
  "1x1MWr-G0nC4ZwfcIZrnr_ttXKpPsJJCE",
  "1J_PVEpEqifmeZg3258FNEdO8CwFMwykK",
  "1-HbZCnR_y506z82FXTx-WXRR1uOu02WA",
  "1PaD6ODtMCUw9PO3A07sx2xrpOHTArsB_",
  "16y5LTYPPL-yjlpUVAiV45Cb3n12nwo4M",
  "1LGy0257bJ9Ult6iY7QlGYCPhDcz0-iib",
];

const FALLBACK_MESSAGES = [
  "今天也有好好往前一點點，Mochi 有看見。",
  "慢慢來也沒關係，你正在長出自己的光。",
  "把心放軟一點，今天先照顧好自己就很棒。",
  "願你被小小的好事接住，像被陽光抱一下。",
  "你不用一次變勇敢，一小步也算很了不起。",
];

export type PostcardPayload = Pick<
  UserPostcard,
  "id" | "imageUrl" | "message" | "createdLoginCount" | "deliverLoginCount" | "status"
>;

function driveImageUrl(id: string) {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

function configuredImageUrls() {
  const raw = process.env.POSTCARD_IMAGE_URLS;
  if (!raw) return DEFAULT_POSTCARD_IMAGE_IDS.map(driveImageUrl);
  const urls = raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  return urls.length > 0 ? urls : DEFAULT_POSTCARD_IMAGE_IDS.map(driveImageUrl);
}

function pickImageUrl(userId: number, loginCount: number) {
  const urls = configuredImageUrls();
  const index = Math.abs((userId * 31 + loginCount * 17) % urls.length);
  return urls[index];
}

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function normalizeMessage(value: string) {
  const firstLine = value
    .replace(/[「」"“”]/g, "")
    .split(/\n+/)[0]
    ?.trim();
  return compactText(firstLine || FALLBACK_MESSAGES[0], 42);
}

async function generatePostcardMessage(userId: number) {
  const summaries = await getRecentReadingSummariesByUser(userId, 5);
  if (summaries.length === 0) {
    return FALLBACK_MESSAGES[userId % FALLBACK_MESSAGES.length];
  }

  const memory = summaries
    .map((row, index) => {
      const question = row.question ? `｜問題：${compactText(row.question, 70)}` : "";
      return `${index + 1}. ${row.type}${question}｜${compactText(row.summary ?? "", 140)}`;
    })
    .join("\n");

  try {
    const response = await invokeLLM({
      maxTokens: 80,
      messages: [
        {
          role: "system",
          content:
            "你是 Healing Pick 的小貓郵差。只輸出一句繁體中文短句，不要標題、不要 Markdown、不要引號。",
        },
        {
          role: "user",
          content: `根據會員近期紀錄摘要，寫一句 18-28 字的可愛療癒明信片文字。語氣像小貓悄悄寄來的鼓勵。不要提到「紀錄」「摘要」「占卜歷史」，不要提病症或沉重字眼。\n\n${memory}`,
        },
      ],
    });
    const raw = response.choices?.[0]?.message?.content;
    const text = raw ? extractTextContent(raw as string | Array<{ type: string; text?: string }>) : "";
    return normalizeMessage(text);
  } catch {
    return FALLBACK_MESSAGES[userId % FALLBACK_MESSAGES.length];
  }
}

function serializePostcard(postcard: UserPostcard | undefined): PostcardPayload | null {
  if (!postcard) return null;
  return {
    id: postcard.id,
    imageUrl: postcard.imageUrl,
    message: postcard.message,
    createdLoginCount: postcard.createdLoginCount,
    deliverLoginCount: postcard.deliverLoginCount,
    status: postcard.status,
  };
}

export async function handleAuthenticatedOpen(userId: number) {
  const loginCount = await incrementUserLoginCount(userId);
  if (!loginCount) {
    return { loginCount: null, postcard: null };
  }

  if (loginCount % 2 === 1) {
    const message = await generatePostcardMessage(userId);
    await createScheduledPostcard({
      userId,
      createdLoginCount: loginCount,
      deliverLoginCount: loginCount + 1,
      imageUrl: pickImageUrl(userId, loginCount),
      message,
      status: "scheduled",
    });
    return { loginCount, postcard: null };
  }

  const scheduled = await getPostcardForDelivery(userId, loginCount);
  const notified = scheduled ? await markPostcardNotified(scheduled.id) : await getCurrentNotifiedPostcard(userId);
  return { loginCount, postcard: serializePostcard(notified) };
}

export async function getPendingPostcard(userId: number) {
  return serializePostcard(await getCurrentNotifiedPostcard(userId));
}
