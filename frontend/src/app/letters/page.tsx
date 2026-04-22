'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
    listFutureLetters,
    createFutureLetter,
    type FutureLetter,
} from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const DELIVERY_OPTIONS = [
    { days: 7, label: '1 week' },
    { days: 30, label: '1 month' },
    { days: 90, label: '3 months' },
    { days: 180, label: '6 months' },
    { days: 365, label: '1 year' },
];

function formatDeliveryDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function daysUntil(iso: string): number {
    const ms = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function LettersPage() {
    const [letters, setLetters] = useState<FutureLetter[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');
    const [days, setDays] = useState<number>(30);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await listFutureLetters();
                if (active) setLetters(res.letters);
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const handleSeal = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const res = await createFutureLetter(content.trim(), days);
            setLetters((prev) => [res.letter, ...prev].sort((a, b) => a.deliverAt.localeCompare(b.deliverAt)));
            setContent('');
            toast.success('Sealed', {
                description: `Your letter waits for you on ${formatDeliveryDate(res.letter.deliverAt)}.`,
            });
        } catch (err) {
            console.error(err);
            toast.error('Could not seal letter right now');
        } finally {
            setSaving(false);
        }
    };

    const delivered = letters.filter((l) => l.delivered);
    const sealed = letters.filter((l) => !l.delivered);

    return (
        <div className="mx-auto max-w-3xl px-6 pt-6 sm:px-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Badge variant="outline" className="mb-3">
                    <Mail className="h-3.5 w-3.5" />
                    Letter to future you
                </Badge>
                <h1 className="text-balance text-4xl font-semibold tracking-tight">
                    Write now{' '}
                    <span className="font-display italic text-[color:var(--color-fg-muted)]">
                        — open later.
                    </span>
                </h1>
                <p className="mt-2 max-w-xl text-[color:var(--color-fg-muted)]">
                    A self-compassion practice. You seal it today. It opens itself for you on the day you choose. Encrypted until then.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mt-8"
            >
                <Card
                    className="relative overflow-hidden"
                    style={{ boxShadow: '0 20px 60px -40px rgba(167,139,250,0.4)' }}
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }}
                    />
                    <CardContent className="relative p-6 sm:p-8">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Dear me, when you read this…"
                            rows={8}
                            className="w-full resize-y rounded-2xl border border-white/[0.08] bg-[color:var(--color-bg)] px-5 py-4 text-base leading-relaxed outline-none transition-colors placeholder:text-[color:var(--color-fg-subtle)] focus:border-white/20"
                        />
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                                Deliver in
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {DELIVERY_OPTIONS.map((o) => (
                                    <button
                                        key={o.days}
                                        onClick={() => setDays(o.days)}
                                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                                        style={{
                                            borderColor: days === o.days ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)',
                                            background: days === o.days ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.02)',
                                            color: days === o.days ? '#a78bfa' : 'var(--color-fg-muted)',
                                        }}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSeal}
                                disabled={!content.trim() || saving}
                                className="ml-auto"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sealing…
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Seal letter
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {loading ? (
                <div className="mt-10 space-y-3">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            ) : (
                <>
                    {delivered.length > 0 && (
                        <section className="mt-10">
                            <h2 className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
                                Delivered
                            </h2>
                            <div className="mt-4 space-y-3">
                                {delivered.map((l) => (
                                    <Card key={l.id}>
                                        <CardContent className="p-5">
                                            <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                                                Opened {formatDeliveryDate(l.deliverAt)}
                                            </div>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                                                {l.content}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {sealed.length > 0 && (
                        <section className="mt-10">
                            <h2 className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
                                Sealed — waiting
                            </h2>
                            <div className="mt-4 space-y-3">
                                {sealed.map((l) => (
                                    <Card key={l.id}>
                                        <CardContent className="flex items-center gap-4 p-5">
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}
                                            >
                                                <Lock className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">Letter to future you</div>
                                                <div className="text-xs text-[color:var(--color-fg-subtle)]">
                                                    Opens {formatDeliveryDate(l.deliverAt)}
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)]">
                                                <Clock className="h-3.5 w-3.5" />
                                                {daysUntil(l.deliverAt)} days
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {letters.length === 0 && (
                        <p className="mt-10 text-sm text-[color:var(--color-fg-muted)]">
                            No letters yet. Write the first one — you will thank yourself.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
