ALTER TABLE "readings" ADD COLUMN IF NOT EXISTS "anonId" varchar(64);--> statement-breakpoint
ALTER TABLE "readings" ADD COLUMN IF NOT EXISTS "ipHash" varchar(64);
