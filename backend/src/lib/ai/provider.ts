/**
 * Unified AI provider interface with automatic fallback.
 *
 * Providers:
 *   - primary: Gemini (gemini-2.5-flash) — fast, free-tier generous, used for chat + insights
 *   - fallback: OpenAI (gpt-4o-mini) — used when Gemini errors or no Gemini key
 *   - embeddings: OpenAI text-embedding-3-small (1536-dim) — primary
 *   - embeddings fallback: deterministic local hash embedding (keeps RAG functional without keys in dev)
 *
 * Callers should import the ergonomic helpers (`generate`, `stream`, `embed`)
 * rather than the provider classes directly.
 */
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { aiMode, embedLocal } from '@/lib/ai/local';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatTurn {
    role: ChatRole;
    content: string;
}

export interface GenerateInput {
    system: string;
    turns: ChatTurn[];
    maxTokens?: number;
    temperature?: number;
}

export interface GenerateResult {
    text: string;
    provider: 'gemini' | 'openai' | 'fallback';
}

export interface StreamChunk {
    content: string;
    done: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Provider availability
// ────────────────────────────────────────────────────────────────────────────

export function hasGemini(): boolean {
    return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);
}
export function hasOpenAI(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
}

const EMBED_DIM = 1536;
const EMBED_MODEL_OPENAI = 'text-embedding-3-small';
const EMBED_MODEL_FALLBACK = 'deterministic-hash-v1';

let _openai: OpenAI | null = null;
function openai(): OpenAI {
    if (_openai) return _openai;
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
    return _openai;
}

let _gemini: GoogleGenAI | null = null;
function gemini(): GoogleGenAI {
    if (_gemini) return _gemini;
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    _gemini = new GoogleGenAI({ apiKey: key });
    return _gemini;
}

// ────────────────────────────────────────────────────────────────────────────
// Non-streaming generation (used for coach suggestions, digests, etc.)
// ────────────────────────────────────────────────────────────────────────────

export async function generate(input: GenerateInput): Promise<GenerateResult> {
    const maxTokens = input.maxTokens ?? 600;
    const temperature = input.temperature ?? 0.7;

    // Try Gemini first
    if (hasGemini()) {
        try {
            const contents = toGeminiContents(input.turns);
            const r = await gemini().models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction: input.system,
                    maxOutputTokens: maxTokens,
                    temperature,
                },
            });
            const text = extractGeminiText(r) || '';
            if (text) return { text, provider: 'gemini' };
            logger.warn('ai.generate.gemini_empty_fallback_openai');
        } catch (e) {
            logger.warn({ err: String(e) }, 'ai.generate.gemini_failed');
        }
    }

    // Fall back to OpenAI
    if (hasOpenAI()) {
        try {
            const messages = [
                { role: 'system' as const, content: input.system },
                ...input.turns.map((t) => ({ role: t.role, content: t.content })),
            ];
            const r = await openai().chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: maxTokens,
                temperature,
            });
            return { text: r.choices[0]?.message?.content?.trim() || '', provider: 'openai' };
        } catch (e) {
            logger.warn({ err: String(e) }, 'ai.generate.openai_failed');
        }
    }

    // Nothing configured — return a soft, honest fallback
    return {
        text: "I'm here with you. AI companions are temporarily offline, but your words still matter.",
        provider: 'fallback',
    };
}

// ────────────────────────────────────────────────────────────────────────────
// Streaming generation (chat)
// ────────────────────────────────────────────────────────────────────────────

export async function* stream(input: GenerateInput): AsyncGenerator<StreamChunk> {
    const maxTokens = input.maxTokens ?? 1000;
    const temperature = input.temperature ?? 0.7;

    // ── Gemini ──
    if (hasGemini()) {
        try {
            const contents = toGeminiContents(input.turns);
            const s = (await gemini().models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction: input.system,
                    maxOutputTokens: maxTokens,
                    temperature,
                },
            })) as unknown as AsyncGenerator<unknown>;
            while (true) {
                const { value, done } = await s.next();
                if (done) break;
                const text = extractGeminiText(value);
                if (text) yield { content: text, done: false };
            }
            yield { content: '', done: true };
            return;
        } catch (e) {
            logger.warn({ err: String(e) }, 'ai.stream.gemini_failed_fallback_openai');
        }
    }

    // ── OpenAI ──
    if (hasOpenAI()) {
        try {
            const messages = [
                { role: 'system' as const, content: input.system },
                ...input.turns.map((t) => ({ role: t.role, content: t.content })),
            ];
            const s = await openai().chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: maxTokens,
                temperature,
                stream: true,
            });
            for await (const chunk of s) {
                const text = chunk.choices?.[0]?.delta?.content || '';
                if (text) yield { content: text, done: false };
            }
            yield { content: '', done: true };
            return;
        } catch (e) {
            logger.warn({ err: String(e) }, 'ai.stream.openai_failed');
        }
    }

    // Fallback — stream a gentle placeholder in one chunk
    yield {
        content:
            "I'm here, and I hear you. My AI companion is resting for the moment — your words are safe and saved. Try again in a bit, or write to yourself in the journal.",
        done: false,
    };
    yield { content: '', done: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Embeddings
// ────────────────────────────────────────────────────────────────────────────

export interface EmbedResult {
    vector: number[]; // length = EMBED_DIM
    model: string;
}

export async function embed(text: string): Promise<EmbedResult> {
    const clean = text.slice(0, 8000);
    const mode = aiMode();

    // Prefer self-hosted local embeddings (bge-small-en-v1.5, 384-dim padded to 1536).
    if (mode !== 'cloud') {
        try {
            const local = await embedLocal(clean);
            if (local && Array.isArray(local.vector) && local.vector.length === EMBED_DIM) {
                return { vector: local.vector, model: local.model };
            }
        } catch (e) {
            logger.warn({ err: String(e) }, 'ai.embed.local_failed_fallback');
        }
        if (mode === 'local') {
            // In strict-local mode, fall through to hash fallback rather than cloud.
            return { vector: hashEmbed(clean), model: EMBED_MODEL_FALLBACK };
        }
    }

    // Hybrid / cloud mode: OpenAI embeddings as secondary path.
    if (hasOpenAI()) {
        try {
            const r = await openai().embeddings.create({
                model: EMBED_MODEL_OPENAI,
                input: clean,
            });
            const v = r.data[0]?.embedding;
            if (Array.isArray(v) && v.length === EMBED_DIM) {
                return { vector: v, model: EMBED_MODEL_OPENAI };
            }
        } catch (e) {
            logger.warn({ err: String(e) }, 'ai.embed.openai_failed_fallback_hash');
        }
    }

    // Deterministic hash embedding — keeps RAG working in dev without a key.
    // Uses SHA-256 over overlapping char-n-grams, distributed into EMBED_DIM buckets.
    return { vector: hashEmbed(clean), model: EMBED_MODEL_FALLBACK };
}

function hashEmbed(text: string): number[] {
    const out = new Float32Array(EMBED_DIM);
    const lower = text.toLowerCase();
    const n = 4; // 4-grams
    for (let i = 0; i <= lower.length - n; i++) {
        const gram = lower.slice(i, i + n);
        const h = crypto.createHash('sha1').update(gram).digest();
        const bucket = h.readUInt32BE(0) % EMBED_DIM;
        const sign = (h[4] & 1) === 0 ? 1 : -1;
        out[bucket] += sign;
    }
    // L2 normalise for cosine-sim compat with real embeddings
    let norm = 0;
    for (let i = 0; i < EMBED_DIM; i++) norm += out[i] * out[i];
    norm = Math.sqrt(norm) || 1;
    const arr: number[] = new Array(EMBED_DIM);
    for (let i = 0; i < EMBED_DIM; i++) arr[i] = out[i] / norm;
    return arr;
}

/** Encode a number[] as a pgvector literal string: `[0.1,0.2,...]`. */
export function toPgVector(v: number[]): string {
    return `[${v.map((x) => Number.isFinite(x) ? x.toFixed(6) : 0).join(',')}]`;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function toGeminiContents(turns: ChatTurn[]) {
    const out: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const t of turns) {
        if (t.role === 'system') continue;
        const role = t.role === 'user' ? 'user' : 'model';
        const last = out[out.length - 1];
        if (last && last.role === role) {
            last.parts[0].text += '\n\n' + t.content;
        } else {
            out.push({ role, parts: [{ text: t.content }] });
        }
    }
    // Gemini requires the first turn to be from 'user'
    if (out.length > 0 && out[0].role !== 'user') {
        out.unshift({ role: 'user', parts: [{ text: '[Conversation started]' }] });
    }
    return out;
}

function extractGeminiText(chunk: unknown): string {
    if (!chunk || typeof chunk !== 'object') return '';
    const c = chunk as {
        text?: string;
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return c.text || c.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
