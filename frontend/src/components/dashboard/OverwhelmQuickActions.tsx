'use client';

import { useState, useEffect } from 'react';

// Inline SVGs
const ArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface OverwhelmQuickActionsProps {
    accent: string;
}

type Mode = 'calm' | 'clear' | 'start' | 'exit' | null;

export function OverwhelmQuickActions({ accent }: OverwhelmQuickActionsProps) {
    const [mode, setMode] = useState<Mode>(null);
    const [activeTimer, setActiveTimer] = useState<number | null>(null);
    const [brainDump, setBrainDump] = useState('');
    const [microStep, setMicroStep] = useState('');

    useEffect(() => {
        if (activeTimer === null || activeTimer <= 0) return;
        const interval = setInterval(() => {
            setActiveTimer(prev => prev !== null && prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTimer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const renderCard = (title: string, subtitle: string, onClick: () => void) => (
        <button
            onClick={onClick}
            style={{
                width: '100%', textAlign: 'left', background: 'rgba(15,23,42,0.6)', 
                border: `1px solid ${accent}40`, borderRadius: 16, padding: '24px 28px',
                cursor: 'pointer', transition: 'all 0.3s ease', outline: 'none',
                display: 'flex', flexDirection: 'column', gap: 6
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(15,23,42,0.9)';
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
                e.currentTarget.style.borderColor = `${accent}40`;
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>{title}</span>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{subtitle}</span>
        </button>
    );

    const renderToolBtn = (text: string, onClick?: () => void) => (
        <div 
            onClick={onClick}
            style={{
                background: 'rgba(30,41,59,0.5)', border: `1px solid ${accent}20`,
                padding: '16px 20px', borderRadius: 12, color: '#e2e8f0',
                cursor: onClick ? 'pointer' : 'default', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => onClick && (e.currentTarget.style.background = 'rgba(30,41,59,0.8)')}
            onMouseLeave={(e) => onClick && (e.currentTarget.style.background = 'rgba(30,41,59,0.5)')}
        >
            {text}
        </div>
    );

    return (
        <div className="bento-section">
            <div className="bento-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                {mode && (
                    <button onClick={() => { setMode(null); setActiveTimer(null); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft />
                    </button>
                )}
                <h3 style={{ margin: 0 }}>Quick Actions &mdash; Overwhelm</h3>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, padding: 32 }}>
                {!mode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: 8 }}>Too much at once?</h4>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Choose what you need most right now.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {renderCard("Calm me first", "Right now mode. For when you are mentally flooded.", () => setMode('calm'))}
                            {renderCard("Clear my head", "For when you are overloaded but functional.", () => setMode('clear'))}
                            {renderCard("Help me start", "Get moving mode. For when you are stuck or shut down.", () => setMode('start'))}
                        </div>
                    </div>
                )}

                {mode === 'calm' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>You do not need to solve everything right now.</h4>
                            <p style={{ color: '#94a3b8' }}>Let&apos;s make this smaller.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {renderToolBtn("60-second breathing", () => setMode('exit'))}
                            {renderToolBtn("3-3-3 grounding", () => setMode('exit'))}
                            {renderToolBtn("Cold splash prompt", () => setMode('exit'))}
                            {renderToolBtn("Shoulder / jaw release", () => setMode('exit'))}
                        </div>
                        <button onClick={() => setMode('exit')} style={{ marginTop: 12, padding: '16px', background: accent, border: 'none', borderRadius: 12, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>I feel slightly better</button>
                    </div>
                )}

                {mode === 'clear' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Out of your head, onto the page.</h4>
                            <p style={{ color: '#94a3b8' }}>Empty the chaos.</p>
                        </div>
                        
                        <textarea 
                            value={brainDump}
                            onChange={(e) => setBrainDump(e.target.value)}
                            placeholder="Brain dump everything here..."
                            style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 12, background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}30`, color: '#f8fafc', outline: 'none', resize: 'vertical' }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Now filter what you wrote:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                <div style={{ padding: 12, textAlign: 'center', border: `1px solid ${accent}40`, borderRadius: 8, color: '#e2e8f0', fontSize: '0.85rem' }}>Must happen now</div>
                                <div style={{ padding: 12, textAlign: 'center', border: `1px solid #475569`, borderRadius: 8, color: '#94a3b8', fontSize: '0.85rem' }}>Can wait</div>
                                <div style={{ padding: 12, textAlign: 'center', border: `1px dashed #475569`, borderRadius: 8, color: '#64748b', fontSize: '0.85rem' }}>Not in my control</div>
                            </div>
                        </div>

                        <button onClick={() => setMode('exit')} style={{ padding: '16px', background: accent, border: 'none', borderRadius: 12, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Done sorting</button>
                    </div>
                )}

                {mode === 'start' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Let&apos;s find the one next step, not the whole plan.</h4>
                            <p style={{ color: '#94a3b8' }}>One step is enough.</p>
                        </div>

                        {activeTimer === null ? (
                            <>
                                <div>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 8 }}>Identify the smallest possible next step:</p>
                                    <input 
                                        type="text"
                                        value={microStep}
                                        onChange={(e) => setMicroStep(e.target.value)}
                                        placeholder="e.g., write one sentence, pick up 3 things..."
                                        style={{ width: '100%', padding: '16px', borderRadius: 12, background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}30`, color: '#f8fafc', outline: 'none' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: 8 }}>Choose a quick sprint:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {renderToolBtn("3-minute start", () => setActiveTimer(180))}
                                    {renderToolBtn("5-minute timer", () => setActiveTimer(300))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <p style={{ color: accent, fontWeight: 500, marginBottom: 16 }}>{microStep || 'Working on micro-step'}</p>
                                <div style={{ fontSize: '4rem', fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums', marginBottom: 32 }}>
                                    {formatTime(activeTimer)}
                                </div>
                                <button onClick={() => setMode('exit')} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${accent}`, borderRadius: 99, color: accent, cursor: 'pointer' }}>Finish early & check off</button>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'exit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
                        <div style={{ color: accent }}><CheckCircle /></div>
                        <h4 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Great sequence. How are you feeling?</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid ${accent}40`, color: '#f8fafc', cursor: 'pointer' }}>That helped.</button>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid ${accent}40`, color: '#f8fafc', cursor: 'pointer' }}>I&apos;m ready for one more step.</button>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid #475569`, color: '#94a3b8', cursor: 'pointer' }}>I need more support.</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
