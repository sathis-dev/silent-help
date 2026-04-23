'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookText,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Search,
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  listJournalEntries,
  createJournalEntry,
  getJournalInsight,
  searchJournal,
  detectDistortions,
  type JournalEntry,
  type JournalSearchHit,
  type DistortionResponse,
} from '@/lib/api';
import { recordActivity } from '@/lib/streak';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { detectDistortionsOnDevice, preloadOnDeviceAi } from '@/lib/on-device-ai';
import { CBT_TO_SERVER, CBT_REFRAMES } from '@/lib/ai-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

const MOODS = [
  { emoji: '😔', label: 'Sad', color: '#818cf8' },
  { emoji: '😰', label: 'Anxious', color: '#38bdf8' },
  { emoji: '😐', label: 'Neutral', color: '#94a3b8' },
  { emoji: '🙂', label: 'Okay', color: '#2dd4bf' },
  { emoji: '😊', label: 'Good', color: '#a3e635' },
  { emoji: '😄', label: 'Great', color: '#fcd34d' },
];

const PROMPTS = [
  'What is quietly asking for your attention right now?',
  'What would you tell a friend who felt what you feel?',
  'Name one small thing that worked today.',
  'Where in your body is this showing up?',
];

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [distortions, setDistortions] = useState<DistortionResponse | null>(null);
  const [distortionsLoading, setDistortionsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<JournalSearchHit[] | null>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);

  const { isListening, transcript, startListening, stopListening, isSupported: isMicSupported } =
    useSpeechRecognition();
  const contentBeforeDictation = useRef('');

  useEffect(() => {
    if (isListening && transcript) {
      const prefix = contentBeforeDictation.current;
      const needsSpace = prefix && !prefix.endsWith(' ') && !prefix.endsWith('\n');
      setContent((prefix + (needsSpace ? ' ' : '') + transcript).trimStart());
    }
  }, [transcript, isListening]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listJournalEntries();
        if (active) setEntries(data.entries);
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
      const data = await createJournalEntry(content, selectedMood || undefined);
      setEntries((prev) => [data.entry, ...prev]);
      setContent('');
      setSelectedMood(null);
      recordActivity();
      toast.success('Entry saved', { description: 'A quiet win. Come back anytime.' });
    } catch (err) {
      console.error(err);
      toast.error('Could not save entry');
    } finally {
      setSaving(false);
    }
  };

  const loadInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await getJournalInsight();
      setInsight(res.insight);
    } catch (err) {
      console.error(err);
      toast.error('Insight unavailable right now');
    } finally {
      setInsightLoading(false);
    }
  };

  const analyseDistortions = async () => {
    const trimmed = content.trim();
    if (trimmed.length < 10) {
      toast('Write a little more first', { description: 'I need a few sentences to read the shape of your thoughts.' });
      return;
    }
    setDistortionsLoading(true);
    // Tier 1: try fully on-device first — private AI, text never leaves the browser.
    try {
      const local = await detectDistortionsOnDevice(trimmed, (pct, msg) => {
        if (pct > 0 && pct < 100) {
          toast.loading(`Downloading private AI · ${pct}%`, { id: 'ondevice-load', description: msg });
        } else if (pct >= 100) {
          toast.dismiss('ondevice-load');
        }
      });
      toast.dismiss('ondevice-load');
      const mapped = local.hits.map((h) => {
        const label = CBT_TO_SERVER[h.label];
        return {
          label,
          evidence: trimmed.slice(0, 160),
          reframe: CBT_REFRAMES[label],
        };
      });
      setDistortions({
        summary:
          mapped.length > 0
            ? 'A few familiar thought patterns came through — analysed privately on your device.'
            : 'Nothing strong stood out. That can be a quiet kind of okay.',
        distortions: mapped,
        provider: 'on-device',
        degraded: false,
      });
      setDistortionsLoading(false);
      return;
    } catch (e) {
      toast.dismiss('ondevice-load');
      console.warn('on-device CBT unavailable, falling back to server', e);
    }

    // Tier 2: server (self-hosted local MNLI → cloud LLM → heuristic).
    try {
      const res = await detectDistortions(trimmed);
      setDistortions(res);
    } catch (err) {
      console.error(err);
      toast.error('CBT analysis unavailable right now');
    } finally {
      setDistortionsLoading(false);
    }
  };

  // Warm the on-device model on idle so the first click is fast.
  useEffect(() => {
    preloadOnDeviceAi();
  }, []);

  const filtered = useMemo(() => {
    if (semanticResults) {
      return semanticResults.map((r) => ({
        id: r.id,
        content: r.content,
        mood: r.mood,
        createdAt: r.createdAt,
      })) as JournalEntry[];
    }
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.content.toLowerCase().includes(q) || (e.mood ?? '').toLowerCase().includes(q),
    );
  }, [entries, query, semanticResults]);

  const runSemanticSearch = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSemanticLoading(true);
    try {
      const { results } = await searchJournal(q, 10);
      setSemanticResults(results);
      if (results.length === 0) {
        toast('No semantically similar entries yet', { description: 'Keep writing — I will learn your patterns.' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Search unavailable right now');
    } finally {
      setSemanticLoading(false);
    }
  };

  const clearSemantic = () => {
    setSemanticResults(null);
    setQuery('');
  };

  const moodInfo = MOODS.find((m) => m.label === selectedMood);
  const accent = moodInfo?.color ?? '#7dd3fc';

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-6 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="mb-3">
          <BookText className="h-3.5 w-3.5" />
          Private journal
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight">
          Let it out{' '}
          <span className="font-display italic text-[color:var(--color-fg-muted)]">
            — softly, onto the page.
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-[color:var(--color-fg-muted)]">
          Nothing is saved anywhere public. Stream of consciousness is fine. No one is grading this.
        </p>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-8"
      >
        <Card
          className="relative overflow-hidden"
          style={{ boxShadow: `0 20px 60px -40px ${accent}70` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-30 blur-3xl"
            style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
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
              <span>{wordCount} words</span>
            </div>
            <div className="mb-4 font-display text-lg italic text-[color:var(--color-fg-muted)]">
              “{PROMPTS[promptIdx]}”
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start here. No one is reading over your shoulder…"
              rows={6}
              className={cn(
                'w-full resize-y rounded-2xl border bg-[color:var(--color-bg)] px-5 py-4 text-base leading-relaxed outline-none transition-colors placeholder:text-[color:var(--color-fg-subtle)]',
                isListening
                  ? 'border-[color:var(--color-danger)] ring-2 ring-[color:var(--color-danger)]/30'
                  : 'border-white/[0.08] focus:border-white/20',
              )}
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => {
                  const selected = selectedMood === m.label;
                  return (
                    <button
                      key={m.label}
                      onClick={() => setSelectedMood(selected ? null : m.label)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                        selected
                          ? 'scale-[1.03]'
                          : 'border-white/10 bg-white/[0.02] text-[color:var(--color-fg-muted)] hover:border-white/20 hover:text-[color:var(--color-fg)]',
                      )}
                      style={
                        selected
                          ? {
                              borderColor: m.color,
                              background: `${m.color}14`,
                              color: m.color,
                              boxShadow: `0 0 0 3px ${m.color}10`,
                            }
                          : undefined
                      }
                    >
                      <span>{m.emoji}</span>
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {isMicSupported && (
                  <Button
                    variant={isListening ? 'danger' : 'ghost'}
                    size="icon"
                    title={isListening ? 'Stop dictating' : 'Dictate'}
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        contentBeforeDictation.current = content;
                        startListening();
                      }
                    }}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={analyseDistortions}
                  disabled={distortionsLoading || content.trim().length < 10}
                  title="Let a CBT lens gently check for distorted thinking patterns"
                >
                  {distortionsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reading…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Check thoughts
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSave}
                  disabled={!content.trim() || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Save entry
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI insight card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6"
      >
        <Card
          className="relative overflow-hidden"
          style={{ boxShadow: `0 20px 60px -40px #a78bfa70` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight">Weekly reflection</h3>
                    <p className="text-xs text-[color:var(--color-fg-subtle)]">
                      A private, semantic pattern across your last entries.
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={loadInsight} disabled={insightLoading}>
                    {insightLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Reading…
                      </>
                    ) : insight ? (
                      'Refresh'
                    ) : (
                      'Reveal insight'
                    )}
                  </Button>
                </div>
                <AnimatePresence>
                  {insight && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]"
                    >
                      {insight}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CBT distortion detector result */}
      <AnimatePresence>
        {distortions && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <Card className="relative overflow-hidden" style={{ boxShadow: '0 20px 60px -40px #7dd3fc70' }}>
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, #7dd3fc, transparent 70%)' }}
              />
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(125,211,252,0.15)', color: '#7dd3fc' }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight">A gentle CBT check</h3>
                        <p className="text-xs text-[color:var(--color-fg-subtle)]">
                          Not a diagnosis — just a kinder angle on the thoughts underneath.
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setDistortions(null)}>
                        Dismiss
                      </Button>
                    </div>
                    {(distortions.provider === 'on-device' || distortions.provider === 'local') && (
                      <div
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-200/90"
                        title={
                          distortions.provider === 'on-device'
                            ? 'This analysis ran entirely in your browser. Your words did not leave your device.'
                            : 'This analysis ran on our own servers — no third-party AI vendor saw your words.'
                        }
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                        />
                        {distortions.provider === 'on-device' ? 'Private · on your device' : 'Private · self-hosted'}
                      </div>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                      {distortions.summary}
                    </p>
                    {distortions.degraded && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200/90">
                        <span className="mt-[2px]">⚠</span>
                        <span>
                          {distortions.degradedReason === 'ai_unavailable'
                            ? 'The AI companion is briefly resting — I fell back to a simpler keyword-based reading. Results are lighter than usual.'
                            : 'I had trouble reading this through the full AI lens just now, so I\'m showing a simpler keyword-based reading. Try again in a moment for a deeper pass.'}
                        </span>
                      </div>
                    )}
                    {distortions.distortions.length === 0 ? (
                      <p className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
                        {distortions.degraded
                          ? 'Nothing jumped out through the simpler reading — the full AI check may find more.'
                          : 'No strong distortion patterns detected. Keep writing — clarity often comes slowly.'}
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {distortions.distortions.map((d, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                          >
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                              {d.label.replace(/_/g, ' ')}
                            </Badge>
                            <p className="mt-2 text-xs text-[color:var(--color-fg-subtle)]">
                              You wrote: <span className="italic">“{d.evidence}”</span>
                            </p>
                            <p className="mt-2 text-sm leading-relaxed">{d.reframe}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-fg-subtle)]">
            Past entries
          </h2>
          <span className="text-xs text-[color:var(--color-fg-subtle)]">
            {loading ? '…' : `${entries.length} total`}
          </span>
          <div className="ml-auto flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-subtle)]" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (semanticResults) setSemanticResults(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSemanticSearch();
                }}
                placeholder="Search text, or press Enter for meaning"
                className="pl-9"
              />
            </div>
            {semanticResults ? (
              <Button variant="ghost" size="sm" onClick={clearSemantic}>
                Clear
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={runSemanticSearch} disabled={semanticLoading || query.trim().length < 2}>
                {semanticLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Meaning
              </Button>
            )}
          </div>
        </div>
        {semanticResults && (
          <p className="mt-2 text-xs text-[color:var(--color-fg-subtle)]">
            Showing {semanticResults.length} semantic matches for <span className="italic">“{query}”</span>, ranked by similarity.
          </p>
        )}

        <div className="mt-5 space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}

          {!loading && filtered.length === 0 && (
            <Card className="p-10 text-center">
              <CardContent className="p-0">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
                  <CalendarIcon className="h-5 w-5 text-[color:var(--color-fg-muted)]" />
                </div>
                <p className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
                  {query ? 'No entries match that search.' : 'Your first entry will live here.'}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading &&
            filtered.map((entry, i) => {
              const mood = MOODS.find((m) => m.label === entry.mood);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.02 * i }}
                >
                  <Card className="group transition-colors hover:border-white/15">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {mood && (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                              style={{
                                background: `${mood.color}14`,
                                border: `1px solid ${mood.color}40`,
                              }}
                            >
                              {mood.emoji}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium tracking-tight">
                              {formatDateLong(entry.createdAt)}
                            </div>
                            <div className="text-xs text-[color:var(--color-fg-subtle)]">
                              {formatTime(entry.createdAt)}
                              {entry.mood ? <> · <span style={{ color: mood?.color }}>{entry.mood}</span></> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                        {entry.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
