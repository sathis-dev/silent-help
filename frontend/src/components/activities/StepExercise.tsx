'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Generic step-through exercise component used by DBT/ACT/self-compassion tools.
 * Each step is either:
 *  - timed (auto-advances after `seconds`)
 *  - manual (user taps "Next" — use when step requires reflection or typing)
 * Supports an optional free-text field per step for exercises like Letter-to-future-you.
 */

export interface StepDef {
    title: string;
    body: string;
    icon?: string;
    seconds?: number;          // if set, step auto-advances
    requiresInput?: boolean;   // show a textarea; next disabled until non-empty
    inputPlaceholder?: string;
}

interface Props {
    variant: string;
    accent: string;
    title: string;
    subtitle?: string;
    steps: StepDef[];
    completionTitle?: string;
    completionBody?: string;
    onComplete: (responses: string[]) => void;
    onCancel: () => void;
}

export default function StepExercise({
    accent,
    title,
    subtitle,
    steps,
    completionTitle = 'Well done.',
    completionBody = 'You gave yourself a small window of care.',
    onComplete,
}: Props) {
    const [idx, setIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(steps[0]?.seconds ?? 0);
    const [responses, setResponses] = useState<string[]>(() => steps.map(() => ''));
    const [done, setDone] = useState(false);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const step = steps[idx];

    useEffect(() => {
        if (!step || done) return;
        setTimeLeft(step.seconds ?? 0);
        if (tickRef.current) clearInterval(tickRef.current);
        if (!step.seconds) return;
        tickRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    if (tickRef.current) clearInterval(tickRef.current);
                    goNext();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => {
            if (tickRef.current) clearInterval(tickRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    const goNext = () => {
        if (idx + 1 >= steps.length) {
            setDone(true);
            return;
        }
        setIdx((i) => i + 1);
    };

    if (done) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        margin: '0 auto 24px',
                        background: `radial-gradient(circle, ${accent}30, transparent 70%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', marginBottom: 8 }}>{completionTitle}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
                    {completionBody}
                </p>
                <button
                    onClick={() => onComplete(responses)}
                    style={{
                        padding: '12px 28px',
                        borderRadius: 12,
                        background: accent,
                        border: 'none',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Continue
                </button>
            </div>
        );
    }

    const canNext = !step.requiresInput || (responses[idx] || '').trim().length > 0;

    return (
        <div style={{ padding: '32px 24px', animation: 'activity-fade-in 0.4s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ color: accent, fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {title}
                </div>
                {subtitle && <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>{subtitle}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                {steps.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: i < idx ? accent : i === idx ? `${accent}80` : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s',
                        }}
                    />
                ))}
            </div>

            <div
                style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    margin: '0 auto 24px',
                    background: `${accent}15`,
                    border: `2px solid ${accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                }}
            >
                {step.icon ?? '✨'}
            </div>

            <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
                {step.title}
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.55, textAlign: 'center', maxWidth: 460, margin: '0 auto 20px' }}>
                {step.body}
            </p>

            {step.requiresInput && (
                <textarea
                    value={responses[idx]}
                    onChange={(e) => {
                        const next = [...responses];
                        next[idx] = e.target.value;
                        setResponses(next);
                    }}
                    placeholder={step.inputPlaceholder ?? 'Take your time…'}
                    style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: 520,
                        margin: '0 auto 20px',
                        minHeight: 90,
                        padding: 14,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                    }}
                />
            )}

            {step.seconds ? (
                <div style={{ textAlign: 'center', color: accent, fontSize: '0.85rem', letterSpacing: '0.15em', marginBottom: 16 }}>
                    {timeLeft}s
                </div>
            ) : null}

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={goNext}
                    disabled={!canNext}
                    style={{
                        padding: '10px 26px',
                        borderRadius: 12,
                        background: canNext ? accent : 'rgba(255,255,255,0.08)',
                        border: 'none',
                        color: canNext ? '#0f172a' : '#64748b',
                        fontWeight: 600,
                        cursor: canNext ? 'pointer' : 'not-allowed',
                    }}
                >
                    {idx + 1 >= steps.length ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
}

/* ─── Preset step definitions for the new tools ─── */

export const TIPP_STEPS: StepDef[] = [
    { icon: '❄️', title: 'Temperature', body: 'Splash cold water on your face, or hold an ice cube against your wrist or forehead for 30 seconds. Cold triggers the dive reflex and slows heart rate fast.', seconds: 30 },
    { icon: '🏃', title: 'Intense movement', body: 'Do 30 seconds of jumping jacks, push-ups against a wall, or fast stair climbs. Burn off excess activation.', seconds: 30 },
    { icon: '💨', title: 'Paced breathing', body: 'Breathe in for 4, out for 6. Longer exhale than inhale. Do this for 30 seconds.', seconds: 30 },
    { icon: '🫳', title: 'Paired muscle relaxation', body: 'Clench fists hard for 5 seconds, then fully release. Shoulders up to ears for 5, then drop. Let the body soften.', seconds: 30 },
];

export const URGE_SURF_STEPS: StepDef[] = [
    { icon: '🌊', title: 'Name the urge', body: 'An urge — to eat, drink, self-harm, text someone, scroll — is a wave. Name it gently. "I notice an urge to …"', requiresInput: true, inputPlaceholder: 'An urge to…' },
    { icon: '📍', title: 'Where does it live in the body?', body: 'Scan from head to toes. Is it tight in the chest? Warm in the throat? A pull in the hands? Notice without fixing.', seconds: 40 },
    { icon: '⏱️', title: 'Ride the wave', body: 'Urges peak in 20–30 minutes and recede. You are not going to fight it or feed it. You are going to sit with it. 3 slow breaths.', seconds: 60 },
    { icon: '🪷', title: 'Notice it soften', body: 'Is the intensity different now? Urges are not commands. You surfed this one.', seconds: 20 },
];

export const SELF_COMPASSION_STEPS: StepDef[] = [
    { icon: '🤲', title: 'This is a moment of suffering', body: 'Put a hand on your chest. Softly say to yourself: "This is a moment of suffering." Pain deserves to be acknowledged, not pushed away.', seconds: 20 },
    { icon: '🌍', title: 'Suffering is part of life', body: 'Other people feel exactly this. You are not alone. Millions of us, right now, are carrying something hard. "I am not alone in this."', seconds: 20 },
    { icon: '💛', title: 'May I be kind to myself', body: 'Offer yourself what you would offer a close friend. "May I give myself the compassion I need. May I be patient. May I be safe."', seconds: 30 },
    { icon: '📝', title: 'One kind sentence', body: 'Write one kind sentence to yourself — the way a good friend would speak to you right now.', requiresInput: true, inputPlaceholder: 'Dear me…' },
];

export const LETTER_FUTURE_STEPS: StepDef[] = [
    { icon: '📮', title: 'A letter to future you', body: 'Write to yourself — 3, 7, or 30 days from now. What do you want that person to remember about today?', requiresInput: true, inputPlaceholder: 'Dear future me, right now I am feeling…' },
    { icon: '🌱', title: 'What are you hoping for?', body: 'What small thing do you hope has gotten a little better by the time you read this?', requiresInput: true, inputPlaceholder: 'I am hoping…' },
    { icon: '🔒', title: 'Seal it', body: 'This letter is saved privately to your account. We will surface it to you when the time comes — no notifications, no pressure, just a gentle visit from past-you.', seconds: 10 },
];

export const COGNITIVE_DIFFUSION_STEPS: StepDef[] = [
    { icon: '💭', title: 'Catch the thought', body: 'Notice the thought that is running in your head right now. Write it down exactly as it sounds.', requiresInput: true, inputPlaceholder: 'My thought is…' },
    { icon: '🪞', title: 'Add a frame', body: 'Say it to yourself in this form: "I am having the thought that __." Then: "I notice I am having the thought that __."', seconds: 20 },
    { icon: '🎵', title: 'Sing it', body: 'Try saying the thought slowly, in a silly voice, or to the tune of Happy Birthday. This loosens its grip. It is a thought — not a fact.', seconds: 30 },
    { icon: '🕊️', title: 'Let it pass', body: 'The thought is still allowed to be there. You just do not need to fight it or obey it. Watch it drift.', seconds: 20 },
];
