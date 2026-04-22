'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Play, Sparkles, X } from 'lucide-react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import GroundingExercise from '@/components/activities/GroundingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';
import FocusTimer from '@/components/activities/FocusTimer';
import StepExercise, {
  TIPP_STEPS,
  URGE_SURF_STEPS,
  SELF_COMPASSION_STEPS,
  COGNITIVE_DIFFUSION_STEPS,
} from '@/components/activities/StepExercise';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

type ToolId =
  | 'breathing'
  | 'grounding'
  | 'bodyscan'
  | 'sleep'
  | 'focus'
  | '478-breath'
  | 'coherent'
  | 'tipp'
  | 'urge-surf'
  | 'self-compassion'
  | 'diffusion'
  | null;

interface Tool {
  id: Exclude<ToolId, null>;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  category: 'Breath' | 'Ground' | 'Body' | 'Focus' | 'Regulate' | 'Compassion';
}

const TOOLS: Tool[] = [
  {
    id: 'breathing',
    name: 'Box Breathing',
    tagline: '4-4-4-4 · slow the storm',
    description: 'A tactical breath pattern used by Navy SEALs to regulate the nervous system in under 3 minutes.',
    icon: '🌊',
    color: '#2dd4bf',
    duration: '3 min',
    category: 'Breath',
  },
  {
    id: 'grounding',
    name: '5-4-3-2-1 Grounding',
    tagline: 'Return to your senses',
    description: 'Use sight, sound, touch, smell, and taste to pull yourself out of rumination and back into the room.',
    icon: '🖐️',
    color: '#a78bfa',
    duration: '3 min',
    category: 'Ground',
  },
  {
    id: 'bodyscan',
    name: 'Progressive Release',
    tagline: 'Head-to-toe tension reset',
    description: 'Scan each muscle group, soften what is clenched, release the day from your shoulders and jaw.',
    icon: '✨',
    color: '#fbbf24',
    duration: '5 min',
    category: 'Body',
  },
  {
    id: 'sleep',
    name: 'Sleep Reset',
    tagline: 'Quiet a racing mind',
    description: 'Longer exhales signal safety to your body. A gentle wind-down before sleep or after stress.',
    icon: '🌙',
    color: '#818cf8',
    duration: '5 min',
    category: 'Breath',
  },
  {
    id: 'focus',
    name: 'Focus Timer',
    tagline: 'One thing · gently',
    description: 'A soft pomodoro for when concentration feels slippery. Start small.',
    icon: '🎯',
    color: '#38bdf8',
    duration: '10 min',
    category: 'Focus',
  },
  {
    id: '478-breath',
    name: '4-7-8 Relaxing Breath',
    tagline: 'The body-quiet protocol',
    description: 'Dr. Weil\u2019s evidence-backed pattern: 4 in, 7 hold, 8 out. Drops heart rate in three rounds. Ideal for pre-sleep or post-panic.',
    icon: '🌬️',
    color: '#a78bfa',
    duration: '3 min',
    category: 'Breath',
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    tagline: 'Heart-rate coherence · 5.5 bpm',
    description: 'Slow, symmetric breathing at roughly 6 breaths per minute. Brings heart-rate variability into a calm, balanced rhythm.',
    icon: '💞',
    color: '#22d3ee',
    duration: '2 min',
    category: 'Breath',
  },
  {
    id: 'tipp',
    name: 'TIPP (DBT)',
    tagline: 'Crash-cool intense activation',
    description: 'Temperature, Intense exercise, Paced breathing, Paired relaxation. DBT\u2019s fastest distress-tolerance skill when you\u2019re in the red zone.',
    icon: '❄️',
    color: '#38bdf8',
    duration: '2 min',
    category: 'Regulate',
  },
  {
    id: 'urge-surf',
    name: 'Urge Surfing',
    tagline: 'Ride the wave · don\u2019t feed it',
    description: 'Urges peak and recede like waves. Sit with the body sensation instead of fighting or feeding it. Mindfulness-based relapse prevention.',
    icon: '🌊',
    color: '#06b6d4',
    duration: '3 min',
    category: 'Regulate',
  },
  {
    id: 'self-compassion',
    name: 'Self-Compassion Break',
    tagline: 'Kristin Neff\u2019s 3-step practice',
    description: 'Three quiet sentences that soften self-judgement: this is hard, I am not alone, may I be kind to myself.',
    icon: '🤲',
    color: '#f472b6',
    duration: '2 min',
    category: 'Compassion',
  },
  {
    id: 'diffusion',
    name: 'Cognitive Diffusion (ACT)',
    tagline: 'You are not your thoughts',
    description: 'An ACT micro-practice that unhooks you from sticky thoughts. The thought is still there \u2014 it just stops running the show.',
    icon: '💭',
    color: '#c084fc',
    duration: '3 min',
    category: 'Regulate',
  },
];

export default function ToolsPage() {
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [category, setCategory] = useState<Tool['category'] | 'All'>('All');

  useEffect(() => {
    const a = searchParams.get('activity');
    if (
      a &&
      [
        'breathing',
        'grounding',
        'bodyscan',
        'sleep',
        'focus',
        '478-breath',
        'coherent',
        'tipp',
        'urge-surf',
        'self-compassion',
        'diffusion',
      ].includes(a)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTool(a as Exclude<ToolId, null>);
    }
  }, [searchParams]);

  const filtered = useMemo(
    () => (category === 'All' ? TOOLS : TOOLS.filter((t) => t.category === category)),
    [category],
  );

  const active = TOOLS.find((t) => t.id === activeTool) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-6 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <Badge variant="outline" className="mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Wellness library
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            Pick a{' '}
            <span className="font-display italic text-[color:var(--color-fg-muted)]">small practice.</span>
          </h1>
          <p className="mt-2 max-w-xl text-[color:var(--color-fg-muted)]">
            Deterministic exercises that work offline. Each one takes 3–10 minutes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['All', 'Breath', 'Ground', 'Body', 'Focus', 'Regulate', 'Compassion'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                category === c
                  ? 'border-white/25 bg-white/[0.08] text-[color:var(--color-fg)]'
                  : 'border-white/10 bg-white/[0.02] text-[color:var(--color-fg-muted)] hover:border-white/20 hover:text-[color:var(--color-fg)]',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t, i) => (
          <motion.button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.04 * i }}
            className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.06] bg-white/[0.02] p-6 text-left transition-all hover:-translate-y-1 hover:border-white/15"
            style={{
              boxShadow: `0 20px 60px -40px ${t.color}80`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-70"
              style={{ background: `radial-gradient(circle, ${t.color}, transparent 70%)` }}
            />
            <div className="relative flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                style={{ background: `${t.color}18`, border: `1px solid ${t.color}38` }}
              >
                {t.icon}
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider"
                style={{
                  borderColor: `${t.color}38`,
                  color: t.color,
                  background: `${t.color}12`,
                }}
              >
                <Clock className="h-3 w-3" />
                {t.duration}
              </span>
            </div>

            <div className="relative mt-8 flex-1">
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: t.color }}>
                {t.category}
              </div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">{t.name}</h3>
              <div className="mt-0.5 font-display italic text-[color:var(--color-fg-muted)]">
                {t.tagline}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                {t.description}
              </p>
            </div>

            <div className="relative mt-6 flex items-center gap-2 text-sm font-medium" style={{ color: t.color }}>
              <Play className="h-4 w-4" />
              Start session
              <span className="ml-auto text-xs opacity-0 transition-opacity group-hover:opacity-80">
                ⌘↵
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,7,13,0.85)] p-4 backdrop-blur-2xl"
            onClick={() => setActiveTool(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.08] bg-[color:var(--color-bg-elevated)]"
              style={{ boxShadow: `0 30px 120px -20px ${active.color}60` }}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTool(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em]" style={{ color: active.color }}>
                      {active.category} · {active.duration}
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{active.name}</h2>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setActiveTool(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-2">
                {activeTool === 'breathing' && (
                  <BreathingExercise
                    variant="box"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'grounding' && (
                  <GroundingExercise
                    variant="5-4-3-2-1"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'bodyscan' && (
                  <BodyReleaseExercise
                    variant="pmr-short"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'sleep' && (
                  <BreathingExercise
                    variant="soft"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'focus' && (
                  <FocusTimer
                    duration={600}
                    label="Focus for 10 minutes"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === '478-breath' && (
                  <BreathingExercise
                    variant="4-7-8"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'coherent' && (
                  <BreathingExercise
                    variant="coherent"
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'tipp' && (
                  <StepExercise
                    variant="tipp"
                    title="TIPP — DBT distress tolerance"
                    subtitle="Lowers intense activation in under 2 minutes"
                    steps={TIPP_STEPS}
                    accent={active.color}
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'urge-surf' && (
                  <StepExercise
                    variant="urge-surf"
                    title="Urge Surfing"
                    subtitle="Ride the wave — don\u2019t feed or fight it"
                    steps={URGE_SURF_STEPS}
                    accent={active.color}
                    completionTitle="You surfed it."
                    completionBody="Urges are not commands. You stayed with yourself."
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'self-compassion' && (
                  <StepExercise
                    variant="self-compassion"
                    title="Self-Compassion Break"
                    subtitle="Kristin Neff\u2019s 3-step practice"
                    steps={SELF_COMPASSION_STEPS}
                    accent={active.color}
                    completionTitle="That was a kindness."
                    completionBody="You gave yourself what you would give a close friend."
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
                {activeTool === 'diffusion' && (
                  <StepExercise
                    variant="diffusion"
                    title="Cognitive Diffusion"
                    subtitle="Unhook from the thought"
                    steps={COGNITIVE_DIFFUSION_STEPS}
                    accent={active.color}
                    completionTitle="The thought is quieter."
                    completionBody="You can notice thoughts without obeying them."
                    onComplete={() => setActiveTool(null)}
                    onCancel={() => setActiveTool(null)}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
