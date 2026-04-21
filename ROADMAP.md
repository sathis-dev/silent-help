# Silent Help — Roadmap

Silent Help's theory is a **private, pathway-aware mental-health companion**. Scope is deliberately narrow:

> companion · assessment · chat · journal · tools · SOS

No social features. No ads. No training on user data. Every upgrade must reinforce those promises — privacy, calm, safety — or it does not belong here.

This roadmap is split into three phases. Each phase is a merged PR (or a small stack of PRs). Phase 1 is shipping now.

---

## Phase 1 — shipped in this PR

The "Headspace-level feel" slice. Everything additive, everything optional, per-emotion theming + 3-step assessment + Calm Aurora Glass design system untouched.

- **Cognitive distortion detector (CBT)** on journal entries — LLM labels catastrophising / all-or-nothing / mind-reading / filtering / personalisation and offers a gentle reframe inline.
- **Gratitude mode** with UTC-day streak, encrypted entries at rest, curated prompts.
- **Letter to future you** — write now, sealed until a chosen delivery date (1 week → 1 year), AES-256-GCM encrypted at rest.
- **Validated clinical questionnaires** — PHQ-9 (depression) and GAD-7 (anxiety), with severity banding and explicit non-diagnostic disclaimers. PHQ-9 item 9 (self-harm ideation) ≥1 automatically surfaces SOS.
- **Daily AI affirmation** — one calm, non-performative line per day (cached per user per UTC day), falling back to a curated library if the AI provider is cold.
- **Geo-aware SOS** — localised crisis hotlines (GB · US · CA · AU · IE · NZ · IN · DE · FR) with per-country fallback and respectful tel:/sms: links.
- **Offline-first core** — service worker precaches `/`, `/sos`, `/tools`, `/offline` so Box Breathing and the crisis screen work with zero internet.
- **Accessibility controls (WCAG AAA-trending)** — quiet mode (greyscale, zero animation), OpenDyslexic font, font-size scale S/M/L/XL, forced reduced motion, high-contrast mode, haptic nudges on supported devices.
- **Memory graph** component scaffolding — visualises how themes and feelings cluster over time.
- New nav surfaces: `/gratitude`, `/letters`, `/clinical`.
- Prisma migration `20260421224500_phase1_features` adding 4 tables: `gratitude_entries`, `future_letters`, `clinical_results`, `affirmation_caches`.

---

## Phase 2 — after Phase 1 merges

Trust, reach, and multimodal intelligence.

- **True end-to-end journal encryption** — passphrase-derived client-side key, server stores only ciphertext. Biggest trust moat in this category.
- **Streaming chat (SSE)** over the unified Gemini ↔ OpenAI provider with a token-by-token renderer.
- **Voice in** (Whisper) + **voice out** (OpenAI / ElevenLabs TTS) wired into chat and the journal dictate button.
- **Proactive check-ins** — pg-boss worker on the existing `Reminder` table that gently nudges ("how's the chest tightness today?") from Memories content.
- **Multimodal emotion sensing** — optional voice-tone analysis (pace, tremor) and face-emotion on entry. Opt-in. All on-device where possible.
- **Personalised companion** — user-chosen name, tone, pace plugged into the system prompt.
- **Trajectory insight card** — "you were heavier last Tuesday than today" — private growth evidence.
- **Trusted contact** + **therapist read-only share link** (time-boxed, revocable).
- **Native iOS + Android wrap** via Capacitor — haptics, push, Face ID journal lock, home-screen widget, Siri / Android Quick Tile ("I'm anxious" → one-tap Box Breathing).
- **Apple Health / Google Fit** opt-in correlation of sleep + HR with mood.
- **i18n** via `next-intl` — English first, then ES / FR / DE / HI / PT.

---

## Phase 3 — clinical, platform, sustainability

- **FHIR export** — clinical interoperability so a user can import their own wellness history into a therapist's EHR.
- **Therapist marketplace** — vetted, sliding-scale, affordable; pure directory (no in-app therapy).
- **OpenTelemetry + Datadog** traces across the API layer.
- **Playwright E2E** in CI covering the crisis + guest flows.
- **PostHog** feature flags + (privacy-preserving) product analytics.
- **SOC 2 Type 1** readiness — most controls already exist from PR #5 (audit log, encryption at rest, rate-limiting, least-privilege DB roles).
- **HIPAA-readiness** — BAAs with providers, prompt de-identification, regional data residency (EU data stays in EU).
- **Sustainable monetisation without ads:**
  - Silent Help Pro — unlimited AI chat, voice, richer insights, clinician export (~£4.99 / mo).
  - Silent Help for Teams — workplace wellness with **admin-less privacy** (company cannot read employee data, only anonymised aggregates).
  - Silent Help Family — shared SOS contacts and safety net for partners / carers / kids.
  - Silent Help Schools — free for students, funded at the district level.
- **Dark-patterns audit** — explicit commitment: no streak-shaming, no guilt notifications, no engagement bait.

---

## What we will never do

- Social feeds, likes, follows, comments.
- Advertising.
- Training our models on user data.
- Selling or sharing wellness data with third parties.
- Redesigning away from the Calm Aurora Glass system or the 3-step assessment flow.
- Replacing `companion / assessment / chat / journal / tools / SOS` with anything else.

These are the guardrails that keep Silent Help *silent*.
