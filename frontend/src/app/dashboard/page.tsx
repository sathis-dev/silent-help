'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWellness } from '@/components/wellness/WellnessProvider';
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

/* ═══════════════════════════════════════════════
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
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { profile, isLoading: wellnessLoading, loadProfile } = useWellness();
    
    const [show, setShow] = useState(false);
    const [widgets, setWidgets] = useState(defaultWidgets);
    const [isEditing, setIsEditing] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/');
            return;
        }
        if (isAuthenticated && !profile) {
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
    const userName = user?.name || 'Friend';
    const greeting = getGreeting();
    const wellnessMessage = getWellnessMessage(p.archetype);

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
                        <div className="user-avatar" style={{ borderColor: accent }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
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
                        <span className="state-label" style={{ color: accent }}>Current State</span>
                        <h2 className="state-archetype">{p.archetype}</h2>
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
                        value={p.answers.energy?.replace('_', ' ') || 'Balanced'}
                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
                        accent={accent}
                    />
                    <StatsMiniCard 
                        label="Time Available"
                        value={`${p.answers.time} min`}
                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
                        accent={accent}
                    />
                    <StatsMiniCard 
                        label="Focus Area"
                        value={p.answers.concern?.replace(/_/g, ' ') || 'General'}
                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
                        accent={accent}
                    />
                </div>

                {/* AI Insight Card */}
                {p.aiInsight && <InsightCard profile={p} accent={accent} />}

                {/* Bento Grid Section */}
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
