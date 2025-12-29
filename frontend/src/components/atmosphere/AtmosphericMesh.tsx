'use client';

/**
 * Silent Help - Atmospheric Mesh Gradient
 * Dynamic gradients that shift based on cognitive state
 * 
 * Colors transition smoothly:
 * - CALM: Deep teals (#0D9488) → Neo-Mint (#7FDBCA)
 * - MAINTENANCE: Digital Lavender (#B4A7D6) → Soft purple
 * - HIGH_STRESS: Amber awareness (#F59E0B) → Soft gold
 * - CRISIS: Lifebuoy Red (#E53935) → Soft red
 * 
 * The mesh creates an organic, living atmosphere that responds
 * to the user's emotional state without being distracting.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useNeuroAdaptiveContext } from '@/components/providers/NeuroAdaptiveProvider';
import { CognitiveState, ATMOSPHERE_PALETTES } from '@/lib/neuro-adaptive-engine';

// ============================================================================
// Types
// ============================================================================

interface AtmosphericMeshProps {
  className?: string;
  intensity?: number;      // 0-1, how prominent the gradients are
  animated?: boolean;      // Whether to animate the mesh
  children?: React.ReactNode;
}

interface GradientOrb {
  id: string;
  x: number;              // % position
  y: number;              // % position
  size: number;           // % of container
  color: string;
  blur: number;           // px
  animationDuration: number; // seconds
}

// ============================================================================
// Gradient Configurations per State
// ============================================================================

const STATE_GRADIENTS: Record<CognitiveState, GradientOrb[]> = {
  calm: [
    { id: 'calm-1', x: 20, y: 30, size: 60, color: '#0D9488', blur: 100, animationDuration: 20 },
    { id: 'calm-2', x: 80, y: 70, size: 50, color: '#7FDBCA', blur: 120, animationDuration: 25 },
    { id: 'calm-3', x: 50, y: 90, size: 40, color: '#B4A7D6', blur: 80, animationDuration: 30 },
  ],
  maintenance: [
    { id: 'maint-1', x: 30, y: 40, size: 55, color: '#B4A7D6', blur: 100, animationDuration: 22 },
    { id: 'maint-2', x: 70, y: 60, size: 45, color: '#8B7FB8', blur: 110, animationDuration: 28 },
    { id: 'maint-3', x: 50, y: 20, size: 35, color: '#7FDBCA', blur: 90, animationDuration: 25 },
  ],
  high_stress: [
    { id: 'stress-1', x: 25, y: 35, size: 50, color: '#F59E0B', blur: 90, animationDuration: 18 },
    { id: 'stress-2', x: 75, y: 65, size: 40, color: '#FCD34D', blur: 100, animationDuration: 20 },
    { id: 'stress-3', x: 50, y: 80, size: 45, color: '#7FDBCA', blur: 85, animationDuration: 22 },
  ],
  crisis: [
    { id: 'crisis-1', x: 30, y: 40, size: 45, color: '#E53935', blur: 80, animationDuration: 15 },
    { id: 'crisis-2', x: 70, y: 60, size: 35, color: '#FFCDD2', blur: 90, animationDuration: 18 },
    { id: 'crisis-3', x: 50, y: 30, size: 40, color: '#FFFFFF', blur: 100, animationDuration: 20 },
  ],
};

// ============================================================================
// Animated Orb Component
// ============================================================================

interface AnimatedOrbProps {
  orb: GradientOrb;
  intensity: number;
  animated: boolean;
  animationSpeed: number;
}

function AnimatedOrb({ orb, intensity, animated, animationSpeed }: AnimatedOrbProps) {
  // Spring-based animation for smooth transitions
  const x = useSpring(orb.x, { stiffness: 20, damping: 20 });
  const y = useSpring(orb.y, { stiffness: 20, damping: 20 });
  
  useEffect(() => {
    x.set(orb.x);
    y.set(orb.y);
  }, [orb.x, orb.y, x, y]);

  const adjustedDuration = orb.animationDuration / animationSpeed;

  return (
    <motion.div
      key={orb.id}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: `${orb.size}%`,
        height: `${orb.size}%`,
        background: `radial-gradient(circle at center, ${orb.color}${Math.round(intensity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: `blur(${orb.blur}px)`,
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={animated ? {
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      } : undefined}
      transition={animated ? {
        duration: adjustedDuration,
        repeat: Infinity,
        ease: "easeInOut",
      } : undefined}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AtmosphericMesh({
  className = '',
  intensity = 0.6,
  animated = true,
  children,
}: AtmosphericMeshProps) {
  const { cognitiveState, uiOverrides, isReducedMotion } = useNeuroAdaptiveContext();
  
  // Get gradients for current state
  const gradients = useMemo(() => {
    return STATE_GRADIENTS[cognitiveState] || STATE_GRADIENTS.calm;
  }, [cognitiveState]);

  // Disable animation if reduced motion is preferred
  const shouldAnimate = animated && !isReducedMotion;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Mesh gradient layer */}
      <div className="absolute inset-0 -z-10">
        {/* Base dark layer */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #020617 0%, #0F172A 50%, #020617 100%)',
          }}
        />
        
        {/* Animated gradient orbs */}
        {gradients.map((orb) => (
          <AnimatedOrb
            key={orb.id}
            orb={orb}
            intensity={intensity}
            animated={shouldAnimate}
            animationSpeed={uiOverrides.animationSpeed}
          />
        ))}
        
        {/* Noise texture overlay for organic feel */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2, 6, 23, 0.4) 100%)',
          }}
        />
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}

// ============================================================================
// Simplified Static Version (for server rendering / performance)
// ============================================================================

export function AtmosphericMeshStatic({
  state = 'calm',
  className = '',
  intensity = 0.5,
}: {
  state?: CognitiveState;
  className?: string;
  intensity?: number;
}) {
  const palette = ATMOSPHERE_PALETTES[state];
  
  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, ${palette.primary}${Math.round(intensity * 30).toString(16).padStart(2, '0')} 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, ${palette.secondary}${Math.round(intensity * 25).toString(16).padStart(2, '0')} 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, ${palette.accent}${Math.round(intensity * 20).toString(16).padStart(2, '0')} 0%, transparent 40%),
            linear-gradient(to bottom, #020617 0%, #0F172A 50%, #020617 100%)
          `,
        }}
      />
    </div>
  );
}

// ============================================================================
// Breathing Pulse Overlay (for interventions)
// ============================================================================

export function BreathingPulseOverlay({
  isActive,
  phase = 'inhale',
  color,
}: {
  isActive: boolean;
  phase?: 'inhale' | 'hold' | 'exhale' | 'rest';
  color?: string;
}) {
  const { uiOverrides } = useNeuroAdaptiveContext();
  
  if (!isActive) return null;

  const phaseConfig = {
    inhale: { scale: [1, 1.3], duration: 4 },
    hold: { scale: [1.3, 1.3], duration: 4 },
    exhale: { scale: [1.3, 1], duration: 4 },
    rest: { scale: [1, 1], duration: 4 },
  };

  const config = phaseConfig[phase];
  const pulseColor = color || uiOverrides.atmosphereColor.accent;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        background: `radial-gradient(circle at center, ${pulseColor}20 0%, transparent 60%)`,
      }}
      animate={{
        scale: config.scale,
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: config.duration / uiOverrides.animationSpeed,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}
