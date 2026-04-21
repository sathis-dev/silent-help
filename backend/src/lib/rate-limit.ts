/**
 * Sliding-window rate limiter.
 *
 * Primary store: Redis (via `REDIS_URL`). Uses atomic sorted-set operations.
 * Fallback store: in-memory map (ok for single-instance dev).
 *
 * Usage:
 *   const verdict = await rateLimit({
 *     key: `chat:${userId}`, limit: 30, windowMs: 60_000,
 *   });
 *   if (!verdict.ok) return rateLimitResponse(verdict);
 */
import Redis from 'ioredis';
import { logger } from '@/lib/logger';

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
    if (!process.env.REDIS_URL) return null;
    if (redisClient) return redisClient;
    try {
        redisClient = new Redis(process.env.REDIS_URL, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
        });
        redisClient.connect().catch((e) => {
            logger.warn({ err: String(e) }, 'rate-limit.redis.connect_failed');
        });
        return redisClient;
    } catch (e) {
        logger.warn({ err: String(e) }, 'rate-limit.redis.init_failed');
        return null;
    }
}

const memStore = new Map<string, number[]>();

export interface RateLimitInput {
    key: string;
    limit: number;
    windowMs: number;
}

export interface RateLimitResult {
    ok: boolean;
    remaining: number;
    resetInMs: number;
    limit: number;
}

export async function rateLimit({ key, limit, windowMs }: RateLimitInput): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redis = getRedis();

    // ── Redis path ──
    if (redis && redis.status !== 'end') {
        try {
            const redisKey = `rl:${key}`;
            const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;
            const pipeline = redis.multi();
            pipeline.zremrangebyscore(redisKey, 0, windowStart);
            pipeline.zadd(redisKey, now, member);
            pipeline.zcard(redisKey);
            pipeline.pexpire(redisKey, windowMs + 1000);
            const res = await pipeline.exec();
            const count = Number(res?.[2]?.[1] ?? 0);
            const remaining = Math.max(0, limit - count);
            return { ok: count <= limit, remaining, resetInMs: windowMs, limit };
        } catch (e) {
            logger.warn({ err: String(e), key }, 'rate-limit.redis.failed_fallback_memory');
            // fall through to memory
        }
    }

    // ── In-memory fallback ──
    const arr = (memStore.get(key) || []).filter((t) => t > windowStart);
    arr.push(now);
    memStore.set(key, arr);
    // opportunistic cleanup
    if (memStore.size > 10_000) {
        for (const [k, v] of memStore) {
            if (v.length === 0 || v[v.length - 1] < windowStart) memStore.delete(k);
        }
    }
    const count = arr.length;
    const remaining = Math.max(0, limit - count);
    return { ok: count <= limit, remaining, resetInMs: windowMs, limit };
}

export function rateLimitResponse(verdict: RateLimitResult): Response {
    return Response.json(
        { error: 'Too many requests. Take a slow breath — we will be here when you return.' },
        {
            status: 429,
            headers: {
                'X-RateLimit-Limit': String(verdict.limit),
                'X-RateLimit-Remaining': String(verdict.remaining),
                'Retry-After': String(Math.ceil(verdict.resetInMs / 1000)),
            },
        },
    );
}
