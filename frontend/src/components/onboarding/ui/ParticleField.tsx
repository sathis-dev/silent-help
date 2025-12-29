'use client';

/**
 * Silent Help - Particle Field Background
 * Ambient floating particles for atmospheric effect
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParticleFieldProps {
  intensity?: number;
  color?: string;
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function ParticleField({
  intensity = 0.5,
  color = '#B4A7D6',
  particleCount = 30,
}: ParticleFieldProps) {
  // Generate particles
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: Math.floor(particleCount * intensity) }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
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
        className="absolute w-48 h-48 rounded-full"
        style={{
          right: '15%',
          bottom: '25%',
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
          filter: 'blur(30px)',
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
          delay: 5,
        }}
      />
    </div>
  );
}

export default ParticleField;
