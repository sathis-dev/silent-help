'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wind,
  BookText,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { resolveEmotion } from '@/lib/emotion-theme';
import {
  createConversation,
  deleteConversation,
  listConversations,
  type ConversationPreview,
} from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const STARTERS = [
  { icon: Wind, text: "I'm feeling overwhelmed. Can we slow down?", accent: '#a78bfa' },
  { icon: Sparkles, text: 'Help me ground myself right now.', accent: '#7dd3fc' },
  { icon: BookText, text: 'Reflect on something I journaled recently.', accent: '#fbbf24' },
  { icon: Leaf, text: 'I want to process a difficult moment.', accent: '#34d399' },
];

export default function ChatIndexPage() {
  const router = useRouter();
  const { user } = useUser();
  const { profile } = useWellness();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const theme = resolveEmotion(profile?.emotionalProfile);

  useEffect(() => {
    listConversations()
      .then((d) => setConversations(d.conversations))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === '1') void startNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNew = async (prompt?: string) => {
    try {
      const { conversation } = await createConversation();
      const target = prompt
        ? `/chat/${conversation.id}?prompt=${encodeURIComponent(prompt)}`
        : `/chat/${conversation.id}`;
      router.push(target);
    } catch (e) {
      toast.error('Could not start conversation', { description: (e as Error).message });
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast.success('Conversation removed');
    } catch (e) {
      toast.error('Could not remove', { description: (e as Error).message });
    }
  };

  const filtered = conversations.filter(
    (c) =>
      !search.trim() ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessage ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 pt-6 sm:px-10 lg:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <aside className="lg:sticky lg:top-[92px] lg:h-[calc(100vh-108px)]">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button variant="primary" size="sm" onClick={() => startNew()}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-fg-subtle)]" />
          <Input
            placeholder="Search threads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="mt-4 space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100%-118px)]">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            : filtered.length === 0
              ? (
                <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
                  No conversations yet. Start the first one.
                </div>
              )
              : filtered.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => router.push(`/chat/${c.id}`)}
                  className="group relative flex w-full items-start gap-3 rounded-[var(--radius-md)] border border-white/[0.05] bg-white/[0.02] p-3 text-left transition-all hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10"
                    style={{ background: `${theme.accent}15`, borderColor: `${theme.accent}30` }}
                  >
                    <MessageSquare className="h-4 w-4" style={{ color: theme.accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[color:var(--color-fg)]">
                      {c.title || 'Untitled'}
                    </div>
                    <div className="truncate text-xs text-[color:var(--color-fg-muted)]">
                      {c.lastMessage || 'No messages yet'}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                      <Clock className="h-3 w-3" />
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(c.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-danger)]" />
                  </button>
                </motion.button>
              ))}
        </div>
      </aside>

      {/* Hero */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.06] p-8 sm:p-12"
          style={{
            background: `linear-gradient(135deg, ${theme.soft}, transparent 70%), rgba(15,23,42,0.45)`,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: theme.gradient }}
          />
          <Badge variant="outline" className="mb-4">
            AI Companion · {profile?.aiPersonality?.tone ?? 'gentle'}
          </Badge>
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            {greet}
            {user?.firstName ? `, ${user.firstName}` : ''}.{' '}
            <span className="font-display italic text-[color:var(--color-fg-muted)]">
              What&apos;s present for you?
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-[color:var(--color-fg-muted)]">
            {profile?.aiPersonality?.openingMessage ??
              'Every conversation is encrypted and stays with you. I&apos;ll match the pace you need.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={() => startNew()}>
              Start a new conversation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {STARTERS.map((s, i) => (
            <motion.button
              key={s.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              onClick={() => startNew(s.text)}
              className={cn(
                'group flex items-start gap-3 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:-translate-y-[1px] hover:border-white/15 hover:bg-white/[0.05]',
              )}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}38` }}
              >
                <s.icon className="h-4 w-4" style={{ color: s.accent }} />
              </div>
              <div className="flex-1">
                <div className="text-sm leading-relaxed text-[color:var(--color-fg)]">{s.text}</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-[color:var(--color-fg-subtle)]">
                  Use this prompt
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
