import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { checkForCrisis, getCrisisSystemPrompt } from '@/lib/crisis';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const DEFAULT_SYSTEM_PROMPT = `You are Silent Help — a compassionate, intelligent AI companion focused on mental wellness and emotional support. You are NOT a therapist or medical professional. You are a warm, understanding friend who listens deeply.

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
 * POST /api/chat/[id]/message — Send a message and stream AI response
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

        // Load personalized system prompt from wellness profile (if exists)
        let systemPrompt = DEFAULT_SYSTEM_PROMPT;
        const wellnessProfile = await prisma.wellnessProfile.findUnique({
            where: { userId: payload.userId },
        });

        if (wellnessProfile) {
            const profile = wellnessProfile.profile as Record<string, unknown>;
            const aiPersonality = profile.aiPersonality as Record<string, unknown> | undefined;
            if (aiPersonality?.systemPromptBase) {
                systemPrompt = `${aiPersonality.systemPromptBase}\n\n${getCrisisSystemPrompt()}`;
            }
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

        // Build messages array for OpenAI
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        // If crisis detected, add safety context
        if (crisisResult.isCrisis) {
            messages.push({
                role: 'system',
                content: `CRISIS DETECTED: The user's message contained concerning language. Lead with empathy, provide UK crisis resources (Samaritans: 116 123, Shout: text SHOUT to 85258), and encourage professional support. Do not dismiss their feelings.`,
            });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            // Fallback: return a helpful message without AI
            const fallbackResponse = crisisResult.isCrisis
                ? crisisResult.safetyMessage!
                : "I'm here to listen and support you. (AI responses will be available once the OpenAI API key is configured. For now, your messages are being saved.)";

            const assistantMessage = await prisma.message.create({
                data: {
                    conversationId,
                    role: 'assistant',
                    content: fallbackResponse,
                },
            });

            // Auto-title conversation from first message
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

        // Stream response from OpenAI
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            stream: true,
            max_tokens: 1000,
            temperature: 0.7,
        });

        // Create SSE stream
        const encoder = new TextEncoder();
        let fullResponse = '';

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const delta = chunk.choices[0]?.delta?.content || '';
                        if (delta) {
                            fullResponse += delta;
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
                            );
                        }
                    }

                    // Save complete assistant message
                    const assistantMessage = await prisma.message.create({
                        data: {
                            conversationId,
                            role: 'assistant',
                            content: fullResponse,
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
                    console.error('Stream error:', error);
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
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
