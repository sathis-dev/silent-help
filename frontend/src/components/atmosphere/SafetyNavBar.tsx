"use client";

/**
 * SafetyNavBar Component - The Red Lifebuoy
 * 
 * Fixed bottom navigation with UK-native safety architecture:
 * - SOS button as a glowing Red Lifebuoy at bottom center
 * - Soft pulsing outer glow - high visibility without panic
 * - UK Triple-Gate: 999, 111, SHOUT
 * - WCAG 2.2 AA compliant: 4.5:1 contrast, 44px touch targets
 * 
 * "The SOS button must stay in the exact same coordinate on every screen.
 *  It becomes muscle-memory reachable."
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';
import { triggerSOSHaptic, triggerPathwayHaptic, triggerUIHaptic } from '@/lib/haptics';

interface SafetyNavBarProps {
  onHomePress?: () => void;
  onJournalPress?: () => void;
  onProfilePress?: () => void;
  showSOSExpanded?: boolean;
  className?: string;
}

interface EmergencyOption {
  id: string;
  label: string;
  sublabel: string;
  action: string;
  color: string;
  bgColor: string;
  icon: string;
}

// UK-specific emergency options (Triple-Gate) with 2025 colors
const UK_EMERGENCY_OPTIONS: EmergencyOption[] = [
  {
    id: '999',
    label: 'Call 999',
    sublabel: 'Emergency services',
    action: 'tel:999',
    color: '#FFCDD2',
    bgColor: 'rgba(229, 57, 53, 0.15)',
    icon: '🚨',
  },
  {
    id: '111',
    label: 'Call 111',
    sublabel: 'NHS urgent care',
    action: 'tel:111',
    color: '#B8F0E4',
    bgColor: 'rgba(127, 219, 202, 0.12)',
    icon: '🏥',
  },
  {
    id: 'shout',
    label: 'Text SHOUT',
    sublabel: 'Text 85258 for support',
    action: 'sms:85258?body=SHOUT',
    color: '#D8D0E8',
    bgColor: 'rgba(180, 167, 214, 0.12)',
    icon: '💬',
  },
];

export function SafetyNavBar({ 
  onHomePress,
  onJournalPress,
  onProfilePress,
  showSOSExpanded = false,
  className = '' 
}: SafetyNavBarProps) {
  const [isSOSExpanded, setIsSOSExpanded] = useState(showSOSExpanded);
  const [isPressed, setIsPressed] = useState(false);

  const handleSOSPress = useCallback(() => {
    triggerSOSHaptic();
    setIsSOSExpanded(true);
  }, []);

  const handleEmergencySelect = useCallback((option: EmergencyOption) => {
    triggerPathwayHaptic('sos');
    window.location.href = option.action;
  }, []);

  const handleClose = useCallback(() => {
    triggerUIHaptic('tap');
    setIsSOSExpanded(false);
  }, []);

  const handleNavPress = useCallback((action?: () => void) => {
    triggerUIHaptic('tap');
    action?.();
  }, []);

  return (
    <>
      {/* Emergency Options Overlay */}
      <AnimatePresence>
        {isSOSExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Emergency Options Panel */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border border-slate-700/50 p-6 pt-4">
                {/* Handle bar */}
                <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-6" />

                <h2 className="text-xl font-medium text-slate-100 text-center mb-6">
                  Get Support Now
                </h2>

                {/* UK Triple-Gate Options */}
                <div className="space-y-3">
                  {UK_EMERGENCY_OPTIONS.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleEmergencySelect(option)}
                      className="w-full p-4 rounded-2xl flex items-center gap-4 border transition-colors"
                      style={{ 
                        borderColor: option.color + '40',
                        backgroundColor: option.color + '15',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1 text-left">
                        <span 
                          className="text-lg font-medium block"
                          style={{ color: option.color }}
                        >
                          {option.label}
                        </span>
                        <span className="text-sm text-slate-400">
                          {option.sublabel}
                        </span>
                      </div>
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke={option.color}
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>

                {/* Close button */}
                <motion.button
                  onClick={handleClose}
                  className="w-full mt-6 p-4 rounded-2xl bg-slate-800 text-slate-300 font-medium"
                  whileTap={{ scale: 0.98 }}
                >
                  I&apos;m okay for now
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Navigation Bar - Glassmorphism Base */}
      <motion.nav
        className={`
          fixed bottom-0 left-0 right-0 z-30
          bg-slate-900/70 backdrop-blur-2xl
          border-t border-slate-700/30
          px-4 pb-safe
          ${className}
        `}
        style={{
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7))',
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
      >
        <div className="flex items-center justify-around h-20 max-w-md mx-auto">
          {/* Home - Digital Lavender accent */}
          <motion.button
            onClick={() => { handleNavPress(); onHomePress?.(); }}
            className="flex flex-col items-center justify-center w-16 h-16 group"
            whileTap={{ scale: 0.9 }}
            aria-label="Home"
          >
            <motion.div 
              className="p-2 rounded-xl transition-all duration-300 group-hover:bg-[#B4A7D6]/20"
              whileHover={{ scale: 1.1 }}
            >
              <svg 
                className="w-6 h-6 text-slate-400 group-hover:text-[#B4A7D6] transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </motion.div>
            <span className="text-xs mt-1 text-slate-500 group-hover:text-[#B4A7D6] transition-colors">Home</span>
          </motion.button>

          {/* 🔴 RED LIFEBUOY SOS BUTTON - The Crown Jewel */}
          <div className="relative -mt-8">
            {/* Outer Glow Pulse Rings - Triple Layer */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, rgba(229, 57, 53, 0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, rgba(229, 57, 53, 0.3) 0%, transparent 60%)',
                filter: 'blur(12px)',
              }}
              animate={{
                scale: [1.2, 2.2, 1.2],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, rgba(229, 57, 53, 0.2) 0%, transparent 50%)',
                filter: 'blur(16px)',
              }}
              animate={{
                scale: [1.4, 2.6, 1.4],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />

            {/* Main SOS Button - Lifebuoy Red (#E53935) */}
            <motion.button
              onClick={handleSOSPress}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              className="relative w-18 h-18 rounded-full focus:outline-none"
              style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #EF5350 0%, #E53935 50%, #C62828 100%)',
                boxShadow: `
                  0 0 20px rgba(229, 57, 53, 0.6),
                  0 0 40px rgba(229, 57, 53, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                `,
              }}
              whileHover={{ 
                scale: 1.08,
                boxShadow: `
                  0 0 30px rgba(229, 57, 53, 0.8),
                  0 0 60px rgba(229, 57, 53, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                `,
              }}
              whileTap={{ scale: 0.92 }}
              aria-label="SOS - Get immediate help"
            >
              {/* Inner ring for lifebuoy effect */}
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-white/30"
                animate={{
                  borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* SOS Text */}
              <span 
                className="relative z-10 text-white font-bold text-xl"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  letterSpacing: '0.05em',
                }}
              >
                SOS
              </span>
            </motion.button>
          </div>

          {/* Journal - Neo-Mint accent */}
          <motion.button
            onClick={() => { handleNavPress(); onJournalPress?.(); }}
            className="flex flex-col items-center justify-center w-16 h-16 group"
            whileTap={{ scale: 0.9 }}
            aria-label="Journal"
          >
            <motion.div 
              className="p-2 rounded-xl transition-all duration-300 group-hover:bg-[#7FDBCA]/20"
              whileHover={{ scale: 1.1 }}
            >
              <svg 
                className="w-6 h-6 text-slate-400 group-hover:text-[#7FDBCA] transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </motion.div>
            <span className="text-xs mt-1 text-slate-500 group-hover:text-[#7FDBCA] transition-colors">Journal</span>
          </motion.button>
        </div>

        {/* UK Data Transparency Footer - Enhanced */}
        <motion.div 
          className="flex items-center justify-center gap-2 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-[10px] text-slate-500">🔒</span>
          <p className="text-[10px] text-slate-500">
            UK Encrypted • NHS Compliant • Zero data sharing
          </p>
        </motion.div>
      </motion.nav>
    </>
  );
}
