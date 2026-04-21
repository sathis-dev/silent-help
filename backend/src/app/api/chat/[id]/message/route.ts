import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { checkForCrisis, getCrisisSystemPrompt } from '@/lib/crisis';
import { computeUserState, generateDynamicSystemPrompt, generateOpeningContext } from '@/lib/ai-engine';

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

/**
 * POST /api/chat/[id]/message — Send a message and stream AI response (Gemini)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    const { id: conversationId } = await params;

    try {
        const { content } = await req.json();

        if (!content?.trim()) {
            return Response.json({ error: 'Message content is required' }, { status: 400 });
        }

        // Verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, userId: payload.userId },
        });

        if (!conversation) {
            return Response.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // ═══ AI Engine: Compute dynamic system prompt ═══
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

                // Add opening context for returning users
                const openingCtx = generateOpeningContext(userState);
                if (openingCtx) {
                    systemPrompt += '\n\n' + openingCtx;
                }
            }
        } catch (engineErr) {
            console.error('AI Engine error (falling back to static prompt):', engineErr);
        }

        // Crisis check
        const crisisResult = checkForCrisis(content);

        // Save user message
        await prisma.message.create({
            data: {
                conversationId,
                role: 'user',
                content,
            },
        });

        // Get conversation history (last 20 messages for context)
        const history = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 20,
        });

        // If crisis detected, append safety context to system prompt
        if (crisisResult.isCrisis) {
            systemPrompt += `\n\nCRISIS DETECTED: The user's message contained concerning language. Lead with empathy, provide UK crisis resources (Samaritans: 116 123, Shout: text SHOUT to 85258), and encourage professional support. Do not dismiss their feelings.`;
        }

        // Check if Gemini API key is configured
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            // Fallback: return a helpful message without AI
            const fallbackResponse = crisisResult.isCrisis
                ? crisisResult.safetyMessage!
                : "I'm here to listen and support you. (AI responses will be available once the Gemini API key is configured. For now, your messages are being saved.)";

            const assistantMessage = await prisma.message.create({
                data: {
                    conversationId,
                    role: 'assistant',
                    content: fallbackResponse,
                },
            });

            if (!conversation.title) {
                const title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { title },
                });
            }

            return Response.json({
                message: assistantMessage,
                crisis: crisisResult.isCrisis ? crisisResult : null,
            });
        }

        // ═══ Build Gemini contents array ═══
        const geminiContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

        for (const msg of history) {
            const role = msg.role === 'user' ? 'user' : (msg.role === 'assistant' ? 'model' : null);
            if (!role) continue;

            const lastEntry = geminiContents[geminiContents.length - 1];
            if (lastEntry && lastEntry.role === role) {
                // Merge consecutive messages with the same role to prevent Gemini 400 errors
                lastEntry.parts[0].text += '\n\n' + msg.content;
            } else {
                geminiContents.push({ role, parts: [{ text: msg.content }] });
            }
        }

        // Gemini requires the first message to be from the 'user'
        if (geminiContents.length > 0 && geminiContents[0].role !== 'user') {
            geminiContents.unshift({ role: 'user', parts: [{ text: '[Conversation started]' }] });
        }

        // ═══ Get Gemini stream ═══
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        let geminiStream: AsyncGenerator;
        try {
            geminiStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: geminiContents,
                config: {
                    systemInstruction: systemPrompt,
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            }) as unknown as AsyncGenerator;
        } catch (initError) {
            console.error('Gemini init error:', initError);
            return Response.json({ error: 'AI service unavailable' }, { status: 503 });
        }

        // ═══ Stream response via SSE ═══
        const encoder = new TextEncoder();
        let fullResponse = '';

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    // Use .next() to consume the async generator safely inside ReadableStream
                    while (true) {
                        const { value: chunk, done } = await geminiStream.next();
                        if (done) break;

                        const c = chunk as {
                            text?: string;
                            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
                        };
                        const text = c?.text || c?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        if (text) {
                            fullResponse += text;
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                            );
                        }
                    }

                    // Save complete assistant message
                    const assistantMessage = await prisma.message.create({
                        data: {
                            conversationId,
                            role: 'assistant',
                            content: fullResponse || '(No response generated)',
                        },
                    });

                    // Auto-title conversation
                    if (!conversation.title) {
                        const title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
                        await prisma.conversation.update({
                            where: { id: conversationId },
                            data: { title },
                        });
                    }

                    // Send completion event
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                done: true,
                                messageId: assistantMessage.id,
                                crisis: crisisResult.isCrisis ? crisisResult : null,
                            })}\n\n`
                        )
                    );
                    controller.close();
                } catch (error) {
                    console.error('Gemini stream error:', error);

                    // If we have partial response, save it
                    if (fullResponse) {
                        try {
                            const assistantMessage = await prisma.message.create({
                                data: { conversationId, role: 'assistant', content: fullResponse },
                            });
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ done: true, messageId: assistantMessage.id })}\n\n`)
                            );
                        } catch (dbErr) {
                            console.error('Failed to save partial response:', dbErr);
                        }
                    }

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: 'Stream error: ' + (error instanceof Error ? error.message : String(error)) })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat message error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
