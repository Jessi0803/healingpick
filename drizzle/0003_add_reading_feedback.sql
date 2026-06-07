CREATE TYPE "public"."feedback_source" AS ENUM('tarot', 'ziwei');--> statement-breakpoint
CREATE TABLE "reading_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"anonId" varchar(64),
	"ipHash" varchar(64),
	"source" "feedback_source" NOT NULL,
	"message" text NOT NULL,
	"context" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
