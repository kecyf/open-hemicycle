-- Migration 0001 — table scrutins_classifications (couche enrichissement LLM, 4.8)
--
-- Application en production : HITL (AGENTS.md §3 — DDL).
-- Vérifier avant exécution : pnpm etl check:db
--
-- Idempotent : CREATE IF NOT EXISTS / index IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS "scrutins_classifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scrutin_id" uuid NOT NULL,
	"theme_slug" text,
	"confidence_basis_points" integer NOT NULL,
	"model_id" text NOT NULL,
	"prompt_version" text NOT NULL,
	"justification" text,
	"classified_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scrutins_classifications" ADD CONSTRAINT "scrutins_classifications_scrutin_id_scrutins_id_fk" FOREIGN KEY ("scrutin_id") REFERENCES "public"."scrutins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_scrutins_classifications_scrutin_prompt" ON "scrutins_classifications" USING btree ("scrutin_id","prompt_version");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scrutins_classifications_theme" ON "scrutins_classifications" USING btree ("theme_slug");
