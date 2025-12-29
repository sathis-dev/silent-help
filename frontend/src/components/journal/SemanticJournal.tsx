"use client";

/**
 * SemanticJournal Component
 * 
 * The heart of the LOW pathway.
 * Features subtle AI reflection and pattern connections.
 * 
 * "You felt similar 3 days ago after the 'Work' trigger. 
 *  You used 'Box Breathing' then and felt better in 4 minutes. 
 *  Try it again?"
 */

import { useState, useCallback, useEffect } from 'react';
import { createJournalEntry, quickSafetyCheck } from '@/lib/api';
import { triggerHaptic, triggerSuccessHaptic } from '@/lib/haptics';
import type { PatternInsight } from '@/lib/types';

interface SemanticJournalProps {
  userId: string;
  onSafetyTriggered?: () => void;
  onComplete?: () => void;
  initialMood?: string;
  className?: string;
}

const MOOD_OPTIONS = [
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😊', label: 'Content', value: 'content' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤔', label: 'Unsure', value: 'unsure' },
];

const TRIGGER_OPTIONS = [
  'Work', 'Family', 'Health', 'Finances', 'Relationships', 
  'Sleep', 'Social', 'News', 'Other', 'Not sure'
];

const PROMPTS = [
  'What is on your mind right now?',
  'How has your day been?',
  'What are you feeling in this moment?',
  'Is there something you need to process?',
  'Take a moment to write freely...',
];

export function SemanticJournal({
  userId,
  onSafetyTriggered,
  onComplete,
  initialMood,
  className = '',
}: SemanticJournalProps) {
  const [step, setStep] = useState<'mood' | 'write' | 'trigger' | 'complete'>('mood');
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood || null);
  const [content, setContent] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  // Check content for safety as user types (debounced)
  useEffect(() => {
    if (content.length < 20) return;

    const timeout = setTimeout(async () => {
      const result = await quickSafetyCheck(content);
      if (!result.safe && result.action === 'kill_session') {
        onSafetyTriggered?.();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content, onSafetyTriggered]);

  const handleMoodSelect = useCallback((mood: string) => {
    triggerHaptic('light');
    setSelectedMood(mood);
    setStep('write');
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMood || !content.trim()) return;

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const result = await createJournalEntry(userId, content, {
        moodSnapshot: selectedMood,
        pathway: 'LOW',
        triggerCategory: selectedTrigger || undefined,
      });

      if (result.success) {
        triggerSuccessHaptic();
        setConnectionMessage(result.connection || null);
        setStep('complete');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, selectedMood, content, selectedTrigger]);

  const handleTriggerSelect = useCallback((trigger: string) => {
    triggerHaptic('light');
    setSelectedTrigger(trigger);
  }, []);

  // Mood Selection Step
  if (step === 'mood') {
    return (
      <div className={`flex flex-col ${className}`}>
        <h2 className="text-xl font-medium text-[--text] mb-2 text-center">
          How are you feeling?
        </h2>
        <p className="text-sm text-[--text-muted] mb-6 text-center">
          Start by naming your emotion
        </p>

        <div className="grid grid-cols-4 gap-3">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`
                flex flex-col items-center justify-center
                p-4 rounded-2xl transition-all
                ${selectedMood === mood.value 
                  ? 'bg-[--primary] text-[--on-primary]' 
                  : 'bg-[--surface-2] hover:bg-[--border]'}
              `}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Writing Step
  if (step === 'write') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">
            {MOOD_OPTIONS.find(m => m.value === selectedMood)?.emoji}
          </span>
          <span className="text-[--text-muted]">
            Feeling {selectedMood}
          </span>
        </div>

        <p className="text-lg text-[--text] mb-4">{prompt}</p>

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing here..."
          className="
            w-full min-h-[200px] p-4 rounded-2xl
            bg-[--surface-2] text-[--text]
            placeholder:text-[--text-muted]
            border border-[--border] focus:border-[--primary]
            focus:outline-none focus:ring-2 focus:ring-[--focus]
            resize-none
          "
          autoFocus
        />

        <p className="text-xs text-[--text-muted] mt-2 text-right">
          {content.split(/\s+/).filter(w => w).length} words
        </p>

        {/* Trigger Selection */}
        <div className="mt-4">
          <p className="text-sm text-[--text-muted] mb-2">
            Related to... (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_OPTIONS.map((trigger) => (
              <button
                key={trigger}
                onClick={() => handleTriggerSelect(trigger)}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-colors
                  ${selectedTrigger === trigger
                    ? 'bg-[--primary] text-[--on-primary]'
                    : 'bg-[--surface-2] text-[--text] hover:bg-[--border]'}
                `}
              >
                {trigger}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setStep('mood')}
            className="
              px-4 py-3 rounded-xl
              text-[--text-muted] bg-[--surface-2]
              hover:bg-[--border] transition-colors
            "
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="
              flex-1 px-4 py-3 rounded-xl font-medium
              text-[--on-primary] bg-[--primary]
              hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    );
  }

  // Complete Step
  if (step === 'complete') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-medium text-[--text] mb-2">
          Entry Saved
        </h2>

        {/* Connection Message - The "connect, don't summarize" feature */}
        {connectionMessage && (
          <div className="
            w-full max-w-sm p-4 rounded-2xl
            bg-[--surface-2] border border-[--border]
            text-left mb-6
          ">
            <p className="text-sm text-[--primary] font-medium mb-1">
              Pattern noticed
            </p>
            <p className="text-[--text] leading-relaxed">
              {connectionMessage}
            </p>
          </div>
        )}

        {!connectionMessage && (
          <p className="text-[--text-muted] mb-6 max-w-sm">
            Your thoughts have been safely saved. Patterns will become visible as you journal over time.
          </p>
        )}

        <button
          onClick={() => onComplete?.()}
          className="px-6 py-3 bg-[--primary] text-[--on-primary] rounded-xl font-medium"
        >
          Continue
        </button>
      </div>
    );
  }

  return null;
}

/**
 * PatternInsightCard Component
 * 
 * Displays an insight discovered through semantic search.
 * Grounded, calm tone - connects rather than just summarizes.
 */
interface PatternInsightCardProps {
  insight: PatternInsight;
  onAction?: (suggestion: string) => void;
  className?: string;
}

export function PatternInsightCard({
  insight,
  onAction,
  className = '',
}: PatternInsightCardProps) {
  const typeIcons: Record<string, string> = {
    trigger_pattern: '🎯',
    tool_effectiveness: '✓',
    time_pattern: '🕐',
    emotional_cycle: '🔄',
  };

  const typeColors: Record<string, string> = {
    trigger_pattern: '#F59E0B',
    tool_effectiveness: '#10B981',
    time_pattern: '#3B82F6',
    emotional_cycle: '#8B5CF6',
  };

  return (
    <div 
      className={`
        p-4 rounded-2xl
        bg-[--surface-2] border border-[--border]
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div 
          className="
            w-10 h-10 rounded-full
            flex items-center justify-center text-xl
          "
          style={{ backgroundColor: `${typeColors[insight.type]}20` }}
        >
          {typeIcons[insight.type]}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-[--text] mb-1">
            {insight.title}
          </h3>
          <p className="text-sm text-[--text-muted] leading-relaxed">
            {insight.description}
          </p>
          
          {insight.actionSuggestion && (
            <button
              onClick={() => onAction?.(insight.actionSuggestion!)}
              className="
                mt-3 text-sm font-medium
                text-[--primary] hover:underline
              "
            >
              {insight.actionSuggestion}
            </button>
          )}

          {insight.historicalData?.recoveryTime && (
            <p className="mt-2 text-xs text-[--text-muted]">
              Last time: {Math.round(insight.historicalData.recoveryTime / 60)} minutes to feel better
            </p>
          )}
        </div>
      </div>

      {/* Confidence indicator */}
      <div className="mt-3 pt-3 border-t border-[--border]">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-[--border] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${insight.confidence * 100}%`,
                backgroundColor: typeColors[insight.type],
              }}
            />
          </div>
          <span className="text-xs text-[--text-muted]">
            {Math.round(insight.confidence * 100)}% confidence
          </span>
        </div>
      </div>
    </div>
  );
}
