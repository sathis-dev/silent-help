'use client';

/**
 * BentoToolCard - Individual Tool Card Component
 * SANCTUARY V3 SPEC - Tools Component
 * 
 * Individual tool card with unique visual personality.
 * Features:
 * - Accent line gradient at top
 * - Icon container with accent background
 * - Title and subtitle
 * - Visual effect (varies by tool type)
 * - Hover animations with glow
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Wind,
  Anchor,
  PenLine,
  Activity,
  BarChart3,
  SmilePlus,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ToolType =
  | 'breathing'
  | 'grounding'
  | 'journal'
  | 'body_scan'
  | 'mood_log'
  | 'patterns';

export interface BentoToolCardProps {
  type: ToolType;
  title: string;
  subtitle: string;
  onClick?: () => void;
  className?: string;
  span?: 'small' | 'medium' | 'large';
}

// ============================================================================
// TOOL CONFIGURATIONS
// ============================================================================

interface ToolConfig {
  icon: LucideIcon;
  accent: string;
  VisualEffect: React.FC;
}

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

const WaveformEffect: React.FC = () => (
  <svg
    width="80"
    height="40"
    viewBox="0 0 80 40"
    className="opacity-30"
  >
    <motion.path
      d="M0,20 Q10,10 20,20 T40,20 T60,20 T80,20"
      stroke="#14b8a6"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.path
      d="M0,25 Q10,35 20,25 T40,25 T60,25 T80,25"
      stroke="#14b8a6"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      opacity={0.5}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.3,
      }}
    />
  </svg>
);

const RippleEffect: React.FC = () => (
  <div className="relative w-[60px] h-[60px]">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border border-violet-500"
        initial={{ scale: 0.5, opacity: 0.5 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: i * 1,
          ease: 'easeOut',
        }}
      />
    ))}
    <div className="absolute inset-[30%] rounded-full bg-violet-500/30" />
  </div>
);

const InkBleedEffect: React.FC = () => (
  <motion.div
    className="w-[50px] h-[50px] rounded-full"
    style={{
      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
    }}
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const BodyOutlineEffect: React.FC = () => (
  <div className="relative w-[40px] h-[60px]">
    {/* Simple body outline */}
    <div className="absolute inset-0 flex flex-col items-center">
      {/* Head */}
      <div className="w-3 h-3 rounded-full border border-amber-400/40" />
      {/* Body */}
      <div className="w-px h-6 bg-amber-400/40 mt-0.5" />
      {/* Arms */}
      <div className="absolute top-4 left-0 right-0 h-px bg-amber-400/40" />
      {/* Legs */}
      <div className="absolute bottom-0 left-1/2 w-px h-4 bg-amber-400/40 origin-top -rotate-12" />
      <div className="absolute bottom-0 left-1/2 w-px h-4 bg-amber-400/40 origin-top rotate-12" />
    </div>
    {/* Scanning line */}
    <motion.div
      className="absolute left-0 right-0 h-px bg-amber-400"
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  </div>
);

const EmojiOrbitEffect: React.FC = () => {
  const emojis = ['😊', '😌', '😔', '😤'];
  return (
    <div className="relative w-[50px] h-[50px]">
      {emojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-sm"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [
              Math.cos((i * Math.PI) / 2) * 20 - 6,
              Math.cos((i * Math.PI) / 2 + Math.PI) * 20 - 6,
              Math.cos((i * Math.PI) / 2) * 20 - 6,
            ],
            y: [
              Math.sin((i * Math.PI) / 2) * 20 - 6,
              Math.sin((i * Math.PI) / 2 + Math.PI) * 20 - 6,
              Math.sin((i * Math.PI) / 2) * 20 - 6,
            ],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'linear',
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

const MiniChartEffect: React.FC = () => (
  <svg
    width="60"
    height="40"
    viewBox="0 0 60 40"
    className="opacity-40"
  >
    <motion.path
      d="M0,35 L10,30 L20,32 L30,25 L40,28 L50,20 L60,15"
      stroke="#0ea5e9"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    />
    {/* Data points */}
    {[
      { x: 10, y: 30 },
      { x: 30, y: 25 },
      { x: 50, y: 20 },
    ].map((point, i) => (
      <motion.circle
        key={i}
        cx={point.x}
        cy={point.y}
        r="3"
        fill="#0ea5e9"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.3,
        }}
      />
    ))}
  </svg>
);

// ============================================================================
// TOOL CONFIGS
// ============================================================================

const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  breathing: {
    icon: Wind,
    accent: '#14b8a6',
    VisualEffect: WaveformEffect,
  },
  grounding: {
    icon: Anchor,
    accent: '#8b5cf6',
    VisualEffect: RippleEffect,
  },
  journal: {
    icon: PenLine,
    accent: '#ec4899',
    VisualEffect: InkBleedEffect,
  },
  body_scan: {
    icon: Activity,
    accent: '#f59e0b',
    VisualEffect: BodyOutlineEffect,
  },
  mood_log: {
    icon: SmilePlus,
    accent: '#f59e0b',
    VisualEffect: EmojiOrbitEffect,
  },
  patterns: {
    icon: BarChart3,
    accent: '#0ea5e9',
    VisualEffect: MiniChartEffect,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BentoToolCard: React.FC<BentoToolCardProps> = ({
  type,
  title,
  subtitle,
  onClick,
  className = '',
  span = 'medium',
}) => {
  const config = TOOL_CONFIGS[type];
  const Icon = config.icon;
  const VisualEffect = config.VisualEffect;

  const spanClasses = {
    small: 'bento-span-3',
    medium: 'bento-span-4',
    large: 'bento-span-6',
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden text-left
        liquid-glass-card p-5 min-h-[160px]
        focus-ring touch-56
        ${spanClasses[span]}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      style={
        {
          '--card-accent': config.accent,
        } as React.CSSProperties
      }
    >
      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
        style={{
          background: `linear-gradient(90deg, ${config.accent}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon container */}
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl mb-3"
          style={{
            background: `${config.accent}15`,
          }}
        >
          <Icon size={24} style={{ color: config.accent }} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-white mb-1">{title}</h3>

        {/* Subtitle */}
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>

      {/* Visual effect (absolute positioned) */}
      <div className="absolute right-4 bottom-4 tool-card-visual">
        <VisualEffect />
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0"
        style={{
          boxShadow: `0 0 40px ${config.accent}30`,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default BentoToolCard;
