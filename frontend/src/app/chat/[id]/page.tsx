'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { getConversation, sendMessage, type Message, type CrisisInfo } from '@/lib/api';

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
            <div className="empty-state" style={{ height: '100%' }}>
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages area */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
                {messages.length === 0 && !isSending && (
                    <div className="empty-state" style={{ flex: 1 }}>
                        <span className="empty-state-icon">💬</span>
                        <h2>Start the conversation</h2>
                        <p>Type a message below. I&apos;m here to listen.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`animate-fade-in ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                    >
                        {msg.content.split('\n').map((line, i) => (
                            <p key={i}>{line || '\u00A0'}</p>
                        ))}
                    </div>
                ))}

                {/* Streaming indicator */}
                {isSending && streamingContent && (
                    <div className="message-assistant animate-fade-in">
                        {streamingContent.split('\n').map((line, i) => (
                            <p key={i}>{line || '\u00A0'}</p>
                        ))}
                        <span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--accent-primary)', borderRadius: '2px', animation: 'pulse-glow 1s ease infinite', verticalAlign: 'text-bottom' }} />
                    </div>
                )}

                {isSending && !streamingContent && (
                    <div className="message-assistant animate-fade-in">
                        <div className="loading-dots"><span /><span /><span /></div>
                    </div>
                )}

                {/* Crisis resources */}
                {crisis && crisis.isCrisis && (
                    <div className="crisis-banner animate-fade-in">
                        <h3>💚 Support is available</h3>
                        {Object.values(crisis.resources).map(res => (
                            <div key={res.name} className="crisis-resource">
                                <strong>{res.name}:</strong> {res.number} — {res.description}
                            </div>
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="chat-input-container" style={{ position: 'relative' }}>
                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isSending}
                />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    aria-label="Send message"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
