/*
  Warnings:

  - The primary key for the `crisis_interventions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `crisisLevel` on the `crisis_interventions` table. All the data in the column will be lost.
  - The primary key for the `uk_mental_health_content` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `source` on the `uk_mental_health_content` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `content_type` on the `uk_mental_health_content` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password_hash` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `stress_level` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - Added the required column `crisis_level` to the `crisis_interventions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `crisis_interventions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `crisis_interventions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `uk_mental_health_content` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `uk_mental_health_content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CrisisLevel" AS ENUM ('low', 'medium', 'high', 'emergency');

-- CreateEnum
CREATE TYPE "StressPathway" AS ENUM ('HIGH', 'MID', 'LOW');

-- CreateEnum
CREATE TYPE "SafetyTriggerType" AS ENUM ('KEYWORD_MATCH', 'LLM_INTENT', 'MANUAL_ESCALATION', 'PATTERN_DETECTED');

-- CreateEnum
CREATE TYPE "HazardSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "public"."crisis_interventions" DROP CONSTRAINT "crisis_interventions_user_id_fkey";

-- AlterTable
ALTER TABLE "crisis_interventions" DROP CONSTRAINT "crisis_interventions_pkey",
DROP COLUMN "crisisLevel",
ADD COLUMN     "calm_zone_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "crisis_level" "CrisisLevel" NOT NULL,
ADD COLUMN     "response_time_ms" INTEGER,
ADD COLUMN     "session_killed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shout_text_used" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '7 days',
ALTER COLUMN "auto_delete_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "crisis_interventions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "uk_mental_health_content" DROP CONSTRAINT "uk_mental_health_content_pkey",
ADD COLUMN     "is_urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pathway" "StressPathway",
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "source" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "content_type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "uk_mental_health_content_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "current_pathway" "StressPathway" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "encryption_key_id" VARCHAR(64),
ADD COLUMN     "last_pathway_change" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "stress_level" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "last_consent_update" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "primary_safety_contact" JSONB,
    "secondary_contacts" JSONB,
    "gp_contact_info" JSONB,
    "crisis_team_info" JSONB,
    "trigger_opt_outs" TEXT[],
    "preferred_coping_tools" TEXT[],
    "avoidance_words" TEXT[],
    "enable_haptics" BOOLEAN NOT NULL DEFAULT true,
    "enable_sound_feedback" BOOLEAN NOT NULL DEFAULT false,
    "preferred_voice" VARCHAR(50),
    "text_size" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "high_contrast_mode" BOOLEAN NOT NULL DEFAULT false,
    "reduced_motion" BOOLEAN NOT NULL DEFAULT false,
    "check_in_reminders" BOOLEAN NOT NULL DEFAULT true,
    "reminder_time" VARCHAR(10),
    "quiet_hours_start" VARCHAR(10),
    "quiet_hours_end" VARCHAR(10),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pathway" "StressPathway" NOT NULL,
    "intensity_start" SMALLINT NOT NULL,
    "intensity_end" SMALLINT,
    "intensity_delta" SMALLINT,
    "primary_emotion" VARCHAR(50) NOT NULL,
    "secondary_emotions" TEXT[],
    "physical_symptoms" TEXT[],
    "trigger_category" VARCHAR(50),
    "trigger_description" TEXT,
    "tool_used" VARCHAR(100),
    "tool_duration_seconds" INTEGER,
    "time_to_calm" SMALLINT,
    "resolution_success" BOOLEAN,
    "follow_up_needed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "auto_delete_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now() + interval '30 days',

    CONSTRAINT "mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_usage_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tool_name" VARCHAR(100) NOT NULL,
    "pathway" "StressPathway" NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 1,
    "total_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION,
    "avg_intensity_reduction" DOUBLE PRECISION,
    "last_used_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tool_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_encrypted" TEXT NOT NULL,
    "content_iv" VARCHAR(32) NOT NULL,
    "content_tag" VARCHAR(32) NOT NULL,
    "word_count" INTEGER NOT NULL,
    "entry_type" VARCHAR(50) NOT NULL DEFAULT 'freeform',
    "mood_snapshot" VARCHAR(50),
    "pathway" "StressPathway" NOT NULL,
    "ai_processed" BOOLEAN NOT NULL DEFAULT false,
    "pii_scrubbed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "auto_delete_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now() + interval '30 days',

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semantic_embeddings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "journal_entry_id" UUID,
    "embedding" vector(1536),
    "dominant_emotion" VARCHAR(50),
    "emotion_intensity" DOUBLE PRECISION,
    "themes" TEXT[],
    "triggers" TEXT[],
    "similarity_cluster" VARCHAR(50),
    "pattern_strength" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auto_delete_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now() + interval '30 days',

    CONSTRAINT "semantic_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_hazard_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "intervention_id" UUID,
    "trigger_type" "SafetyTriggerType" NOT NULL,
    "severity" "HazardSeverity" NOT NULL,
    "trigger_source" VARCHAR(100) NOT NULL,
    "detected_pattern" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION,
    "actions_taken" TEXT[],
    "ai_session_killed" BOOLEAN NOT NULL DEFAULT false,
    "clinical_card_shown" BOOLEAN NOT NULL DEFAULT false,
    "resources_provided" TEXT[],
    "user_engaged_resource" BOOLEAN,
    "escalated_externally" BOOLEAN NOT NULL DEFAULT false,
    "false_positive" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" VARCHAR(100),
    "review_notes" TEXT,
    "auto_delete_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now() + interval '365 days',

    CONSTRAINT "clinical_hazard_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_decision_logs" (
    "id" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "input_text_hash" VARCHAR(64) NOT NULL,
    "input_length" INTEGER NOT NULL,
    "pathway_at_input" "StressPathway" NOT NULL,
    "keyword_gate_triggered" BOOLEAN NOT NULL,
    "keywords_matched" TEXT[],
    "llm_intent_score" DECIMAL(4,3),
    "llm_model_version" VARCHAR(50),
    "llm_confidence_level" VARCHAR(20),
    "semantic_search_invoked" BOOLEAN NOT NULL DEFAULT false,
    "patterns_found" INTEGER NOT NULL DEFAULT 0,
    "top_similarity_score" DECIMAL(4,3),
    "action_taken" VARCHAR(50) NOT NULL,
    "pathway_after" "StressPathway" NOT NULL,
    "safety_card_shown" BOOLEAN NOT NULL DEFAULT false,
    "safety_card_tone" VARCHAR(20),
    "override_applied" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" VARCHAR(100),
    "processing_time_ms" INTEGER NOT NULL,
    "api_calls_made" INTEGER NOT NULL DEFAULT 0,
    "audit_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" VARCHAR(100),
    "false_positive" BOOLEAN,
    "false_negative" BOOLEAN,
    "audit_notes" TEXT,
    "auto_delete_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now() + interval '730 days',

    CONSTRAINT "ai_decision_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_performance_metrics" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "hour" SMALLINT NOT NULL,
    "crisis_detected_keyword" INTEGER NOT NULL DEFAULT 0,
    "crisis_detected_llm" INTEGER NOT NULL DEFAULT 0,
    "crisis_detected_both" INTEGER NOT NULL DEFAULT 0,
    "total_inputs_processed" INTEGER NOT NULL DEFAULT 0,
    "safety_cards_shown" INTEGER NOT NULL DEFAULT 0,
    "safety_cards_dismissed" INTEGER NOT NULL DEFAULT 0,
    "sos_button_pressed" INTEGER NOT NULL DEFAULT 0,
    "avg_processing_time_ms" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "p95_processing_time_ms" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "p99_processing_time_ms" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pathway_low_to_mid" INTEGER NOT NULL DEFAULT 0,
    "pathway_mid_to_high" INTEGER NOT NULL DEFAULT 0,
    "pathway_high_to_mid" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "mood_logs_user_id_idx" ON "mood_logs"("user_id");

-- CreateIndex
CREATE INDEX "mood_logs_pathway_idx" ON "mood_logs"("pathway");

-- CreateIndex
CREATE INDEX "mood_logs_created_at_idx" ON "mood_logs"("created_at");

-- CreateIndex
CREATE INDEX "mood_logs_auto_delete_at_idx" ON "mood_logs"("auto_delete_at");

-- CreateIndex
CREATE INDEX "tool_usage_logs_user_id_idx" ON "tool_usage_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tool_usage_logs_user_id_tool_name_key" ON "tool_usage_logs"("user_id", "tool_name");

-- CreateIndex
CREATE INDEX "journal_entries_user_id_idx" ON "journal_entries"("user_id");

-- CreateIndex
CREATE INDEX "journal_entries_created_at_idx" ON "journal_entries"("created_at");

-- CreateIndex
CREATE INDEX "journal_entries_pathway_idx" ON "journal_entries"("pathway");

-- CreateIndex
CREATE INDEX "journal_entries_auto_delete_at_idx" ON "journal_entries"("auto_delete_at");

-- CreateIndex
CREATE UNIQUE INDEX "semantic_embeddings_journal_entry_id_key" ON "semantic_embeddings"("journal_entry_id");

-- CreateIndex
CREATE INDEX "semantic_embeddings_user_id_idx" ON "semantic_embeddings"("user_id");

-- CreateIndex
CREATE INDEX "semantic_embeddings_dominant_emotion_idx" ON "semantic_embeddings"("dominant_emotion");

-- CreateIndex
CREATE INDEX "semantic_embeddings_auto_delete_at_idx" ON "semantic_embeddings"("auto_delete_at");

-- CreateIndex
CREATE INDEX "clinical_hazard_logs_user_id_idx" ON "clinical_hazard_logs"("user_id");

-- CreateIndex
CREATE INDEX "clinical_hazard_logs_trigger_type_idx" ON "clinical_hazard_logs"("trigger_type");

-- CreateIndex
CREATE INDEX "clinical_hazard_logs_severity_idx" ON "clinical_hazard_logs"("severity");

-- CreateIndex
CREATE INDEX "clinical_hazard_logs_created_at_idx" ON "clinical_hazard_logs"("created_at");

-- CreateIndex
CREATE INDEX "clinical_hazard_logs_auto_delete_at_idx" ON "clinical_hazard_logs"("auto_delete_at");

-- CreateIndex
CREATE INDEX "ai_decision_logs_user_id_idx" ON "ai_decision_logs"("user_id");

-- CreateIndex
CREATE INDEX "ai_decision_logs_session_id_idx" ON "ai_decision_logs"("session_id");

-- CreateIndex
CREATE INDEX "ai_decision_logs_timestamp_idx" ON "ai_decision_logs"("timestamp");

-- CreateIndex
CREATE INDEX "ai_decision_logs_action_taken_idx" ON "ai_decision_logs"("action_taken");

-- CreateIndex
CREATE INDEX "ai_decision_logs_keyword_gate_triggered_idx" ON "ai_decision_logs"("keyword_gate_triggered");

-- CreateIndex
CREATE INDEX "ai_decision_logs_audit_status_idx" ON "ai_decision_logs"("audit_status");

-- CreateIndex
CREATE INDEX "ai_decision_logs_auto_delete_at_idx" ON "ai_decision_logs"("auto_delete_at");

-- CreateIndex
CREATE INDEX "ai_performance_metrics_date_idx" ON "ai_performance_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ai_performance_metrics_date_hour_key" ON "ai_performance_metrics"("date", "hour");

-- CreateIndex
CREATE INDEX "crisis_interventions_user_id_idx" ON "crisis_interventions"("user_id");

-- CreateIndex
CREATE INDEX "crisis_interventions_crisis_level_idx" ON "crisis_interventions"("crisis_level");

-- CreateIndex
CREATE INDEX "crisis_interventions_auto_delete_at_idx" ON "crisis_interventions"("auto_delete_at");

-- CreateIndex
CREATE INDEX "uk_mental_health_content_pathway_idx" ON "uk_mental_health_content"("pathway");

-- CreateIndex
CREATE INDEX "uk_mental_health_content_content_type_idx" ON "uk_mental_health_content"("content_type");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_usage_logs" ADD CONSTRAINT "tool_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semantic_embeddings" ADD CONSTRAINT "semantic_embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semantic_embeddings" ADD CONSTRAINT "semantic_embeddings_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_interventions" ADD CONSTRAINT "crisis_interventions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_hazard_logs" ADD CONSTRAINT "clinical_hazard_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_hazard_logs" ADD CONSTRAINT "clinical_hazard_logs_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "crisis_interventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
