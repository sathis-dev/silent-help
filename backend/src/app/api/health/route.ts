import prisma from '@/lib/prisma';
import { hasGemini, hasOpenAI, hasLocalLlm, getLocalLlmConfig } from '@/lib/ai/provider';
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
    const localLlm = getLocalLlmConfig();
    out.ai = {
        mode: aiMode(),
        local: {
            embed: localHealth.models.embed,
            emotion: localHealth.models.emotion,
            zeroShot: localHealth.models.zeroShot,
            failed: localHealth.failed,
            // Self-hosted chat LLM (Phase B). Configured via LOCAL_LLM_URL/MODEL env vars.
            llm: {
                configured: hasLocalLlm(),
                model: localLlm?.model ?? null,
                // Expose host only (never leak API keys); useful for ops/debug visibility.
                host: localLlm ? safeHost(localLlm.url) : null,
            },
        },
        cloud: {
            gemini: hasGemini(),
            openai: hasOpenAI(),
        },
        // Ok if any chat tier is reachable; or if mode is hybrid/local with at least classifiers.
        ok: aiMode() !== 'cloud' || hasGemini() || hasOpenAI() || hasLocalLlm(),
    };

    out.privacy = {
        encryptionAtRest: isEncryptionEnabled(),
    };

    out.latencyMs = Date.now() - start;

    const status = out.status === 'ok' ? 200 : 503;
    return Response.json(out, { status });
}

function safeHost(url: string): string {
    try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}`;
    } catch {
        return '';
    }
}
