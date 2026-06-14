import type { User } from "../../drizzle/schema";
import { getRecentReadingSummariesByUser } from "../db";
import { extractTextContent, invokeLLM } from "./llm";

const TYPE_LABELS = {
  tarot: "塔羅",
  ziwei: "紫微",
  fortune: "每日運勢",
  dream: "Mochi 解夢",
} as const;

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export async function buildReadingSummary(input: {
  type: keyof typeof TYPE_LABELS;
  question?: string | null;
  interpretation?: string | null;
  inputData?: string | null;
}) {
  const source = compactText(
    [
      input.question ? `問題：${input.question}` : "",
      input.inputData ? `輸入資料：${input.inputData}` : "",
      input.interpretation ? `解讀：${input.interpretation}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    2500,
  );

  if (!source) return null;

  try {
    const response = await invokeLLM({
      maxTokens: 180,
      messages: [
        {
          role: "system",
          content:
            "你是會員占卜記憶摘要器。只輸出繁體中文短摘要，不要 Markdown，不要標題，不要給新建議。",
        },
        {
          role: "user",
          content: `請把這次${TYPE_LABELS[input.type]}紀錄整理成 80-120 字會員記憶摘要，保留：主題、核心結論、使用者反覆情緒或狀態、後續方向。\n\n${source}`,
        },
      ],
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const summary = rawContent
      ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>)
      : "";
    return compactText(summary, 240) || compactText(source, 220);
  } catch {
    return compactText(source, 220);
  }
}

export async function getMemberMemoryContext(user: Pick<User, "id"> | null | undefined) {
  if (!user) return "";

  const rows = await getRecentReadingSummariesByUser(user.id, 5);
  if (rows.length === 0) return "";

  const memory = rows
    .map((row, index) => {
      const label = TYPE_LABELS[row.type] ?? row.type;
      const question = row.question ? `｜問題：${compactText(row.question, 80)}` : "";
      return `${index + 1}. ${label}${question}｜摘要：${compactText(row.summary ?? "", 180)}`;
    })
    .join("\n");

  return `\n\n【會員近期占卜記憶】\n以下是這位會員最近幾次占卜的短摘要，只作為理解脈絡，不要主動提到「我看到你的歷史紀錄」，也不要洩漏資料來源。若本次問題和近期摘要無關，請以本次問題為主。\n${memory}`;
}
