'use client';

import { FormEvent, Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ArrowRight, Feather, Lock, ShieldCheck } from 'lucide-react';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { provisionGuestAuth } from '@/lib/api';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

function AuthForms() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { setContextProfile } = useWellness();
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);

  const checkAndSubmitPending = useCallback(
    async ({ token, isGuest }: { token?: string; isGuest: boolean }) => {
      const pending = localStorage.getItem('sh_pending_assessment');
      if (!pending) return false;
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/assessment/submit', {
          method: 'POST',
          headers,
          body: pending,
        });
        const data = await res.json();
        if (data.profile) {
          // Guests don't have a server-side Clerk copy — mirror to localStorage so
          // dashboard can render without a round-trip. Clerk users read from server.
          if (isGuest) {
            localStorage.setItem('sh_guest_profile', JSON.stringify(data.profile));
          }
          setContextProfile(data.profile);
          localStorage.removeItem('sh_pending_assessment');
        }
      } catch (e) {
        console.error('Failed to submit assessment:', e);
      }
      return true;
    },
    [setContextProfile],
  );

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      const token = await getToken();
      // Consent gate: if the signed-in user has not given Art 9 consent yet,
      // route them through /consent first.
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${API_BASE}/api/consent`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          if (!data?.current) {
            router.replace('/consent');
            return;
          }
        }
      } catch {
        /* fall through — never block on consent probe */
      }
      await checkAndSubmitPending({ token: token || undefined, isGuest: false });
      router.replace('/dashboard');
    })();
  }, [isSignedIn, router, getToken, checkAndSubmitPending]);

  const handleGuestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    localStorage.setItem('sh_guest_name', guestName.trim());
    setLoading(true);
    // Mint a backend-signed JWT up-front so journal/mood/chat/onboarding
    // endpoints stop 401-ing for guest sessions.
    const guestToken = await provisionGuestAuth();
    const hasPending = await checkAndSubmitPending({ token: guestToken || undefined, isGuest: true });
    setLoading(false);
    // Consent gate: new guests must give Art 9 consent before touching any
    // wellness surface. Reuse the consent probe to decide where to go.
    if (guestToken && !hasPending) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${API_BASE}/api/consent`, {
          headers: { Authorization: `Bearer ${guestToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!data?.current) {
            router.push('/consent');
            return;
          }
        }
      } catch {
        /* noop */
      }
    }
    router.push(hasPending ? '/dashboard' : '/onboarding');
  };

  if (isSignedIn) {
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
      <Aurora intensity="soft" />
      <NoiseOverlay />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-sm font-medium tracking-tight">Silent Help</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
          >
            ← Back home
          </Link>
        </header>

        <div className="mt-10 grid flex-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Narrative panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden flex-col lg:flex"
          >
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight">
              The quiet place{' '}
              <span className="font-display italic text-[color:var(--color-fg-muted)]">
                between you and the storm.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[color:var(--color-fg-muted)]">
              Save your wellness profile, keep encrypted journal entries, and pick up conversations
              with an AI companion trained for calm — not engagement.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: ShieldCheck, label: 'End-to-end encrypted journal + chat' },
                { icon: Lock, label: 'Your data stays yours. Export or delete anytime.' },
                { icon: Feather, label: 'Offline-first tools work even with no internet.' },
              ].map((i) => (
                <div key={i.label} className="flex items-center gap-3 text-sm text-[color:var(--color-fg-muted)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <i.icon className="h-4 w-4 text-[color:var(--color-fg)]" />
                  </div>
                  {i.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative"
          >
            <Card glow className="p-8 sm:p-10">
              <CardContent className="p-0">
                <div className="mb-6 flex items-center gap-3">
                  <Logo size={44} />
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                      Silent Help
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">Save your progress</h2>
                  </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  Create a free account to sync your wellness profile across devices, or continue
                  as a guest and upgrade later.
                </p>

                <div className="flex flex-col gap-3">
                  <SignUpButton mode="modal">
                    <Button variant="primary" size="lg" className="w-full">
                      Create free account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button variant="secondary" size="lg" className="w-full">
                      Sign in
                    </Button>
                  </SignInButton>
                </div>

                <div className="my-6 flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.25em] text-[color:var(--color-fg-subtle)]">
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  or continue as guest
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <form onSubmit={handleGuestSubmit} className="space-y-3">
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="What should we call you?"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={loading || !guestName.trim()}
                  >
                    {loading ? (
                      <span className="loading-dots">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      <>
                        Continue as guest
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-[11px] leading-relaxed text-[color:var(--color-fg-subtle)]">
                  By continuing, you agree that Silent Help is a support tool, not a substitute for
                  clinical care.{' '}
                  <Link href="/sos" className="underline hover:text-[color:var(--color-fg-muted)]">
                    Crisis resources
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      }
    >
      <AuthForms />
    </Suspense>
  );
}
