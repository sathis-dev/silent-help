'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWellness } from '@/components/wellness/WellnessProvider';
import type { WellnessProfile, WellnessTool } from '@/lib/api';

/* ═══════════════════════════════════════════════
   Helper: Urgency badge color
   ═══════════════════════════════════════════════ */
function urgencyColor(level: string): string {
    switch (level) {
        case 'crisis': return '#ef4444';
        case 'high': return '#f97316';
        case 'moderate': return '#fbbf24';
        case 'low': return '#2dd4bf';
        default: return '#94a3b8';
    }
}

/* ═══════════════════════════════════════════════
   Helper: Category label
   ═══════════════════════════════════════════════ */
function categoryLabel(cat: string): string {
    const map: Record<string, string> = {
        breathing: 'Breathing',
        grounding: 'Grounding',
        movement: 'Movement',
        journaling: 'Journaling',
        cognitive: 'Cognitive',
        rest: 'Rest',
        social: 'Social',
    };
    return map[cat] || cat;
}

/* ═══════════════════════════════════════════════
   Tool Card Component
   ═══════════════════════════════════════════════ */
function ToolCard({ tool, accent, isPrimary, delay }: { tool: WellnessTool; accent: string; isPrimary?: boolean; delay: number }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="dash-tool-card"
            style={{
                animationDelay: `${delay}ms`,
                borderColor: isPrimary ? accent : undefined,
                boxShadow: isPrimary ? `0 0 20px ${accent}20` : undefined,
            }}
            onClick={() => setExpanded(!expanded)}
        >
            {isPrimary && (
                <div className="dash-tool-badge" style={{ background: accent }}>
                    Recommended First
                </div>
            )}
            <div className="dash-tool-header">
                <span className="dash-tool-icon">{tool.icon}</span>
                <div className="dash-tool-info">
                    <h4 className="dash-tool-name">{tool.name}</h4>
                    <span className="dash-tool-meta">
                        <span className="dash-tool-cat">{categoryLabel(tool.category)}</span>
                        <span className="dash-tool-dur">{tool.duration} min</span>
                    </span>
                </div>
                <svg
                    className={`dash-tool-chevron ${expanded ? 'open' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            <p className="dash-tool-desc">{tool.description}</p>
            {expanded && (
                <div className="dash-tool-expand">
                    <div className="dash-tool-technique">
                        <strong>Technique:</strong> {tool.technique}
                    </div>
                    <div className="dash-tool-instructions">
                        <strong>How to:</strong> {tool.instructions}
                    </div>
                </div>
            )}
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
    const [activeTab, setActiveTab] = useState<'tools' | 'insight' | 'ai'>('tools');

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

    const handleChat = useCallback(() => {
        router.push('/chat');
    }, [router]);

    // Loading state
    if (authLoading || wellnessLoading || !profile) {
        return (
            <div className="dash-loading">
                <div className="dash-loading-content">
                    <div className="loading-dots"><span /><span /><span /></div>
                    <p>Analyzing your responses...</p>
                </div>
            </div>
        );
    }

    const p = profile as WellnessProfile;
    const accent = p.theme.accent;

    return (
        <div className="dash-page" style={{ background: p.theme.gradient }}>
            {/* Ambient glow */}
            <div className="dash-ambient">
                <div className="dash-glow" style={{ background: `radial-gradient(circle, ${accent}12, transparent 70%)` }} />
                <div className="dash-glow-2" style={{ background: `radial-gradient(circle, ${accent}08, transparent 60%)` }} />
            </div>

            {/* Main content */}
            <div className={`dash-container ${show ? 'visible' : ''}`}>
                {/* Header */}
                <header className="dash-header">
                    <div className="dash-header-left">
                        <div className="dash-avatar" style={{ borderColor: accent }}>
                            {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className="dash-greeting">{p.theme.greeting}</h2>
                            <p className="dash-user-name">{user?.name || 'Friend'}</p>
                        </div>
                    </div>
                    <div className="dash-header-actions">
                        <button className="dash-btn-ghost" onClick={handleReassess}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 4v6h6M23 20v-6h-6" />
                                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                            </svg>
                            Re-assess
                        </button>
                    </div>
                </header>

                {/* Archetype Card */}
                <div className="dash-archetype" style={{ borderColor: `${accent}40` }}>
                    <div className="dash-archetype-top">
                        <div>
                            <span className="dash-archetype-label" style={{ color: accent }}>Your State</span>
                            <h1 className="dash-archetype-name">{p.archetype}</h1>
                            <p className="dash-archetype-state">{p.state}</p>
                        </div>
                        <div className="dash-urgency" style={{ background: `${urgencyColor(p.urgencyLevel)}20`, color: urgencyColor(p.urgencyLevel) }}>
                            <span className="dash-urgency-dot" style={{ background: urgencyColor(p.urgencyLevel) }} />
                            {p.urgencyLevel.charAt(0).toUpperCase() + p.urgencyLevel.slice(1)} Intensity
                        </div>
                    </div>

                    {/* AI Insight */}
                    {p.aiInsight && (
                        <div className="dash-insight" style={{ borderColor: `${accent}30` }}>
                            <div className="dash-insight-icon" style={{ color: accent }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                                    <path d="M9 21h6M10 17h4" />
                                </svg>
                                AI Insight
                            </div>
                            <p className="dash-insight-text">{p.aiInsight}</p>
                        </div>
                    )}
                </div>

                {/* Affirmation */}
                <div className="dash-affirmation" style={{ background: `${accent}08`, borderColor: `${accent}20` }}>
                    <span className="dash-affirmation-icon">💫</span>
                    <p>{p.affirmation}</p>
                </div>

                {/* Quick Actions Row */}
                <div className="dash-quick-row">
                    <div className="dash-quick-card" style={{ borderColor: `${accent}30` }} onClick={handleChat}>
                        <span className="dash-quick-icon">{p.primaryTool.icon}</span>
                        <div>
                            <h4>Start Here</h4>
                            <p>{p.primaryTool.name}</p>
                        </div>
                    </div>
                    <div className="dash-quick-card" style={{ borderColor: `${accent}30` }}>
                        <span className="dash-quick-icon">{p.quickRelief.icon}</span>
                        <div>
                            <h4>Quick Relief</h4>
                            <p>{p.quickRelief.name}</p>
                        </div>
                    </div>
                    <div className="dash-quick-card" style={{ borderColor: `${accent}30` }}>
                        <span className="dash-quick-icon">{p.deeperWork.icon}</span>
                        <div>
                            <h4>Deeper Work</h4>
                            <p>{p.deeperWork.name}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dash-tabs">
                    <button
                        className={`dash-tab ${activeTab === 'tools' ? 'active' : ''}`}
                        style={activeTab === 'tools' ? { color: accent, borderColor: accent } : undefined}
                        onClick={() => setActiveTab('tools')}
                    >
                        Your Tools
                    </button>
                    <button
                        className={`dash-tab ${activeTab === 'insight' ? 'active' : ''}`}
                        style={activeTab === 'insight' ? { color: accent, borderColor: accent } : undefined}
                        onClick={() => setActiveTab('insight')}
                    >
                        Body & Journal
                    </button>
                    <button
                        className={`dash-tab ${activeTab === 'ai' ? 'active' : ''}`}
                        style={activeTab === 'ai' ? { color: accent, borderColor: accent } : undefined}
                        onClick={() => setActiveTab('ai')}
                    >
                        AI Companion
                    </button>
                </div>

                {/* Tab Content: Tools */}
                {activeTab === 'tools' && (
                    <div className="dash-tools-grid">
                        {p.tools.map((tool, i) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                accent={accent}
                                isPrimary={i === 0}
                                delay={i * 80}
                            />
                        ))}
                    </div>
                )}

                {/* Tab Content: Body & Journal */}
                {activeTab === 'insight' && (
                    <div className="dash-insight-tab">
                        <div className="dash-body-card" style={{ borderColor: `${accent}30` }}>
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                </svg>
                                Body Focus
                            </h3>
                            <p>{p.bodyFocus}</p>
                        </div>

                        <div className="dash-journal-card" style={{ borderColor: `${accent}30` }}>
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                Journal Prompt
                            </h3>
                            <p className="dash-journal-prompt">{p.journalPrompt}</p>
                            <button
                                className="dash-btn-accent"
                                style={{ background: `${accent}20`, color: accent, borderColor: `${accent}40` }}
                                onClick={() => router.push('/journal')}
                            >
                                Open Journal
                            </button>
                        </div>

                        <div className="dash-answers-card" style={{ borderColor: `${accent}30` }}>
                            <h3>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                                Your 6-Step Profile
                            </h3>
                            <div className="dash-answers-grid">
                                <div className="dash-answer">
                                    <span className="dash-answer-label">Energy</span>
                                    <span className="dash-answer-value" style={{ color: accent }}>{p.answers.energy}</span>
                                </div>
                                <div className="dash-answer">
                                    <span className="dash-answer-label">Concern</span>
                                    <span className="dash-answer-value" style={{ color: accent }}>{p.answers.concern?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="dash-answer">
                                    <span className="dash-answer-label">Context</span>
                                    <span className="dash-answer-value" style={{ color: accent }}>{p.answers.context?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="dash-answer">
                                    <span className="dash-answer-label">Approach</span>
                                    <span className="dash-answer-value" style={{ color: accent }}>{p.answers.approach?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="dash-answer">
                                    <span className="dash-answer-label">Support</span>
                                    <span className="dash-answer-value" style={{ color: accent }}>{p.answers.support_style?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="dash-answer">
                                    <span className="dash-answer-label">Time</span>
                                    <span className="dash-answer-value" style={{ color: accent }}>{p.answers.time} min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: AI Companion */}
                {activeTab === 'ai' && (
                    <div className="dash-ai-tab">
                        <div className="dash-ai-preview" style={{ borderColor: `${accent}30` }}>
                            <div className="dash-ai-header">
                                <div className="dash-ai-avatar" style={{ background: `${accent}20`, color: accent }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Your AI Companion</h4>
                                    <p className="dash-ai-tone">Tone: {p.aiPersonality.tone}</p>
                                </div>
                            </div>
                            <div className="dash-ai-message" style={{ background: `${accent}08`, borderColor: `${accent}20` }}>
                                <p>{p.aiPersonality.openingMessage}</p>
                            </div>
                            <button
                                className="dash-btn-primary"
                                style={{ background: accent }}
                                onClick={handleChat}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                                Start Conversation
                            </button>
                        </div>

                        <div className="dash-ai-details" style={{ borderColor: `${accent}30` }}>
                            <h4>How Your AI Adapts</h4>
                            <div className="dash-ai-detail-row">
                                <span className="dash-ai-detail-label">Communication Style</span>
                                <p>{p.aiPersonality.style}</p>
                            </div>
                            {p.aiPersonality.avoidTopics.length > 0 && (
                                <div className="dash-ai-detail-row">
                                    <span className="dash-ai-detail-label">Topics Handled Carefully</span>
                                    <div className="dash-ai-tags">
                                        {p.aiPersonality.avoidTopics.map(topic => (
                                            <span key={topic} className="dash-ai-tag">{topic}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="dash-footer">
                    <p className="dash-footer-text">
                        Your dashboard is uniquely generated from your 6-step assessment.
                        <br />
                        <button className="dash-link" style={{ color: accent }} onClick={handleReassess}>
                            Take it again
                        </button> to get a fresh, personalized experience.
                    </p>
                </div>
            </div>
        </div>
    );
}
