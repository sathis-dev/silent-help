'use client';

/**
 * Silent Help - Emotion Orb Component
 * Floating, glowing emotion selector for onboarding
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { OnboardingOption } from '@/lib/types/onboarding';

interface EmotionOrbProps {
  option: OnboardingOption;
  isSelected: boolean;
  isHovered: boolean;
  isOtherSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

export function EmotionOrb({
  option,
  isSelected,
  isHovered,
  isOtherSelected,
  onSelect,
  onHover,
  onHoverEnd,
}: EmotionOrbProps) {
  return (
    <motion.button
      className="relative w-full p-6 rounded-3xl text-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${option.color}30 0%, ${option.color}15 100%)`
          : 'rgba(15, 23, 42, 0.8)',
        border: `1px solid ${isSelected || isHovered ? option.color : 'rgba(148, 163, 184, 0.15)'}`,
        backdropFilter: 'blur(20px)',
        opacity: isOtherSelected && !isSelected ? 0.4 : 1,
      }}
      animate={{
        scale: isSelected ? 1.03 : isHovered ? 1.02 : 1,
        y: isHovered ? -4 : 0,
        boxShadow: isSelected || isHovered
          ? `0 0 40px ${option.color}25, 0 10px 40px rgba(0,0,0,0.2)`
          : '0 4px 20px rgba(0,0,0,0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onHoverStart={onHover}
      onHoverEnd={onHoverEnd}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Glassmorphism highlight */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      />

      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${option.color}30 0%, transparent 70%)`,
        }}
        animate={{
          opacity: isSelected ? 0.8 : isHovered ? 0.5 : 0.1,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Selection pulse */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: `2px solid ${option.color}` }}
          animate={{
            scale: [1, 1.05],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: 1,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="text-4xl mb-3"
          animate={{
            scale: isSelected ? [1, 1.2, 1.1] : isHovered ? 1.1 : 1,
            y: isHovered ? -2 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {option.icon}
        </motion.div>

        {/* Label */}
        <motion.h3
          className="text-lg font-medium text-white mb-1"
          animate={{ color: isSelected ? option.color : '#FFFFFF' }}
        >
          {option.label}
        </motion.h3>

        {/* Description */}
        {option.description && (
          <motion.p
            className="text-sm text-slate-400"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered || isSelected ? 1 : 0.7,
              height: 'auto',
            }}
          >
            {option.description}
          </motion.p>
        )}
      </div>
    </motion.button>
  );
}

export default EmotionOrb;
