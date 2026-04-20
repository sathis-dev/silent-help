'use client';

import { useState, useEffect } from 'react';
import { soundManager } from '@/lib/audio';

/* ═══════════════════════════════════════════════════════════════
   Focus Timer — SVG Progress Ring Timer
   
   Presets: 1min, 3min, 5min, 10min (or custom seconds)
   Features: Circular progress ring, motivational text, end early
   ═══════════════════════════════════════════════════════════════ */

const MOTIVATIONAL_TEXTS = [
    "You only need to handle this moment.",
    "One step at a time.",
    "Progress, not perfection.",
    "You are doing enough.",
    "Small efforts still count.",
    "Stay with this moment.",
    "You've got this.",
    "Keep going gently.",
];

interface FocusTimerProps {
    /** Duration in seconds */
    duration: number;
    /** Label shown above timer */
    label?: string;
    accent: string;
    onComplete: () => void;
    onCancel: () => void;
}

export default function FocusTimer({ duration, label, accent, onComplete, onCancel }: FocusTimerProps) {
    const [started, setStarted] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [motivIdx, setMotivIdx] = useState(0);

    const remaining = Math.max(0, duration - elapsed);
    const progress = duration > 0 ? elapsed / duration : 0;
    const circumference = 2 * Math.PI * 100;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Main timer
    useEffect(() => {
        if (!started || isComplete) return;
        const interval = setInterval(() => {
            setElapsed(prev => {
                if (prev + 1 >= duration) {
                    soundManager.playChime(528, 4.0); // 528Hz is often associated with healing/calm
                    setIsComplete(true);
                    return duration;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, isComplete, duration]);

    // Rotate motivational text every 15s
    useEffect(() => {
        if (!started || isComplete) return;
        const interval = setInterval(() => {
            setMotivIdx(prev => (prev + 1) % MOTIVATIONAL_TEXTS.length);
        }, 15000);
        return () => clearInterval(interval);
    }, [started, isComplete]);

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
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>Time&apos;s up!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>
                    You stayed focused for {formatTime(duration)}. That&apos;s real progress.
                </p>
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
                    position: 'relative', width: 160, height: 160, margin: '0 auto 32px',
                }}>
                    <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="80" cy="80" r="70" fill="none" stroke={`${accent}15`} strokeWidth="6" />
                        <circle cx="80" cy="80" r="70" fill="none" stroke={accent} strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset="0"
                            strokeLinecap="round" opacity="0.3" />
                    </svg>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: 8 }}>
                    {label || `${Math.floor(duration / 60)}-minute focus`}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 32 }}>
                    You only need to begin. You don&apos;t need to finish.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => setStarted(true)} style={{
                        padding: '14px 32px', borderRadius: 14, background: accent,
                        border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
                    }}>Start</button>
                    <button onClick={onCancel} style={{
                        padding: '14px 20px', borderRadius: 14, background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer'
                    }}>Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
            {/* SVG Ring Timer */}
            <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 32px' }}>
                <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background ring */}
                    <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    {/* Progress ring */}
                    <circle
                        cx="110" cy="110" r="100" fill="none"
                        stroke={accent} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                    {/* Glow dot at progress tip */}
                    <circle
                        cx={110 + 100 * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
                        cy={110 + 100 * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
                        r="5" fill={accent}
                        style={{ filter: `drop-shadow(0 0 6px ${accent})`, transition: 'cx 1s linear, cy 1s linear' }}
                    />
                </svg>

                {/* Center content */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {formatTime(remaining)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>remaining</span>
                </div>
            </div>

            {/* Label */}
            {label && (
                <p style={{ color: accent, fontWeight: 500, marginBottom: 8, fontSize: '0.95rem' }}>{label}</p>
            )}

            {/* Motivational text */}
            <p style={{
                color: '#64748b', fontSize: '0.85rem', marginBottom: 24, minHeight: '1.2em',
                transition: 'opacity 0.5s', fontStyle: 'italic',
            }}>
                {MOTIVATIONAL_TEXTS[motivIdx]}
            </p>

            {/* End early */}
            <button onClick={() => { setIsComplete(true); }} style={{
                padding: '10px 20px', borderRadius: 99, background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem'
            }}>End early</button>
        </div>
    );
}
