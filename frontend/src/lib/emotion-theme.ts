export type EmotionKey = 'overwhelmed' | 'anxious' | 'frustrated' | 'sad' | 'pressure';

export interface EmotionTheme {
  key: EmotionKey;
  label: string;
  icon: string;
  accent: string;
  accent2: string;
  gradient: string;
  glow: string;
  soft: string;
  ring: string;
  tint: string;
}

export const EMOTION_THEMES: Record<EmotionKey, EmotionTheme> = {
  overwhelmed: {
    key: 'overwhelmed',
    label: 'Overwhelmed',
    icon: '🌊',
    accent: '#a78bfa',
    accent2: '#818cf8',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
    glow: 'rgba(167, 139, 250, 0.32)',
    soft: 'rgba(167, 139, 250, 0.14)',
    ring: 'rgba(167, 139, 250, 0.4)',
    tint: 'rgba(167, 139, 250, 0.08)',
  },
  anxious: {
    key: 'anxious',
    label: 'Anxious',
    icon: '🧠',
    accent: '#38bdf8',
    accent2: '#7dd3fc',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%)',
    glow: 'rgba(56, 189, 248, 0.32)',
    soft: 'rgba(56, 189, 248, 0.14)',
    ring: 'rgba(56, 189, 248, 0.4)',
    tint: 'rgba(56, 189, 248, 0.08)',
  },
  frustrated: {
    key: 'frustrated',
    label: 'Frustrated',
    icon: '🔥',
    accent: '#fb7185',
    accent2: '#f97316',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f97316 100%)',
    glow: 'rgba(251, 113, 133, 0.32)',
    soft: 'rgba(251, 113, 133, 0.14)',
    ring: 'rgba(251, 113, 133, 0.4)',
    tint: 'rgba(251, 113, 133, 0.08)',
  },
  sad: {
    key: 'sad',
    label: 'Sad',
    icon: '💧',
    accent: '#818cf8',
    accent2: '#a78bfa',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%)',
    glow: 'rgba(129, 140, 248, 0.32)',
    soft: 'rgba(129, 140, 248, 0.14)',
    ring: 'rgba(129, 140, 248, 0.4)',
    tint: 'rgba(129, 140, 248, 0.08)',
  },
  pressure: {
    key: 'pressure',
    label: 'Pressure',
    icon: '⚡',
    accent: '#2dd4bf',
    accent2: '#34d399',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)',
    glow: 'rgba(45, 212, 191, 0.32)',
    soft: 'rgba(45, 212, 191, 0.14)',
    ring: 'rgba(45, 212, 191, 0.4)',
    tint: 'rgba(45, 212, 191, 0.08)',
  },
};

export const DEFAULT_EMOTION: EmotionKey = 'anxious';

export function resolveEmotion(input?: string | null): EmotionTheme {
  if (!input) return EMOTION_THEMES[DEFAULT_EMOTION];
  const normalized = input.toLowerCase() as EmotionKey;
  return EMOTION_THEMES[normalized] ?? EMOTION_THEMES[DEFAULT_EMOTION];
}

export function emotionCssVars(theme: EmotionTheme): React.CSSProperties {
  return {
    ['--accent' as string]: theme.accent,
    ['--accent-2' as string]: theme.accent2,
    ['--accent-soft' as string]: theme.soft,
    ['--accent-glow' as string]: theme.glow,
    ['--accent-tint' as string]: theme.tint,
  };
}
