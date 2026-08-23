ALTER TABLE "meals" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "meals" ADD COLUMN "message_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "meals_user_message_id_unique_idx" ON "meals" USING btree ("user_id","message_id");--> statement-breakpoint
CREATE INDEX "meals_user_created_at_idx" ON "meals" USING btree ("user_id","created_at");
