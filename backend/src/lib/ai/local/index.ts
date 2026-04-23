/**
 * Silent Help — Built-in (self-hosted) AI.
 *
 * This module runs small open-weight transformer models **inside the Next.js
 * backend** via `@huggingface/transformers` (ONNX Runtime). It replaces the
 * high-frequency, latency-sensitive, non-generative calls that used to go to
 * Gemini / OpenAI:
 *
 *   - Embeddings        → Xenova/bge-small-en-v1.5      (384-dim)
 *   - Emotion resolver  → Xenova/roberta-base-go_emotions (28-class → 6)
 *   - Crisis (subtle)   → Xenova/distilbert-base-uncased-mnli (zero-shot)
 *   - CBT distortions   → Xenova/distilbert-base-uncased-mnli (zero-shot)
 *
 * All four models are CPU-only, 33–70 MB each, loaded lazily on first use
 * and cached in-process. Nothing leaves our infrastructure.
 *
 * Feature flag: `AI_MODE=local|cloud|hybrid` (default `hybrid`). In `hybrid`
 * mode we prefer local and fall back to cloud only if the local model fails
 * to load (e.g. offline CI). Set `AI_MODE=local` to prove zero-integration.
 *
 * Embedding dimension: the pgvector columns are `vector(1536)`. Our local
 * embeddings are 384-dim — we zero-pad them into the first 384 slots of a
 * 1536-float array so the schema is untouched. Cosine similarity is only
 * meaningful *within* the same embedding space; we tag the row with
 * `embeddingModel = 'bge-small-en-v1.5'` so callers can filter correctly.
 */
import { logger } from '@/lib/logger';

// We import the types eagerly but the heavy model code lazily, to keep the
// serverless cold-start cheap when AI_MODE=cloud.
type PipelineType = 'feature-extraction' | 'text-classification' | 'zero-shot-classification';

export type AiMode = 'local' | 'cloud' | 'hybrid';

export function aiMode(): AiMode {
    const v = (process.env.AI_MODE || 'hybrid').toLowerCase();
    if (v === 'local' || v === 'cloud' || v === 'hybrid') return v;
    return 'hybrid';
}

export function localAiEnabled(): boolean {
    return aiMode() !== 'cloud';
}

// ────────────────────────────────────────────────────────────────────────────
// Lazy pipeline factory
// ────────────────────────────────────────────────────────────────────────────

interface PipelineCache {
    embed?: unknown;
    emotion?: unknown;
    zeroShot?: unknown;
    loading: Partial<Record<'embed' | 'emotion' | 'zeroShot', Promise<unknown>>>;
    failed: Set<'embed' | 'emotion' | 'zeroShot'>;
}

const CACHE: PipelineCache = { loading: {}, failed: new Set() };

async function getPipeline(kind: 'embed' | 'emotion' | 'zeroShot'): Promise<unknown> {
    if (CACHE[kind]) return CACHE[kind];
    if (CACHE.failed.has(kind)) return null;
    if (CACHE.loading[kind]) return CACHE.loading[kind];

    const modelFor: Record<typeof kind, { task: PipelineType; model: string }> = {
        embed: { task: 'feature-extraction', model: 'Xenova/bge-small-en-v1.5' },
        emotion: { task: 'text-classification', model: 'Xenova/roberta-base-go_emotions' },
        zeroShot: { task: 'zero-shot-classification', model: 'Xenova/distilbert-base-uncased-mnli' },
    };

    const p = (async () => {
        const { pipeline, env } = await import('@huggingface/transformers');
        // Cache models under /tmp for serverless; in long-running dyno, default cache is fine.
        if (process.env.TRANSFORMERS_CACHE) {
            env.cacheDir = process.env.TRANSFORMERS_CACHE;
        }
        const spec = modelFor[kind];
        logger.info({ kind, model: spec.model }, 'localAi.load_start');
        const pipe = await pipeline(spec.task, spec.model, { dtype: 'q8' } as never);
        logger.info({ kind, model: spec.model }, 'localAi.load_ok');
        return pipe;
    })();

    CACHE.loading[kind] = p;
    try {
        const pipe = await p;
        CACHE[kind] = pipe;
        return pipe;
    } catch (e) {
        CACHE.failed.add(kind);
        logger.warn({ kind, err: String(e) }, 'localAi.load_failed');
        return null;
    } finally {
        delete CACHE.loading[kind];
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Embeddings — BGE-small-en-v1.5 (384-dim → zero-padded to 1536)
// ────────────────────────────────────────────────────────────────────────────

export const LOCAL_EMBED_DIM = 384;
export const LOCAL_EMBED_MODEL = 'bge-small-en-v1.5';
const CLOUD_EMBED_DIM = 1536;

export interface LocalEmbedResult {
    vector: number[]; // length = 1536 (padded; first 384 are real)
    realDim: number;
    model: string;
}

export async function embedLocal(text: string): Promise<LocalEmbedResult | null> {
    if (!localAiEnabled()) return null;
    const pipe = await getPipeline('embed');
    if (!pipe) return null;

    const clean = (text || '').slice(0, 8000);
    if (!clean) return null;

    try {
        // BGE-small recommends a `query:` prefix for retrieval queries; for
        // document-side embeddings we omit. We pass raw text here — caller
        // decides whether to prefix.
        const out = await (pipe as (t: string, o: unknown) => Promise<{ data: Float32Array | number[] }>)(clean, {
            pooling: 'mean',
            normalize: true,
        });
        const data = Array.from(out.data);
        if (data.length !== LOCAL_EMBED_DIM) {
            logger.warn({ got: data.length }, 'localAi.embed.unexpected_dim');
            return null;
        }
        // Pad to 1536 so we can reuse the existing pgvector column.
        const padded = new Array<number>(CLOUD_EMBED_DIM).fill(0);
        for (let i = 0; i < LOCAL_EMBED_DIM; i++) padded[i] = data[i];
        return { vector: padded, realDim: LOCAL_EMBED_DIM, model: LOCAL_EMBED_MODEL };
    } catch (e) {
        logger.warn({ err: String(e) }, 'localAi.embed.failed');
        return null;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Emotion — GoEmotions (28 classes) mapped into the Silent Help 6-emotion palette
// ────────────────────────────────────────────────────────────────────────────

export type SilentHelpEmotion =
    | 'anxious'
    | 'overwhelmed'
    | 'frustrated'
    | 'sad'
    | 'pressure'
    | 'neutral';

export interface EmotionResult {
    label: SilentHelpEmotion;
    confidence: number; // 0..1
    raw: { label: string; score: number }[];
    model: string;
}

// GoEmotions label → Silent Help palette.
const GOEMOTIONS_MAP: Record<string, SilentHelpEmotion> = {
    // Anxious cluster
    nervousness: 'anxious',
    fear: 'anxious',
    embarrassment: 'anxious',
    // Overwhelmed cluster
    confusion: 'overwhelmed',
    surprise: 'overwhelmed',
    // Frustrated cluster
    anger: 'frustrated',
    annoyance: 'frustrated',
    disapproval: 'frustrated',
    disgust: 'frustrated',
    // Sad cluster
    sadness: 'sad',
    grief: 'sad',
    disappointment: 'sad',
    remorse: 'sad',
    // Pressure cluster (achievement / expectation heaviness)
    desire: 'pressure',
    caring: 'pressure',
    // Neutral / warm
    neutral: 'neutral',
    approval: 'neutral',
    realization: 'neutral',
    curiosity: 'neutral',
    optimism: 'neutral',
    relief: 'neutral',
    pride: 'neutral',
    gratitude: 'neutral',
    admiration: 'neutral',
    amusement: 'neutral',
    excitement: 'neutral',
    joy: 'neutral',
    love: 'neutral',
};

export async function classifyEmotionLocal(text: string): Promise<EmotionResult | null> {
    if (!localAiEnabled()) return null;
    const pipe = await getPipeline('emotion');
    if (!pipe) return null;
    const clean = (text || '').slice(0, 2000);
    if (!clean) return null;

    try {
        const out = (await (pipe as (t: string, o: unknown) => Promise<Array<{ label: string; score: number }>>)(
            clean,
            { topk: 5 },
        )) as Array<{ label: string; score: number }>;

        // Aggregate by palette bucket.
        const buckets: Record<SilentHelpEmotion, number> = {
            anxious: 0,
            overwhelmed: 0,
            frustrated: 0,
            sad: 0,
            pressure: 0,
            neutral: 0,
        };
        for (const row of out) {
            const silent = GOEMOTIONS_MAP[row.label.toLowerCase()] ?? 'neutral';
            buckets[silent] += row.score;
        }
        const ranked = (Object.entries(buckets) as [SilentHelpEmotion, number][]).sort((a, b) => b[1] - a[1]);
        const [winner, score] = ranked[0];
        return {
            label: winner,
            confidence: Math.max(0, Math.min(1, score)),
            raw: out,
            model: 'roberta-base-go_emotions',
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'localAi.emotion.failed');
        return null;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Crisis — zero-shot MNLI
// ────────────────────────────────────────────────────────────────────────────

export interface CrisisResult {
    flagged: boolean;
    confidence: number; // 0..1
    severity: 'none' | 'low' | 'medium' | 'high';
    reason: string;
    model: string;
}

const CRISIS_HYPOTHESIS = 'This text shows suicidal ideation, self-harm intent, or acute crisis.';
const CRISIS_HIGH = 0.85;
const CRISIS_MED = 0.65;

export async function classifyCrisisLocal(text: string): Promise<CrisisResult | null> {
    if (!localAiEnabled()) return null;
    const pipe = await getPipeline('zeroShot');
    if (!pipe) return null;
    const clean = (text || '').trim().slice(0, 2000);
    if (clean.length < 10) return null;

    try {
        const out = (await (
            pipe as (
                t: string,
                labels: string[],
                o: unknown,
            ) => Promise<{ labels: string[]; scores: number[] }>
        )(clean, [CRISIS_HYPOTHESIS, 'This text is about general stress or everyday feelings.'], {
            multi_label: false,
        })) as { labels: string[]; scores: number[] };

        const idx = out.labels.findIndex((l) => l === CRISIS_HYPOTHESIS);
        const p = idx >= 0 ? out.scores[idx] : 0;
        const severity: CrisisResult['severity'] =
            p >= CRISIS_HIGH ? 'high' : p >= CRISIS_MED ? 'medium' : p >= 0.4 ? 'low' : 'none';
        return {
            flagged: p >= CRISIS_MED,
            confidence: p,
            severity,
            reason: p >= CRISIS_MED ? 'mnli_entailment' : 'below_threshold',
            model: 'distilbert-mnli',
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'localAi.crisis.failed');
        return null;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// CBT distortions — zero-shot MNLI against canonical labels
// ────────────────────────────────────────────────────────────────────────────

export const CBT_DISTORTIONS = [
    'catastrophising',
    'all-or-nothing thinking',
    'mind reading',
    'fortune telling',
    'overgeneralisation',
    'personalisation',
    'emotional reasoning',
    'should statements',
    'labelling',
    'disqualifying the positive',
] as const;
export type CbtDistortion = (typeof CBT_DISTORTIONS)[number];

export interface CbtHit {
    label: CbtDistortion;
    confidence: number;
    excerpt?: string;
}
export interface CbtResult {
    hits: CbtHit[];
    model: string;
}

// MNLI hypotheses phrased in plain English — better entailment than the label alone.
const CBT_HYPOTHESES: Record<CbtDistortion, string> = {
    catastrophising: 'The writer assumes the worst possible outcome will happen.',
    'all-or-nothing thinking': 'The writer frames things as always/never or total failure/success.',
    'mind reading': 'The writer assumes they know what someone else is thinking without evidence.',
    'fortune telling': 'The writer predicts a negative future outcome as if it is certain.',
    overgeneralisation: 'The writer generalises a single event into an always-true pattern.',
    personalisation: 'The writer blames themselves for things outside their control.',
    'emotional reasoning': 'The writer treats a feeling as proof that it is factually true.',
    'should statements': 'The writer uses should, must, or ought in a self-critical way.',
    labelling: 'The writer assigns themselves or someone else a negative global label.',
    'disqualifying the positive': 'The writer dismisses or discounts positive experiences.',
};

export async function classifyDistortionsLocal(text: string): Promise<CbtResult | null> {
    if (!localAiEnabled()) return null;
    const pipe = await getPipeline('zeroShot');
    if (!pipe) return null;
    const clean = (text || '').trim().slice(0, 2500);
    if (clean.length < 20) return { hits: [], model: 'distilbert-mnli' };

    try {
        const hypotheses = CBT_DISTORTIONS.map((d) => CBT_HYPOTHESES[d]);
        const out = (await (
            pipe as (
                t: string,
                labels: string[],
                o: unknown,
            ) => Promise<{ labels: string[]; scores: number[] }>
        )(clean, hypotheses, { multi_label: true })) as { labels: string[]; scores: number[] };

        // Map each hypothesis score back to its distortion label.
        const hits: CbtHit[] = [];
        for (let i = 0; i < out.labels.length; i++) {
            const hyp = out.labels[i];
            const score = out.scores[i];
            const distortion = (Object.keys(CBT_HYPOTHESES) as CbtDistortion[]).find(
                (k) => CBT_HYPOTHESES[k] === hyp,
            );
            if (!distortion) continue;
            if (score >= 0.55) {
                hits.push({ label: distortion, confidence: score });
            }
        }
        hits.sort((a, b) => b.confidence - a.confidence);
        return { hits: hits.slice(0, 4), model: 'distilbert-mnli' };
    } catch (e) {
        logger.warn({ err: String(e) }, 'localAi.cbt.failed');
        return null;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Health reporting
// ────────────────────────────────────────────────────────────────────────────

export interface LocalAiHealth {
    mode: AiMode;
    models: {
        embed: { name: string; dim: number; loaded: boolean };
        emotion: { name: string; loaded: boolean };
        zeroShot: { name: string; loaded: boolean };
    };
    failed: string[];
}

export function localAiHealth(): LocalAiHealth {
    return {
        mode: aiMode(),
        models: {
            embed: { name: LOCAL_EMBED_MODEL, dim: LOCAL_EMBED_DIM, loaded: Boolean(CACHE.embed) },
            emotion: { name: 'roberta-base-go_emotions', loaded: Boolean(CACHE.emotion) },
            zeroShot: { name: 'distilbert-base-uncased-mnli', loaded: Boolean(CACHE.zeroShot) },
        },
        failed: Array.from(CACHE.failed),
    };
}
