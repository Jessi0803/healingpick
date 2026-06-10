ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthDate" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthTime" varchar(16);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" varchar(16);
