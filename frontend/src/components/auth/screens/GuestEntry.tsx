'use client';

/**
 * Silent Help - Guest Entry
 * "Immediate Refuge" - Quick access for those who need help now
 * 
 * Features:
 * - Minimal friction entry
 * - Warm, welcoming design
 * - Clear temporary session notice
 * - Option to upgrade later
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthProvider';
import { AUTH_COLORS, GuestFormData, DEFAULT_GUEST_FORM } from '@/lib/types/auth';
import { FloatingInput, PrimaryButton, LinkButton } from '../ui/AuthInputs';

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export function GuestEntry() {
  const { continueAsGuest, isLoading, setMode } = useAuth();
  
  const [formData, setFormData] = useState<GuestFormData>(DEFAULT_GUEST_FORM);
  const [showNameInput, setShowNameInput] = useState(false);

  const handleChange = useCallback((field: keyof GuestFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleContinue = useCallback(async () => {
    await continueAsGuest(formData);
  }, [continueAsGuest, formData]);

  const handleQuickEntry = useCallback(async () => {
    await continueAsGuest({ displayName: 'Friend', acknowledgeTemporary: true });
  }, [continueAsGuest]);

  return (
    <motion.div
      className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg mx-auto px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <motion.div className="text-center mb-8 sm:mb-10" variants={itemVariants}>
        {/* Welcoming Heart Icon with Pulse */}
        <motion.div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${AUTH_COLORS.lavender.glow}, transparent 70%)`,
            }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${AUTH_COLORS.mint.glow}, transparent 70%)`,
            }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          />

          {/* Icon container */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}20, ${AUTH_COLORS.mint.primary}20)`,
              border: `1px solid ${AUTH_COLORS.lavender.border}`,
            }}
            animate={{
              boxShadow: [
                `0 0 20px ${AUTH_COLORS.lavender.glow}`,
                `0 0 35px ${AUTH_COLORS.mint.glow}`,
                `0 0 20px ${AUTH_COLORS.lavender.glow}`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.svg 
              className="w-8 h-8 sm:w-10 sm:h-10" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke={AUTH_COLORS.lavender.primary}
              strokeWidth={1.5}
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
              />
            </motion.svg>
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-xl sm:text-2xl font-light tracking-wide mb-2 sm:mb-3"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          You&apos;re Welcome Here
        </motion.h2>
        
        <motion.p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: AUTH_COLORS.text.secondary }}
        >
          No account needed. Take all the time you need.
        </motion.p>
      </motion.div>

      {/* Quick Entry Option */}
      <motion.div className="space-y-3 sm:space-y-4" variants={itemVariants}>
        {!showNameInput ? (
          <>
            {/* Primary: Quick anonymous entry */}
            <motion.div variants={itemVariants}>
              <PrimaryButton
                onClick={handleQuickEntry}
                isLoading={isLoading}
                size="lg"
                icon={
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              >
                Enter Sanctuary
              </PrimaryButton>
            </motion.div>

            {/* Secondary: Personalized entry */}
            <motion.div variants={itemVariants}>
              <PrimaryButton
                variant="secondary"
                onClick={() => setShowNameInput(true)}
                icon={
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
              >
                Tell us what to call you
              </PrimaryButton>
            </motion.div>
          </>
        ) : (
          /* Name Input Form */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-5"
          >
            <FloatingInput
              label="What should we call you?"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="A name, nickname, or anything you like"
              autoFocus
              icon={
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
            />

            <div className="flex gap-2 sm:gap-3">
              <PrimaryButton
                variant="ghost"
                onClick={() => setShowNameInput(false)}
              >
                Skip
              </PrimaryButton>
              <PrimaryButton
                onClick={handleContinue}
                isLoading={isLoading}
                disabled={!formData.displayName}
                icon={
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              >
                Continue as {formData.displayName || 'Guest'}
              </PrimaryButton>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Info Cards */}
      <motion.div 
        className="mt-8 sm:mt-10 space-y-2 sm:space-y-3"
        variants={itemVariants}
      >
        {/* Temporary session notice */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
          style={{
            background: AUTH_COLORS.void.card,
            border: `1px solid rgba(148, 163, 184, 0.15)`,
          }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}20, ${AUTH_COLORS.mint.primary}20)`,
              }}
            >
              <svg 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke={AUTH_COLORS.lavender.primary}
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium" style={{ color: AUTH_COLORS.text.primary }}>
                24-Hour Session
              </p>
              <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: AUTH_COLORS.text.muted }}>
                Your session lasts 24 hours. Create an account anytime to save your progress permanently.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy assurance */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
          style={{
            background: AUTH_COLORS.void.card,
            border: `1px solid rgba(148, 163, 184, 0.15)`,
          }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${AUTH_COLORS.success.glow}, ${AUTH_COLORS.mint.glow})`,
              }}
            >
              <svg 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke={AUTH_COLORS.success.primary}
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium" style={{ color: AUTH_COLORS.text.primary }}>
                Complete Privacy
              </p>
              <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: AUTH_COLORS.text.muted }}>
                Everything stays on your device. No tracking, no data collection.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Full access note */}
        <motion.div
          className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
          style={{
            background: AUTH_COLORS.void.card,
            border: `1px solid rgba(148, 163, 184, 0.15)`,
          }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${AUTH_COLORS.mint.glow}, ${AUTH_COLORS.lavender.glow})`,
              }}
            >
              <svg 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke={AUTH_COLORS.mint.primary}
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium" style={{ color: AUTH_COLORS.text.primary }}>
                Full Access
              </p>
              <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: AUTH_COLORS.text.muted }}>
                All tools, exercises, and support features are available to you.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Create Account Later */}
      <motion.div 
        className="text-center mt-6 sm:mt-8"
        variants={itemVariants}
      >
        <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
          Want to save your progress?{' '}
          <LinkButton onClick={() => setMode('signup')}>
            Create an account
          </LinkButton>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default GuestEntry;
