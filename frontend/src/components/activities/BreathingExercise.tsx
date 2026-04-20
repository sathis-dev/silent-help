'use client';

import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Breathing Exercise — Animated Guided Breathing
   
   Variants:
     calm-60   → 4s in, 4s hold, 6s out, 2s hold  (×4 = 64s)
     cyclic    → 4s in, 1s top-up, 8s out           (×5 = 65s)
     box       → 4s in, 4s hold, 4s out, 4s hold   (×4 = 64s)
     deep-3    → 5s in, 2s hold, 7s out             (×3 = 42s)
     soft      → 4s in, 6s out                      (×6 = 60s)
   ═══════════════════════════════════════════════════════════════ */

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'complete';

interface BreathPattern {
    name: string;
    phases: { phase: BreathPhase; duration: number; label: string }[];
    cycles: number;
}

const PATTERNS: Record<string, BreathPattern> = {
    'calm-60': {
        name: 'Calm in 60s',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Breathe in...' },
            { phase: 'hold-in', duration: 4, label: 'Hold...' },
            { phase: 'exhale', duration: 6, label: 'Breathe out...' },
            { phase: 'hold-out', duration: 2, label: 'Rest...' },
        ],
        cycles: 4,
    },
    'cyclic': {
        name: 'Cyclic Sigh',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Breathe in deeply...' },
            { phase: 'hold-in', duration: 1, label: 'Quick top-up inhale...' },
            { phase: 'exhale', duration: 8, label: 'Long slow exhale...' },
        ],
        cycles: 5,
    },
    'box': {
        name: 'Box Breathing',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Breathe in...' },
            { phase: 'hold-in', duration: 4, label: 'Hold...' },
            { phase: 'exhale', duration: 4, label: 'Breathe out...' },
            { phase: 'hold-out', duration: 4, label: 'Hold...' },
        ],
        cycles: 4,
    },
    'deep-3': {
        name: '3 Deep Breaths',
        phases: [
            { phase: 'inhale', duration: 5, label: 'Breathe in deeply...' },
            { phase: 'hold-in', duration: 2, label: 'Hold gently...' },
            { phase: 'exhale', duration: 7, label: 'Slowly release...' },
        ],
        cycles: 3,
    },
    'soft': {
        name: 'Soft Breathing',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Gently breathe in...' },
            { phase: 'exhale', duration: 6, label: 'Softly breathe out...' },
        ],
        cycles: 6,
    },
};

interface BreathingExerciseProps {
    variant: keyof typeof PATTERNS;
    accent: string;
    onComplete: () => void;
    onCancel: () => void;
}

export default function BreathingExercise({ variant, accent, onComplete, onCancel }: BreathingExerciseProps) {
    const pattern = PATTERNS[variant] || PATTERNS['calm-60'];
    
    const [started, setStarted] = useState(false);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
    const [phaseTimer, setPhaseTimer] = useState(0);
    const [totalElapsed, setTotalElapsed] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const totalDuration = pattern.phases.reduce((sum, p) => sum + p.duration, 0) * pattern.cycles;
    const currentPhase = pattern.phases[currentPhaseIdx];
    const phaseDuration = currentPhase?.duration || 1;

    // Main timer
    useEffect(() => {
        if (!started || isComplete) return;

        const interval = setInterval(() => {
            setPhaseTimer(prev => {
                const next = prev + 1;
                if (next >= phaseDuration) {
                    // Move to next phase
                    const nextPhaseIdx = currentPhaseIdx + 1;
                    if (nextPhaseIdx >= pattern.phases.length) {
                        // End of cycle
                        const nextCycle = currentCycle + 1;
                        if (nextCycle >= pattern.cycles) {
                            // Exercise complete
                            setIsComplete(true);
                            return 0;
                        }
                        setCurrentCycle(nextCycle);
                        setCurrentPhaseIdx(0);
                    } else {
                        setCurrentPhaseIdx(nextPhaseIdx);
                    }
                    return 0;
                }
                return next;
            });
            setTotalElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [started, isComplete, currentPhaseIdx, currentCycle, phaseDuration, pattern]);

    // Circle scale based on phase
    const getScale = (): number => {
        if (!started || isComplete) return 0.6;
        const progress = phaseTimer / phaseDuration;
        const phase = currentPhase?.phase;
        if (phase === 'inhale') return 0.6 + 0.4 * progress;       // 0.6 → 1.0
        if (phase === 'hold-in') return 1.0;                         // stay expanded
        if (phase === 'exhale') return 1.0 - 0.4 * progress;       // 1.0 → 0.6
        if (phase === 'hold-out') return 0.6;                        // stay contracted
        return 0.6;
    };

    const progressPercent = totalDuration > 0 ? (totalElapsed / totalDuration) * 100 : 0;
    const remainingSeconds = Math.max(0, totalDuration - totalElapsed);
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Auto-complete callback
    useEffect(() => {
        if (isComplete) {
            const t = setTimeout(onComplete, 3000);
            return () => clearTimeout(t);
        }
    }, [isComplete, onComplete]);

    if (isComplete) {
        return (
            <div className="breathing-exercise" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div className="breathing-complete-circle" style={{
                    width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
                    background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'breathe-glow 2s ease-in-out infinite',
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', marginBottom: 8 }}>Well done</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>You completed {pattern.name}. How do you feel?</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                    <button onClick={onComplete} style={{
                        padding: '12px 24px', borderRadius: 12, background: accent,
                        border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
                    }}>
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="breathing-exercise" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                    width: 140, height: 140, borderRadius: '50%', margin: '0 auto 32px',
                    background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
                    border: `2px solid ${accent}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'breathe-idle 3s ease-in-out infinite',
                }}>
                    <span style={{ fontSize: '2rem' }}>🫁</span>
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>{pattern.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 8 }}>
                    {pattern.cycles} cycles &middot; ~{Math.ceil(totalDuration / 10) * 10}s
                </p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 32 }}>
                    Find a comfortable position and focus on the circle.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => setStarted(true)} style={{
                        padding: '14px 32px', borderRadius: 14, background: accent,
                        border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer',
                        fontSize: '1rem',
                    }}>
                        Begin
                    </button>
                    <button onClick={onCancel} style={{
                        padding: '14px 24px', borderRadius: 14, background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                        cursor: 'pointer', fontSize: '0.9rem',
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const scale = getScale();

    return (
        <div className="breathing-exercise" style={{ textAlign: 'center', padding: '32px 24px' }}>

            {/* Progress ring + animated circle */}
            <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 32px' }}>
                {/* SVG progress ring */}
                <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle
                        cx="110" cy="110" r="100" fill="none"
                        stroke={accent} strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - progressPercent / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>

                {/* Animated breathing circle */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 140, height: 140,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transition: 'transform 1s ease-in-out',
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 40% 40%, ${accent}50, ${accent}15 60%, transparent 80%)`,
                    boxShadow: `0 0 ${30 + scale * 30}px ${accent}30, inset 0 0 40px ${accent}10`,
                }}>
                    {/* Inner ring */}
                    <div style={{
                        position: 'absolute', inset: 12, borderRadius: '50%',
                        border: `1.5px solid ${accent}40`,
                        transform: `scale(${0.85 + (scale - 0.6) * 0.2})`,
                        transition: 'transform 1s ease-in-out',
                    }} />
                    {/* Core glow */}
                    <div style={{
                        position: 'absolute', inset: 30, borderRadius: '50%',
                        background: `radial-gradient(circle, ${accent}30, transparent 70%)`,
                        transform: `scale(${0.7 + (scale - 0.6) * 0.5})`,
                        transition: 'transform 1s ease-in-out',
                    }} />
                </div>

                {/* Phase timer text in center */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    zIndex: 2,
                }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
                        {phaseDuration - phaseTimer}
                    </span>
                </div>
            </div>

            {/* Phase label */}
            <p style={{
                color: accent, fontSize: '1.2rem', fontWeight: 600, marginBottom: 8,
                transition: 'opacity 0.3s',
                minHeight: '1.5em',
            }}>
                {currentPhase?.label}
            </p>

            {/* Cycle & time info */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Cycle {currentCycle + 1}/{pattern.cycles}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(remainingSeconds)} left
                </span>
            </div>

            {/* Cancel button */}
            <button onClick={onCancel} style={{
                padding: '10px 20px', borderRadius: 99, background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', color: '#64748b',
                cursor: 'pointer', fontSize: '0.85rem',
            }}>
                End early
            </button>
        </div>
    );
}
