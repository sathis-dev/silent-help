'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { useWellness } from '@/components/wellness/WellnessProvider';
import type { WellnessProfile } from '@/lib/api';

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
   Tier-specific config
   ═══════════════════════════════════════════════ */
type StressLevel = 'low' | 'mid-low' | 'mid-high' | 'high';

interface TierConfig {
    message: string;
    subtitle: string;
    accent: string;
    gradient: string;
    modules: { id: string; icon: string; title: string; desc: string; duration: string; color: string }[];
}

const TIER_CONFIG: Record<StressLevel, TierConfig> = {
    low: {
        message: "You're doing okay — let's keep you steady.",
        subtitle: 'Your stress looks low right now. That\'s good — your mind and body are still coping. Let\'s keep it that way with a quick reset.',
        accent: '#2dd4bf',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
        modules: [
            { id: 'calm60', icon: '🌊', title: 'Calm in 60s', desc: 'Paced breathing for instant calm', duration: '1 min', color: '#2dd4bf' },
            { id: 'cyclic', icon: '😮‍💨', title: 'Cyclic Sigh', desc: 'Research-backed stress reset', duration: '30 sec', color: '#5eead4' },
            { id: 'ground', icon: '🖐️', title: '5-4-3-2-1 Grounding', desc: 'Reconnect through your senses', duration: '3 min', color: '#14b8a6' },
            { id: 'breathe3', icon: '🧘', title: '3-Min Breathing Space', desc: 'Quick mindfulness reset', duration: '3 min', color: '#0d9488' },
            { id: 'gratitude', icon: '🙏', title: 'One Good Thing', desc: 'Micro gratitude note', duration: '1 min', color: '#99f6e4' },
        ],
    },
    'mid-low': {
        message: "Stress is building — let's stop it from growing.",
        subtitle: 'Your stress is present but manageable. Now is a good time to actively support yourself before it grows.',
        accent: '#38bdf8',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 100%)',
        modules: [
            { id: 'unhook', icon: '🏷️', title: 'Unhook a Stress Thought', desc: 'Name & release stress thoughts', duration: '5 min', color: '#38bdf8' },
            { id: 'sleep', icon: '🌙', title: 'Sleep Tonight', desc: 'Wind-down routine for better rest', duration: '5 min', color: '#818cf8' },
            { id: 'kindness', icon: '💚', title: 'Kindness Reset', desc: 'Self-compassion pause', duration: '3 min', color: '#34d399' },
            { id: 'plan', icon: '📋', title: 'Plan My Next Hour', desc: 'Simple time management helper', duration: '3 min', color: '#f59e0b' },
        ],
    },
    'mid-high': {
        message: "This is affecting you more now — let's help you regain control.",
        subtitle: 'Your stress is quite high right now. It may be affecting your concentration, mood, or sleep. Let\'s slow it down and work through one step at a time.',
        accent: '#a78bfa',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
        modules: [
            { id: 'reset10', icon: '🔄', title: '10-Minute Reset', desc: 'Full structured intervention', duration: '10 min', color: '#a78bfa' },
            { id: 'reframe', icon: '🧠', title: 'Reframe This Stress', desc: 'CBT-based cognitive reframing', duration: '7 min', color: '#818cf8' },
            { id: 'solve', icon: '💡', title: 'Solve One Problem', desc: '3-step problem solver', duration: '5 min', color: '#c4b5fd' },
            { id: 'doone', icon: '✅', title: 'Do One Thing Now', desc: 'Behavioural activation micro-plan', duration: '5 min', color: '#8b5cf6' },
            { id: 'bodyreset', icon: '✨', title: 'Body Scan Reset', desc: 'Progressive muscle relaxation', duration: '10 min', color: '#7c3aed' },
        ],
    },
    high: {
        message: "Focus only on the next minute. Let's stabilise first.",
        subtitle: 'You seem under a lot of stress right now. You are safe here. Start with this grounding step.',
        accent: '#f87171',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #450a0a 100%)',
        modules: [
            { id: 'groundnow', icon: '🖐️', title: 'Ground Me Now', desc: '60-second orientation exercise', duration: '1 min', color: '#f87171' },
            { id: 'breathenow', icon: '🌊', title: 'Help Me Breathe', desc: '2-minute breathing reset', duration: '2 min', color: '#fb923c' },
            { id: 'staywithme', icon: '💬', title: 'Stay With Me', desc: 'Calm guided script', duration: '3 min', color: '#fbbf24' },
            { id: 'getsupport', icon: '🤝', title: 'Get Support', desc: 'Professional support options', duration: '', color: '#818cf8' },
            { id: 'safety', icon: '🛡️', title: 'Safety Help', desc: 'Crisis resources & safety plan', duration: '', color: '#ef4444' },
        ],
    },
};

/* ═══════════════════════════════════════════════
   Breathing Exercise Component
   ═══════════════════════════════════════════════ */
function BreathingExercise({ accent, onClose }: { accent: string; onClose: () => void }) {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
    const [count, setCount] = useState(4);
    const [cycles, setCycles] = useState(0);
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (!active) return;
        const timer = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    setPhase(p => {
                        if (p === 'inhale') return 'hold';
                        if (p === 'hold') return 'exhale';
                        if (p === 'exhale') { setCycles(c => c + 1); return 'rest'; }
                        return 'inhale';
                    });
                    return 4;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [active]);

    const phaseLabel = { inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out', rest: 'Rest' };
    const scaleMap = { inhale: 1.3, hold: 1.3, exhale: 0.8, rest: 0.8 };

    return (
        <div className="breathing-overlay">
            <button className="breathing-close" onClick={onClose}>✕</button>
            <div className="breathing-content">
                <div className="breathing-circle" style={{
                    borderColor: accent,
                    transform: active ? `scale(${scaleMap[phase]})` : 'scale(1)',
                    boxShadow: `0 0 ${active ? 60 : 20}px ${accent}40`
                }}>
                    <span className="breathing-label">{active ? phaseLabel[phase] : 'Tap to Start'}</span>
                    {active && <span className="breathing-count">{count}</span>}
                </div>
                {!active ? (
                    <button className="breathing-start" style={{ background: accent }} onClick={() => setActive(true)}>
                        Begin Breathing
                    </button>
                ) : (
                    <p className="breathing-cycles">Cycles completed: {cycles}</p>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Crisis Bar (High stress only)
   ═══════════════════════════════════════════════ */
function CrisisBar() {
    return (
        <div className="crisis-bar">
            <div className="crisis-bar-inner">
                <span className="crisis-icon">🛡️</span>
                <div className="crisis-text">
                    <strong>You are not alone.</strong>
                    <span>If you or someone you know is in crisis, reach out now.</span>
                </div>
                <div className="crisis-links">
                    <a href="tel:988" className="crisis-link emergency">988 Lifeline</a>
                    <a href="tel:116123" className="crisis-link">Samaritans: 116 123</a>
                    <a href="sms:741741" className="crisis-link">Crisis Text: 741741</a>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Module Card Component
   ═══════════════════════════════════════════════ */
function ModuleCard({ 
    module, 
    index, 
    tierLevel, 
    onClick 
}: { 
    module: TierConfig['modules'][0]; 
    index: number; 
    tierLevel: StressLevel;
    onClick: () => void;
}) {
    const isHighLevel = tierLevel === 'high';
    return (
        <button
            className={`module-card module-card-${tierLevel}`}
            style={{ 
                '--module-color': module.color,
                animationDelay: `${index * 100}ms`,
            } as React.CSSProperties}
            onClick={onClick}
        >
            <div className="module-card-glow" />
            <div className="module-icon-wrap" style={{ background: `${module.color}15` }}>
                <span className="module-icon">{module.icon}</span>
            </div>
            <div className="module-info">
                <h4 className="module-title">{module.title}</h4>
                {!isHighLevel && <p className="module-desc">{module.desc}</p>}
            </div>
            {module.duration && (
                <span className="module-duration" style={{ color: module.color }}>{module.duration}</span>
            )}
            <div className="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </div>
        </button>
    );
}

/* ═══════════════════════════════════════════════
   Reflection Slider (Low stress)
   ═══════════════════════════════════════════════ */
function ReflectionSlider({ accent }: { accent: string }) {
    const [value, setValue] = useState(3);
    const [submitted, setSubmitted] = useState(false);
    const labels = ['😟', '😐', '🙂', '😊', '😌'];
    
    if (submitted) {
        return (
            <div className="reflection-done">
                <span className="reflection-emoji">{labels[value - 1]}</span>
                <p>Thanks for checking in!</p>
            </div>
        );
    }

    return (
        <div className="reflection-slider">
            <p className="reflection-question">How did that feel?</p>
            <div className="reflection-track">
                <input
                    type="range" min="1" max="5" value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    style={{ accentColor: accent }}
                />
                <div className="reflection-labels">
                    {labels.map((l, i) => (
                        <span key={i} className={value === i + 1 ? 'active' : ''}>{l}</span>
                    ))}
                </div>
            </div>
            <button className="reflection-submit" style={{ borderColor: accent, color: accent }} onClick={() => setSubmitted(true)}>
                Done
            </button>
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
    const [activeBreathing, setActiveBreathing] = useState(false);
    const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
    
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

    const handleModuleClick = (moduleId: string) => {
        if (moduleId === 'calm60' || moduleId === 'breathenow' || moduleId === 'cyclic' || moduleId === 'breathe3') {
            setActiveBreathing(true);
        } else {
            setCompletedModules(prev => new Set([...prev, moduleId]));
        }
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
    const stressLevel: StressLevel = p.stressLevel || 'low';
    const tier = TIER_CONFIG[stressLevel];
    const userName = user?.firstName || (typeof window !== 'undefined' ? localStorage.getItem('sh_guest_name') : null) || 'Friend';
    const greeting = getGreeting();

    return (
        <div 
            className={`dashboard-page dashboard-${stressLevel}`}
            ref={containerRef}
            style={{ 
                '--tier-gradient': tier.gradient,
                '--tier-accent': tier.accent,
            } as React.CSSProperties}
        >
            {/* Breathing Exercise Overlay */}
            {activeBreathing && (
                <BreathingExercise accent={tier.accent} onClose={() => setActiveBreathing(false)} />
            )}

            {/* Ambient Background */}
            <div className="dashboard-ambient">
                <div className="ambient-orb orb-1" style={{ background: `radial-gradient(circle, ${tier.accent}20, transparent 70%)` }} />
                <div className="ambient-orb orb-2" style={{ background: `radial-gradient(circle, ${tier.accent}10, transparent 60%)` }} />
            </div>

            {/* Crisis Bar — always visible for HIGH */}
            {stressLevel === 'high' && <CrisisBar />}

            {/* Main Content */}
            <div className={`dashboard-container ${show ? 'visible' : ''}`}>
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        {isSignedIn ? (
                            <div className="user-avatar" style={{ borderColor: tier.accent, background: 'transparent', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-full", userButtonTrigger: "focus:shadow-none" } }} />
                            </div>
                        ) : (
                            <div className="user-avatar" style={{ borderColor: tier.accent }}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="header-greeting">
                            <h1>
                                {greeting}, <span style={{ color: tier.accent }}>{userName}</span>
                            </h1>
                            <p style={{ color: `${tier.accent}aa` }}>{tier.message}</p>
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

                {/* Stress Level Banner */}
                <div className="stress-level-banner" style={{ borderColor: `${tier.accent}30` }}>
                    <div className="stress-level-indicator">
                        <div className="stress-dots">
                            {['low', 'mid-low', 'mid-high', 'high'].map((level) => (
                                <div 
                                    key={level}
                                    className={`stress-dot ${level === stressLevel ? 'active' : ''}`}
                                    style={level === stressLevel ? { background: tier.accent, boxShadow: `0 0 12px ${tier.accent}` } : {}}
                                />
                            ))}
                        </div>
                        <span className="stress-level-label" style={{ color: tier.accent }}>
                            {stressLevel === 'low' ? 'Low Stress' : stressLevel === 'mid-low' ? 'Mild Stress' : stressLevel === 'mid-high' ? 'Moderate Stress' : 'High Stress'}
                        </span>
                    </div>
                    <p className="stress-subtitle">{tier.subtitle}</p>
                </div>

                {/* AI Insight */}
                {p.aiInsight && (
                    <div className="ai-insight-card" style={{ borderColor: `${tier.accent}25` }}>
                        <div className="ai-insight-icon" style={{ background: `${tier.accent}15` }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tier.accent} strokeWidth="2">
                                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                                <path d="M9 21h6M10 17h4" />
                            </svg>
                        </div>
                        <p>{p.aiInsight}</p>
                    </div>
                )}

                {/* Module Cards */}
                <div className="modules-section">
                    <h3 className="section-title">
                        {stressLevel === 'low' ? 'Quick Reset Tools' : 
                         stressLevel === 'mid-low' ? 'Your Coping Toolkit' : 
                         stressLevel === 'mid-high' ? 'Guided Interventions' : 
                         'Immediate Support'}
                    </h3>
                    <div className={`modules-grid modules-grid-${stressLevel}`}>
                        {tier.modules.map((mod, i) => (
                            <ModuleCard
                                key={mod.id}
                                module={mod}
                                index={i}
                                tierLevel={stressLevel}
                                onClick={() => handleModuleClick(mod.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Reflection Slider (Low stress only) */}
                {stressLevel === 'low' && completedModules.size > 0 && (
                    <ReflectionSlider accent={tier.accent} />
                )}

                {/* Affirmation */}
                <div className="affirmation-card" style={{ background: `${tier.accent}08`, borderColor: `${tier.accent}20` }}>
                    <span className="affirmation-icon">✨</span>
                    <p>{p.affirmation}</p>
                </div>

                {/* Companion Chat Mini */}
                {stressLevel !== 'high' && (
                    <div className="chat-mini-section">
                        <button className="chat-mini-btn" onClick={() => router.push('/chat')} style={{ borderColor: `${tier.accent}30` }}>
                            <div className="chat-mini-avatar" style={{ background: `${tier.accent}15` }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tier.accent} strokeWidth="2">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <div className="chat-mini-text">
                                <strong>Talk to your AI Companion</strong>
                                <span>{p.aiPersonality?.openingMessage?.substring(0, 60) || 'I\'m here whenever you need to talk'}...</span>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tier.accent} strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Footer */}
                <footer className="dashboard-footer">
                    <p>
                        Your dashboard adapts to your wellness profile.{' '}
                        <button onClick={handleReassess} style={{ color: tier.accent }}>
                            Take the assessment again
                        </button>{' '}
                        for a fresh experience.
                    </p>
                </footer>
            </div>
        </div>
    );
}
