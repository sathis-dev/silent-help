'use client';

/**
 * Silent Help - Sanctuary Center
 * "The Heart of Calm" - Central sanctuary visualization
 * 
 * The main focal point of the desktop experience.
 * Features a breathing orb, biometric visualization, and quick actions.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserPersona } from '@/lib/types/onboarding';

// ============================================================================
// Persona Colors
// ============================================================================

const PERSONA_COLORS: Record<UserPersona, { primary: string; secondary: string; glow: string }> = {
  crisis_seeker: { 
    primary: '#E53935', 
    secondary: '#F472B6',
    glow: 'rgba(229, 57, 53, 0.3)',
  },
  anxiety_manager: { 
    primary: '#B4A7D6', 
    secondary: '#8B7FB8',
    glow: 'rgba(180, 167, 214, 0.3)',
  },
  stress_professional: { 
    primary: '#60A5FA', 
    secondary: '#3B82F6',
    glow: 'rgba(96, 165, 250, 0.3)',
  },
  curious_explorer: { 
    primary: '#7FDBCA', 
    secondary: '#4ECDB3',
    glow: 'rgba(127, 219, 202, 0.3)',
  },
  caregiver: { 
    primary: '#F472B6', 
    secondary: '#DB2777',
    glow: 'rgba(244, 114, 182, 0.3)',
  },
  returning_user: { 
    primary: '#7FDBCA', 
    secondary: '#B4A7D6',
    glow: 'rgba(127, 219, 202, 0.3)',
  },
};

// ============================================================================
// Quick Tools Configuration
// ============================================================================

interface QuickTool {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  color: string;
}

const QUICK_TOOLS: QuickTool[] = [
  {
    id: 'breathing',
    label: 'Breathing',
    description: 'Calm your nervous system',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    duration: '2 min',
    color: '#4ECDB3',
  },
  {
    id: 'grounding',
    label: 'Grounding',
    description: '5-4-3-2-1 technique',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M5 10l7 7 7-7" />
        <circle cx="12" cy="21" r="2" />
      </svg>
    ),
    duration: '5 min',
    color: '#B4A7D6',
  },
  {
    id: 'journal',
    label: 'Journal',
    description: 'Express your thoughts',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    duration: 'Open',
    color: '#F472B6',
  },
  {
    id: 'bodyscan',
    label: 'Body Scan',
    description: 'Connect with your body',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v8M8 21l2-5h4l2 5M6 12h12" />
      </svg>
    ),
    duration: '10 min',
    color: '#60A5FA',
  },
];

// ============================================================================
// Sanctuary Center Component
// ============================================================================

interface SanctuaryCenterProps {
  persona: UserPersona;
  displayName: string;
  onToolSelect: (tool: string) => void;
  onSOS: () => void;
}

export function SanctuaryCenter({ 
  persona, 
  displayName, 
  onToolSelect,
  onSOS 
}: SanctuaryCenterProps) {
  const [heartRate, setHeartRate] = useState(65);
  const [stressLevel, setStressLevel] = useState<'calm' | 'moderate' | 'elevated'>('calm');
  const colors = PERSONA_COLORS[persona];
  
  // Simulate biometric data
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(55, Math.min(90, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      {/* Sanctuary Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.h1 
          className="text-4xl font-light text-white mb-3"
          style={{ letterSpacing: '0.05em' }}
        >
          Your Sanctuary
        </motion.h1>
        <motion.p 
          className="text-slate-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A safe space, just for you
        </motion.p>
      </motion.div>
      
      {/* Central Orb */}
      <motion.div
        className="relative w-72 h-72 flex items-center justify-center mb-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Middle ring - breathing */}
        <motion.div
          className="absolute w-56 h-56 rounded-full border"
          style={{
            borderColor: `${colors.primary}30`,
          }}
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Inner orb */}
        <motion.div
          className="w-44 h-44 rounded-full flex flex-col items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)`,
            border: `2px solid ${colors.primary}40`,
            boxShadow: `0 0 80px ${colors.glow}`,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Heart Rate Display */}
          <motion.span 
            className="text-5xl font-light"
            style={{ color: colors.primary }}
            key={heartRate}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {heartRate}
          </motion.span>
          <span className="text-sm text-slate-400 mt-1">BPM</span>
          
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${colors.primary}`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 60 / heartRate,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </motion.div>
        
        {/* Stress Level Indicator */}
        <motion.div
          className="absolute -bottom-2 px-4 py-1.5 rounded-full text-sm"
          style={{
            background: stressLevel === 'calm' 
              ? 'rgba(16, 185, 129, 0.2)'
              : stressLevel === 'moderate'
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${
              stressLevel === 'calm' 
                ? 'rgba(16, 185, 129, 0.4)'
                : stressLevel === 'moderate'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(239, 68, 68, 0.4)'
            }`,
            color: stressLevel === 'calm' 
              ? '#10B981'
              : stressLevel === 'moderate'
                ? '#F59E0B'
                : '#EF4444',
          }}
        >
          {stressLevel === 'calm' ? '✨ Calm' : stressLevel === 'moderate' ? '⚡ Moderate' : '🔥 Elevated'}
        </motion.div>
      </motion.div>
      
      {/* Quick Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-3xl"
      >
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 text-center">
          Quick Access
        </h3>
        
        <div className="grid grid-cols-4 gap-4">
          {QUICK_TOOLS.map((tool, index) => (
            <motion.button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="group relative p-6 rounded-2xl text-left transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{ 
                scale: 1.02,
                background: 'rgba(255,255,255,0.06)',
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle at center, ${tool.color}10, transparent 70%)`,
                }}
              />
              
              {/* Icon */}
              <div 
                className="mb-4 text-slate-400 group-hover:text-white transition-colors"
                style={{ color: tool.color }}
              >
                {tool.icon}
              </div>
              
              {/* Label */}
              <h4 className="text-white font-medium mb-1 group-hover:translate-x-1 transition-transform">
                {tool.label}
              </h4>
              
              {/* Description */}
              <p className="text-sm text-slate-500 mb-3">
                {tool.description}
              </p>
              
              {/* Duration Badge */}
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: `${tool.color}15`,
                  color: tool.color,
                }}
              >
                {tool.duration}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* Floating Message - Persona-specific */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <PersonaMessage persona={persona} displayName={displayName} />
      </motion.div>
    </div>
  );
}

// ============================================================================
// Persona-specific Messages
// ============================================================================

function PersonaMessage({ persona, displayName }: { persona: UserPersona; displayName: string }) {
  const messages: Record<UserPersona, string> = {
    crisis_seeker: "You're safe here. Take all the time you need.",
    anxiety_manager: "One breath at a time. You've got this.",
    stress_professional: "Take a moment to reset. Your wellbeing matters.",
    curious_explorer: "Explore freely. There's no right or wrong way.",
    caregiver: "Remember to care for yourself too.",
    returning_user: `Welcome back, ${displayName}. Your sanctuary awaits.`,
  };
  
  return (
    <motion.p
      className="text-slate-500 text-sm italic"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      {messages[persona]}
    </motion.p>
  );
}
