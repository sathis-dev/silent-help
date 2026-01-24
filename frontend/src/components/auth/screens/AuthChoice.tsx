'use client';

/**
 * Silent Help - Auth Choice Screen
 * "The Gateway" - Beautiful landing screen for authentication
 * 
 * Features:
 * - Stunning animated logo/branding
 * - Three options: Sign Up, Log In, Guest
 * - Elegant glass morphism design
 * - Gentle animations that don't overwhelm
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthProvider';
import { AUTH_COLORS } from '@/lib/types/auth';
import { PrimaryButton, SocialButton, Divider } from '../ui/AuthInputs';

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      delay: 0.1,
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export function AuthChoice() {
  const { setMode } = useAuth();

  return (
    <motion.div
      className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo & Brand */}
      <motion.div 
        className="text-center mb-8 sm:mb-10 lg:mb-12"
        variants={logoVariants}
      >
        {/* Animated Logo */}
        <motion.div
          className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-4 sm:mb-6"
          animate={{
            boxShadow: [
              `0 0 30px ${AUTH_COLORS.lavender.glow}`,
              `0 0 50px ${AUTH_COLORS.mint.glow}`,
              `0 0 30px ${AUTH_COLORS.lavender.glow}`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ borderRadius: '50%' }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}20, ${AUTH_COLORS.mint.primary}20)`,
              border: `1px solid ${AUTH_COLORS.lavender.border}`,
            }}
          />
          
          {/* Sanctuary Icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg 
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke={AUTH_COLORS.lavender.primary}
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
              />
            </svg>
          </motion.div>

          {/* Orbiting particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i === 0 
                  ? AUTH_COLORS.lavender.primary 
                  : i === 1 
                    ? AUTH_COLORS.mint.primary 
                    : AUTH_COLORS.rose.primary,
                top: '50%',
                left: '50%',
                transformOrigin: `${40 + i * 5}px 0`,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide mb-1.5 sm:mb-2"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 50%, ${AUTH_COLORS.lavender.soft} 100%)`,
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          Silent Help
        </motion.h1>
        
        <motion.p
          className="text-xs sm:text-sm lg:text-base"
          style={{ color: AUTH_COLORS.text.secondary }}
          variants={itemVariants}
        >
          Your private sanctuary for emotional wellness
        </motion.p>
      </motion.div>

      {/* Auth Options */}
      <motion.div className="space-y-3 sm:space-y-4" variants={containerVariants}>
        {/* Primary CTA - Create Account */}
        <motion.div variants={itemVariants}>
          <PrimaryButton
            variant="primary"
            size="lg"
            onClick={() => setMode('signup')}
            icon={
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          >
            Create Your Sanctuary
          </PrimaryButton>
        </motion.div>

        {/* Secondary - Log In */}
        <motion.div variants={itemVariants}>
          <PrimaryButton
            variant="secondary"
            size="lg"
            onClick={() => setMode('login')}
            icon={
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            }
          >
            Welcome Back
          </PrimaryButton>
        </motion.div>

        {/* Divider */}
        <Divider text="or continue with" />

        {/* Social Login Options */}
        <motion.div className="space-y-2 sm:space-y-3" variants={itemVariants}>
          <SocialButton provider="google" onClick={() => {}} />
          <SocialButton provider="apple" onClick={() => {}} />
        </motion.div>

        {/* Guest Option - Always Available */}
        <motion.div 
          className="pt-4 sm:pt-6"
          variants={itemVariants}
        >
          <motion.button
            className="w-full group"
            onClick={() => setMode('guest')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div
              className="relative py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px dashed rgba(148, 163, 184, 0.3)',
              }}
            >
              {/* Subtle gradient on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.glow}10, ${AUTH_COLORS.mint.glow}10)`,
                }}
              />

              <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke={AUTH_COLORS.text.secondary}
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </motion.div>
                <span className="text-sm sm:text-base" style={{ color: AUTH_COLORS.text.secondary }}>
                  Continue as Guest
                </span>
                <svg 
                  className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke={AUTH_COLORS.text.muted}
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Helper text */}
              <motion.p
                className="text-xs text-center mt-2"
                style={{ color: AUTH_COLORS.text.muted }}
              >
                No account needed • Perfect if you need help right now
              </motion.p>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="text-center mt-6 sm:mt-8 lg:mt-10 space-y-2 sm:space-y-3"
        variants={itemVariants}
      >
        <p className="text-[10px] sm:text-xs" style={{ color: AUTH_COLORS.text.muted }}>
          By continuing, you agree to our{' '}
          <button 
            className="underline hover:no-underline transition-all"
            style={{ color: AUTH_COLORS.lavender.primary }}
          >
            Terms of Service
          </button>
          {' '}and{' '}
          <button 
            className="underline hover:no-underline transition-all"
            style={{ color: AUTH_COLORS.lavender.primary }}
          >
            Privacy Policy
          </button>
        </p>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs" style={{ color: AUTH_COLORS.text.muted }}>
          <span>🔒</span>
          <span>Your data stays on your device</span>
        </div>
      </motion.footer>
    </motion.div>
  );
}

export default AuthChoice;
