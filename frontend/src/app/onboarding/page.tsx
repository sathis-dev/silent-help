'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldAlert, Heart, Loader2, Sparkles, Phone, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ─── Types ─── */
interface AssessmentQuestion {
  id: string;
  stepNumber: number;
  routeGroup: string;
  questionText: string;
  answerAText: string; meaningA: string; nextRouteA: string; scoreDimA: string; scoreValA: number; safetyFlagA: string;
  answerBText: string; meaningB: string; nextRouteB: string; scoreDimB: string; scoreValB: number; safetyFlagB: string;
  answerCText: string; meaningC: string; nextRouteC: string; scoreDimC: string; scoreValC: number; safetyFlagC: string;
}

type QuestionTree = Record<number, Record<string, AssessmentQuestion>>;

interface AnswerDetail {
  questionId: string;
  stepNumber: number;
  selectedOption: string;
  answerText: string;
  meaning: string;
  scoreDimension: string;
  scoreValue: number;
  safetyFlag: string;
}

interface SafetyState {
  next: string;
  option: string;
  flagLevel: string; // soft | medium | hard
  answerDetail: AnswerDetail;
}

/* ─── Animation variants ─── */
const questionVariants = {
  enter: { x: 60, opacity: 0, filter: 'blur(4px)' },
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { x: -60, opacity: 0, filter: 'blur(4px)' },
};

const cardStagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

const STEP_SUBTITLES: Record<number, string> = {
  1: 'Current Intensity',
  2: 'Understanding Your Stress',
  3: 'Duration',
  4: 'Symptom Profile',
  5: 'Coping Ability',
  6: 'Safety Check',
};

/* ─── Component ─── */
export default function OnboardingFlow() {
  const router = useRouter();
  const [tree, setTree] = useState<QuestionTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [stepNumber, setStepNumber] = useState(1);
  const [routeGroup, setRouteGroup] = useState('shared');
  const [answerLog, setAnswerLog] = useState<Record<string, string>>({});
  const [answerDetails, setAnswerDetails] = useState<AnswerDetail[]>([]);

  const [safetyOverlay, setSafetyOverlay] = useState<SafetyState | null>(null);

  useEffect(() => {
    fetch('/api/assessment/questions')
      .then((res) => res.json())
      .then((data) => { if (data.tree) setTree(data.tree); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const currentQ = tree?.[stepNumber]?.[routeGroup] ?? null;

  const buildAnswerDetail = (q: AssessmentQuestion, option: 'A' | 'B' | 'C'): AnswerDetail => {
    const suffix = option;
    return {
      questionId: q.id,
      stepNumber: q.stepNumber,
      selectedOption: option,
      answerText: q[`answer${suffix}Text` as keyof AssessmentQuestion] as string,
      meaning: q[`meaning${suffix}` as keyof AssessmentQuestion] as string,
      scoreDimension: q[`scoreDim${suffix}` as keyof AssessmentQuestion] as string,
      scoreValue: q[`scoreVal${suffix}` as keyof AssessmentQuestion] as number,
      safetyFlag: q[`safetyFlag${suffix}` as keyof AssessmentQuestion] as string,
    };
  };

  const handleSelect = useCallback(
    (option: 'A' | 'B' | 'C', nextRoute: string, safetyFlag: string) => {
      if (!currentQ) return;
      const detail = buildAnswerDetail(currentQ, option);

      if (safetyFlag !== 'none') {
        setSafetyOverlay({ next: nextRoute, option: detail.answerText, flagLevel: safetyFlag, answerDetail: detail });
        return;
      }
      proceedNext(detail, nextRoute);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQ, answerLog, answerDetails]
  );

  const proceedNext = async (detail: AnswerDetail, nextRoute: string) => {
    setSafetyOverlay(null);
    if (!currentQ) return;

    const updatedLog = { ...answerLog, [currentQ.id]: detail.answerText };
    const updatedDetails = [...answerDetails, detail];
    setAnswerLog(updatedLog);
    setAnswerDetails(updatedDetails);

    // Terminal node?
    if (nextRoute.startsWith('FINISH_') || nextRoute.startsWith('URGENT')) {
      setSubmitting(true);
      try {
        await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finalRoute: nextRoute, answerLog: updatedLog, answerDetails: updatedDetails }),
        });
        setTimeout(() => router.push('/dashboard'), 2400);
      } catch { setSubmitting(false); }
      return;
    }

    setStepNumber((prev) => prev + 1);
    setRouteGroup(nextRoute);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
          <Loader2 style={{ width: 48, height: 48, color: '#2dd4bf' }} />
        </motion.div>
      </div>
    );
  }

  /* ─── Submitting ─── */
  if (submitting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#020617', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)', top: '-15%', right: '-10%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 70%)', bottom: '-10%', left: '-8%', filter: 'blur(60px)' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} style={{ marginBottom: 32 }}>
          <Heart style={{ width: 64, height: 64, color: '#2dd4bf' }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.05em', color: '#e2e8f0', marginBottom: 12 }}>
            Generating your personalized wellness profile
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94a3b8' }}>
            <Sparkles style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Analyzing your responses with care...</span>
          </div>
        </motion.div>
        <motion.div animate={{ scale: [1, 1.8], opacity: [0.3, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(45,212,191,0.25)', top: '50%', left: '50%', transform: 'translate(-50%, -80%)' }}
        />
      </div>
    );
  }

  /* ─── Build options ─── */
  const options: { text: string; route: string; flag: string; label: 'A' | 'B' | 'C' }[] = currentQ
    ? [
        { text: currentQ.answerAText, route: currentQ.nextRouteA, flag: currentQ.safetyFlagA, label: 'A' },
        { text: currentQ.answerBText, route: currentQ.nextRouteB, flag: currentQ.safetyFlagB, label: 'B' },
        { text: currentQ.answerCText, route: currentQ.nextRouteC, flag: currentQ.safetyFlagC, label: 'C' },
      ]
    : [];

  /* ─── Safety modal config based on flag level ─── */
  const getSafetyConfig = (level: string) => {
    switch (level) {
      case 'soft':
        return {
          title: 'Just checking in',
          message: 'It sounds like things feel tough right now. We want to make sure you have the support you need. Would you like to continue, or would it help to see some support options?',
          accentColor: '#fbbf24',
          borderColor: 'rgba(251,191,36,0.2)',
          showCrisis: false,
        };
      case 'medium':
        return {
          title: 'We want to support you',
          message: 'We noticed you may need extra support right now. Please know that help is always available. Would you like to see support options, or continue with the assessment?',
          accentColor: '#fb923c',
          borderColor: 'rgba(251,146,60,0.2)',
          showCrisis: true,
        };
      case 'hard':
      default:
        return {
          title: 'You are not alone',
          message: 'We are concerned about how you are feeling right now. Your safety matters most. Please reach out to one of the services below, or let us know how we can help.',
          accentColor: '#f43f5e',
          borderColor: 'rgba(244,63,94,0.2)',
          showCrisis: true,
        };
    }
  };

  /* ─── Main UI ─── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)', top: '-20%', right: '-15%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)', bottom: '-15%', left: '-10%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 640, padding: '48px 24px 16px', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} style={{ flex: 1, height: 6, background: 'rgba(30,41,59,0.8)', borderRadius: 999, overflow: 'hidden' }}>
              {step <= stepNumber && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: step === stepNumber ? 0.2 : 0 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #2dd4bf, #38bdf8)', borderRadius: 999, boxShadow: '0 0 12px rgba(45,212,191,0.4)' }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#64748b' }}>
            Step {stepNumber} of 6
          </span>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>{STEP_SUBTITLES[stepNumber]}</p>
        </div>
      </div>

      {/* Question + Options */}
      <div style={{ flex: 1, display: 'flex', width: '100%', maxWidth: 640, flexDirection: 'column', justifyContent: 'center', padding: '0 24px 48px' }}>
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div key={currentQ.id} variants={questionVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300, textAlign: 'center', lineHeight: 1.35, marginBottom: 48, color: '#f8fafc' }}>
                {currentQ.questionText}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {options.map((opt, i) => (
                  <motion.button
                    key={i} custom={i} variants={cardStagger} initial="hidden" animate="visible"
                    onClick={() => handleSelect(opt.label, opt.route, opt.flag)}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%', textAlign: 'left', background: 'rgba(15,23,42,0.6)',
                      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20,
                      padding: '20px 24px', cursor: 'pointer', color: '#cbd5e1',
                      fontFamily: 'inherit', fontSize: '1.05rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                      transition: 'border-color 0.3s, background 0.3s, box-shadow 0.3s, color 0.3s', outline: 'none',
                    }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(45,212,191,0.4)'; el.style.background = 'rgba(15,23,42,0.85)'; el.style.boxShadow = '0 0 24px rgba(45,212,191,0.08), inset 0 1px 0 rgba(45,212,191,0.1)'; el.style.color = '#f1f5f9'; }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'rgba(148,163,184,0.1)'; el.style.background = 'rgba(15,23,42,0.6)'; el.style.boxShadow = 'none'; el.style.color = '#cbd5e1'; }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: 'rgba(45,212,191,0.08)', color: '#2dd4bf', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, border: '1px solid rgba(45,212,191,0.15)' }}>
                      {opt.label}
                    </span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                    <ArrowRight style={{ width: 20, height: 20, color: '#2dd4bf', opacity: 0.4, flexShrink: 0 }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety Modal — adapts to soft/medium/hard */}
      <AnimatePresence>
        {safetyOverlay && (() => {
          const cfg = getSafetyConfig(safetyOverlay.flagLevel);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
              <motion.div initial={{ scale: 0.92, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 24, opacity: 0 }}
                style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', border: `1px solid ${cfg.borderColor}`, borderRadius: 24, padding: 36, maxWidth: 440, width: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                {/* Top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, transparent 0%, ${cfg.accentColor} 50%, transparent 100%)` }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${cfg.accentColor}15`, border: `1px solid ${cfg.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert style={{ width: 22, height: 22, color: cfg.accentColor }} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: cfg.accentColor }}>{cfg.title}</h3>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: cfg.showCrisis ? 20 : 28 }}>
                  {cfg.message}
                </p>

                {/* UK Crisis Resources — shown for medium/hard */}
                {cfg.showCrisis && (
                  <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.1)', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 12 }}>Immediate Support</p>
                    {[
                      { icon: Phone, name: 'Samaritans', detail: '116 123 (free, 24/7)' },
                      { icon: MessageCircle, name: 'SHOUT', detail: 'Text SHOUT to 85258' },
                      { icon: Phone, name: 'NHS 111', detail: '111 (mental health option)' },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <r.icon style={{ width: 14, height: 14, color: cfg.accentColor, flexShrink: 0 }} />
                        <strong style={{ color: '#e2e8f0' }}>{r.name}</strong> — {r.detail}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cfg.showCrisis && (
                    <button onClick={() => router.push('/crisis-support')}
                      style={{ width: '100%', padding: '14px 20px', background: `${cfg.accentColor}15`, color: cfg.accentColor, fontWeight: 600, fontSize: '0.95rem', borderRadius: 16, border: `1px solid ${cfg.borderColor}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${cfg.accentColor}30`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${cfg.accentColor}15`; }}
                    >Get Immediate Support</button>
                  )}
                  <button onClick={() => proceedNext(safetyOverlay.answerDetail, safetyOverlay.next)}
                    style={{ width: '100%', padding: '14px 20px', background: 'transparent', color: '#64748b', fontWeight: 500, fontSize: '0.9rem', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s, color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30,41,59,0.6)'; e.currentTarget.style.color = '#94a3b8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                  >Continue Assessment</button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
