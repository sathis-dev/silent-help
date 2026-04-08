'use client';

import { useState, useEffect } from 'react';

// Using inline lucide-react SVGs for speed and consistency
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface OverwhelmRecoveryProps {
    accent: string;
}

export function OverwhelmRecovery({ accent }: OverwhelmRecoveryProps) {
    const [step, setStep] = useState(1);
    const [branch, setBranch] = useState<'settle' | 'organise' | null>(null);
    const [brainDump, setBrainDump] = useState('');
    const [activeTimer, setActiveTimer] = useState<number | null>(null); // seconds

    // Timer logic
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

    const handleNext = (nextStep: number) => {
        setStep(nextStep);
    };

    const renderCard = (title: string, subtitle: string, content: React.ReactNode) => (
        <div className="overwhelm-card" style={{ 
            background: 'rgba(15,23,42,0.6)', 
            border: `1px solid ${accent}30`, 
            borderRadius: 24, 
            padding: 32,
            transition: 'all 0.4s ease'
        }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#f8fafc' }}>{title}</h3>
            {subtitle && <p style={{ color: `${accent}`, fontWeight: 500, marginBottom: 24 }}>{subtitle}</p>}
            <div className="overwhelm-content flex flex-col gap-4">
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
        <div className="overwhelm-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
            <div className="recovery-header" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {step}/6
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Overwhelmed Recovery Path</h3>
                </div>
            </div>

            {step === 1 && renderCard(
                "Stop the flood",
                "You do not need to handle everything right now.",
                <>
                    {renderButton("Help me settle first", () => { setBranch('settle'); handleNext(2); })}
                    {renderButton("I can think, just help me organise", () => { setBranch('organise'); handleNext(3); })}
                </>
            )}

            {step === 2 && branch === 'settle' && renderCard(
                "Settle your system",
                "First, let's make this feel 5% lighter.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("60-second breathing", () => handleNext(3))}
                    {renderButton("3-3-3 grounding", () => handleNext(3))}
                    {renderButton("Cold water / wash face", () => handleNext(3))}
                    {renderButton("Shoulder drop + unclench jaw", () => handleNext(3))}
                </div>
            )}

            {step === 3 && renderCard(
                "Brain Dump",
                "Let's get this out of your head.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <textarea 
                        value={brainDump}
                        onChange={(e) => setBrainDump(e.target.value)}
                        placeholder="Type absolutely everything that is stressing you out right now. No formatting, no categories. Just let it out..."
                        style={{
                            width: '100%', minHeight: 140, padding: 16, borderRadius: 16,
                            background: 'rgba(15,23,42,0.8)', border: `1px solid ${accent}40`,
                            color: '#f8fafc', fontSize: '1rem', resize: 'vertical',
                            outline: 'none', fontFamily: 'inherit'
                        }}
                    />
                    {renderButton("Done dumping", () => handleNext(4), true)}
                </div>
            )}

            {step === 4 && renderCard(
                "Shrink the field",
                "What needs your attention first?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Must happen now", () => handleNext(5))}
                    {renderButton("Can wait", () => handleNext(5))}
                    {renderButton("Not in my control", () => handleNext(5))}
                </div>
            )}

            {step === 5 && renderCard(
                "Choose one tiny next step",
                "What is the smallest possible start?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Open the document</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Reply with one sentence</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Pick up three items</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Write the title only</div>
                    </div>
                    {renderButton("I've picked my step", () => handleNext(6), true)}
                </div>
            )}

            {step === 6 && activeTimer === null && renderCard(
                "Short action sprint",
                "You only need to begin. You do not need to finish.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("3-minute start", () => { setActiveTimer(180); })}
                    {renderButton("5-minute focus", () => { setActiveTimer(300); })}
                    {renderButton("10-minute sprint", () => { setActiveTimer(600); })}
               </div>
            )}

            {step === 6 && activeTimer !== null && activeTimer > 0 && renderCard(
                "Focus mode active",
                "Just work on your micro-step.",
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: '4.5rem', fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(activeTimer)}
                    </div>
                    <button 
                        onClick={() => setActiveTimer(0)}
                        style={{ marginTop: 24, padding: '10px 24px', background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', borderRadius: 99, cursor: 'pointer' }}
                    >
                        End sprint early
                    </button>
                </div>
            )}

            {step === 6 && activeTimer !== null && activeTimer === 0 && renderCard(
                "Reset and reduce",
                "Good. Now pause before choosing the next thing.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Take a 1-minute reset", () => { setStep(1); setActiveTimer(null); setBranch(null); })}
                    {renderButton("Do one more small step", () => { setStep(4); setActiveTimer(null); })}
                    {renderButton("Come back later", () => { setStep(7); })}
                    
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Optional boundaries:</p>
                    {renderButton("Mute notifications for 30 minutes", () => { setStep(7); })}
                    {renderButton("Move one task to later", () => { setStep(7); })}
                </div>
            )}

            {step === 7 && renderCard(
                "Session complete",
                "You handled the overwhelm.",
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ color: accent, display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CheckCircle /></div>
                    <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>Well done.</h4>
                    <p style={{ color: '#94a3b8' }}>Whenever you feel flooded, remember to come back and do this again.</p>
                </div>
            )}
        </div>
    );
}
