'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Lock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { authHeaders } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Retention = 'forever' | '1y' | '90d';

const MIN_AGE = 13;

const RETENTION_OPTIONS: { key: Retention; title: string; description: string }[] = [
  {
    key: '90d',
    title: 'Auto-delete after 90 days',
    description:
      'Most privacy-first. Entries older than 90 days are removed unless you mark them as kept.',
  },
  {
    key: '1y',
    title: 'Auto-delete after 1 year',
    description: 'Balanced. A year of history for insights; anything older is cleared automatically.',
  },
  {
    key: 'forever',
    title: 'Keep until I delete',
    description:
      'Explicit opt-in. Nothing is auto-deleted; you stay in full control of every entry.',
  },
];

export default function ConsentGate() {
  const router = useRouter();
  const currentYear = new Date().getUTCFullYear();

  const [birthYearStr, setBirthYearStr] = useState('');
  const [retention, setRetention] = useState<Retention | null>(null);
  const [agreeArt9, setAgreeArt9] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user already consented (revisiting), bounce to the next step.
    (async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_BASE}/api/consent`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.current) router.replace('/onboarding');
      } catch {
        /* noop */
      }
    })();
  }, [router]);

  const birthYear = useMemo(() => {
    const n = parseInt(birthYearStr, 10);
    return Number.isFinite(n) ? n : null;
  }, [birthYearStr]);

  const age = useMemo(() => (birthYear ? currentYear - birthYear : null), [birthYear, currentYear]);
  const isChild = age !== null && age >= MIN_AGE && age <= 17;
  const tooYoung = age !== null && age < MIN_AGE;
  const invalid = age !== null && (age < 0 || age > 130);

  const canSubmit =
    !!birthYear && !tooYoung && !invalid && !!retention && agreeArt9 && agreeTerms && !submitting;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit || !birthYear || !retention) return;
      setSubmitting(true);
      setError(null);
      try {
        const locale = typeof navigator !== 'undefined' ? navigator.language : undefined;
        const region = locale?.split('-')[1]?.toUpperCase();
        const headers = await authHeaders();
        const res = await fetch(`${API_BASE}/api/consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ birthYear, retention, locale, region }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || 'Could not record your choices. Please try again.');
          setSubmitting(false);
          return;
        }
        if (data?.childMode) {
          // Remember client-side so UI can paint safer defaults immediately.
          localStorage.setItem('sh_child_mode', '1');
        } else {
          localStorage.removeItem('sh_child_mode');
        }
        router.replace('/onboarding');
      } catch {
        setError('Network error. Please try again.');
        setSubmitting(false);
      }
    },
    [canSubmit, birthYear, retention, router],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora intensity="soft" />
      <NoiseOverlay />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-sm font-medium tracking-tight">Silent Help</span>
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private by design
          </span>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex-1"
        >
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Before we begin,{' '}
            <span className="font-display italic text-[color:var(--color-fg-muted)]">
              a moment of honesty.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[color:var(--color-fg-muted)]">
            Silent Help is a <strong className="text-[color:var(--color-fg)]">wellness companion</strong>,
            not a medical device, not a diagnosis, not a replacement for therapy. Your mood and
            journal entries are special-category personal data under UK and EU GDPR, so we need
            your explicit permission to store and process them.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            {/* Age */}
            <section className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
                <UserCheck className="h-4 w-4" />
                1 · Age confirmation
              </div>
              <label className="mt-3 block text-xs uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
                What year were you born?
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={currentYear - 130}
                max={currentYear}
                placeholder="e.g. 1998"
                value={birthYearStr}
                onChange={(e) => setBirthYearStr(e.target.value.replace(/[^0-9]/g, ''))}
                className="mt-2 w-40 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-lg text-[color:var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <div className="mt-2 text-xs text-[color:var(--color-fg-subtle)]">
                We store the year only — never your exact date of birth.
              </div>
              {tooYoung && (
                <div className="mt-3 rounded-lg border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-200">
                  Silent Help is only available to people aged {MIN_AGE} or over. If you are in crisis
                  please contact a trusted adult or a helpline: Samaritans <strong>116 123</strong>,
                  Childline <strong>0800 1111</strong>.
                </div>
              )}
              {isChild && (
                <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
                  <div className="font-medium">Safer-by-default mode will be enabled.</div>
                  Because you are under 18, Silent Help will only use on-device and self-hosted AI
                  (no third-party AI vendor ever sees your words), and telemetry is minimised — in
                  line with the ICO Children&apos;s Code.
                </div>
              )}
            </section>

            {/* Retention */}
            <section className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
                <Lock className="h-4 w-4" />
                2 · How long should we keep your entries?
              </div>
              <p className="mt-2 text-xs text-[color:var(--color-fg-subtle)]">
                UK GDPR requires a defined retention period. You can change this any time in
                Settings → Data.
              </p>
              <div className="mt-4 grid gap-3">
                {RETENTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRetention(opt.key)}
                    className={`text-left rounded-xl border p-4 transition ${
                      retention === opt.key
                        ? 'border-emerald-400/50 bg-emerald-400/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-fg-muted)]" />
                      {opt.title}
                    </div>
                    <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Consent */}
            <section className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
                <Heart className="h-4 w-4" />
                3 · Consent &amp; boundaries
              </div>

              <label className="mt-4 flex items-start gap-3 text-sm text-[color:var(--color-fg)]">
                <input
                  type="checkbox"
                  checked={agreeArt9}
                  onChange={(e) => setAgreeArt9(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-[color:var(--color-fg-muted)]">
                  I give my explicit consent to Silent Help to process my special-category data
                  (mood, journal, chat) under <strong>Article 9(2)(a) UK &amp; EU GDPR</strong> for the sole
                  purpose of providing me with wellness support. I can withdraw this consent and
                  delete everything at any time.
                </span>
              </label>

              <label className="mt-3 flex items-start gap-3 text-sm text-[color:var(--color-fg)]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-[color:var(--color-fg-muted)]">
                  I have read the{' '}
                  <Link href="/privacy" className="underline underline-offset-4">
                    Privacy Notice
                  </Link>
                  , the{' '}
                  <Link href="/cookies" className="underline underline-offset-4">
                    Cookie Policy
                  </Link>
                  , and the{' '}
                  <Link href="/terms" className="underline underline-offset-4">
                    Terms
                  </Link>
                  , and understand Silent Help is <strong>not a medical device</strong> and does not
                  diagnose, treat, or monitor any condition.
                </span>
              </label>
            </section>

            {error && (
              <div className="rounded-lg border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-fg-subtle)]">
                In crisis now? Call <strong>999</strong> (UK) or <strong>112</strong> (EU) ·
                Samaritans <strong>116 123</strong> · Shout text <strong>85258</strong>.
              </span>
              <Button type="submit" disabled={!canSubmit} className="min-w-[180px]">
                {submitting ? 'Saving…' : 'Continue'}
              </Button>
            </div>
          </form>
        </motion.main>
      </div>
    </div>
  );
}
