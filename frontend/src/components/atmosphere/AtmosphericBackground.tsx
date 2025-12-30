"use client";

/**
 * AtmosphericBackground Component - ULTRA UPGRADE 2025
 * 
 * "Dynamic Mesh Gradient Canvas"
 * 
 * Engine: Animate 3-4 radial blobs using Framer Motion with 'mirror' repeat.
 * Colors:
 *   - Base: #02040A
 *   - Blob 1: #1E1B4B (Indigo-950)
 *   - Blob 2: #0F172A (Slate-900)
 *   - Blob 3: #312E81 (Indigo-900)
 * 
 * Texture Overlay: Monochromatic noise 3% (prevents color banding, adds tactile depth)
 * 
 * Neuro-Adaptive: Animation speed syncs to user cognitive state
 */

import { motion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import type { CognitiveState } from '@/lib/neuro-adaptive-engine';

// ============================================================================
// Neuro-Adaptive Configuration
// ============================================================================

interface NeuroAdaptiveConfig {
  bgSpeed: number;      // seconds for blob animation
  glowIntensity: number; // 0-1
  primaryColor: string;
}

const NEURO_CONFIGS: Record<CognitiveState, NeuroAdaptiveConfig> = {
  calm: {
    bgSpeed: 40,
    glowIntensity: 0.2,
    primaryColor: '#6366F1', // Indigo-500
  },
  maintenance: {
    bgSpeed: 25,
    glowIntensity: 0.3,
    primaryColor: '#8B5CF6', // Violet-500
  },
  high_stress: {
    bgSpeed: 10,
    glowIntensity: 0.6,
    primaryColor: '#F43F5E', // Rose-500
  },
  crisis: {
    bgSpeed: 5,
    glowIntensity: 1.0,
    primaryColor: '#DC2626', // Red-600
  },
};

// ============================================================================
// Component Props
// ============================================================================

interface AtmosphericBackgroundProps {
  children: ReactNode;
  cognitiveState?: CognitiveState;
  intensity?: 'calm' | 'active' | 'elevated'; // Legacy support
}

// ============================================================================
// Main Component
// ============================================================================

export function AtmosphericBackground({ 
  children, 
  cognitiveState = 'calm',
}: AtmosphericBackgroundProps) {
  const config = NEURO_CONFIGS[cognitiveState];
  
  // Memoize blob configurations for performance
  const blobs = useMemo(() => [
    {
      id: 'blob-1',
      color: '#1E1B4B',
      size: 900,
      blur: 100,
      position: { top: '-20%', left: '-15%' },
      animation: {
        x: [0, 150, 80, 0],
        y: [0, 80, 150, 0],
        scale: [1, 1.2, 1.1, 1],
      },
      duration: config.bgSpeed,
    },
    {
      id: 'blob-2',
      color: '#0F172A',
      size: 700,
      blur: 80,
      position: { bottom: '-15%', right: '-10%' },
      animation: {
        x: [0, -120, -60, 0],
        y: [0, -100, -50, 0],
        scale: [0.9, 1.1, 1, 0.9],
      },
      duration: config.bgSpeed * 0.7,
    },
    {
      id: 'blob-3',
      color: '#312E81',
      size: 600,
      blur: 90,
      position: { top: '30%', right: '20%' },
      animation: {
        x: [0, -80, 40, 0],
        y: [0, 60, -40, 0],
        scale: [1, 0.9, 1.05, 1],
      },
      duration: config.bgSpeed * 0.85,
    },
    {
      id: 'blob-4',
      color: config.primaryColor,
      size: 400,
      blur: 120,
      position: { top: '50%', left: '40%' },
      animation: {
        opacity: [config.glowIntensity * 0.3, config.glowIntensity * 0.6, config.glowIntensity * 0.3],
        scale: [1, 1.15, 1],
      },
      duration: config.bgSpeed * 0.5,
    },
  ], [config]);

  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#02040A' }}
    >
      {/* === NEURAL MESH GRADIENT CANVAS === */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: `blur(${blob.blur}px)`,
            ...blob.position,
          }}
          animate={blob.animation}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* === SUBTLE VIGNETTE === */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, #02040A 100%)',
        }}
      />

      {/* === MONOCHROMATIC NOISE TEXTURE (3%) === */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* === CENTER GLOW (Synced to Cognitive State) === */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${config.primaryColor}20 0%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: config.bgSpeed * 0.3,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />

      {/* === CONTENT LAYER === */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Standalone Background (No Children Wrapper)
// ============================================================================

export function NeuralMeshBackground({ cognitiveState = 'calm' }: { cognitiveState?: CognitiveState }) {
  const config = NEURO_CONFIGS[cognitiveState];

  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ backgroundColor: '#02040A', zIndex: 0 }}
    >
      {/* Blob 1 - Large, Top-Left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 900,
          height: 900,
          background: 'radial-gradient(circle, #1E1B4B 0%, transparent 70%)',
          filter: 'blur(100px)',
          top: '-20%',
          left: '-15%',
        }}
        animate={{
          x: [0, 150, 80, 0],
          y: [0, 80, 150, 0],
          scale: [1, 1.2, 1.1, 1],
        }}
        transition={{
          duration: config.bgSpeed,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2 - Medium, Bottom-Right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, #0F172A 0%, transparent 70%)',
          filter: 'blur(80px)',
          bottom: '-15%',
          right: '-10%',
        }}
        animate={{
          x: [0, -120, -60, 0],
          y: [0, -100, -50, 0],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{
          duration: config.bgSpeed * 0.7,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />

      {/* Blob 3 - Indigo Accent */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, #312E81 0%, transparent 70%)',
          filter: 'blur(90px)',
          top: '30%',
          right: '20%',
        }}
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: config.bgSpeed * 0.85,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />

      {/* Blob 4 - State-Synced Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          background: `radial-gradient(circle, ${config.primaryColor} 0%, transparent 60%)`,
          filter: 'blur(120px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: config.glowIntensity * 0.4,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [config.glowIntensity * 0.3, config.glowIntensity * 0.5, config.glowIntensity * 0.3],
        }}
        transition={{
          duration: config.bgSpeed * 0.4,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, #02040A 100%)',
        }}
      />

      {/* Noise Texture (3%) */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
