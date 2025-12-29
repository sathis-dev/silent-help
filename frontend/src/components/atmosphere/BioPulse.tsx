"use client";

/**
 * BioPulse Component
 * 
 * The "Pulse Sync" - A central, breathing liquid shape that:
 * - Syncs with user's heartbeat if wearable is connected
 * - Falls back to calming 4-7-8 rhythm
 * - Uses liquid/organic shape morphing
 * 
 * "Anti-Headspace: Not a video. A real-time biological interaction."
 */

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface BioPulseProps {
  heartRate?: number; // BPM from wearable, null if not connected
  stressLevel?: 'low' | 'mid' | 'high';
  size?: 'sm' | 'md' | 'lg';
  onTap?: () => void;
}

// Default breathing rhythm (4-7-8 pattern)
const DEFAULT_BREATHE_DURATION = 8; // seconds

// Convert BPM to animation duration
const bpmToDuration = (bpm: number) => 60 / bpm;

export function BioPulse({ 
  heartRate, 
  stressLevel = 'low',
  size = 'lg',
  onTap
}: BioPulseProps) {
  const [isConnected, setIsConnected] = useState(!!heartRate);
  const [currentBpm, setCurrentBpm] = useState(heartRate || 60);

  // Spring physics for organic movement
  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 20 });
  
  // Color based on stress level
  const colors = {
    low: { 
      primary: '#0D9488', // Teal-600
      glow: 'rgba(13, 148, 136, 0.4)',
      ring: 'rgba(13, 148, 136, 0.2)'
    },
    mid: { 
      primary: '#F59E0B', // Amber-500
      glow: 'rgba(245, 158, 11, 0.4)',
      ring: 'rgba(245, 158, 11, 0.2)'
    },
    high: { 
      primary: '#EF4444', // Red-500
      glow: 'rgba(239, 68, 68, 0.4)',
      ring: 'rgba(239, 68, 68, 0.2)'
    }
  };

  const color = colors[stressLevel];
  const pulseDuration = heartRate ? bpmToDuration(heartRate) : DEFAULT_BREATHE_DURATION;

  // Size mappings
  const sizeMap = {
    sm: { container: 120, blob: 80 },
    md: { container: 180, blob: 120 },
    lg: { container: 260, blob: 180 }
  };
  const dimensions = sizeMap[size];

  // Blob path variations for liquid morphing
  const blobPaths = [
    "M44.5,-51.2C56.9,-40.3,65.7,-25.3,68.1,-9.1C70.5,7.1,66.5,24.5,56.8,37.9C47.1,51.3,31.6,60.7,14.6,65.3C-2.4,69.9,-21,69.7,-36.6,62.1C-52.2,54.5,-64.8,39.5,-70.1,22.4C-75.4,5.3,-73.4,-13.9,-65.2,-29.8C-57,-45.7,-42.6,-58.3,-27.2,-68.1C-11.8,-77.9,4.6,-84.9,19.4,-81.1C34.2,-77.3,47.4,-62.7,44.5,-51.2Z",
    "M42.7,-47.8C55.4,-37.4,65.4,-23.7,68.3,-8.3C71.2,7.1,67,24.2,57.3,37.7C47.6,51.2,32.4,61.1,15.7,66.4C-1,71.7,-19.2,72.4,-34.8,65.9C-50.4,59.4,-63.4,45.7,-69.8,29.4C-76.2,13.1,-76,-5.8,-69.6,-22.1C-63.2,-38.4,-50.6,-52.1,-36.5,-62.1C-22.4,-72.1,-6.8,-78.4,5.2,-84.5C17.2,-90.6,30,-58.2,42.7,-47.8Z",
    "M47.3,-54C59.7,-43.8,67.1,-27.5,69.4,-10.7C71.7,6.1,68.9,23.4,60.2,37.5C51.5,51.6,36.9,62.5,20.3,68.4C3.7,74.3,-14.9,75.2,-31.4,69.1C-47.9,63,-62.3,49.9,-69.7,33.8C-77.1,17.7,-77.5,-1.4,-71.8,-18.1C-66.1,-34.8,-54.3,-49.1,-40.4,-59C-26.5,-68.9,-10.5,-74.4,3.7,-78.8C17.9,-83.2,34.9,-64.2,47.3,-54Z"
  ];

  return (
    <motion.div
      className="relative flex items-center justify-center cursor-pointer"
      style={{ 
        width: dimensions.container, 
        height: dimensions.container 
      }}
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{
            width: dimensions.blob + ring * 30,
            height: dimensions.blob + ring * 30,
            background: `radial-gradient(circle, ${color.ring} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1 + ring * 0.05, 1],
            opacity: [0.3 - ring * 0.08, 0.5 - ring * 0.08, 0.3 - ring * 0.08],
          }}
          transition={{
            duration: pulseDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ring * 0.2,
          }}
        />
      ))}

      {/* Main liquid blob */}
      <motion.div
        className="absolute"
        style={{
          width: dimensions.blob,
          height: dimensions.blob,
          filter: `drop-shadow(0 0 20px ${color.glow})`,
        }}
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg 
          viewBox="-100 -100 200 200" 
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="pulseGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor={color.primary} stopOpacity="0.9" />
              <stop offset="70%" stopColor={color.primary} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color.primary} stopOpacity="0.3" />
            </radialGradient>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              />
            </filter>
          </defs>
          <motion.path
            fill="url(#pulseGradient)"
            animate={{
              d: blobPaths,
            }}
            transition={{
              duration: pulseDuration * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              filter: 'url(#goo)',
              transformOrigin: 'center',
            }}
          />
        </svg>
      </motion.div>

      {/* Center content */}
      <motion.div
        className="absolute flex flex-col items-center justify-center text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isConnected && heartRate ? (
          <>
            <span className="text-3xl font-light text-white/90">{currentBpm}</span>
            <span className="text-xs text-white/50 mt-1">BPM</span>
          </>
        ) : (
          <motion.span
            className="text-lg text-white/70 font-light"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            breathe
          </motion.span>
        )}
      </motion.div>

      {/* Connection indicator */}
      {!isConnected && (
        <motion.div
          className="absolute -bottom-2 text-xs text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          tap to sync
        </motion.div>
      )}
    </motion.div>
  );
}
