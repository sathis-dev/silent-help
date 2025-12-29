"use client";

/**
 * AtmosphericBackground Component
 * 
 * The "Midnight Sanctuary" - Atmospheric Depth rather than flat black.
 * - Primary: Slate-950 (#020617) base
 * - Slow-moving radial gradient of Indigo-900 at 15% opacity
 * - Creates the sensation of "breathing" space
 * 
 * "The void should feel alive, not threatening."
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AtmosphericBackgroundProps {
  children: ReactNode;
  intensity?: 'calm' | 'active' | 'elevated';
}

export function AtmosphericBackground({ 
  children, 
  intensity = 'calm' 
}: AtmosphericBackgroundProps) {
  // Adjust animation based on stress intensity
  const breatheDuration = intensity === 'elevated' ? 8 : intensity === 'active' ? 12 : 16;
  const glowOpacity = intensity === 'elevated' ? 0.2 : intensity === 'active' ? 0.15 : 0.1;

  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#020617' }} // Slate-950
    >
      {/* Primary breathing gradient - slow, comforting pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(49, 46, 129, ${glowOpacity}) 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: breatheDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary ambient glow - offset for depth */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 30% 70%, rgba(30, 27, 75, 0.08) 0%, transparent 60%)`,
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1.05, 1, 1.05],
        }}
        transition={{
          duration: breatheDuration * 1.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: breatheDuration * 0.3,
        }}
      />

      {/* Tertiary warm accent - subtle life */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 40% 30% at 70% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: breatheDuration * 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: breatheDuration * 0.5,
        }}
      />

      {/* Subtle noise texture for organic feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
