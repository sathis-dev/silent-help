'use client';

/**
 * BiometricOrb - "Sanctuary Heart" Component
 * SANCTUARY V3 SPEC - Core Component
 * 
 * The central living element that responds to user's biometric data.
 * Features:
 * - Outer aura pulse synced to BPM
 * - Rotating conic gradient ring
 * - Dark ring separator
 * - Glass core with BPM display
 * - State indicator pill
 * 
 * Layers (outside → inside):
 * 1. Expanding aura (120% size)
 * 2. Conic rotating ring (100%)
 * 3. Dark ring (90%)
 * 4. Glass data core (80%)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Activity, Moon, Zap, AlertTriangle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type CognitiveState = 'calm' | 'maintenance' | 'high_stress' | 'crisis';

interface BiometricOrbProps {
  bpm?: number;
  cognitiveState?: CognitiveState;
  hrvTrend?: 'improving' | 'stable' | 'declining';
  onExpand?: () => void;
  size?: number;
  className?: string;
}

// ============================================================================
// STATE CONFIGURATIONS
// ============================================================================

const STATE_CONFIG = {
  calm: {
    label: 'Calm',
    icon: Sparkles,
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    pulseSpeed: 1.2,
  },
  maintenance: {
    label: 'Balanced',
    icon: Moon,
    primaryColor: '#8b5cf6',
    secondaryColor: '#a78bfa',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    pulseSpeed: 1.0,
  },
  high_stress: {
    label: 'Elevated',
    icon: Zap,
    primaryColor: '#f43f5e',
    secondaryColor: '#fb7185',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    pulseSpeed: 0.8,
  },
  crisis: {
    label: 'High Alert',
    icon: AlertTriangle,
    primaryColor: '#ef4444',
    secondaryColor: '#fca5a5',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    pulseSpeed: 0.6,
  },
};

// ============================================================================
// EXPANDING AURA COMPONENT
// ============================================================================

const ExpandingAura: React.FC<{
  color: string;
  bpm: number;
}> = ({ color, bpm }) => {
  // Pulse duration based on BPM (60 BPM = 1s per beat)
  const pulseDuration = bpm > 0 ? 60 / bpm : 1;

  return (
    <>
      {/* Main aura */}
      <motion.div
        className="absolute inset-[-20%] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.15, 0.3],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Secondary pulse ring */}
      <motion.div
        className="absolute inset-[-10%] rounded-full pointer-events-none"
        style={{
          border: `2px solid ${color}`,
        }}
        animate={{
          scale: [1, 1.3],
          opacity: [0.4, 0],
        }}
        transition={{
          duration: pulseDuration * 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </>
  );
};

// ============================================================================
// CONIC ROTATING RING
// ============================================================================

const ConicRing: React.FC<{
  primaryColor: string;
  secondaryColor: string;
}> = ({ primaryColor, secondaryColor }) => {
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        background: `conic-gradient(from 0deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
        opacity: 0.25,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

// ============================================================================
// DARK RING SEPARATOR
// ============================================================================

const DarkRing: React.FC<{
  primaryColor: string;
}> = ({ primaryColor }) => {
  return (
    <div
      className="absolute rounded-full"
      style={{
        inset: '5%',
        background: '#020408',
        border: `2px solid ${primaryColor}40`,
      }}
    />
  );
};

// ============================================================================
// STATE PILL COMPONENT
// ============================================================================

const StatePill: React.FC<{
  state: CognitiveState;
}> = ({ state }) => {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  return (
    <motion.div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{
        background: `${config.primaryColor}20`,
        border: `1px solid ${config.primaryColor}40`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Icon size={14} style={{ color: config.primaryColor }} />
      <span
        className="text-xs font-medium"
        style={{ color: config.secondaryColor }}
      >
        {config.label}
      </span>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BiometricOrb: React.FC<BiometricOrbProps> = ({
  bpm = 72,
  cognitiveState = 'calm',
  hrvTrend = 'stable',
  onExpand,
  size = 320,
  className = '',
}) => {
  const config = STATE_CONFIG[cognitiveState];
  const [displayBpm, setDisplayBpm] = useState(bpm);
  const displayBpmRef = useRef(bpm);

  // Animate BPM number changes using ref to avoid setState in effect body
  useEffect(() => {
    let animationTimer: NodeJS.Timeout;
    
    const animateToTarget = () => {
      const diff = bpm - displayBpmRef.current;
      if (Math.abs(diff) <= 1) {
        displayBpmRef.current = bpm;
        setDisplayBpm(bpm);
        return;
      }

      const step = diff > 0 ? 1 : -1;
      displayBpmRef.current += step;
      setDisplayBpm(displayBpmRef.current);
      animationTimer = setTimeout(animateToTarget, 50);
    };

    // Start animation on next tick to avoid sync setState
    animationTimer = setTimeout(animateToTarget, 0);

    return () => clearTimeout(animationTimer);
  }, [bpm]);

  // BPM text animation
  const bpmPulseDuration = bpm > 0 ? 60 / bpm : 1;

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      aria-label={`Biometric status. Heart rate: ${bpm} beats per minute. Current state: ${config.label}. Click to expand.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand?.();
        }
      }}
    >
      {/* Layer 1: Expanding Aura */}
      <ExpandingAura color={config.glowColor} bpm={bpm} />

      {/* Layer 2: Conic Rotating Ring */}
      <ConicRing
        primaryColor={config.primaryColor}
        secondaryColor={config.secondaryColor}
      />

      {/* Layer 3: Dark Ring Separator */}
      <DarkRing primaryColor={config.primaryColor} />

      {/* Layer 4: Glass Data Core */}
      <div
        className="absolute flex flex-col items-center justify-center rounded-full"
        style={{
          inset: '10%',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderTopColor: 'rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Heart icon indicator */}
        <motion.div
          className="absolute top-[15%]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: bpmPulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Heart
            size={20}
            fill={config.primaryColor}
            color={config.primaryColor}
          />
        </motion.div>

        {/* BPM Display */}
        <motion.div
          className="text-white font-light"
          style={{
            fontSize: `${size * 0.2}px`,
            fontWeight: 200,
            letterSpacing: '-0.02em',
          }}
          animate={{
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: bpmPulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {displayBpm}
        </motion.div>

        {/* BPM Label */}
        <span
          className="text-slate-400 uppercase tracking-widest"
          style={{ fontSize: '0.75rem' }}
        >
          BPM
        </span>

        {/* HRV Trend indicator */}
        <div className="absolute bottom-[20%] flex items-center gap-1">
          <Activity
            size={12}
            className={
              hrvTrend === 'improving'
                ? 'text-emerald-400'
                : hrvTrend === 'declining'
                ? 'text-rose-400'
                : 'text-slate-400'
            }
          />
          <span className="text-[10px] text-slate-500 capitalize">{hrvTrend}</span>
        </div>

        {/* State Pill */}
        <div className="absolute bottom-[-15%]">
          <StatePill state={cognitiveState} />
        </div>
      </div>

      {/* Tap to expand hint */}
      <motion.div
        className="absolute bottom-[-25%] left-1/2 -translate-x-1/2 text-[10px] text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Tap to expand
      </motion.div>
    </motion.div>
  );
};

export default BiometricOrb;
