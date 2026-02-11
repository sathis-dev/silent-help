'use client';

import { useState } from 'react';

const TOOLS = [
    {
        id: 'breathing',
        name: 'Box Breathing',
        description: 'A calming 4-4-4-4 breathing pattern to slow your heart rate and find calm.',
        icon: '🌊',
        color: '#2dd4bf',
        duration: '4 min',
    },
    {
        id: 'grounding',
        name: '5-4-3-2-1 Grounding',
        description: 'Use your five senses to ground yourself in the present moment.',
        icon: '🖐️',
        color: '#a78bfa',
        duration: '3 min',
    },
    {
        id: 'bodyscan',
        name: 'Body Scan',
        description: 'Progressively release tension from head to toe.',
        icon: '✨',
        color: '#fbbf24',
        duration: '5 min',
    },
    {
        id: 'sleep',
        name: 'Sleep Reset',
        description: 'A gentle routine to quiet racing thoughts before sleep.',
        icon: '🌙',
        color: '#818cf8',
        duration: '5 min',
    },
];

// ─── Breathing Exercise ──────────────────────────

function BreathingExercise({ onBack }: { onBack: () => void }) {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
    const [count, setCount] = useState(4);
    const [isActive, setIsActive] = useState(true);
    const [cycles, setCycles] = useState(0);

    useState(() => {
        if (!isActive) return;

        const durations: Record<string, number> = { inhale: 4, hold: 4, exhale: 4, rest: 4 };
        const nextPhaseMap: Record<string, typeof phase> = { inhale: 'hold', hold: 'exhale', exhale: 'rest', rest: 'inhale' };

        const interval = setInterval(() => {
            setCount(c => {
                if (c <= 1) {
                    const next = nextPhaseMap[phase];
                    setPhase(next);
                    if (next === 'inhale') setCycles(cy => cy + 1);
                    return durations[next];
                }
                return c - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    });

    const phaseColors: Record<string, string> = {
        inhale: '#2dd4bf', hold: '#a78bfa', exhale: '#fbbf24', rest: '#818cf8',
    };

    const phaseLabels: Record<string, string> = {
        inhale: 'Breathe In', hold: 'Hold', exhale: 'Breathe Out', rest: 'Rest',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontWeight: 400, marginBottom: '4px' }}>Box Breathing</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cycle {cycles + 1} • Follow the rhythm</p>
            </div>

            {/* Breathing circle */}
            <div style={{
                width: '200px', height: '200px', borderRadius: '50%',
                border: `3px solid ${phaseColors[phase]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                background: `radial-gradient(circle, ${phaseColors[phase]}15, transparent 70%)`,
                transition: 'all 1s ease-in-out',
                transform: phase === 'inhale' ? 'scale(1.15)' : phase === 'exhale' ? 'scale(0.9)' : 'scale(1)',
            }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: phaseColors[phase] }}>{count}</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{phaseLabels[phase]}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={() => setIsActive(!isActive)}>
                    {isActive ? 'Pause' : 'Resume'}
                </button>
                <button className="btn btn-ghost" onClick={onBack}>Done</button>
            </div>
        </div>
    );
}

// ─── Grounding Exercise ──────────────────────────

function GroundingExercise({ onBack }: { onBack: () => void }) {
    const [step, setStep] = useState(0);

    const steps = [
        { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see around you', icon: '👁️', color: '#a78bfa' },
        { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can feel', icon: '🖐️', color: '#2dd4bf' },
        { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear right now', icon: '👂', color: '#fbbf24' },
        { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', icon: '👃', color: '#fb7185' },
        { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', icon: '👅', color: '#818cf8' },
    ];

    const current = steps[step];
    const isDone = step >= steps.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '32px' }}>
            {isDone ? (
                <>
                    <span style={{ fontSize: '3rem' }}>✨</span>
                    <h2 style={{ fontWeight: 400 }}>Well done</h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
                        You&apos;ve grounded yourself in the present moment. How do you feel?
                    </p>
                    <button className="btn btn-primary" onClick={onBack}>Finish</button>
                </>
            ) : (
                <>
                    <span style={{ fontSize: '3rem' }}>{current.icon}</span>
                    <div style={{ fontSize: '4rem', fontWeight: 700, color: current.color }}>{current.count}</div>
                    <h2 style={{ fontWeight: 500 }}>{current.sense}</h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>{current.prompt}</p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: i <= step ? current.color : 'var(--bg-elevated)',
                                    transition: 'background 0.3s',
                                }}
                            />
                        ))}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => setStep(s => s + 1)}
                        style={{ marginTop: '8px', padding: '12px 32px' }}
                    >
                        {step < steps.length - 1 ? 'Next' : 'Complete'}
                    </button>
                </>
            )}
        </div>
    );
}

// ─── Main Tools Page ──────────────────────────────

export default function ToolsPage() {
    const [activeTool, setActiveTool] = useState<string | null>(null);

    if (activeTool === 'breathing') {
        return <BreathingExercise onBack={() => setActiveTool(null)} />;
    }

    if (activeTool === 'grounding') {
        return <GroundingExercise onBack={() => setActiveTool(null)} />;
    }

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontWeight: 500, marginBottom: '8px' }}>Wellness Tools</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Quick exercises to help you find calm, focus, and balance.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        className="card"
                        onClick={() => setActiveTool(tool.id)}
                        style={{
                            textAlign: 'left', cursor: 'pointer',
                            borderColor: `${tool.color}30`,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '2rem' }}>{tool.icon}</span>
                            <span style={{ fontSize: '0.75rem', color: tool.color, fontWeight: 500 }}>{tool.duration}</span>
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{tool.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tool.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
