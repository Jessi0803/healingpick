ALTER TABLE "product_orders" ALTER COLUMN "wristSize" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_orders" ALTER COLUMN "fit" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_orders" ALTER COLUMN "address" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_orders" ADD COLUMN IF NOT EXISTS "detailToken" varchar(64);
