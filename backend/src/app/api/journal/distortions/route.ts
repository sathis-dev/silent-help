/**
 * POST /api/journal/distortions
 * Takes a journal entry body and returns:
 *  - detected cognitive distortions (Burns/Beck list)
 *  - a gentle CBT-style reframe for each
 *  - an overall kind summary
 *
 * Stays strictly in scope — does NOT diagnose. Disclaimers enforced in the prompt.
 * Rate-limited to protect costs.
 *
 * Robustness:
 *  - Few-shot prompt keeps the LLM focused on JSON output shape.
 *  - `tryParse` accepts markdown fences, preambles, and trailing prose before giving up.
 *  - If JSON still can't be recovered, a heuristic detector runs (keyword-based) so users
 *    always get some signal instead of a silent empty-state.
 *  - On structural failure we surface `degraded:true` and `degradedReason` so the UI can
 *    explain what happened rather than showing the same "no distortions found" copy.
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { generate } from '@/lib/ai/provider';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { parseJson, z } from '@/lib/http';

const BodySchema = z.object({
    content: z.string().trim().min(10).max(8000),
});

const DISTORTION_TAXONOMY = [
    'catastrophising',
    'all_or_nothing',
    'mind_reading',
    'fortune_telling',
    'should_statements',
    'personalisation',
    'emotional_reasoning',
    'disqualifying_the_positive',
    'magnification',
    'labeling',
    'mental_filter',
    'overgeneralisation',
] as const;

type Distortion = (typeof DISTORTION_TAXONOMY)[number];

const LABEL_ALIASES: Record<string, Distortion> = {
    catastrophizing: 'catastrophising',
    catastrophising: 'catastrophising',
    catastrophize: 'catastrophising',
    'black_and_white': 'all_or_nothing',
    'black-and-white': 'all_or_nothing',
    'all_or_nothing_thinking': 'all_or_nothing',
    'allornothing': 'all_or_nothing',
    mindreading: 'mind_reading',
    'mind-reading': 'mind_reading',
    fortunetelling: 'fortune_telling',
    'fortune-telling': 'fortune_telling',
    'should': 'should_statements',
    personalization: 'personalisation',
    personalisation: 'personalisation',
    emotional_reasoning: 'emotional_reasoning',
    disqualifying_positive: 'disqualifying_the_positive',
    'disqualifying-the-positive': 'disqualifying_the_positive',
    magnifying: 'magnification',
    minimising: 'magnification',
    minimizing: 'magnification',
    labelling: 'labeling',
    labeling: 'labeling',
    'mental-filter': 'mental_filter',
    filtering: 'mental_filter',
    overgeneralising: 'overgeneralisation',
    overgeneralization: 'overgeneralisation',
    overgeneralisation: 'overgeneralisation',
    overgeneralizing: 'overgeneralisation',
};

interface AnalysisResult {
    summary: string;
    distortions: Array<{
        label: Distortion;
        evidence: string;
        reframe: string;
    }>;
}

const SYSTEM_PROMPT = `You are Silent Help's gentle CBT analysis assistant.

Your ONLY job: read a user's journal entry and return a JSON object that identifies cognitive distortions (from the classical Burns / Beck list) and offers a warm, non-judgemental reframe for each.

RULES:
- You are NOT diagnosing. Distortions are patterns of thought, not illnesses.
- Reframes must be compassionate — never "you're wrong", always "another way to look at this might be…".
- Label a distortion if the evidence is reasonably present in the text. Err on the side of naming clear patterns rather than missing them. Return [] only if the entry is genuinely neutral or balanced.
- Keep each reframe under 220 characters.
- Taxonomy (use EXACTLY these snake_case keys): catastrophising, all_or_nothing, mind_reading, fortune_telling, should_statements, personalisation, emotional_reasoning, disqualifying_the_positive, magnification, labeling, mental_filter, overgeneralisation
- summary: one warm sentence acknowledging what the user is carrying. Max 180 chars.

OUTPUT: raw JSON only. No markdown fence, no prose before or after.
Shape: { "summary": string, "distortions": [{ "label": string, "evidence": string, "reframe": string }] }

EXAMPLE 1
Input: "Everything is ruined. I always mess up. Nobody cares about me. Tomorrow will be a disaster."
Output: {"summary":"There's a lot of heaviness in what you wrote — the mind is reaching for worst-case framings to protect you.","distortions":[{"label":"catastrophising","evidence":"Everything is ruined. Tomorrow will be a disaster.","reframe":"One hard day doesn't mean ruin. What is one small thing that is still okay right now?"},{"label":"all_or_nothing","evidence":"I always mess up.","reframe":"\\"Always\\" is rarely true. Can you name one moment this week that didn't fit that pattern?"},{"label":"mind_reading","evidence":"Nobody cares about me.","reframe":"We can't read other people's minds. Is there someone quietly in your corner you're overlooking right now?"},{"label":"fortune_telling","evidence":"Tomorrow will be a disaster.","reframe":"The future is still open. Tomorrow hasn't decided yet — your mind is predicting, not remembering."}]}

EXAMPLE 2
Input: "I had a quiet walk today and noticed the cherry blossoms. Work was okay. I made dinner."
Output: {"summary":"This sounds like a gentle, grounded day — worth noticing.","distortions":[]}

EXAMPLE 3
Input: "If I make one mistake in the meeting my boss will think I'm incompetent and I'll get fired."
Output: {"summary":"That's a lot of weight to carry into a meeting — the mind is doing a lot of predicting.","distortions":[{"label":"fortune_telling","evidence":"I'll get fired.","reframe":"Your mind is predicting an outcome that hasn't happened. What evidence do you actually have so far?"},{"label":"mind_reading","evidence":"my boss will think I'm incompetent","reframe":"You can't be sure what they'll think. Most people judge themselves far harder than they judge others."},{"label":"catastrophising","evidence":"one mistake … fired","reframe":"One mistake and being fired are very different things. What's the most likely outcome, not the worst?"}]}`;

/**
 * Extract the first balanced JSON object from a string that may contain prose,
 * markdown fences, or commentary. Much more forgiving than JSON.parse on raw input.
 */
function extractJsonObject(raw: string): string | null {
    if (!raw) return null;
    // Strip markdown fences
    let s = raw.replace(/```(?:json|JSON)?\s*/g, '').replace(/```/g, '').trim();
    // Remove leading "Here is …:" style preambles
    const firstBrace = s.indexOf('{');
    if (firstBrace < 0) return null;
    s = s.slice(firstBrace);

    // Walk characters, tracking string state + brace depth, to find balanced close
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) return s.slice(0, i + 1);
        }
    }
    return null;
}

function normaliseLabel(raw: string): Distortion | null {
    const key = raw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
    if ((DISTORTION_TAXONOMY as readonly string[]).includes(key)) return key as Distortion;
    return LABEL_ALIASES[key] ?? null;
}

function tryParse(raw: string): AnalysisResult | null {
    const candidate = extractJsonObject(raw);
    if (!candidate) return null;
    try {
        const parsed = JSON.parse(candidate);
        if (!parsed || typeof parsed !== 'object') return null;
        const summary = typeof parsed.summary === 'string' && parsed.summary.trim()
            ? parsed.summary.trim().slice(0, 240)
            : 'I read what you wrote with care.';
        const rawDistortions = Array.isArray(parsed.distortions) ? parsed.distortions : [];
        const distortions = (rawDistortions as unknown[])
            .map((d) => {
                if (!d || typeof d !== 'object') return null;
                const obj = d as { label?: unknown; evidence?: unknown; reframe?: unknown };
                const labelRaw = typeof obj.label === 'string' ? obj.label : '';
                const label = normaliseLabel(labelRaw);
                const evidence = typeof obj.evidence === 'string' ? obj.evidence.trim() : '';
                const reframe = typeof obj.reframe === 'string' ? obj.reframe.trim() : '';
                if (!label || !evidence || !reframe) return null;
                return { label, evidence: evidence.slice(0, 260), reframe: reframe.slice(0, 260) };
            })
            .filter((d): d is AnalysisResult['distortions'][number] => d !== null);
        return { summary, distortions };
    } catch {
        return null;
    }
}

/**
 * Heuristic fallback — only runs when the LLM output is unparseable.
 * Keeps the feature useful offline / during provider outages.
 */
const HEURISTIC_PATTERNS: Array<{ label: Distortion; regexes: RegExp[]; reframe: string }> = [
    {
        label: 'all_or_nothing',
        regexes: [/\b(always|never|everyone|no one|nobody|everything|nothing)\b/i],
        reframe: 'Words like "always" and "never" rarely hold up under inspection — is there a recent counter-example?',
    },
    {
        label: 'catastrophising',
        regexes: [/\b(disaster|ruined|end of the world|worst|catastroph)/i],
        reframe: 'The mind is reaching for worst-case. What\'s the most likely outcome, not the scariest one?',
    },
    {
        label: 'fortune_telling',
        regexes: [/\b(will be|going to|definitely will|won't ever|won't be able)\b.*\b(bad|worse|disaster|fail|wrong)\b/i, /\btomorrow will be\b/i],
        reframe: 'You\'re predicting. The future is still open — what evidence do you actually have yet?',
    },
    {
        label: 'mind_reading',
        regexes: [/\b(they think|she thinks|he thinks|everyone thinks|nobody cares|no one cares|they hate|they don't)\b/i],
        reframe: 'We can\'t actually see inside other people\'s heads. What else could their behaviour mean?',
    },
    {
        label: 'should_statements',
        regexes: [/\b(should have|shouldn't have|must|have to|ought to|supposed to)\b/i],
        reframe: '"Should" often hides self-judgement. What would a kinder voice say instead?',
    },
    {
        label: 'labeling',
        regexes: [/\bI (am|'m) (a |an )?(failure|idiot|loser|stupid|worthless|useless|bad person)\b/i],
        reframe: 'You are not a label. One struggle doesn\'t define you.',
    },
];

function heuristicDetect(text: string): AnalysisResult {
    const hits: AnalysisResult['distortions'] = [];
    const seen = new Set<string>();
    for (const pat of HEURISTIC_PATTERNS) {
        for (const re of pat.regexes) {
            const m = text.match(re);
            if (m && !seen.has(pat.label)) {
                seen.add(pat.label);
                const evidence = m[0].slice(0, 120);
                hits.push({ label: pat.label, evidence, reframe: pat.reframe });
                break;
            }
        }
    }
    const summary = hits.length > 0
        ? 'I noticed a few familiar thought patterns in what you wrote. Naming them gently is already a step.'
        : 'Nothing strong stood out. Keep writing — clarity often comes slowly.';
    return { summary, distortions: hits };
}

export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `distortions:${payload.userId}`, limit: 12, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, BodySchema);
    if (!parsed.ok) return parsed.response;
    const { content } = parsed.data;

    try {
        const result = await generate({
            system: SYSTEM_PROMPT,
            turns: [{ role: 'user', content }],
            maxTokens: 900,
            temperature: 0.3,
        });
        const structured = tryParse(result.text);
        if (structured) {
            return Response.json({ ...structured, provider: result.provider, degraded: false });
        }
        // LLM output unparseable — fall back to heuristic detector so users see SOMETHING useful
        log.warn({ rawLen: result.text?.length ?? 0, provider: result.provider }, 'distortions.llm_parse_failed_using_heuristic');
        const heur = heuristicDetect(content);
        return Response.json({
            ...heur,
            provider: 'heuristic',
            degraded: true,
            degradedReason: 'ai_output_unparseable',
        });
    } catch (err) {
        log.warn({ err: String(err) }, 'distortions.generate_failed');
        const heur = heuristicDetect(content);
        return Response.json({
            ...heur,
            provider: 'heuristic',
            degraded: true,
            degradedReason: 'ai_unavailable',
        });
    }
}
