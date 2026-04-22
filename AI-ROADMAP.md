# Silent Help — Built-in AI Roadmap

> **Goal:** move Silent Help from third-party AI integrations (Gemini + OpenAI) to a **fully owned AI stack** — self-hosted open-weight models on the server, quantised small models on the device, and a fine-tuned "Silent Help AI" persona. No vendor ever sees a user's thoughts.
>
> **Theory preserved:** scope stays **companion · assessment · chat · journal · tools · SOS**. No social, no ads, **no training on user data**. Per-emotion theming, 3-step assessment, guest auth, and existing pages are untouched — every AI upgrade is additive.

---

## Why this matters

Today our AI stack looks like this:

| Feature | Provider | Where it runs |
| --- | --- | --- |
| Chat generation (streaming) | Gemini 2.5-flash → OpenAI gpt-4o-mini | Vendor cloud |
| Embeddings (RAG) | OpenAI text-embedding-3-small | Vendor cloud |
| Crisis classifier | Gemini 2.5-flash | Vendor cloud |
| Emotion resolver | Keywords + Gemini | Vendor cloud |
| CBT distortion detector | Gemini JSON | Vendor cloud |
| Affirmations | Gemini | Vendor cloud |
| Weekly digest / coach | Gemini → OpenAI | Vendor cloud |

Every user turn crosses a vendor boundary. That's the integration story we're replacing.

The new stack:

| Feature | Model | Where it runs |
| --- | --- | --- |
| Chat generation | Fine-tuned Llama 3.3 / Qwen 2.5 (Phase B+C) | **Our GPU** |
| Embeddings | BGE-small-en-v1.5 (384-dim) | **Our CPU** |
| Crisis | DistilBERT zero-shot MNLI | **Our CPU** |
| Emotion | GoEmotions RoBERTa | **Our CPU** |
| CBT distortions | Zero-shot MNLI with CBT labels | **Our CPU + browser** |
| Affirmations | Fine-tuned Silent Help model | **Our GPU** |
| Journal AI (CBT, reframe) | Gemma 2 2B / Llama 3.2 1B | **User's browser** |
| Voice in | Whisper Small | **User's browser** |
| Voice out | Piper TTS | **User's browser** |

---

## Phases

Each phase is an independent PR. Mergeable in order. Earlier phases unblock later ones.

### Phase A — Self-host the classifiers (this PR)

Replace the **high-frequency, latency-sensitive, non-generative** AI calls with small open-weight models running inside the Next.js backend via **[@huggingface/transformers](https://github.com/huggingface/transformers.js)** (ONNX Runtime, pure JS).

- **Embeddings**: `Xenova/bge-small-en-v1.5` — 384-dim, ~33 MB, CPU-only, zero-pad to existing 1536-dim pgvector column so the schema is untouched.
- **Crisis (subtle)**: `Xenova/distilbert-base-uncased-mnli` — zero-shot MNLI against the hypothesis `"This text shows suicidal ideation, self-harm intent, or acute crisis."` Confidence-gated at 0.65 (high ≥ 0.85). Keyword gate still runs first.
- **Emotion**: `Xenova/roberta-base-go_emotions` — 28-class GoEmotions, mapped into the Silent Help 6-emotion palette (anxious / overwhelmed / frustrated / sad / pressure / neutral).
- **CBT distortions**: zero-shot MNLI against 10 canonical distortion labels (catastrophising, all-or-nothing, mind-reading, fortune-telling, etc.). Replaces the flaky LLM-JSON detector.

**Feature flag**: `AI_MODE` (`local` | `cloud` | `hybrid`). Default `hybrid` — local first, cloud fallback. Flip to `local` to prove zero-integration operation.

**Cost**: ~$20-50/mo extra CPU (or zero if we co-locate with the existing Next.js dyno). **Latency**: faster than the cloud LLM equivalents (no network hop).

### Phase D (slice) — On-device CBT (this PR)

Ship **Transformers.js + WebGPU** to the frontend. Add `frontend/src/lib/ai/on-device.ts` with:

- Lazy model loader that downloads once per device (cached in `IndexedDB` by Transformers.js).
- Device-capability probe: reports `webgpu` availability, `navigator.deviceMemory`, CPU cores. Auto-picks:
  - **Gemma 2 2B** (~700 MB quantised) if WebGPU + ≥4 GB RAM, or
  - **Llama 3.2 1B** (~350 MB quantised) if WebGPU only, or
  - Falls back to a tiny classifier (`Xenova/distilbert-base-uncased-mnli`, ~70 MB, CPU) for everyone else.
- First-run "Download private AI (~350-700 MB)" consent prompt — **opt-in**, user must click.
- Wire into the Journal **Check thoughts** button: try on-device first, fall back to server only if local model unavailable or errored.

**User-visible copy**: a "Private AI" badge + `Running on your device` pill on the journal entry when the analysis ran locally. The server genuinely never sees the text when this runs.

### Phase B — Self-host the chat LLM (PR #9)

Move chat generation off Gemini/OpenAI onto a self-hosted open-weight LLM.

- **Engine**: [vLLM](https://github.com/vllm-project/vllm) behind a small FastAPI proxy, exposed over OpenAI-compatible API. Drop-in replacement — our existing `provider.ts` can point at it with one env var.
- **Candidate models** (ranked by quality for emotional conversation):
  1. **Qwen 2.5 72B Instruct** (best at nuanced emotional reasoning in open-weight class)
  2. **Llama 3.3 70B Instruct** (Meta, well-known, strong safety tuning)
  3. **Mistral Nemo 12B** (cheaper, still very capable, faster cold-start)
- **Hosting options**:
  - **RunPod / Lambda Labs** (cheapest GPU rentals, A100/H100 from ~$1.10/hr)
  - **AWS / GCP / Azure** (reserved GPUs, more expensive, enterprise-ready)
  - **Own colo** (RTX 4090 / H100 on a physical server — cheapest long-run, biggest upfront)
- **Rollout strategy**: run in **shadow mode** for 1-2 weeks — every chat turn goes to both Gemini *and* our LLM, we compare outputs offline (quality + safety), then flip the switch when satisfied.
- **Cost**: $200-800/mo depending on concurrency and model size.

### Phase C — Fine-tune Silent Help AI (PR #10)

This is the **moat**. A base Llama/Qwen is generic; Silent Help AI is tuned to our voice.

- **Base model**: whatever we pick in Phase B.
- **Method**: LoRA / QLoRA (cheap to train, easy to hot-swap, low inference overhead).
- **Training data** (public + synthetic only, never user messages):
  - [ESConv](https://github.com/thu-coai/Emotional-Support-Conversation) — 1k+ emotional support dialogues with strategy annotations.
  - [MentalChat16K](https://huggingface.co/datasets/ShenLab/MentalChat16K) — 16k mental-health counselling dialogues.
  - [PsychEval](https://huggingface.co/datasets/NLPCoreTeam/PsychEval) — psychological evaluation dialogues.
  - **Synthetic Silent Help data**: we generate ~5k (prompt, ideal response) pairs using the current Gemini setup for our 6 per-emotion personas. **Tagged as synthetic, never user-sourced.**
  - **Crisis-safe response patterns**: 500+ examples of how to respond to varying crisis signals without prescribing or diagnosing.
  - **RAG-grounded citations**: examples that demonstrate how to reference memories ("I remember you mentioned chest tightness last Tuesday") without hallucinating.
- **Training infra**: Lambda Labs / RunPod 8×A100 cluster for ~12-24 hours. One-time cost ~$500-2000.
- **Evaluation**: held-out test set from each dataset + human review of 100 curated prompts by a licensed therapist reviewer (optional but recommended).
- **Output**: `silent-help-companion-v1` LoRA weights, hot-swappable on the Phase B vLLM deployment.

### Phase E — On-device voice + multimodal (PR #11)

- **Voice in**: `Xenova/whisper-small` in the browser (~150 MB WASM). Replaces the browser Web Speech API (which sends audio to the OS/cloud).
- **Voice out**: [Piper TTS](https://github.com/rhasspy/piper) compiled to WASM; persona-tuned voices per emotion (soft, steady, gentle, validating, grounding, warm).
- **Facial emotion** (opt-in): [MediaPipe Tasks](https://ai.google.dev/edge/mediapipe) face-landmarker, already browser-native; classifies into the 6-emotion palette.
- **Voice tone** (opt-in): `Xenova/wav2vec2-emotion` — detects arousal + valence from speech.
- All strictly **opt-in**, with a one-screen "here's what runs on your device" consent flow.

### Phase 12 — Scope AI upgrades (PR #12)

Upgrade the feature surfaces the user explicitly called out.

- **Companion**: dashboard greeting adapts to today's mood trend (no new page, just smarter text).
- **Assessment**: **adaptive** — questions mutate based on prior answers so shorter and deeper. The 3-step structure stays visible to the user; internally it can be 5-7 questions with AI-driven pruning.
- **Chat**: already Phase-B LLM; add **proactive check-ins** ("how's the chest tightness today?" 3 days later from Memories).
- **Journal**: already Phase-D CBT; add **AI-written private reflection** per entry (on-device), and **semantic search** already uses local embeddings from Phase A.
- **Tools**: **AI-personalised pacing** — Box Breathing rhythm nudges toward longer exhale if anxious, symmetric if overwhelmed. Voice cues generated per-user by the on-device TTS.
- **SOS**: **proactive surfacing** — the local crisis classifier watches chat *and* journal *and* tool telemetry, and offers SOS inline before the user has to ask. Never triggers emergency services on its own.

---

## What will NOT change

- Silent Help theory and scope — still a quiet, private, AI-supported mental wellness companion.
- No social features, no ads, no data monetisation.
- **No training on user data**, ever. Even in Phase C we only use public datasets + synthetic.
- Per-emotion theming, Calm Aurora Glass, 3-step assessment, guest auth, all existing pages.

---

## Sequencing & risk

| PR | Phase | Risk | Unlocks |
| --- | --- | --- | --- |
| **#8** (this) | A + D slice | low — additive, feature-flagged, existing cloud path untouched | takes us off 4/7 cloud AI deps overnight |
| #9 | B | medium — GPU infra, cost | full self-host; deletes the OpenAI/Gemini keys |
| #10 | C | medium-high — training quality gates | "Silent Help AI" moat |
| #11 | E | medium — browser compatibility, model size | voice + multimodal without vendor |
| #12 | 12 | medium — UX for adaptive assessment and proactive SOS | the "everything is AI" story the user wants |

**Review gates** between PRs: user approves each phase before the next starts.

---

## Glossary

- **LoRA / QLoRA**: Low-Rank Adaptation. Tiny add-on weights that customise a big model without retraining the base. Cheap, reversible, easy to A/B.
- **Zero-shot classification**: Using a general NLI (entailment) model to test arbitrary labels against a text. No training needed.
- **ONNX Runtime**: Portable ML runtime that runs the same model in Node (server), browser (WASM/WebGPU), and native.
- **vLLM**: High-throughput LLM serving engine with PagedAttention; lets us serve 70B models on a single GPU.
- **RAG**: Retrieval-Augmented Generation. We already do this with pgvector; Phase A just moves the embedding step off the cloud.

