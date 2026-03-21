'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { getStep, TOTAL_STEPS, STEP_COLORS } from '@/lib/dynamicSteps';

/* ═══════════════════════════════════════════════
   Onboarding Component — Dynamic Branching Engine
   Enhanced with AI micro-interactions and premium UX
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
    const [showAIAnalyzing, setShowAIAnalyzing] = useState(false);
    const [showFinalLoading, setShowFinalLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dynamic step — resolved from the branching engine based on current answers
    const step = useMemo(() => getStep(currentStep, answers), [currentStep, answers]);
    const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
    const accent = STEP_COLORS[currentStep];

    // Show AI analyzing between certain steps (after steps 2, 4)
    const shouldShowAIAnalyzing = useCallback((stepIndex: number) => {
        return stepIndex === 2 || stepIndex === 4;
    }, []);

    const selectOption = useCallback((value: string) => {
        if (isAnimating || isSubmitting || showAIAnalyzing) return;
        
        // Set selected for visual feedback
        setSelectedOption(value);
        
        // Delay to show selection animation
        setTimeout(() => {
            setIsAnimating(true);

            // Save answer using the dynamic step's id
            setAnswers(prev => ({ ...prev, [step.id]: value }));

            // Check if we should show AI analyzing
            if (shouldShowAIAnalyzing(currentStep) && currentStep < TOTAL_STEPS - 1) {
                setShowAIAnalyzing(true);
                setTimeout(() => {
                    setShowAIAnalyzing(false);
                    setDirection('forward');
                    setCurrentStep(prev => prev + 1);
                    setIsAnimating(false);
                    setSelectedOption(null);
                }, 2000);
            } else if (currentStep < TOTAL_STEPS - 1) {
                // Normal transition
                setTimeout(() => {
                    setDirection('forward');
                    setCurrentStep(prev => prev + 1);
                    setIsAnimating(false);
                    setSelectedOption(null);
                }, 400);
            } else {
                // Final step — show generating profile
                const finalAnswers = { ...answers, [step.id]: value };
                setShowFinalLoading(true);
                
                setTimeout(async () => {
                    if (isAuthenticated) {
                        setIsSubmitting(true);
                        try {
                            await submitAnswers(finalAnswers as unknown as import('@/lib/api').OnboardingAnswers);
                            router.push('/dashboard');
                        } catch {
                            localStorage.setItem('sh_onboarding', JSON.stringify(finalAnswers));
                            router.push('/dashboard');
                        }
                    } else {
                        localStorage.setItem('sh_onboarding', JSON.stringify(finalAnswers));
                        router.push('/auth?mode=register');
                    }
                }, 3500);
            }
        }, 300);
    }, [currentStep, step.id, answers, isAnimating, isSubmitting, showAIAnalyzing, isAuthenticated, submitAnswers, router, shouldShowAIAnalyzing]);

    const goBack = useCallback(() => {
        if (currentStep === 0 || isAnimating || showAIAnalyzing) return;
        setIsAnimating(true);
        setDirection('backward');
        setSelectedOption(null);
        setTimeout(() => {
            setCurrentStep(prev => prev - 1);
            setIsAnimating(false);
        }, 300);
    }, [currentStep, isAnimating, showAIAnalyzing]);

    // Final loading screen
    if (showFinalLoading) {
        return (
            <div className="onboarding-final-loading">
                {/* Animated background */}
                <div className="final-loading-bg">
                    <div className="final-orb final-orb-1" />
                    <div className="final-orb final-orb-2" />
                    <div className="final-orb final-orb-3" />
                </div>

                {/* Content */}
                <div className="final-loading-content">
                    {/* Pulsing AI orb */}
                    <div className="ai-orb-container">
                        <div className="ai-orb-glow" />
                        <div className="ai-orb-ring ai-orb-ring-1" />
                        <div className="ai-orb-ring ai-orb-ring-2" />
                        <div className="ai-orb-ring ai-orb-ring-3" />
                        <div className="ai-orb">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1.5a.5.5 0 0 1 0 1H21a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7H1.5a.5.5 0 0 1 0-1H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                                <circle cx="9" cy="13" r="1.25" fill="currentColor" />
                                <circle cx="15" cy="13" r="1.25" fill="currentColor" />
                                <path d="M9 17c.83.67 2 1 3 1s2.17-.33 3-1" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="final-loading-title">Generating Your Wellness Profile</h2>
                    
                    {/* Animated progress text */}
                    <div className="final-loading-steps">
                        <div className="final-step-item final-step-active">
                            <span className="final-step-dot" />
                            <span>Analyzing your responses...</span>
                        </div>
                        <div className="final-step-item final-step-pending">
                            <span className="final-step-dot" />
                            <span>Identifying patterns...</span>
                        </div>
                        <div className="final-step-item final-step-pending">
                            <span className="final-step-dot" />
                            <span>Crafting personalized recommendations...</span>
                        </div>
                    </div>

                    <p className="final-loading-subtitle">
                        Your unique wellness journey awaits
                    </p>
                </div>
            </div>
        );
    }

    // AI Analyzing overlay
    if (showAIAnalyzing) {
        return (
            <div className="onboarding-page">
                <div className="onboarding-bg">
                    <div className="onboarding-glow" style={{ background: `radial-gradient(circle, ${accent}20, transparent 70%)` }} />
                </div>

                <div className="ai-analyzing-overlay">
                    <div className="ai-analyzing-content">
                        <div className="ai-analyzing-orb">
                            <div className="ai-mini-orb" />
                            <div className="ai-pulse-ring" />
                        </div>
                        <div className="ai-analyzing-text">
                            <span className="ai-typing-indicator">
                                <span />
                                <span />
                                <span />
                            </span>
                            <span>AI is analyzing your wellness state...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-page">
            {/* Ambient background */}
            <div className="onboarding-bg">
                <div className="onboarding-glow" style={{ background: `radial-gradient(circle, ${accent}15, transparent 70%)` }} />
                <div className="onboarding-particles">
                    {mounted && Array.from({ length: 6 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="onboarding-particle"
                            style={{
                                left: `${15 + i * 15}%`,
                                animationDelay: `${i * 0.4}s`,
                                animationDuration: `${4 + i * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Sticky Header with Progress */}
            <header className="onboarding-header-sticky">
                <div className="onboarding-header-inner">
                    <button
                        className="onboarding-back-btn"
                        onClick={currentStep === 0 ? () => router.push('/') : goBack}
                        aria-label="Go back"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Progress bar */}
                    <div className="onboarding-progress-container">
                        <div className="onboarding-progress-bar">
                            <div 
                                className="onboarding-progress-fill-new"
                                style={{ 
                                    width: `${progress}%`, 
                                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)` 
                                }}
                            />
                        </div>
                        <div className="onboarding-progress-steps">
                            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                                <div 
                                    key={i}
                                    className={`onboarding-progress-dot ${i <= currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                                    style={{
                                        borderColor: i <= currentStep ? accent : undefined,
                                        background: i < currentStep ? accent : i === currentStep ? `${accent}30` : undefined,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <span className="onboarding-step-label" style={{ color: accent }}>
                        {currentStep + 1} of {TOTAL_STEPS}
                    </span>
                </div>
            </header>

            {/* Step content */}
            <main 
                className={`onboarding-main ${isAnimating ? `animating-${direction}` : 'visible'}`}
                key={`${currentStep}-${step.id}`}
            >
                <div className="onboarding-question-container">
                    <div className="onboarding-step-badge" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
                        Step {currentStep + 1}
                    </div>

                    <h1 className="onboarding-question-title">{step.title}</h1>
                    <p className="onboarding-question-subtitle">{step.subtitle}</p>

                    {/* Option Cards */}
                    <div className="onboarding-cards">
                        {step.options.map((opt, i) => (
                            <button
                                key={opt.value}
                                className={`onboarding-card ${selectedOption === opt.value ? 'selected' : ''} ${answers[step.id] === opt.value ? 'previously-selected' : ''}`}
                                onClick={() => selectOption(opt.value)}
                                disabled={isSubmitting || isAnimating}
                                style={{
                                    animationDelay: `${i * 80}ms`,
                                    '--accent-color': accent,
                                } as React.CSSProperties}
                            >
                                <div className="onboarding-card-glow" style={{ background: `radial-gradient(circle, ${accent}20, transparent 70%)` }} />
                                <div className="onboarding-card-content">
                                    <span className="onboarding-card-emoji">{opt.emoji}</span>
                                    <span className="onboarding-card-label">{opt.label}</span>
                                </div>
                                <div 
                                    className="onboarding-card-ring"
                                    style={{ borderColor: selectedOption === opt.value ? accent : 'transparent' }}
                                />
                                <div 
                                    className="onboarding-card-check"
                                    style={{ background: accent }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom dots indicator */}
            <footer className="onboarding-footer">
                <div className="onboarding-dots-row">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div
                            key={i}
                            className={`onboarding-dot-new ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                            style={{
                                background: i === currentStep ? accent : i < currentStep ? `${accent}80` : undefined,
                            }}
                        />
                    ))}
                </div>
            </footer>
        </div>
    );
}
