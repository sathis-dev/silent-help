"use client";

/**
 * LowPathway Component
 * 
 * Maintenance Mode - Calm, reflective.
 * 
 * Key Features:
 * - Semantic Journal
 * - Pattern recognition across 30 days
 * - Subtle AI reflection
 * - "Connect, don't just summarize"
 */

import { useState, useCallback, useEffect } from 'react';
import { SemanticJournal, PatternInsightCard } from '@/components/journal';
import { BreathingExercise, BREATHING_EXERCISES } from '@/components/breathing';
import { BodyScan } from '@/components/grounding';
import { getPatternInsights } from '@/lib/api';
import { triggerHaptic } from '@/lib/haptics';
import type { PatternInsight } from '@/lib/types';

interface LowPathwayProps {
  userId: string;
  onPathwayChange?: (pathway: 'HIGH' | 'MID' | 'LOW') => void;
  onSafetyTriggered?: () => void;
  className?: string;
}

type LowView = 'main' | 'journal' | 'patterns' | 'breathing' | 'body-check';

export function LowPathway({
  userId,
  onPathwayChange,
  onSafetyTriggered,
  className = '',
}: LowPathwayProps) {
  const [view, setView] = useState<LowView>('main');
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);

  // Load patterns on mount
  useEffect(() => {
    const loadPatterns = async () => {
      setIsLoadingPatterns(true);
      try {
        const insights = await getPatternInsights(userId, 30);
        setPatterns(insights);
      } finally {
        setIsLoadingPatterns(false);
      }
    };

    loadPatterns();
  }, [userId]);

  const handleViewChange = useCallback((newView: LowView) => {
    triggerHaptic('light');
    setView(newView);
  }, []);

  const handleComplete = useCallback(() => {
    setView('main');
  }, []);

  const handlePatternAction = useCallback((suggestion: string) => {
    triggerHaptic('medium');
    // Could trigger specific tools based on suggestion
    if (suggestion.toLowerCase().includes('breathing')) {
      setView('breathing');
    }
  }, []);

  // Main Dashboard View
  if (view === 'main') {
    return (
      <div className={`flex flex-col min-h-screen p-4 ${className}`}>
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[--text]">
            Welcome back
          </h1>
          <p className="text-[--text-muted] mt-1">
            A space for reflection
          </p>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Journal */}
          <button
            onClick={() => handleViewChange('journal')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl 
              bg-gradient-to-br from-[#10B981] to-[#059669]
              text-white min-h-[140px]
              hover:opacity-90 transition-opacity
            "
          >
            <span className="text-4xl mb-2">📝</span>
            <span className="font-medium">Journal</span>
            <span className="text-xs opacity-80 mt-1">Write freely</span>
          </button>

          {/* Patterns */}
          <button
            onClick={() => handleViewChange('patterns')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl 
              bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]
              text-white min-h-[140px]
              hover:opacity-90 transition-opacity
              relative
            "
          >
            <span className="text-4xl mb-2">📊</span>
            <span className="font-medium">My Patterns</span>
            <span className="text-xs opacity-80 mt-1">What helps</span>
            {patterns.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
            )}
          </button>

          {/* Body Check-in */}
          <button
            onClick={() => handleViewChange('body-check')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl bg-[--surface-2]
              border-2 border-transparent
              hover:border-[#F59E0B] transition-colors
              min-h-[120px]
            "
          >
            <span className="text-3xl mb-2">🧘</span>
            <span className="font-medium text-[--text]">Body Check-in</span>
          </button>

          {/* Deep Breathing */}
          <button
            onClick={() => handleViewChange('breathing')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl bg-[--surface-2]
              border-2 border-transparent
              hover:border-[#14B8A6] transition-colors
              min-h-[120px]
            "
          >
            <span className="text-3xl mb-2">🌬️</span>
            <span className="font-medium text-[--text]">Deep Breathing</span>
          </button>
        </div>

        {/* Recent Insight (if available) */}
        {patterns.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-[--text-muted] mb-3">
              Recent insight
            </h2>
            <PatternInsightCard
              insight={patterns[0]}
              onAction={handlePatternAction}
            />
          </div>
        )}

        {/* Quick gratitude */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => handleViewChange('journal')}
            className="
              w-full flex items-center gap-4 p-4 rounded-xl
              bg-[--surface-2] hover:bg-[--border] transition-colors
            "
          >
            <span className="text-2xl">💝</span>
            <div className="text-left">
              <span className="font-medium text-[--text]">Gratitude moment</span>
              <p className="text-xs text-[--text-muted]">Note something positive</p>
            </div>
          </button>
        </div>

        {/* Need more support */}
        <div className="mt-4 text-center">
          <button
            onClick={() => onPathwayChange?.('MID')}
            className="text-sm text-[--text-muted] hover:text-[--text] transition-colors"
          >
            Need some extra support?
          </button>
        </div>
      </div>
    );
  }

  // Journal View
  if (view === 'journal') {
    return (
      <div className={`flex flex-col min-h-screen p-4 ${className}`}>
        <button
          onClick={handleComplete}
          className="self-start mb-4 text-[--text-muted] hover:text-[--text]"
        >
          ← Back
        </button>
        <SemanticJournal
          userId={userId}
          onSafetyTriggered={onSafetyTriggered}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Patterns View
  if (view === 'patterns') {
    return (
      <div className={`flex flex-col min-h-screen p-4 ${className}`}>
        <button
          onClick={handleComplete}
          className="self-start mb-4 text-[--text-muted] hover:text-[--text]"
        >
          ← Back
        </button>

        <h2 className="text-xl font-medium text-[--text] mb-2">
          Your Patterns
        </h2>
        <p className="text-sm text-[--text-muted] mb-6">
          Insights from the last 30 days
        </p>

        {isLoadingPatterns ? (
          <div className="text-center py-12">
            <p className="text-[--text-muted]">Looking for patterns...</p>
          </div>
        ) : patterns.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📔</span>
            <h3 className="text-lg font-medium text-[--text] mb-2">
              Patterns emerge over time
            </h3>
            <p className="text-[--text-muted] max-w-sm mx-auto">
              As you journal and use the tools, we will notice what works best for you
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <PatternInsightCard
                key={index}
                insight={pattern}
                onAction={handlePatternAction}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Breathing View
  if (view === 'breathing') {
    return (
      <div className={`flex flex-col min-h-screen p-4 justify-center ${className}`}>
        <BreathingExercise
          exercise={BREATHING_EXERCISES.relaxation478}
          onComplete={handleComplete}
          onCancel={handleComplete}
        />
      </div>
    );
  }

  // Body Check View
  if (view === 'body-check') {
    return (
      <div className={`flex flex-col min-h-screen p-4 justify-center ${className}`}>
        <BodyScan
          onComplete={handleComplete}
          onCancel={handleComplete}
        />
      </div>
    );
  }

  return null;
}
