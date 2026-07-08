DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_order_fit') THEN
    CREATE TYPE "product_order_fit" AS ENUM ('貼手', '剛好', '微鬆');
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "customerName" text NOT NULL,
  "email" varchar(320) NOT NULL,
  "phone" varchar(32) NOT NULL,
  "wristSize" varchar(32) NOT NULL,
  "fit" "product_order_fit" NOT NULL,
  "address" text NOT NULL,
  "items" text NOT NULL,
  "subtotal" integer NOT NULL,
  "freeGift" text DEFAULT '白水晶碎石一包' NOT NULL,
  "status" varchar(24) DEFAULT 'pending' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_orders_created_idx" ON "product_orders" ("createdAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_orders_email_idx" ON "product_orders" ("email");
