'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  LifeBuoy,
  Mic,
  Send,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import {
  getConversation,
  sendMessage,
  type Message,
  type CrisisInfo,
} from '@/lib/api';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { resolveEmotion } from '@/lib/emotion-theme';
import { cn } from '@/lib/cn';

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { profile } = useWellness();
  const theme = resolveEmotion(profile?.emotionalProfile);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [crisis, setCrisis] = useState<CrisisInfo | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoPromptRef = useRef(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isMicSupported,
  } = useSpeechRecognition();
  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    isSupported: isVoiceSupported,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (isListening && transcript) setInput(transcript);
  }, [transcript, isListening]);

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
  }, [messages, streamingContent]);

  const doSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;
      setInput('');
      setIsSending(true);
      setStreamingContent('');
      setCrisis(null);

      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

      await sendMessage(
        id,
        text,
        (chunk) => setStreamingContent((prev) => prev + chunk),
        (data) => {
          setStreamingContent((prev) => {
            const finalMsg = prev;
            const assistantMsg: Message = {
              id: data.messageId || `msg-${Date.now()}`,
              role: 'assistant',
              content: finalMsg,
              createdAt: new Date().toISOString(),
            };
            setMessages((msgs) => [...msgs, assistantMsg]);
            if (autoSpeak) speak(finalMsg);
            return '';
          });
          if (data.crisis) setCrisis(data.crisis);
          setIsSending(false);
        },
        () => {
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
          setIsSending(false);
        },
      );
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
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}38` }}
        >
          <Sparkles className="h-4 w-4" style={{ color: theme.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-semibold">AI Companion</h1>
            <Badge variant="outline" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Active
            </Badge>
          </div>
          <div className="text-xs text-[color:var(--color-fg-muted)]">
            {profile?.aiPersonality?.tone ?? 'gentle'} tone · end-to-end private
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
              Type or dictate — whatever is present for you. There is no right place to start.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                accent={theme.accent}
                initials={initials}
                userImage={user?.imageUrl}
              />
            ))}
          </AnimatePresence>

          {streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                createdAt: new Date().toISOString(),
              }}
              accent={theme.accent}
              initials={initials}
              userImage={user?.imageUrl}
              streaming
            />
          )}

          {isSending && !streamingContent && (
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
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Crisis banner */}
      <AnimatePresence>
        {crisis && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 flex items-start gap-3 rounded-2xl border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 p-4"
          >
            <LifeBuoy className="mt-0.5 h-5 w-5 text-[color:var(--color-danger)]" />
            <div className="flex-1 text-sm">
              <div className="font-medium text-[color:var(--color-fg)]">
                {crisis.safetyMessage || "It sounds like you're in a tough place."}
              </div>
              <div className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                Open the crisis page for immediate UK help lines.
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

      {/* Composer */}
      <div className="sticky bottom-0 border-t border-white/[0.04] bg-[color:var(--color-bg)]/70 pb-6 pt-3 backdrop-blur-xl">
        <div
          className={cn(
            'relative flex items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-2 transition-all',
            'focus-within:border-white/25 focus-within:bg-white/[0.05]',
          )}
          style={{
            boxShadow: `0 0 0 3px ${theme.accent}15`,
          }}
        >
          {isMicSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                isListening
                  ? 'bg-[color:var(--color-danger)] text-white shadow-lg shadow-[color:var(--color-danger)]/30'
                  : 'text-[color:var(--color-fg-muted)] hover:bg-white/[0.06] hover:text-[color:var(--color-fg)]',
              )}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening…' : 'Share what is present for you…'}
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
        <div className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
          Enter to send · Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  accent,
  initials,
  userImage,
  streaming,
}: {
  message: Message;
  accent: string;
  initials: string;
  userImage?: string;
  streaming?: boolean;
}) {
  const isUser = message.role === 'user';

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
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
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
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {line}
            {streaming && i === message.content.split('\n').length - 1 && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-current opacity-70" />
            )}
          </p>
        ))}
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
