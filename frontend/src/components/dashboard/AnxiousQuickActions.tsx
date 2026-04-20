'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import GroundingExercise from '@/components/activities/GroundingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';

const ArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface AnxiousQuickActionsProps { accent: string; }

type Mode = 'calm' | 'quiet' | 'control' | 'exit' | null;
type ActiveActivity =
    | { type: 'breathing'; variant: 'calm-60' | 'cyclic' | 'box' }
    | { type: 'grounding'; variant: '5-4-3-2-1' }
    | { type: 'body'; variant: 'pmr-short' }
    | null;

export function AnxiousQuickActions({ accent }: AnxiousQuickActionsProps) {
    const [mode, setMode] = useState<Mode>(null);
    const [worryCaptured, setWorryCaptured] = useState(false);
    const [activeActivity, setActiveActivity] = useState<ActiveActivity>(null);

    const renderCard = (title: string, subtitle: string, onClick: () => void) => (
        <button onClick={onClick} style={{
            width: '100%', textAlign: 'left', background: 'rgba(15,23,42,0.6)',
            border: `1px solid ${accent}40`, borderRadius: 16, padding: '24px 28px',
            cursor: 'pointer', transition: 'all 0.3s ease', outline: 'none',
            display: 'flex', flexDirection: 'column', gap: 6
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.9)'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.6)'; e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>{title}</span>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{subtitle}</span>
        </button>
    );

    const renderToolBtn = (text: string, onClick?: () => void) => (
        <div onClick={onClick} style={{
            background: 'rgba(30,41,59,0.5)', border: `1px solid ${accent}20`,
            padding: '16px 20px', borderRadius: 12, color: '#e2e8f0',
            cursor: onClick ? 'pointer' : 'default', transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => onClick && (e.currentTarget.style.background = 'rgba(30,41,59,0.8)')}
        onMouseLeave={(e) => onClick && (e.currentTarget.style.background = 'rgba(30,41,59,0.5)')}
        >{text}</div>
    );

    // Activity overlay
    if (activeActivity) {
        const wrap = (c: React.ReactNode) => (
            <div className="bento-section">
                <div className="bento-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => setActiveActivity(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft /></button>
                    <h3 style={{ margin: 0 }}>Quick Actions &mdash; Anxiety</h3>
                </div>
                <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, overflow: 'hidden' }}>{c}</div>
            </div>
        );
        if (activeActivity.type === 'breathing') return wrap(<BreathingExercise variant={activeActivity.variant} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'grounding') return wrap(<GroundingExercise variant={activeActivity.variant} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'body') return wrap(<BodyReleaseExercise variant={activeActivity.variant} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
    }

    return (
        <div className="bento-section">
            <div className="bento-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                {mode && (
                    <button onClick={() => { setMode(null); setWorryCaptured(false); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft /></button>
                )}
                <h3 style={{ margin: 0 }}>Quick Actions &mdash; Anxiety</h3>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, padding: 32 }}>
                {!mode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: 8 }}>Mind going too fast?</h4>
                            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Choose the support you need most right now.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {renderCard("Calm Me Now", "For when you are feeling panicky, restless, or physically activated.", () => setMode('calm'))}
                            {renderCard("Quiet My Mind", "For when you are stuck in worry spirals.", () => setMode('quiet'))}
                            {renderCard("Help Me Regain Control", "For when you need an action, not just a calming exercise.", () => setMode('control'))}
                        </div>
                    </div>
                )}

                {mode === 'calm' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Let&apos;s slow this down.</h4>
                            <p style={{ color: '#94a3b8' }}>You only need to handle this moment.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {renderToolBtn("Calm in 60s", () => setActiveActivity({ type: 'breathing', variant: 'calm-60' }))}
                            {renderToolBtn("Cyclic sigh breathing", () => setActiveActivity({ type: 'breathing', variant: 'cyclic' }))}
                            {renderToolBtn("Sensory grounding", () => setActiveActivity({ type: 'grounding', variant: '5-4-3-2-1' }))}
                            {renderToolBtn("PMR short scan", () => setActiveActivity({ type: 'body', variant: 'pmr-short' }))}
                        </div>
                    </div>
                )}

                {mode === 'quiet' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>We can make this smaller.</h4>
                            <p style={{ color: '#94a3b8' }}>You do not need full certainty right now.</p>
                        </div>
                        {!worryCaptured ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {renderToolBtn("Is it happening right now?", () => setWorryCaptured(true))}
                                {renderToolBtn("Check the worry evidence", () => setWorryCaptured(true))}
                            </div>
                        ) : (
                            <div style={{ border: `1px solid ${accent}40`, padding: 24, borderRadius: 16, background: 'rgba(2,6,23,0.5)' }}>
                                <h5 style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: 16 }}>Try a balanced thought prompt:</h5>
                                <p style={{ color: '#94a3b8', fontStyle: 'italic', marginBottom: 24 }}>&quot;This feels dangerous, but it might just be uncomfortable.&quot;</p>
                                {renderToolBtn("Schedule worry time for later", () => setMode('exit'))}
                            </div>
                        )}
                    </div>
                )}

                {mode === 'control' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Let&apos;s pull back to what you can control.</h4>
                            <p style={{ color: '#94a3b8' }}>You only need to handle this moment.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            {renderToolBtn("Plan one small next step", () => setMode('exit'))}
                            {renderToolBtn("Prepare for the feared task", () => setMode('exit'))}
                            {renderToolBtn("Do one helpful action now", () => setMode('exit'))}
                        </div>
                    </div>
                )}

                {mode === 'exit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
                        <div style={{ color: accent }}><CheckCircle /></div>
                        <h4 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>You handled that moment.</h4>
                        <p style={{ color: '#94a3b8' }}>Return here whenever the anxiety feels too big.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300, marginTop: 16 }}>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid ${accent}40`, color: '#f8fafc', cursor: 'pointer' }}>That helped.</button>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid ${accent}40`, color: '#f8fafc', cursor: 'pointer' }}>I need one more tool.</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
