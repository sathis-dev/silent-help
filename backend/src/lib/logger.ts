/**
 * Structured logger (pino) — one process-wide instance with PII-safe redaction.
 *
 * Log calls anywhere: `logger.info({ userId }, 'journal.created')`.
 * For per-request scope (includes request id + path), use `requestLogger(req)`.
 */
import pino from 'pino';
import { NextRequest } from 'next/server';

const LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = pino({
    level: LEVEL,
    // Never log tokens or bodies of safety-sensitive fields.
    redact: {
        paths: [
            'authorization',
            '*.authorization',
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.passwordHash',
            '*.token',
            '*.refreshToken',
            '*.journalContent',
        ],
        censor: '[REDACTED]',
    },
    base: {
        service: 'silent-help-backend',
        env: process.env.NODE_ENV || 'development',
    },
    transport:
        process.env.NODE_ENV !== 'production'
            ? {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true, translateTime: 'HH:MM:ss' },
              }
            : undefined,
});

/**
 * Returns a child logger scoped to a specific incoming request.
 * Adds a stable request id (reused from the `x-request-id` header if present).
 */
export function requestLogger(req: NextRequest) {
    const reqId =
        req.headers.get('x-request-id') ||
        (globalThis.crypto?.randomUUID?.() ??
            `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
    return logger.child({
        reqId,
        method: req.method,
        path: req.nextUrl.pathname,
    });
}

export type Logger = typeof logger;
