'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';
import SimpleAction from '@/components/activities/SimpleAction';
import FocusTimer from '@/components/activities/FocusTimer';

const ArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface FrustratedQuickActionsProps { accent: string; }

type Mode = 'cool' | 'think' | 'respond' | 'exit' | null;
type ActiveActivity =
    | { type: 'breathing'; variant: 'calm-60' | 'box' }
    | { type: 'body'; variant: 'shake' | 'shoulder-jaw' }
    | { type: 'simple'; title: string; instruction: string; icon: string }
    | { type: 'timer'; duration: number; label: string }
    | null;

export function FrustratedQuickActions({ accent }: FrustratedQuickActionsProps) {
    const [mode, setMode] = useState<Mode>(null);
    const [triggerText, setTriggerText] = useState('');
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

    if (activeActivity) {
        const wrap = (c: React.ReactNode) => (
            <div className="bento-section">
                <div className="bento-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => setActiveActivity(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft /></button>
                    <h3 style={{ margin: 0 }}>Quick Actions &mdash; Frustration</h3>
                </div>
                <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, overflow: 'hidden' }}>{c}</div>
            </div>
        );
        if (activeActivity.type === 'breathing') return wrap(<BreathingExercise variant={activeActivity.variant} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'body') return wrap(<BodyReleaseExercise variant={activeActivity.variant} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'simple') return wrap(<SimpleAction title={activeActivity.title} instruction={activeActivity.instruction} icon={activeActivity.icon} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'timer') return wrap(<FocusTimer duration={activeActivity.duration} label={activeActivity.label} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
    }

    return (
        <div className="bento-section">
            <div className="bento-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                {mode && (
                    <button onClick={() => setMode(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft /></button>
                )}
                <h3 style={{ margin: 0 }}>Quick Actions &mdash; Frustration</h3>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, padding: 32 }}>
                {!mode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: 8 }}>Do not react at full heat.</h4>
                            <p style={{ color: '#94a3b8' }}>Choose the support you need most right now.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {renderCard("Cool Me Down", "For when you have body tension and heat.", () => setMode('cool'))}
                            {renderCard("Help Me Think Clearly", "For when you are stuck in an irritation loop.", () => setMode('think'))}
                            {renderCard("Help Me Respond Well", "For when you are close to texting, arguing, or reacting.", () => setMode('respond'))}
                        </div>
                    </div>
                )}

                {mode === 'cool' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Let&apos;s lower the temperature first.</h4>
                            <p style={{ color: '#94a3b8' }}>You only need to handle this moment.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {renderToolBtn("Breathing resets", () => setActiveActivity({ type: 'breathing', variant: 'calm-60' }))}
                            {renderToolBtn("Shake it out", () => setActiveActivity({ type: 'body', variant: 'shake' }))}
                            {renderToolBtn("Jaw / shoulder release", () => setActiveActivity({ type: 'body', variant: 'shoulder-jaw' }))}
                            {renderToolBtn("Cold water reset", () => setActiveActivity({ type: 'simple', title: 'Cold Water Reset', instruction: 'Splash cold water on your face or wrists. The cold shock activates your dive reflex and calms the heat.', icon: '💧' }))}
                            {renderToolBtn("1-minute walk prompt", () => setActiveActivity({ type: 'timer', duration: 60, label: '1-minute walk' }))}
                        </div>
                    </div>
                )}

                {mode === 'think' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Name the trigger, not the whole story.</h4>
                            <p style={{ color: '#94a3b8' }}>Getting it clear limits the frustration.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input type="text" value={triggerText} onChange={(e) => setTriggerText(e.target.value)}
                                placeholder="One-line trigger note (e.g. they ignored my message)"
                                style={{ width: '100%', padding: '16px', borderRadius: 12, background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}30`, color: '#f8fafc', outline: 'none' }}
                            />
                            {renderToolBtn("Control Split (Can control vs Cannot)", () => setMode('exit'))}
                            {renderToolBtn("Reframe: What do I actually need?", () => setMode('exit'))}
                        </div>
                    </div>
                )}

                {mode === 'respond' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Choose the calmest useful move.</h4>
                            <p style={{ color: '#94a3b8' }}>You can respond without exploding.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            {renderToolBtn("Delay response timer", () => setActiveActivity({ type: 'timer', duration: 600, label: 'Delay response — 10 min' }))}
                            {renderToolBtn("Draft, but do not send", () => setMode('exit'))}
                            {renderToolBtn("One calm sentence builder", () => setMode('exit'))}
                            {renderToolBtn("Boundary prompt", () => setMode('exit'))}
                            {renderToolBtn("Come back in 10 minutes", () => setActiveActivity({ type: 'timer', duration: 600, label: 'Come back in 10 minutes' }))}
                        </div>
                    </div>
                )}

                {mode === 'exit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
                        <div style={{ color: accent }}><CheckCircle /></div>
                        <h4 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>You protected your peace.</h4>
                        <p style={{ color: '#94a3b8' }}>Return here whenever the anger feels too sharp.</p>
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
