/**
 * Composite crisis detector.
 *
 *   1. Keyword gate (fast, deterministic) — always runs first.
 *   2. LLM zero-shot classifier — only runs if keyword gate said "no" AND
 *      the text is long enough to be ambiguous. Never overrides a "yes".
 *
 * Backwards-compatible: existing code keeps importing `checkForCrisis` from
 * `@/lib/crisis`; new code can opt into the enriched async version.
 */
import { checkForCrisis as keywordCheck } from '@/lib/crisis';
import { detectSubtleCrisis } from '@/lib/ai/crisis-llm';
import { aiMode, classifyCrisisLocal } from '@/lib/ai/local';

export interface CompositeCrisisResult {
    isCrisis: boolean;
    severity: 'none' | 'low' | 'medium' | 'high';
    source: 'keyword' | 'local' | 'llm' | 'none';
    matchedKeywords: string[];
    llmConfidence: number;
    reason: string;
}

export async function checkForCrisisEnriched(text: string): Promise<CompositeCrisisResult> {
    const kw = keywordCheck(text);
    if (kw.isCrisis) {
        return {
            isCrisis: true,
            severity: kw.severity,
            source: 'keyword',
            matchedKeywords: kw.matchedKeywords,
            llmConfidence: 1,
            reason: 'keyword_match',
        };
    }

    // Ambiguity heuristic: short messages or clearly benign get no classifier call.
    if (!text || text.length < 12) {
        return {
            isCrisis: false,
            severity: 'none',
            source: 'none',
            matchedKeywords: [],
            llmConfidence: 0,
            reason: 'short_or_empty',
        };
    }

    const mode = aiMode();

    // Preferred: self-hosted zero-shot MNLI classifier (fast, CPU, no vendor).
    if (mode !== 'cloud') {
        try {
            const local = await classifyCrisisLocal(text);
            if (local) {
                if (local.flagged) {
                    return {
                        isCrisis: true,
                        severity: local.severity === 'none' ? 'low' : local.severity,
                        source: 'local',
                        matchedKeywords: [],
                        llmConfidence: local.confidence,
                        reason: local.reason,
                    };
                }
                // Local says not-crisis. In strict-local mode, trust it.
                if (mode === 'local') {
                    return {
                        isCrisis: false,
                        severity: 'none',
                        source: 'none',
                        matchedKeywords: [],
                        llmConfidence: local.confidence,
                        reason: local.reason,
                    };
                }
                // Hybrid mode: let the cloud LLM be a quieter second-opinion below.
            }
        } catch {
            // fall through to cloud
        }
    }

    const llm = await detectSubtleCrisis(text);
    const flagged = llm.flagged && llm.confidence >= 0.65;
    return {
        isCrisis: flagged,
        severity: flagged ? (llm.confidence >= 0.85 ? 'high' : 'medium') : 'none',
        source: flagged ? 'llm' : 'none',
        matchedKeywords: [],
        llmConfidence: llm.confidence,
        reason: llm.reason,
    };
}

export { keywordCheck };
