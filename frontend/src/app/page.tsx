"use client";

/**
 * Silent Help - The Sentient Health Companion
 * ACTIVE HEALTH INTELLIGENCE (AHI) Platform
 * 
 * "Silent Help isn't a tool that waits for the user.
 *  It's a sentient guardian that anticipates crisis before
 *  the user even recognizes the symptoms."
 * 
 * THE MIDNIGHT SANCTUARY - A living, breathing digital haven.
 * 
 * Core Features:
 * 1. Neuro-Adaptive UI - Interface physically changes based on cognitive load
 * 2. Ghost Layer - Proactive interventions triggered by biometrics
 * 3. Clinical Safety - DCB0129 compliant hazard management
 * 4. Model Transparency - Users see WHY the AI made decisions
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuroAdaptiveProvider, useNeuroAdaptiveContext } from '@/components/providers/NeuroAdaptiveProvider';
import { GhostIntervention } from '@/components/interventions/GhostIntervention';
import { TransparencyDrawer, TransparencyIndicator } from '@/components/transparency/TransparencyDrawer';
import { OnboardingProvider, OnboardingFlow, useOnboarding } from '@/components/onboarding';
import { ResponsiveHomeWrapper } from '@/components/desktop';
import type { StressPathway } from '@/lib/types';
import type { UserProfile } from '@/lib/types/onboarding';

// ============================================================================
// Premium Color Palette - 2025 Wellness Trends
// ============================================================================

const COLORS = {
  // Midnight Sanctuary Base
  sanctuary: {
    deep: '#020617',      // Slate-950 - The void
    surface: '#0F172A',   // Slate-900
    elevated: '#1E293B',  // Slate-800
  },
  // Digital Lavender - Luxury Calm
  lavender: {
    primary: '#B4A7D6',
    soft: '#D8D0E8',
    deep: '#8B7FB8',
    glow: 'rgba(180, 167, 214, 0.35)',
  },
  // Neo-Mint - Fresh Vitality
  mint: {
    primary: '#7FDBCA',
    soft: '#B8F0E4',
    deep: '#4ECDB3',
    glow: 'rgba(127, 219, 202, 0.35)',
  },
  // Lifebuoy Red - SOS
  lifebuoy: {
    primary: '#E53935',
    soft: '#FFCDD2',
    glow: 'rgba(229, 57, 53, 0.5)',
  },
  // Amber - Awareness
  amber: {
    primary: '#F59E0B',
    soft: '#FCD34D',
    glow: 'rgba(245, 158, 11, 0.35)',
  },
};

// ============================================================================
// Atmospheric Mesh Background
// ============================================================================

interface GradientOrb {
  x: number;
  y: number;
  size: number;
  color: string;
  blur: number;
  duration: number;
}

function AtmosphericMeshLayer({ cognitiveState }: { cognitiveState: string }) {
  // Deep, moody colors - NOT bright whites
  const orbs: GradientOrb[] = cognitiveState === 'crisis' ? [
    { x: 30, y: 40, size: 80, color: '#3D1A1A', blur: 150, duration: 8 },   // Deep blood red
    { x: 70, y: 60, size: 60, color: '#2D1515', blur: 180, duration: 10 },  // Darker red
    { x: 50, y: 80, size: 50, color: '#1A0A0A', blur: 120, duration: 12 },  // Near black red
  ] : cognitiveState === 'high_stress' ? [
    { x: 25, y: 35, size: 70, color: '#2D2510', blur: 150, duration: 10 },  // Deep amber
    { x: 75, y: 65, size: 55, color: '#1F1A0A', blur: 160, duration: 12 },  // Dark gold
    { x: 50, y: 20, size: 45, color: '#0A1A15', blur: 140, duration: 14 },  // Deep teal
  ] : cognitiveState === 'maintenance' ? [
    { x: 30, y: 40, size: 75, color: '#1A1525', blur: 160, duration: 15 },  // Deep lavender
    { x: 70, y: 60, size: 60, color: '#15102A', blur: 170, duration: 18 },  // Darker purple
    { x: 50, y: 85, size: 45, color: '#0A1A18', blur: 130, duration: 20 },  // Deep mint
  ] : [
    // CALM STATE - The Midnight Sanctuary
    { x: 20, y: 30, size: 80, color: '#0A1F1A', blur: 180, duration: 20 },  // Deep teal
    { x: 80, y: 70, size: 65, color: '#0D2520', blur: 160, duration: 25 },  // Forest depth
    { x: 50, y: 90, size: 50, color: '#12101F', blur: 140, duration: 30 },  // Deep indigo
    { x: 60, y: 20, size: 40, color: '#151525', blur: 120, duration: 22 },  // Night purple
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Deep black base - TRUE Midnight Sanctuary */}
      <div 
        className="absolute inset-0"
        style={{
          background: '#020617',  // Pure slate-950
        }}
      />
      
      {/* Subtle breathing gradient - very low opacity */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% 40%, rgba(13, 148, 136, 0.08) 0%, transparent 60%)',
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Deep colored orbs - VERY subtle */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${orb.size}%`,
            height: `${orb.size}%`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at center, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 25, -10, 0],
            scale: [1, 1.05, 0.95, 1.02, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Secondary ambient glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 30% 70%, rgba(30, 27, 75, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Deep vignette for focus */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(2, 6, 23, 0.7) 100%)',
        }}
      />
    </div>
  );
}

// ============================================================================
// Premium Bio Pulse (Heart Rate / Wearable Sync)
// ============================================================================

function PremiumBioPulse({ 
  heartRate = 65, 
  stressLevel = 'calm',
  onTap 
}: { 
  heartRate?: number; 
  stressLevel?: 'calm' | 'elevated' | 'high';
  onTap?: () => void;
}) {
  const pulseColor = stressLevel === 'high' ? COLORS.lifebuoy.primary 
    : stressLevel === 'elevated' ? COLORS.amber.primary 
    : COLORS.mint.primary;

  const pulseGlow = stressLevel === 'high' ? COLORS.lifebuoy.glow 
    : stressLevel === 'elevated' ? COLORS.amber.glow 
    : COLORS.mint.glow;

  // Calculate pulse rate from heart rate
  const pulseDuration = heartRate > 0 ? 60 / heartRate : 1;

  return (
    <motion.div 
      className="relative cursor-pointer"
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow rings - subtle */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${pulseColor}`,
            opacity: 0.15 / ring,
          }}
          animate={{
            scale: [1, 1.3 + ring * 0.15, 1],
            opacity: [0.15 / ring, 0, 0.15 / ring],
          }}
          transition={{
            duration: pulseDuration * 2,
            repeat: Infinity,
            delay: ring * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Main pulse orb - dark with subtle color */}
      <motion.div
        className="relative w-32 h-32 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)`,
          border: `1px solid ${pulseColor}40`,
          boxShadow: `0 0 40px ${pulseColor}15, inset 0 0 20px ${pulseColor}10`,
        }}
        animate={{
          scale: [1, 1.03, 1],
          boxShadow: [
            `0 0 40px ${pulseColor}15, inset 0 0 20px ${pulseColor}10`,
            `0 0 50px ${pulseColor}25, inset 0 0 25px ${pulseColor}15`,
            `0 0 40px ${pulseColor}15, inset 0 0 20px ${pulseColor}10`,
          ],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Inner content */}
        <div className="text-center">
          <motion.span 
            className="text-4xl font-light"
            style={{ color: pulseColor }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: pulseDuration, repeat: Infinity }}
          >
            {heartRate}
          </motion.span>
          <div className="text-xs text-slate-400 mt-1">BPM</div>
        </div>
        
        {/* Connection indicator - subtle */}
        <motion.div 
          className="absolute -bottom-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: pulseColor, opacity: 0.6 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Ghost Greeting - Semantic Memory
// ============================================================================

function GhostGreeting({ userName = 'friend' }: { userName?: string }) {
  const [greeting, setGreeting] = useState({ main: '', sub: '' });

  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 23 || hour < 4) {
      setGreeting({
        main: `It's late, ${userName}`,
        sub: "I'm here with you in the quiet hours",
      });
    } else if (hour >= 4 && hour < 12) {
      setGreeting({
        main: `Good morning, ${userName}`,
        sub: "How are you arriving in this day?",
      });
    } else if (hour >= 12 && hour < 17) {
      setGreeting({
        main: `Afternoon, ${userName}`,
        sub: "A moment to check in with yourself",
      });
    } else {
      setGreeting({
        main: `Evening, ${userName}`,
        sub: "Let the day's weight begin to settle",
      });
    }
  }, [userName]);

  return (
    <motion.div 
      className="text-center px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <motion.h1 
        className="text-3xl font-light tracking-wide"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.lavender.soft} 0%, ${COLORS.mint.soft} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {greeting.main}
      </motion.h1>
      <motion.p 
        className="text-slate-400 mt-2 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {greeting.sub}
      </motion.p>
    </motion.div>
  );
}

// ============================================================================
// Premium Pathway Cards
// ============================================================================

interface PathwayCardProps {
  pathway: StressPathway;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colors: { bg: string; glow: string; text: string; border: string };
  pulseIntensity: number;
  onSelect: () => void;
  delay: number;
}

function PathwayCard({ 
  title, subtitle, icon, colors, pulseIntensity, onSelect, delay 
}: PathwayCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className="relative w-full p-6 rounded-3xl text-left overflow-hidden border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',  // Dark slate with transparency
        borderColor: colors.border,
        backdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 80, 
        damping: 15,
        delay,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Dark glassmorphism overlay */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
        }}
        animate={{
          opacity: isHovered ? [0.4, 0.7, 0.4] : [0.15, 0.25, 0.15],
          scale: isHovered ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2 / pulseIntensity,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Pulse ring for HIGH pathway */}
      {pulseIntensity > 1 && (
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 pointer-events-none"
          style={{ borderColor: colors.glow }}
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        <motion.div 
          className="text-3xl"
          animate={{ scale: isHovered ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            {title}
          </h2>
          <p className="text-sm text-slate-300 mt-0.5">{subtitle}</p>
        </div>
        <motion.svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          animate={{ x: isHovered ? 4 : 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </motion.svg>
      </div>
    </motion.button>
  );
}

// ============================================================================
// Micro-Tools Feed (Horizontal Scroll)
// ============================================================================

interface MicroTool {
  id: string;
  icon: string;
  name: string;
  duration: string;
  description: string;
  color: string;
}

const MICRO_TOOLS: MicroTool[] = [
  { id: 'sleep-reset', icon: '🌙', name: '5-min Sleep Reset', duration: '5 min', description: "It's late. This might help.", color: COLORS.lavender.primary },
  { id: 'night-mind', icon: '💭', name: 'Quiet the Night Mind', duration: '3 min', description: 'For racing thoughts', color: COLORS.mint.primary },
  { id: 'body-scan', icon: '✨', name: 'Quick Body Scan', duration: '2 min', description: 'Release tension', color: COLORS.lavender.soft },
  { id: 'breathing', icon: '🌊', name: 'Ocean Breathing', duration: '4 min', description: 'Sync with calm', color: COLORS.mint.soft },
];

function MicroToolsFeed({ onToolSelect }: { onToolSelect: (id: string) => void }) {
  return (
    <motion.div 
      className="px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.mint.primary }} />
        <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">Suggested for you</span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {MICRO_TOOLS.map((tool, i) => (
          <motion.button
            key={tool.id}
            className="flex-shrink-0 w-40 p-4 rounded-2xl text-left"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${tool.color}30`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 0 20px ${tool.color}10`,
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
            whileHover={{ scale: 1.03, y: -2, boxShadow: `0 0 30px ${tool.color}25` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onToolSelect(tool.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{tool.icon}</span>
              <span className="text-xs font-medium" style={{ color: tool.color }}>{tool.duration}</span>
            </div>
            <div className="text-sm font-semibold text-white">{tool.name}</div>
            <div className="text-xs text-slate-400 mt-1">{tool.description}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Premium SOS Button
// ============================================================================

function SOSButton({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      className="relative w-16 h-16 rounded-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.lifebuoy.primary} 0%, #C62828 100%)`,
        boxShadow: `0 0 30px ${COLORS.lifebuoy.glow}, 0 4px 20px rgba(0,0,0,0.3)`,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPress}
    >
      {/* Pulse rings */}
      {[1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${COLORS.lifebuoy.primary}` }}
          animate={{
            scale: [1, 1.4 + ring * 0.1],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: ring * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
      <span className="text-white font-bold text-sm">SOS</span>
    </motion.button>
  );
}

// ============================================================================
// Premium Navigation Bar
// ============================================================================

function PremiumNavBar({ 
  onHome, 
  onJournal, 
  onSOS 
}: { 
  onHome: () => void; 
  onJournal: () => void; 
  onSOS: () => void;
}) {
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
    >
      {/* Glassmorphism background */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.8) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      />
      
      <div className="relative flex items-center justify-around py-4 pb-safe max-w-md mx-auto">
        {/* Home */}
        <motion.button
          className="flex flex-col items-center gap-1 px-6"
          whileTap={{ scale: 0.9 }}
          onClick={onHome}
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-xs text-slate-500">Home</span>
        </motion.button>

        {/* SOS - Center prominent */}
        <div className="-mt-8">
          <SOSButton onPress={onSOS} />
        </div>

        {/* Journal */}
        <motion.button
          className="flex flex-col items-center gap-1 px-6"
          whileTap={{ scale: 0.9 }}
          onClick={onJournal}
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          <span className="text-xs text-slate-500">Journal</span>
        </motion.button>
      </div>
      
      {/* Trust badges */}
      <div className="relative flex justify-center items-center gap-2 pb-2 text-[10px] text-slate-600">
        <span>🔒 UK Encrypted</span>
        <span>•</span>
        <span>NHS Compliant</span>
        <span>•</span>
        <span>Zero data sharing</span>
      </div>
    </motion.nav>
  );
}

// ============================================================================
// HIGH Pathway View - Crisis Support
// ============================================================================

function HighPathwayView({ onBack, onSOS }: { onBack: () => void; onSOS: () => void }) {
  const [showBreathing, setShowBreathing] = useState(false);

  const crisisResources = [
    { name: 'Emergency Services', number: '999', description: 'For immediate danger', icon: '🚨', color: '#E53935' },
    { name: 'Samaritans', number: '116 123', description: '24/7 emotional support', icon: '💚', color: '#10B981' },
    { name: 'Shout', number: 'Text SHOUT to 85258', description: 'Free text support', icon: '💬', color: '#8B5CF6' },
    { name: 'NHS 111', number: '111', description: 'Health advice', icon: '🏥', color: '#0EA5E9' },
  ];

  if (showBreathing) {
    return <BreathingView onBack={() => setShowBreathing(false)} selectedTool="calm-breathing" />;
  }

  return (
    <motion.main
      key="high-pathway"
      className="relative z-10 flex flex-col min-h-screen pb-32 px-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pt-20 pb-6 text-center">
        <motion.h1 
          className="text-3xl font-light text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          You are not alone
        </motion.h1>
        <p className="text-slate-400">Support is here for you</p>
      </div>

      <div className="flex-1 space-y-4 max-w-md mx-auto w-full">
        {crisisResources.map((resource, i) => (
          <motion.a
            key={resource.name}
            href={`tel:${resource.number.replace(/\s/g, '')}`}
            className="block w-full p-5 rounded-2xl text-left"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${resource.color}40`,
              boxShadow: `0 0 20px ${resource.color}15`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{resource.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{resource.name}</div>
                <div className="text-lg font-bold" style={{ color: resource.color }}>{resource.number}</div>
                <div className="text-sm text-slate-400">{resource.description}</div>
              </div>
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </motion.a>
        ))}

        {/* Breathing Exercise Button */}
        <motion.button
          className="w-full p-5 rounded-2xl text-left"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.1) 100%)',
            border: '1px solid rgba(20, 184, 166, 0.4)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBreathing(true)}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🌊</span>
            <div className="flex-1">
              <div className="font-semibold text-white">Calm Breathing</div>
              <div className="text-sm text-slate-400">A moment to breathe together</div>
            </div>
            <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      </div>
    </motion.main>
  );
}

// ============================================================================
// MID Pathway View - Grounding & Calming
// ============================================================================

function MidPathwayView({ onBack }: { onBack: () => void }) {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const tools = [
    { id: '54321', name: '5-4-3-2-1 Grounding', description: 'Use your senses to ground yourself', icon: '🖐️', color: '#8B5CF6' },
    { id: 'breathing', name: 'Box Breathing', description: '4 seconds in, hold, out, hold', icon: '🌬️', color: '#14B8A6' },
    { id: 'body-scan', name: 'Body Scan', description: 'Release tension from your body', icon: '✨', color: '#F59E0B' },
    { id: 'cold-water', name: 'Cold Water Technique', description: 'Reset your nervous system', icon: '💧', color: '#0EA5E9' },
  ];

  if (activeExercise === 'breathing') {
    return <BreathingView onBack={() => setActiveExercise(null)} selectedTool="box-breathing" />;
  }

  if (activeExercise === '54321') {
    return <GroundingExerciseView onBack={() => setActiveExercise(null)} />;
  }

  if (activeExercise === 'body-scan') {
    return <BodyScanView onBack={() => setActiveExercise(null)} />;
  }

  if (activeExercise === 'cold-water') {
    return <ColdWaterView onBack={() => setActiveExercise(null)} />;
  }

  return (
    <motion.main
      key="mid-pathway"
      className="relative z-10 flex flex-col min-h-screen pb-32 px-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pt-20 pb-6 text-center">
        <motion.h1 
          className="text-3xl font-light text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Let's find what helps
        </motion.h1>
        <p className="text-slate-400">Small steps can make a difference</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.id}
            className="p-5 rounded-2xl text-center"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${tool.color}40`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${tool.color}30` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveExercise(tool.id)}
          >
            <span className="text-4xl block mb-3">{tool.icon}</span>
            <div className="font-semibold text-white text-sm">{tool.name}</div>
            <div className="text-xs text-slate-400 mt-1">{tool.description}</div>
          </motion.button>
        ))}
      </div>
    </motion.main>
  );
}

// ============================================================================
// LOW Pathway View - Reflection & Journal
// ============================================================================

function LowPathwayView({ onBack }: { onBack: () => void }) {
  const [journalEntry, setJournalEntry] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (journalEntry.trim()) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <motion.main
      key="low-pathway"
      className="relative z-10 flex flex-col min-h-screen pb-32 px-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pt-20 pb-6 text-center">
        <motion.h1 
          className="text-3xl font-light text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          A space for reflection
        </motion.h1>
        <p className="text-slate-400">How are you feeling right now?</p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Journal Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write whatever comes to mind... There's no wrong way to feel."
            className="w-full h-48 p-4 rounded-2xl resize-none text-white placeholder-slate-500"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(127, 219, 202, 0.3)',
            }}
          />
        </motion.div>

        {/* Save Button */}
        <motion.button
          className="w-full py-4 rounded-2xl font-medium text-white"
          style={{
            background: isSaved 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : 'linear-gradient(135deg, rgba(127, 219, 202, 0.3) 0%, rgba(127, 219, 202, 0.1) 100%)',
            border: '1px solid rgba(127, 219, 202, 0.4)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
        >
          {isSaved ? '✓ Saved' : 'Save Entry'}
        </motion.button>

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-slate-400 text-sm mb-4">How would you describe your mood?</p>
          <div className="flex justify-center gap-4">
            {['😔', '😐', '🙂', '😊', '😄'].map((emoji, i) => (
              <motion.button
                key={emoji}
                className="text-3xl p-2 rounded-full"
                style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                whileHover={{ scale: 1.2, background: 'rgba(127, 219, 202, 0.2)' }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}

// ============================================================================
// Breathing View
// ============================================================================

function BreathingView({ onBack, selectedTool }: { onBack: () => void; selectedTool: string | null }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const durations = { inhale: 4, hold: 4, exhale: 4, rest: 4 };
    const nextPhase = { inhale: 'hold', hold: 'exhale', exhale: 'rest', rest: 'inhale' } as const;
    
    const countInterval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => nextPhase[p]);
          return durations[nextPhase[phase]];
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(countInterval);
  }, [phase, isActive]);

  const phaseText = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    rest: 'Rest',
  };

  const phaseColor = {
    inhale: '#14B8A6',
    hold: '#8B5CF6',
    exhale: '#F59E0B',
    rest: '#6366F1',
  };

  return (
    <motion.main
      key="breathing"
      className="relative z-10 flex flex-col min-h-screen pb-32 items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center mb-12">
        <h1 className="text-2xl font-light text-white mb-2">Box Breathing</h1>
        <p className="text-slate-400 text-sm">Follow the rhythm</p>
      </div>

      {/* Breathing Circle */}
      <motion.div
        className="relative w-64 h-64 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${phaseColor[phase]}20 0%, transparent 70%)`,
          border: `2px solid ${phaseColor[phase]}60`,
        }}
        animate={{
          scale: phase === 'inhale' ? [1, 1.3] : phase === 'exhale' ? [1.3, 1] : 1.3,
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        <div className="text-center">
          <motion.div 
            className="text-6xl font-light mb-2"
            style={{ color: phaseColor[phase] }}
            key={count}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {count}
          </motion.div>
          <div className="text-xl text-white font-medium">{phaseText[phase]}</div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="mt-12 flex gap-4">
        <motion.button
          className="px-6 py-3 rounded-full text-white"
          style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button
          className="px-6 py-3 rounded-full text-white"
          style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
        >
          Done
        </motion.button>
      </div>
    </motion.main>
  );
}

// ============================================================================
// 5-4-3-2-1 Grounding Exercise View
// ============================================================================

function GroundingExerciseView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see around you', icon: '👁️', color: '#8B5CF6' },
    { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can physically feel', icon: '🖐️', color: '#14B8A6' },
    { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear right now', icon: '👂', color: '#F59E0B' },
    { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', icon: '👃', color: '#EC4899' },
    { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', icon: '👅', color: '#6366F1' },
  ];

  const currentStep = steps[step];

  return (
    <motion.main
      key="grounding"
      className="relative z-10 flex flex-col min-h-screen pb-32 items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {step < steps.length ? (
          <motion.div
            key={step}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-6xl mb-6 block">{currentStep.icon}</span>
            <div 
              className="text-7xl font-bold mb-4"
              style={{ color: currentStep.color }}
            >
              {currentStep.count}
            </div>
            <div className="text-2xl text-white font-medium mb-2">{currentStep.sense}</div>
            <p className="text-slate-400 max-w-xs">{currentStep.prompt}</p>

            <motion.button
              className="mt-8 px-8 py-4 rounded-full text-white font-medium"
              style={{ 
                background: `linear-gradient(135deg, ${currentStep.color} 0%, ${currentStep.color}80 100%)`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(s => s + 1)}
            >
              {step < steps.length - 1 ? 'Next' : 'Complete'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-6 block">✨</span>
            <h2 className="text-2xl text-white font-medium mb-2">Well done</h2>
            <p className="text-slate-400 mb-8">You've grounded yourself in the present moment</p>
            <motion.button
              className="px-8 py-4 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

// ============================================================================
// Body Scan View
// ============================================================================

function BodyScanView({ onBack }: { onBack: () => void }) {
  const [currentArea, setCurrentArea] = useState(0);
  const areas = [
    { name: 'Head & Face', instruction: 'Notice any tension in your forehead, jaw, or around your eyes. Let it soften.' },
    { name: 'Neck & Shoulders', instruction: 'Feel the weight in your shoulders. Allow them to drop and relax.' },
    { name: 'Arms & Hands', instruction: 'Scan from your shoulders to your fingertips. Release any tightness.' },
    { name: 'Chest & Heart', instruction: 'Notice your breath here. Feel your heart beating steadily.' },
    { name: 'Belly & Lower Back', instruction: 'Let your belly soften. Release tension in your lower back.' },
    { name: 'Legs & Feet', instruction: 'Feel the ground beneath you. Let your legs feel heavy and relaxed.' },
  ];

  const area = areas[currentArea];

  return (
    <motion.main
      key="body-scan"
      className="relative z-10 flex flex-col min-h-screen pb-32 items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {currentArea < areas.length ? (
          <motion.div
            key={currentArea}
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-sm text-slate-400 mb-4">{currentArea + 1} of {areas.length}</div>
            <h2 className="text-2xl text-white font-medium mb-6">{area.name}</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">{area.instruction}</p>

            <motion.button
              className="px-8 py-4 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentArea(c => c + 1)}
            >
              {currentArea < areas.length - 1 ? 'Continue' : 'Complete'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-6 block">🧘</span>
            <h2 className="text-2xl text-white font-medium mb-2">Body scan complete</h2>
            <p className="text-slate-400 mb-8">Take a moment to appreciate this feeling of relaxation</p>
            <motion.button
              className="px-8 py-4 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

// ============================================================================
// Cold Water Technique View
// ============================================================================

function ColdWaterView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Get cold water', instruction: 'Fill your hands with cold water, or get a cold, wet cloth', icon: '💧' },
    { title: 'Apply to face', instruction: 'Gently splash or press the cold water onto your face, especially your forehead and cheeks', icon: '😌' },
    { title: 'Breathe slowly', instruction: 'Take 3 slow, deep breaths while feeling the cold', icon: '🌬️' },
    { title: 'Notice the shift', instruction: 'Pay attention to how your body responds. The cold activates your dive reflex and calms your nervous system', icon: '✨' },
  ];

  const currentStep = steps[step];

  return (
    <motion.main
      key="cold-water"
      className="relative z-10 flex flex-col min-h-screen pb-32 items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {step < steps.length ? (
          <motion.div
            key={step}
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-6xl mb-6 block">{currentStep.icon}</span>
            <div className="text-sm text-slate-400 mb-4">Step {step + 1} of {steps.length}</div>
            <h2 className="text-2xl text-white font-medium mb-4">{currentStep.title}</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">{currentStep.instruction}</p>

            <motion.button
              className="px-8 py-4 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(s => s + 1)}
            >
              {step < steps.length - 1 ? 'Next' : 'Complete'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-6 block">💙</span>
            <h2 className="text-2xl text-white font-medium mb-2">How do you feel?</h2>
            <p className="text-slate-400 mb-8">This technique can help reset your nervous system</p>
            <motion.button
              className="px-8 py-4 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

// ============================================================================
// SOS View
// ============================================================================

function SOSView({ onBack }: { onBack: () => void }) {
  return (
    <motion.main
      key="sos"
      className="relative z-10 flex flex-col min-h-screen pb-32 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pt-20 pb-6 text-center">
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-3xl">🆘</span>
        </motion.div>
        <h1 className="text-3xl font-light text-white mb-2">Emergency Support</h1>
        <p className="text-slate-400">Help is available 24/7</p>
      </div>

      <div className="flex-1 space-y-4 max-w-md mx-auto w-full">
        <motion.a
          href="tel:999"
          className="block w-full p-6 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-2xl font-bold text-white">999</div>
          <div className="text-white/80">Emergency Services</div>
        </motion.a>

        <motion.a
          href="tel:116123"
          className="block w-full p-6 rounded-2xl text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-2xl font-bold text-emerald-400">116 123</div>
          <div className="text-slate-300">Samaritans - 24/7 Support</div>
        </motion.a>

        <motion.a
          href="sms:85258&body=SHOUT"
          className="block w-full p-6 rounded-2xl text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-xl font-bold text-purple-400">Text SHOUT to 85258</div>
          <div className="text-slate-300">Free text support</div>
        </motion.a>
      </div>
    </motion.main>
  );
}

// ============================================================================
// Main App Content
// ============================================================================

function SentientHomeContent() {
  const [showTransparency, setShowTransparency] = useState(false);
  const [heartRate] = useState(65);
  const [stressLevel] = useState<'calm' | 'elevated' | 'high'>('calm');
  const [currentView, setCurrentView] = useState<'home' | StressPathway | 'breathing' | 'sos'>('home');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const { cognitiveState } = useNeuroAdaptiveContext();

  const handlePathwaySelect = useCallback((pathway: StressPathway) => {
    setCurrentView(pathway);
  }, []);

  const handleToolSelect = useCallback((toolId: string) => {
    setSelectedTool(toolId);
    // Open breathing exercise for now
    setCurrentView('breathing');
  }, []);

  const handleSOS = useCallback(() => {
    setCurrentView('sos');
  }, []);

  const handleGoHome = useCallback(() => {
    setCurrentView('home');
    setSelectedTool(null);
  }, []);

  const pathways = [
    {
      pathway: 'HIGH' as StressPathway,
      title: 'I need support now',
      subtitle: 'Immediate help and resources',
      icon: <span className="text-3xl">🛟</span>,
      colors: {
        bg: 'rgba(229, 57, 53, 0.08)',
        glow: 'rgba(229, 57, 53, 0.25)',
        text: '#FFFFFF',
        border: 'rgba(229, 57, 53, 0.35)',
      },
      pulseIntensity: 1.5,
    },
    {
      pathway: 'MID' as StressPathway,
      title: 'I feel overwhelmed',
      subtitle: 'Grounding and calming tools',
      icon: <span className="text-3xl">💜</span>,
      colors: {
        bg: 'rgba(180, 167, 214, 0.08)',
        glow: 'rgba(180, 167, 214, 0.2)',
        text: '#FFFFFF',
        border: 'rgba(180, 167, 214, 0.3)',
      },
      pulseIntensity: 1.0,
    },
    {
      pathway: 'LOW' as StressPathway,
      title: 'I want to reflect',
      subtitle: 'Journaling and patterns',
      icon: <span className="text-3xl">🌿</span>,
      colors: {
        bg: 'rgba(127, 219, 202, 0.06)',
        glow: 'rgba(127, 219, 202, 0.18)',
        text: '#FFFFFF',
        border: 'rgba(127, 219, 202, 0.25)',
      },
      pulseIntensity: 0.5,
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Atmospheric Background */}
      <AtmosphericMeshLayer cognitiveState={cognitiveState} />

      {/* Ghost Intervention Layer */}
      <GhostIntervention />

      {/* Transparency Indicator */}
      <motion.div 
        className="fixed top-4 right-4 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <TransparencyIndicator onClick={() => setShowTransparency(true)} />
      </motion.div>

      {/* Back Button - Show when not on home */}
      <AnimatePresence>
        {currentView !== 'home' && (
          <motion.button
            className="fixed top-4 left-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-sm text-white text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleGoHome}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content - View Router */}
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.main 
            key="home"
            className="relative z-10 flex flex-col min-h-screen pb-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ghost Greeting */}
            <div className="pt-16 pb-8">
              <GhostGreeting />
            </div>

            {/* Bio Pulse */}
            <motion.div 
              className="flex justify-center py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
            >
              <PremiumBioPulse 
                heartRate={heartRate} 
                stressLevel={stressLevel}
                onTap={() => setCurrentView('breathing')}
              />
            </motion.div>

            {/* Pathway Cards */}
            <div className="flex-1 px-4 py-6 space-y-4 max-w-md mx-auto w-full">
              {pathways.map((p, i) => (
                <PathwayCard
                  key={p.pathway}
                  {...p}
                  onSelect={() => handlePathwaySelect(p.pathway)}
                  delay={0.4 + i * 0.12}
                />
              ))}
            </div>

            {/* Micro-Tools */}
            <MicroToolsFeed onToolSelect={handleToolSelect} />
          </motion.main>
        )}

        {currentView === 'HIGH' && (
          <HighPathwayView onBack={handleGoHome} onSOS={handleSOS} />
        )}

        {currentView === 'MID' && (
          <MidPathwayView onBack={handleGoHome} />
        )}

        {currentView === 'LOW' && (
          <LowPathwayView onBack={handleGoHome} />
        )}

        {currentView === 'breathing' && (
          <BreathingView onBack={handleGoHome} selectedTool={selectedTool} />
        )}

        {currentView === 'sos' && (
          <SOSView onBack={handleGoHome} />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <PremiumNavBar
        onHome={handleGoHome}
        onJournal={() => handlePathwaySelect('LOW')}
        onSOS={handleSOS}
      />

      {/* Transparency Drawer */}
      <TransparencyDrawer 
        isOpen={showTransparency} 
        onClose={() => setShowTransparency(false)} 
      />
    </div>
  );
}

// ============================================================================
// Root Component with Onboarding
// ============================================================================

function AppWithOnboarding() {
  const { isComplete, isLoading, detectedProfile } = useOnboarding();

  // Show onboarding if not complete
  if (!isComplete && !isLoading) {
    return <OnboardingFlow />;
  }

  // Load user profile from localStorage if not in context
  const getUserProfile = (): UserProfile | null => {
    if (detectedProfile) return detectedProfile as UserProfile;
    
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('silent_help_user_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            lastUpdatedAt: new Date(parsed.lastUpdatedAt),
          };
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    }
    return null;
  };

  const userProfile = getUserProfile();

  // Show the main app after onboarding with responsive layout
  return (
    <NeuroAdaptiveProvider enableBiometrics={true} enableAutoState={true}>
      <ResponsiveHomeWrapper 
        userProfile={userProfile}
        mobileContent={<SentientHomeContent />}
      />
    </NeuroAdaptiveProvider>
  );
}

export default function Home() {
  return (
    <OnboardingProvider>
      <AppWithOnboarding />
    </OnboardingProvider>
  );
}
