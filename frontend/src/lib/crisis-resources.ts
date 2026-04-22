/**
 * Geo-aware crisis resources.
 *
 * Silent Help is built in the UK, but distressed users reach it from everywhere.
 * We ship one default list (UK) and switch to the appropriate country list based on
 * `navigator.language` (first) or explicit user preference (saved to localStorage
 * under `sh_country`). No geo-IP lookup — this is all client-side, zero PII.
 */

export type ResourceMode = 'call' | 'text' | 'link';
export type ResourceTone = 'danger' | 'warning' | 'info' | 'calm';

export interface CrisisResource {
    key: string;
    title: string;
    description: string;
    dest: string;                 // phone number, SMS number, or URL
    mode: ResourceMode;
    smsBody?: string;
    tone: ResourceTone;
}

export interface CountryResources {
    countryName: string;
    emergency: string;            // e.g. "999", "911"
    resources: CrisisResource[];
}

/**
 * Per-country lists. Focus on hotlines widely considered authoritative in that country.
 * Please report incorrect numbers via the /profile privacy tab → feedback.
 */
export const CRISIS_BY_COUNTRY: Record<string, CountryResources> = {
    GB: {
        countryName: 'United Kingdom',
        emergency: '999',
        resources: [
            { key: '999', title: '999', description: 'Emergency services — police, ambulance, fire.', dest: '999', mode: 'call', tone: 'danger' },
            { key: '111', title: 'NHS 111', description: 'Urgent medical help, 24/7. Option 2 for mental health.', dest: '111', mode: 'call', tone: 'warning' },
            { key: 'samaritans', title: 'Samaritans', description: 'Free listening, 24/7. Call 116 123 from any phone.', dest: '116123', mode: 'call', tone: 'info' },
            { key: 'shout', title: 'SHOUT 85258', description: 'UK crisis text line. Text SHOUT to 85258.', dest: '85258', smsBody: 'SHOUT', mode: 'text', tone: 'calm' },
        ],
    },
    US: {
        countryName: 'United States',
        emergency: '911',
        resources: [
            { key: '911', title: '911', description: 'Emergency services — police, ambulance, fire.', dest: '911', mode: 'call', tone: 'danger' },
            { key: '988', title: '988', description: 'Suicide & Crisis Lifeline. Call or text 988, 24/7.', dest: '988', mode: 'call', tone: 'warning' },
            { key: 'crisis-text', title: 'Crisis Text Line', description: 'Text HOME to 741741 for free, 24/7 crisis support.', dest: '741741', smsBody: 'HOME', mode: 'text', tone: 'info' },
            { key: 'samhsa', title: 'SAMHSA Helpline', description: 'Treatment referral — 1-800-662-4357, 24/7.', dest: '18006624357', mode: 'call', tone: 'calm' },
        ],
    },
    CA: {
        countryName: 'Canada',
        emergency: '911',
        resources: [
            { key: '911', title: '911', description: 'Emergency services — police, ambulance, fire.', dest: '911', mode: 'call', tone: 'danger' },
            { key: '988-ca', title: '9-8-8 (CA)', description: 'Suicide Crisis Helpline. Call or text 988, 24/7.', dest: '988', mode: 'call', tone: 'warning' },
            { key: 'kids-help', title: 'Kids Help Phone', description: '1-800-668-6868 — 24/7 support for young Canadians.', dest: '18006686868', mode: 'call', tone: 'info' },
            { key: 'hope-text', title: 'Hope for Wellness', description: 'Text WELLNESS to 741741 for crisis support.', dest: '741741', smsBody: 'WELLNESS', mode: 'text', tone: 'calm' },
        ],
    },
    AU: {
        countryName: 'Australia',
        emergency: '000',
        resources: [
            { key: '000', title: '000', description: 'Emergency services — police, ambulance, fire.', dest: '000', mode: 'call', tone: 'danger' },
            { key: 'lifeline', title: 'Lifeline', description: '13 11 14 — crisis support, 24/7.', dest: '131114', mode: 'call', tone: 'warning' },
            { key: 'beyondblue', title: 'Beyond Blue', description: '1300 22 4636 — mental-health support, 24/7.', dest: '1300224636', mode: 'call', tone: 'info' },
            { key: 'kids-help-au', title: 'Kids Helpline', description: '1800 55 1800 — for under-25s.', dest: '1800551800', mode: 'call', tone: 'calm' },
        ],
    },
    IN: {
        countryName: 'India',
        emergency: '112',
        resources: [
            { key: '112', title: '112', description: 'All emergencies — police, fire, ambulance.', dest: '112', mode: 'call', tone: 'danger' },
            { key: 'kiran', title: 'KIRAN', description: 'Mental-health helpline. 1800-599-0019, 24/7, multilingual.', dest: '18005990019', mode: 'call', tone: 'warning' },
            { key: 'icall', title: 'iCall', description: '+91 9152987821 — free counselling, Mon-Sat 8am-10pm.', dest: '+919152987821', mode: 'call', tone: 'info' },
            { key: 'vandrevala', title: 'Vandrevala Foundation', description: '+91 9999 666 555 — 24/7 free counselling.', dest: '+919999666555', mode: 'call', tone: 'calm' },
        ],
    },
    IE: {
        countryName: 'Ireland',
        emergency: '112',
        resources: [
            { key: '112', title: '112', description: 'Emergency services.', dest: '112', mode: 'call', tone: 'danger' },
            { key: 'samaritans-ie', title: 'Samaritans', description: 'Call 116 123 — 24/7, free.', dest: '116123', mode: 'call', tone: 'warning' },
            { key: 'pieta', title: 'Pieta', description: '1800 247 247 — suicide & self-harm, 24/7.', dest: '1800247247', mode: 'call', tone: 'info' },
            { key: 'text-50808', title: 'Text 50808', description: 'Text HELLO to 50808 — 24/7 anonymous text support.', dest: '50808', smsBody: 'HELLO', mode: 'text', tone: 'calm' },
        ],
    },
    DE: {
        countryName: 'Germany',
        emergency: '112',
        resources: [
            { key: '112', title: '112', description: 'Notruf — Rettungsdienst & Feuerwehr.', dest: '112', mode: 'call', tone: 'danger' },
            { key: 'telefon', title: 'Telefonseelsorge', description: '0800 1110111 — 24/7, kostenlos.', dest: '08001110111', mode: 'call', tone: 'warning' },
            { key: 'telefon2', title: 'Telefonseelsorge (2)', description: '0800 1110222 — alternate line.', dest: '08001110222', mode: 'call', tone: 'info' },
        ],
    },
    FR: {
        countryName: 'France',
        emergency: '112',
        resources: [
            { key: '112', title: '112', description: 'Services d\u2019urgence.', dest: '112', mode: 'call', tone: 'danger' },
            { key: '3114', title: '3114', description: 'Num\u00e9ro national de pr\u00e9vention du suicide, 24/7.', dest: '3114', mode: 'call', tone: 'warning' },
            { key: 'sos-amitie', title: 'SOS Amiti\u00e9', description: '09 72 39 40 50 — \u00e9coute, 24/7.', dest: '0972394050', mode: 'call', tone: 'info' },
        ],
    },
};

export const DEFAULT_COUNTRY: keyof typeof CRISIS_BY_COUNTRY = 'GB';

/**
 * Best-effort country detection on the client.
 * Priority: explicit `sh_country` localStorage → `navigator.language` → default 'GB'.
 */
export function detectCountry(): keyof typeof CRISIS_BY_COUNTRY {
    if (typeof window === 'undefined') return DEFAULT_COUNTRY;
    const saved = window.localStorage.getItem('sh_country');
    if (saved && saved in CRISIS_BY_COUNTRY) return saved as keyof typeof CRISIS_BY_COUNTRY;
    try {
        const lang = navigator.language || 'en-GB';
        const region = lang.split('-')[1]?.toUpperCase();
        if (region && region in CRISIS_BY_COUNTRY) return region as keyof typeof CRISIS_BY_COUNTRY;
    } catch {
        // ignore
    }
    return DEFAULT_COUNTRY;
}

export function setCountry(country: keyof typeof CRISIS_BY_COUNTRY) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('sh_country', country);
}

export function getCountryResources(country?: keyof typeof CRISIS_BY_COUNTRY): CountryResources {
    return CRISIS_BY_COUNTRY[country ?? DEFAULT_COUNTRY];
}
