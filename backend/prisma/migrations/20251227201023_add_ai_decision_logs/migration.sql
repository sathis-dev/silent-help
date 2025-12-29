-- AlterTable
ALTER TABLE "ai_decision_logs" ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '730 days';

-- AlterTable
ALTER TABLE "clinical_hazard_logs" ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '365 days';

-- AlterTable
ALTER TABLE "crisis_interventions" ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '7 days';

-- AlterTable
ALTER TABLE "journal_entries" ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '30 days';

-- AlterTable
ALTER TABLE "mood_logs" ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '30 days';

-- AlterTable
ALTER TABLE "semantic_embeddings" ALTER COLUMN "auto_delete_at" SET DEFAULT now() + interval '30 days';
