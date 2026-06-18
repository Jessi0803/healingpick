DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'postcard_status') THEN
    CREATE TYPE "public"."postcard_status" AS ENUM ('ready', 'failed');
  END IF;
END
$$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_postcards" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "message" text NOT NULL,
  "googleFileId" varchar(128) NOT NULL,
  "imageUrl" text NOT NULL,
  "status" "postcard_status" DEFAULT 'ready' NOT NULL,
  "seenAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_postcards_user_created_idx" ON "member_postcards" ("userId", "createdAt" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_postcards_user_seen_idx" ON "member_postcards" ("userId", "seenAt");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_postcard_states" (
  "userId" integer PRIMARY KEY NOT NULL,
  "returnsSincePostcard" integer DEFAULT 0 NOT NULL,
  "lastReturnAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
