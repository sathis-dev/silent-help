-- Phase 1 features: gratitude, future letters, clinical questionnaires, daily affirmations

-- CreateTable
CREATE TABLE "gratitude_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "cipher_text" TEXT,
    "day_key" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "future_letters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "cipher_text" TEXT,
    "deliver_at" TIMESTAMPTZ(6) NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "future_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_results" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "instrument" VARCHAR(16) NOT NULL,
    "score" SMALLINT NOT NULL,
    "severity" VARCHAR(32) NOT NULL,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affirmation_caches" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "day_key" VARCHAR(10) NOT NULL,
    "content" TEXT NOT NULL,
    "tone" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affirmation_caches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gratitude_entries_user_id_created_at_idx" ON "gratitude_entries"("user_id", "created_at");
CREATE INDEX "gratitude_entries_user_id_day_key_idx" ON "gratitude_entries"("user_id", "day_key");
CREATE INDEX "future_letters_user_id_deliver_at_idx" ON "future_letters"("user_id", "deliver_at");
CREATE INDEX "clinical_results_user_id_instrument_created_at_idx" ON "clinical_results"("user_id", "instrument", "created_at");
CREATE UNIQUE INDEX "affirmation_caches_user_id_day_key_key" ON "affirmation_caches"("user_id", "day_key");

-- AddForeignKey
ALTER TABLE "gratitude_entries" ADD CONSTRAINT "gratitude_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "future_letters" ADD CONSTRAINT "future_letters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clinical_results" ADD CONSTRAINT "clinical_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "affirmation_caches" ADD CONSTRAINT "affirmation_caches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
