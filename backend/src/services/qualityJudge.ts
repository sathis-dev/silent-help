/**
 * Post-generation quality judge for chat v2.
 *
 * A compact, structured re-read of the draft assistant reply against our
 * non-negotiables. Cheap to run, huge quality + safety lift.
 *
 * Checks:
 *  1. Samaritans-safe — no method references, no graphic detail,
 *     helpline-first framing when distress is present.
 *  2. MHRA boundary — no diagnosis, no prescription, no "you have X".
 *  3. Empathy — validates feelings before offering suggestions.
 *  4. Length — under ~1800 chars (soft cap).
 *
 * If the draft fails, we patch it with a deterministic prefix/suffix so the
 * user still gets a reply. We intentionally do not regenerate on every fail —
 * that would blow the latency budget.
 */

const METHOD_WORDS = [
    'overdose',
    'pills ',
    'hang myself',
    'hang yourself',
    'bridge',
    'rope',
    'razor',
    'bleach',
    'cut myself',
    'cut yourself',
    'gun',
    'shoot myself',
    'shoot yourself',
];

const DIAGNOSTIC_TRIGGERS = [
    /\byou have (depression|anxiety|ptsd|bipolar|adhd|ocd|schizophrenia)\b/i,
    /\bi diagnose you\b/i,
    /\byou are (depressed|anxious|bipolar)\b/i,
    /\btake (\d+\s?)?(mg|tablets|pills|medication)\b/i,
    /\bprescri(be|ption)\b/i,
];

const EMPATHY_MIN_OPENERS = [
    'i hear you',
    'it makes sense',
    'that sounds',
    'i can',
    'thank you for',
    'i appreciate',
    'i understand',
    'i know',
    'that must',
    'sitting with',
    'i hear',
    'that is',
    "that's",
    'what you',
];

export interface JudgeReport {
    ok: boolean;
    issues: string[];
    patch?: { prefix?: string; suffix?: string };
    samaritansSafe: boolean;
    mhraSafe: boolean;
    empathetic: boolean;
    lengthOk: boolean;
}

export function judgeReply(params: {
    reply: string;
    crisis: boolean;
}): JudgeReport {
    const reply = params.reply || '';
    const replyLower = reply.toLowerCase();

    const hasMethod = METHOD_WORDS.some((w) => replyLower.includes(w));
    const diagHit = DIAGNOSTIC_TRIGGERS.some((re) => re.test(reply));
    const firstParaLower = replyLower.split(/\n\n/)[0]?.slice(0, 180) ?? '';
    const hasEmpathyOpener = EMPATHY_MIN_OPENERS.some((o) => firstParaLower.includes(o));
    const lengthOk = reply.length <= 1800;

    const issues: string[] = [];
    if (hasMethod) issues.push('method-reference');
    if (diagHit) issues.push('diagnostic-language');
    if (!hasEmpathyOpener && reply.length > 60) issues.push('no-empathy-opener');
    if (!lengthOk) issues.push('length');

    // Build a deterministic patch — we don't regenerate, we wrap.
    const patch: { prefix?: string; suffix?: string } = {};
    if (params.crisis) {
        patch.suffix =
            '\n\nIf you are in crisis right now, please reach out: **Samaritans** 116 123 (free, 24/7), **Shout** text "SHOUT" to 85258, **NHS 111** option 2, or **999** in an emergency. You are not alone.';
    }
    if (diagHit) {
        patch.prefix =
            "*A quick note: I'm a companion, not a clinician — I can listen and reflect, but anything that sounds like a diagnosis or medical advice should come from a GP or therapist.*\n\n";
    }
    if (!hasEmpathyOpener && reply.length > 60 && !params.crisis) {
        patch.prefix = (patch.prefix ?? '') + 'Thank you for sharing this with me.\n\n';
    }

    return {
        ok: issues.length === 0,
        issues,
        patch: Object.keys(patch).length > 0 ? patch : undefined,
        samaritansSafe: !hasMethod,
        mhraSafe: !diagHit,
        empathetic: hasEmpathyOpener || reply.length <= 60,
        lengthOk,
    };
}

export function applyPatch(reply: string, patch: JudgeReport['patch']): string {
    if (!patch) return reply;
    let out = reply;
    if (patch.prefix) out = patch.prefix + out;
    if (patch.suffix) out = out + patch.suffix;
    return out;
}
