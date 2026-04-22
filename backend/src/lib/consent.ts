/**
 * Consent + retention + Children's Code helpers (UK GDPR / EU GDPR / ICO).
 *
 * Silent Help processes mental-health data — special category under Art 9 UK GDPR.
 * Lawful basis = Art 9(2)(a) explicit consent. This module is the single source of
 * truth for:
 *  - the consent-text version the user accepted
 *  - the retention choice (`forever` | `1y` | `90d`)
 *  - the Children's Code flag (13-17 → safer defaults + forced AI_MODE=local)
 *  - the immutable consent log used for ICO accountability
 */

import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const CONSENT_VERSION = 'v1';

export type RetentionPolicy = 'forever' | '1y' | '90d';

export const RETENTION_POLICIES: RetentionPolicy[] = ['forever', '1y', '90d'];

export type ConsentEvent =
    | 'grant'
    | 'withdraw'
    | 'retention_change'
    | 'age_confirm'
    | 'child_mode_enabled';

export const MIN_AGE = 13;
export const CHILD_MAX_AGE = 17;

/** Year today, rounded to full year (no exact DOB stored). */
export function currentYear(): number {
    return new Date().getUTCFullYear();
}

/** Compute (age, isChild) from a birth year. */
export function classifyAge(birthYear: number): { age: number; isChild: boolean; isAdult: boolean } {
    const age = currentYear() - birthYear;
    return {
        age,
        isChild: age >= MIN_AGE && age <= CHILD_MAX_AGE,
        isAdult: age > CHILD_MAX_AGE,
    };
}

/** Hash an IP so we can log a coarse identifier for ICO audits without storing PII. */
export function hashIp(req: NextRequest): string | null {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        null;
    if (!ip) return null;
    return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

/** Append an immutable consent-log entry. Never update, never delete. */
export async function logConsent(args: {
    userId: string;
    event: ConsentEvent;
    retention?: RetentionPolicy;
    req?: NextRequest;
}): Promise<void> {
    await prisma.consentLog.create({
        data: {
            userId: args.userId,
            event: args.event,
            consentVersion: CONSENT_VERSION,
            retention: args.retention ?? null,
            ipHash: args.req ? hashIp(args.req) : null,
            userAgent: args.req ? args.req.headers.get('user-agent')?.slice(0, 500) ?? null : null,
        },
    });
}

/**
 * Check if the user has given valid Art 9 consent on the current version.
 * Returns null if consent missing / stale.
 */
export async function getConsentStatus(userId: string) {
    const u = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            consentedAt: true,
            consentVersion: true,
            retentionPolicy: true,
            childMode: true,
            birthYear: true,
            region: true,
            locale: true,
        },
    });
    if (!u) return null;
    const current = u.consentVersion === CONSENT_VERSION && !!u.consentedAt;
    return {
        current,
        consentVersion: u.consentVersion,
        consentedAt: u.consentedAt,
        retentionPolicy: u.retentionPolicy as RetentionPolicy | null,
        childMode: u.childMode,
        birthYear: u.birthYear,
        region: u.region,
        locale: u.locale,
    };
}

/**
 * Server-side guardrail: when childMode is true, AI_MODE is forced to 'local'
 * regardless of the env var. Callers that need to resolve the effective mode
 * for a given user should use this helper instead of reading the env directly.
 */
export function effectiveAiMode(
    envMode: string | undefined,
    childMode: boolean,
): 'local' | 'cloud' | 'hybrid' {
    if (childMode) return 'local';
    const m = (envMode || 'hybrid').toLowerCase();
    if (m === 'local' || m === 'cloud' || m === 'hybrid') return m;
    return 'hybrid';
}

/** Cutoff date after which a user's own rows are eligible for auto-delete. */
export function retentionCutoff(policy: RetentionPolicy | null | undefined): Date | null {
    if (!policy || policy === 'forever') return null;
    const days = policy === '1y' ? 365 : 90;
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    return d;
}
