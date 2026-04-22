# Online Safety Statement

> UK **Online Safety Act 2023** · ICO Children's Code · Samaritans' media
> guidelines. Silent Help is a user-to-user service (users can post their own
> journal/chat content that we process), so we take reasonable steps to
> prevent harm from illegal and priority content.

## 1. Service classification

Silent Help is a small user-to-user service with **adults and teens aged 13+**.
It has:
- no social graph (no following, no DMs between users, no public feeds),
- no search discovery of other users' content,
- no advertising, no monetisation by engagement.

Risk profile: **low** for most illegal-content categories (terrorism, CSAM,
hate, fraud) because there is no user-to-user sharing. **High** for priority
content relating to **self-harm and suicide** because users naturally discuss
these topics with the AI companion.

## 2. Illegal-content duties

- We do not host or transmit content between users. A user's own journal and
  chat transcript is visible only to them.
- Unlawful content written *into* the journal or chat is not republished.
- If a user asks the AI to produce unlawful content (CSAM, self-harm
  encouragement, hate), the system prompt and safety layer refuse and steer
  toward support resources.
- Reports can be sent to `abuse@silent.help`.

## 3. Priority-content duty: self-harm and suicide

Given the nature of the service, this is our most important safety duty.

Controls:

### 3a. Composite crisis classifier
- Keyword match against a curated high-signal list (UK-first),
- plus a self-hosted DistilBERT-MNLI zero-shot pass on every user chat turn,
- severity = `low | medium | high`.

### 3b. Inline crisis response
- When severity ≥ `medium`, the companion reply is prefixed in the system
  prompt with a safety directive: validate, never dismiss, surface Samaritans
  116 123, Shout 85258, NHS 111 (option 2), 999.
- An SSE `meta.crisis` frame is emitted so the UI can paint an inline SOS
  card before the reply lands.

### 3c. Samaritans-safe copy
Every SOS / crisis surface is reviewed against
[Samaritans media guidelines](https://www.samaritans.org/about-samaritans/media-guidelines/):
- helpline-first framing,
- no references to methods of self-harm or suicide,
- no graphic detail,
- no glamorising or sensationalising language,
- signposting to multiple support routes (helpline, text, NHS, 999).

### 3d. Dedicated SOS surface
`/sos` offers country-aware crisis resources; UK is the default panel
(Samaritans, Shout, NHS 111, 999). EU (112) and US (988) are one click away.

### 3e. Safety plan
Users can build and store a personal safety plan (`/safety-plan`) following
Stanley & Brown's evidence-based template (warning signs, internal coping,
distractions, people and places, contacts, means restriction).

## 4. Children's Code (under-18s, ages 13-17)

Mandated by ICO's Age-Appropriate Design Code. Users aged 13-17 get:
- `childMode:true` server-side flag, derived from age confirmation at `/consent`.
- **No third-party AI calls** — every chat/assistant request sets
  `forceLocal:true`, bypassing Gemini/OpenAI regardless of `AI_MODE`.
- Strict privacy defaults: retention = `90d` unless actively changed; no
  telemetry beyond what is strictly necessary.
- No dark patterns in consent UI.
- No advertising, no profiling for behavioural targeting (we do not profile
  at all).
- Clear, age-appropriate plain-language privacy explanations at `/privacy`.

Under-13s are **blocked** at the age gate (`/consent`). Age misrepresentation
cannot be prevented entirely; we use year-only age confirmation as a
reasonable proportionate control.

## 5. Reporting & escalation

- In-product: every assistant reply carries a footer link to `/sos`.
- Out-of-product: `abuse@silent.help` for content concerns,
  `privacy@silent.help` for data requests, `security@silent.help` for
  vulnerabilities.
- If a user appears in imminent danger, the product always directs to 999
  (UK) / 112 (EU) / 988 (US); we do not attempt to contact emergency services
  on the user's behalf (we do not hold enough identifiers).

## 6. Transparency

- CI / release notes document safety-relevant changes.
- DPIA, ROPA, Security Policy are public in this repository.
- Crisis classifier behaviour is described in source
  (`backend/src/services/crisisService.ts`).

## 7. Review

Reviewed at least every 6 months, and on any material change to classifier,
copy, or age-gate logic. Last review: 2026-04-22.
