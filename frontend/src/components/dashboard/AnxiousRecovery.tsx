'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import GroundingExercise from '@/components/activities/GroundingExercise';

// Using inline lucide-react SVGs
const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface AnxiousRecoveryProps {
    accent: string;
}

type ActiveActivity = 
    | { type: 'breathing'; variant: 'calm-60' | 'box' }
    | { type: 'grounding'; variant: '5-4-3-2-1' }
    | null;

export function AnxiousRecovery({ accent }: AnxiousRecoveryProps) {
    const [step, setStep] = useState(1);
    const [worryCaptured, setWorryCaptured] = useState(false);
    const [activeActivity, setActiveActivity] = useState<ActiveActivity>(null);

    const handleNext = (nextStep: number) => {
        setStep(nextStep);
        setWorryCaptured(false);
        setActiveActivity(null);
    };

    const renderCard = (title: string, subtitle: string, content: React.ReactNode) => (
        <div className="anxious-card" style={{ 
            background: 'rgba(15,23,42,0.6)', 
            border: `1px solid ${accent}30`, 
            borderRadius: 24, padding: 32, transition: 'all 0.4s ease'
        }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#f8fafc' }}>{title}</h3>
            {subtitle && <p style={{ color: `${accent}`, fontWeight: 500, marginBottom: 24 }}>{subtitle}</p>}
            <div className="anxious-content flex flex-col gap-4">
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

    // If an activity is active, render it instead of the step card
    if (activeActivity) {
        const activityCard = (content: React.ReactNode) => (
            <div className="anxious-card" style={{ 
                background: 'rgba(15,23,42,0.6)', 
                border: `1px solid ${accent}30`, 
                borderRadius: 24, overflow: 'hidden', transition: 'all 0.4s ease'
            }}>
                {content}
            </div>
        );

        if (activeActivity.type === 'breathing') {
            return (
                <div className="anxious-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
                    {activityCard(
                        <BreathingExercise
                            variant={activeActivity.variant}
                            accent={accent}
                            onComplete={() => handleNext(2)}
                            onCancel={() => setActiveActivity(null)}
                        />
                    )}
                </div>
            );
        }
        if (activeActivity.type === 'grounding') {
            return (
                <div className="anxious-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
                    {activityCard(
                        <GroundingExercise
                            variant={activeActivity.variant}
                            accent={accent}
                            onComplete={() => handleNext(3)}
                            onCancel={() => setActiveActivity(null)}
                        />
                    )}
                </div>
            );
        }
    }

    return (
        <div className="anxious-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
            <div className="recovery-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {step}/6
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Anxiety Support Path</h3>
                </div>
                {step > 1 && step < 7 && (
                    <button
                        onClick={() => handleNext(step - 1)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                )}
            </div>

            {step === 1 && renderCard(
                "Slow it down",
                "You are safe in this moment. Let's slow things down first.",
                <>
                    {renderButton("Breathe with me", () => setActiveActivity({ type: 'breathing', variant: 'calm-60' }))}
                    {renderButton("Ground me now", () => setActiveActivity({ type: 'grounding', variant: '5-4-3-2-1' }))}
                </>
            )}

            {step === 2 && renderCard(
                "Ground in the present",
                "Come back to what is here right now.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: 'rgba(2,6,23,0.4)', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: '#e2e8f0' }}>
                            <li style={{ display: 'flex', gap: 12 }}><strong style={{ color: accent }}>5</strong> things you can see</li>
                            <li style={{ display: 'flex', gap: 12 }}><strong style={{ color: accent }}>4</strong> things you can feel physically</li>
                            <li style={{ display: 'flex', gap: 12 }}><strong style={{ color: accent }}>3</strong> things you can hear</li>
                            <li style={{ display: 'flex', gap: 12 }}><strong style={{ color: accent }}>2</strong> things you can smell</li>
                            <li style={{ display: 'flex', gap: 12 }}><strong style={{ color: accent }}>1</strong> thing you can taste (or take a sip of water)</li>
                        </ul>
                    </div>
                    <div style={{ height: 8 }} />
                    {renderButton("I feel a bit more grounded", () => handleNext(3), true)}
                </div>
            )}

            {step === 3 && renderCard(
                "Catch the worry",
                !worryCaptured ? "What is your mind predicting right now?" : "Is this happening right now, or is it a fear about what might happen?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {!worryCaptured ? (
                        <>
                            {renderButton("Something will go wrong", () => setWorryCaptured(true))}
                            {renderButton("I will not cope", () => setWorryCaptured(true))}
                            {renderButton("I might fail", () => setWorryCaptured(true))}
                            {renderButton("I am not sure, it just feels bad", () => setWorryCaptured(true))}
                        </>
                    ) : (
                        <>
                            {renderButton("It is happening right now", () => handleNext(4))}
                            {renderButton("It is a fear about what might happen", () => handleNext(4))}
                        </>
                    )}
                </div>
            )}

            {step === 4 && renderCard(
                "Make it more realistic",
                "What is a more balanced possibility?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("Maybe it will be difficult, but manageable", () => handleNext(5))}
                    {renderButton("I do not know the outcome yet", () => handleNext(5))}
                    {renderButton("I can handle one part of this", () => handleNext(5))}
                    {renderButton("I do not need certainty right now", () => handleNext(5))}
                </div>
            )}

            {step === 5 && renderCard(
                "Take one small control action",
                "What is one small thing that would help right now?",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Send one message</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Prepare one item</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Write one note</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Move to a quieter place</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Drink water</div>
                        <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Set a 5-minute timer</div>
                    </div>
                    {renderButton("Action planned", () => handleNext(6), true)}
                </div>
            )}

            {step === 6 && renderCard(
                "Close gently",
                "You do not need to solve everything now. One step was enough.",
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {renderButton("That helped", () => handleNext(7))}
                    {renderButton("Try another calm tool", () => handleNext(1))}
                    {renderButton("I need more support", () => handleNext(7))}
                </div>
            )}

            {step === 7 && renderCard(
                "Session complete",
                "You are taking control back.",
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ color: accent, display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CheckCircle /></div>
                    <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>Well done.</h4>
                    <p style={{ color: '#94a3b8' }}>Remember this place is always here when your mind feels too fast.</p>
                </div>
            )}
        </div>
    );
}
