'use client';

import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Body Release Exercise — Guided Muscle Release & Movement
   
   Variants:
     pmr-short     → Shoulders → Jaw → Fists → Feet (5s tense + 10s release)
     shoulder-jaw  → Shoulders → Jaw only (5s tense + 10s release)
     shake         → 30-second full body shake with vibrate animation
     posture-reset → Stand → Stretch → Roll shoulders → Deep breath (10s each)
   ═══════════════════════════════════════════════════════════════ */

interface BodyRegion {
    name: string;
    icon: string;
    tensePrompt: string;
    releasePrompt: string;
    tenseDuration: number;
    releaseDuration: number;
}


interface PostureStep {
    name: string;
    icon: string;
    prompt: string;
    duration: number;
}

const PMR_SHORT: BodyRegion[] = [
    { name: 'Shoulders', icon: '🤷', tensePrompt: 'Raise your shoulders to your ears...', releasePrompt: 'Now let them drop completely...', tenseDuration: 5, releaseDuration: 10 },
    { name: 'Jaw', icon: '😬', tensePrompt: 'Clench your jaw tight...', releasePrompt: 'Now let your jaw hang loose...', tenseDuration: 5, releaseDuration: 10 },
    { name: 'Fists', icon: '✊', tensePrompt: 'Squeeze your fists as hard as you can...', releasePrompt: 'Now open your hands and spread your fingers...', tenseDuration: 5, releaseDuration: 10 },
    { name: 'Feet', icon: '🦶', tensePrompt: 'Curl your toes tight...', releasePrompt: 'Now stretch them out and relax...', tenseDuration: 5, releaseDuration: 10 },
];

const SHOULDER_JAW: BodyRegion[] = [
    { name: 'Shoulders', icon: '🤷', tensePrompt: 'Pull your shoulders up to your ears...', releasePrompt: 'Now drop them completely. Feel the tension leave...', tenseDuration: 5, releaseDuration: 10 },
    { name: 'Jaw', icon: '😌', tensePrompt: 'Clench your jaw tightly...', releasePrompt: 'Now let it hang loose. Unclench completely...', tenseDuration: 5, releaseDuration: 10 },
];

const POSTURE_STEPS: PostureStep[] = [
    { name: 'Stand', icon: '🧍', prompt: 'Stand up slowly. Plant both feet on the ground.', duration: 10 },
    { name: 'Stretch', icon: '🙆', prompt: 'Reach your arms above your head and stretch tall.', duration: 10 },
    { name: 'Roll', icon: '🔄', prompt: 'Roll your shoulders backwards 5 times, slowly.', duration: 10 },
    { name: 'Breathe', icon: '🌬️', prompt: 'Take one long, deep breath in and out.', duration: 10 },
];

type BodyReleaseVariant = 'pmr-short' | 'shoulder-jaw' | 'shake' | 'posture-reset';

interface BodyReleaseExerciseProps {
    variant: BodyReleaseVariant;
    accent: string;
    onComplete: () => void;
    onCancel: () => void;
}

export default function BodyReleaseExercise({ variant, accent, onComplete, onCancel }: BodyReleaseExerciseProps) {
    const [started, setStarted] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [phase, setPhase] = useState<'tense' | 'release' | 'active'>('tense');
    const [timer, setTimer] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const getVariantName = () => {
        switch (variant) {
            case 'pmr-short': return 'Progressive Muscle Relaxation';
            case 'shoulder-jaw': return 'Shoulder & Jaw Release';
            case 'shake': return 'Shake It Out';
            case 'posture-reset': return 'Posture Reset';
        }
    };

    const getVariantIcon = () => {
        switch (variant) {
            case 'pmr-short': return '💆';
            case 'shoulder-jaw': return '🤷';
            case 'shake': return '🫨';
            case 'posture-reset': return '🧍';
        }
    };

    // Get total duration for display
    const getTotalDuration = () => {
        if (variant === 'shake') return 30;
        if (variant === 'posture-reset') return POSTURE_STEPS.reduce((s, p) => s + p.duration, 0);
        const regions = variant === 'pmr-short' ? PMR_SHORT : SHOULDER_JAW;
        return regions.reduce((s, r) => s + r.tenseDuration + r.releaseDuration, 0);
    };

    // Shake timer
    useEffect(() => {
        if (!started || isComplete || variant !== 'shake') return;
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev + 1 >= 30) {
                    setIsComplete(true);
                    return 30;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, isComplete, variant]);

    // Posture reset timer
    useEffect(() => {
        if (!started || isComplete || variant !== 'posture-reset') return;
        const step = POSTURE_STEPS[stepIdx];
        if (!step) return;

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev + 1 >= step.duration) {
                    const next = stepIdx + 1;
                    if (next >= POSTURE_STEPS.length) {
                        setIsComplete(true);
                    } else {
                        setStepIdx(next);
                    }
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, isComplete, variant, stepIdx]);

    // PMR / shoulder-jaw timer
    useEffect(() => {
        if (!started || isComplete || (variant !== 'pmr-short' && variant !== 'shoulder-jaw')) return;
        const regions = variant === 'pmr-short' ? PMR_SHORT : SHOULDER_JAW;
        const region = regions[stepIdx];
        if (!region) return;

        const duration = phase === 'tense' ? region.tenseDuration : region.releaseDuration;

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev + 1 >= duration) {
                    if (phase === 'tense') {
                        setPhase('release');
                    } else {
                        // Next region
                        const next = stepIdx + 1;
                        if (next >= regions.length) {
                            setIsComplete(true);
                        } else {
                            setStepIdx(next);
                            setPhase('tense');
                        }
                    }
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, isComplete, variant, stepIdx, phase]);

    if (isComplete) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
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
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>Tension released</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>Your body feels lighter now.</p>
                <button onClick={onComplete} style={{
                    padding: '12px 28px', borderRadius: 12, background: accent,
                    border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
                }}>Continue</button>
            </div>
        );
    }

    if (!started) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                    width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
                    background: `${accent}15`, border: `2px solid ${accent}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', animation: 'breathe-idle 3s ease-in-out infinite',
                }}>
                    {getVariantIcon()}
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>{getVariantName()}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 32 }}>
                    ~{getTotalDuration()} seconds
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => setStarted(true)} style={{
                        padding: '14px 32px', borderRadius: 14, background: accent,
                        border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
                    }}>Begin</button>
                    <button onClick={onCancel} style={{
                        padding: '14px 20px', borderRadius: 14, background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer'
                    }}>Cancel</button>
                </div>
            </div>
        );
    }

    // === SHAKE VARIANT ===
    if (variant === 'shake') {
        return (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{
                    width: 140, height: 140, borderRadius: '50%', margin: '0 auto 24px',
                    background: `radial-gradient(circle, ${accent}30, ${accent}10 60%, transparent 80%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem',
                    animation: 'shake-vibrate 0.15s ease-in-out infinite',
                    boxShadow: `0 0 40px ${accent}20`,
                }}>
                    🫨
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>Shake your whole body!</h3>
                <p style={{ color: '#94a3b8', marginBottom: 24 }}>Shake out arms, legs, hands — let the tension go!</p>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums', marginBottom: 24 }}>
                    {30 - timer}
                </div>
                {/* Progress bar */}
                <div style={{ width: '80%', maxWidth: 300, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', margin: '0 auto 24px' }}>
                    <div style={{ width: `${(timer / 30) * 100}%`, height: '100%', borderRadius: 3, background: accent, transition: 'width 1s linear' }} />
                </div>
                <button onClick={onCancel} style={{
                    padding: '10px 20px', borderRadius: 99, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer'
                }}>End early</button>
            </div>
        );
    }

    // === POSTURE RESET ===
    if (variant === 'posture-reset') {
        const step = POSTURE_STEPS[stepIdx];
        return (
            <div style={{ textAlign: 'center', padding: '40px 24px', animation: 'activity-fade-in 0.4s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    {POSTURE_STEPS.map((_, i) => (
                        <div key={i} style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: i < stepIdx ? accent : i === stepIdx ? `${accent}80` : 'rgba(255,255,255,0.1)',
                            boxShadow: i === stepIdx ? `0 0 8px ${accent}50` : 'none',
                        }} />
                    ))}
                </div>
                <div style={{
                    width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
                    background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', animation: 'breathe-idle 3s ease-in-out infinite',
                }}>
                    {step.icon}
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>{step.name}</h3>
                <p style={{ color: '#94a3b8', marginBottom: 24 }}>{step.prompt}</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums', marginBottom: 24 }}>
                    {step.duration - timer}
                </div>
                <button onClick={onCancel} style={{
                    padding: '10px 20px', borderRadius: 99, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer'
                }}>End early</button>
            </div>
        );
    }

    // === PMR / SHOULDER-JAW ===
    const regions = variant === 'pmr-short' ? PMR_SHORT : SHOULDER_JAW;
    const region = regions[stepIdx];
    const duration = phase === 'tense' ? region.tenseDuration : region.releaseDuration;

    return (
        <div style={{ textAlign: 'center', padding: '40px 24px', animation: 'activity-fade-in 0.4s ease-out' }}>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                {regions.map((_, i) => (
                    <div key={i} style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: i < stepIdx ? accent : i === stepIdx ? `${accent}80` : 'rgba(255,255,255,0.1)',
                        boxShadow: i === stepIdx ? `0 0 8px ${accent}50` : 'none',
                    }} />
                ))}
            </div>

            {/* Body region icon */}
            <div style={{
                width: 130, height: 130, borderRadius: '50%', margin: '0 auto 24px',
                background: phase === 'tense'
                    ? `radial-gradient(circle, ${accent}40, ${accent}15 60%, transparent 80%)`
                    : `radial-gradient(circle, ${accent}15, transparent 60%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem',
                transform: phase === 'tense' ? 'scale(1.1)' : 'scale(1.0)',
                transition: 'all 0.5s ease',
                boxShadow: phase === 'tense' ? `0 0 30px ${accent}30` : 'none',
            }}>
                {region.icon}
            </div>

            {/* Phase label */}
            <div style={{
                display: 'inline-block', padding: '4px 16px', borderRadius: 99,
                background: phase === 'tense' ? `${accent}20` : 'rgba(255,255,255,0.05)',
                color: phase === 'tense' ? accent : '#94a3b8',
                fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 16,
            }}>
                {phase === 'tense' ? '⚡ Tense' : '☁️ Release'}
            </div>

            <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>{region.name}</h3>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>
                {phase === 'tense' ? region.tensePrompt : region.releasePrompt}
            </p>

            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums', marginBottom: 24 }}>
                {duration - timer}
            </div>

            <p style={{ color: '#475569', fontSize: '0.8rem', marginBottom: 16 }}>
                Region {stepIdx + 1} of {regions.length}
            </p>

            <button onClick={onCancel} style={{
                padding: '10px 20px', borderRadius: 99, background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer'
            }}>End early</button>
        </div>
    );
}
