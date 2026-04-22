'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Loader2, ShieldCheck, Phone } from 'lucide-react';
import { toast } from 'sonner';
import {
    listClinical,
    submitClinical,
    type ClinicalInstrument,
    type ClinicalResult,
} from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import Link from 'next/link';

interface Instrument {
    id: ClinicalInstrument;
    title: string;
    subtitle: string;
    stem: string;
    items: string[];
    accent: string;
}

const INSTRUMENTS: Record<ClinicalInstrument, Instrument> = {
    phq9: {
        id: 'phq9',
        title: 'PHQ-9',
        subtitle: 'Depression screener',
        stem: 'Over the last 2 weeks, how often have you been bothered by…',
        accent: '#7dd3fc',
        items: [
            'Little interest or pleasure in doing things',
            'Feeling down, depressed, or hopeless',
            'Trouble falling or staying asleep, or sleeping too much',
            'Feeling tired or having little energy',
            'Poor appetite or overeating',
            'Feeling bad about yourself — or that you are a failure',
            'Trouble concentrating on things such as reading or TV',
            'Moving or speaking so slowly others could notice — or the opposite: being fidgety or restless',
            'Thoughts that you would be better off dead, or of hurting yourself',
        ],
    },
    gad7: {
        id: 'gad7',
        title: 'GAD-7',
        subtitle: 'Anxiety screener',
        stem: 'Over the last 2 weeks, how often have you been bothered by…',
        accent: '#a78bfa',
        items: [
            'Feeling nervous, anxious, or on edge',
            'Not being able to stop or control worrying',
            'Worrying too much about different things',
            'Trouble relaxing',
            'Being so restless it is hard to sit still',
            'Becoming easily annoyed or irritable',
            'Feeling afraid as if something awful might happen',
        ],
    },
};

const SCALE = [
    { value: 0, label: 'Not at all' },
    { value: 1, label: 'Several days' },
    { value: 2, label: 'More than half the days' },
    { value: 3, label: 'Nearly every day' },
];

function severityLabel(s: string) {
    return s.replace('_', ' ');
}

function severityColor(s: string) {
    switch (s) {
        case 'minimal':
            return '#2dd4bf';
        case 'mild':
            return '#a3e635';
        case 'moderate':
            return '#fbbf24';
        case 'moderately_severe':
            return '#fb923c';
        case 'severe':
            return '#fb7185';
        default:
            return '#94a3b8';
    }
}

export default function ClinicalPage() {
    const [active, setActive] = useState<ClinicalInstrument | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState<ClinicalResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await listClinical();
                if (alive) setHistory(res.results);
            } catch (err) {
                console.error(err);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const openInstrument = (id: ClinicalInstrument) => {
        setActive(id);
        setAnswers(new Array(INSTRUMENTS[id].items.length).fill(-1));
    };

    const close = () => {
        setActive(null);
        setAnswers([]);
    };

    const setAnswer = (idx: number, value: number) => {
        setAnswers((prev) => {
            const next = [...prev];
            next[idx] = value;
            return next;
        });
    };

    const submit = async () => {
        if (!active) return;
        if (answers.some((a) => a < 0)) {
            toast('Answer each question', { description: 'Every row needs a tap.' });
            return;
        }
        setSubmitting(true);
        try {
            const res = await submitClinical(active, answers);
            setHistory((prev) => [res.result, ...prev]);
            toast.success('Recorded', {
                description: `${INSTRUMENTS[active].title}: ${res.result.score} · ${severityLabel(res.result.severity)}`,
            });
            // If PHQ-9 item 9 (self-harm ideation) answered >= 1, nudge to SOS
            if (active === 'phq9' && answers[8] >= 1) {
                toast.warning('That last question matters most', {
                    description: 'If you are having thoughts of harming yourself — please reach for the SOS page.',
                    duration: 10_000,
                });
            }
            close();
        } catch (err) {
            console.error(err);
            toast.error('Could not save result');
        } finally {
            setSubmitting(false);
        }
    };

    const instrument = active ? INSTRUMENTS[active] : null;
    const total = useMemo(
        () => answers.reduce((a, b) => (b >= 0 ? a + b : a), 0),
        [answers],
    );
    const answeredCount = answers.filter((a) => a >= 0).length;

    return (
        <div className="mx-auto max-w-4xl px-6 pt-6 sm:px-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Badge variant="outline" className="mb-3">
                    <Activity className="h-3.5 w-3.5" />
                    Clinical check-ins
                </Badge>
                <h1 className="text-balance text-4xl font-semibold tracking-tight">
                    A longer look,{' '}
                    <span className="font-display italic text-[color:var(--color-fg-muted)]">
                        if you want one.
                    </span>
                </h1>
                <p className="mt-2 max-w-2xl text-[color:var(--color-fg-muted)]">
                    Validated screening questionnaires used by clinicians worldwide. Completely private — none of this
                    is a diagnosis. It can help you, or a therapist, see movement over time.
                </p>
                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
                    <span className="font-semibold text-amber-300">Not a diagnostic tool.</span> PHQ-9 (Kroenke et al.,
                    2001) and GAD-7 (Spitzer et al., 2006) are screening instruments. If your score is high, or if you
                    are at all worried — please reach for a GP, therapist, or{' '}
                    <Link href="/sos" className="underline">crisis support</Link>.
                </div>
            </motion.div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {(Object.values(INSTRUMENTS) as Instrument[]).map((i) => (
                    <Card
                        key={i.id}
                        className="relative cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                        style={{ boxShadow: `0 20px 60px -44px ${i.accent}70` }}
                        onClick={() => openInstrument(i.id)}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
                            style={{ background: `radial-gradient(circle, ${i.accent}, transparent 70%)` }}
                        />
                        <CardContent className="relative p-6">
                            <div className="text-xs uppercase tracking-[0.22em]" style={{ color: i.accent }}>
                                {i.subtitle}
                            </div>
                            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{i.title}</h3>
                            <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">
                                {i.items.length} questions · about 2 minutes · private
                            </p>
                            <div className="mt-4">
                                <Button variant="secondary" size="md">
                                    Take the {i.title}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-10">
                <h2 className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
                    Your history
                </h2>
                <div className="mt-4 space-y-3">
                    {loading && <Skeleton className="h-20 w-full rounded-2xl" />}
                    {!loading && history.length === 0 && (
                        <p className="text-sm text-[color:var(--color-fg-muted)]">
                            No results yet. A first score becomes a baseline — nothing more.
                        </p>
                    )}
                    {!loading && history.map((r) => (
                        <Card key={r.id}>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
                                    style={{ background: `${severityColor(r.severity)}20`, color: severityColor(r.severity) }}
                                >
                                    {r.score}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {INSTRUMENTS[r.instrument as ClinicalInstrument]?.title ?? r.instrument}
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] uppercase tracking-wider"
                                            style={{
                                                borderColor: `${severityColor(r.severity)}55`,
                                                color: severityColor(r.severity),
                                            }}
                                        >
                                            {severityLabel(r.severity)}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-[color:var(--color-fg-subtle)]">
                                        {new Date(r.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {instrument && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
                        onClick={close}
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[color:var(--color-bg-card)] sm:rounded-3xl"
                        >
                            <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div
                                            className="text-xs uppercase tracking-[0.22em]"
                                            style={{ color: instrument.accent }}
                                        >
                                            {instrument.subtitle}
                                        </div>
                                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                                            {instrument.title}
                                        </h2>
                                        <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">
                                            {instrument.stem}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={close}>
                                        Close
                                    </Button>
                                </div>

                                <div className="mt-6 space-y-5">
                                    {instrument.items.map((q, idx) => (
                                        <div key={idx} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                                            <div className="text-sm leading-relaxed">
                                                <span className="mr-2 text-[color:var(--color-fg-subtle)]">{idx + 1}.</span>
                                                {q}
                                            </div>
                                            <div className="mt-3 grid gap-1.5 sm:grid-cols-4">
                                                {SCALE.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setAnswer(idx, opt.value)}
                                                        className={cn(
                                                            'rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                                                            answers[idx] === opt.value
                                                                ? ''
                                                                : 'border-white/10 bg-white/[0.02] text-[color:var(--color-fg-muted)] hover:border-white/20',
                                                        )}
                                                        style={
                                                            answers[idx] === opt.value
                                                                ? {
                                                                      borderColor: `${instrument.accent}55`,
                                                                      background: `${instrument.accent}14`,
                                                                      color: instrument.accent,
                                                                  }
                                                                : undefined
                                                        }
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <div className="text-xs text-[color:var(--color-fg-muted)]">
                                        {answeredCount}/{instrument.items.length} answered · current total {total}
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <Link href="/sos" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[color:var(--color-fg-muted)] hover:border-white/20 hover:text-[color:var(--color-fg)]">
                                            <Phone className="h-3.5 w-3.5" />
                                            Crisis help
                                        </Link>
                                        <Button variant="primary" size="md" onClick={submit} disabled={submitting}>
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving…
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Record privately
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
