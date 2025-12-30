'use client';

/**
 * ObservatoryLayout - Desktop Layout
 * SANCTUARY V3 SPEC - "The Observatory"
 * 
 * A grand, spacious view that makes the user feel like they're 
 * in a peaceful observatory looking at their mental landscape.
 * 
 * Structure:
 * - CosmicBackground (fixed)
 * - FloatingDock (left navigation)
 * - Main Stage (centered content)
 * - Insights FAB (bottom-right)
 * - SOS Button (bottom-center)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, CloudMoon } from 'lucide-react';

import { CosmicBackground } from '@/components/atmosphere/CosmicBackground';
import { BiometricOrb } from '@/components/sanctuary/BiometricOrb';
import { FloatingDock } from '@/components/navigation/FloatingDock';
import { BentoToolGrid } from '@/components/tools/BentoToolGrid';
import { SOSButton } from '@/components/shared/SOSButtonV3';
import { InsightsDrawer } from '@/components/insights/InsightsDrawer';
import type { ToolType } from '@/components/tools/BentoToolCard';

// ============================================================================
// TYPES
// ============================================================================

type CognitiveState = 'calm' | 'maintenance' | 'high_stress' | 'crisis';

interface ObservatoryLayoutProps {
  cognitiveState?: CognitiveState;
  bpm?: number;
  hrvTrend?: 'improving' | 'stable' | 'declining';
  userName?: string;
  onNavigate?: (section: string) => void;
  onToolSelect?: (tool: ToolType) => void;
  onSOSActivate?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getGreeting = (timeOfDay: string, name?: string): string => {
  const greetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Welcome back',
  };
  const greeting = greetings[timeOfDay as keyof typeof greetings] || 'Welcome';
  return name ? `${greeting}, ${name}` : greeting;
};

// ============================================================================
// TIME WIDGET COMPONENT
// ============================================================================

const TimeWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const timeOfDay = getTimeOfDay();
  
  // Memoize the icon to avoid creating during render
  const timeIcon = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
      case 'afternoon':
        return <Sun size={16} className="text-slate-400" />;
      case 'evening':
        return <CloudMoon size={16} className="text-slate-400" />;
      case 'night':
        return <Moon size={16} className="text-slate-400" />;
      default:
        return <Sun size={16} className="text-slate-400" />;
    }
  }, [timeOfDay]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed top-6 right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {timeIcon}
      <span className="text-sm text-slate-300">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
};

// ============================================================================
// SANCTUARY HEADER COMPONENT
// ============================================================================

interface SanctuaryHeaderProps {
  userName?: string;
}

const SanctuaryHeader: React.FC<SanctuaryHeaderProps> = ({ userName }) => {
  const timeOfDay = getTimeOfDay();
  const greeting = getGreeting(timeOfDay, userName);

  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      {/* Greeting */}
      <motion.p
        className="text-slate-400 text-lg mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {greeting}
      </motion.p>

      {/* Hero Title */}
      <h1 className="text-hero text-gradient-hero mb-4">Your Sanctuary</h1>

      {/* Subtitle */}
      <motion.p
        className="text-slate-500 text-base max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        A quiet space for your mind. Take a breath—you&apos;re safe here.
      </motion.p>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ObservatoryLayout: React.FC<ObservatoryLayoutProps> = ({
  cognitiveState = 'calm',
  bpm = 72,
  hrvTrend = 'stable',
  userName,
  onNavigate,
  onToolSelect,
  onSOSActivate,
}) => {
  const [activeSection, setActiveSection] = useState('sanctuary');

  const handleNavigate = useCallback(
    (section: string) => {
      setActiveSection(section);
      onNavigate?.(section);
    },
    [onNavigate]
  );

  const handleToolSelect = useCallback(
    (tool: ToolType) => {
      onToolSelect?.(tool);
      // Navigate to the tool's section
      handleNavigate(tool);
    },
    [onToolSelect, handleNavigate]
  );

  const handleOrbExpand = useCallback(() => {
    // TODO: Open meditation mode / expanded orb view
    console.log('Orb expanded');
  }, []);

  return (
    <div className="min-h-screen relative" data-cognitive-state={cognitiveState}>
      {/* Layer 0: Cosmic Background */}
      <CosmicBackground cognitiveState={cognitiveState} />

      {/* Layer 1: Floating Dock Navigation */}
      <FloatingDock activeId={activeSection} onNavigate={handleNavigate} />

      {/* Layer 2: Time Widget */}
      <TimeWidget />

      {/* Layer 3: Main Stage */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 ml-[88px]">
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Sanctuary Header */}
          <SanctuaryHeader userName={userName} />

          {/* Biometric Orb */}
          <motion.div
            className="flex justify-center mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', damping: 20 }}
          >
            <BiometricOrb
              bpm={bpm}
              cognitiveState={cognitiveState}
              hrvTrend={hrvTrend}
              onExpand={handleOrbExpand}
              size={320}
            />
          </motion.div>

          {/* Tool Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BentoToolGrid onToolSelect={handleToolSelect} />
          </motion.div>
        </div>
      </main>

      {/* Layer 4: SOS Button (fixed bottom-center) */}
      <SOSButton onActivate={onSOSActivate} />

      {/* Layer 5: Insights Drawer (FAB + Drawer) */}
      <InsightsDrawer />
    </div>
  );
};

export default ObservatoryLayout;
