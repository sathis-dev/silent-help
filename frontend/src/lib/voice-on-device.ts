/**
 * Silent Help — on-device voice transcription (Phase E slice).
 *
 * Runs Whisper-tiny.en (~40 MB, q8) entirely in the user's browser via
 * Transformers.js + WebGPU/WASM. The microphone audio never leaves the
 * device — unlike the Web Speech API, which streams audio to Google's
 * servers for recognition on Chrome.
 *
 * Load once per tab (cached in IndexedDB by the HF cache), ~3–5 s cold,
 * <500 ms warm per sentence on WebGPU.
 */

import type { PretrainedOptions } from '@huggingface/transformers';

type AsrPipeline = (
    input: Float32Array,
    options?: Record<string, unknown>,
) => Promise<{ text: string }>;

type PipelineImpl = (
    task: string,
    model: string,
    options?: PretrainedOptions & Record<string, unknown>,
) => Promise<AsrPipeline>;

type EnvImpl = {
    allowRemoteModels: boolean;
    allowLocalModels: boolean;
    backends: { onnx: { wasm?: { numThreads?: number } } };
};

type TxModule = { pipeline: PipelineImpl; env: EnvImpl };

const WHISPER_MODEL = 'Xenova/whisper-tiny.en';
const WHISPER_SIZE_MB = 40;
const TARGET_SAMPLE_RATE = 16000;

export interface VoiceOnDeviceCapability {
    mediaRecorder: boolean;
    webgpu: boolean;
    recommendedModel: typeof WHISPER_MODEL;
    recommendedSizeMb: number;
}

export async function probeVoiceOnDevice(): Promise<VoiceOnDeviceCapability> {
    const mediaRecorder = typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';

    let webgpu = false;
    try {
        const gpu = (navigator as { gpu?: { requestAdapter: () => Promise<unknown> } } | undefined)?.gpu;
        if (gpu) {
            const adapter = await gpu.requestAdapter();
            webgpu = Boolean(adapter);
        }
    } catch {
        webgpu = false;
    }

    return {
        mediaRecorder,
        webgpu,
        recommendedModel: WHISPER_MODEL,
        recommendedSizeMb: WHISPER_SIZE_MB,
    };
}

// ────────────────────────────────────────────────────────────────────────────
// Lazy Whisper pipeline
// ────────────────────────────────────────────────────────────────────────────

let cachedModule: TxModule | null = null;
async function tx(): Promise<TxModule> {
    if (cachedModule) return cachedModule;
    const mod = (await import('@huggingface/transformers')) as unknown as TxModule;
    cachedModule = mod;
    return mod;
}

interface LoadedAsr {
    asr?: AsrPipeline;
    loading?: Promise<AsrPipeline>;
}
const LOADED: LoadedAsr = {};

type LoadProgressEvent = { status?: string; progress?: number; file?: string };

async function loadAsr(onProgress?: (pct: number, msg: string) => void): Promise<AsrPipeline> {
    if (LOADED.asr) return LOADED.asr;
    if (LOADED.loading) return LOADED.loading;

    const p = (async () => {
        const { pipeline, env } = await tx();
        env.allowRemoteModels = true;
        env.allowLocalModels = true;
        const pipe = await pipeline('automatic-speech-recognition', WHISPER_MODEL, {
            dtype: 'q8',
            progress_callback: (e: LoadProgressEvent) => {
                if (!onProgress) return;
                const pct = Math.round((e.progress ?? 0) * 100);
                onProgress(pct, `${e.status ?? 'loading'} · ${e.file ?? 'whisper'}`);
            },
        });
        return pipe;
    })();

    LOADED.loading = p;
    try {
        const m = await p;
        LOADED.asr = m;
        return m;
    } finally {
        LOADED.loading = undefined;
    }
}

export function preloadVoiceOnDevice(): void {
    if (typeof window === 'undefined') return;
    const schedule =
        (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ??
        ((cb: () => void) => window.setTimeout(cb, 400));
    schedule(() => {
        loadAsr().catch(() => {
            /* pre-warm is best-effort */
        });
    });
}

export function isVoiceLoaded(): boolean {
    return Boolean(LOADED.asr);
}

// ────────────────────────────────────────────────────────────────────────────
// Audio decoding (blob → mono 16 kHz Float32)
// ────────────────────────────────────────────────────────────────────────────

async function blobToMono16k(blob: Blob): Promise<Float32Array> {
    const arrayBuf = await blob.arrayBuffer();

    // Prefer a dedicated OfflineAudioContext so we can request 16 kHz directly
    // and avoid resampling the whole clip by hand.
    const AudioCtxCtor =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) throw new Error('AudioContext unavailable');

    const tmpCtx = new AudioCtxCtor();
    let decoded: AudioBuffer;
    try {
        decoded = await tmpCtx.decodeAudioData(arrayBuf.slice(0));
    } finally {
        await tmpCtx.close().catch(() => {});
    }

    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE), TARGET_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0).slice();
}

// ────────────────────────────────────────────────────────────────────────────
// Public: transcribe a recorded blob
// ────────────────────────────────────────────────────────────────────────────

export interface TranscribeOptions {
    language?: string;
    onProgress?: (pct: number, msg: string) => void;
}

export async function transcribeOnDevice(blob: Blob, opts: TranscribeOptions = {}): Promise<string> {
    const asr = await loadAsr(opts.onProgress);
    const audio = await blobToMono16k(blob);
    const out = await asr(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: opts.language ?? 'english',
        task: 'transcribe',
    });
    return (out?.text ?? '').trim();
}
