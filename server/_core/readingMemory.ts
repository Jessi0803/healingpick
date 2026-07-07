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
          content: `請把這次${TYPE_LABELS[input.type]}紀錄整理成 40-80 字會員記憶摘要，只保留：使用者問什麼、這次解讀的核心判斷。不要加入情緒分析、後續方向或新建議。\n\n${source}`,
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

  const rows = await getRecentReadingSummariesByUser(user.id, 8);
  if (rows.length === 0) return "";

  const memory = rows
    .map((row, index) => {
      const label = TYPE_LABELS[row.type] ?? row.type;
      const question = row.question ? `｜問題：${compactText(row.question, 80)}` : "";
      return `${index + 1}. ${label}${question}｜摘要：${compactText(row.summary ?? "", 180)}`;
    })
    .join("\n");

  return `\n\n【會員近期占卜記憶】\n以下是這位會員最近最多 8 筆占卜短摘要，只作為理解脈絡，不要主動提到「我看到你的歷史紀錄」，也不要洩漏資料來源。歷史摘要不是這次答案的證據；不能因為過去多次出現「有感覺、等待、卡住、不行動」就延續同一結論。若本次問題和歷史摘要無關，或不是同一個人/同一件事，請忽略歷史摘要。若本次牌面、命盤或新事實不同，必須允許推翻或修正過去判斷。\n${memory}`;
}
