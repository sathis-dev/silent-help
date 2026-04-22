/**
 * Secondary crisis detector — a lightweight LLM zero-shot classifier that
 * catches subtle distress the keyword list misses (e.g. "I'm just done",
 * "nothing's pointing up any more"). Runs AFTER the keyword gate, and only
 * when the keyword gate returned `false` — so it never overrides or delays
 * the primary deterministic path.
 *
 * Kept deliberately conservative: we only escalate when the model is
 * reasonably confident, and we never auto-contact anyone — we just surface
 * the safety resources earlier to the UI.
 */
import { generate } from '@/lib/ai/provider';
import { logger } from '@/lib/logger';

export interface LlmCrisisVerdict {
    flagged: boolean;
    confidence: number; // 0..1
    reason: string;
}

const CLASSIFIER_SYSTEM = `You are a safety classifier inside a mental-health companion app.
Given a single user message, decide whether it shows SIGNS of suicidal
ideation, self-harm intent, or acute crisis — INCLUDING subtle or indirect
phrasing (e.g. "I'm just done", "nothing matters", "tired of being tired").

Respond with a single JSON object and nothing else:
{"flagged": true|false, "confidence": 0..1, "reason": "<<=120 chars"}

Be conservative — prefer false positives slightly over false negatives, but
require at least some signal. Do NOT flag generic stress, anger, or sadness
without a marker of hopelessness, self-harm, or giving up.`;

export async function detectSubtleCrisis(message: string, timeoutMs = 1800): Promise<LlmCrisisVerdict> {
    if (!message?.trim()) return { flagged: false, confidence: 0, reason: 'empty' };

    try {
        const race = await Promise.race([
            generate({
                system: CLASSIFIER_SYSTEM,
                turns: [{ role: 'user', content: message.slice(0, 2000) }],
                maxTokens: 120,
                temperature: 0.1,
            }),
            new Promise<'timeout'>((res) => setTimeout(() => res('timeout'), timeoutMs)),
        ]);
        if (race === 'timeout' || !race.text) {
            return { flagged: false, confidence: 0, reason: 'timeout' };
        }
        const parsed = safeParseJson(race.text);
        if (!parsed) return { flagged: false, confidence: 0, reason: 'unparseable' };
        return {
            flagged: Boolean(parsed.flagged),
            confidence: clamp01(Number(parsed.confidence) || 0),
            reason: String(parsed.reason || '').slice(0, 200),
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'crisis-llm.failed');
        return { flagged: false, confidence: 0, reason: 'error' };
    }
}

function safeParseJson(text: string): { flagged?: unknown; confidence?: unknown; reason?: unknown } | null {
    // Strip fences if the model added them
    const cleaned = text.replace(/```json|```/g, '').trim();
    // Find the first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
}

function clamp01(n: number): number {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(1, n));
}
