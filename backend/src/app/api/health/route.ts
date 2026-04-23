import prisma from '@/lib/prisma';
import { hasGemini, hasOpenAI } from '@/lib/ai/provider';
import { isEncryptionEnabled } from '@/lib/encryption';
import { aiMode, localAiHealth } from '@/lib/ai/local';

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

    const localHealth = localAiHealth();
    out.ai = {
        mode: aiMode(),
        local: {
            embed: localHealth.models.embed,
            emotion: localHealth.models.emotion,
            zeroShot: localHealth.models.zeroShot,
            failed: localHealth.failed,
        },
        cloud: {
            gemini: hasGemini(),
            openai: hasOpenAI(),
        },
        // Ok if local mode is enabled (models load lazily) OR a cloud provider is configured.
        ok: aiMode() !== 'cloud' || hasGemini() || hasOpenAI(),
    };

    out.privacy = {
        encryptionAtRest: isEncryptionEnabled(),
    };

    out.latencyMs = Date.now() - start;

    const status = out.status === 'ok' ? 200 : 503;
    return Response.json(out, { status });
}
