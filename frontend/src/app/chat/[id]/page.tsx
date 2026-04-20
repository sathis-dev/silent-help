'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { getConversation, sendMessage, type Message, type CrisisInfo } from '@/lib/api';
import FadeIn from '@/components/animations/FadeIn';

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [crisis, setCrisis] = useState<CrisisInfo | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const loadConversation = useCallback(async () => {
        try {
            const data = await getConversation(id);
            setMessages(data.conversation.messages);
        } catch (err) {
            console.error('Failed to load conversation:', err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || isSending) return;

        setInput('');
        setIsSending(true);
        setStreamingContent('');
        setCrisis(null);

        // Optimistically add user message
        const userMsg: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);

        // Auto-resize textarea back
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        await sendMessage(
            id,
            text,
            // onChunk
            (chunk) => {
                setStreamingContent(prev => prev + chunk);
            },
            // onDone
            (data) => {
                setStreamingContent(prev => {
                    // Move streaming content into messages
                    const assistantMsg: Message = {
                        id: data.messageId || `msg-${Date.now()}`,
                        role: 'assistant',
                        content: prev,
                        createdAt: new Date().toISOString(),
                    };
                    setMessages(msgs => [...msgs, assistantMsg]);
                    return '';
                });
                if (data.crisis) setCrisis(data.crisis);
                setIsSending(false);
            },
            // onError
            (error) => {
                console.error('Chat error:', error);
                const errorMsg: Message = {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: "I'm sorry, something went wrong. Please try again.",
                    createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, errorMsg]);
                setStreamingContent('');
                setIsSending(false);
            },
        );
    }, [id, input, isSending]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(e.target.value);
        // Auto-resize
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }

    if (isLoading) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            
            {/* Header */}
            <div style={{ 
                padding: '24px 32px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(2, 6, 23, 0.6)',
                backdropFilter: 'blur(12px)',
                zIndex: 10,
            }}>
                <div style={{ 
                    width: 32, height: 32, borderRadius: '50%', background: '#38bdf820', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    border: '1px solid #38bdf840'
                }}>
                    ✨
                </div>
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>AI Companion</h2>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}/>
                        Active session
                    </span>
                </div>
            </div>

            {/* Messages area */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '32px',
                display: 'flex', flexDirection: 'column', gap: '24px',
                scrollBehavior: 'smooth'
            }}>
                {messages.length === 0 && !isSending && (
                    <FadeIn direction="up">
                        <div style={{
                            textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
                            background: 'rgba(15,23,42,0.3)', borderRadius: 24,
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>💬</div>
                            <h2 style={{ fontSize: '1.25rem', color: '#e2e8f0', marginBottom: 8, fontWeight: 500 }}>Start the conversation</h2>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>Type a message below. I&apos;m here to listen.</p>
                        </div>
                    </FadeIn>
                )}

                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                animation: 'activity-fade-in 0.3s ease-out forwards',
                            }}
                        >
                            <div style={{
                                background: isUser ? '#38bdf8' : 'rgba(30, 41, 59, 0.7)',
                                color: isUser ? '#0f172a' : '#f8fafc',
                                padding: '14px 20px',
                                borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                fontSize: '0.95rem',
                                lineHeight: 1.5,
                                border: isUser ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                boxShadow: isUser ? '0 8px 20px -5px rgba(56, 189, 248, 0.3)' : '0 8px 20px -5px rgba(0,0,0,0.2)',
                            }}>
                                {msg.content.split('\n').map((line, i) => (
                                    <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0 0' }}>{line || '\u00A0'}</p>
                                ))}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#64748b',
                                marginTop: 6,
                                textAlign: isUser ? 'right' : 'left',
                                padding: '0 4px'
                            }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}

                {/* Streaming indicator */}
                {isSending && streamingContent && (
                    <div style={{ alignSelf: 'flex-start', maxWidth: '80%', animation: 'activity-fade-in 0.3s ease-out' }}>
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            color: '#f8fafc',
                            padding: '14px 20px',
                            borderRadius: '20px 20px 20px 4px',
                            fontSize: '0.95rem',
                            lineHeight: 1.5,
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)',
                        }}>
                            {streamingContent.split('\n').map((line, i) => (
                                <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0 0' }}>{line || '\u00A0'}</p>
                            ))}
                            <span style={{ 
                                display: 'inline-block', width: '6px', height: '14px', 
                                background: '#38bdf8', borderRadius: '2px', 
                                animation: 'pulse-glow 1s ease infinite', 
                                verticalAlign: 'text-bottom',
                                marginLeft: '4px'
                            }} />
                        </div>
                    </div>
                )}

                {isSending && !streamingContent && (
                    <div style={{ alignSelf: 'flex-start', animation: 'activity-fade-in 0.3s ease-out' }}>
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            padding: '16px 20px',
                            borderRadius: '20px 20px 20px 4px',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'float-gentle 1s infinite 0s' }} />
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'float-gentle 1s infinite 0.2s' }} />
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: 'float-gentle 1s infinite 0.4s' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Crisis resources */}
                {crisis && crisis.isCrisis && (
                    <FadeIn direction="up">
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 20,
                            padding: 24,
                            marginTop: 16,
                            boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.15)'
                        }}>
                            <h3 style={{ color: '#fca5a5', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                💚 Support is available
                            </h3>
                            <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 20 }}>
                                {crisis.safetyMessage || "It sounds like you're going through a really tough time. There are people who want to support you right now:"}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {Object.values(crisis.resources).map(res => (
                                    <div key={res.name} style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 4 }}>{res.name}</strong>
                                        <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{res.number}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{res.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                )}

                <div ref={messagesEndRef} style={{ height: 1 }} />
            </div>

            {/* Input area */}
            <div style={{ padding: '0 32px 32px 32px', zIndex: 10 }}>
                <div style={{ 
                    position: 'relative', 
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${input.trim() ? '#38bdf860' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 24,
                    padding: '8px 8px 8px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: input.trim() ? '0 0 30px rgba(56, 189, 248, 0.1)' : '0 10px 30px -10px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                }}>
                    <textarea
                        ref={textareaRef}
                        placeholder="Type a message..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={isSending}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#f8fafc',
                            fontSize: '1rem',
                            resize: 'none',
                            outline: 'none',
                            maxHeight: 120,
                            padding: '12px 0',
                            lineHeight: 1.5,
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        aria-label="Send message"
                        style={{
                            width: 44, height: 44,
                            borderRadius: 16,
                            background: input.trim() ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                            color: input.trim() ? '#0f172a' : '#64748b',
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: input.trim() && !isSending ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            marginLeft: 12,
                            flexShrink: 0,
                            boxShadow: input.trim() ? '0 5px 15px -3px rgba(56, 189, 248, 0.4)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (input.trim() && !isSending) e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            if (input.trim() && !isSending) e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 2 }}>
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes pulse-glow {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.8)); }
                    50% { opacity: 0.5; filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.3)); }
                }
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div>
    );
}
