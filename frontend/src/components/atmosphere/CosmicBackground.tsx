'use client';

/**
 * CosmicBackground - "Living Nebula" Background System
 * SANCTUARY V3 SPEC - Visual Engine
 * 
 * Multi-layer animated background that breathes with the user
 * and responds to cognitive state.
 * 
 * Layers:
 * 1. Base void (#020408)
 * 2. Primary nebula orb (top-left)
 * 3. Secondary nebula orb (bottom-right)
 * 4. State-reactive glow (center)
 * 5. Star field particles
 * 6. Noise texture overlay
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

type CognitiveState = 'calm' | 'maintenance' | 'high_stress' | 'crisis';

interface CosmicBackgroundProps {
  cognitiveState?: CognitiveState;
  showStars?: boolean;
  className?: string;
}

// ============================================================================
// STATE CONFIGURATIONS
// ============================================================================

const STATE_CONFIG = {
  calm: {
    glowColor: 'rgba(99, 102, 241, 0.08)',
    pulseSpeed: 8,
    nebulaSpeed: 45,
  },
  maintenance: {
    glowColor: 'rgba(139, 92, 246, 0.12)',
    pulseSpeed: 6,
    nebulaSpeed: 30,
  },
  high_stress: {
    glowColor: 'rgba(244, 63, 94, 0.2)',
    pulseSpeed: 3,
    nebulaSpeed: 15,
  },
  crisis: {
    glowColor: 'rgba(239, 68, 68, 0.35)',
    pulseSpeed: 1.5,
    nebulaSpeed: 8,
  },
};

// ============================================================================
// STAR FIELD COMPONENT
// ============================================================================

// Pre-generated star positions to avoid impure function calls during render
const generateStars = (count: number, seed: number) => {
  return Array.from({ length: count }, (_, i) => {
    // Use deterministic pseudo-random based on index
    const hash = (i + seed) * 2654435761 % 1000;
    const hash2 = (i + seed + 1) * 2654435761 % 1000;
    const hash3 = (i + seed + 2) * 2654435761 % 1000;
    const hash4 = (i + seed + 3) * 2654435761 % 1000;
    const hash5 = (i + seed + 4) * 2654435761 % 1000;
    
    return {
      id: i,
      x: (hash / 1000) * 100,
      y: (hash2 / 1000) * 100,
      size: (hash3 / 1000) * 2 + 1,
      delay: (hash4 / 1000) * 8,
      duration: (hash5 / 1000) * 5 + 3,
    };
  });
};

const STAR_DATA = generateStars(60, 42);

const StarField: React.FC<{ count?: number }> = ({ count = 60 }) => {
  const stars = useMemo(() => STAR_DATA.slice(0, count), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// NEBULA ORB COMPONENT
// ============================================================================

interface NebulaOrbProps {
  position: 'top-left' | 'bottom-right';
  colors: string[];
  size: string;
  speed: number;
}

const NebulaOrb: React.FC<NebulaOrbProps> = ({ position, colors, size, speed }) => {
  const positionStyles = position === 'top-left'
    ? { top: '-30%', left: '-30%' }
    : { bottom: '-20%', right: '-20%' };

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        ...positionStyles,
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${colors.join(', ')}, transparent 70%)`,
        filter: 'blur(120px)',
      }}
      animate={
        position === 'top-left'
          ? {
              x: ['0%', '5%', '2%', '-3%', '0%'],
              y: ['0%', '3%', '6%', '2%', '0%'],
              scale: [1, 1.02, 1, 1.01, 1],
            }
          : {
              x: ['0%', '-4%', '-2%', '3%', '0%'],
              y: ['0%', '-2%', '-5%', '-3%', '0%'],
              scale: [1, 1.01, 1, 1.02, 1],
            }
      }
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// ============================================================================
// STATE REACTIVE GLOW
// ============================================================================

interface StateGlowProps {
  color: string;
  pulseSpeed: number;
}

const StateGlow: React.FC<StateGlowProps> = ({ color, pulseSpeed }) => {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{
        width: '80vmin',
        height: '80vmin',
        background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 1.5, 1],
      }}
      transition={{
        duration: pulseSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// ============================================================================
// NOISE TEXTURE OVERLAY
// ============================================================================

const NoiseOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 200;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 8; // Very subtle opacity
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: 0.02,
        mixBlendMode: 'overlay',
      }}
    />
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  cognitiveState = 'calm',
  showStars = true,
  className = '',
}) => {
  const config = STATE_CONFIG[cognitiveState];

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${className}`}
      style={{ background: '#020408' }}
      data-cognitive-state={cognitiveState}
    >
      {/* Layer 1: Primary Nebula Orb (top-left) */}
      <NebulaOrb
        position="top-left"
        colors={['rgba(26, 26, 46, 0.4)', 'rgba(22, 33, 62, 0.3)', 'rgba(15, 52, 96, 0.2)']}
        size="150vmax"
        speed={config.nebulaSpeed}
      />

      {/* Layer 2: Secondary Nebula Orb (bottom-right) */}
      <NebulaOrb
        position="bottom-right"
        colors={['rgba(30, 27, 75, 0.3)', 'rgba(49, 46, 129, 0.2)', 'rgba(55, 48, 163, 0.15)']}
        size="120vmax"
        speed={config.nebulaSpeed * 0.8}
      />

      {/* Layer 3: State-Reactive Glow (center) */}
      <StateGlow
        color={config.glowColor}
        pulseSpeed={config.pulseSpeed}
      />

      {/* Layer 4: Star Field */}
      {showStars && <StarField count={60} />}

      {/* Layer 5: Noise Texture Overlay */}
      <NoiseOverlay />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(2, 4, 8, 0.6) 100%)',
        }}
      />
    </div>
  );
};

export default CosmicBackground;
