'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
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

/* ═══════════════════════════════════════════════
   Quick Action Widget Data
   ═══════════════════════════════════════════════ */
const defaultWidgets = [
    { id: 'stress', icon: '🌊', label: 'Stress Relief', desc: 'Calm techniques', color: '#4a9fa4' },
    { id: 'reflect', icon: '📝', label: 'Daily Reflection', desc: 'Journal prompts', color: '#818cf8' },
    { id: 'focus', icon: '🎯', label: 'Focus Mode', desc: 'Deep concentration', color: '#f59e0b' },
    { id: 'sleep', icon: '🌙', label: 'Sleep Aid', desc: 'Rest preparation', color: '#8b5cf6' },
    { id: 'breathe', icon: '🧘', label: 'Breathing', desc: 'Box breathing', color: '#2dd4bf' },
    { id: 'move', icon: '🏃', label: 'Movement', desc: 'Gentle exercise', color: '#f472b6' },
];

/* ═══════════════════════════════════════════════
   Time-based Greeting
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
   Wellness State Messages
   ═══════════════════════════════════════════════ */
function getWellnessMessage(archetype: string): string {
    const messages: Record<string, string> = {
        'Calm Seeker': "Let's find your inner peace today.",
        'Anxious Mind': "Let's ease the tension together.",
        'Restless Spirit': "Let's channel your energy positively.",
        'Overwhelmed Soul': "Let's break things into smaller steps.",
        'Tired Warrior': "Let's restore your strength gently.",
        'Scattered Thinker': "Let's bring clarity to your thoughts.",
    };
    return messages[archetype] || "Let's nurture your wellbeing today.";
}

/* ═══════════════════════════════════════════════
   Bento Widget Card
   ═══════════════════════════════════════════════ */
function BentoWidget({ 
    widget, 
    index, 
    isEditing, 
    onDragStart, 
    onDragOver, 
    onDrop 
}: { 
    widget: typeof defaultWidgets[0]; 
    index: number; 
    isEditing: boolean;
    onDragStart: (index: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (index: number) => void;
}) {
    return (
        <div
            className={`bento-widget ${isEditing ? 'editing' : ''}`}
            style={{ 
                '--widget-color': widget.color,
                animationDelay: `${index * 80}ms`,
            } as React.CSSProperties}
            draggable={isEditing}
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
        >
            <div className="bento-widget-glow" />
            <div className="bento-widget-content">
                <div className="bento-widget-icon">{widget.icon}</div>
                <div className="bento-widget-text">
                    <span className="bento-widget-label">{widget.label}</span>
                    <span className="bento-widget-desc">{widget.desc}</span>
                </div>
            </div>
            {isEditing && (
                <div className="bento-widget-drag">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="5" r="1" fill="currentColor" />
                        <circle cx="9" cy="12" r="1" fill="currentColor" />
                        <circle cx="9" cy="19" r="1" fill="currentColor" />
                        <circle cx="15" cy="5" r="1" fill="currentColor" />
                        <circle cx="15" cy="12" r="1" fill="currentColor" />
                        <circle cx="15" cy="19" r="1" fill="currentColor" />
                    </svg>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Embedded AI Chat Widget
   ═══════════════════════════════════════════════ */
function AIChatWidget({ accent, onExpand }: { accent: string; onExpand: () => void }) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    
    const suggestions = [
        "How can I reduce stress today?",
        "I need help sleeping better",
        "Help me focus on my work",
    ];

    const handleSend = () => {
        if (!message.trim()) return;
        setIsTyping(true);
        setAiResponse(null);
        
        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);
            setAiResponse("I hear you. Let me suggest a quick breathing exercise that can help center your thoughts. Would you like to try the 4-7-8 technique together?");
        }, 1500);
    };

    return (
        <div className="ai-chat-widget">
            <div className="ai-chat-header">
                <div className="ai-chat-avatar" style={{ background: `${accent}20` }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                        <path d="M9 21h6" />
                    </svg>
                </div>
                <div className="ai-chat-title">
                    <h4>AI Companion</h4>
                    <span className="ai-status">
                        <span className="ai-status-dot" style={{ background: accent }} />
                        Online
                    </span>
                </div>
                <button className="ai-chat-expand" onClick={onExpand}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7" />
                    </svg>
                </button>
            </div>

            <div className="ai-chat-body">
                {!aiResponse && !isTyping && (
                    <div className="ai-chat-suggestions">
                        <p>Quick suggestions:</p>
                        {suggestions.map((suggestion, i) => (
                            <button 
                                key={i} 
                                className="ai-suggestion"
                                onClick={() => setMessage(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {isTyping && (
                    <div className="ai-typing-response">
                        <div className="ai-typing-avatar" style={{ background: `${accent}20` }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                            </svg>
                        </div>
                        <div className="ai-typing-bubble">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                        </div>
                    </div>
                )}

                {aiResponse && (
                    <div className="ai-response-message">
                        <div className="ai-response-avatar" style={{ background: `${accent}20` }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                            </svg>
                        </div>
                        <div className="ai-response-bubble" style={{ borderColor: `${accent}30` }}>
                            {aiResponse}
                        </div>
                    </div>
                )}
            </div>

            <div className="ai-chat-input-area">
                <input
                    type="text"
                    placeholder="Ask me anything about your wellness..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    className="ai-send-btn"
                    style={{ background: accent }}
                    onClick={handleSend}
                    disabled={!message.trim()}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/* ===============================================
   Emotion Badge Data
   =============================================== */
const EMOTION_META: Record<string, { icon: string; label: string; color: string }> = {
    anxious:     { icon: '\uD83E\uDDE0', label: 'Anxiety Detected',     color: '#38bdf8' },
    frustrated:  { icon: '\uD83D\uDD25', label: 'Frustration Detected', color: '#f97316' },
    sad:         { icon: '\uD83D\uDCA7', label: 'Sadness Detected',     color: '#818cf8' },
    overwhelmed: { icon: '\uD83C\uDF0A', label: 'Overwhelm Detected',   color: '#a78bfa' },
    pressure:    { icon: '\u26A1',       label: 'Pressure Detected',    color: '#2dd4bf' },
};

/* ===============================================
   Recommended Recovery Path Component
   =============================================== */
function RecommendedPath({ profile, accent }: { profile: WellnessProfile; accent: string }) {
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [animating, setAnimating] = useState(false);
    const tools = profile.tools.slice(0, 5);
    const allDone = completedSteps.size >= tools.length;

    const emotionKey = (profile as unknown as Record<string, unknown>).emotionalProfile as string || 'pressure';
    const emotionInfo = EMOTION_META[emotionKey] || EMOTION_META.pressure;

    const handleComplete = (stepIndex: number) => {
        setAnimating(true);
        const next = new Set(completedSteps);
        next.add(stepIndex);
        setCompletedSteps(next);
        setTimeout(() => {
            if (stepIndex + 1 < tools.length) {
                setActiveStep(stepIndex + 1);
            }
            setAnimating(false);
        }, 500);
    };

    const handleReset = () => {
        setCompletedSteps(new Set());
        setActiveStep(0);
    };

    return (
        <div className="recovery-path-section">
            <div className="recovery-header">
                <div className="recovery-header-left">
                    <h3>Your Recovery Path</h3>
                    <p className="recovery-subtitle">Follow these steps in order &mdash; each one builds on the last</p>
                </div>
                <div className="recovery-emotion-badge" style={{ background: `${emotionInfo.color}15`, borderColor: `${emotionInfo.color}40` }}>
                    <span className="emotion-badge-icon">{emotionInfo.icon}</span>
                    <span style={{ color: emotionInfo.color }}>{emotionInfo.label}</span>
                </div>
            </div>

            <div className="recovery-progress">
                <div className="recovery-progress-track">
                    <div
                        className="recovery-progress-fill"
                        style={{
                            width: `${(completedSteps.size / tools.length) * 100}%`,
                            background: `linear-gradient(90deg, ${accent}, ${emotionInfo.color})`,
                        }}
                    />
                </div>
                <span className="recovery-progress-label">
                    {completedSteps.size}/{tools.length} completed
                </span>
            </div>

            {allDone && (
                <div className="recovery-done-card" style={{ borderColor: `${accent}40` }}>
                    <div className="recovery-done-glow" style={{ background: `radial-gradient(circle, ${accent}20, transparent 70%)` }} />
                    <span className="recovery-done-icon">{'\uD83C\uDF89'}</span>
                    <h4>Amazing &mdash; You Completed Your Path!</h4>
                    <p>You have worked through every recommended step. Take a moment to notice how you feel now compared to when you started.</p>
                    <button className="recovery-reset-btn" onClick={handleReset} style={{ color: accent, borderColor: `${accent}40` }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 4v6h6M23 20v-6h-6" />
                            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                        </svg>
                        Start Again
                    </button>
                </div>
            )}

            {!allDone && (
                <div className="recovery-steps">
                    {tools.map((tool, i) => {
                        const isActive = i === activeStep && !completedSteps.has(i);
                        const isDone = completedSteps.has(i);
                        const isLocked = i > activeStep && !isDone;

                        return (
                            <div
                                key={tool.id + '-' + i}
                                className={`recovery-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''} ${animating && isDone && i === activeStep - 1 ? 'completing' : ''}`}
                                style={{ '--step-accent': accent, '--emotion-color': emotionInfo.color } as React.CSSProperties}
                            >
                                <div className={`recovery-step-number ${isDone ? 'done' : ''}`} style={isDone ? { background: accent, borderColor: accent } : isActive ? { borderColor: accent, color: accent } : {}}>
                                    {isDone ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    ) : (
                                        <span>{i + 1}</span>
                                    )}
                                </div>

                                {isDone && (
                                    <div className="recovery-step-collapsed">
                                        <span className="recovery-step-icon-small">{tool.icon}</span>
                                        <span className="recovery-step-name-small">{tool.name}</span>
                                        <span className="recovery-step-check" style={{ color: accent }}>{'\u2713'} Done</span>
                                    </div>
                                )}

                                {isActive && (
                                    <div className="recovery-step-card" style={{ borderColor: `${accent}30` }}>
                                        <div className="recovery-step-card-glow" style={{ background: `radial-gradient(ellipse at top, ${accent}12, transparent 70%)` }} />
                                        <div className="recovery-step-card-header">
                                            <span className="recovery-step-card-icon">{tool.icon}</span>
                                            <div className="recovery-step-card-meta">
                                                <h4>{tool.name}</h4>
                                                <span className="recovery-step-technique">{tool.technique}</span>
                                            </div>
                                            <span className="recovery-step-duration" style={{ background: `${accent}15`, color: accent }}>
                                                {tool.duration} min
                                            </span>
                                        </div>
                                        <p className="recovery-step-description">{tool.description}</p>
                                        <div className="recovery-step-instructions">
                                            <span className="recovery-instructions-label" style={{ color: accent }}>How to do it:</span>
                                            <p>{tool.instructions}</p>
                                        </div>
                                        <button
                                            className="recovery-complete-btn"
                                            style={{ background: accent }}
                                            onClick={() => handleComplete(i)}
                                        >
                                            I have done this
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {isLocked && (
                                    <div className="recovery-step-locked">
                                        <span className="recovery-step-icon-small">{tool.icon}</span>
                                        <span className="recovery-step-name-small">{tool.name}</span>
                                        <span className="recovery-step-lock">{'\uD83D\uDD12'}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ===============================================
   Insight Card Component
   ═══════════════════════════════════════════════ */
function InsightCard({ profile, accent }: { profile: WellnessProfile; accent: string }) {
    return (
        <div className="insight-card" style={{ '--accent': accent } as React.CSSProperties}>
            <div className="insight-header">
                <div className="insight-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                        <path d="M9 21h6M10 17h4" />
                    </svg>
                </div>
                <span>AI Insight</span>
            </div>
            <p className="insight-text">{profile.aiInsight}</p>
            <div className="insight-glow" style={{ background: `radial-gradient(circle, ${accent}15, transparent 70%)` }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Stats Mini Card
   ═══════════════════════════════════════════════ */
function StatsMiniCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
    return (
        <div className="stats-mini-card">
            <div className="stats-icon" style={{ background: `${accent}15`, color: accent }}>
                {icon}
            </div>
            <div className="stats-content">
                <span className="stats-value">{value}</span>
                <span className="stats-label">{label}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Main Dashboard Page
   ═══════════════════════════════════════════════ */
export default function DashboardPage() {
    const router = useRouter();
    const { user, isSignedIn, isLoaded: authLoaded } = useUser();
    const authLoading = !authLoaded;
    const isAuthenticated = !!isSignedIn;
    const { profile, isLoading: wellnessLoading, loadProfile } = useWellness();
    
    const [show, setShow] = useState(false);
    const [widgets, setWidgets] = useState(defaultWidgets);
    const [isEditing, setIsEditing] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isGuest = !isAuthenticated && typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
        if (!authLoading && !isAuthenticated && !isGuest) {
            router.replace('/');
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

    const handleReassess = useCallback(() => {
        router.push('/onboarding');
    }, [router]);

    const handleExpandChat = useCallback(() => {
        router.push('/chat');
    }, [router]);

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (dropIndex: number) => {
        if (dragIndex === null || dragIndex === dropIndex) return;
        const newWidgets = [...widgets];
        const [removed] = newWidgets.splice(dragIndex, 1);
        newWidgets.splice(dropIndex, 0, removed);
        setWidgets(newWidgets);
        setDragIndex(null);
    };

    // Loading state
    if (authLoading || wellnessLoading || !profile) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-content">
                    <div className="dashboard-loading-orb">
                        <div className="loading-orb-inner" />
                        <div className="loading-orb-ring" />
                        <div className="loading-orb-ring ring-2" />
                    </div>
                    <p>Preparing your wellness hub...</p>
                </div>
            </div>
        );
    }

    const p = profile as WellnessProfile;
    const accent = p.theme.accent;
    const userName = user?.firstName || (typeof window !== 'undefined' ? localStorage.getItem('sh_guest_name') : null) || 'Friend';
    const greeting = getGreeting();
    const wellnessMessage = getWellnessMessage(p.archetype);

    const rawEmotion = (p as unknown as Record<string, unknown>).emotionalProfile as string | undefined;
    const emotionKey = rawEmotion ? rawEmotion.toLowerCase() : 'pressure';
    const stressLevelKey = (p as unknown as Record<string, unknown>).stressLevel as string || 'elevated';
    
    // Identity label based directly on stress type
    const identityDisplay = emotionKey.toUpperCase();
    
    // Nickname based on specific stress level + type matrix
    const getNickname = (type: string, level: string) => {
        const t = type.toLowerCase();
        const l = level.toLowerCase();
        
        if (t === 'overwhelmed') {
            if (l === 'light') return 'The Busy Mind';
            if (l === 'elevated') return 'The Juggler';
            if (l === 'intense') return 'The Overloaded';
            if (l === 'urgent') return 'The Breaking Point';
        }
        if (t === 'anxious') {
            if (l === 'light') return 'The Worried Thinker';
            if (l === 'elevated') return 'The Overthinker';
            if (l === 'intense') return 'The Restless Mind';
            if (l === 'urgent') return 'The Storm Within';
        }
        if (t === 'frustrated') {
            if (l === 'light') return 'The Irritated Spark';
            if (l === 'elevated') return 'The Tense Edge';
            if (l === 'intense') return 'The Boiling Point';
            if (l === 'urgent') return 'The Eruption';
        }
        if (t === 'sad') {
            if (l === 'light') return 'The Quiet Mood';
            if (l === 'elevated') return 'The Heavy Heart';
            if (l === 'intense') return 'The Deep Blue';
            if (l === 'urgent') return 'The Empty Space';
        }
        if (t === 'pressure') {
            if (l === 'light') return 'The Steady Path';
            if (l === 'elevated') return 'The Rising Load';
            if (l === 'intense') return 'The Weight of Expectation';
            if (l === 'urgent') return 'The Edge of Burnout';
        }
        return 'The Adaptive Spirit';
    };
    const nickname = getNickname(emotionKey, stressLevelKey);
    
    // Changing focus area based on exact emotional type
    const focusAreaMap: Record<string, string> = {
        anxious: 'Anxiety Relief',
        frustrated: 'Frustration Rel.',
        sad: 'Mood Lift',
        overwhelmed: 'Overwhelm Detox',
        pressure: 'Pressure Drop',
    };
    const focusArea = focusAreaMap[emotionKey] || 'Stress Mgmt';

    return (
        <div 
            className="dashboard-page" 
            ref={containerRef}
            style={{ 
                '--mood-gradient': p.theme.gradient,
                '--accent-color': accent,
            } as React.CSSProperties}
        >
            {/* Ambient Background */}
            <div className="dashboard-ambient">
                <div className="ambient-orb orb-1" style={{ background: `radial-gradient(circle, ${accent}25, transparent 70%)` }} />
                <div className="ambient-orb orb-2" style={{ background: `radial-gradient(circle, ${accent}15, transparent 60%)` }} />
                <div className="ambient-orb orb-3" />
            </div>

            {/* Main Content */}
            <div className={`dashboard-container ${show ? 'visible' : ''}`}>
                {/* Header Section */}
                <header className="dashboard-header">
                    <div className="header-left">
                        {isSignedIn ? (
                            <div className="user-avatar" style={{ borderColor: accent, background: 'transparent', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-full", userButtonTrigger: "focus:shadow-none" } }} />
                            </div>
                        ) : (
                            <div className="user-avatar" style={{ borderColor: accent }}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="header-greeting">
                            <h1>
                                {greeting}, <span style={{ color: accent }}>{userName}</span>
                            </h1>
                            <p>{wellnessMessage}</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="header-btn" onClick={handleReassess}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 4v6h6M23 20v-6h-6" />
                                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                            </svg>
                            <span>Re-assess</span>
                        </button>
                    </div>
                </header>

                {/* Wellness State Banner */}
                <div className="wellness-state-banner" style={{ borderColor: `${accent}30` }}>
                    <div className="state-info">
                        <span className="state-label" style={{ color: accent, marginBottom: 8, display: 'inline-block' }}>Current State</span>
                        <div className="stress-identity" style={{ color: accent, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.9 }}>
                             Identity: {identityDisplay}
                        </div>
                        <h2 className="state-archetype">{nickname}</h2>
                        <p className="state-description">{p.state}</p>
                    </div>
                    <div className="state-affirmation" style={{ background: `${accent}10`, borderColor: `${accent}25` }}>
                        <span className="affirmation-icon">✨</span>
                        <p>{p.affirmation}</p>
                    </div>
                </div>

                {/* Mini Stats Row */}
                <div className="stats-row">
                    <StatsMiniCard 
                        label="Energy Level"
                        value={p.answers.energy ? (p.answers.energy.charAt(0).toUpperCase() + p.answers.energy.slice(1).replace('_', ' ')) : 'Balanced'}
                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
                        accent={accent}
                    />
                    <StatsMiniCard 
                        label="Time Available"
                        value={`${p.answers.time || 5} min`}
                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
                        accent={accent}
                    />
                    <StatsMiniCard 
                        label="Focus Area"
                        value={focusArea}
                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
                        accent={accent}
                    />
                </div>

                {/* AI Insight Card */}
                {p.aiInsight && <InsightCard profile={p} accent={accent} />}

                {/* Your Recovery Path */}
                {p.tools && p.tools.length > 0 && (
                    <>
                        {emotionKey === 'overwhelmed' ? (
                            <OverwhelmRecovery accent={accent} />
                        ) : emotionKey === 'anxious' ? (
                            <AnxiousRecovery accent={accent} />
                        ) : emotionKey === 'frustrated' ? (
                            <FrustratedRecovery accent={accent} />
                        ) : emotionKey === 'sad' ? (
                            <SadRecovery accent={accent} />
                        ) : emotionKey === 'pressure' ? (
                            <PressureRecovery accent={accent} />
                        ) : (
                            <RecommendedPath profile={p} accent={accent} />
                        )}
                        <div className="dashboard-divider" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, transparent)` }} />
                    </>
                )}

                {/* Quick Actions Section */}
                {emotionKey === 'overwhelmed' ? (
                    <OverwhelmQuickActions accent={accent} />
                ) : emotionKey === 'anxious' ? (
                    <AnxiousQuickActions accent={accent} />
                ) : emotionKey === 'frustrated' ? (
                    <FrustratedQuickActions accent={accent} />
                ) : emotionKey === 'sad' ? (
                    <SadQuickActions accent={accent} />
                ) : emotionKey === 'pressure' ? (
                    <PressureQuickActions accent={accent} />
                ) : (
                    <div className="bento-section">
                        <div className="bento-header">
                            <h3>Quick Actions</h3>
                            <button 
                                className={`customize-btn ${isEditing ? 'active' : ''}`}
                                onClick={() => setIsEditing(!isEditing)}
                                style={isEditing ? { background: `${accent}20`, color: accent, borderColor: accent } : {}}
                            >
                                {isEditing ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        Done
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 3v18M3 12h18" />
                                        </svg>
                                        Customize
                                    </>
                                )}
                            </button>
                        </div>
                        <div className={`bento-grid ${isEditing ? 'editing' : ''}`}>
                            {widgets.map((widget, index) => (
                                <BentoWidget
                                    key={widget.id}
                                    widget={widget}
                                    index={index}
                                    isEditing={isEditing}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Chat Widget */}
                <div className="chat-section">
                    <h3>Talk to Your AI Companion</h3>
                    <AIChatWidget accent={accent} onExpand={handleExpandChat} />
                </div>

                {/* Recommended Tools */}
                <div className="tools-section">
                    <h3>Personalized Tools</h3>
                    <div className="tools-grid">
                        <div className="tool-card primary" style={{ borderColor: accent, boxShadow: `0 0 30px ${accent}15` }}>
                            <div className="tool-badge" style={{ background: accent }}>Recommended</div>
                            <span className="tool-icon">{p.primaryTool.icon}</span>
                            <div className="tool-info">
                                <h4>{p.primaryTool.name}</h4>
                                <p>{p.primaryTool.description}</p>
                            </div>
                            <span className="tool-duration">{p.primaryTool.duration} min</span>
                        </div>
                        <div className="tool-card" style={{ borderColor: `${accent}30` }}>
                            <span className="tool-icon">{p.quickRelief.icon}</span>
                            <div className="tool-info">
                                <h4>{p.quickRelief.name}</h4>
                                <p>Quick relief technique</p>
                            </div>
                            <span className="tool-duration">{p.quickRelief.duration} min</span>
                        </div>
                        <div className="tool-card" style={{ borderColor: `${accent}30` }}>
                            <span className="tool-icon">{p.deeperWork.icon}</span>
                            <div className="tool-info">
                                <h4>{p.deeperWork.name}</h4>
                                <p>For deeper exploration</p>
                            </div>
                            <span className="tool-duration">{p.deeperWork.duration} min</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <p>
                        Your dashboard adapts to your wellness profile.{' '}
                        <button onClick={handleReassess} style={{ color: accent }}>
                            Take the assessment again
                        </button>{' '}
                        for a fresh experience.
                    </p>
                </footer>
            </div>
        </div>
    );
}
