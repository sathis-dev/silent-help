# Security Policy

Silent Help processes special-category personal data (mental health). Security
is non-negotiable.

## Reporting a vulnerability

Email `security@silent.help` with:
- a clear reproducer,
- affected endpoint / build SHA,
- your contact for follow-up.

We aim to acknowledge within **2 business days**. Please do not publicly
disclose until we have confirmed a fix or 90 days have elapsed, whichever
comes first. We will credit reporters in release notes unless asked not to.

## Scope

In scope:
- `https://silent-help.vercel.app` (production frontend)
- `https://api.silent.help` (production backend, when launched)
- Open-source code in this repository

Out of scope:
- third-party processors (report to them directly — Clerk, Vercel, Google, OpenAI)
- denial-of-service attacks
- social engineering of staff

## Technical controls

### Authentication
- Clerk (full sign-up) or backend-signed guest JWT (7-day TTL).
- Every mutating endpoint requires `Authorization: Bearer`.
- No session stored server-side; JWTs are stateless, revocation by rotation.

### Transport
- HTTPS-only; HSTS on production.
- No HTTP endpoints served publicly.

### Storage
- Postgres with role-scoped credentials. Application role has no DDL rights.
- pgvector for embeddings; embeddings are derived, cannot reconstruct text.
- Journal body is stored plaintext today; E2E encryption (user-held key)
  planned as part of Phase D on-device AI.

### Rate limiting
- Per-user + per-endpoint token buckets (e.g. `chat: 30/min/user`,
  `me.delete: 3/min/user`). Limits documented in endpoint code.

### Audit
- Every mutating user action writes to `audit_logs` (action, resource, IP
  hash, meta JSON, timestamp).
- FK to `users` is `ON DELETE SET NULL` so the audit trail survives Art 17
  erasure — required by ICO for accountability.

### Consent
- Immutable `consent_logs` table (append-only). Grant, withdraw, retention
  change, age confirmation, child-mode enablement each logged with consent
  version, IP hash, UA. Retention: 6 years.

### Secrets
- Never committed. `.env` in `.gitignore`. Production secrets live in Vercel /
  hosting provider secret store.

### Dependencies
- `npm audit` in CI; Dependabot / Renovate recommended in production.
- ML models pinned by SHA (Transformers.js + HuggingFace).

### PII minimisation
- Birth *year* only (never DOB).
- IP hashed with SHA-256 before storage.
- No device fingerprint, no advertising id, no social graph.

### AI safety
- `AI_MODE=local` removes every third-party AI call. Enforced in
  `backend/src/lib/ai/provider.ts` via the early `mode === 'local'` guard.
- Children's Code users (13-17) set `childMode:true` server-side; every chat
  call passes `forceLocal:true`, bypassing Gemini/OpenAI regardless of
  `AI_MODE`.
- Crisis classifier is advisory — it never blocks user content, only surfaces
  resources.

## Breach response

1. Detect (logging, monitoring).
2. Contain (rotate secrets, revoke JWTs, freeze affected account).
3. Assess (what data, how many subjects).
4. Notify ICO within **72 hours** of becoming aware, if the breach is likely
   to result in a risk to rights and freedoms (UK GDPR Art 33).
5. Notify data subjects without undue delay if the risk is **high** (UK GDPR
   Art 34).
6. Post-incident review, written RCA, remediation tracked in GitHub.

## Supported versions

Latest `main` and the last tagged production release receive security fixes.
Older releases are not supported — please upgrade.
