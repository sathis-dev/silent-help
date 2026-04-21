/**
 * Append-only audit log for user-initiated mutations.
 * Best-effort: never fails a request if the audit insert fails.
 */
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sha256 } from '@/lib/encryption';
import { logger } from '@/lib/logger';

export interface AuditInput {
    userId?: string | null;
    action: string; // e.g. 'journal.create', 'memory.delete'
    resource?: string | null;
    meta?: Record<string, unknown>;
    req?: NextRequest;
}

export async function audit(input: AuditInput): Promise<void> {
    try {
        const ip =
            input.req?.headers.get('x-forwarded-for')?.split(',')[0] ||
            input.req?.headers.get('x-real-ip') ||
            null;
        await prisma.auditLog.create({
            data: {
                userId: input.userId ?? null,
                action: input.action,
                resource: input.resource ?? null,
                ipHash: ip ? sha256(ip).slice(0, 32) : null,
                meta: input.meta ? JSON.parse(JSON.stringify(input.meta)) : undefined,
            },
        });
    } catch (e) {
        logger.warn({ err: String(e), action: input.action }, 'audit.insert_failed');
    }
}
