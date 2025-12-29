'use client';

/**
 * Silent Help - Transition Step
 * "Building your sanctuary..." - Final reveal animation
 * 
 * Features:
 * - Particle coalescence effect
 * - Profile building visualization
 * - Smooth transition to home
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../OnboardingProvider';

// ============================================================================
// Colors
// ============================================================================

const COLORS = {
  lavender: {
    primary: '#B4A7D6',
    soft: '#D8D0E8',
    glow: 'rgba(180, 167, 214, 0.25)',
  },
  mint: {
    primary: '#7FDBCA',
    soft: '#B8F0E4',
    glow: 'rgba(127, 219, 202, 0.25)',
  },
};

// ============================================================================
// Transition Stages
// ============================================================================

const STAGES = [
  { id: 'analyzing', message: 'Understanding you...', icon: '🔮', duration: 1500 },
  { id: 'building', message: 'Building your sanctuary...', icon: '✨', duration: 2000 },
  { id: 'personalizing', message: 'Personalizing your space...', icon: '🎨', duration: 1500 },
  { id: 'ready', message: 'Your sanctuary is ready', icon: '🌙', duration: 1000 },
];

// ============================================================================
// Component
// ============================================================================

export function TransitionStep() {
  const { session, completeOnboarding } = useOnboarding();
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [userName, setUserName] = useState('friend');
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  // Get user name from session
  useEffect(() => {
    if (session.userName) {
      setUserName(session.userName);
    } else if (session.userPreferences.displayName) {
      setUserName(session.userPreferences.displayName);
    }
  }, [session]);

  // Progress through stages
  useEffect(() => {
    if (currentStage >= STAGES.length) {
      setIsComplete(true);
      return;
    }

    const stage = STAGES[currentStage];
    const timer = setTimeout(() => {
      setCurrentStage(prev => prev + 1);
    }, stage.duration);

    return () => clearTimeout(timer);
  }, [currentStage]);

  // Complete onboarding when stages are done
  useEffect(() => {
    if (isComplete) {
      setShowFinalMessage(true);
      
      // Delay before completing
      const timer = setTimeout(async () => {
        await completeOnboarding();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, completeOnboarding]);

  const stage = STAGES[currentStage] || STAGES[STAGES.length - 1];
  const progress = Math.min((currentStage / STAGES.length) * 100, 100);

  return (
    <div className="space-y-12 text-center">
      {/* Central animation */}
      <div className="relative h-48 flex items-center justify-center">
        {/* Particle background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Orbiting particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: i % 2 === 0 ? COLORS.lavender.primary : COLORS.mint.primary,
              }}
              animate={{
                x: [
                  Math.cos((i / 12) * Math.PI * 2) * (isComplete ? 0 : 80),
                  Math.cos(((i + 6) / 12) * Math.PI * 2) * (isComplete ? 0 : 80),
                ],
                y: [
                  Math.sin((i / 12) * Math.PI * 2) * (isComplete ? 0 : 80),
                  Math.sin(((i + 6) / 12) * Math.PI * 2) * (isComplete ? 0 : 80),
                ],
                scale: isComplete ? [1, 0] : [0.5, 1, 0.5],
                opacity: isComplete ? [1, 0] : [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: isComplete ? 0.5 : 3,
                repeat: isComplete ? 0 : Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Central orb */}
        <motion.div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)',
            border: `1px solid ${COLORS.lavender.primary}30`,
          }}
          animate={{
            scale: isComplete ? [1, 1.1, 1] : [1, 1.05, 1],
            boxShadow: isComplete
              ? [`0 0 60px ${COLORS.mint.glow}`, `0 0 100px ${COLORS.mint.glow}`]
              : [
                  `0 0 40px ${COLORS.lavender.glow}`,
                  `0 0 70px ${COLORS.lavender.glow}`,
                  `0 0 40px ${COLORS.lavender.glow}`,
                ],
          }}
          transition={{
            duration: isComplete ? 0.6 : 2,
            repeat: isComplete ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Stage icon */}
          <AnimatePresence mode="wait">
            <motion.span
              key={stage.id}
              className="text-5xl"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              {stage.icon}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Progress ring */}
        <svg
          className="absolute w-40 h-40"
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={`url(#progressGradient)`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={289}
            initial={{ strokeDashoffset: 289 }}
            animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={COLORS.lavender.primary} />
              <stop offset="100%" stopColor={COLORS.mint.primary} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stage message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showFinalMessage ? 'final' : stage.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {showFinalMessage ? (
            <>
              <h2 
                className="text-3xl font-light"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.lavender.soft} 0%, ${COLORS.mint.soft} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                I'll remember you, {userName}
              </h2>
              <p className="text-slate-400 text-lg">
                Your space is ready
              </p>
            </>
          ) : (
            <>
              <h2 
                className="text-2xl font-light"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.lavender.soft} 0%, ${COLORS.mint.soft} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stage.message}
              </h2>
              
              {/* Progress bar */}
              <div className="w-48 mx-auto h-1 rounded-full overflow-hidden bg-slate-800">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.lavender.primary} 0%, ${COLORS.mint.primary} 100%)`,
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Supportive message */}
      <motion.p
        className="text-slate-500 text-sm max-w-xs mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: showFinalMessage ? 1 : 0 }}
      >
        This sanctuary adapts to you. It learns what helps and when.
      </motion.p>
    </div>
  );
}

export default TransitionStep;
