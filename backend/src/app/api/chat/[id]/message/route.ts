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
 *
 * SSE event types (all as `data: {json}\n\n`):
 *   - { meta: { persona, citations, crisis } }  emitted ONCE at start
 *   - { content: "partial text" }               streamed token-by-token
 *   - { done: true, messageId, crisis, suggestions, groundingActions }  emitted at end
 *   - { error: "…" }                            emitted on failure
 */
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { getCrisisSystemPrompt } from '@/lib/crisis';
import { computeUserState, generateDynamicSystemPrompt, generateOpeningContext } from '@/lib/ai-engine';
import { stream as aiStream, generate as aiGenerate, embed, toPgVector } from '@/lib/ai/provider';
import { buildRagContext, type RagCitation } from '@/services/ragService';
import { checkForCrisisEnriched, type CompositeCrisisResult } from '@/services/crisisService';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';
import { jsonError, parseJson, z } from '@/lib/http';
import { classifyEmotionLocal } from '@/lib/ai/local';

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

Formatting:
- Plain paragraphs, no headings or bullet lists unless the user asks
- Italicise sparingly with *single asterisks* for gentle emphasis
- Never use **bold**, tables, or code fences

${getCrisisSystemPrompt()}`;

/* ───────────────────────── Persona helpers ───────────────────────── */

type Emotion = 'anxious' | 'overwhelmed' | 'frustrated' | 'sad' | 'pressure' | 'neutral';

const PERSONA_LIBRARY: Record<Emotion, { label: string; tone: string; pace: string; accent: string; guidance: string }> = {
    anxious: {
        label: 'Gentle anchor',
        tone: 'soft, steady, reassuring',
        pace: 'slow and grounding',
        accent: '#38bdf8',
        guidance: 'Speak softly and slowly. Offer one small grounding step (box breath, 5-4-3-2-1) near the end of your reply only if it fits naturally. Keep sentences short.',
    },
    overwhelmed: {
        label: 'Calm organiser',
        tone: 'structured, clear, unhurried',
        pace: 'deliberate and simple',
        accent: '#a78bfa',
        guidance: 'Offer gentle structure. Break any overwhelm down into one next small step. Avoid giving 5 options at once — give 1 or 2.',
    },
    frustrated: {
        label: 'Validating mirror',
        tone: 'warm, validating, non-preachy',
        pace: 'direct and human',
        accent: '#f97316',
        guidance: 'Validate the frustration fully before anything else. Do not moralise or rush to reframe. Ask what feels unfair before offering perspective.',
    },
    sad: {
        label: 'Quiet companion',
        tone: 'tender, spacious, present',
        pace: 'quiet and attentive',
        accent: '#818cf8',
        guidance: 'Sit with them. Do not rush to fix or cheer up. Gentle open questions. Offer comfort before solutions.',
    },
    pressure: {
        label: 'Grounded pacer',
        tone: 'grounded, pragmatic, humane',
        pace: 'steady and concrete',
        accent: '#2dd4bf',
        guidance: 'Help them separate what they can influence from what they cannot. Suggest the smallest next action. Acknowledge the weight they are carrying.',
    },
    neutral: {
        label: 'Warm listener',
        tone: 'warm, curious, balanced',
        pace: 'natural',
        accent: '#60a5fa',
        guidance: 'Listen first, then gently reflect.',
    },
};

function resolveEmotionFromProfile(profile: { concern?: string | null; profile?: unknown } | null, fallback: Emotion = 'neutral'): Emotion {
    if (!profile) return fallback;
    const p = profile.profile as { emotionalProfile?: string; primaryType?: string } | null;
    const rawList = [p?.emotionalProfile, p?.primaryType, profile.concern].filter(Boolean).map((s) => String(s).toLowerCase());
    for (const v of rawList) {
        if (v.includes('anx') || v.includes('panic')) return 'anxious';
        if (v.includes('overwhelm') || v.includes('racing')) return 'overwhelmed';
        if (v.includes('frustrat') || v.includes('anger')) return 'frustrated';
        if (v.includes('sad') || v.includes('hopeless') || v.includes('grief')) return 'sad';
        if (v.includes('press') || v.includes('stress')) return 'pressure';
    }
    return fallback;
}

/**
 * Live-turn emotion: use the self-hosted GoEmotions classifier to pick up the
 * emotion actually present in the user's current message. Falls back to the
 * wellness-profile emotion when the classifier is offline or low-confidence.
 */
async function resolveLiveEmotion(message: string, profileEmotion: Emotion): Promise<{ emotion: Emotion; source: 'local' | 'profile'; confidence: number }> {
    try {
        const local = await classifyEmotionLocal(message);
        if (local && local.confidence >= 0.35 && local.label !== 'neutral') {
            return { emotion: local.label, source: 'local', confidence: local.confidence };
        }
        if (local && local.confidence >= 0.5) {
            return { emotion: local.label, source: 'local', confidence: local.confidence };
        }
    } catch {
        // fall through
    }
    return { emotion: profileEmotion, source: 'profile', confidence: 0 };
}

function personaPromptAddendum(emotion: Emotion): string {
    const p = PERSONA_LIBRARY[emotion];
    return `\n\n— Tone for this moment —\nLabel: ${p.label}\nTone: ${p.tone}\nPace: ${p.pace}\nGuidance: ${p.guidance}`;
}

/* ───────────────────────── Suggestion helpers ───────────────────────── */

interface GroundingAction {
    id: string;
    label: string;
    toolHref: string;
}

function pickGroundingActions(emotion: Emotion, crisis: CompositeCrisisResult | null): GroundingAction[] {
    if (crisis?.isCrisis) {
        return [
            { id: 'sos', label: 'Open SOS support', toolHref: '/sos' },
            { id: 'breathe', label: 'Box breathing · 3 min', toolHref: '/tools?tool=box-breathing' },
        ];
    }
    switch (emotion) {
        case 'anxious':
            return [
                { id: 'breathe', label: 'Box breathing · 3 min', toolHref: '/tools?tool=box-breathing' },
                { id: 'ground-54321', label: '5-4-3-2-1 grounding', toolHref: '/tools?tool=grounding-54321' },
            ];
        case 'overwhelmed':
            return [
                { id: 'brain-dump', label: 'Brain dump · 2 min', toolHref: '/journal' },
                { id: 'breathe', label: 'Coherent breathing 5.5-5.5', toolHref: '/tools?tool=coherent-breathing' },
            ];
        case 'frustrated':
            return [
                { id: 'tipp', label: 'TIPP cool-down', toolHref: '/tools?tool=tipp' },
                { id: 'urge-surfing', label: 'Urge surfing · 3 min', toolHref: '/tools?tool=urge-surfing' },
            ];
        case 'sad':
            return [
                { id: 'self-compassion', label: 'Self-compassion break', toolHref: '/tools?tool=self-compassion' },
                { id: 'gratitude', label: 'Notice one small thing', toolHref: '/gratitude' },
            ];
        case 'pressure':
            return [
                { id: 'breathe', label: 'Box breathing · 3 min', toolHref: '/tools?tool=box-breathing' },
                { id: 'brain-dump', label: 'Worry offload', toolHref: '/journal' },
            ];
        default:
            return [
                { id: 'breathe', label: 'Box breathing · 3 min', toolHref: '/tools?tool=box-breathing' },
                { id: 'journal', label: 'Journal this moment', toolHref: '/journal' },
            ];
    }
}

async function generateFollowUps(params: {
    userMessage: string;
    assistantMessage: string;
    emotion: Emotion;
}): Promise<string[]> {
    const { userMessage, assistantMessage, emotion } = params;
    if (!assistantMessage) return [];
    try {
        const r = await aiGenerate({
            system: `You generate gentle, specific follow-up questions the user might want to ask their mental-wellness companion next.
Rules:
- Return 3 short questions, each under 70 characters.
- Written in FIRST PERSON from the user's perspective ("Why do I…", "Help me…", "Can we try…").
- Specific to the conversation — never generic ("Tell me more").
- No emojis, no numbering, no quotes.
- Vary verbs — don't start all three the same way.
- Match the user's emotional tone (currently: ${emotion}).
Output: one question per line, nothing else.`,
            turns: [
                {
                    role: 'user',
                    content: `Last user message: "${userMessage.slice(0, 600)}"\n\nCompanion's reply: "${assistantMessage.slice(0, 900)}"\n\nSuggest 3 follow-up questions the user might want to ask next.`,
                },
            ],
            maxTokens: 160,
            temperature: 0.8,
        });
        const lines = r.text
            .split(/\r?\n/)
            .map((l) => l.replace(/^[\s\d.\-*•]+/, '').replace(/^["']|["']$/g, '').trim())
            .filter((l) => l.length >= 6 && l.length <= 100);
        return lines.slice(0, 3);
    } catch {
        return [];
    }
}

/* ───────────────────────── Handler ───────────────────────── */

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

    // ── Build adaptive system prompt ──
    let systemPrompt = FALLBACK_SYSTEM_PROMPT;
    let emotion: Emotion = 'neutral';
    let wellnessProfile: Awaited<ReturnType<typeof prisma.wellnessProfile.findUnique>> = null;
    try {
        const [userState, wp] = await Promise.all([
            computeUserState(payload.userId),
            prisma.wellnessProfile.findUnique({ where: { userId: payload.userId } }),
        ]);
        wellnessProfile = wp;
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
        emotion = resolveEmotionFromProfile(wellnessProfile ? {
            concern: wellnessProfile.concern,
            profile: wellnessProfile.profile,
        } : null);
    } catch (engineErr) {
        log.warn({ err: String(engineErr) }, 'chat.ai_engine.fallback_static_prompt');
    }

    // Upgrade emotion with the self-hosted live-turn classifier when available.
    const liveEmotion = await resolveLiveEmotion(content, emotion);
    emotion = liveEmotion.emotion;

    // Apply emotion-aware persona tone
    systemPrompt += personaPromptAddendum(emotion);

    // ── RAG ──
    let citations: RagCitation[] = [];
    try {
        const rag = await buildRagContext(payload.userId, content);
        citations = rag.citations;
        if (rag.block) {
            systemPrompt += `\n\n— Context from this user's own history —\n${rag.block}\n— End context —\n(Use this context only if it genuinely helps the current moment. Refer to it naturally ("when you wrote about the meeting last week…") — never quote verbatim.)`;
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
        systemPrompt += `\n\nSAFETY: The user's message suggests they may be in crisis (source=${crisis.source}, severity=${crisis.severity}). Lead with empathy. Gently surface UK crisis resources: Samaritans 116 123, Shout (text SHOUT to 85258), NHS 111, 999 for emergency. Never dismiss their feelings. Invite them to open the in-app SOS screen for localised numbers.`;
    }

    // ── History window ──
    const history = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 30,
        select: { role: true, content: true },
    });

    const persona = PERSONA_LIBRARY[emotion];
    const groundingActions = pickGroundingActions(emotion, crisis);

    // ── Stream ──
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readable = new ReadableStream({
        async start(controller) {
            const send = (obj: unknown) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
            };

            try {
                // Emit meta frame FIRST so UI can paint persona + citations + crisis nudge
                send({
                    meta: {
                        persona: {
                            emotion,
                            label: persona.label,
                            tone: persona.tone,
                            pace: persona.pace,
                            accent: persona.accent,
                        },
                        citations,
                        crisis: crisis?.isCrisis
                            ? {
                                  severity: crisis.severity,
                                  source: crisis.source,
                                  matchedKeywords: crisis.matchedKeywords.slice(0, 4),
                              }
                            : null,
                    },
                });

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
                        send({ content: chunk.content });
                    }
                    if (chunk.done) break;
                }

                const finalContent = fullResponse || "I'm here with you. Give me a moment.";
                const assistantMessage = await prisma.message.create({
                    data: { conversationId, role: 'assistant', content: finalContent },
                });

                if (!conversation.title) {
                    const title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
                    await prisma.conversation.update({
                        where: { id: conversationId },
                        data: { title },
                    });
                }

                // Fire-and-forget: adaptive follow-ups
                const suggestions = await generateFollowUps({
                    userMessage: content,
                    assistantMessage: finalContent,
                    emotion,
                }).catch(() => []);

                await audit({
                    req,
                    userId: payload.userId,
                    action: 'chat.message',
                    resource: `conversation:${conversationId}`,
                    meta: {
                        userChars: content.length,
                        assistantChars: finalContent.length,
                        crisisSource: crisis?.source ?? 'none',
                        emotion,
                        citationCount: citations.length,
                    },
                });

                send({
                    done: true,
                    messageId: assistantMessage.id,
                    crisis: crisis?.isCrisis ? crisis : null,
                    suggestions,
                    groundingActions,
                });
                controller.close();
            } catch (streamErr) {
                log.error({ err: String(streamErr) }, 'chat.stream.failed');
                if (fullResponse) {
                    await prisma.message.create({
                        data: { conversationId, role: 'assistant', content: fullResponse },
                    }).catch(() => {});
                }
                send({ done: true, error: 'stream_failed' });
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
