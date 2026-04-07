'use client';

import { useState } from 'react';

// Inline lucide-react SVGs
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface PressureRecoveryProps {
    accent: string;
}

export function PressureRecovery({ accent }: PressureRecoveryProps) {
    const [step, setStep] = useState(1);
    const [branch, setBranch] = useState<'organise' | 'focus' | 'reset' | null>(null);

    const handleNext = (nextStep: number) => {
        setStep(nextStep);
    };

    const renderCard = (title: string, subtitle: string, content: React.ReactNode) => (
        <div className="pressure-card" style={{ 
            background: 'rgba(15,23,42,0.6)', 
            border: `1px solid ${accent}30`, 
            borderRadius: 24, padding: 32, transition: 'all 0.4s ease'
        }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#f8fafc' }}>{title}</h3>
            {subtitle && <p style={{ color: `${accent}`, fontWeight: 500, marginBottom: 24 }}>{subtitle}</p>}
            <div className="pressure-content flex flex-col gap-4">
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
        <div className="pressure-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
            <div className="recovery-header" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {step === 2 && branch === 'organise' ? '2A' : step === 2 && branch === 'focus' ? '2B' : step === 2 && branch === 'reset' ? '2C' : step}/7
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Pressure Support Path</h3>
                </div>
            </div>

            {step === 1 && renderCard(
                "Reduce the weight",
                "You do not need to carry the whole thing at once.",
                <>
                    {renderButton("Help me organise", () => { setBranch('organise'); handleNext(2); })}
                    {renderButton("Help me focus", () => { setBranch('focus'); handleNext(2); })}
                    {renderButton("Help me breathe and reset", () => { setBranch('reset'); handleNext(2); })}
                </>
            )}

            {step === 2 && branch === 'organise' && renderCard(
                "What is actually on your plate?",
                "Quick capture. No deep journaling right now.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" placeholder="Type one task or demand..." style={{ flex: 1, padding: '16px', borderRadius: 12, background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}30`, color: '#f8fafc', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
                        <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${accent}40`, textAlign: 'center', color: '#e2e8f0', fontSize: '0.9rem', cursor: 'pointer' }}>Must do soon</div>
                        <div style={{ padding: 12, borderRadius: 8, border: `1px solid #475569`, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>Can wait</div>
                        <div style={{ padding: 12, borderRadius: 8, border: `1px solid #334155`, textAlign: 'center', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}>Not mine / Not now</div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        {renderButton("I've sorted my focus", () => handleNext(3), true)}
                    </div>
                </div>
            )}

            {step === 2 && branch === 'focus' && renderCard(
                "Find the lever",
                "What is the one thing that would move this forward?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Choose my top 1 task", () => handleNext(3))}
                    {renderButton("5-minute start", () => handleNext(3))}
                    {renderButton("10-minute focus timer", () => handleNext(3))}
                    {renderButton("Remove distractions", () => handleNext(3))}
                </div>
            )}

            {step === 2 && branch === 'reset' && renderCard(
                "Hold the line",
                "Before you push again, let your body come down a little.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Calm in 60s", () => handleNext(3))}
                    {renderButton("Shoulder drop + jaw relax", () => handleNext(3))}
                    {renderButton("3 deep breaths", () => handleNext(3))}
                    {renderButton("Stand up and reset posture", () => handleNext(3))}
                    {renderButton("Drink water", () => handleNext(3))}
                </div>
            )}

            {step === 3 && renderCard(
                "Clarify the real pressure",
                "What is creating the most pressure right now?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("An upcoming deadline", () => handleNext(4))}
                    {renderButton("Expectations from others", () => handleNext(4))}
                    {renderButton("Expectations from myself", () => handleNext(4))}
                    {renderButton("Just too much to do", () => handleNext(4))}
                    {renderButton("Fear of making mistakes", () => handleNext(4))}
                    {renderButton("Something important is at stake", () => handleNext(4))}
                </div>
            )}

            {step === 4 && renderCard(
                "Redefine success for today",
                "What would be enough for today?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Finish one key task", () => handleNext(5))}
                    {renderButton("Make progress, not perfection", () => handleNext(5))}
                    {renderButton("Prepare the first step", () => handleNext(5))}
                    {renderButton("Ask for more time or help", () => handleNext(5))}
                    {renderButton("Protect my energy and do the essentials", () => handleNext(5))}
                </div>
            )}

            {step === 5 && renderCard(
                "Time-block one next move",
                "You only need to do this block. Not the whole day.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("3 minutes", () => handleNext(6))}
                    {renderButton("5 minutes", () => handleNext(6))}
                    {renderButton("10 minutes", () => handleNext(6))}
                    {renderButton("I need a break first", () => handleNext(6))}
                </div>
            )}

            {step === 6 && renderCard(
                "Burnout protection",
                "What would reduce future pressure a little?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Mute notifications for 30 minutes", () => handleNext(7))}
                    {renderButton("Move one task to later", () => handleNext(7))}
                    {renderButton("Ask for help", () => handleNext(7))}
                    {renderButton("Lower one standard", () => handleNext(7))}
                    {renderButton("Take a real break", () => handleNext(7))}
                    {renderButton("Stop after this block", () => handleNext(7))}
                </div>
            )}

            {step === 7 && renderCard(
                "Close realistically",
                "Progress still counts, even if everything is not done.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("That helped", () => handleNext(8))}
                    {renderButton("Do one more block", () => { setStep(5); })}
                    {renderButton("Try another support tool", () => { setBranch(null); handleNext(1); })}
                    {renderButton("I need more support", () => handleNext(8))}
                </div>
            )}

            {step === 8 && renderCard(
                "Session complete",
                "You do not need to do everything at once.",
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ color: accent, display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CheckCircle /></div>
                    <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>One focused block is a real step.</h4>
                    <p style={{ color: '#94a3b8' }}>Return here to clear the noise anytime.</p>
                </div>
            )}
        </div>
    );
}
