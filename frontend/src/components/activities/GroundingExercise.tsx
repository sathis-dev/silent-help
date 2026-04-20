'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Grounding Exercise — Interactive Step-Through Guide
   
   Variants:
     5-4-3-2-1  → 5 see → 4 feel → 3 hear → 2 smell → 1 taste
     3-3-3      → 3 see → 3 hear → 3 body parts you move
   ═══════════════════════════════════════════════════════════════ */

interface GroundingStep {
    count: number;
    sense: string;
    icon: string;
    prompt: string;
}

const GROUNDING_PATTERNS: Record<string, { name: string; steps: GroundingStep[] }> = {
    '5-4-3-2-1': {
        name: '5-4-3-2-1 Grounding',
        steps: [
            { count: 5, sense: 'See', icon: '👁️', prompt: 'Name 5 things you can see right now' },
            { count: 4, sense: 'Touch', icon: '✋', prompt: 'Name 4 things you can physically feel' },
            { count: 3, sense: 'Hear', icon: '👂', prompt: 'Name 3 things you can hear' },
            { count: 2, sense: 'Smell', icon: '👃', prompt: 'Name 2 things you can smell' },
            { count: 1, sense: 'Taste', icon: '👅', prompt: 'Name 1 thing you can taste (or take a sip of water)' },
        ],
    },
    '3-3-3': {
        name: '3-3-3 Grounding',
        steps: [
            { count: 3, sense: 'See', icon: '👁️', prompt: 'Name 3 things you can see' },
            { count: 3, sense: 'Hear', icon: '👂', prompt: 'Name 3 things you can hear' },
            { count: 3, sense: 'Move', icon: '🤸', prompt: 'Move 3 parts of your body (e.g. fingers, shoulders, toes)' },
        ],
    },
};

interface GroundingExerciseProps {
    variant: keyof typeof GROUNDING_PATTERNS;
    accent: string;
    onComplete: () => void;
    onCancel: () => void;
}

export default function GroundingExercise({ variant, accent, onComplete, onCancel }: GroundingExerciseProps) {
    const pattern = GROUNDING_PATTERNS[variant] || GROUNDING_PATTERNS['5-4-3-2-1'];
    const [currentStep, setCurrentStep] = useState(0);
    const [itemsDone, setItemsDone] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [fadeKey, setFadeKey] = useState(0);

    const step = pattern.steps[currentStep];
    const totalSteps = pattern.steps.length;

    const handleItemDone = () => {
        const next = itemsDone + 1;
        if (next >= step.count) {
            // Move to next step
            const nextStep = currentStep + 1;
            if (nextStep >= totalSteps) {
                setIsComplete(true);
            } else {
                setCurrentStep(nextStep);
                setItemsDone(0);
                setFadeKey(prev => prev + 1);
            }
        } else {
            setItemsDone(next);
        }
    };

    if (isComplete) {
        return (
            <div className="grounding-exercise" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                    width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
                    background: `radial-gradient(circle, ${accent}30, transparent 70%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'breathe-glow 2s ease-in-out infinite',
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>You are grounded</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>
                    You brought yourself back to the present moment.
                </p>
                <button onClick={onComplete} style={{
                    padding: '12px 28px', borderRadius: 12, background: accent,
                    border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
                }}>
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="grounding-exercise" key={fadeKey} style={{
            padding: '32px 24px',
            animation: 'activity-fade-in 0.4s ease-out',
        }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                {pattern.steps.map((s, i) => (
                    <div key={i} style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: i < currentStep ? accent : i === currentStep ? `${accent}80` : 'rgba(255,255,255,0.1)',
                        transition: 'all 0.3s',
                        boxShadow: i === currentStep ? `0 0 8px ${accent}50` : 'none',
                    }} />
                ))}
            </div>

            {/* Main icon */}
            <div style={{
                width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
                background: `${accent}15`, border: `2px solid ${accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem',
                animation: 'breathe-idle 3s ease-in-out infinite',
            }}>
                {step.icon}
            </div>

            {/* Sense label */}
            <h3 style={{ color: accent, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, textAlign: 'center' }}>
                {step.sense}
            </h3>

            {/* Prompt */}
            <p style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 500, marginBottom: 24, textAlign: 'center' }}>
                {step.prompt}
            </p>

            {/* Item progress circles */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
                {Array.from({ length: step.count }).map((_, i) => (
                    <div key={i} style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: `2px solid ${i < itemsDone ? accent : 'rgba(255,255,255,0.15)'}`,
                        background: i < itemsDone ? `${accent}20` : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        transform: i < itemsDone ? 'scale(1.1)' : 'scale(1)',
                    }}>
                        {i < itemsDone && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        {i === itemsDone && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 600 }}>
                                {i + 1}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={handleItemDone} style={{
                    padding: '14px 32px', borderRadius: 14, background: accent,
                    border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer',
                    fontSize: '1rem',
                }}>
                    {itemsDone < step.count - 1 ? `Got ${itemsDone + 1}` : 'Done'}
                </button>
                <button onClick={onCancel} style={{
                    padding: '14px 20px', borderRadius: 14, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#64748b',
                    cursor: 'pointer', fontSize: '0.85rem',
                }}>
                    Skip
                </button>
            </div>

            {/* Step counter */}
            <p style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', marginTop: 20 }}>
                Step {currentStep + 1} of {totalSteps}
            </p>
        </div>
    );
}
