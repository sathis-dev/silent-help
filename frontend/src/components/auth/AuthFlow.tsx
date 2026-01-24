'use client';

/**
 * Silent Help - Authentication Flow Orchestrator
 * "The Gateway Experience" - Main auth flow controller
 * 
 * Features:
 * - Smooth transitions between auth modes
 * - Atmospheric background matching sanctuary theme
 * - Progress indication
 * - Accessible navigation
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, AuthProvider } from './AuthProvider';
import { AuthChoice } from './screens/AuthChoice';
import { LoginForm } from './screens/LoginForm';
import { SignupForm } from './screens/SignupForm';
import { GuestEntry } from './screens/GuestEntry';
import { AUTH_COLORS, AuthUser, GuestUser } from '@/lib/types/auth';

// ============================================================================
// Animation Variants
// ============================================================================

const pageVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -80 : 80,
    opacity: 0,
    scale: 0.98,
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// ============================================================================
// Particle Field Component (Matching Onboarding)
// ============================================================================

interface ParticleFieldProps {
  intensity?: number;
  color?: string;
  particleCount?: number;
}

function ParticleField({
  intensity = 0.5,
  color = AUTH_COLORS.lavender.primary,
  particleCount = 30,
}: ParticleFieldProps) {
  const particles = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    return Array.from({ length: Math.floor(particleCount * intensity) }).map((_, i) => ({
      id: i,
      x: seededRandom(i * 6) * 100,
      y: seededRandom(i * 6 + 1) * 100,
      size: seededRandom(i * 6 + 2) * 3 + 1,
      duration: seededRandom(i * 6 + 3) * 20 + 15,
      delay: seededRandom(i * 6 + 4) * 5,
      opacity: seededRandom(i * 6 + 5) * 0.3 + 0.1,
    }));
  }, [particleCount, intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            opacity: particle.opacity,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Larger floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          left: '20%',
          top: '30%',
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          right: '10%',
          bottom: '20%',
          background: `radial-gradient(circle, ${AUTH_COLORS.mint.primary}10 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// ============================================================================
// Inner Flow Component
// ============================================================================

function AuthFlowInner() {
  const { mode, animationDirection, goBack, isAuthenticated } = useAuth();

  // Don't render if authenticated
  if (isAuthenticated) {
    return null;
  }

  const renderScreen = () => {
    switch (mode) {
      case 'login':
        return <LoginForm key="login" />;
      case 'signup':
        return <SignupForm key="signup" />;
      case 'guest':
        return <GuestEntry key="guest" />;
      case 'choice':
      default:
        return <AuthChoice key="choice" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: AUTH_COLORS.void.deep }}>
      {/* Atmospheric Background */}
      <div className="absolute inset-0">
        <ParticleField intensity={0.5} color={AUTH_COLORS.lavender.primary} />
        
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 50%, 
              ${AUTH_COLORS.lavender.glow} 0%, 
              ${AUTH_COLORS.mint.glow} 30%,
              transparent 70%)`,
          }}
        />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2, 6, 23, 0.8) 100%)',
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Back Button */}
        <AnimatePresence>
          {mode !== 'choice' && (
            <motion.button
              className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-white transition-colors"
              onClick={goBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ x: -2 }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-xs sm:text-sm">Back</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode indicator - subtle */}
        <motion.div
          className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full hidden sm:block"
          style={{
            background: AUTH_COLORS.void.card,
            color: AUTH_COLORS.text.muted,
            border: `1px solid rgba(148, 163, 184, 0.1)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
        >
          {mode === 'choice' ? 'Welcome' : 
           mode === 'login' ? 'Sign In' : 
           mode === 'signup' ? 'Create Account' : 
           mode === 'guest' ? 'Guest Access' : ''}
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)] py-4 sm:py-6 lg:py-8 overflow-y-auto">
        <AnimatePresence mode="wait" custom={animationDirection}>
          <motion.div
            key={mode}
            custom={animationDirection}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Trust Badge */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center z-10 px-4">
        <motion.div
          className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full max-w-full"
          style={{
            background: AUTH_COLORS.void.card,
            color: AUTH_COLORS.text.muted,
            border: `1px solid rgba(148, 163, 184, 0.1)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span>🔒</span>
          <span className="truncate">End-to-end encrypted • Your data stays on your device</span>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Export with Provider
// ============================================================================

interface AuthFlowProps {
  onAuthComplete?: (user: AuthUser | GuestUser) => void;
}

export function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  return (
    <AuthProvider onAuthComplete={onAuthComplete}>
      <AuthFlowInner />
    </AuthProvider>
  );
}

// Also export the inner component for custom provider usage
export { AuthFlowInner };

export default AuthFlow;
