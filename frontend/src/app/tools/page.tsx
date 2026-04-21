'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Play, Sparkles, X } from 'lucide-react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import GroundingExercise from '@/components/activities/GroundingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';
import FocusTimer from '@/components/activities/FocusTimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

type ToolId = 'breathing' | 'grounding' | 'bodyscan' | 'sleep' | 'focus' | null;

interface Tool {
  id: Exclude<ToolId, null>;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  category: 'Breath' | 'Ground' | 'Body' | 'Focus';
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
];

export default function ToolsPage() {
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [category, setCategory] = useState<Tool['category'] | 'All'>('All');

  useEffect(() => {
    const a = searchParams.get('activity');
    if (a && ['breathing', 'grounding', 'bodyscan', 'sleep', 'focus'].includes(a)) {
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
          {(['All', 'Breath', 'Ground', 'Body', 'Focus'] as const).map((c) => (
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
