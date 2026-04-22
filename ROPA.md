# Record of Processing Activities (ROPA)

> UK GDPR Art 30 · EU GDPR Art 30. Required for all controllers, irrespective
> of size, when processing special-category data (which Silent Help does).

## Controller

- **Name:** Silent Help
- **Contact:** `privacy@silent.help`
- **Representative (EU):** TBD prior to EU launch (Art 27 requires an EU
  representative if offering services to EU data subjects).
- **DPO:** not formally required (no large-scale public-authority processing,
  no core activity of systematic monitoring). We designate a privacy lead at
  `privacy@silent.help`.

## Processing activities

### 1. User account management

- **Purpose:** provide the companion experience under a stable identity.
- **Data subjects:** end users (13+).
- **Data categories:** Clerk user id or guest JWT subject, display name,
  optional avatar URL, optional email, birth year, region, locale.
- **Recipients:** Clerk (auth), hosting provider (Vercel for frontend, Fly /
  self-host for backend), Postgres provider (Neon / self-host).
- **Cross-border transfer:** UK → Clerk (US) under SCCs; UK → Vercel (US)
  under SCCs; EU/UK Postgres region preferred.
- **Retention:** until user deletes (Art 17) or inactive > 3 years.
- **Technical + organisational measures:** HTTPS, JWT, rate limiting, audit
  logs, `onDelete: Cascade` FKs for full erasure.

### 2. Wellness content (journal, mood, chat, clinical, safety plan)

- **Purpose:** deliver the wellness companion (chat replies, mood chart, CBT
  labels, longitudinal screener scores, safety plan recall).
- **Lawful basis:** Art 6(1)(b) contract + **Art 9(2)(a) explicit consent**.
- **Data subjects:** end users (13+).
- **Data categories:** mental-health content (see DPIA §2).
- **Recipients:**
  - Google (Gemini) — chat generation fallback when `AI_MODE=hybrid|cloud`.
    Bypassed for `childMode:true` users via `forceLocal:true`.
  - OpenAI — chat generation second fallback + legacy embeddings.
  - Self-hosted LLM (`LOCAL_LLM_URL`) when configured.
  - Postgres (with pgvector) — primary storage + RAG.
- **Cross-border transfer:** UK → US (Google, OpenAI) under SCCs + IDTA.
  See `DATA-RESIDENCY.md`.
- **Retention:** user-configurable (`forever` | `1y` | `90d`).
- **Measures:** Art 9 explicit consent at onboarding; per-user childMode flag;
  pgvector embeddings are derived, not raw text; plan for E2E encryption of
  journal body (Phase D).

### 3. Crisis detection

- **Purpose:** surface crisis resources (Samaritans, Shout, NHS 111, 999) when
  a user's own message suggests acute distress.
- **Lawful basis:** Art 6(1)(f) legitimate interest (safeguarding) + Art 9(2)(c)
  vital interests.
- **Recipients:** self-hosted DistilBERT-MNLI classifier; no data sent to third
  parties for crisis classification by default.
- **Retention:** inherits the wellness retention choice.
- **Measures:** composite keyword + zero-shot, inline SOS, Samaritans-safe copy.

### 4. Accountability (audit + consent logs)

- **Purpose:** prove lawful processing, honour SAR/erasure requests, investigate
  security incidents.
- **Lawful basis:** Art 6(1)(c) legal obligation (UK GDPR Art 5(2)).
- **Recipients:** internal only.
- **Retention:** `audit_logs` 2 years; `consent_logs` 6 years.
- **Measures:** IP SHA-256 hashed before storage; user FK on audit_logs is
  `SET NULL` on user deletion so the audit row survives for ICO review.

### 5. Device-local storage

- **Purpose:** persist guest session, country picker, accessibility preferences.
- **Lawful basis:** Art 6(1)(b) contract (strictly necessary). PECR compliant —
  no cookies for tracking, no cookies for ads.
- **Recipients:** none (stays on-device).
- **Retention:** 7 days for guest JWT; persistent until cleared for preferences.

## Processors (sub-processors)

| Processor | Role | Location | Transfer mechanism |
|-----------|------|----------|--------------------|
| Clerk | authentication | US | SCCs |
| Vercel | frontend hosting | US / EU | SCCs + EU region where available |
| Fly.io (planned) | backend hosting | UK / EU region | EU/UK region |
| Neon / self-host Postgres | primary storage | EU/UK region | — |
| Google (Gemini) | chat generation (hybrid/cloud) | US | SCCs + IDTA, commercial terms opt out of training |
| OpenAI | chat generation fallback | US | SCCs + IDTA, commercial terms opt out of training |
| Self-hosted LLM | chat generation (preferred) | operator-chosen | depends on operator |

## Data subjects

- Adults (18+)
- Teens (13-17) — subject to ICO Children's Code (strict privacy defaults,
  server-side `forceLocal:true`, no third-party AI)

Under-13s are **not permitted** on the service (age gate at `/consent`).

## Recipients outside the controller

None for direct marketing. Processors listed above are bound by DPA +
instructions to process strictly for the controller's purposes.

## Review

Reviewed on every PR that changes processors, data categories, cross-border
footprint, or retention. Last review: 2026-04-22.
