'use client';

import { useState, useEffect } from 'react';
import { listJournalEntries, createJournalEntry, type JournalEntry } from '@/lib/api';

const MOODS = [
    { emoji: '😔', label: 'Sad' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '🙂', label: 'Okay' },
    { emoji: '😊', label: 'Good' },
    { emoji: '😄', label: 'Great' },
];

export default function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEntries();
    }, []);

    async function loadEntries() {
        try {
            const data = await listJournalEntries();
            setEntries(data.entries);
        } catch (err) {
            console.error('Failed to load journal entries:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!content.trim()) return;
        setSaving(true);

        try {
            const data = await createJournalEntry(content, selectedMood || undefined);
            setEntries(prev => [data.entry, ...prev]);
            setContent('');
            setSelectedMood(null);
        } catch (err) {
            console.error('Failed to save journal entry:', err);
        } finally {
            setSaving(false);
        }
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontWeight: 500, marginBottom: '8px' }}>Journal</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    A safe space to write your thoughts. No judgment.
                </p>
            </div>

            {/* New entry form */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <textarea
                    className="input"
                    placeholder="What's on your mind? Write whatever comes naturally..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={4}
                    style={{ resize: 'vertical', marginBottom: '16px' }}
                />

                {/* Mood selector */}
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>How are you feeling?</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {MOODS.map(m => (
                            <button
                                key={m.label}
                                onClick={() => setSelectedMood(selectedMood === m.label ? null : m.label)}
                                style={{
                                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                                    border: selectedMood === m.label ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                    background: selectedMood === m.label ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                    color: 'var(--text-primary)', cursor: 'pointer',
                                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px',
                                    transition: 'all var(--transition-fast)', fontFamily: 'inherit',
                                }}
                            >
                                {m.emoji} {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!content.trim() || saving}
                >
                    {saving ? 'Saving...' : 'Save Entry'}
                </button>
            </div>

            {/* Entries list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-dots"><span /><span /><span /></div>
                </div>
            ) : entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📝</span>
                    No journal entries yet. Start writing above!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {entries.map(entry => (
                        <div key={entry.id} className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {formatDate(entry.createdAt)}
                                </span>
                                {entry.mood && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                                        {MOODS.find(m => m.label === entry.mood)?.emoji} {entry.mood}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {entry.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
