'use client';

/**
 * Silent Help - Responsive Home Wrapper
 * "The Adaptive Shell" - Switches between mobile and desktop layouts
 * 
 * Detects viewport size and renders the appropriate UI:
 * - Mobile (< 1024px): Original mobile app UI
 * - Desktop (≥ 1024px): Neural Sanctuary - God-Tier 2025
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuralSanctuary } from './NeuralSanctuary';
import type { UserProfile } from '@/lib/types/onboarding';

// ============================================================================
// Breakpoint Configuration
// ============================================================================

const DESKTOP_BREAKPOINT = 1024; // lg breakpoint in Tailwind

// ============================================================================
// Hook for Viewport Detection
// ============================================================================

function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Initial check
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };
    
    checkViewport();
    
    // Listen for resize
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);
  
  return isDesktop;
}

// ============================================================================
// Responsive Home Wrapper Component
// ============================================================================

interface ResponsiveHomeWrapperProps {
  userProfile: UserProfile | null;
  mobileContent: ReactNode;
}

export function ResponsiveHomeWrapper({ 
  userProfile, 
  mobileContent 
}: ResponsiveHomeWrapperProps) {
  const isDesktop = useIsDesktop();
  
  // Show loading state while determining viewport
  if (isDesktop === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Loading orb */}
          <motion.div
            className="w-16 h-16 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(127, 219, 202, 0.3), rgba(180, 167, 214, 0.3))',
              border: '1px solid rgba(127, 219, 202, 0.4)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.p
            className="text-slate-500 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Preparing your sanctuary...
          </motion.p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {isDesktop ? (
        <motion.div
          key="desktop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <NeuralSanctuary userProfile={userProfile} />
        </motion.div>
      ) : (
        <motion.div
          key="mobile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mobileContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Device Indicator (for development)
// ============================================================================

export function DeviceIndicator() {
  const isDesktop = useIsDesktop();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full text-xs font-mono"
      style={{
        background: isDesktop ? 'rgba(59, 130, 246, 0.2)' : 'rgba(244, 114, 182, 0.2)',
        border: `1px solid ${isDesktop ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 114, 182, 0.4)'}`,
        color: isDesktop ? '#60A5FA' : '#F472B6',
      }}
    >
      {isDesktop ? '🖥️ Desktop' : '📱 Mobile'}
    </motion.div>
  );
}
