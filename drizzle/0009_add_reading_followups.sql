ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lineUserId" varchar(128);

CREATE INDEX IF NOT EXISTS "users_lineUserId_idx" ON "users" ("lineUserId");

CREATE TABLE IF NOT EXISTS "reading_followups" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "readingId" integer NOT NULL,
  "channel" varchar(24) NOT NULL,
  "status" varchar(24) DEFAULT 'pending' NOT NULL,
  "subject" text,
  "message" text,
  "failureReason" text,
  "scheduledAt" timestamp DEFAULT now() NOT NULL,
  "sentAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "reading_followups_reading_created_idx"
  ON "reading_followups" ("readingId");

CREATE INDEX IF NOT EXISTS "reading_followups_user_status_idx"
  ON "reading_followups" ("userId", "status");
