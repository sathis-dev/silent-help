'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';
import SimpleAction from '@/components/activities/SimpleAction';
import FocusTimer from '@/components/activities/FocusTimer';

const ArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface PressureQuickActionsProps { accent: string; }

type Mode = 'organise' | 'focus' | 'burnout' | 'exit' | null;
type ActiveActivity =
    | { type: 'breathing'; variant: 'calm-60' | 'box' }
    | { type: 'body'; variant: 'shoulder-jaw' | 'posture-reset' }
    | { type: 'simple'; title: string; instruction: string; icon: string }
    | { type: 'timer'; duration: number; label: string }
    | null;

export function PressureQuickActions({ accent }: PressureQuickActionsProps) {
    const [mode, setMode] = useState<Mode>(null);
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
                    <h3 style={{ margin: 0 }}>Quick Actions &mdash; Manage Expectations</h3>
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
                <h3 style={{ margin: 0 }}>Quick Actions &mdash; Manage Expectations</h3>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, padding: 32 }}>
                {!mode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: 8 }}>You do not need to do everything at once.</h4>
                            <p style={{ color: '#94a3b8' }}>Choose what matters most now.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {renderCard("Organise My Load", "For when you are drowning in tasks and expectations.", () => setMode('organise'))}
                            {renderCard("Help Me Focus", "For when you know what to do but need to restart action.", () => setMode('focus'))}
                            {renderCard("Prevent Burnout", "For when you are pushing too hard and need boundaries.", () => setMode('burnout'))}
                        </div>
                    </div>
                )}

                {mode === 'organise' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Let&apos;s make this manageable.</h4>
                            <p style={{ color: '#94a3b8' }}>Get it out of your head.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {renderToolBtn("Quick task capture", () => setMode('exit'))}
                            {renderToolBtn("Must / Wait / Not Now sort", () => setMode('exit'))}
                            {renderToolBtn("Top 1 picker", () => setMode('exit'))}
                            {renderToolBtn("Reduce action list", () => setMode('exit'))}
                        </div>
                    </div>
                )}

                {mode === 'focus' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>One focused block is a real step.</h4>
                            <p style={{ color: '#94a3b8' }}>Progress is enough for this moment.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {renderToolBtn("One-task focus constraint", () => setMode('exit'))}
                            {renderToolBtn("5-minute start timer", () => setActiveActivity({ type: 'timer', duration: 300, label: '5-minute start' }))}
                            {renderToolBtn("Deep work block", () => setActiveActivity({ type: 'timer', duration: 600, label: 'Deep work — 10 min' }))}
                            {renderToolBtn("Remove distractions prompt", () => setActiveActivity({ type: 'simple', title: 'Remove Distractions', instruction: 'Close tabs. Phone on silent. Clear your desk. Give yourself permission to focus on one thing.', icon: '🔇' }))}
                            {renderToolBtn("Progress check", () => setMode('exit'))}
                        </div>
                    </div>
                )}

                {mode === 'burnout' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Protect your capacity.</h4>
                            <p style={{ color: '#94a3b8' }}>You cannot run on empty.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            {renderToolBtn("Energy check", () => setActiveActivity({ type: 'simple', title: 'Energy Check', instruction: 'Rate your energy 1-10. If under 4, you need rest before work. If 4-7, do one block then pause. If 7+, you are okay to push.', icon: '🔋' }))}
                            {renderToolBtn("Reduce one demand", () => setMode('exit'))}
                            {renderToolBtn("Permission to pause", () => setActiveActivity({ type: 'simple', title: 'Permission to Pause', instruction: 'You are allowed to stop. Not everything needs to be done today. Say it: I have permission to pause.', icon: '⏸️' }))}
                            {renderToolBtn("Ask for help draft", () => setMode('exit'))}
                            {renderToolBtn("Stop after one block commitment", () => setActiveActivity({ type: 'timer', duration: 600, label: 'One final block — then stop' }))}
                        </div>
                    </div>
                )}

                {mode === 'exit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
                        <div style={{ color: accent }}><CheckCircle /></div>
                        <h4 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Load adjusted.</h4>
                        <p style={{ color: '#94a3b8' }}>Progress still counts, even if everything is not done.</p>
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
