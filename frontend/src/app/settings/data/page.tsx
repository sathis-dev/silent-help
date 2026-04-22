'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Download, ShieldCheck, Trash2 } from 'lucide-react';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { Button } from '@/components/ui/button';
import { authHeaders, clearGuestAuth } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Retention = 'forever' | '1y' | '90d';

interface ConsentState {
  current: boolean;
  consentVersion: string | null;
  consentedAt: string | null;
  retentionPolicy: Retention | null;
  childMode: boolean;
  birthYear: number | null;
  region: string | null;
  locale: string | null;
}

const RETENTION_LABEL: Record<Retention, string> = {
  forever: 'Keep until I delete',
  '1y': 'Auto-delete after 1 year',
  '90d': 'Auto-delete after 90 days',
};

export default function SettingsDataPage() {
  const router = useRouter();
  const [state, setState] = useState<ConsentState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');

  const load = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/api/consent`, { headers });
    if (!res.ok) return;
    setState(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRetention = useCallback(
    async (r: Retention) => {
      setSaving(true);
      setMessage(null);
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_BASE}/api/me/retention`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ retention: r }),
        });
        if (res.ok) {
          setMessage(`Retention updated to “${RETENTION_LABEL[r]}”.`);
          await load();
        } else {
          setMessage('Could not update retention. Please try again.');
        }
      } finally {
        setSaving(false);
      }
    },
    [load],
  );

  const exportData = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/api/me/export`, { headers });
    if (!res.ok) {
      setMessage('Could not export your data.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silent-help-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Export downloaded.');
  }, []);

  const deleteAccount = useCallback(async () => {
    if (confirmDelete.trim().toLowerCase() !== 'delete my account') return;
    setSaving(true);
    try {
      const headers = await authHeaders();
      await fetch(`${API_BASE}/api/me`, { method: 'DELETE', headers });
      // Hard-clear local storage, guest token, and bounce to landing.
      localStorage.clear();
      clearGuestAuth();
      router.replace('/');
    } finally {
      setSaving(false);
    }
  }, [confirmDelete, router]);

  const withdrawConsent = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/api/consent`, { method: 'DELETE', headers });
    if (res.ok) {
      setMessage('Consent withdrawn. Please delete your account to erase stored data.');
      await load();
    }
  }, [load]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora intensity="soft" />
      <NoiseOverlay />
      <main className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]">
            ← Back to dashboard
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your data, your rules
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Your data</h1>
        <p className="mt-2 text-[color:var(--color-fg-muted)]">
          Export, change how long we keep things, or permanently delete your account. All of these
          are your rights under UK &amp; EU GDPR.
        </p>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100"
          >
            {message}
          </motion.div>
        )}

        {state && (
          <section className="mt-8 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
              Consent status
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-[color:var(--color-fg-muted)]">Version:</span>{' '}
                {state.consentVersion || '—'}
              </div>
              <div>
                <span className="text-[color:var(--color-fg-muted)]">Granted:</span>{' '}
                {state.consentedAt ? new Date(state.consentedAt).toLocaleString() : '—'}
              </div>
              <div>
                <span className="text-[color:var(--color-fg-muted)]">Mode:</span>{' '}
                {state.childMode ? (
                  <span className="text-amber-300">Children&apos;s Code (safer defaults)</span>
                ) : (
                  <span>Adult</span>
                )}
              </div>
              <div>
                <span className="text-[color:var(--color-fg-muted)]">Locale:</span>{' '}
                {state.locale || '—'}
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            Retention
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(['90d', '1y', 'forever'] as Retention[]).map((r) => (
              <button
                key={r}
                type="button"
                disabled={saving}
                onClick={() => changeRetention(r)}
                className={`rounded-xl border p-3 text-left text-sm transition ${
                  state?.retentionPolicy === r
                    ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="font-medium">{RETENTION_LABEL[r]}</div>
                <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                  {r === 'forever'
                    ? 'Explicit opt-in, nothing auto-deleted.'
                    : `Entries older than ${r === '1y' ? '1 year' : '90 days'} are auto-removed.`}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            Export &amp; portability (Art 20)
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              Download every row we hold for you — assessment, mood, journal (decrypted), chat,
              memories, safety plan, reminders — as one JSON file.
            </p>
            <Button onClick={exportData} variant="secondary" className="shrink-0">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            Withdraw consent (Art 7.3)
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              Revoke your Article 9(2)(a) consent. You&apos;ll still need to delete the account
              below to erase the stored data.
            </p>
            <Button onClick={withdrawConsent} variant="ghost" className="shrink-0">
              Withdraw consent
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-rose-400/30 bg-rose-400/5 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-rose-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Delete account (Art 17 · right to erasure)
          </div>
          <p className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
            Marks your account for deletion. All journal, chat, mood, and profile data is
            permanently purged within 30 days. This cannot be undone.
          </p>
          <label className="mt-4 block text-xs uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            Type <em>delete my account</em> to confirm
          </label>
          <input
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
            placeholder="delete my account"
          />
          <Button
            onClick={deleteAccount}
            disabled={confirmDelete.trim().toLowerCase() !== 'delete my account' || saving}
            variant="danger"
            className="mt-3"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Permanently delete
          </Button>
        </section>

        <p className="mt-10 text-xs text-[color:var(--color-fg-subtle)]">
          Read the full{' '}
          <Link href="/privacy" className="underline">Privacy Notice</Link> · <Link href="/cookies" className="underline">Cookie Policy</Link> · <Link href="/terms" className="underline">Terms</Link>.
          Data protection queries: <a className="underline" href="mailto:privacy@silenthelp.app">privacy@silenthelp.app</a>.
        </p>
      </main>
    </div>
  );
}
