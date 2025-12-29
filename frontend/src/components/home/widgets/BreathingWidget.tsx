'use client';

/**
 * Silent Help - Breathing Widget
 * Quick-access breathing exercise
 */

import React from 'react';
import { motion } from 'framer-motion';

interface BreathingWidgetProps {
  onStart: () => void;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

export function BreathingWidget({
  onStart,
  accentColor,
}: BreathingWidgetProps) {
  return (
    <motion.button
      className="col-span-2 p-6 rounded-3xl text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
      }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: '0 0 40px rgba(20, 184, 166, 0.2)',
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onStart}
    >
      {/* Breathing animation */}
      <div className="flex items-center justify-center mb-4">
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)',
            border: '2px solid rgba(20, 184, 166, 0.4)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-3xl">🌊</span>
        </motion.div>
      </div>

      <h3 className="text-white font-medium text-lg">Take a breath</h3>
      <p className="text-slate-400 text-sm mt-1">
        A moment of calm is just a tap away
      </p>

      {/* Decorative wave */}
      <motion.svg
        className="absolute bottom-0 left-0 right-0 h-12 opacity-20"
        viewBox="0 0 400 50"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,25 Q100,0 200,25 Q300,50 400,25 L400,50 L0,50 Z"
          fill="rgba(20, 184, 166, 0.3)"
          animate={{
            d: [
              "M0,25 Q100,0 200,25 Q300,50 400,25 L400,50 L0,50 Z",
              "M0,25 Q100,50 200,25 Q300,0 400,25 L400,50 L0,50 Z",
              "M0,25 Q100,0 200,25 Q300,50 400,25 L400,50 L0,50 Z",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </motion.button>
  );
}

export default BreathingWidget;
