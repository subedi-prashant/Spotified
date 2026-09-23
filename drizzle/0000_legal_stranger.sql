CREATE TYPE "public"."spotify_account_status" AS ENUM('connected', 'reconnect_required');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_session_hash_unique" UNIQUE("session_hash")
);
--> statement-breakpoint
CREATE TABLE "spotify_accounts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"spotify_account_id" text NOT NULL,
	"spotify_user_id" text,
	"encrypted_access_token" text,
	"access_expires_at" timestamp with time zone,
	"encrypted_refresh_token" text,
	"authorized_at" timestamp with time zone NOT NULL,
	"granted_scopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" "spotify_account_status" DEFAULT 'connected' NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spotify_accounts_spotify_account_id_unique" UNIQUE("spotify_account_id"),
	CONSTRAINT "spotify_accounts_connected_tokens_check" CHECK ("spotify_accounts"."status" <> 'connected' OR ("spotify_accounts"."encrypted_access_token" IS NOT NULL AND "spotify_accounts"."access_expires_at" IS NOT NULL AND "spotify_accounts"."encrypted_refresh_token" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotify_accounts" ADD CONSTRAINT "spotify_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "spotify_accounts_status_idx" ON "spotify_accounts" USING btree ("status");