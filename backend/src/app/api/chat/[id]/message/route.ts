/**
 * POST /api/chat/[id]/message — send a user message, stream back the assistant reply.
 *
 * Production-grade pipeline:
 *   1. auth + rate-limit (30/min/user)
 *   2. zod-validated body
 *   3. persist user msg + compute embedding
 *   4. composite crisis check (keyword + optional subtle-LLM safety net)
 *   5. compute adaptive system prompt (wellness profile + user state)
 *   6. RAG context block (memories + past journals + past chat turns)
 *   7. unified AI stream (Gemini → OpenAI fallback)
 *   8. persist assistant msg, audit, auto-title, emit SSE
 */
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { getCrisisSystemPrompt } from '@/lib/crisis';
import { computeUserState, generateDynamicSystemPrompt, generateOpeningContext } from '@/lib/ai-engine';
import { stream as aiStream, embed, toPgVector } from '@/lib/ai/provider';
import { buildRagContext } from '@/services/ragService';
import { checkForCrisisEnriched } from '@/services/crisisService';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';
import { jsonError, parseJson, z } from '@/lib/http';

const BodySchema = z.object({
    content: z.string().trim().min(1).max(4000),
});

const FALLBACK_SYSTEM_PROMPT = `You are Silent Help — a compassionate, intelligent AI companion focused on mental wellness and emotional support. You are NOT a therapist or medical professional. You are a warm, understanding friend who listens deeply.

Your personality:
- Empathetic and gentle, but not patronizing
- Thoughtful and articulate
- You ask meaningful follow-up questions
- You validate feelings without judgment
- You offer practical coping suggestions when appropriate
- You're honest about your limitations as an AI

Your approach:
- Lead with empathy and understanding
- Use warm, natural language (not clinical)
- Keep responses concise but meaningful (2-4 paragraphs max)
- When someone shares something heavy, acknowledge the weight of it
- Suggest professional help when the situation warrants it
- Never diagnose, prescribe, or provide medical advice

${getCrisisSystemPrompt()}`;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `chat:${payload.userId}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const { id: conversationId } = await params;
    const parsed = await parseJson(req, BodySchema);
    if (!parsed.ok) return parsed.response;
    const { content } = parsed.data;

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: payload.userId },
    });
    if (!conversation) return jsonError(404, 'Conversation not found');

    // Persist the user message FIRST so history survives mid-stream failures.
    // Embedding is computed in parallel; stored via raw SQL so Prisma's `Unsupported` type is avoided.
    const userMessageId = crypto.randomUUID();
    const embedPromise = embed(content).catch(() => null);

    await prisma.message.create({
        data: { id: userMessageId, conversationId, role: 'user', content },
    });
    (async () => {
        const e = await embedPromise;
        if (!e) return;
        try {
            await prisma.$executeRaw`
                UPDATE messages
                SET embedding = ${toPgVector(e.vector)}::vector, embedding_model = ${e.model}
                WHERE id = ${userMessageId}::uuid
            `;
        } catch (err) {
            log.warn({ err: String(err) }, 'chat.message.embed_store_failed');
        }
    })();

    // ── Build system prompt ──
    let systemPrompt = FALLBACK_SYSTEM_PROMPT;
    try {
        const [userState, wellnessProfile] = await Promise.all([
            computeUserState(payload.userId),
            prisma.wellnessProfile.findUnique({ where: { userId: payload.userId } }),
        ]);
        if (wellnessProfile) {
            systemPrompt = generateDynamicSystemPrompt(userState, {
                profile: wellnessProfile.profile as Record<string, unknown>,
                energy: wellnessProfile.energy,
                concern: wellnessProfile.concern,
                aiInsight: wellnessProfile.aiInsight,
            });
            const opening = generateOpeningContext(userState);
            if (opening) systemPrompt += '\n\n' + opening;
        }
    } catch (engineErr) {
        log.warn({ err: String(engineErr) }, 'chat.ai_engine.fallback_static_prompt');
    }

    // ── RAG: memories + past journals + past chat turns ──
    try {
        const rag = await buildRagContext(payload.userId, content);
        if (rag.block) {
            systemPrompt += `\n\n— Context from this user's own history —\n${rag.block}\n— End context —\n(Use this context only if it helps the current moment. Do not recite it back.)`;
        }
    } catch (ragErr) {
        log.warn({ err: String(ragErr) }, 'chat.rag.failed');
    }

    // ── Composite crisis check ──
    const crisis = await checkForCrisisEnriched(content).catch((e) => {
        log.warn({ err: String(e) }, 'chat.crisis.failed');
        return null;
    });
    if (crisis?.isCrisis) {
        systemPrompt += `\n\nSAFETY: The user's message suggests they may be in crisis (source=${crisis.source}). Lead with empathy. Gently surface UK crisis resources: Samaritans 116 123, Shout (text SHOUT to 85258), NHS 111, 999 for emergency. Never dismiss their feelings.`;
    }

    // ── History window ──
    const history = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 30,
        select: { role: true, content: true },
    });

    // ── Stream ──
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of aiStream({
                    system: systemPrompt,
                    turns: history
                        .filter((m) => m.role === 'user' || m.role === 'assistant')
                        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                    maxTokens: 1000,
                    temperature: 0.7,
                })) {
                    if (chunk.content) {
                        fullResponse += chunk.content;
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`),
                        );
                    }
                    if (chunk.done) break;
                }

                const assistantMessage = await prisma.message.create({
                    data: {
                        conversationId,
                        role: 'assistant',
                        content: fullResponse || "I'm here with you. Give me a moment.",
                    },
                });

                if (!conversation.title) {
                    const title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
                    await prisma.conversation.update({
                        where: { id: conversationId },
                        data: { title },
                    });
                }

                await audit({
                    req,
                    userId: payload.userId,
                    action: 'chat.message',
                    resource: `conversation:${conversationId}`,
                    meta: {
                        userChars: content.length,
                        assistantChars: fullResponse.length,
                        crisisSource: crisis?.source ?? 'none',
                    },
                });

                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({
                            done: true,
                            messageId: assistantMessage.id,
                            crisis: crisis?.isCrisis ? crisis : null,
                        })}\n\n`,
                    ),
                );
                controller.close();
            } catch (streamErr) {
                log.error({ err: String(streamErr) }, 'chat.stream.failed');
                if (fullResponse) {
                    await prisma.message.create({
                        data: { conversationId, role: 'assistant', content: fullResponse },
                    }).catch(() => {});
                }
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ done: true, error: 'stream_failed' })}\n\n`,
                    ),
                );
                controller.close();
            }
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
