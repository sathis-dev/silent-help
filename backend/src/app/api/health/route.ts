import prisma from '@/lib/prisma';
import { hasGemini, hasOpenAI } from '@/lib/ai/provider';
import { isEncryptionEnabled } from '@/lib/encryption';

/** GET /api/health — extended: DB, AI provider reachability, encryption, extensions */
export async function GET() {
    const start = Date.now();
    const out: Record<string, unknown> = {
        status: 'ok',
        service: 'silent-help-backend',
        timestamp: new Date().toISOString(),
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        out.database = 'connected';
    } catch {
        out.database = 'disconnected';
        out.status = 'degraded';
    }

    try {
        const rows = await prisma.$queryRaw<{ extname: string }[]>`
            SELECT extname FROM pg_extension WHERE extname IN ('vector', 'pgcrypto')
        `;
        out.extensions = rows.map((r) => r.extname);
    } catch {
        out.extensions = [];
    }

    out.ai = {
        gemini: hasGemini(),
        openai: hasOpenAI(),
        // At least one real provider is expected for production-grade responses.
        ok: hasGemini() || hasOpenAI(),
    };

    out.privacy = {
        encryptionAtRest: isEncryptionEnabled(),
    };

    out.latencyMs = Date.now() - start;

    const status = out.status === 'ok' ? 200 : 503;
    return Response.json(out, { status });
}
