'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { OverwhelmRecovery } from '@/components/dashboard/OverwhelmRecovery';
import { OverwhelmQuickActions } from '@/components/dashboard/OverwhelmQuickActions';
import { AnxiousRecovery } from '@/components/dashboard/AnxiousRecovery';
import { AnxiousQuickActions } from '@/components/dashboard/AnxiousQuickActions';
import { FrustratedRecovery } from '@/components/dashboard/FrustratedRecovery';
import { FrustratedQuickActions } from '@/components/dashboard/FrustratedQuickActions';
import { SadRecovery } from '@/components/dashboard/SadRecovery';
import { SadQuickActions } from '@/components/dashboard/SadQuickActions';
import { PressureRecovery } from '@/components/dashboard/PressureRecovery';
import { PressureQuickActions } from '@/components/dashboard/PressureQuickActions';
import type { WellnessProfile } from '@/lib/api';

// New Animation Components
import FadeIn from '@/components/animations/FadeIn';
import GlowCard from '@/components/animations/GlowCard';
import FlowingGradient from '@/components/animations/FlowingGradient';
import PulseRing from '@/components/animations/PulseRing';
import CountUp from '@/components/animations/CountUp';
import { getThemeForEmotion } from '@/components/layout/IconNav';

/* ═══════════════════════════════════════════════
   Quick Action Widget Data
   ═══════════════════════════════════════════════ */

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'Rest well';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
}


/* ═══════════════════════════════════════════════
   Embedded AI Chat Widget
   ═══════════════════════════════════════════════ */
function AIChatWidget({ accent, onExpand }: { accent: string; onExpand: () => void }) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const handleSend = () => {
        if (!message.trim()) return;
        setIsTyping(true);
        setAiResponse(null);
        setTimeout(() => {
            setIsTyping(false);
            setAiResponse("I hear you. Let me suggest a quick breathing exercise that can help center your thoughts. Would you like to try the 4-7-8 technique together?");
        }, 1500);
    };

    return (
        <GlowCard className="ai-chat-widget" glowColor={accent + '40'} borderRadius={20}>
            <div className="ai-chat-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <PulseRing color={accent} size={36}>
                    <div className="ai-chat-avatar" style={{ background: `${accent}20`, width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                            <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                            <path d="M9 21h6" />
                        </svg>
                    </div>
                </PulseRing>
                <div className="ai-chat-title" style={{ marginLeft: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>AI Companion</h4>
                    <span className="ai-status" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span className="ai-status-dot" style={{ background: accent, display: 'inline-block', width: 6, height: 6, borderRadius: '50%', marginRight: 6 }} />
                        Online
                    </span>
                </div>
                <button className="ai-chat-expand" onClick={onExpand} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7" />
                    </svg>
                </button>
            </div>

            <div className="ai-chat-body" style={{ padding: '24px', minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!aiResponse && !isTyping && (
                    <div className="ai-chat-suggestions" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {["How can I reduce stress today?", "I need help sleeping better", "Help me focus on my work"].map((suggestion, i) => (
                            <button key={i} className="ai-suggestion" onClick={() => setMessage(suggestion)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
                {isTyping && (
                    <div className="ai-typing-response" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div className="ai-typing-avatar" style={{ background: `${accent}20`, padding: 6, borderRadius: '50%' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                            </svg>
                        </div>
                        <div className="ai-typing-bubble" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px' }}>
                            <span className="typing-dot" style={{ width: 4, height: 4, background: 'var(--text-muted)', display: 'inline-block', borderRadius: '50%', margin: '0 2px', animation: 'float-gentle 1s infinite' }} />
                            <span className="typing-dot" style={{ width: 4, height: 4, background: 'var(--text-muted)', display: 'inline-block', borderRadius: '50%', margin: '0 2px', animation: 'float-gentle 1s infinite 0.2s' }} />
                            <span className="typing-dot" style={{ width: 4, height: 4, background: 'var(--text-muted)', display: 'inline-block', borderRadius: '50%', margin: '0 2px', animation: 'float-gentle 1s infinite 0.4s' }} />
                        </div>
                    </div>
                )}
                {aiResponse && (
                    <div className="ai-response-message" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div className="ai-response-avatar" style={{ background: `${accent}20`, padding: 6, borderRadius: '50%' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                            </svg>
                        </div>
                        <div className="ai-response-bubble" style={{ background: `linear-gradient(135deg, ${accent}15, transparent)`, border: `1px solid ${accent}30`, padding: '12px 16px', borderRadius: '16px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {aiResponse}
                        </div>
                    </div>
                )}
            </div>

            <div className="ai-chat-input-area" style={{ padding: '0 24px 24px', display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px', color: 'white', outline: 'none' }}
                />
                <button 
                    onClick={handleSend}
                    disabled={!message.trim()}
                    style={{ background: accent, border: 'none', width: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', opacity: message.trim() ? 1 : 0.5 }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 2 }}>
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </div>
        </GlowCard>
    );
}

const EMOTION_META: Record<string, { icon: string; label: string; color: string }> = {
    anxious:     { icon: '\uD83E\uDDE0', label: 'Anxiety',     color: '#38bdf8' },
    frustrated:  { icon: '\uD83D\uDD25', label: 'Frustration', color: '#f97316' },
    sad:         { icon: '\uD83D\uDCA7', label: 'Sadness',     color: '#818cf8' },
    overwhelmed: { icon: '\uD83C\uDF0A', label: 'Overwhelm',   color: '#a78bfa' },
    pressure:    { icon: '\u26A1',       label: 'Pressure',    color: '#2dd4bf' },
};

/* ═══════════════════════════════════════════════
   Main Dashboard Page - V3 Overhaul
   ═══════════════════════════════════════════════ */
export default function DashboardPage() {
    const router = useRouter();
    const { user, isSignedIn, isLoaded: authLoaded } = useUser();
    const authLoading = !authLoaded;
    const isAuthenticated = !!isSignedIn;
    const { profile, isLoading: wellnessLoading, loadProfile } = useWellness();
    
    const [show, setShow] = useState(false);
    
    useEffect(() => {
        const isGuest = !isAuthenticated && typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
        if (!authLoading && !isAuthenticated && !isGuest) {
            router.replace('/auth/login');
            return;
        }
        if ((isAuthenticated || isGuest) && !profile) {
            loadProfile().then((p) => {
                if (!p) router.replace('/onboarding');
            });
        }
    }, [authLoading, isAuthenticated, profile, loadProfile, router]);

    useEffect(() => {
        if (profile) {
            const t = setTimeout(() => setShow(true), 100);
            return () => clearTimeout(t);
        }
    }, [profile]);

    if (authLoading || wellnessLoading || !profile) {
        return (
            <div className="dashboard-loading" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    const p = profile as WellnessProfile;
    const emotionKey = ((p as unknown as Record<string, unknown>).emotionalProfile as string || 'pressure').toLowerCase();
    const theme = getThemeForEmotion(emotionKey);
    const accent = theme.accent;
    const emotionInfo = EMOTION_META[emotionKey] || EMOTION_META.pressure;
    
    const userName = user?.firstName || (typeof window !== 'undefined' ? localStorage.getItem('sh_guest_name') : null) || 'Friend';
    const greeting = getGreeting();

    const focusAreaMap: Record<string, string> = {
        anxious: 'Anxiety Relief',
        frustrated: 'Frustration Rel.',
        sad: 'Mood Lift',
        overwhelmed: 'Overwhelm Detox',
        pressure: 'Pressure Drop',
    };
    const focusArea = focusAreaMap[emotionKey] || 'Stress Mgmt';

    const timeAvail = parseInt(p.answers.time || '5', 10);

    return (
        <div className={`dashboard-v3 ${show ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            
            <FadeIn direction="up" delay={100}>
                {/* Hero section with flowing gradient */}
                <GlowCard className="hero-section" glowColor={`${accent}40`} borderRadius={24}>
                    <FlowingGradient colors={[theme.accent, theme.glow, accent, '#1d4ed8']} speed={12} style={{ opacity: 0.15 }} />
                    <div className="hero-content">
                        <div className="hero-avatar" style={{ background: theme.bg, borderColor: `${accent}40`, color: accent }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="hero-text">
                            <h1>{greeting}, {userName}</h1>
                            <p>We&apos;ve prepared your personalized space to help you manage {emotionInfo.label.toLowerCase()} today.</p>
                            
                            <div className="hero-affirmation">
                                <span>✨</span>
                                <span>{p.affirmation}</span>
                            </div>
                        </div>
                    </div>
                </GlowCard>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
                <div className="stats-grid">
                    <GlowCard className="stat-card" glowColor={`${accent}30`}>
                        <div className="stat-icon" style={{ background: `${accent}15`, color: accent }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <div>
                            <div className="stat-value" style={{ textTransform: 'capitalize' }}>
                                {(p.answers.energy || 'Balanced').replace('_', ' ')}
                            </div>
                            <div className="stat-label">Energy Level</div>
                        </div>
                    </GlowCard>
                    <GlowCard className="stat-card" glowColor={`${accent}30`}>
                        <div className="stat-icon" style={{ background: `${accent}15`, color: accent }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        </div>
                        <div>
                            <div className="stat-value">
                                <CountUp end={timeAvail} duration={1500} suffix=" min" />
                            </div>
                            <div className="stat-label">Available Time</div>
                        </div>
                    </GlowCard>
                    <GlowCard className="stat-card" glowColor={`${accent}30`}>
                        <div className="stat-icon" style={{ background: `${accent}15`, color: accent }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                        </div>
                        <div>
                            <div className="stat-value">{focusArea}</div>
                            <div className="stat-label">Focus Area</div>
                        </div>
                    </GlowCard>
                </div>
            </FadeIn>

            {p.aiInsight && (
                <FadeIn direction="up" delay={300}>
                    <div className="insight-section">
                        <GlowCard glowColor={`${accent}25`} className="insight-glass">
                            <div className="insight-header" style={{ color: accent }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                                </svg>
                                AI Insight & Analysis
                            </div>
                            <p className="insight-text">{p.aiInsight}</p>
                        </GlowCard>
                    </div>
                </FadeIn>
            )}

            {p.tools && p.tools.length > 0 && (
                <FadeIn direction="up" delay={400}>
                    <div className="recovery-section">
                        {emotionKey === 'overwhelmed' ? <OverwhelmRecovery accent={accent} /> :
                         emotionKey === 'anxious' ? <AnxiousRecovery accent={accent} /> :
                         emotionKey === 'frustrated' ? <FrustratedRecovery accent={accent} /> :
                         emotionKey === 'sad' ? <SadRecovery accent={accent} /> :
                         <PressureRecovery accent={accent} />}
                    </div>
                    <div className="dashboard-divider" />
                </FadeIn>
            )}

            <FadeIn direction="up" delay={500}>
                <div className="quick-actions-section">
                    <h3 className="section-title">Quick Actions</h3>
                    {emotionKey === 'overwhelmed' ? <OverwhelmQuickActions accent={accent} /> :
                     emotionKey === 'anxious' ? <AnxiousQuickActions accent={accent} /> :
                     emotionKey === 'frustrated' ? <FrustratedQuickActions accent={accent} /> :
                     emotionKey === 'sad' ? <SadQuickActions accent={accent} /> :
                     <PressureQuickActions accent={accent} />}
                </div>
            </FadeIn>

            <FadeIn direction="up" delay={600}>
                <div className="chat-section" style={{ marginTop: '32px' }}>
                    <h3 className="section-title">Talk to Your AI Companion</h3>
                    <AIChatWidget accent={accent} onExpand={() => router.push('/chat')} />
                </div>
            </FadeIn>

            <FadeIn direction="up" delay={700}>
                <div className="tools-section">
                    <h3 className="section-title">Personalized Tools</h3>
                    <div className="tools-grid-v3">
                        <GlowCard glowColor={`${accent}40`}>
                            <div className="tool-v3" onClick={() => router.push('/tools')}>
                                <div className="tool-v3-icon" style={{ background: `${accent}20`, color: accent }}>
                                    {p.primaryTool.icon}
                                </div>
                                <div className="tool-v3-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h4>{p.primaryTool.name}</h4>
                                        <span className="tool-v3-badge" style={{ background: accent }}>Recommended</span>
                                    </div>
                                    <p>{p.primaryTool.description}</p>
                                </div>
                                <span className="tool-v3-duration" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                    {p.primaryTool.duration} min
                                </span>
                            </div>
                        </GlowCard>
                    </div>
                </div>
            </FadeIn>

            <footer className="dashboard-footer-v3">
                <p>Your dashboard adapts to your wellness profile. <button onClick={() => router.push('/onboarding')} style={{ color: accent }}>Take the assessment again</button> for a fresh experience.</p>
            </footer>

        </div>
    );
}

