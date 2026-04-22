# Data Residency & Cross-Border Transfers

> UK GDPR Chapter V · EU GDPR Chapter V · UK IDTA + EU SCCs.

## Primary storage

- **Postgres (+ pgvector)** — deployed in an **EU/UK region** (default
  `eu-west`, operator-configurable). No user mental-health data is stored in
  a non-adequacy jurisdiction at rest.
- **Backend runtime** — deployed in EU/UK region (Fly.io London or Frankfurt,
  or self-hosted).
- **Frontend (Vercel)** — edge CDN globally for static assets; no user data
  written at the edge.

## AI processors and transfers

Silent Help supports three deployment modes (`AI_MODE` env):

| Mode | Chat generation | Embeddings | Emotion / crisis / CBT classifier | Cross-border transfer |
|------|-----------------|------------|-----------------------------------|-----------------------|
| `local` | self-hosted LLM via `LOCAL_LLM_URL` (operator-chosen) or local fallback | self-hosted BGE-small (ONNX) | self-hosted (RoBERTa + DistilBERT-MNLI) | **none** |
| `hybrid` (default) | self-hosted if configured, else Gemini, else OpenAI | self-hosted first, else OpenAI | self-hosted first, else Gemini | UK→US for Gemini / OpenAI when local unavailable |
| `cloud` | Gemini → OpenAI fallback | OpenAI | Gemini zero-shot | UK→US |

### For UK / EU production, `AI_MODE=local` is the recommended default.

### When transfers do occur

Currently:
- **Google LLC (Gemini)** — US-based. Transfers covered by the UK→US **IDTA**
  (International Data Transfer Agreement) and Google's standard commercial
  terms, which include an opt-out from training on customer data.
- **OpenAI, LLC** — US-based. Transfers covered by **SCCs** and OpenAI's API
  terms, which also opt out of training on API input.

## Children's Code (13-17) — no transfer

When `users.child_mode = true`, every chat/assistant API call threads
`forceLocal: true` into the provider layer. The provider layer short-circuits
to the self-hosted tier (or a deterministic fallback). **No Children's Code
user's data is ever sent to Gemini or OpenAI**, regardless of `AI_MODE`.

Enforced in `backend/src/lib/ai/provider.ts`:
- `generate()` and `stream()` both compute
  `const mode = input.forceLocal ? 'local' : aiMode();`
- Both return a local fallback before any Gemini/OpenAI code path runs when
  `mode === 'local'`.

## Processors summary (same as ROPA)

| Processor | Role | Location | Transfer mechanism | Notes |
|-----------|------|----------|--------------------|-------|
| Clerk | auth | US | SCCs | minimal PII (email, id) |
| Vercel | frontend | US / EU edge | SCCs + EU region | no user mental-health data written |
| Fly.io / self-host | backend | UK / EU | — | app region configurable |
| Postgres (Neon / self-host) | primary DB | UK / EU | — | pgvector embeddings |
| Google (Gemini) | chat gen (hybrid/cloud only) | US | SCCs + IDTA | bypassed in `local` mode and for childMode users |
| OpenAI | chat gen fallback | US | SCCs | bypassed in `local` mode and for childMode users |
| Self-hosted LLM | chat gen (preferred) | operator-chosen | depends on operator | recommended for UK/EU prod |

## Operator deployment checklist

Before launching in UK/EU:

- [ ] Set `AI_MODE=local`.
- [ ] Point `LOCAL_LLM_URL` at an OpenAI-compatible endpoint hosted in UK/EU
      (vLLM, Ollama, Together EU, etc.).
- [ ] Confirm Postgres region is `eu-west-*` (or equivalent).
- [ ] Confirm backend region is UK/EU.
- [ ] Sign an SCC / IDTA with any remaining non-adequate processor (Clerk,
      Vercel) via their compliance portals.
- [ ] Record the deployment in the ROPA.

## Change log

- 2026-04-22 — initial document; `forceLocal` per-request override added to
  provider layer; Children's Code users default to zero-transfer.
