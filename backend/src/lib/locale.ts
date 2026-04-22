/**
 * Locale → reply-language mapping for chat v2.
 *
 * The AI chat replies in the user's language when we can recognise it.
 * We do NOT call a translation API — the LLM handles the language natively
 * via a single prompt directive. This keeps zero-integration on the happy
 * path and survives `AI_MODE=local`.
 *
 * Priority for resolving the reply language:
 *   1. `users.locale` (BCP-47, set at onboarding or in /settings/data)
 *   2. `Accept-Language` header on the request (first high-q tag)
 *   3. English (UK) default
 *
 * All languages here are UN-official or widely-used varieties with strong
 * model coverage. Adding a new language is a one-line change in the map.
 */
import type { NextRequest } from 'next/server';

export interface ResolvedLocale {
    /** BCP-47 tag we settled on (e.g. "en-GB"). */
    tag: string;
    /** Human-readable language name the LLM should reply in. */
    language: string;
    /** ISO country code used for SOS defaults, crisis numbers. */
    region: string;
    /** Source of the resolution — for audit transparency. */
    source: 'profile' | 'header' | 'default';
}

const LANGUAGE_BY_PREFIX: Record<string, string> = {
    en: 'English',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    sv: 'Swedish',
    da: 'Danish',
    no: 'Norwegian',
    fi: 'Finnish',
    pl: 'Polish',
    cs: 'Czech',
    ro: 'Romanian',
    ta: 'Tamil',
    hi: 'Hindi',
    bn: 'Bengali',
    ur: 'Urdu',
    ar: 'Arabic',
    tr: 'Turkish',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
};

/**
 * Normalise a tag like "en-gb" → `{tag:"en-GB", language:"English", region:"GB"}`.
 * Unknown languages quietly fall through to English.
 */
function normalise(tag: string, source: ResolvedLocale['source']): ResolvedLocale {
    const parts = tag.trim().split(/[-_]/);
    const lang = (parts[0] || 'en').toLowerCase();
    const region = (parts[1] || '').toUpperCase();
    const language = LANGUAGE_BY_PREFIX[lang] ?? 'English';
    const normalisedTag = region ? `${lang}-${region}` : lang;
    return { tag: normalisedTag, language, region: region || 'GB', source };
}

function parseAcceptLanguage(header: string | null): string | null {
    if (!header) return null;
    // Pick the highest-q tag.
    const best = header
        .split(',')
        .map((t) => {
            const [tag, ...rest] = t.trim().split(';');
            const q = rest.find((r) => r.trim().startsWith('q='));
            const qv = q ? Number(q.trim().slice(2)) : 1;
            return { tag: tag.trim(), q: isFinite(qv) ? qv : 0 };
        })
        .filter((e) => e.tag && !e.tag.startsWith('*'))
        .sort((a, b) => b.q - a.q)[0];
    return best?.tag ?? null;
}

export function resolveReplyLocale(params: {
    req: NextRequest;
    profileLocale?: string | null;
}): ResolvedLocale {
    if (params.profileLocale) return normalise(params.profileLocale, 'profile');
    const headerTag = parseAcceptLanguage(params.req.headers.get('accept-language'));
    if (headerTag) return normalise(headerTag, 'header');
    return normalise('en-GB', 'default');
}

/**
 * System-prompt addendum that instructs the LLM to reply in the user's language.
 * Intentionally short — the guidance sits alongside the persona addendum.
 */
export function languagePromptAddendum(locale: ResolvedLocale): string {
    if (locale.language === 'English') return '';
    return (
        `\n\nLanguage: reply in ${locale.language} (${locale.tag}). ` +
        `Use natural, warm ${locale.language} — do not translate English phrases literally. ` +
        `Keep proper nouns (product name, helplines) unchanged.`
    );
}
