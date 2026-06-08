DO $$ BEGIN
	CREATE TYPE "public"."feedback_source" AS ENUM('tarot', 'ziwei');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"source" "feedback_source" NOT NULL,
	"message" text NOT NULL,
	"context" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
