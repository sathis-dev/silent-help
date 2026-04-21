'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BookText,
  Flame,
  Heart,
  LifeBuoy,
  MessageSquare,
  Play,
  Sparkles,
  Wind,
} from 'lucide-react';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveEmotion } from '@/lib/emotion-theme';
import {
  createConversation,
  getMoodHistory,
  getWeeklyDigest,
  getDailyAffirmation,
  listJournalEntries,
  logMood,
  suggestCoachAction,
  type CoachSuggestion,
  type MoodLog,
  type JournalEntry,
  type WeeklyDigest,
} from '@/lib/api';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';

const MOOD_OPTIONS = [
  { key: 'calm', label: 'Calm', emoji: '🕊️', intensity: 3 },
  { key: 'content', label: 'Content', emoji: '🌿', intensity: 4 },
  { key: 'joyful', label: 'Joyful', emoji: '✨', intensity: 5 },
  { key: 'anxious', label: 'Anxious', emoji: '🌀', intensity: 2 },
  { key: 'sad', label: 'Sad', emoji: '💧', intensity: 2 },
  { key: 'frustrated', label: 'Frustrated', emoji: '🔥', intensity: 2 },
  { key: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊', intensity: 1 },
  { key: 'tired', label: 'Tired', emoji: '🌙', intensity: 2 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Gentle night';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { profile, isLoading, loadProfile } = useWellness();
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [submittingMood, setSubmittingMood] = useState(false);
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [digestLoading, setDigestLoading] = useState(true);
  const [coach, setCoach] = useState<CoachSuggestion | null>(null);
  const [coachLoading, setCoachLoading] = useState(true);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadProfile().then((p) => {
      if (!p && typeof window !== 'undefined') {
        router.replace('/onboarding');
      }
    });
    Promise.all([
      getMoodHistory().catch(() => ({ logs: [] as MoodLog[] })),
      listJournalEntries().catch(() => ({ entries: [] as JournalEntry[] })),
    ]).then(([m, j]) => {
      setMoodLogs(m.logs ?? []);
      setEntries(j.entries ?? []);
    });
    // Weekly digest + coach are best-effort; backend returns graceful fallbacks.
    getWeeklyDigest()
      .then((r) => setDigest(r.digest))
      .catch(() => setDigest(null))
      .finally(() => setDigestLoading(false));
    suggestCoachAction()
      .then((r) => setCoach(r.suggestion))
      .catch(() => setCoach(null))
      .finally(() => setCoachLoading(false));
    getDailyAffirmation()
      .then((r) => setAffirmation(r.affirmation))
      .catch(() => setAffirmation(null));
  }, [loadProfile, router]);

  const theme = resolveEmotion(profile?.emotionalProfile);
  const firstName = user?.firstName || user?.username || 'friend';

  const moodSeries = useMemo(() => buildMoodSeries(moodLogs), [moodLogs]);
  const streak = useMemo(() => computeStreak(entries, moodLogs), [entries, moodLogs]);

  const handleLogMood = async (key: string, intensity: number) => {
    setSubmittingMood(true);
    try {
      const res = await logMood(key, intensity);
      setMoodLogs((prev) => [res.moodLog, ...prev]);
      toast.success('Mood logged', { description: 'Thanks for checking in.' });
    } catch (e) {
      toast.error('Could not save mood', { description: (e as Error).message });
    } finally {
      setSubmittingMood(false);
    }
  };

  const startChat = async () => {
    try {
      const { conversation } = await createConversation();
      router.push(`/chat/${conversation.id}`);
    } catch (e) {
      toast.error('Could not start conversation', { description: (e as Error).message });
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-10">
      {/* Greeting row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <div className="text-sm text-[color:var(--color-fg-muted)]">{greeting()},</div>
          <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {firstName}.{' '}
            <span className="font-display italic text-[color:var(--color-fg-muted)]">
              {affirmation ?? profile?.affirmation ?? "Today's intention is softness."}
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="md" onClick={() => router.push('/journal')}>
            <BookText className="h-4 w-4" />
            Journal
          </Button>
          <Button variant="primary" size="md" onClick={startChat}>
            <MessageSquare className="h-4 w-4" />
            Talk to AI companion
          </Button>
        </div>
      </motion.div>

      {/* Bento grid */}
      <div className="mt-8 grid gap-5 lg:grid-cols-6 lg:grid-rows-[auto_auto_auto]">
        {/* Primary tool spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="lg:col-span-4 lg:row-span-2"
        >
          <div
            className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.06] p-8"
            style={{
              background: `linear-gradient(135deg, ${theme.soft}, transparent 60%), rgba(15,23,42,0.45)`,
              boxShadow: `0 20px 60px -20px ${theme.glow}`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-50 blur-3xl"
              style={{ background: theme.gradient }}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="gap-1.5"
                  style={{ color: theme.accent, borderColor: `${theme.accent}55` }}
                >
                  <span className="text-base leading-none">{theme.icon}</span>
                  {theme.label} pathway
                </Badge>
                <h2 className="mt-4 max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  {profile?.primaryTool?.name ?? 'Box Breathing'}
                </h2>
                <p className="mt-2 max-w-xl text-[color:var(--color-fg-muted)]">
                  {profile?.primaryTool?.description ??
                    'A short, deterministic calm ritual designed for your current state.'}
                </p>
              </div>
              <button
                onClick={() => router.push('/tools')}
                aria-label="Open all tools"
                className="rounded-full border border-white/10 bg-white/[0.04] p-2.5 text-[color:var(--color-fg-muted)] transition-all hover:border-white/25 hover:bg-white/[0.08] hover:text-[color:var(--color-fg)]"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-auto flex flex-wrap items-center gap-4 pt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/tools')}
                className="shadow-lg"
              >
                <Play className="h-4 w-4" />
                Start session · {profile?.primaryTool?.duration ?? 3} min
              </Button>
              <div className="flex flex-wrap gap-2">
                {(profile?.tools ?? []).slice(0, 3).map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[color:var(--color-fg-muted)]"
                  >
                    <span>{t.icon}</span> {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                    Streak
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-5xl italic">{streak.current}</span>
                    <span className="text-sm text-[color:var(--color-fg-muted)]">days</span>
                  </div>
                </div>
                <Flame className="h-5 w-5 text-amber-300" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => {
                  const active = i < Math.min(7, streak.current);
                  return (
                    <div
                      key={i}
                      className="h-8 flex-1 rounded-md transition-all"
                      style={{
                        background: active ? theme.gradient : 'rgba(255,255,255,0.04)',
                        boxShadow: active ? `0 0 12px -2px ${theme.glow}` : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-[color:var(--color-fg-muted)]">
                Longest streak · {streak.longest} days
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                    Last 14 days
                  </div>
                  <CardTitle className="mt-1.5">Mood trend</CardTitle>
                </div>
                <Heart className="h-5 w-5" style={{ color: theme.accent }} />
              </div>
            </CardHeader>
            <CardContent className="-mx-3">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodSeries}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={theme.accent} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#6b7792' }}
                      stroke="transparent"
                      interval="preserveStartEnd"
                    />
                    <YAxis hide domain={[0, 5]} />
                    <RechartsTooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                      contentStyle={{
                        background: 'rgba(16,24,39,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={theme.accent}
                      strokeWidth={2}
                      fill="url(#moodGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood logger */}
        <motion.div
          id="mood"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                Right now
              </div>
              <CardTitle>How are you feeling?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleLogMood(m.key, m.intensity)}
                    disabled={submittingMood}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] py-3 text-xs text-[color:var(--color-fg-muted)] transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-[color:var(--color-fg)] disabled:opacity-50"
                  >
                    <span className="text-xl transition-transform group-hover:scale-110">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="lg:col-span-3"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                Quick actions
              </div>
              <CardTitle>Calm, now</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <QuickAction
                icon={Wind}
                label="Box breathing"
                sub="3 min · 4-4-4-4"
                accent={theme.accent}
                onClick={() => router.push('/tools?activity=breathing')}
              />
              <QuickAction
                icon={Sparkles}
                label="Grounding 5-4-3-2-1"
                sub="2 min · sensory reset"
                accent={theme.accent}
                onClick={() => router.push('/tools?activity=grounding')}
              />
              <QuickAction
                icon={BookText}
                label="Journal prompt"
                sub={profile?.journalPrompt?.slice(0, 36) ?? 'Write what is true'}
                accent={theme.accent}
                onClick={() => router.push('/journal?compose=1')}
              />
              <QuickAction
                icon={LifeBuoy}
                label="Crisis SOS"
                sub="999 · 111 · Samaritans"
                accent="#fb7185"
                onClick={() => router.push('/sos')}
                danger
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* This week in your words — AI-written weekly digest */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="lg:col-span-4"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                <Sparkles className="h-3.5 w-3.5" />
                This week in your words
              </div>
              <CardTitle className="font-display italic">
                {digestLoading ? 'Gathering the week…' : digest?.period ?? 'Your weekly reflection'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {digestLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  <p className="text-[15px] leading-relaxed text-[color:var(--color-fg)]">
                    {digest?.summary ??
                      'Write a few entries this week and I will reflect them back to you gently.'}
                  </p>
                  {digest?.themes && digest.themes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {digest.themes.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[color:var(--color-fg-muted)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {digest?.highlights && digest.highlights.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-[color:var(--color-fg-muted)]">
                      {digest.highlights.slice(0, 3).map((h, i) => (
                        <li key={i} className="flex gap-2">
                          <span style={{ color: theme.accent }}>·</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {digest?.nudge && (
                    <p className="mt-auto text-sm italic text-[color:var(--color-fg-muted)]">
                      {digest.nudge}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* What might help — adaptive coach */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                <Heart className="h-3.5 w-3.5" />
                What might help
              </div>
              <CardTitle>
                {coachLoading ? 'Thinking…' : coach?.title ?? 'A three-minute reset'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {coachLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                    {coach?.body ?? 'Try a slow box breath — four in, four hold, four out, four hold. Three rounds.'}
                  </p>
                  {coach?.rationale && (
                    <p
                      className="text-[11px] uppercase tracking-[0.18em]"
                      style={{ color: theme.accent }}
                    >
                      {coach.rationale}
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => router.push(coach?.toolId ? `/tools?tool=${coach.toolId}` : '/tools')}
                    className="mt-auto"
                  >
                    Try it · {coach?.durationMinutes ?? 3} min
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Insight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-6"
        >
          <Card>
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI insight
                </div>
                <p className="mt-2 text-lg leading-relaxed text-[color:var(--color-fg)]">
                  {profile?.aiInsight ??
                    'Noticing the quiet is itself a practice. Keep checking in — the data sketches a gentler pattern than the feeling does.'}
                </p>
              </div>
              <Button variant="secondary" size="lg" onClick={startChat}>
                Continue the thread
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  sub,
  onClick,
  accent,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  onClick: () => void;
  accent: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-left transition-all hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: danger ? 'rgba(251,113,133,0.12)' : `${accent}18`,
          border: `1px solid ${danger ? 'rgba(251,113,133,0.28)' : `${accent}38`}`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: danger ? '#fb7185' : accent }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">{label}</div>
        <div className="truncate text-xs text-[color:var(--color-fg-muted)]">{sub}</div>
      </div>
      <ArrowRight className="h-4 w-4 translate-x-0 text-[color:var(--color-fg-subtle)] transition-all group-hover:translate-x-1 group-hover:text-[color:var(--color-fg)]" />
    </button>
  );
}

/* ---------- helpers ---------- */

function buildMoodSeries(logs: MoodLog[]) {
  const now = new Date();
  const days: { label: string; value: number | null; date: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.createdAt.slice(0, 10) === key);
    const avg =
      dayLogs.length > 0
        ? dayLogs.reduce((a, b) => a + b.intensity, 0) / dayLogs.length
        : null;
    days.push({
      label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
      value: avg ?? 2.5,
      date: key,
    });
  }
  return days as { label: string; value: number; date: string }[];
}

function computeStreak(entries: JournalEntry[], logs: MoodLog[]) {
  const dates = new Set<string>();
  entries.forEach((e) => dates.add(e.createdAt.slice(0, 10)));
  logs.forEach((l) => dates.add(l.createdAt.slice(0, 10)));

  let current = 0;
  const now = new Date();
  while (true) {
    const key = new Date(now.getTime() - current * 86400000).toISOString().slice(0, 10);
    if (dates.has(key)) current++;
    else break;
    if (current > 365) break;
  }

  const sorted = [...dates].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    const cur = new Date(d);
    if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = cur;
  }
  return { current, longest };
}
