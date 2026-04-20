'use client';

import { useRouter } from 'next/navigation';
import { createConversation } from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import GlowCard from '@/components/animations/GlowCard';
import FadeIn from '@/components/animations/FadeIn';

export default function ChatIndexPage() {
    const router = useRouter();
    const { user } = useUser();

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
        <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <FadeIn direction="up">
                <GlowCard glowColor="#38bdf840" borderRadius={24} style={{ width: '100%', maxWidth: '500px', padding: '48px 32px', textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        boxShadow: '0 0 30px rgba(56, 189, 248, 0.15)',
                    }}>
                        <span style={{ fontSize: '2.5rem' }}>✨</span>
                    </div>

                    <h2 style={{ fontWeight: 600, fontSize: '1.75rem', marginBottom: '12px', color: '#f8fafc' }}>
                        {greeting}{user?.firstName ? `, ${user.firstName}` : ''}
                    </h2>

                    <p style={{ maxWidth: '350px', margin: '0 auto 32px', lineHeight: 1.6, color: '#94a3b8', fontSize: '1.05rem' }}>
                        I&apos;m here whenever you need to talk, reflect, or just breathe. What&apos;s on your mind today?
                    </p>

                    <button
                        onClick={startNewChat}
                        style={{ 
                            padding: '16px 32px', 
                            fontSize: '1rem', 
                            fontWeight: 600,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '12px',
                            background: '#38bdf8',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            width: '100%',
                            boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(56, 189, 248, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(56, 189, 248, 0.4)';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Start a conversation
                    </button>
                    
                    <div style={{
                        display: 'flex', gap: '12px', marginTop: '48px',
                        flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        {[
                            { icon: '🌊', label: 'Breathing', desc: 'Calm your mind', color: '#2dd4bf' },
                            { icon: '📝', label: 'Journal', desc: 'Write it out', color: '#818cf8' },
                            { icon: '🧘', label: 'Grounding', desc: '5-4-3-2-1', color: '#a78bfa' },
                        ].map(tool => (
                            <div
                                key={tool.label}
                                style={{
                                    width: '110px', 
                                    textAlign: 'center', 
                                    padding: '16px 12px',
                                    background: 'rgba(15,23,42,0.4)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{tool.icon}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{tool.label}</div>
                                <div style={{ fontSize: '0.75rem', color: tool.color, marginTop: '2px' }}>{tool.desc}</div>
                            </div>
                        ))}
                    </div>
                </GlowCard>
            </FadeIn>
        </div>
    );
}
