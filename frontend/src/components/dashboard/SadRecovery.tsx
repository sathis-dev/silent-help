'use client';

import { useState } from 'react';

// Inline lucide-react SVGs
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface SadRecoveryProps {
    accent: string;
}

export function SadRecovery({ accent }: SadRecoveryProps) {
    const [step, setStep] = useState(1);
    const [branch, setBranch] = useState<'comfort' | 'win' | 'support' | null>(null);

    const handleNext = (nextStep: number) => {
        setStep(nextStep);
    };

    const renderCard = (title: string, subtitle: string, content: React.ReactNode) => (
        <div className="sad-card" style={{ 
            background: 'rgba(15,23,42,0.6)', 
            border: `1px solid ${accent}30`, 
            borderRadius: 24, padding: 32, transition: 'all 0.4s ease'
        }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#f8fafc' }}>{title}</h3>
            {subtitle && <p style={{ color: `${accent}`, fontWeight: 500, marginBottom: 24 }}>{subtitle}</p>}
            <div className="sad-content flex flex-col gap-4">
                {content}
            </div>
        </div>
    );

    const renderButton = (text: string, onClick: () => void, primary: boolean = false) => (
        <button 
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', borderRadius: 16,
                background: primary ? accent : 'rgba(30,41,59,0.7)',
                color: primary ? '#0f172a' : '#f8fafc',
                fontWeight: 600, border: primary ? 'none' : `1px solid ${accent}40`,
                cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left'
            }}
            onMouseEnter={(e) => {
                if (!primary) e.currentTarget.style.background = 'rgba(30,41,59,0.9)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                if (!primary) e.currentTarget.style.background = 'rgba(30,41,59,0.7)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <span>{text}</span>
            {!primary && <ChevronRight />}
        </button>
    );

    return (
        <div className="sad-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
            <div className="recovery-header" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {step === 2 && branch === 'comfort' ? '2A' : step === 2 && branch === 'win' ? '2B' : step === 2 && branch === 'support' ? '2C' : step}/6
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Gentle Support Path</h3>
                </div>
            </div>

            {step === 1 && renderCard(
                "Make it okay to be where you are",
                "You do not need to force yourself to feel better right away.",
                <>
                    {renderButton("Help me feel a bit lighter", () => { setBranch('comfort'); handleNext(2); })}
                    {renderButton("Help me do one small thing", () => { setBranch('win'); handleNext(2); })}
                    {renderButton("I need support, not effort", () => { setBranch('support'); handleNext(2); })}
                </>
            )}

            {step === 2 && branch === 'comfort' && renderCard(
                "Comfort first",
                "Let's make this moment a little kinder.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Drink water", () => handleNext(3))}
                    {renderButton("Sit somewhere softer", () => handleNext(3))}
                    {renderButton("Wrap up warm", () => handleNext(3))}
                    {renderButton("Open a window", () => handleNext(3))}
                    {renderButton("Take 3 slow breaths", () => handleNext(3))}
                </div>
            )}

            {step === 2 && branch === 'win' && renderCard(
                "Gentle Activation",
                "Pick the easiest possible win.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Sit up", () => handleNext(3))}
                    {renderButton("Wash face", () => handleNext(3))}
                    {renderButton("Change room", () => handleNext(3))}
                    {renderButton("Stand near a window", () => handleNext(3))}
                    {renderButton("Play one song", () => handleNext(3))}
                    {renderButton("Pick up one item", () => handleNext(3))}
                </div>
            )}

            {step === 2 && branch === 'support' && renderCard(
                "Low Capacity",
                "That's okay. You do not have to do much right now.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Stay with a calm screen", () => handleNext(3))}
                    {renderButton("Read one gentle message", () => handleNext(3))}
                    {renderButton("Show support options", () => handleNext(3))}
                    {renderButton("Message someone I trust", () => handleNext(3))}
                </div>
            )}

            {step === 3 && renderCard(
                "Name the heaviness",
                "What feels closest right now?",
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                    {renderButton("Heavy", () => handleNext(4))}
                    {renderButton("Empty", () => handleNext(4))}
                    {renderButton("Lonely", () => handleNext(4))}
                    {renderButton("Drained", () => handleNext(4))}
                    {renderButton("Numb", () => handleNext(4))}
                    {renderButton("Tearful", () => handleNext(4))}
                </div>
            )}

            {step === 4 && renderCard(
                "Reduce isolation gently",
                "Would a little connection help?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Message one safe person", () => handleNext(5))}
                    {renderButton("Sit near someone", () => handleNext(5))}
                    {renderButton("Save a message draft", () => handleNext(5))}
                    {renderButton("Choose not now", () => handleNext(5))}
                </div>
            )}

            {step === 5 && renderCard(
                "One soft next step",
                "Choose one thing that asks very little from you.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Drink water</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Take medicine if needed</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Tidy one item</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Put on clean clothes</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Step outside for 1 minute</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Lie down and breathe</div>
                    </div>
                    {renderButton("I've chosen", () => handleNext(6), true)}
                </div>
            )}

            {step === 6 && renderCard(
                "Close with care",
                "Small steps still count.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("That helped", () => handleNext(7))}
                    {renderButton("Try another gentle tool", () => { setBranch(null); handleNext(1); })}
                    {renderButton("I need more support", () => handleNext(7))}
                </div>
            )}

            {step === 7 && renderCard(
                "Session complete",
                "You do not have to carry this alone.",
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ color: accent, display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CheckCircle /></div>
                    <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>Small care still counts.</h4>
                    <p style={{ color: '#94a3b8' }}>Return here whenever things feel a little too heavy.</p>
                </div>
            )}
        </div>
    );
}
