CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stress_level" TEXT DEFAULT 'mid',
    "crisis_contacts" JSONB,
    "accessibility_preferences" JSONB,
    "data_retention_days" INTEGER NOT NULL DEFAULT 30,
    "allow_ai_training" BOOLEAN NOT NULL DEFAULT false,
    "last_consent_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crisis_interventions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "crisisLevel" TEXT NOT NULL,
    "detected_keywords" TEXT[],
    "user_input" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "nhs_111_redirected" BOOLEAN NOT NULL DEFAULT false,
    "samaritans_redirected" BOOLEAN NOT NULL DEFAULT false,
    "emergency_called" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auto_delete_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crisis_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uk_mental_health_content" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uk_mental_health_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "crisis_interventions_user_id_idx" ON "crisis_interventions"("user_id");

-- AddForeignKey
ALTER TABLE "crisis_interventions" ADD CONSTRAINT "crisis_interventions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
