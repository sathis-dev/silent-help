'use client';

/**
 * Silent Help - Pathway Selector Widget
 * Manual pathway selection for explorer persona
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { StressPathway } from '@/lib/types';

interface PathwaySelectorWidgetProps {
  onSelectPathway: (pathway: StressPathway) => void;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

const PATHWAYS = [
  {
    id: 'HIGH' as StressPathway,
    title: 'I need help now',
    description: 'Crisis support & immediate resources',
    icon: '🆘',
    color: '#E53935',
    pulseIntensity: 1.5,
  },
  {
    id: 'MID' as StressPathway,
    title: 'I need to calm down',
    description: 'Grounding & breathing exercises',
    icon: '🌊',
    color: '#F59E0B',
    pulseIntensity: 1.2,
  },
  {
    id: 'LOW' as StressPathway,
    title: 'I want to check in',
    description: 'Journal, reflect, or explore',
    icon: '📝',
    color: '#7FDBCA',
    pulseIntensity: 1.0,
  },
];

export function PathwaySelectorWidget({
  onSelectPathway,
}: PathwaySelectorWidgetProps) {
  return (
    <motion.div
      className="col-span-2 space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-slate-400 text-sm">How can I support you?</p>
      </div>

      {/* Pathway cards */}
      {PATHWAYS.map((pathway, index) => (
        <motion.button
          key={pathway.id}
          className="w-full p-5 rounded-2xl text-left relative overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: `1px solid ${pathway.color}30`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.02,
            y: -2,
            boxShadow: `0 0 30px ${pathway.color}20`,
            borderColor: pathway.color,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectPathway(pathway.id)}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${pathway.color}20 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />

          {/* Pulse for HIGH pathway */}
          {pathway.id === 'HIGH' && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: `2px solid ${pathway.color}` }}
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}

          <div className="relative flex items-center gap-4">
            <motion.span 
              className="text-3xl"
              animate={{ 
                scale: [1, 1.05 * pathway.pulseIntensity, 1],
              }}
              transition={{ 
                duration: 2 / pathway.pulseIntensity,
                repeat: Infinity,
              }}
            >
              {pathway.icon}
            </motion.span>
            
            <div className="flex-1">
              <h3 className="text-white font-medium">{pathway.title}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{pathway.description}</p>
            </div>
            
            <svg 
              className="w-5 h-5 text-slate-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

export default PathwaySelectorWidget;
