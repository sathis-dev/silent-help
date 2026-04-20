'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';
import SimpleAction from '@/components/activities/SimpleAction';
import FocusTimer from '@/components/activities/FocusTimer';

const ChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>;
const CheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface FrustratedRecoveryProps { accent: string; }

type ActiveActivity =
    | { type: 'breathing'; variant: 'calm-60' | 'box' }
    | { type: 'body'; variant: 'shake' | 'shoulder-jaw' }
    | { type: 'simple'; title: string; instruction: string; icon: string }
    | { type: 'timer'; duration: number; label: string }
    | null;

export function FrustratedRecovery({ accent }: FrustratedRecoveryProps) {
    const [step, setStep] = useState(1);
    const [branch, setBranch] = useState<'cool' | 'think' | 'respond' | null>(null);
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

    // Activity overlays
    if (activeActivity) {
        const wrap = (c: React.ReactNode) => (
            <div className="frustrated-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
                <div style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${accent}30`, borderRadius: 24, overflow: 'hidden' }}>{c}</div>
            </div>
        );
        if (activeActivity.type === 'breathing') return wrap(<BreathingExercise variant={activeActivity.variant} accent={accent} onComplete={() => handleNext(3)} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'body') return wrap(<BodyReleaseExercise variant={activeActivity.variant} accent={accent} onComplete={() => handleNext(3)} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'simple') return wrap(<SimpleAction title={activeActivity.title} instruction={activeActivity.instruction} icon={activeActivity.icon} accent={accent} onComplete={() => handleNext(3)} onCancel={() => setActiveActivity(null)} />);
        if (activeActivity.type === 'timer') return wrap(<FocusTimer duration={activeActivity.duration} label={activeActivity.label} accent={accent} onComplete={() => handleNext(3)} onCancel={() => setActiveActivity(null)} />);
    }

    return (
        <div className="frustrated-recovery-wrapper" style={{ marginTop: 32, marginBottom: 32 }}>
            <div className="recovery-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {step === 2 && branch === 'cool' ? '2A' : step === 2 && branch === 'think' ? '2B' : step}/6
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Frustration Support Path</h3>
                </div>
                {step > 1 && step < 7 && (
                    <button onClick={() => handleNext(step - 1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back
                    </button>
                )}
            </div>

            {step === 1 && renderCard("Pause the impulse", "Do not react yet.", <>
                {renderButton("Cool me down first", () => { setBranch('cool'); handleNext(2); })}
                {renderButton("Help me think clearly", () => { setBranch('think'); handleNext(2); })}
                {renderButton("Help me respond well", () => { setBranch('respond'); handleNext(5); })}
            </>)}

            {step === 2 && branch === 'cool' && renderCard("Cool me down first", "First, let the heat come down.", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("60-second breathing", () => setActiveActivity({ type: 'breathing', variant: 'calm-60' }))}
                {renderButton("Shake it out", () => setActiveActivity({ type: 'body', variant: 'shake' }))}
                {renderButton("Drop shoulders + unclench jaw", () => setActiveActivity({ type: 'body', variant: 'shoulder-jaw' }))}
                {renderButton("Cold water / wash face", () => setActiveActivity({ type: 'simple', title: 'Cold Water Reset', instruction: 'Go splash cold water on your face or wrists. The cold activates your dive reflex and pulls your nervous system down.', icon: '💧' }))}
                {renderButton("1-minute walk", () => setActiveActivity({ type: 'timer', duration: 60, label: '1-minute walk' }))}
            </div>)}

            {step === 2 && branch === 'think' && renderCard("Help me think clearly", "What is the main thing bothering you?", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Unfair", () => handleNext(3))}
                {renderButton("Blocked", () => handleNext(3))}
                {renderButton("Ignored", () => handleNext(3))}
                {renderButton("Interrupted", () => handleNext(3))}
                {renderButton("Disappointed", () => handleNext(3))}
                {renderButton("Other", () => handleNext(3))}
            </div>)}

            {step === 3 && renderCard("Spot the trigger", "What set this off?", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Someone's behaviour", () => handleNext(4))}
                {renderButton("Too many demands", () => handleNext(4))}
                {renderButton("Something went wrong", () => handleNext(4))}
                {renderButton("I felt disrespected", () => handleNext(4))}
                {renderButton("I'm already overloaded", () => handleNext(4))}
            </div>)}

            {step === 4 && renderCard("Split control", "What can you control right now?", <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div style={{ border: `1px solid ${accent}40`, borderRadius: 16, padding: '20px 24px', background: 'rgba(2,6,23,0.4)' }}>
                        <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />Can control
                        </h4>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12, color: '#e2e8f0', fontSize: '0.95rem' }}>
                            <li>&mdash; My message</li><li>&mdash; My tone</li><li>&mdash; Whether I take a break</li><li>&mdash; My next step</li>
                        </ul>
                    </div>
                    <div style={{ border: '1px solid #475569', borderRadius: 16, padding: '20px 24px', background: 'rgba(2,6,23,0.4)' }}>
                        <h4 style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#475569' }} />Cannot control
                        </h4>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12, color: '#94a3b8', fontSize: '0.95rem' }}>
                            <li>&mdash; What they already said</li><li>&mdash; Their personality</li><li>&mdash; What already happened</li>
                        </ul>
                    </div>
                </div>
                {renderButton("I see the difference", () => handleNext(5), true)}
            </div>)}

            {step === 5 && renderCard("Choose the safest useful response", "What is the calmest useful next move?", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("Step away for 10 minutes", () => setActiveActivity({ type: 'timer', duration: 600, label: 'Step away for 10 minutes' }))}
                {renderButton("Write it, don't send it", () => handleNext(6))}
                {renderButton("Say one clear sentence", () => handleNext(6))}
                {renderButton("Ask for space", () => handleNext(6))}
                {renderButton("Do nothing for now", () => handleNext(6))}
            </div>)}

            {step === 6 && renderCard("Close the loop", "You do not need to solve this at full heat.", <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {renderButton("That helped", () => handleNext(7))}
                {renderButton("Try another reset", () => { setBranch(null); handleNext(1); })}
                {renderButton("I need more support", () => handleNext(7))}
            </div>)}

            {step === 7 && renderCard("Session complete", "You successfully delayed an impulsive reaction.", <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ color: accent, display: 'flex', justifyContent: 'center', marginBottom: 16 }}><CheckCircle /></div>
                <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>Well handled.</h4>
                <p style={{ color: '#94a3b8' }}>You can respond without exploding.</p>
            </div>)}
        </div>
    );
}
