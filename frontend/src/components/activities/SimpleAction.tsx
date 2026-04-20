'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Simple Action — Quick Instruction Card with Completion
   
   For activities like: "Drink water", "Wash face", "Open window"
   Shows the instruction, a "Done" button, and a sparkle on complete.
   ═══════════════════════════════════════════════════════════════ */

interface SimpleActionProps {
    title: string;
    instruction: string;
    icon?: string;
    accent: string;
    onComplete: () => void;
    onCancel: () => void;
}

export default function SimpleAction({ title, instruction, icon = '✨', accent, onComplete, onCancel }: SimpleActionProps) {
    const [isDone, setIsDone] = useState(false);

    if (isDone) {
        return (
            <div style={{
                textAlign: 'center', padding: '48px 24px',
                animation: 'activity-fade-in 0.4s ease-out',
            }}>
                {/* Sparkle ring */}
                <div style={{
                    width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
                    background: `radial-gradient(circle, ${accent}30, transparent 70%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'breathe-glow 2s ease-in-out infinite',
                    position: 'relative',
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {/* Sparkle particles */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: 4, height: 4, borderRadius: '50%',
                            background: accent,
                            top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                            left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                            animation: `sparkle-particle 1.5s ease-out ${i * 0.1}s infinite`,
                            opacity: 0.6,
                        }} />
                    ))}
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>Small step taken</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>
                    Every small action counts. Well done.
                </p>
                <button onClick={onComplete} style={{
                    padding: '12px 28px', borderRadius: 12, background: accent,
                    border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer'
                }}>Continue</button>
            </div>
        );
    }

    return (
        <div style={{
            textAlign: 'center', padding: '48px 24px',
            animation: 'activity-fade-in 0.4s ease-out',
        }}>
            {/* Icon */}
            <div style={{
                width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
                background: `${accent}15`, border: `2px solid ${accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem',
                animation: 'breathe-idle 3s ease-in-out infinite',
            }}>
                {icon}
            </div>

            <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 12 }}>{title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
                {instruction}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setIsDone(true)} style={{
                    padding: '14px 32px', borderRadius: 14, background: accent,
                    border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer',
                    fontSize: '1rem',
                }}>
                    Done ✓
                </button>
                <button onClick={onCancel} style={{
                    padding: '14px 20px', borderRadius: 14, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                    cursor: 'pointer', fontSize: '0.85rem',
                }}>
                    Skip
                </button>
            </div>
        </div>
    );
}
