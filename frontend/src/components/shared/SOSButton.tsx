"use client";

/**
 * SOSButton Component
 * 
 * Always-visible emergency button.
 * Provides one-tap access to HIGH pathway regardless of current state.
 * Uses Fitts's Law - large, visible, easy to hit.
 */

import { useCallback } from 'react';
import { triggerSOSHaptic } from '@/lib/haptics';

interface SOSButtonProps {
  onActivate: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'bottom-right': 'right-4 bottom-4',
  'bottom-left': 'left-4 bottom-4',
  'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
};

export function SOSButton({
  onActivate,
  position = 'bottom-right',
  className = '',
}: SOSButtonProps) {
  const handleClick = useCallback(() => {
    triggerSOSHaptic();
    onActivate();
  }, [onActivate]);

  return (
    <button
      onClick={handleClick}
      className={`
        fixed z-50
        w-16 h-16 rounded-full
        bg-[#EF4444] text-white
        flex items-center justify-center
        shadow-lg shadow-red-500/30
        hover:bg-[#DC2626] active:bg-[#B91C1C]
        transition-all duration-150
        focus:outline-none focus:ring-4 focus:ring-red-500/50
        active:scale-95
        ${positionClasses[position]}
        ${className}
      `}
      aria-label="Emergency SOS - Get immediate support"
    >
      <span className="text-lg font-bold">SOS</span>
    </button>
  );
}
