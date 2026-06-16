CREATE TABLE IF NOT EXISTS "user_email_aliases" (
  "email" varchar(320) PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_aliases_userId_idx" ON "user_email_aliases" ("userId");
