/**
 * Silent Help — on-device AI.
 *
 * Runs a small transformer *in the user's browser* via WebGPU (or WASM fallback)
 * so their private thoughts never leave the device. Used by the journal
 * "Check thoughts" button before any network call.
 *
 * Models (auto-picked by device capability):
 *   - WebGPU + deviceMemory ≥ 4 GB → Gemma 2 2B (~700 MB, q4)
 *   - WebGPU only                  → Llama 3.2 1B (~350 MB, q4)
 *   - CPU only                     → DistilBERT MNLI classifier (~70 MB)
 *
 * For CBT distortion detection we actually only need a zero-shot classifier —
 * much faster and cheaper than a generative model. We reserve the generative
 * models for future on-device features (affirmations, reframes, journaling
 * prompts).
 */

import type { CbtDistortion, CbtHit, CbtResult } from '@/lib/ai-types';

// `@huggingface/transformers` is ~5 MB; keep it out of the initial JS bundle.
type PipelineImpl = (
    task: string,
    model: string,
    options?: Record<string, unknown>,
) => Promise<unknown>;

type EnvImpl = {
    allowRemoteModels: boolean;
    allowLocalModels: boolean;
    backends: { onnx: { wasm?: { numThreads?: number } } };
};

type TxModule = { pipeline: PipelineImpl; env: EnvImpl };

// ────────────────────────────────────────────────────────────────────────────
// Capability probe
// ────────────────────────────────────────────────────────────────────────────

export interface DeviceCapability {
    webgpu: boolean;
    deviceMemoryGb: number;
    hardwareConcurrency: number;
    recommended: 'gemma-2b' | 'llama-1b' | 'distilbert-mnli';
    recommendedSizeMb: number;
}

export async function probeDevice(): Promise<DeviceCapability> {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const deviceMemoryGb = (nav as { deviceMemory?: number } | null)?.deviceMemory ?? 0;
    const hardwareConcurrency = nav?.hardwareConcurrency ?? 0;

    let webgpu = false;
    try {
        const gpu = (nav as { gpu?: { requestAdapter: () => Promise<unknown> } } | null)?.gpu;
        if (gpu) {
            const adapter = await gpu.requestAdapter();
            webgpu = Boolean(adapter);
        }
    } catch {
        webgpu = false;
    }

    let recommended: DeviceCapability['recommended'] = 'distilbert-mnli';
    let recommendedSizeMb = 70;
    if (webgpu && deviceMemoryGb >= 4) {
        recommended = 'gemma-2b';
        recommendedSizeMb = 700;
    } else if (webgpu) {
        recommended = 'llama-1b';
        recommendedSizeMb = 350;
    }

    return { webgpu, deviceMemoryGb, hardwareConcurrency, recommended, recommendedSizeMb };
}

// ────────────────────────────────────────────────────────────────────────────
// Lazy pipeline
// ────────────────────────────────────────────────────────────────────────────

interface Loaded {
    zeroShot?: unknown;
    loading: Partial<Record<'zeroShot', Promise<unknown>>>;
}

const LOADED: Loaded = { loading: {} };

let cachedModule: TxModule | null = null;
async function tx(): Promise<TxModule> {
    if (cachedModule) return cachedModule;
    const mod = (await import('@huggingface/transformers')) as unknown as TxModule;
    cachedModule = mod;
    return mod;
}

type LoadProgressEvent = { status?: string; progress?: number; file?: string };

async function loadZeroShot(onProgress?: (pct: number, msg: string) => void): Promise<unknown> {
    if (LOADED.zeroShot) return LOADED.zeroShot;
    if (LOADED.loading.zeroShot) return LOADED.loading.zeroShot;

    const p = (async () => {
        const { pipeline, env } = await tx();
        env.allowRemoteModels = true;
        env.allowLocalModels = true;
        const pipe = await pipeline(
            'zero-shot-classification',
            'Xenova/distilbert-base-uncased-mnli',
            {
                dtype: 'q8',
                progress_callback: (e: LoadProgressEvent) => {
                    if (!onProgress) return;
                    const pct = Math.round((e.progress ?? 0) * 100);
                    onProgress(pct, `${e.status ?? 'loading'} · ${e.file ?? 'model'}`);
                },
            },
        );
        return pipe;
    })();

    LOADED.loading.zeroShot = p;
    try {
        const m = await p;
        LOADED.zeroShot = m;
        return m;
    } finally {
        delete LOADED.loading.zeroShot;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// CBT distortion detection (zero-shot MNLI)
// ────────────────────────────────────────────────────────────────────────────

export const CBT_HYPOTHESES: Record<CbtDistortion, string> = {
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

export const CBT_LABELS = Object.keys(CBT_HYPOTHESES) as CbtDistortion[];

export async function detectDistortionsOnDevice(
    text: string,
    onProgress?: (pct: number, msg: string) => void,
): Promise<CbtResult> {
    const clean = (text || '').trim();
    if (clean.length < 20) return { hits: [], model: 'distilbert-mnli' };

    const pipe = await loadZeroShot(onProgress);
    const hypotheses = CBT_LABELS.map((l) => CBT_HYPOTHESES[l]);

    const out = (await (
        pipe as (
            t: string,
            labels: string[],
            o: unknown,
        ) => Promise<{ labels: string[]; scores: number[] }>
    )(clean.slice(0, 2500), hypotheses, { multi_label: true })) as {
        labels: string[];
        scores: number[];
    };

    const hits: CbtHit[] = [];
    for (let i = 0; i < out.labels.length; i++) {
        const hyp = out.labels[i];
        const score = out.scores[i];
        const label = CBT_LABELS.find((l) => CBT_HYPOTHESES[l] === hyp);
        if (!label) continue;
        if (score >= 0.55) hits.push({ label, confidence: score });
    }
    hits.sort((a, b) => b.confidence - a.confidence);
    return { hits: hits.slice(0, 4), model: 'distilbert-mnli' };
}

// ────────────────────────────────────────────────────────────────────────────
// Preload hint — let callers warm the model on idle
// ────────────────────────────────────────────────────────────────────────────

export function preloadOnDeviceAi(): void {
    if (typeof window === 'undefined') return;
    if (LOADED.zeroShot || LOADED.loading.zeroShot) return;
    const run = () => void loadZeroShot().catch(() => {});
    const ric = (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (ric) ric(run);
    else setTimeout(run, 2000);
}

export function isLoaded(): boolean {
    return Boolean(LOADED.zeroShot);
}
