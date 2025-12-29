"use client";

/**
 * PathwayGrid Component
 * 
 * Spring-Physics Tiered Action Grid with 2025 Wellness Colors
 * Three pathways with Framer Motion spring animations:
 * - HIGH (Lifebuoy Red): Soft pulsing glow, heartbeat rhythm
 * - MID (Digital Lavender): Glassmorphism, luxurious calm
 * - LOW (Neo-Mint): Fresh, grounded, stable element
 * 
 * "Every transition must use Spring Physics. No sharp 'pops.'
 *  Elements should float into place as if they are underwater."
 */

import { motion, Variants } from 'framer-motion';
import { useCallback, useState } from 'react';
import { triggerPathwayHaptic, triggerUIHaptic } from '@/lib/haptics';
import type { StressPathway } from '@/lib/types';

interface PathwayGridProps {
  onSelect: (pathway: StressPathway) => void;
  currentPathway?: StressPathway | null;
  className?: string;
}

interface PathwayOption {
  pathway: StressPathway;
  title: string;
  subtitle: string;
  icon: string;
  hapticType: 'sos' | 'overwhelmed' | 'reflect';
  colors: {
    bg: string;
    glow: string;
    text: string;
    border: string;
  };
  pulseIntensity: number;
}

// 2025 Wellness Color Palette
const pathways: PathwayOption[] = [
  {
    pathway: 'HIGH',
    title: 'I need support now',
    subtitle: 'Immediate help and resources',
    icon: '🛟', // Lifebuoy emoji
    hapticType: 'sos',
    colors: {
      bg: 'rgba(229, 57, 53, 0.12)', // Lifebuoy Red
      glow: 'rgba(229, 57, 53, 0.35)',
      text: '#FFCDD2', // Red-100 for high contrast
      border: 'rgba(229, 57, 53, 0.25)',
    },
    pulseIntensity: 1.5, // Heartbeat-like
  },
  {
    pathway: 'MID',
    title: 'I feel overwhelmed',
    subtitle: 'Grounding and calming tools',
    icon: '💜', // Lavender heart
    hapticType: 'overwhelmed',
    colors: {
      bg: 'rgba(180, 167, 214, 0.12)', // Digital Lavender
      glow: 'rgba(180, 167, 214, 0.30)',
      text: '#D8D0E8', // Lavender-soft
      border: 'rgba(180, 167, 214, 0.20)',
    },
    pulseIntensity: 1.0, // Calming wave
  },
  {
    pathway: 'LOW',
    title: 'I want to reflect',
    subtitle: 'Journaling and patterns',
    icon: '🌿', // Neo-Mint leaf
    hapticType: 'reflect',
    colors: {
      bg: 'rgba(127, 219, 202, 0.10)', // Neo-Mint
      glow: 'rgba(127, 219, 202, 0.25)',
      text: '#B8F0E4', // Neo-Mint soft
      border: 'rgba(127, 219, 202, 0.20)',
    },
    pulseIntensity: 0.5, // Most stable
  },
];

// Spring physics variants - underwater float effect
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      mass: 0.8,
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

export function PathwayGrid({ 
  onSelect, 
  currentPathway,
  className = '' 
}: PathwayGridProps) {
  const [hoveredPathway, setHoveredPathway] = useState<StressPathway | null>(null);

  const handleSelect = useCallback((option: PathwayOption) => {
    // Unique pathway haptic signature - the "tactile hug"
    triggerPathwayHaptic(option.hapticType);
    triggerUIHaptic('select');
    onSelect(option.pathway);
  }, [onSelect]);

  return (
    <motion.div
      className={`flex flex-col gap-4 w-full max-w-md mx-auto ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pathways.map((option) => (
        <motion.button
          key={option.pathway}
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleSelect(option)}
          onHoverStart={() => setHoveredPathway(option.pathway)}
          onHoverEnd={() => setHoveredPathway(null)}
          className={`
            relative overflow-hidden
            w-full p-5 rounded-3xl
            text-left
            backdrop-blur-xl
            border
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950
            min-h-[100px]
          `}
          style={{
            background: option.colors.bg,
            borderColor: option.colors.border,
            '--tw-ring-color': option.colors.glow,
          } as React.CSSProperties}
          aria-label={`${option.title} - ${option.subtitle}`}
        >
          {/* Glassmorphism overlay */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}
          />
          
          {/* Glow effect behind card */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${option.colors.glow} 0%, transparent 70%)`,
            }}
            animate={{
              opacity: hoveredPathway === option.pathway 
                ? [0.4, 0.6, 0.4] 
                : [0.1, 0.2, 0.1],
              scale: hoveredPathway === option.pathway 
                ? [1, 1.05, 1] 
                : 1,
            }}
            transition={{
              duration: 2 / option.pulseIntensity,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* HIGH pathway special: heartbeat pulse ring */}
          {option.pathway === 'HIGH' && (
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 pointer-events-none"
              style={{ borderColor: option.colors.glow }}
              animate={{
                scale: [1, 1.03, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.2, // Heartbeat rhythm
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 flex items-center gap-4">
            <motion.span 
              className="text-3xl"
              animate={{ 
                scale: hoveredPathway === option.pathway ? [1, 1.1, 1] : 1 
              }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              {option.icon}
            </motion.span>
            <div className="flex-1">
              <h2 
                className="text-lg font-medium"
                style={{ color: option.colors.text }}
              >
                {option.title}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {option.subtitle}
              </p>
            </div>
            <motion.svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              animate={{ x: hoveredPathway === option.pathway ? 3 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </motion.svg>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
