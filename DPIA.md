# Data Protection Impact Assessment (DPIA)

> UK GDPR Art 35 · EU GDPR Art 35 · ICO "high-risk processing" guidance.
> Silent Help processes **special-category personal data** (mental-health signals:
> mood, journal, chat), so a DPIA is mandatory before launch and must be kept
> up to date.

## 1. Project summary

Silent Help is a self-help wellness companion. It is **not** a medical device,
it does **not** diagnose, treat, cure, or monitor any condition, and it is
**not** a replacement for therapy.

Core surfaces:
- 3-step onboarding assessment (non-diagnostic screener)
- Chat companion (emotion-aware persona, streaming reply)
- Journal (plain or CBT-distortion-labelled)
- Mood check-in (5-point scale, optional note)
- Tools (box breathing, TIPP, 5-4-3-2-1, urge surfing, gratitude, future letters)
- SOS screen (crisis resources, per-country picker)
- Clinical check-ins (PHQ-9 · GAD-7 — non-diagnostic screeners)

## 2. Data categories

| Category | Examples | Lawful basis | Special-category? |
|----------|----------|--------------|-------------------|
| Account identifier | Clerk user id, guest JWT subject, display name | Art 6(1)(b) contract | no |
| Mood log | emoji, 1-5 score, short note | Art 6(1)(b) contract + **Art 9(2)(a) explicit consent** | yes — mental health |
| Journal entry | long-form text, CBT labels | Art 6(1)(b) contract + **Art 9(2)(a) explicit consent** | yes — mental health |
| Chat transcript | user + assistant messages, provider tier used | Art 6(1)(b) contract + **Art 9(2)(a) explicit consent** | yes — mental health |
| Clinical screener | PHQ-9, GAD-7 answers + scores | Art 6(1)(b) contract + **Art 9(2)(a) explicit consent** | yes — mental health |
| Safety plan | warning signs, coping steps, contacts | Art 6(1)(b) contract + **Art 9(2)(a) explicit consent** + Art 9(2)(c) vital interests | yes — mental health |
| Age confirmation | birth year only (no DOB) | Art 6(1)(c) legal obligation (Children's Code) | no |
| Consent log | grant/withdraw events, IP hash, UA | Art 6(1)(c) legal obligation | no |
| Audit log | action, resource, IP hash | Art 6(1)(f) legitimate interest (security + accountability) | no |
| Device-local storage | guest token, country code, a11y preferences | Art 6(1)(a) consent (strictly necessary — PECR) | no |

Data minimisation: we do **not** collect DOB (year only), real name is optional,
email is only collected on full sign-up, no social graph, no device fingerprint,
no advertising identifier.

## 3. Processing purposes

- Deliver the wellness companion experience (chat, journal, mood, tools).
- Retrieval-augmented generation (RAG) — user's *own* past journal/chat turns
  are used to make replies feel continuous. No other user's data is ever used.
- Crisis detection — self-hosted DistilBERT-MNLI zero-shot classifier runs on
  every user turn; `AI_MODE=local` keeps this entirely on our infrastructure.
- Accountability — audit log + consent log for SAR/erasure evidence.

**No training on user data.** Our fine-tune corpus (planned Phase C) uses only
public CBT datasets (ESConv, MentalChat, PsychEval) + synthetic data. User
messages are never exported to model training.

## 4. Necessity & proportionality

- Each data point has a direct purpose: mood → mood chart, journal → CBT
  reflection, chat → companion reply, clinical → longitudinal score trend.
- Retention is **user-configurable** (see §7). "Keep forever" is allowed only
  as an *explicit* opt-in (ICO guidance).
- Data minimisation: birth year only, not DOB; IP is SHA-256 hashed before
  storage; device identifiers are not collected.

## 5. Risks & mitigations

| Risk | Likelihood | Severity | Mitigation |
|------|-----------|----------|------------|
| Unauthorised access to journal/chat | low | high | HTTPS-only, JWT auth, rate limiting, audit log, `onDelete: Cascade` on user, encryption at rest (planned E2E for journal) |
| Cross-border transfer to US AI providers (Gemini, OpenAI) | medium | medium | `AI_MODE=local` removes transfer entirely; when hybrid/cloud, use SCCs + IDTA. See `DATA-RESIDENCY.md` |
| Child (13-17) data leaked to third-party AI | low | high | Server-side `childMode:true` flag forces `forceLocal:true` per-request, bypassing any vendor call regardless of `AI_MODE` |
| Crisis false-negative | medium | high | Composite classifier (keyword + LLM), always-on inline SOS, Samaritans-safe copy |
| Re-identification from long-form text | low | medium | No cross-user analytics, user controls retention + export + erasure |
| Provider training on our prompts | low | high | Google/OpenAI commercial terms opt out of training; prefer `AI_MODE=local` for highest assurance |
| Crisis copy causing harm (method-suggestion) | low | critical | Samaritans media-guideline audit on every SOS surface; no method references ever |

## 6. Data subject rights (UK GDPR Art 12-22)

All rights implemented in-app at `/settings/data`:
- **Art 15 access** — GET `/api/me/export` (full JSON export)
- **Art 16 rectification** — edit in-app
- **Art 17 erasure** — DELETE `/api/me` (hard delete, cascades all related rows)
- **Art 18 restriction** — withdraw consent at `/settings/data` (DELETE `/api/consent`)
- **Art 20 portability** — same JSON export as Art 15
- **Art 21 object** — withdraw consent removes all non-essential processing
- **Art 22 automated decision-making** — crisis classifier is *supportive*,
  never blocks users from content; it surfaces resources, not decisions

SAR turnaround: immediate (self-service). Complaints route: `privacy@silent.help`
first, then ICO (UK) or lead EU supervisory authority.

## 7. Retention

Per user choice recorded in `users.retention_policy`:

- `forever` — default (explicit opt-in), kept until user deletes
- `1y` — auto-purge journal/chat/mood > 365 days
- `90d` — auto-purge journal/chat/mood > 90 days

Non-negotiable retention:
- `audit_logs` — 2 years (ICO accountability). FK is `SET NULL` on user delete.
- `consent_logs` — 6 years (UK statutory limitation). Cascades with user.

## 8. Cross-border transfers

See `DATA-RESIDENCY.md` for full analysis. Summary:
- Primary Postgres: EU/UK region.
- When `AI_MODE=local` + `LOCAL_LLM_URL` set → **no cross-border transfer**.
- When `AI_MODE=hybrid` (default) → transfers to Google (Gemini) and OpenAI
  under SCCs + IDTA. Children's Code users are bypassed via `forceLocal:true`.

## 9. DPO / contact

Controller: Silent Help. Contact: `privacy@silent.help`.
Supervisory authority: ICO (UK) — <https://ico.org.uk/make-a-complaint/>.

## 10. Review

This DPIA is reviewed on every substantial change to:
- data categories collected
- processors used (AI vendors, hosting)
- cross-border transfer footprint
- retention defaults
- age-gate thresholds

Last review: 2026-04-22. Next review: on PR #11 or 6 months, whichever first.
