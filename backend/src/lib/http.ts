/**
 * HTTP helpers — JSON responses, zod validation, error envelopes.
 */
import { NextRequest } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

export function jsonOk<T>(body: T, init?: ResponseInit): Response {
    return Response.json(body, init);
}

export function jsonError(status: number, message: string, details?: unknown): Response {
    return Response.json({ error: message, details: details ?? undefined }, { status });
}

export async function parseJson<T>(req: NextRequest, schema: ZodSchema<T>): Promise<
    { ok: true; data: T } | { ok: false; response: Response }
> {
    let raw: unknown;
    try {
        raw = await req.json();
    } catch {
        return { ok: false, response: jsonError(400, 'Invalid JSON body') };
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        const issues = (parsed.error as ZodError).issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
        }));
        return { ok: false, response: jsonError(400, 'Invalid request body', issues) };
    }
    return { ok: true, data: parsed.data };
}

export function parseQuery<T>(req: NextRequest, schema: ZodSchema<T>): 
    { ok: true; data: T } | { ok: false; response: Response } {
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        const issues = (parsed.error as ZodError).issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
        }));
        return { ok: false, response: jsonError(400, 'Invalid query params', issues) };
    }
    return { ok: true, data: parsed.data };
}

// Re-export zod so routes can import from one place
export { z };
