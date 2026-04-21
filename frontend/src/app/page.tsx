'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, Heart, Phone, Brain, Waves } from 'lucide-react';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';

const FEATURES = [
  {
    icon: Brain,
    title: 'Pathway intelligence',
    body:
      'A living three-tier engine routes you to HIGH, MID, or LOW support — the right depth for the right moment.',
    accent: '#7dd3fc',
  },
  {
    icon: Shield,
    title: 'Privacy by architecture',
    body:
      'AES-256-GCM field encryption, PII scrubbing before any AI call, UK data sovereignty by default.',
    accent: '#a78bfa',
  },
  {
    icon: Heart,
    title: 'Crisis-aware safety net',
    body:
      'Dual-gate detection swaps in Clinical Safety Cards the instant risk is found. One tap to 999, 111, or Samaritans.',
    accent: '#fb7185',
  },
  {
    icon: Waves,
    title: 'Time-to-calm in under 60s',
    body:
      'Breathing, body scan, 5-4-3-2-1 grounding — pre-rendered, offline-first, zero generative wait.',
    accent: '#34d399',
  },
];

const METRICS = [
  { value: '<1.5s', label: 'HIGH pathway load' },
  { value: '<60s', label: 'Time to calm' },
  { value: 'AES-256', label: 'Field encryption' },
  { value: 'GDPR', label: 'UK-compliant' },
];

const CRISIS_LINES = [
  { label: '999', sub: 'Emergency' },
  { label: '111', sub: 'NHS 111' },
  { label: '116 123', sub: 'Samaritans' },
  { label: 'SHOUT to 85258', sub: 'Text support' },
];

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora />
      <NoiseOverlay />

      {/* Top nav */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
          <Logo size={34} withWordmark />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>
              Sign in
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/onboarding')}>
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-10 pb-28 text-center sm:px-10 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge variant="outline" className="mb-8 gap-2 border-white/15 bg-white/[0.03] px-3 py-1 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
            </span>
            Invisible intervention — a fortress for the mind
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="max-w-4xl text-balance text-5xl font-semibold leading-[1.04] tracking-tight sm:text-7xl"
        >
          The quiet place <br className="hidden sm:inline" />
          <span className="font-display italic text-transparent bg-clip-text bg-[linear-gradient(120deg,#7dd3fc,#c4b5fd,#fb7185)]">
            between you and the storm.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--color-fg-muted)] sm:text-xl"
        >
          Silent Help is a mental health companion built for UK users. Pathway-aware support, encrypted
          journalling, and a dual-gate safety net — all designed to get you to calm in under a minute.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button size="xl" variant="primary" onClick={() => router.push('/onboarding')}>
            Begin your pathway
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="xl" variant="secondary" onClick={() => router.push('/sos')}>
            <Phone className="h-4 w-4" />
            I need help right now
          </Button>
        </motion.div>

        {/* Animated pathway orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={mounted ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          className="relative mt-20 flex h-[320px] w-full max-w-3xl items-center justify-center sm:h-[420px]"
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]">
              <div
                className="absolute inset-0 rounded-full opacity-70"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(125,211,252,0.45), rgba(167,139,250,0.2) 40%, transparent 70%)',
                  animation: 'slow-breathe 7s ease-in-out infinite',
                }}
              />
              <div
                className="absolute inset-8 rounded-full border border-white/10"
                style={{ animation: 'slow-breathe 9s ease-in-out infinite reverse' }}
              />
              <div
                className="absolute inset-16 rounded-full border border-white/15"
                style={{ animation: 'slow-breathe 11s ease-in-out infinite' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border border-white/15 bg-[color:var(--color-bg-elevated)]/60 px-5 py-2 text-sm text-[color:var(--color-fg-muted)] backdrop-blur-xl">
                  <Sparkles className="mr-2 inline h-4 w-4 text-sky-300" />
                  breathe in… and out
                </div>
              </div>
            </div>
          </div>

          {/* Floating pathway chips */}
          <div className="relative z-10 grid h-full w-full grid-cols-2 grid-rows-2 gap-4 sm:gap-10">
            <FloatingChip position="top-left" color="#fb7185" label="HIGH" sub="Priority Zero" icon="🚨" />
            <FloatingChip position="top-right" color="#fbbf24" label="MID" sub="The Bridge" icon="🌉" />
            <FloatingChip position="bottom-left" color="#34d399" label="LOW" sub="Maintenance" icon="🌿" />
            <FloatingChip position="bottom-right" color="#a78bfa" label="Journal" sub="Semantic" icon="📖" />
          </div>
        </motion.div>
      </section>

      {/* Metrics band */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4 sm:px-10">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className="font-display text-3xl italic text-[color:var(--color-fg)] sm:text-4xl">
                {m.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-4">
            Built for the silence
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            In mental health, <span className="font-display italic">silence is a feature.</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[color:var(--color-fg-muted)]">
            Most apps fill silence with noise. We fill it with support. Every interaction is deterministic
            when it has to be, generative only when it helps.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                style={{ background: feature.accent }}
              />
              <feature.icon className="h-8 w-8" style={{ color: feature.accent }} />
              <h3 className="mt-6 text-xl font-semibold text-[color:var(--color-fg)]">
                {feature.title}
              </h3>
              <p className="mt-2 leading-relaxed text-[color:var(--color-fg-muted)]">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Crisis band */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 sm:px-10">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/[0.06] bg-[color:var(--color-bg-elevated)]/40 p-8 backdrop-blur-xl sm:p-12">
          <Aurora
            colors={[
              'rgba(251,113,133,0.35)',
              'rgba(251,191,36,0.28)',
              'rgba(125,211,252,0.28)',
            ]}
            intensity="soft"
          />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Badge variant="danger" className="mb-4">
                Crisis? Tap and we route instantly.
              </Badge>
              <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                UK-specific support, <span className="font-display italic">one tap away.</span>
              </h2>
              <p className="mt-4 max-w-md text-[color:var(--color-fg-muted)]">
                Our SOS pathway is offline-first, pre-rendered and opens in under 1.5 seconds. No
                generative AI in HIGH — only verified crisis resources.
              </p>
              <Button
                size="lg"
                variant="primary"
                className="mt-8"
                onClick={() => router.push('/sos')}
              >
                <Phone className="h-4 w-4" />
                Open SOS pathway
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CRISIS_LINES.map((line) => (
                <div
                  key={line.label}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                    {line.sub}
                  </div>
                  <div className="mt-1 font-display text-2xl italic text-[color:var(--color-fg)]">
                    {line.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-[color:var(--color-fg-subtle)] sm:flex-row sm:px-10">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <span>Silent Help · Private mental-health companion</span>
          </div>
          <div className="flex items-center gap-6">
            <span>GDPR · DPA 2018</span>
            <span>AES-256</span>
            <span>UK eu-west-2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FloatingChip({
  position,
  color,
  label,
  sub,
  icon,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  label: string;
  sub: string;
  icon: string;
}) {
  const posClass =
    position === 'top-left'
      ? 'self-start justify-self-start'
      : position === 'top-right'
        ? 'self-start justify-self-end'
        : position === 'bottom-left'
          ? 'self-end justify-self-start'
          : 'self-end justify-self-end';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`${posClass} flex items-center gap-3 rounded-2xl border border-white/10 bg-[color:var(--color-bg-elevated)]/70 px-4 py-3 backdrop-blur-xl`}
      style={{ boxShadow: `0 10px 40px -12px ${color}55` }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold" style={{ color }}>
          {label}
        </div>
        <div className="text-xs text-[color:var(--color-fg-muted)]">{sub}</div>
      </div>
    </motion.div>
  );
}
