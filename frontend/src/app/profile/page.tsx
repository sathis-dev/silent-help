'use client';

import { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlowCard from '@/components/animations/GlowCard';
import FadeIn from '@/components/animations/FadeIn';
import {
    getWellnessProfile,
    getMoodHistory,
    listConversations,
    type WellnessProfile,
    type MoodLog,
    type ConversationPreview
} from '@/lib/api';

export default function ProfilePage() {
    const { user } = useUser();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'profile' | 'mood' | 'history'>('profile');
    
    const [profile, setProfile] = useState<WellnessProfile | null>(null);
    const [moods, setMoods] = useState<MoodLog[]>([]);
    const [sessions, setSessions] = useState<ConversationPreview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfileData() {
            setLoading(true);
            try {
                const [profRes, moodRes, sessRes] = await Promise.all([
                    getWellnessProfile(),
                    getMoodHistory(),
                    listConversations()
                ]);
                
                if (profRes.hasProfile) {
                    setProfile(profRes.profile);
                }
                setMoods(moodRes.logs || []);
                setSessions(sessRes.conversations || []);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        }
        loadProfileData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { 
            weekday: 'short', day: 'numeric', month: 'short' 
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', { 
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
    };

    const tabs = [
        { id: 'profile', label: 'Wellness Profile', icon: '👤', color: '#38bdf8' },
        { id: 'mood', label: 'Mood History', icon: '📊', color: '#a78bfa' },
        { id: 'history', label: 'AI Sessions', icon: '💬', color: '#2dd4bf' }
    ] as const;

    const accent = tabs.find(t => t.id === activeTab)?.color || '#38bdf8';

    if (loading) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
            
            {/* Back to Dashboard */}
            <FadeIn direction="up">
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: 12,
                        background: 'rgba(15,23,42,0.5)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem',
                        marginBottom: '24px', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}60`; e.currentTarget.style.color = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Dashboard
                </button>
            </FadeIn>
            
            {/* Header Section */}
            <FadeIn direction="up">
                <GlowCard glowColor={`${accent}30`} borderRadius={24} style={{ padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
                        border: `2px solid ${accent}40`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', boxShadow: `0 0 30px ${accent}20`
                    }}>
                        {user?.firstName?.charAt(0) || '🌟'}
                    </div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 600, color: '#f8fafc' }}>
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Your Profile'}
                    </h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>
                        {user?.emailAddresses[0]?.emailAddress}
                    </p>
                    
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                        <SignOutButton>
                            <button style={{
                                padding: '8px 20px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontSize: '0.85rem',
                                transition: 'all 0.2s', fontWeight: 500
                            }}>
                                Sign Out
                            </button>
                        </SignOutButton>
                    </div>
                </GlowCard>
            </FadeIn>

            {/* Tab Navigation */}
            <FadeIn direction="up" delay={50}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 24px', borderRadius: 16, border: 'none', cursor: 'pointer', flexShrink: 0,
                                background: activeTab === tab.id ? `${tab.color}15` : 'rgba(15,23,42,0.4)',
                                borderTop: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid rgba(255,255,255,0.05)',
                                color: activeTab === tab.id ? tab.color : '#64748b',
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeTab === tab.id ? `0 10px 20px -10px ${tab.color}30` : 'none'
                            }}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>
            </FadeIn>

            {/* Tab Contents */}
            <FadeIn direction="up" delay={100}>
                
                {/* WELLNESS PROFILE */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {profile ? (
                            <>
                                <GlowCard glowColor="#38bdf820" borderRadius={20} style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#e2e8f0' }}>Your Core State</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div style={{ background: 'rgba(2,6,23,0.4)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Energy Level</div>
                                            <div style={{ fontSize: '1.1rem', color: '#f8fafc', textTransform: 'capitalize' }}>{profile.answers.energy}</div>
                                        </div>
                                        <div style={{ background: 'rgba(2,6,23,0.4)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Primary Emotion</div>
                                            <div style={{ fontSize: '1.1rem', color: '#f8fafc', textTransform: 'capitalize' }}>{profile.emotionalProfile || 'Unknown'}</div>
                                        </div>
                                        <div style={{ background: 'rgba(2,6,23,0.4)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Target Support Style</div>
                                            <div style={{ fontSize: '1.1rem', color: '#f8fafc', textTransform: 'capitalize' }}>{profile.answers.support_style}</div>
                                        </div>
                                        <div style={{ background: 'rgba(2,6,23,0.4)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: 4 }}>Archetype</div>
                                            <div style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: 600 }}>{profile.archetype}</div>
                                        </div>
                                    </div>
                                </GlowCard>

                                <GlowCard glowColor="#38bdf820" borderRadius={20} style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#e2e8f0' }}>AI Insight</h3>
                                    <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, padding: '16px', background: 'rgba(2,6,23,0.4)', borderRadius: 12, borderLeft: '4px solid #38bdf8' }}>
                                        {profile.aiInsight}
                                    </p>
                                </GlowCard>

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                                    <button 
                                        onClick={() => router.push('/onboarding')}
                                        style={{ padding: '12px 24px', borderRadius: 12, background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Retake Assessment
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15,23,42,0.4)', borderRadius: 20 }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>🧭</span>
                                <h3>No Assessment Profile</h3>
                                <p style={{ color: '#94a3b8', margin: '8px 0 24px 0' }}>You haven&apos;t completed your wellness assessment yet.</p>
                                <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>
                                    Start Assessment
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* MOOD HISTORY */}
                {activeTab === 'mood' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {moods.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15,23,42,0.4)', borderRadius: 20 }}>
                                <p style={{ color: '#94a3b8', margin: 0 }}>No mood logs recorded yet.</p>
                            </div>
                        ) : (
                            <>
                                <GlowCard glowColor="#a78bfa20" borderRadius={20} style={{ padding: '24px 20px', marginBottom: 8, height: 280 }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#e2e8f0' }}>Intensity Over Time</h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <LineChart data={[...moods].reverse().map(m => ({ time: formatTime(m.createdAt), intensity: m.intensity, mood: m.mood }))}>
                                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={12} />
                                            <Tooltip 
                                                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '12px' }}
                                                itemStyle={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.95rem' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: 4, fontSize: '0.85rem' }}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                formatter={(val: unknown, _name: unknown, props: Record<string, any>) => [`${val}/10 (Feeling ${props.payload.mood})`, 'Intensity']}
                                            />
                                            <Line type="monotone" dataKey="intensity" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', stroke: '#a78bfa', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#a78bfa', stroke: '#fff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </GlowCard>
                                {moods.map((log) => (
                                    <GlowCard key={log.id} glowColor="#a78bfa15" borderRadius={16} style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                    <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', margin: 0, textTransform: 'capitalize' }}>
                                                        {log.mood}
                                                    </h4>
                                                    <span style={{ 
                                                        padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem', 
                                                        background: log.intensity >= 8 ? 'rgba(239, 68, 68, 0.1)' : log.intensity >= 5 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(45, 212, 191, 0.1)',
                                                        color: log.intensity >= 8 ? '#ef4444' : log.intensity >= 5 ? '#fbbf24' : '#2dd4bf',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        Intensity {log.intensity}/10
                                                    </span>
                                                </div>
                                                {log.note && (
                                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 12px 0', lineHeight: 1.5 }}>&quot;{log.note}&quot;</p>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {formatDate(log.createdAt)} at {formatTime(log.createdAt)}
                                        </div>
                                    </GlowCard>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* AI SESSIONS */}
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {sessions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15,23,42,0.4)', borderRadius: 20 }}>
                                <p style={{ color: '#94a3b8', margin: 0 }}>No AI support sessions recorded yet.</p>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <GlowCard key={session.id} glowColor="#2dd4bf15" borderRadius={16} style={{ padding: '0' }}>
                                    <div 
                                        onClick={() => router.push(`/chat/${session.id}`)}
                                        style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, transition: 'background 0.2s', borderRadius: 16 }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0 }}>
                                                {session.title}
                                            </h4>
                                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                {formatDate(session.createdAt)}
                                            </span>
                                        </div>
                                        {session.lastMessage && (
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '1rem' }}>{session.lastMessageRole === 'user' ? '💭' : '✨'}</span>
                                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {session.lastMessage}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </GlowCard>
                            ))
                        )}
                    </div>
                )}
            </FadeIn>

        </div>
    );
}
