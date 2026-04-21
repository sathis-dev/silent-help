'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Heart,
  Loader2,
  Sparkles,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import {
  resolveEmotion,
  emotionCssVars,
  DEFAULT_EMOTION,
  type EmotionKey,
} from '@/lib/emotion-theme';
import { cn } from '@/lib/cn';

/* --- Types --- */
interface AssessmentQuestion {
  id: string;
  stepNumber: number;
  routeGroup: string;
  questionText: string;
  answerAText: string; meaningA: string; nextRouteA: string; scoreDimA: string; scoreValA: number; safetyFlagA: string; emotionSignalsA?: Record<string, number>;
  answerBText: string; meaningB: string; nextRouteB: string; scoreDimB: string; scoreValB: number; safetyFlagB: string; emotionSignalsB?: Record<string, number>;
  answerCText: string; meaningC: string; nextRouteC: string; scoreDimC: string; scoreValC: number; safetyFlagC: string; emotionSignalsC?: Record<string, number>;
  answerDText?: string; meaningD?: string; nextRouteD?: string; scoreDimD?: string; scoreValD?: number; safetyFlagD?: string; emotionSignalsD?: Record<string, number>;
  answerEText?: string; meaningE?: string; nextRouteE?: string; scoreDimE?: string; scoreValE?: number; safetyFlagE?: string; emotionSignalsE?: Record<string, number>;
}

type QuestionTree = Record<number, Record<string, AssessmentQuestion>>;

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E';

interface AnswerDetail {
  questionId: string;
  stepNumber: number;
  selectedOption: string;
  answerText: string;
  meaning: string;
  scoreDimension: string;
  scoreValue: number;
  safetyFlag: string;
  emotionSignals?: Record<string, number>;
}

interface SafetyState {
  next: string;
  option: string;
  flagLevel: string;
  answerDetail: AnswerDetail;
}

/* --- Animation variants --- */
const questionVariants = {
  enter: { x: 48, opacity: 0, filter: 'blur(8px)' },
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { x: -48, opacity: 0, filter: 'blur(8px)' },
};

const cardStagger = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.12 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const TOTAL_STEPS = 3;

const STEP_SUBTITLES: Record<number, string> = {
  1: 'Identify Your Stress',
  2: 'Understanding Intensity',
  3: 'Impact & Response',
};

const STEP_HINTS: Record<number, string> = {
  1: 'Pick the one that feels closest — there is no wrong answer.',
  2: 'Notice how it shows up in your body and mind.',
  3: 'Tell us how it is shaping your day-to-day.',
};

const EMOTION_ROUTES: ReadonlySet<string> = new Set<string>([
  'overwhelmed',
  'anxious',
  'frustrated',
  'sad',
  'pressure',
]);

function resolveRouteEmotion(route: string): EmotionKey {
  const lower = route?.toLowerCase();
  if (EMOTION_ROUTES.has(lower)) return lower as EmotionKey;
  return DEFAULT_EMOTION;
}

/* --- Component --- */
export default function OnboardingFlow() {
  const router = useRouter();
  const [tree, setTree] = useState<QuestionTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [stepNumber, setStepNumber] = useState(1);
  const [routeGroup, setRouteGroup] = useState('shared');
  const [routeHistory, setRouteHistory] = useState<string[]>(['shared']);
  const [answerDetails, setAnswerDetails] = useState<AnswerDetail[]>([]);

  const [safetyOverlay, setSafetyOverlay] = useState<SafetyState | null>(null);

  useEffect(() => {
    fetch('/api/assessment/questions')
      .then((res) => res.json())
      .then((data) => { if (data.tree) setTree(data.tree); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleBack = useCallback(() => {
    if (stepNumber <= 1) return;
    setStepNumber((prev) => prev - 1);
    setAnswerDetails((prev) => prev.slice(0, -1));
    const newHistory = routeHistory.slice(0, -1);
    setRouteHistory(newHistory);
    setRouteGroup(newHistory[newHistory.length - 1]);
  }, [stepNumber, routeHistory]);

  const currentQ = tree?.[stepNumber]?.[routeGroup] ?? null;

  const buildAnswerDetail = (q: AssessmentQuestion, option: OptionLabel): AnswerDetail => {
    return {
      questionId: q.id,
      stepNumber: q.stepNumber,
      selectedOption: option,
      answerText: (q[`answer${option}Text` as keyof AssessmentQuestion] as string) || '',
      meaning: (q[`meaning${option}` as keyof AssessmentQuestion] as string) || '',
      scoreDimension: (q[`scoreDim${option}` as keyof AssessmentQuestion] as string) || 'type',
      scoreValue: (q[`scoreVal${option}` as keyof AssessmentQuestion] as number) || 0,
      safetyFlag: (q[`safetyFlag${option}` as keyof AssessmentQuestion] as string) || 'none',
      emotionSignals: (q[`emotionSignals${option}` as keyof AssessmentQuestion] as Record<string, number> | undefined) || undefined,
    };
  };

  const handleSelect = useCallback(
    (option: OptionLabel, nextRoute: string, safetyFlag: string) => {
      if (!currentQ) return;
      const detail = buildAnswerDetail(currentQ, option);

      // Check for risk flags that warrant a safety overlay
      const dangerousFlags = ['panic_like_state', 'loss_of_control', 'hopelessness_marker', 'severe_withdrawal', 'burnout_marker'];
      if (safetyFlag !== 'none' && dangerousFlags.includes(safetyFlag)) {
        setSafetyOverlay({ next: nextRoute, option: detail.answerText, flagLevel: 'medium', answerDetail: detail });
        return;
      }
      proceedNext(detail, nextRoute);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQ, answerDetails]
  );

  const proceedNext = async (detail: AnswerDetail, nextRoute: string) => {
    setSafetyOverlay(null);
    if (!currentQ) return;

    const updatedDetails = [...answerDetails, detail];
    setAnswerDetails(updatedDetails);

    // Terminal node? (finish route or last step)
    const rUpper = nextRoute.toUpperCase();
    if (rUpper.startsWith('FINISH') || rUpper.startsWith('URGENT') || rUpper.includes('SAFETY') || stepNumber >= TOTAL_STEPS) {
      setSubmitting(true);
      try {
        const payload = { answerDetails: updatedDetails };
        if (typeof window !== 'undefined') {
            localStorage.setItem('sh_pending_assessment', JSON.stringify(payload));
        }
        setTimeout(() => router.push('/auth'), 2400);
      } catch { setSubmitting(false); }
      return;
    }

    setStepNumber((prev) => prev + 1);
    setRouteGroup(nextRoute);
    setRouteHistory((prev) => [...prev, nextRoute]);
  };

  const getEmojiForOption = (text: string, route: string, step: number) => {
    const t = text.toLowerCase();
    if (step === 1) {
      if (route === 'overwhelmed') return '😵‍💫';
      if (route === 'anxious') return '😰';
      if (route === 'frustrated') return '😤';
      if (route === 'sad') return '😔';
      if (route === 'pressure') return '🏋️';
    }
    if (t.includes('panic') || t.includes('explode') || t.includes('burn out')) return '🚨';
    if (t.includes('heartbeat') || t.includes('sweating') || t.includes('argue')) return '❤️‍🔥';
    if (t.includes('constant') || t.includes('pile') || t.includes('ongoing')) return '⏳';
    if (t.includes('low') || t.includes('withdrawn') || t.includes('delay') || t.includes('ignore')) return '🐢';
    if (t.includes('slight') || t.includes('small') || t.includes('okay')) return '🌱';
    if (t.includes('strong') || t.includes('very') || t.includes('high')) return '⚡';
    if (t.includes('procrastinating') || t.includes('avoiding')) return '🫣';
    if (t.includes('too much') || t.includes('struggling') || t.includes('overthinking')) return '🌪️';
    return '✨';
  };

  /* --- Active emotion theme (based on chosen route) --- */
  const activeEmotion = useMemo(() => {
    // After step 1, routeGroup becomes one of the emotion keys.
    // On step 1 (shared), fall back to default emotion for the aurora.
    return resolveEmotion(EMOTION_ROUTES.has(routeGroup) ? routeGroup : DEFAULT_EMOTION);
  }, [routeGroup]);

  const auroraColors = useMemo<[string, string, string]>(() => {
    return [activeEmotion.soft, activeEmotion.glow, activeEmotion.tint];
  }, [activeEmotion]);

  /* --- Loading --- */
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Aurora colors={[...auroraColors]} intensity="soft" />
        <NoiseOverlay />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
          className="relative"
        >
          <Loader2 className="h-12 w-12" style={{ color: activeEmotion.accent }} />
        </motion.div>
      </div>
    );
  }

  /* --- Submitting --- */
  if (submitting) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
        style={emotionCssVars(activeEmotion)}
      >
        <Aurora colors={[...auroraColors]} intensity="strong" />
        <NoiseOverlay />

        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: `radial-gradient(circle, ${activeEmotion.soft} 0%, transparent 70%)`,
          }}
        >
          <Heart className="h-14 w-14" style={{ color: activeEmotion.accent }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative text-center"
        >
          <h2 className="font-display text-3xl italic sm:text-4xl text-[color:var(--color-fg)]">
            Gently weaving your wellness profile
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
            <Sparkles className="h-4 w-4" style={{ color: activeEmotion.accent }} />
            <span>Listening to your answers with care…</span>
          </div>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-[80%] rounded-full border"
          style={{ borderColor: activeEmotion.ring }}
        />
      </div>
    );
  }

  /* --- Build options dynamically (3, 4, or 5 options) --- */
  const allLabels: OptionLabel[] = ['A', 'B', 'C', 'D', 'E'];
  const options: { text: string; route: string; flag: string; label: OptionLabel }[] = [];
  if (currentQ) {
    for (const label of allLabels) {
      const text = currentQ[`answer${label}Text` as keyof AssessmentQuestion] as string | undefined;
      const route = currentQ[`nextRoute${label}` as keyof AssessmentQuestion] as string | undefined;
      const flag = (currentQ[`safetyFlag${label}` as keyof AssessmentQuestion] as string | undefined) || 'none';
      if (text && route) {
        options.push({ text, route, flag, label });
      }
    }
  }

  /* --- Safety modal config --- */
  const getSafetyConfig = (level: string) => {
    switch (level) {
      case 'soft':
        return {
          title: 'Just checking in',
          message:
            'It sounds like things feel tough right now. We want to make sure you have the support you need. Would you like to continue, or would it help to see some support options?',
          accentColor: '#fbbf24',
          borderColor: 'rgba(251,191,36,0.28)',
          tint: 'rgba(251,191,36,0.10)',
          showCrisis: false,
        };
      case 'medium':
        return {
          title: 'We want to support you',
          message:
            'We noticed you may need extra support right now. Please know that help is always available. Would you like to see support options, or continue with the assessment?',
          accentColor: '#fb923c',
          borderColor: 'rgba(251,146,60,0.28)',
          tint: 'rgba(251,146,60,0.10)',
          showCrisis: true,
        };
      case 'hard':
      default:
        return {
          title: 'You are not alone',
          message:
            'We are concerned about how you are feeling right now. Your safety matters most. Please reach out to one of the services below, or let us know how we can help.',
          accentColor: '#f43f5e',
          borderColor: 'rgba(244,63,94,0.32)',
          tint: 'rgba(244,63,94,0.10)',
          showCrisis: true,
        };
    }
  };

  /* --- Main UI --- */
  return (
    <div
      className="relative flex min-h-screen flex-col items-center overflow-hidden"
      style={emotionCssVars(activeEmotion)}
    >
      <Aurora colors={[...auroraColors]} intensity="normal" />
      <NoiseOverlay />

      {/* Top chrome — back + progress */}
      <div className="relative z-10 w-full max-w-2xl px-6 pt-10 sm:pt-14">
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            onClick={handleBack}
            initial={{ opacity: 0 }}
            animate={{ opacity: stepNumber > 1 ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[color:var(--color-fg-muted)] backdrop-blur-md transition-colors',
              stepNumber > 1 && 'hover:border-white/20 hover:text-[color:var(--color-fg)]',
            )}
            style={{ pointerEvents: stepNumber > 1 ? 'auto' : 'none' }}
            aria-hidden={stepNumber <= 1}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back
          </motion.button>

          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] backdrop-blur-md"
            style={{
              borderColor: activeEmotion.ring,
              background: activeEmotion.tint,
              color: activeEmotion.accent,
            }}
          >
            <Sparkles className="h-3 w-3" />
            Step {stepNumber} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress pills */}
        <div className="mt-6 flex gap-2">
          {[1, 2, 3].map((step) => {
            const done = step < stepNumber;
            const active = step === stepNumber;
            return (
              <div
                key={step}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
              >
                {(done || active) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: active ? 0.2 : 0 }}
                    className="h-full rounded-full"
                    style={{
                      background: activeEmotion.gradient,
                      boxShadow: `0 0 16px ${activeEmotion.glow}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            {STEP_SUBTITLES[stepNumber]}
          </p>
        </div>
      </div>

      {/* Question + Options */}
      <div className="relative z-10 flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentQ.id}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-balance text-center text-4xl italic leading-[1.1] text-[color:var(--color-fg)] sm:text-5xl">
                {currentQ.questionText}
              </h1>

              <p className="mx-auto mt-5 max-w-md text-center text-sm text-[color:var(--color-fg-muted)] sm:text-base">
                {STEP_HINTS[stepNumber] ?? 'Choose what resonates with you right now.'}
              </p>

              <div className="mt-10 flex flex-col gap-3">
                {options.map((opt, i) => {
                  const emoji = getEmojiForOption(opt.text, opt.route, stepNumber);
                  const optionEmotion = stepNumber === 1
                    ? resolveEmotion(resolveRouteEmotion(opt.route))
                    : activeEmotion;

                  return (
                    <motion.button
                      key={`${currentQ.id}-${i}`}
                      type="button"
                      custom={i}
                      variants={cardStagger}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleSelect(opt.label, opt.route, opt.flag)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-left backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2"
                      style={{
                        ['--option-accent' as string]: optionEmotion.accent,
                        ['--option-glow' as string]: optionEmotion.glow,
                        ['--option-soft' as string]: optionEmotion.soft,
                        ['--option-tint' as string]: optionEmotion.tint,
                        ['--option-ring' as string]: optionEmotion.ring,
                      }}
                    >
                      {/* Hover glow */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(520px circle at 10% 50%, var(--option-soft), transparent 55%)`,
                        }}
                      />
                      {/* Left accent bar */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: `linear-gradient(180deg, var(--option-accent), transparent)` }}
                      />

                      <span
                        className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border text-xl"
                        style={{
                          background: `var(--option-tint)`,
                          borderColor: `var(--option-ring)`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
                        }}
                      >
                        <span className="drop-shadow-sm">{emoji}</span>
                      </span>

                      <span className="relative flex-1 text-[0.98rem] font-medium leading-snug text-[color:var(--color-fg)] sm:text-[1.04rem]">
                        {opt.text}
                      </span>

                      <span
                        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        style={{
                          borderColor: `var(--option-ring)`,
                          color: `var(--option-accent)`,
                          background: `var(--option-tint)`,
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer reassurance */}
      <div className="relative z-10 pb-8 text-center text-xs text-[color:var(--color-fg-subtle)]">
        Private by design · You can pause any time
      </div>

      {/* Safety Modal */}
      <AnimatePresence>
        {safetyOverlay && (() => {
          const cfg = getSafetyConfig(safetyOverlay.flagLevel);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.94, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, y: 20, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border bg-white/[0.04] p-8 backdrop-blur-2xl"
                style={{
                  borderColor: cfg.borderColor,
                  boxShadow: `0 32px 72px rgba(2,6,23,0.55), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${cfg.accentColor}, transparent)`,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(520px circle at 80% -10%, ${cfg.tint}, transparent 60%)`,
                  }}
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{ background: cfg.tint, borderColor: cfg.borderColor }}
                  >
                    <ShieldAlert className="h-5 w-5" style={{ color: cfg.accentColor }} />
                  </div>
                  <h3
                    className="font-display text-2xl italic"
                    style={{ color: cfg.accentColor }}
                  >
                    {cfg.title}
                  </h3>
                </div>

                <p className="relative mt-4 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  {cfg.message}
                </p>

                {cfg.showCrisis && (
                  <div
                    className="relative mt-5 rounded-[var(--radius-md)] border p-4"
                    style={{
                      borderColor: 'rgba(244,63,94,0.22)',
                      background: 'rgba(244,63,94,0.05)',
                    }}
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
                      Immediate Support
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        { icon: Phone, name: 'Samaritans', detail: '116 123 · free, 24/7' },
                        { icon: MessageCircle, name: 'SHOUT', detail: 'Text SHOUT to 85258' },
                        { icon: Phone, name: 'NHS 111', detail: '111 · mental health option' },
                      ].map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 text-sm text-[color:var(--color-fg-muted)]"
                        >
                          <r.icon
                            className="h-3.5 w-3.5 flex-shrink-0"
                            style={{ color: cfg.accentColor }}
                          />
                          <span className="font-semibold text-[color:var(--color-fg)]">{r.name}</span>
                          <span className="opacity-80">— {r.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative mt-6 flex flex-col gap-2">
                  {cfg.showCrisis && (
                    <button
                      type="button"
                      onClick={() => router.push('/crisis-support')}
                      className="w-full rounded-[var(--radius-md)] border px-5 py-3 text-sm font-semibold transition-all hover:brightness-110"
                      style={{
                        background: cfg.tint,
                        borderColor: cfg.borderColor,
                        color: cfg.accentColor,
                      }}
                    >
                      Get Immediate Support
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => proceedNext(safetyOverlay.answerDetail, safetyOverlay.next)}
                    className="w-full rounded-[var(--radius-md)] border border-transparent px-5 py-3 text-sm font-medium text-[color:var(--color-fg-subtle)] transition-colors hover:bg-white/[0.04] hover:text-[color:var(--color-fg-muted)]"
                  >
                    Continue Assessment
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
