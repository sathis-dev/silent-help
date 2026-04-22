'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Brain,
  Compass,
  Download,
  Flame,
  HeartPulse,
  LogOut,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteAccount,
  deleteMemory,
  exportAccountUrl,
  getAuthToken,
  getMoodHistory,
  getWellnessProfile,
  listConversations,
  listMemories,
  type ConversationPreview,
  type Memory,
  type MoodLog,
  type WellnessProfile,
} from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<WellnessProfile | null>(null);
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [sessions, setSessions] = useState<ConversationPreview[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMemories = async () => {
    setMemoriesLoading(true);
    try {
      const { memories } = await listMemories();
      setMemories(memories);
    } catch (e) {
      console.error(e);
    } finally {
      setMemoriesLoading(false);
    }
  };

  const handleForget = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success('Memory forgotten');
    } catch (e) {
      toast.error('Could not forget memory', { description: (e as Error).message });
    }
  };

  const handleExport = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(exportAccountUrl(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'silent-help-export.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (e) {
      toast.error('Export unavailable', { description: (e as Error).message });
    }
  };

  const handleDeleteAccount = async () => {
    const ok = typeof window !== 'undefined' && window.confirm(
      'This will permanently delete your account and all data within 30 days. Continue?',
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await deleteAccount();
      toast.success('Account marked for deletion', { description: res.note });
    } catch (e) {
      toast.error('Could not process deletion', { description: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, m, s] = await Promise.all([
          getWellnessProfile(),
          getMoodHistory(),
          listConversations(),
        ]);
        if (!active) return;
        if (p.hasProfile) setProfile(p.profile);
        setMoods(m.logs || []);
        setSessions(s.conversations || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const moodChart = useMemo(
    () =>
      [...moods]
        .reverse()
        .map((m) => ({
          label: new Date(m.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
          value: m.intensity,
          mood: m.mood,
        })),
    [moods],
  );

  const initials = (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '');

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pt-6 sm:px-10">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-64 rounded-full" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-6 sm:px-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #7dd3fc33, transparent 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #a78bfa33, transparent 70%)' }}
          />
          <CardContent className="relative flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 text-2xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(125,211,252,0.2), rgba(167,139,250,0.2))',
              }}
            >
              {initials || <UserRound className="h-8 w-8" />}
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
                Silent Help profile
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}` : 'Guest'}
              </h1>
              <p className="text-sm text-[color:var(--color-fg-muted)]">
                {user?.emailAddresses[0]?.emailAddress ?? 'Private guest session'}
              </p>
              {profile?.archetype && (
                <Badge variant="outline" className="mt-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  Archetype · {profile.archetype}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => router.push('/onboarding')}>
                <RefreshCw className="h-4 w-4" />
                Re-assess
              </Button>
              <SignOutButton>
                <Button variant="danger" size="sm">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="wellness">
          <TabsList>
            <TabsTrigger value="wellness">
              <HeartPulse className="mr-2 h-4 w-4" /> Wellness
            </TabsTrigger>
            <TabsTrigger value="mood">
              <Flame className="mr-2 h-4 w-4" /> Mood
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <MessageCircle className="mr-2 h-4 w-4" /> Sessions
            </TabsTrigger>
            <TabsTrigger value="privacy" onClick={loadMemories}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wellness" className="mt-6 space-y-5">
            {profile ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold tracking-tight">Core state</h3>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <Stat label="Energy" value={profile.answers.energy} />
                        <Stat label="Primary emotion" value={profile.emotionalProfile ?? '—'} />
                        <Stat label="Support style" value={profile.answers.support_style} />
                        <Stat label="Stress level" value={profile.stressLevel} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold tracking-tight">Primary tool</h3>
                      <div className="mt-3 text-xl font-semibold tracking-tight">
                        {profile.primaryTool.name}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                        {profile.primaryTool.description}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--color-fg-subtle)]">
                        <Compass className="h-4 w-4" />
                        {profile.primaryTool.duration} min · {profile.primaryTool.category}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                      <Sparkles className="h-4 w-4 text-[color:var(--color-accent)]" />
                      AI insight
                    </h3>
                    <p className="mt-3 border-l-2 border-white/10 pl-4 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                      {profile.aiInsight}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-10 text-center">
                <CardContent className="p-0">
                  <Compass className="mx-auto h-8 w-8 text-[color:var(--color-fg-muted)]" />
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">No assessment yet</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-[color:var(--color-fg-muted)]">
                    A 3-minute flow to personalise your pathway.
                  </p>
                  <Button
                    className="mt-5"
                    variant="primary"
                    onClick={() => router.push('/onboarding')}
                  >
                    Start assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mood" className="mt-6 space-y-5">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold tracking-tight">Intensity over time</h3>
                {moods.length === 0 ? (
                  <p className="mt-4 text-sm text-[color:var(--color-fg-muted)]">
                    Log your mood from the dashboard to see trends here.
                  </p>
                ) : (
                  <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodChart}>
                        <defs>
                          <linearGradient id="profileMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          domain={[1, 5]}
                        />
                        <RTooltip
                          contentStyle={{
                            background: 'rgba(15,23,42,0.95)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12,
                            color: '#f5f7fb',
                          }}
                          itemStyle={{ color: '#7dd3fc' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#7dd3fc"
                          strokeWidth={2}
                          fill="url(#profileMood)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {moods.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold tracking-tight">Recent logs</h3>
                  <div className="mt-4 space-y-2">
                    {moods.slice(0, 10).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
                      >
                        <div className="text-[color:var(--color-fg-muted)]">
                          {formatDateShort(m.createdAt)}
                        </div>
                        <div className="font-medium capitalize">{m.mood}</div>
                        <div className="text-xs text-[color:var(--color-fg-subtle)]">
                          intensity {m.intensity}/5
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold tracking-tight">AI conversations</h3>
                {sessions.length === 0 ? (
                  <p className="mt-4 text-sm text-[color:var(--color-fg-muted)]">
                    No conversations yet. Start one from the dashboard when you are ready.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => router.push(`/chat/${s.id}`)}
                        className="flex w-full items-start justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                      >
                        <div>
                          <div className="text-sm font-medium">{s.title || 'Untitled conversation'}</div>
                          <div className="line-clamp-1 text-xs text-[color:var(--color-fg-muted)]">
                            {s.lastMessage || '—'}
                          </div>
                        </div>
                        <div className="shrink-0 text-xs text-[color:var(--color-fg-subtle)]">
                          {formatDateShort(s.updatedAt)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6 space-y-5">
            <Card>
              <CardContent className="p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Brain className="h-4 w-4 text-[color:var(--color-accent)]" />
                  Memories the AI holds
                </h3>
                <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                  Small notes the companion keeps so it can remember you gently. You can forget any of them, any time.
                </p>
                <div className="mt-4 space-y-2">
                  {memoriesLoading && <Skeleton className="h-16 w-full rounded-xl" />}
                  {!memoriesLoading && memories.length === 0 && (
                    <p className="text-sm text-[color:var(--color-fg-muted)]">
                      Nothing is remembered yet.
                    </p>
                  )}
                  {!memoriesLoading && memories.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            {m.kind}
                          </Badge>
                          <span className="text-[11px] text-[color:var(--color-fg-subtle)]">
                            {formatDateShort(m.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed">{m.content}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleForget(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Forget
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--color-accent)]" />
                  Your data, your call
                </h3>
                <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                  Journal entries are encrypted at rest. You can take a full copy with you, or erase everything.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" size="md" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export my data (JSON)
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleDeleteAccount} disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Scheduling…' : 'Delete my account'}
                  </Button>
                </div>
                <p className="mt-3 text-[11px] text-[color:var(--color-fg-subtle)]">
                  Deletion is soft for 30 days so you can undo. After that it is permanent.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium capitalize">{value || '—'}</div>
    </div>
  );
}
