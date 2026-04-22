-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "energy" VARCHAR(20) NOT NULL,
    "concern" VARCHAR(50) NOT NULL,
    "context" VARCHAR(50) NOT NULL,
    "approach" VARCHAR(50) NOT NULL,
    "support_style" VARCHAR(50) NOT NULL,
    "time_available" VARCHAR(10) NOT NULL,
    "profile" JSONB NOT NULL,
    "ai_insight" TEXT NOT NULL,
    "adaptive_answers" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wellness_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_questions" (
    "id" UUID NOT NULL,
    "step_number" SMALLINT NOT NULL,
    "route_group" VARCHAR(20) NOT NULL,
    "question_text" TEXT NOT NULL,
    "answer_a_text" TEXT NOT NULL,
    "meaning_a" VARCHAR(100) NOT NULL,
    "next_route_a" VARCHAR(50) NOT NULL,
    "score_dim_a" VARCHAR(20) NOT NULL,
    "score_val_a" SMALLINT NOT NULL,
    "safety_flag_a" VARCHAR(30) NOT NULL DEFAULT 'none',
    "emotion_signals_a" JSONB,
    "answer_b_text" TEXT NOT NULL,
    "meaning_b" VARCHAR(100) NOT NULL,
    "next_route_b" VARCHAR(50) NOT NULL,
    "score_dim_b" VARCHAR(20) NOT NULL,
    "score_val_b" SMALLINT NOT NULL,
    "safety_flag_b" VARCHAR(30) NOT NULL DEFAULT 'none',
    "emotion_signals_b" JSONB,
    "answer_c_text" TEXT NOT NULL,
    "meaning_c" VARCHAR(100) NOT NULL,
    "next_route_c" VARCHAR(50) NOT NULL,
    "score_dim_c" VARCHAR(20) NOT NULL,
    "score_val_c" SMALLINT NOT NULL,
    "safety_flag_c" VARCHAR(30) NOT NULL DEFAULT 'none',
    "emotion_signals_c" JSONB,
    "answer_d_text" TEXT,
    "meaning_d" VARCHAR(100),
    "next_route_d" VARCHAR(50),
    "score_dim_d" VARCHAR(20),
    "score_val_d" SMALLINT,
    "safety_flag_d" VARCHAR(30),
    "emotion_signals_d" JSONB,
    "answer_e_text" TEXT,
    "meaning_e" VARCHAR(100),
    "next_route_e" VARCHAR(50),
    "score_dim_e" VARCHAR(20),
    "score_val_e" SMALLINT,
    "safety_flag_e" VARCHAR(30),
    "emotion_signals_e" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "mood" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mood" VARCHAR(50) NOT NULL,
    "intensity" SMALLINT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_states" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_archetype" VARCHAR(100) NOT NULL,
    "emotional_trajectory" JSONB NOT NULL,
    "session_count" INTEGER NOT NULL DEFAULT 0,
    "last_crisis_flag" TIMESTAMPTZ(6),
    "coping_strength" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "engagement_pattern" JSONB NOT NULL DEFAULT '{}',
    "context_window" JSONB NOT NULL DEFAULT '[]',
    "computed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_usage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tool_id" VARCHAR(50) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "duration" SMALLINT,
    "mood_before" SMALLINT,
    "mood_after" SMALLINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wellness_profiles_user_id_key" ON "wellness_profiles"("user_id");

-- CreateIndex
CREATE INDEX "assessment_questions_step_number_route_group_idx" ON "assessment_questions"("step_number", "route_group");

-- CreateIndex
CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "conversations_updated_at_idx" ON "conversations"("updated_at");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "journal_entries_user_id_idx" ON "journal_entries"("user_id");

-- CreateIndex
CREATE INDEX "journal_entries_created_at_idx" ON "journal_entries"("created_at");

-- CreateIndex
CREATE INDEX "mood_logs_user_id_idx" ON "mood_logs"("user_id");

-- CreateIndex
CREATE INDEX "mood_logs_created_at_idx" ON "mood_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_states_user_id_key" ON "user_states"("user_id");

-- CreateIndex
CREATE INDEX "tool_usage_user_id_idx" ON "tool_usage"("user_id");

-- CreateIndex
CREATE INDEX "tool_usage_tool_id_idx" ON "tool_usage"("tool_id");

-- CreateIndex
CREATE INDEX "tool_usage_created_at_idx" ON "tool_usage"("created_at");

-- AddForeignKey
ALTER TABLE "wellness_profiles" ADD CONSTRAINT "wellness_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_states" ADD CONSTRAINT "user_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
