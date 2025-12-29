'use client';

/**
 * Silent Help - Welcome Step
 * "The First Touch" - Initial greeting with breathing animation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingProvider';

// ============================================================================
// Colors
// ============================================================================

const COLORS = {
  lavender: {
    primary: '#B4A7D6',
    soft: '#D8D0E8',
  },
  mint: {
    primary: '#7FDBCA',
    soft: '#B8F0E4',
  },
};

// ============================================================================
// Component
// ============================================================================

export function WelcomeStep() {
  const { nextStep, submitResponse } = useOnboarding();
  const [showButton, setShowButton] = useState(false);
  const [interactionStart] = useState(Date.now());

  // Delay button appearance for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    submitResponse({
      stepId: 'welcome',
      value: 'started',
      interactionTime: Date.now() - interactionStart,
      hesitationCount: 0,
      confidence: 1,
    });
    nextStep();
  };

  return (
    <div className="text-center space-y-12">
      {/* Logo / Icon */}
      <motion.div
        className="relative mx-auto"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 w-32 h-32 mx-auto rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${COLORS.lavender.soft}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Main icon container */}
        <motion.div
          className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)',
            border: `1px solid ${COLORS.lavender.primary}30`,
            boxShadow: `0 0 60px ${COLORS.lavender.primary}15`,
          }}
          animate={{
            boxShadow: [
              `0 0 60px ${COLORS.lavender.primary}15`,
              `0 0 80px ${COLORS.lavender.primary}25`,
              `0 0 60px ${COLORS.lavender.primary}15`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Breathing wave */}
          <svg 
            className="w-16 h-16"
            viewBox="0 0 100 40"
            fill="none"
          >
            <motion.path
              d="M0,20 Q25,5 50,20 Q75,35 100,20"
              stroke={COLORS.lavender.primary}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  "M0,20 Q25,5 50,20 Q75,35 100,20",
                  "M0,20 Q25,30 50,20 Q75,10 100,20",
                  "M0,20 Q25,5 50,20 Q75,35 100,20",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>

        {/* App name */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span 
            className="text-sm uppercase tracking-[0.3em] font-light"
            style={{ color: COLORS.mint.primary }}
          >
            Silent Help
          </span>
        </motion.div>
      </motion.div>

      {/* Main message */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <h1 
          className="text-4xl font-light tracking-wide"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.lavender.soft} 0%, ${COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          A sanctuary awaits
        </h1>
        <p className="text-slate-400 text-lg font-light">
          that knows you
        </p>
      </motion.div>

      {/* Supportive message */}
      <motion.p
        className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        This space adapts to how you're feeling. Let's take a moment to understand what you need.
      </motion.p>

      {/* Continue button */}
      <motion.button
        className="relative px-10 py-4 rounded-full text-white font-medium overflow-hidden group"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${COLORS.lavender.primary}50`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 20 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
      >
        {/* Hover glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${COLORS.lavender.primary}20 0%, ${COLORS.mint.primary}20 100%)`,
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        
        {/* Button content */}
        <span className="relative flex items-center gap-3">
          Begin
          <motion.svg 
            className="w-5 h-5"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </motion.svg>
        </span>
      </motion.button>
    </div>
  );
}

export default WelcomeStep;
