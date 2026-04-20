'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import SimpleAction from '@/components/activities/SimpleAction';

const ArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface SadQuickActionsProps { accent: string; }

type Mode = 'comfort' | 'move' | 'alone' | 'exit' | null;
type ActiveActivity =
    | { type: 'breathing'; variant: 'soft' }
    | { type: 'simple'; title: string; instruction: string; icon: string }
    | null;

export function SadQuickActions({ accent }: SadQuickActionsProps) {
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
                    <h3 style={{ margin: 0 }}>Quick Actions &mdash; Gentle Support</h3>
                </div>
                <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, overflow: 'hidden' }}>{c}</div>
            </div>
        );
        if (activeActivity.type === 'breathing') return wrap(<BreathingExercise variant={activeActivity.variant} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'simple') return wrap(<SimpleAction title={activeActivity.title} instruction={activeActivity.instruction} icon={activeActivity.icon} accent={accent} onComplete={() => { setActiveActivity(null); setMode('exit'); }} onCancel={() => setActiveActivity(null)} />);
    }

    return (
        <div className="bento-section">
            <div className="bento-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                {mode && (
                    <button onClick={() => setMode(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft /></button>
                )}
                <h3 style={{ margin: 0 }}>Quick Actions &mdash; Gentle Support</h3>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.2) 100%)', border: `1px solid ${accent}20`, borderRadius: 24, padding: 32 }}>
                {!mode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: 8 }}>You do not have to force this.</h4>
                            <p style={{ color: '#94a3b8' }}>Choose what feels manageable right now.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {renderCard("Comfort Me", "For when you feel heavy, flat, or fragile.", () => setMode('comfort'))}
                            {renderCard("Help Me Move Gently", "For when you need a very small lift.", () => setMode('move'))}
                            {renderCard("Help Me Feel Less Alone", "For when you are withdrawing inward.", () => setMode('alone'))}
                        </div>
                    </div>
                )}

                {mode === 'comfort' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>Let&apos;s make this moment a little easier.</h4>
                            <p style={{ color: '#94a3b8' }}>You don&apos;t need to fix anything right now.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {renderToolBtn("Breathe softly", () => setActiveActivity({ type: 'breathing', variant: 'soft' }))}
                            {renderToolBtn("Water prompt", () => setActiveActivity({ type: 'simple', title: 'Drink Water', instruction: 'Go get a glass of water. Drink it slowly while breathing gently. Small care matters.', icon: '💧' }))}
                            {renderToolBtn("Comfort checklist", () => setActiveActivity({ type: 'simple', title: 'Comfort Check', instruction: 'Are you warm enough? In a comfortable position? Is the light okay? Adjust one small comfort thing.', icon: '🛋️' }))}
                            {renderToolBtn("Gentle audio / calm screen", () => setMode('exit'))}
                            {renderToolBtn("Self-kindness line", () => setActiveActivity({ type: 'simple', title: 'Self-Kindness', instruction: 'Say to yourself: "I am having a hard time right now, and that is okay. I do not need to be strong every moment."', icon: '💛' }))}
                        </div>
                    </div>
                )}

                {mode === 'move' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>One gentle step is enough.</h4>
                            <p style={{ color: '#94a3b8' }}>Pick the easiest possible win.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {renderToolBtn("Tiny win picker", () => setActiveActivity({ type: 'simple', title: 'Tiny Win', instruction: 'Pick one thing: stand up, wash your face, change your shirt, or move to another room. Just one.', icon: '🏆' }))}
                            {renderToolBtn("Stand up / wash face / one-song reset", () => setActiveActivity({ type: 'simple', title: 'Small Reset', instruction: 'Choose one: stand up for 10 seconds, splash water on your face, or play one song you like.', icon: '🎵' }))}
                            {renderToolBtn("Identify one good thing", () => setActiveActivity({ type: 'simple', title: 'One Good Thing', instruction: 'Look around you. Can you find one thing — even small — that is okay right now? A warm cup. Soft light. A quiet room.', icon: '✨' }))}
                            {renderToolBtn("Open window / step outside prompt", () => setActiveActivity({ type: 'simple', title: 'Fresh Air', instruction: 'Open a window or step just outside the door for 30 seconds. Fresh air, even a little, changes the moment.', icon: '🪟' }))}
                        </div>
                    </div>
                )}

                {mode === 'alone' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: '1.35rem', color: accent, marginBottom: 8 }}>You do not have to carry this alone.</h4>
                            <p style={{ color: '#94a3b8' }}>You do not have to explain everything either.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            {renderToolBtn("Message draft", () => setMode('exit'))}
                            {renderToolBtn("Reach out prompt", () => setActiveActivity({ type: 'simple', title: 'Reach Out', instruction: 'Think of one person who feels safe. You do not have to explain everything. Even a simple hey is enough.', icon: '💬' }))}
                            {renderToolBtn("Safe-person shortcut", () => setMode('exit'))}
                            {renderToolBtn("Support options", () => setMode('exit'))}
                        </div>
                    </div>
                )}

                {mode === 'exit' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
                        <div style={{ color: accent }}><CheckCircle /></div>
                        <h4 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>A small step taken.</h4>
                        <p style={{ color: '#94a3b8' }}>Small care still counts.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300, marginTop: 16 }}>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid ${accent}40`, color: '#f8fafc', cursor: 'pointer' }}>That helped a little.</button>
                            <button onClick={() => setMode(null)} style={{ padding: '14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: `1px solid ${accent}40`, color: '#f8fafc', cursor: 'pointer' }}>I need one more tool.</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
