import {
  createReadingFollowup,
  getEligibleReadingFollowups,
  getRecentReadingSummariesByUser,
  updateReadingFollowupStatus,
  type EligibleReadingFollowup,
} from "../db";
import { extractTextContent, invokeLLM } from "./llm";
import { pushLineTextMessage } from "./line";
import { sendEmail } from "./email";

const TYPE_LABELS: Record<string, string> = {
  tarot: "塔羅",
  ziwei: "紫微",
  fortune: "每日運勢",
  dream: "Mochi 解夢",
};

function compactText(value: string | null | undefined, maxLength: number) {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}...`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fallbackMessage(row: EligibleReadingFollowup) {
  const typeLabel = TYPE_LABELS[row.type] ?? "占卜";
  return `上次那個${typeLabel}後來有比較清楚嗎？還是你現在卡住的點，跟那時候其實不太一樣了？`;
}

function buildEmailHtml(message: string) {
  return `
    <div style="font-family: 'Noto Serif TC', 'PingFang TC', 'Microsoft JhengHei', serif; color: #4f4540; line-height: 1.9; max-width: 560px; margin: 0 auto; padding: 28px 20px;">
      <p style="font-size: 15px; margin: 0 0 18px;">${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      <p style="font-size: 13px; color: #9a8068; margin: 24px 0 0;">Healing Pick Mochi</p>
    </div>
  `;
}

async function generateCareMessage(row: EligibleReadingFollowup) {
  const typeLabel = TYPE_LABELS[row.type] ?? row.type;
  const recentSummaries = await getRecentReadingSummariesByUser(row.userId, 5);
  const recentContext = recentSummaries
    .map((summary, index) => {
      const summaryType = TYPE_LABELS[summary.type] ?? summary.type;
      const question = compactText(summary.question, 80);
      const text = compactText(summary.summary, 160);
      return `${index + 1}. ${summaryType}${question ? `｜問：${question}` : ""}${text ? `｜摘要：${text}` : ""}`;
    })
    .join("\n");
  const context = [
    recentContext ? `最近五次摘要：\n${recentContext}` : "",
    row.question ? `最新一次當時問：${compactText(row.question, 120)}` : "",
    row.summary ? `最新一次摘要：${compactText(row.summary, 220)}` : "",
    !row.summary && row.interpretation ? `最新一次解讀重點：${compactText(row.interpretation, 260)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await invokeLLM({
      maxTokens: 220,
      messages: [
        {
          role: "system",
          content:
            "你是 Healing Pick 的 Mochi。你會根據會員最近的占卜脈絡，寫一段像 LINE 裡朋友追問後續的繁體中文短訊息。不要提醒、不要問候、不要指導、不要行銷、不要雞湯。",
        },
        {
          role: "user",
          content: `請根據這位會員最近五次占卜摘要，尤其是三天前最新一次的${typeLabel}，寫一段 2-3 句的短訊息。

要求：
- 不要說「系統」「紀錄」「我們發現」。
- 不要直接暴露太細的人名、日期或隱私細節。
- 以疑問句為主，像朋友在問「上次那件事後來呢？」。
- 可以問「後來有比較清楚嗎」「現在還是在等嗎」「還是卡住的點變了」這類後續。
- 不要問候，不要寫「還好嗎」「最近怎麼樣」「想聊的話我在」。
- 不要提醒，不要給建議，不要用「你可以」「先試著」「記得」「別急著」。
- 不要 call to action，不要叫他回來占卜、不要說 Mochi 在。
- 語氣要像 LINE 裡朋友接續上次話題，不要像客服。
- 要抓最近五次摘要裡重複出現的情緒或卡點，但只能點到為止。
- 不要雞湯，不要金句，不要寫得太文青、太靈性、太正式；避免「宇宙、能量、光、顯化、課題、療癒」。
- 可以用「那件事」「那個選擇」「心裡那個結」「一直反覆想的地方」這種模糊說法。
- 不要使用 Markdown、標題或引號。

脈絡：
${context || "沒有明確文字脈絡，請寫泛用但溫暖的關心。"}`,
        },
      ],
    });
    const raw = response.choices?.[0]?.message?.content;
    const text = raw ? extractTextContent(raw as string | Array<{ type: string; text?: string }>) : "";
    return compactText(text.replace(/[「」"“”]/g, "").trim(), 140) || fallbackMessage(row);
  } catch (error) {
    console.warn("[Followup] Failed to generate AI care message:", error);
    return fallbackMessage(row);
  }
}

async function sendFollowup(row: EligibleReadingFollowup, message: string) {
  if (row.lineUserId) {
    const sent = await pushLineTextMessage(row.lineUserId, message);
    if (sent) return { channel: "line", sent: true, failureReason: null };
  }

  if (row.email) {
    const sent = await sendEmail({
      to: row.email,
      subject: "Mochi 留了一句話給你",
      html: buildEmailHtml(message),
    });
    if (sent) return { channel: "email", sent: true, failureReason: null };
    return { channel: "email", sent: false, failureReason: "email_send_failed" };
  }

  return { channel: row.lineUserId ? "line" : "none", sent: false, failureReason: "no_reachable_channel" };
}

export async function sendReadingFollowups(limit = 25) {
  const rows = await getEligibleReadingFollowups(limit);
  const result = {
    eligible: rows.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const row of rows) {
    const followup = await createReadingFollowup({
      userId: row.userId,
      readingId: row.readingId,
      channel: "pending",
      status: "pending",
    });
    if (!followup) {
      result.skipped += 1;
      continue;
    }

    try {
      const message = await generateCareMessage(row);
      const delivery = await sendFollowup(row, message);
      await updateReadingFollowupStatus(followup.id, {
        channel: delivery.channel,
        status: delivery.sent ? "sent" : "failed",
        subject: delivery.channel === "email" ? "Mochi 留了一句話給你" : null,
        message,
        failureReason: delivery.failureReason,
        sentAt: delivery.sent ? new Date() : null,
      });
      if (delivery.sent) result.sent += 1;
      else result.failed += 1;
    } catch (error) {
      await updateReadingFollowupStatus(followup.id, {
        channel: "unknown",
        status: "failed",
        failureReason: error instanceof Error ? error.message : String(error),
      });
      result.failed += 1;
    }
  }

  return result;
}
