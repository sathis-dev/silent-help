'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  LifeBuoy,
  MessageCircleHeart,
  Mic,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import {
  getConversation,
  sendMessage,
  type ChatCitation,
  type ChatLocaleInfo,
  type ChatPersona,
  type ChatProactiveNudge,
  type ChatProvider,
  type ChatToolInvocation,
  type CrisisInfo,
  type GroundingAction,
  type Message,
} from '@/lib/api';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useOnDeviceDictation } from '@/hooks/useOnDeviceDictation';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { resolveEmotion } from '@/lib/emotion-theme';
import { cn } from '@/lib/cn';

interface AssistantMeta {
  persona?: ChatPersona;
  citations?: ChatCitation[];
  crisis?: { severity: string; source: string; matchedKeywords: string[] } | null;
  suggestions?: string[];
  groundingActions?: GroundingAction[];
  provider?: ChatProvider;
  model?: string | null;
  toolInvocations?: ChatToolInvocation[];
  locale?: ChatLocaleInfo;
  qualityIssues?: string[];
}

const TOOL_ICON: Record<ChatToolInvocation['tool'], string> = {
  search_journal: 'journal',
  get_mood_trend: 'mood',
  recall_safety_plan: 'safety plan',
  suggest_grounding_tool: 'tool',
  recommend_clinical_checkin: 'clinical',
};

const PROVIDER_LABEL: Record<ChatProvider, { label: string; tone: 'private' | 'cloud' | 'warn' }> = {
  local: { label: 'Private · self-hosted', tone: 'private' },
  gemini: { label: 'Via Gemini', tone: 'cloud' },
  openai: { label: 'Via OpenAI', tone: 'cloud' },
  fallback: { label: 'Offline fallback', tone: 'warn' },
};

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { profile } = useWellness();
  const baseTheme = resolveEmotion(profile?.emotionalProfile);

  const [messages, setMessages] = useState<Message[]>([]);
  const [metaByMessageId, setMetaByMessageId] = useState<Record<string, AssistantMeta>>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [liveMeta, setLiveMeta] = useState<AssistantMeta | null>(null);
  const [latestPersona, setLatestPersona] = useState<ChatPersona | null>(null);
  const [crisisBanner, setCrisisBanner] = useState<CrisisInfo | null>(null);
  const [latestSuggestions, setLatestSuggestions] = useState<string[]>([]);
  const [latestGrounding, setLatestGrounding] = useState<GroundingAction[]>([]);
  const [liveProvider, setLiveProvider] = useState<ChatProvider | null>(null);
  const [liveNudges, setLiveNudges] = useState<ChatProactiveNudge[]>([]);
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const liveProviderRef = useRef<ChatProvider | null>(null);
  const qualityIssuesRef = useRef<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoPromptRef = useRef(false);
  const streamingContentRef = useRef('');
  const liveMetaRef = useRef<AssistantMeta | null>(null);

  const accent = latestPersona?.accent ?? baseTheme.accent;
  const theme = { ...baseTheme, accent };

  // Web Speech API (Google-backed on Chrome) — legacy voice-in path.
  const {
    isListening: browserIsListening,
    transcript: browserTranscript,
    startListening: browserStart,
    stopListening: browserStop,
    isSupported: browserMicSupported,
  } = useSpeechRecognition();

  // On-device Whisper (Phase E) — audio never leaves the browser tab.
  const dictation = useOnDeviceDictation();

  const useOnDevice = dictation.isSupported;
  const isListening = useOnDevice ? dictation.isListening : browserIsListening;
  const isTranscribing = useOnDevice && dictation.isTranscribing;
  const isMicSupported = useOnDevice || browserMicSupported;

  const handleMicClick = useCallback(() => {
    if (useOnDevice) {
      if (dictation.isListening) {
        void dictation.stopListening();
      } else {
        void dictation.startListening();
      }
    } else if (browserIsListening) {
      browserStop();
    } else {
      browserStart();
    }
  }, [useOnDevice, dictation, browserIsListening, browserStart, browserStop]);

  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    isSupported: isVoiceSupported,
  } = useSpeechSynthesis();

  // Transcript pipe — whichever source is active writes into the composer.
  useEffect(() => {
    if (useOnDevice) {
      if (dictation.transcript) setInput(dictation.transcript);
    } else if (browserIsListening && browserTranscript) {
      setInput(browserTranscript);
    }
  }, [useOnDevice, dictation.transcript, browserIsListening, browserTranscript]);

  const loadConversation = useCallback(async () => {
    try {
      const data = await getConversation(id);
      setMessages(data.conversation.messages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, latestSuggestions]);

  const doSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;
      setInput('');
      setIsSending(true);
      setStreamingContent('');
      setLiveMeta(null);
      setLatestSuggestions([]);
      setLatestGrounding([]);
      setCrisisBanner(null);
      setLiveProvider(null);
      liveProviderRef.current = null;

      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

      streamingContentRef.current = '';
      liveMetaRef.current = null;

      setLiveNudges([]);
      qualityIssuesRef.current = [];
      setQualityIssues([]);

      await sendMessage(id, text, {
        onMeta: (meta) => {
          const nextMeta: AssistantMeta = {
            persona: meta.persona,
            citations: meta.citations,
            crisis: meta.crisis,
            toolInvocations: meta.toolInvocations,
            locale: meta.locale,
          };
          liveMetaRef.current = nextMeta;
          setLiveMeta(nextMeta);
          setLatestPersona(meta.persona);
          if (meta.proactiveNudges) setLiveNudges(meta.proactiveNudges);
        },
        onProviderMeta: (pm) => {
          liveProviderRef.current = pm.provider;
          setLiveProvider(pm.provider);
        },
        onChunk: (chunk) => {
          streamingContentRef.current += chunk;
          setStreamingContent(streamingContentRef.current);
        },
        onQualityPatch: (patch) => {
          const issues = patch.issues ?? [];
          qualityIssuesRef.current = issues;
          setQualityIssues(issues);
        },
        onDone: (data) => {
          const finalMsg = streamingContentRef.current;
          const assistantId = data.messageId || `msg-${Date.now()}`;
          const assistantMsg: Message = {
            id: assistantId,
            role: 'assistant',
            content: finalMsg,
            createdAt: new Date().toISOString(),
          };
          const snapshotMeta = liveMetaRef.current;
          const provider = data.provider ?? liveProviderRef.current ?? undefined;
          setMessages((msgs) =>
            msgs.some((m) => m.id === assistantId) ? msgs : [...msgs, assistantMsg],
          );
          setMetaByMessageId((m) =>
            m[assistantId]
              ? m
              : {
                  ...m,
                  [assistantId]: {
                    persona: snapshotMeta?.persona,
                    citations: snapshotMeta?.citations ?? [],
                    crisis: snapshotMeta?.crisis ?? null,
                    suggestions: data.suggestions,
                    groundingActions: data.groundingActions,
                    provider,
                    model: data.model ?? null,
                    toolInvocations: data.toolInvocations ?? snapshotMeta?.toolInvocations ?? [],
                    locale: data.locale ?? snapshotMeta?.locale,
                    qualityIssues: qualityIssuesRef.current,
                  },
                },
          );
          if (autoSpeak && finalMsg) speak(finalMsg);
          streamingContentRef.current = '';
          liveMetaRef.current = null;
          liveProviderRef.current = null;
          setStreamingContent('');
          if (data.crisis) setCrisisBanner(data.crisis);
          setLatestSuggestions(data.suggestions ?? []);
          setLatestGrounding(data.groundingActions ?? []);
          setLiveMeta(null);
          setLiveProvider(null);
          setIsSending(false);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: "I'm sorry, something went wrong. Please try again.",
              createdAt: new Date().toISOString(),
            },
          ]);
          setStreamingContent('');
          setLiveMeta(null);
          setIsSending(false);
        },
      });
    },
    [id, isSending, autoSpeak, speak],
  );

  // Auto-submit prompt from URL once conversation is loaded
  useEffect(() => {
    if (isLoading || autoPromptRef.current) return;
    const prompt = searchParams.get('prompt');
    if (prompt && messages.length === 0) {
      autoPromptRef.current = true;
      void doSend(prompt);
    }
  }, [isLoading, searchParams, messages.length, doSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void doSend(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const initials = (user?.firstName?.[0] ?? user?.username?.[0] ?? 'Y').toUpperCase();

  return (
    <div className="mx-auto flex h-[calc(100vh-76px)] max-w-4xl flex-col px-4 sm:px-8">
      {/* Conversation header */}
      <div className="flex items-center gap-3 py-5">
        <button
          onClick={() => router.push('/chat')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[color:var(--color-fg-muted)] transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-[color:var(--color-fg)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          style={{ background: `${accent}18`, border: `1px solid ${accent}38` }}
        >
          <Sparkles className="h-4 w-4" style={{ color: accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold">AI Companion</h1>
            <Badge variant="outline" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Active
            </Badge>
            {latestPersona && (
              <Badge
                variant="outline"
                className="gap-1.5 border-0"
                style={{
                  background: `${accent}16`,
                  color: accent,
                  borderColor: `${accent}40`,
                }}
              >
                <Brain className="h-3 w-3" />
                {latestPersona.label}
              </Badge>
            )}
          </div>
          <div className="text-xs text-[color:var(--color-fg-muted)]">
            {latestPersona ? `${latestPersona.tone} · ${latestPersona.pace}` : 'attuning to your tone'}
            {' · '}private by design
            {' · '}
            <span title="Silent Help is a wellness companion, not a medical device. It does not diagnose, treat, or monitor any condition.">
              wellness companion, not a medical device
            </span>
          </div>
        </div>
        {isVoiceSupported && (
          <Button
            variant={autoSpeak ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => {
              if (autoSpeak && isSpeaking) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            title={autoSpeak ? 'Reading replies aloud' : 'Enable read-aloud'}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {autoSpeak ? 'Reading' : 'Silent'}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && !isSending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[var(--radius-xl)] border border-white/[0.06] bg-white/[0.02] p-10 text-center"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: theme.gradient, boxShadow: `0 0 40px -8px ${theme.glow}` }}
            >
              <Sparkles className="h-5 w-5 text-slate-950" />
            </div>
            <h2 className="font-display text-2xl italic">Begin when ready.</h2>
            <p className="max-w-md text-sm text-[color:var(--color-fg-muted)]">
              Type or speak — whatever is present for you. Your companion remembers what you’ve shared
              before, shifts its tone to match you, and brings you back to breath if it needs to.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const meta = msg.role === 'assistant' ? metaByMessageId[msg.id] : undefined;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  accent={accent}
                  initials={initials}
                  userImage={user?.imageUrl}
                  meta={meta}
                />
              );
            })}
          </AnimatePresence>

          {/* Streaming bubble (current in-flight response) */}
          {(streamingContent || (isSending && liveMeta)) && (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                createdAt: new Date().toISOString(),
              }}
              accent={accent}
              initials={initials}
              userImage={user?.imageUrl}
              streaming
              meta={liveMeta ?? undefined}
              liveProvider={liveProvider}
            />
          )}

          {isSending && !streamingContent && !liveMeta && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  style={{ background: theme.gradient, color: '#05070d' }}
                  className="text-xs font-semibold"
                >
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-sm border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="loading-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          {/* Adaptive follow-ups + grounding actions (rendered once per completed reply) */}
          {!isSending && (latestSuggestions.length > 0 || latestGrounding.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-11 flex flex-wrap gap-2"
            >
              {latestSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void doSend(s)}
                  className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[color:var(--color-fg-muted)] transition-all hover:border-white/25 hover:bg-white/[0.06] hover:text-[color:var(--color-fg)]"
                  style={{ boxShadow: `inset 0 0 0 1px ${accent}12` }}
                >
                  <MessageCircleHeart
                    className="h-3 w-3 transition-colors"
                    style={{ color: accent }}
                  />
                  {s}
                </button>
              ))}
              {latestGrounding.map((g) => (
                <Link
                  key={g.id}
                  href={g.toolHref}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
                  style={{
                    borderColor: `${accent}40`,
                    background: `${accent}14`,
                    color: accent,
                  }}
                >
                  <Wind className="h-3 w-3" />
                  {g.label}
                </Link>
              ))}
            </motion.div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Crisis banner */}
      <AnimatePresence>
        {crisisBanner && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 flex items-start gap-3 rounded-2xl border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 p-4"
          >
            <LifeBuoy className="mt-0.5 h-5 w-5 text-[color:var(--color-danger)]" />
            <div className="flex-1 text-sm">
              <div className="font-medium text-[color:var(--color-fg)]">
                {crisisBanner.safetyMessage || "It sounds like you're in a tough place."}
              </div>
              <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                Open the SOS screen for local crisis lines. You are not alone in this.
              </div>
            </div>
            <Link href="/sos">
              <Button variant="danger" size="sm">
                Open SOS
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive nudge card (chat v2 — shown once per reply when heuristics fire) */}
      <AnimatePresence>
        {!isSending && liveNudges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
          >
            {liveNudges.map((n, idx) => (
              <div key={`${n.kind}-${idx}`} className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-start gap-2 text-sm text-[color:var(--color-fg)]">
                  <Brain className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
                  <span>{n.message}</span>
                </div>
                {n.actionLabel && n.actionHref && (
                  <Link
                    href={n.actionHref}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all"
                    style={{ borderColor: `${accent}40`, background: `${accent}14`, color: accent }}
                  >
                    {n.actionLabel}
                  </Link>
                )}
              </div>
            ))}
            <div className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-fg-muted)]">
              Based on your own history · manage at <Link className="underline" href="/settings/data">/settings/data</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality-judge disclosure (transparency — shown once per reply when patched) */}
      {qualityIssues.length > 0 && (
        <div className="mb-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
          Safety check adjusted this reply: {qualityIssues.join(', ').replace(/-/g, ' ')}. Our wellness-companion guardrails kicked in.
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 border-t border-white/[0.04] bg-[color:var(--color-bg)]/70 pb-6 pt-3 backdrop-blur-xl">
        <div
          className={cn(
            'relative flex items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-2 transition-all',
            'focus-within:border-white/25 focus-within:bg-white/[0.05]',
          )}
          style={{
            boxShadow: `0 0 0 3px ${accent}15`,
          }}
        >
          {isMicSupported && (
            <button
              onClick={handleMicClick}
              disabled={isTranscribing}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
                isListening
                  ? 'bg-[color:var(--color-danger)] text-white shadow-lg shadow-[color:var(--color-danger)]/30'
                  : isTranscribing
                    ? 'bg-white/[0.06] text-[color:var(--color-fg-muted)]'
                    : 'text-[color:var(--color-fg-muted)] hover:bg-white/[0.06] hover:text-[color:var(--color-fg)]',
              )}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
              title={
                useOnDevice
                  ? isListening
                    ? 'Stop — transcribe on-device'
                    : isTranscribing
                      ? 'Transcribing privately…'
                      : 'Speak — transcribed on your device'
                  : isListening
                    ? 'Stop listening'
                    : 'Speak instead of typing'
              }
            >
              {isListening ? (
                <Square className="h-4 w-4" />
              ) : isTranscribing ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? useOnDevice
                  ? 'Listening · audio stays on your device…'
                  : 'Listening…'
                : isTranscribing
                  ? 'Transcribing privately…'
                  : 'Share what is present for you…'
            }
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-relaxed outline-none placeholder:text-[color:var(--color-fg-subtle)]"
            style={{ maxHeight: 200 }}
          />
          <button
            onClick={() => doSend(input)}
            disabled={!input.trim() || isSending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: input.trim() ? theme.gradient : 'rgba(255,255,255,0.06)',
              color: input.trim() ? '#05070d' : 'var(--color-fg-muted)',
              boxShadow: input.trim() ? `0 6px 20px -6px ${theme.glow}` : 'none',
            }}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
          <span>Enter to send · Shift + Enter for new line</span>
          {isMicSupported && (
            <span className="inline-flex items-center gap-1">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  useOnDevice ? 'bg-emerald-400' : 'bg-amber-400',
                )}
              />
              {useOnDevice ? 'Private · Whisper on-device' : 'Voice via browser API'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Message bubble ───────────────────────── */

function citationIcon(kind: ChatCitation['kind']) {
  if (kind === 'journal') return <BookOpen className="h-3 w-3" />;
  if (kind === 'message') return <MessageCircleHeart className="h-3 w-3" />;
  return <Brain className="h-3 w-3" />;
}

function MessageBubble({
  message,
  accent,
  initials,
  userImage,
  streaming,
  meta,
  liveProvider,
}: {
  message: Message;
  accent: string;
  initials: string;
  userImage?: string;
  streaming?: boolean;
  meta?: AssistantMeta;
  liveProvider?: ChatProvider | null;
}) {
  const isUser = message.role === 'user';
  const citations = meta?.citations ?? [];
  const inlineCrisis = meta?.crisis;
  const provider = meta?.provider ?? (streaming ? liveProvider ?? null : null);
  const providerInfo = provider ? PROVIDER_LABEL[provider] : null;
  const toolInvocations = (meta?.toolInvocations ?? []).filter((t) => t.ok);
  const locale = meta?.locale;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback
            style={{
              background: `linear-gradient(135deg, ${accent}, #a78bfa)`,
              color: '#05070d',
            }}
            className="text-[10px] font-semibold"
          >
            AI
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex max-w-[78%] flex-col gap-2', isUser && 'items-end')}>
        {/* Citation + privacy-tier pills (assistant only, above bubble) */}
        {!isUser && (citations.length > 0 || providerInfo) && (
          <div className="flex flex-wrap gap-1.5">
            {providerInfo && (
              <span
                title={meta?.model ? `model: ${meta.model}` : undefined}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]',
                  providerInfo.tone === 'private'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    : providerInfo.tone === 'warn'
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                      : 'border-white/10 bg-white/[0.03] text-[color:var(--color-fg-muted)]',
                )}
              >
                <Sparkles className="h-3 w-3" />
                {providerInfo.label}
              </span>
            )}
            {citations.map((c) => (
              <span
                key={`${c.kind}-${c.id}`}
                title={c.preview}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)]"
              >
                <span style={{ color: accent }}>{citationIcon(c.kind)}</span>
                {c.label}
              </span>
            ))}
            {locale && locale.language !== 'English' && (
              <span
                title={`Reply language resolved from ${locale.source} → ${locale.tag}`}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-indigo-200"
              >
                <span>{locale.language}</span>
              </span>
            )}
          </div>
        )}

        {/* Tool-use transparency chips (Art 22 — show which of the user's own data we touched) */}
        {!isUser && toolInvocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {toolInvocations.map((t, idx) => (
              <span
                key={`${t.tool}-${idx}`}
                title={`${t.source} · ${t.summary}`}
                className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-cyan-100/80"
              >
                <Brain className="h-3 w-3" style={{ color: accent }} />
                <span>{TOOL_ICON[t.tool]}</span>
                <span className="text-cyan-100/50">·</span>
                <span className="normal-case tracking-normal">{t.summary.replace(/^[a-z ]+·\s*/i, '')}</span>
              </span>
            ))}
          </div>
        )}

        {/* Inline crisis chip (subtle, above bubble) */}
        {!isUser && inlineCrisis && (
          <div
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-danger)]"
          >
            <LifeBuoy className="h-3 w-3" />
            safety resources nearby
          </div>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-sm text-slate-950 shadow-lg'
              : 'rounded-bl-sm border border-white/[0.06] bg-white/[0.03] text-[color:var(--color-fg)]',
          )}
          style={
            isUser
              ? {
                  background: `linear-gradient(135deg, ${accent}, #a78bfa)`,
                  boxShadow: `0 10px 24px -12px ${accent}60`,
                }
              : undefined
          }
        >
          {isUser ? (
            message.content.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  em: ({ children }) => (
                    <em className="italic" style={{ color: accent }}>
                      {children}
                    </em>
                  ),
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  code: ({ children }) => (
                    <code className="rounded bg-white/10 px-1 py-0.5 text-[0.85em]">{children}</code>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="underline" style={{ color: accent }} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content || ' '}
              </ReactMarkdown>
              {streaming && (
                <span
                  className="sh-stream-cursor ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 align-middle"
                  style={{ background: accent }}
                  aria-hidden
                />
              )}
            </div>
          )}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={userImage} alt="" />
          <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}
