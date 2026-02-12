'use client';

import { useRouter } from 'next/navigation';
import { createConversation } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ChatIndexPage() {
    const router = useRouter();
    const { user } = useAuth();

    async function startNewChat() {
        try {
            const data = await createConversation();
            router.push(`/chat/${data.conversation.id}`);
        } catch (err) {
            console.error('Failed to create conversation:', err);
        }
    }

    // Get time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="empty-state" style={{ height: '100%' }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
            }}>
                <span style={{ fontSize: '2rem' }}>🌙</span>
            </div>

            <h2 style={{ fontWeight: 400, marginBottom: '8px' }}>
                {greeting}{user?.name ? `, ${user.name}` : ''}
            </h2>

            <p style={{ maxWidth: '350px', lineHeight: 1.6, marginBottom: '32px' }}>
                I&apos;m here whenever you need to talk, reflect, or just breathe. What&apos;s on your mind?
            </p>

            <button
                className="btn btn-primary"
                onClick={startNewChat}
                style={{ padding: '14px 32px', fontSize: '0.95rem', gap: '8px' }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Start a conversation
            </button>

            <div style={{
                display: 'flex', gap: '16px', marginTop: '40px',
                flexWrap: 'wrap', justifyContent: 'center',
            }}>
                {[
                    { icon: '🌊', label: 'Breathing', desc: 'Calm your mind' },
                    { icon: '📝', label: 'Journal', desc: 'Write it out' },
                    { icon: '🧘', label: 'Grounding', desc: '5-4-3-2-1' },
                ].map(tool => (
                    <div
                        key={tool.label}
                        className="card"
                        style={{
                            width: '110px', textAlign: 'center', cursor: 'pointer',
                            padding: '16px 12px',
                        }}
                    >
                        <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{tool.icon}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{tool.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tool.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
