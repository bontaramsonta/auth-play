ALTER TABLE "user" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hashed_password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");