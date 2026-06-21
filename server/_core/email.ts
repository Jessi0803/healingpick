import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { ENV } from "./env";

const BATCH_SIZE = 100;

let resendClient: Resend | null = null;

export type BatchEmailResult = {
  attempted: number;
  sent: number;
  failed: number;
  errors: string[];
};

function getResendClient() {
  if (!ENV.resendApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "RESEND_API_KEY is not configured.",
    });
  }

  resendClient ??= new Resend(ENV.resendApiKey);
  return resendClient;
}

function getFromEmail() {
  if (!ENV.resendFromEmail) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "RESEND_FROM_EMAIL is not configured.",
    });
  }

  return ENV.resendFromEmail;
}

export function normalizeEmailList(emails: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      emails
        .map((email) => email?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email))
    )
  );
}

export async function sendBatchEmail({
  recipients,
  subject,
  html,
}: {
  recipients: string[];
  subject: string;
  html: string;
}): Promise<BatchEmailResult> {
  const resend = getResendClient();
  const from = getFromEmail();
  const errors: string[] = [];
  let sent = 0;

  for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
    const chunk = recipients.slice(index, index + BATCH_SIZE);
    const { error } = await resend.batch.send(
      chunk.map((email) => ({
        from,
        to: email,
        subject,
        html,
      }))
    );

    if (error) {
      errors.push(error.message);
      continue;
    }

    sent += chunk.length;
  }

  return {
    attempted: recipients.length,
    sent,
    failed: recipients.length - sent,
    errors,
  };
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getResendClient();
  const from = getFromEmail();
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
  if (error) {
    console.warn(`[Email] Failed to send to ${to}: ${error.message}`);
    return false;
  }
  return true;
}
