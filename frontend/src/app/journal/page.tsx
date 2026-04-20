'use client';

import { useState, useEffect } from 'react';
import { listJournalEntries, createJournalEntry, getJournalInsight, type JournalEntry } from '@/lib/api';
import GlowCard from '@/components/animations/GlowCard';
import FadeIn from '@/components/animations/FadeIn';
import { recordActivity } from '@/lib/streak';

const MOODS = [
    { emoji: '😔', label: 'Sad', color: '#818cf8' },
    { emoji: '😰', label: 'Anxious', color: '#38bdf8' },
    { emoji: '😐', label: 'Neutral', color: '#94a3b8' },
    { emoji: '🙂', label: 'Okay', color: '#2dd4bf' },
    { emoji: '😊', label: 'Good', color: '#a3e635' },
    { emoji: '😄', label: 'Great', color: '#fcd34d' },
];

export default function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const data = await listJournalEntries();
            setEntries(data.entries);
        } catch (err) {
            console.error('Failed to load journal entries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const data = await createJournalEntry(content, selectedMood || undefined);
            setEntries(prev => [data.entry, ...prev]);
            setContent('');
            setSelectedMood(null);
            recordActivity();
        } catch (err) {
            console.error('Failed to save journal entry:', err);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { 
            weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' 
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
    };

    const activeMoodData = MOODS.find(m => m.label === selectedMood);
    const activeAccent = activeMoodData ? activeMoodData.color : '#6366f1';

    return (
        <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto', height: '100%', WebkitOverflowScrolling: 'touch' }}>
            <FadeIn direction="up">
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontWeight: 600, fontSize: '2rem', marginBottom: '8px', color: '#f8fafc' }}>Your Journal</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
                        A private, safe space to untangle your thoughts.
                    </p>
                </div>
            </FadeIn>

            {/* New entry form */}
            <FadeIn direction="up" delay={100}>
                <GlowCard 
                    glowColor={`${activeAccent}40`} 
                    borderRadius={24} 
                    style={{ marginBottom: '48px', transition: 'all 0.5s ease' }}
                >
                    <div style={{ padding: '24px' }}>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="What's heavily on your mind right now? Give it to the page..."
                            rows={5}
                            style={{ 
                                width: '100%',
                                background: 'rgba(15,23,42,0.5)',
                                border: `1px solid ${content.trim() ? activeAccent + '60' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '16px',
                                padding: '20px',
                                color: '#f8fafc',
                                fontSize: '1.05rem',
                                lineHeight: 1.6,
                                resize: 'vertical',
                                outline: 'none',
                                marginBottom: '24px',
                                transition: 'all 0.3s ease',
                                boxShadow: content.trim() ? `0 0 0 1px ${activeAccent}30 inset` : 'none'
                            }}
                            onFocus={e => e.target.style.borderColor = activeAccent + '80'}
                            onBlur={e => e.target.style.borderColor = content.trim() ? activeAccent + '60' : 'rgba(255,255,255,0.1)'}
                        />

                        {/* Mood selector & Actions */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    How are you feeling right now?
                                </p>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {MOODS.map(m => {
                                        const isSelected = selectedMood === m.label;
                                        return (
                                            <button
                                                key={m.label}
                                                onClick={() => setSelectedMood(isSelected ? null : m.label)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '99px',
                                                    border: isSelected ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.1)',
                                                    background: isSelected ? `${m.color}15` : 'rgba(15,23,42,0.4)',
                                                    color: isSelected ? m.color : '#cbd5e1',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    outline: 'none',
                                                    boxShadow: isSelected ? `0 0 15px ${m.color}30` : 'none',
                                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                                onMouseEnter={e => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.borderColor = `${m.color}60`;
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }
                                                }}
                                            >
                                                <span>{m.emoji}</span> {m.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!content.trim() || saving}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '16px',
                                    background: content.trim() ? activeAccent : 'rgba(255,255,255,0.1)',
                                    color: content.trim() ? '#0f172a' : '#64748b',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    cursor: content.trim() && !saving ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.3s ease',
                                    boxShadow: content.trim() ? `0 10px 25px -5px ${activeAccent}60` : 'none',
                                    flexShrink: 0
                                }}
                            >
                                {saving ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 16, height: 16, border: '2px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        Saving...
                                    </div>
                                ) : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </GlowCard>
            </FadeIn>

            {/* AI Weekly Insight */}
            <FadeIn direction="up" delay={150}>
                <GlowCard glowColor="#a78bfa25" borderRadius={20} style={{ marginBottom: '40px' }}>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: insight ? 16 : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.3rem' }}>🔮</span>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0' }}>AI Weekly Insight</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Patterns from your recent entries</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    setInsightLoading(true);
                                    try {
                                        const res = await getJournalInsight();
                                        setInsight(res.insight || res.message || 'No insight available yet.');
                                    } catch {
                                        setInsight('Unable to generate insight right now. Please try again later.');
                                    } finally {
                                        setInsightLoading(false);
                                    }
                                }}
                                disabled={insightLoading}
                                style={{
                                    padding: '8px 16px', borderRadius: 10,
                                    background: insightLoading ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.1)',
                                    border: '1px solid rgba(167,139,250,0.3)',
                                    color: '#a78bfa', cursor: insightLoading ? 'wait' : 'pointer',
                                    fontSize: '0.8rem', fontWeight: 500,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {insightLoading ? 'Analyzing...' : insight ? 'Refresh' : 'Generate Insight'}
                            </button>
                        </div>
                        {insight && (
                            <div style={{
                                padding: '16px', borderRadius: 12,
                                background: 'rgba(2,6,23,0.4)',
                                borderLeft: '4px solid #a78bfa',
                                color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {insight}
                            </div>
                        )}
                    </div>
                </GlowCard>
            </FadeIn>

            {/* Entries list Timeline */}
            <FadeIn direction="up" delay={200}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Past Entries</h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div className="loading-dots"><span /><span /><span /></div>
                    </div>
                ) : entries.length === 0 ? (
                    <GlowCard glowColor="#334155" borderRadius={20}>
                        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px', opacity: 0.5 }}>📝</span>
                            <p style={{ margin: 0, fontSize: '1.05rem' }}>No journal entries yet.</p>
                            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Whenever you&apos;re ready, the page is yours.</p>
                        </div>
                    </GlowCard>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                        {/* Timeline line */}
                        <div style={{ position: 'absolute', left: '20px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

                        {entries.map((entry, index) => {
                            const moodObj = entry.mood ? MOODS.find(m => m.label === entry.mood) : null;
                            const entryColor = moodObj ? moodObj.color : '#6366f1';
                            
                            return (
                                <FadeIn key={entry.id} direction="up" delay={index * 50}>
                                    <div style={{ position: 'relative', paddingLeft: '56px' }}>
                                        {/* Timeline Dot */}
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: '14px', 
                                            top: '28px', 
                                            width: '14px', 
                                            height: '14px', 
                                            borderRadius: '50%', 
                                            background: entryColor,
                                            boxShadow: `0 0 10px ${entryColor}80`,
                                            zIndex: 1,
                                            border: '3px solid #0f172a'
                                        }} />

                                        <GlowCard glowColor={`${entryColor}15`} borderRadius={20} style={{ width: '100%' }}>
                                            <div style={{ padding: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                    <div>
                                                        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>
                                                            {formatDate(entry.createdAt)}
                                                        </div>
                                                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                            {formatTime(entry.createdAt)}
                                                        </div>
                                                    </div>
                                                    
                                                    {moodObj && (
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '6px',
                                                            background: `${entryColor}15`,
                                                            border: `1px solid ${entryColor}30`,
                                                            padding: '6px 12px',
                                                            borderRadius: '99px',
                                                            color: entryColor,
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500
                                                        }}>
                                                            <span>{moodObj.emoji}</span> {moodObj.label}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div style={{ 
                                                    fontSize: '1rem', 
                                                    lineHeight: 1.6, 
                                                    color: '#cbd5e1',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {entry.content}
                                                </div>
                                            </div>
                                        </GlowCard>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                )}
            </FadeIn>
            
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
