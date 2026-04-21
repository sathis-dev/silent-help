'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import { Button } from '@/components/ui/button';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';

const RESOURCES = [
  {
    key: '999',
    title: '999',
    description: 'Emergency services — police, ambulance, fire.',
    tel: '999',
    mode: 'call',
    tone: 'danger',
  },
  {
    key: '111',
    title: 'NHS 111',
    description: 'Urgent medical help, 24/7. Option 2 for mental health.',
    tel: '111',
    mode: 'call',
    tone: 'warning',
  },
  {
    key: 'samaritans',
    title: 'Samaritans',
    description: 'Free listening, 24/7. Call 116 123 from any phone.',
    tel: '116123',
    mode: 'call',
    tone: 'info',
  },
  {
    key: 'shout',
    title: 'SHOUT 85258',
    description: 'UK crisis text line. Text SHOUT to 85258.',
    tel: '85258',
    smsBody: 'SHOUT',
    mode: 'text',
    tone: 'calm',
  },
] as const;

const TONE: Record<string, { border: string; bg: string; accent: string }> = {
  danger: { border: 'rgba(251,113,133,0.35)', bg: 'rgba(251,113,133,0.1)', accent: '#fb7185' },
  warning: { border: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.1)', accent: '#fbbf24' },
  info: { border: 'rgba(56,189,248,0.35)', bg: 'rgba(56,189,248,0.1)', accent: '#7dd3fc' },
  calm: { border: 'rgba(45,212,191,0.35)', bg: 'rgba(45,212,191,0.08)', accent: '#2dd4bf' },
};

export default function SOSPage() {
  const accent = '#fb7185';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora
        colors={['rgba(251,113,133,0.35)', 'rgba(251,191,36,0.2)', 'rgba(251,113,133,0.2)']}
        intensity="strong"
      />
      <NoiseOverlay />

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 px-3 py-1 text-xs text-[color:var(--color-danger)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            You are safe here
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center"
        >
          <h1 className="font-display text-5xl italic sm:text-6xl">Breathe with me.</h1>
          <p className="mx-auto mt-3 max-w-md text-[color:var(--color-fg-muted)]">
            You are not alone. Focus on the circle. Help is one tap away, when you are ready.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-10 max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.06] bg-white/[0.02] p-2 backdrop-blur"
        >
          <BreathingExercise variant="calm-60" accent={accent} onComplete={() => {}} onCancel={() => {}} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <h2 className="mb-4 text-sm uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            UK crisis support — tap to reach out
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {RESOURCES.map((r, i) => {
              const tone = TONE[r.tone];
              const href = r.mode === 'call'
                ? `tel:${r.tel}`
                : `sms:${r.tel}${'smsBody' in r && r.smsBody ? `?body=${encodeURIComponent(r.smsBody)}` : ''}`;
              return (
                <motion.a
                  key={r.key}
                  href={href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="group flex items-center gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ borderColor: tone.border, background: tone.bg, boxShadow: `0 10px 30px -20px ${tone.accent}70` }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${tone.accent}20`, color: tone.accent }}
                  >
                    {r.mode === 'call' ? <Phone className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-2xl italic" style={{ color: tone.accent }}>
                      {r.title}
                    </div>
                    <div className="text-sm text-[color:var(--color-fg-muted)]">{r.description}</div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="lg">
              Return when ready
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
