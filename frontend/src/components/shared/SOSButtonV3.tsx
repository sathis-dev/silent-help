'use client';

/**
 * SOSButton - Emergency Button with Hold Protection
 * SANCTUARY V3 SPEC - Critical Safety Component
 * 
 * Features:
 * - Hold for 2 seconds to activate (prevents accidents)
 * - Visual progress indicator during hold
 * - Haptic feedback on completion
 * - Always visible and accessible
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Phone } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SOSButtonProps {
  onActivate?: () => void;
  holdDuration?: number; // in milliseconds
  className?: string;
  variant?: 'fixed' | 'inline';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HOLD_DURATION_DEFAULT = 2000; // 2 seconds

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SOSButton: React.FC<SOSButtonProps> = ({
  onActivate,
  holdDuration = HOLD_DURATION_DEFAULT,
  className = '',
  variant = 'fixed',
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateProgressRef = useRef<() => void>(() => {});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update the ref with the current function implementation
  useEffect(() => {
    updateProgressRef.current = () => {
      if (!holdStartRef.current) return;

      const elapsed = Date.now() - holdStartRef.current;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgressRef.current);
      } else {
        // Activation complete!
        setIsActivated(true);
        setIsHolding(false);
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        // Trigger callback
        onActivate?.();

        // Reset after a moment
        timeoutRef.current = setTimeout(() => {
          setIsActivated(false);
          setProgress(0);
        }, 2000);
      }
    };
  }, [holdDuration, onActivate]);

  // Start hold
  const handlePointerDown = useCallback(() => {
    if (isActivated) return;
    
    setIsHolding(true);
    setProgress(0);
    holdStartRef.current = Date.now();
    
    // Light haptic on start
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    animationFrameRef.current = requestAnimationFrame(updateProgressRef.current);
  }, [isActivated]);

  // End hold (before completion)
  const handlePointerUp = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    holdStartRef.current = null;
    setIsHolding(false);
    setProgress(0);
  }, []);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handlePointerDown();
      }
    },
    [handlePointerDown]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handlePointerUp();
      }
    },
    [handlePointerUp]
  );

  const positionClasses = variant === 'fixed'
    ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50'
    : '';

  return (
    <motion.button
      className={`
        relative flex flex-col items-center gap-1
        px-6 py-3 rounded-full
        touch-56 focus-ring select-none
        ${positionClasses}
        ${className}
      `}
      style={{
        background: isActivated
          ? 'rgba(239, 68, 68, 0.4)'
          : isHolding
          ? 'rgba(239, 68, 68, 0.25)'
          : 'rgba(239, 68, 68, 0.15)',
        border: '1px solid',
        borderColor: isActivated
          ? 'rgba(239, 68, 68, 0.7)'
          : isHolding
          ? 'rgba(239, 68, 68, 0.5)'
          : 'rgba(239, 68, 68, 0.3)',
        boxShadow: isHolding || isActivated
          ? '0 0 40px rgba(239, 68, 68, 0.4)'
          : '0 0 20px rgba(239, 68, 68, 0.2)',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Emergency SOS. Hold for 2 seconds to activate."
    >
      {/* Progress bar */}
      <motion.div
        className="absolute left-0 bottom-0 h-[3px] rounded-full bg-red-500"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.05 }}
      />

      {/* Button content */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={
            isHolding
              ? { scale: [1, 1.2, 1] }
              : isActivated
              ? { scale: 1.2 }
              : { scale: 1 }
          }
          transition={{
            duration: isHolding ? 0.5 : 0.2,
            repeat: isHolding ? Infinity : 0,
          }}
        >
          {isActivated ? (
            <Phone size={20} className="text-red-400" />
          ) : (
            <Heart
              size={20}
              className="text-red-400"
              fill={isHolding ? '#f87171' : 'none'}
            />
          )}
        </motion.div>
        
        <span className="text-red-300 font-medium text-sm">
          {isActivated ? 'Connecting...' : isHolding ? 'Hold...' : 'SOS'}
        </span>
      </div>

      {/* Hint text */}
      <AnimatePresence>
        {!isHolding && !isActivated && (
          <motion.span
            className="text-[10px] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Hold 2s for emergency
          </motion.span>
        )}
      </AnimatePresence>

      {/* Activated message */}
      <AnimatePresence>
        {isActivated && (
          <motion.span
            className="text-[10px] text-red-400"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Crisis resources loading...
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SOSButton;
