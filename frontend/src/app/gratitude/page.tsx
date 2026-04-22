'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
    listGratitude,
    createGratitude,
    type GratitudeEntry,
} from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const PROMPTS = [
    'A small thing that softened today.',
    'Something you are quietly proud of.',
    'Someone who made the day bearable.',
    'A body that carried you.',
    'A moment that did not ask anything of you.',
];

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function GratitudePage() {
    const [entries, setEntries] = useState<GratitudeEntry[]>([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');
    const [promptIdx, setPromptIdx] = useState(0);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await listGratitude();
                if (!active) return;
                setEntries(res.entries);
                setStreak(res.streak);
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

    const handleSave = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const res = await createGratitude(content.trim());
            setEntries((prev) => [res.entry, ...prev]);
            setStreak(res.streak);
            setContent('');
            toast.success('Held', { description: 'A small, real thing. Thank you for noticing it.' });
        } catch (err) {
            console.error(err);
            toast.error('Could not save right now');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-6 pt-6 sm:px-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Badge variant="outline" className="mb-3">
                    <Heart className="h-3.5 w-3.5" />
                    Gratitude
                </Badge>
                <h1 className="text-balance text-4xl font-semibold tracking-tight">
                    Small, real things{' '}
                    <span className="font-display italic text-[color:var(--color-fg-muted)]">
                        — the ones your mind forgets first.
                    </span>
                </h1>
                <p className="mt-2 max-w-xl text-[color:var(--color-fg-muted)]">
                    Not a happiness trick. A quiet practice: name one thing that worked, once a day.
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
                    style={{ boxShadow: '0 20px 60px -40px rgba(251,191,36,0.4)' }}
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }}
                    />
                    <CardContent className="relative p-6 sm:p-8">
                        <div className="mb-3 flex items-center justify-between text-xs text-[color:var(--color-fg-subtle)]">
                            <button
                                onClick={() => setPromptIdx((i) => (i + 1) % PROMPTS.length)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] transition-colors hover:border-white/20 hover:text-[color:var(--color-fg-muted)]"
                            >
                                <Sparkles className="h-3 w-3" />
                                Prompt · tap for another
                            </button>
                            <span className="inline-flex items-center gap-1.5 text-[color:var(--color-fg-muted)]">
                                <Flame className="h-3.5 w-3.5 text-[#fbbf24]" />
                                {streak}-day streak
                            </span>
                        </div>
                        <div className="mb-4 font-display text-lg italic text-[color:var(--color-fg-muted)]">
                            “{PROMPTS[promptIdx]}”
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="One small thing. It doesn't have to be big."
                            rows={3}
                            className="w-full resize-y rounded-2xl border border-white/[0.08] bg-[color:var(--color-bg)] px-5 py-4 text-base leading-relaxed outline-none transition-colors placeholder:text-[color:var(--color-fg-subtle)] focus:border-white/20"
                        />
                        <div className="mt-4 flex items-center justify-end">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSave}
                                disabled={!content.trim() || saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Holding…
                                    </>
                                ) : (
                                    <>
                                        <Heart className="h-4 w-4" />
                                        Hold this
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="mt-10">
                <h2 className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
                    Past notes
                </h2>
                <div className="mt-4 space-y-3">
                    {loading && (
                        <>
                            <Skeleton className="h-20 w-full rounded-2xl" />
                            <Skeleton className="h-20 w-full rounded-2xl" />
                        </>
                    )}
                    {!loading && entries.length === 0 && (
                        <p className="text-sm text-[color:var(--color-fg-muted)]">
                            Nothing yet. One small thing is enough to begin.
                        </p>
                    )}
                    {!loading && entries.map((e) => (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card>
                                <CardContent className="p-5">
                                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                                        {formatDate(e.createdAt)}
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed">{e.content}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
