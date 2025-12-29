"use client";

/**
 * PathwaySelector Component
 * 
 * Initial screen for users to self-select their current state.
 * Based on user research - simple, clear, no cognitive load.
 */

import { useCallback } from 'react';
import { triggerHaptic } from '@/lib/haptics';
import type { StressPathway } from '@/lib/types';

interface PathwaySelectorProps {
  onSelect: (pathway: StressPathway) => void;
  className?: string;
}

const pathwayOptions = [
  {
    pathway: 'HIGH' as StressPathway,
    emoji: '🆘',
    title: 'I need help now',
    subtitle: 'Crisis support and resources',
    color: '#EF4444',
    bgGradient: 'from-red-500 to-red-600',
  },
  {
    pathway: 'MID' as StressPathway,
    emoji: '😮‍💨',
    title: 'I feel overwhelmed',
    subtitle: 'Grounding and calming tools',
    color: '#F59E0B',
    bgGradient: 'from-amber-500 to-orange-500',
  },
  {
    pathway: 'LOW' as StressPathway,
    emoji: '😌',
    title: 'I want to reflect',
    subtitle: 'Journaling and patterns',
    color: '#10B981',
    bgGradient: 'from-emerald-500 to-teal-500',
  },
];

export function PathwaySelector({
  onSelect,
  className = '',
}: PathwaySelectorProps) {
  const handleSelect = useCallback((pathway: StressPathway) => {
    triggerHaptic(pathway === 'HIGH' ? 'heavy' : 'medium');
    onSelect(pathway);
  }, [onSelect]);

  return (
    <div className={`flex flex-col min-h-screen p-4 ${className}`}>
      {/* Header */}
      <div className="text-center pt-8 pb-12">
        <h1 className="text-3xl font-semibold text-[--text]">
          Silent Help
        </h1>
        <p className="text-[--text-muted] mt-2">
          How are you feeling right now?
        </p>
      </div>

      {/* Pathway Options */}
      <div className="flex-1 flex flex-col justify-center gap-4">
        {pathwayOptions.map((option) => (
          <button
            key={option.pathway}
            onClick={() => handleSelect(option.pathway)}
            className={`
              w-full p-6 rounded-2xl
              bg-gradient-to-r ${option.bgGradient}
              text-white text-left
              transform transition-all duration-200
              hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-4 focus:ring-offset-2
              min-h-[100px]
            `}
            style={{ 
              '--tw-ring-color': option.color,
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{option.emoji}</span>
              <div>
                <h2 className="text-xl font-medium">{option.title}</h2>
                <p className="text-sm opacity-90">{option.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Privacy Note */}
      <div className="pt-8 pb-4 text-center">
        <p className="text-xs text-[--text-muted]">
          Your data stays private. Encrypted and never shared.
        </p>
      </div>
    </div>
  );
}
