'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import SimpleAction from '@/components/activities/SimpleAction';

const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface SadRecoveryProps { accent: string; }

type ActiveActivity =
    | { type: 'breathing'; variant: 'soft' | 'deep-3' }
    | { type: 'simple'; title: string; instruction: string; icon: string }
    | null;

export function SadRecovery({ accent }: SadRecoveryProps) {
    const [step, setStep] = useState(1);
    const [branch, setBranch] = useState<'comfort' | 'win' | 'support' | null>(null);
    const [activeActivity, setActiveActivity] = useState<ActiveActivity>(null);

    const handleNext = (nextStep: number) => { setStep(nextStep); setActiveActivity(null); };

    const renderCard = (title: string, subtitle: string, content: React.ReactNode) => (
        <div style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${accent}30`, borderRadius: 24, padding: 32, transition: 'all 0.4s ease' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: '#f8fafc' }}>{title}</h3>
            {subtitle && <p style={{ color: accent, fontWeight: 500, marginBottom: 24 }}>{subtitle}</p>}
            <div className="flex flex-col gap-4">{content}</div>
        </div>
    );

    const renderButton = (text: string, onClick: () => void, primary = false) => (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderRadius: 16,
            background: primary ? accent : 'rgba(30,41,59,0.7)',
            color: primary ? '#0f172a' : '#f8fafc',
            fontWeight: 600, border: primary ? 'none' : `1px solid ${accent}40`,
            cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left'
        }}
        onMouseEnter={(e) => { if (!primary) e.currentTarget.style.background = 'rgba(30,41,59,0.9)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { if (!primary) e.currentTarget.style.background = 'rgba(30,41,59,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <span>{text}</span>{!primary && <ChevronRight />}
        </button>
    );

    if (activeActivity) {
        const wrap = (c: React.ReactNode) => (
            <div className="sad-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
                <div style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${accent}30`, borderRadius: 24, overflow: 'hidden' }}>{c}</div>
            </div>
        );
        if (activeActivity.type === 'breathing') return wrap(<BreathingExercise variant={activeActivity.variant} accent={accent} onComplete={() => handleNext(3)} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'simple') return wrap(<SimpleAction title={activeActivity.title} instruction={activeActivity.instruction} icon={activeActivity.icon} accent={accent} onComplete={() => handleNext(3)} onCancel={() => setActiveActivity(null)} />);
    }

    return (
        <div className="sad-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
            <div className="recovery-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {step === 2 && branch === 'comfort' ? '2A' : step === 2 && branch === 'win' ? '2B' : step === 2 && branch === 'support' ? '2C' : step}/6
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Gentle Support Path</h3>
                </div>
                {step > 1 && step < 7 && (
                    <button onClick={() => handleNext(step - 1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back
                    </button>
                )}
            </div>

            {step === 1 && renderCard("Make it okay to be where you are", "You do not need to force yourself to feel better right away.", <>
                {renderButton("Help me feel a bit lighter", () => { setBranch('comfort'); handleNext(2); })}
                {renderButton("Help me do one small thing", () => { setBranch('win'); handleNext(2); })}
                {renderButton("I need support, not effort", () => { setBranch('support'); handleNext(2); })}
            </>)}

            {step === 2 && branch === 'comfort' && renderCard("Comfort first", "Let's make this moment a little kinder.", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Drink water", () => setActiveActivity({ type: 'simple', title: 'Drink Water', instruction: 'Go get a glass of water. Drink it slowly. Feel the coolness.', icon: '💧' }))}
                {renderButton("Sit somewhere softer", () => setActiveActivity({ type: 'simple', title: 'Find Comfort', instruction: 'Move to the softest, most comfortable spot nearby. A couch, a bed, a cushion.', icon: '🛋️' }))}
                {renderButton("Wrap up warm", () => setActiveActivity({ type: 'simple', title: 'Wrap Up', instruction: 'Get a blanket, a hoodie, or anything warm. Wrap yourself up.', icon: '🧣' }))}
                {renderButton("Open a window", () => setActiveActivity({ type: 'simple', title: 'Fresh Air', instruction: 'Open a window near you. Feel the air on your face for a moment.', icon: '🪟' }))}
                {renderButton("Take 3 slow breaths", () => setActiveActivity({ type: 'breathing', variant: 'deep-3' }))}
            </div>)}

            {step === 2 && branch === 'win' && renderCard("Gentle Activation", "Pick the easiest possible win.", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Sit up", () => setActiveActivity({ type: 'simple', title: 'Sit Up', instruction: 'Slowly sit up wherever you are. Just that. Nothing more.', icon: '🧘' }))}
                {renderButton("Wash face", () => setActiveActivity({ type: 'simple', title: 'Wash Face', instruction: 'Go to the nearest tap. Splash some water on your face. Pat dry gently.', icon: '💦' }))}
                {renderButton("Change room", () => setActiveActivity({ type: 'simple', title: 'Change Room', instruction: 'Walk to a different room. Just stand there for a moment. A change of scene helps.', icon: '🚪' }))}
                {renderButton("Stand near a window", () => setActiveActivity({ type: 'simple', title: 'Window Moment', instruction: 'Go stand near a window. Look outside for 30 seconds. Notice one thing.', icon: '🪟' }))}
                {renderButton("Play one song", () => setActiveActivity({ type: 'simple', title: 'One Song', instruction: 'Pick one song you like. Press play. Just listen.', icon: '🎵' }))}
                {renderButton("Pick up one item", () => setActiveActivity({ type: 'simple', title: 'One Item', instruction: 'Pick up one item near you and put it where it belongs. Just one.', icon: '📦' }))}
            </div>)}

            {step === 2 && branch === 'support' && renderCard("Low Capacity", "That's okay. You do not have to do much right now.", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Stay with a calm screen", () => handleNext(3))}
                {renderButton("Read one gentle message", () => handleNext(3))}
                {renderButton("Show support options", () => handleNext(3))}
                {renderButton("Message someone I trust", () => handleNext(3))}
            </div>)}

            {step === 3 && renderCard("Name the heaviness", "What feels closest right now?", <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {renderButton("Heavy", () => handleNext(4))}
                {renderButton("Empty", () => handleNext(4))}
                {renderButton("Lonely", () => handleNext(4))}
                {renderButton("Drained", () => handleNext(4))}
                {renderButton("Numb", () => handleNext(4))}
                {renderButton("Tearful", () => handleNext(4))}
            </div>)}

            {step === 4 && renderCard("Reduce isolation gently", "Would a little connection help?", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Message one safe person", () => handleNext(5))}
                {renderButton("Sit near someone", () => handleNext(5))}
                {renderButton("Save a message draft", () => handleNext(5))}
                {renderButton("Choose not now", () => handleNext(5))}
            </div>)}

            {step === 5 && renderCard("One soft next step", "Choose one thing that asks very little from you.", <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Drink water</div>
                    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Take medicine if needed</div>
                    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Tidy one item</div>
                    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Put on clean clothes</div>
                    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Step outside for 1 minute</div>
                    <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${accent}20`, color: '#94a3b8', fontSize: '0.9rem' }}>e.g. Lie down and breathe</div>
                </div>
                {renderButton("I've chosen", () => handleNext(6), true)}
            </div>)}

            {step === 6 && renderCard("Close with care", "Small steps still count.", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("That helped", () => handleNext(7))}
                {renderButton("Try another gentle tool", () => { setBranch(null); handleNext(1); })}
                {renderButton("I need more support", () => handleNext(7))}
            </div>)}

            {step === 7 && renderCard("Session complete", "You do not have to carry this alone.", <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ color: accent, display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CheckCircle /></div>
                <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>Small care still counts.</h4>
                <p style={{ color: '#94a3b8' }}>Return here whenever things feel a little too heavy.</p>
            </div>)}
        </div>
    );
}
