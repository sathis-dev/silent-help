-- UK + EU + global compliance foundation (UK GDPR Art 9, ICO Children's Code,
-- retention opt-in, region/locale hints, immutable consent log).

ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "birth_year"       SMALLINT,
    ADD COLUMN IF NOT EXISTS "child_mode"       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "consented_at"     TIMESTAMPTZ(6),
    ADD COLUMN IF NOT EXISTS "consent_version"  VARCHAR(16),
    ADD COLUMN IF NOT EXISTS "retention_policy" VARCHAR(16),
    ADD COLUMN IF NOT EXISTS "region"           VARCHAR(2),
    ADD COLUMN IF NOT EXISTS "locale"           VARCHAR(10);

CREATE TABLE IF NOT EXISTS "consent_logs" (
    "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
    "user_id"          UUID          NOT NULL,
    "event"            VARCHAR(32)   NOT NULL,
    "consent_version"  VARCHAR(16)   NOT NULL,
    "retention"        VARCHAR(16),
    "ip_hash"          VARCHAR(64),
    "user_agent"       VARCHAR(500),
    "created_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "consent_logs_user_fk"
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "consent_logs_user_created_idx"
    ON "consent_logs" ("user_id", "created_at");

-- audit_logs.user_id: switch Cascade → Set Null so the audit trail survives
-- an Art 17 erasure (ICO accountability requires proof the erasure happened).
DO $$
DECLARE
    fk_name TEXT;
BEGIN
    SELECT conname INTO fk_name
    FROM pg_constraint
    WHERE conrelid = 'audit_logs'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) ILIKE '%REFERENCES users%';
    IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE audit_logs DROP CONSTRAINT %I', fk_name);
    END IF;
END $$;

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;

