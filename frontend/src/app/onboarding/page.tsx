'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { getStep, TOTAL_STEPS, STEP_COLORS } from '@/lib/dynamicSteps';

/* ═══════════════════════════════════════════════
   Onboarding Component — Dynamic Branching Engine
   
   Step 1 is fixed (energy).
   Steps 2-6 dynamically change based on ALL
   previous answers — every user walks a unique path.
   ═══════════════════════════════════════════════ */

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { submitAnswers } = useWellness();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic step — resolved from the branching engine based on current answers
    const step = useMemo(() => getStep(currentStep, answers), [currentStep, answers]);
    const progress = ((currentStep) / TOTAL_STEPS) * 100;
    const accent = STEP_COLORS[currentStep];

    const selectOption = useCallback((value: string) => {
        if (isAnimating || isSubmitting) return;
        setIsAnimating(true);

        // Save answer using the dynamic step's id
        setAnswers(prev => ({ ...prev, [step.id]: value }));

        // Animate out → next step
        setTimeout(async () => {
            if (currentStep < TOTAL_STEPS - 1) {
                setDirection('forward');
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            } else {
                const finalAnswers = { ...answers, [step.id]: value };

                if (isAuthenticated) {
                    // Already logged in (re-assessment) — submit directly to API
                    setIsSubmitting(true);
                    try {
                        await submitAnswers(finalAnswers as unknown as import('@/lib/api').OnboardingAnswers);
                        router.push('/dashboard');
                    } catch {
                        // Fallback: store locally and go to dashboard
                        localStorage.setItem('sh_onboarding', JSON.stringify(finalAnswers));
                        router.push('/dashboard');
                    }
                } else {
                    // New user — store locally and go to registration
                    localStorage.setItem('sh_onboarding', JSON.stringify(finalAnswers));
                    router.push('/auth/register');
                }
                setIsAnimating(false);
            }
        }, 350);
    }, [currentStep, step.id, answers, isAnimating, isSubmitting, isAuthenticated, submitAnswers, router]);

    const goBack = useCallback(() => {
        if (currentStep === 0 || isAnimating) return;
        setIsAnimating(true);
        setDirection('backward');
        setTimeout(() => {
            setCurrentStep(prev => prev - 1);
            setIsAnimating(false);
        }, 250);
    }, [currentStep, isAnimating]);

    return (
        <div className="onboarding-page">
            {/* Ambient background */}
            <div className="onboarding-bg">
                <div
                    className="onboarding-glow"
                    style={{ background: `radial-gradient(circle, ${accent}15, transparent 70%)` }}
                />
            </div>

            {/* Header */}
            <div className="onboarding-header">
                <button
                    className="onboarding-back"
                    onClick={currentStep === 0 ? () => router.push('/') : goBack}
                    aria-label="Go back"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Progress bar */}
                <div className="onboarding-progress">
                    <div
                        className="onboarding-progress-fill"
                        style={{ width: `${progress}%`, background: accent }}
                    />
                </div>

                <span className="onboarding-step-count" style={{ color: accent }}>
                    {currentStep + 1}/{TOTAL_STEPS}
                </span>
            </div>

            {/* Step content — key includes answers hash so it re-animates on dynamic change */}
            <div
                className={`onboarding-content ${isAnimating ? `animating-${direction}` : 'visible'}`}
                key={`${currentStep}-${step.id}`}
            >
                <div className="onboarding-step-indicator" style={{ color: accent }}>
                    Step {currentStep + 1}
                </div>

                <h1 className="onboarding-title">{step.title}</h1>
                <p className="onboarding-subtitle">{step.subtitle}</p>

                {/* Options — dynamically generated based on path */}
                <div className="onboarding-options">
                    {step.options.map((opt, i) => (
                        <button
                            key={opt.value}
                            className={`onboarding-option ${answers[step.id] === opt.value ? 'selected' : ''}`}
                            onClick={() => selectOption(opt.value)}
                            disabled={isSubmitting}
                            style={{
                                animationDelay: `${i * 60}ms`,
                                borderColor: answers[step.id] === opt.value ? accent : undefined,
                                background: answers[step.id] === opt.value ? `${accent}12` : undefined,
                            }}
                        >
                            <span className="onboarding-option-emoji">{opt.emoji}</span>
                            <span className="onboarding-option-label">{opt.label}</span>
                            <div className="onboarding-option-check" style={{
                                opacity: answers[step.id] === opt.value ? 1 : 0,
                                background: accent,
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Submitting state overlay */}
                {isSubmitting && (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <div className="loading-dots"><span /><span /><span /></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                            Analyzing your unique path...
                        </p>
                    </div>
                )}
            </div>

            {/* Step dots */}
            <div className="onboarding-dots">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                        key={i}
                        className={`onboarding-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                        style={{
                            background: i === currentStep ? accent : i < currentStep ? `${accent}80` : undefined,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
