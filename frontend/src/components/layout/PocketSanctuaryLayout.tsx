'use client';

/**
 * PocketSanctuaryLayout - Mobile Layout
 * SANCTUARY V3 SPEC - "The Pocket Sanctuary"
 * 
 * A cozy, intimate space optimized for one-handed use.
 * 
 * Structure:
 * - CosmicBackground (fixed)
 * - Greeting card (top)
 * - Compact bio orb (center)
 * - Quick action chips (horizontal scroll)
 * - Tool grid (2 column)
 * - Mobile tab bar (bottom)
 * - SOS Button (above tab bar)
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wind, Anchor, PenLine, Activity, ChevronRight } from 'lucide-react';

import { CosmicBackground } from '@/components/atmosphere/CosmicBackground';
import { BiometricOrb } from '@/components/sanctuary/BiometricOrb';
import { MobileTabBar } from '@/components/navigation/MobileTabBar';
import { SOSButton } from '@/components/shared/SOSButtonV3';
import type { ToolType } from '@/components/tools/BentoToolCard';

// ============================================================================
// TYPES
// ============================================================================

type CognitiveState = 'calm' | 'maintenance' | 'high_stress' | 'crisis';

interface PocketSanctuaryLayoutProps {
  cognitiveState?: CognitiveState;
  bpm?: number;
  hrvTrend?: 'improving' | 'stable' | 'declining';
  userName?: string;
  onNavigate?: (section: string) => void;
  onToolSelect?: (tool: ToolType) => void;
  onSOSActivate?: () => void;
}

// ============================================================================
// QUICK ACTION CHIP COMPONENT
// ============================================================================

interface QuickActionChipProps {
  icon: React.ElementType;
  label: string;
  accent: string;
  onClick?: () => void;
}

const QuickActionChip: React.FC<QuickActionChipProps> = ({
  icon: Icon,
  label,
  accent,
  onClick,
}) => (
  <motion.button
    className="flex items-center gap-2 px-4 py-3 rounded-2xl shrink-0 touch-44"
    style={{
      background: `${accent}15`,
      border: `1px solid ${accent}30`,
    }}
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
  >
    <Icon size={18} style={{ color: accent }} />
    <span className="text-sm text-slate-200 whitespace-nowrap">{label}</span>
  </motion.button>
);

// ============================================================================
// QUICK ACTIONS SCROLL
// ============================================================================

const QuickActionsScroll: React.FC<{ onSelect?: (tool: string) => void }> = ({
  onSelect,
}) => {
  const actions = [
    { icon: Wind, label: '30s Breath', accent: '#14b8a6', tool: 'breathing' },
    { icon: Anchor, label: '5-4-3-2-1', accent: '#8b5cf6', tool: 'grounding' },
    { icon: PenLine, label: 'Quick Write', accent: '#ec4899', tool: 'journal' },
    { icon: Activity, label: 'Body Scan', accent: '#f59e0b', tool: 'body_scan' },
  ];

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {actions.map((action) => (
          <QuickActionChip
            key={action.tool}
            icon={action.icon}
            label={action.label}
            accent={action.accent}
            onClick={() => onSelect?.(action.tool)}
          />
        ))}
      </div>
      {/* Fade edge indicator */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#020408] to-transparent pointer-events-none" />
    </div>
  );
};

// ============================================================================
// MOBILE TOOL CARD
// ============================================================================

interface MobileToolCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent: string;
  onClick?: () => void;
}

const MobileToolCard: React.FC<MobileToolCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  accent,
  onClick,
}) => (
  <motion.button
    className="flex items-center gap-4 p-4 rounded-2xl text-left touch-56"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
  >
    <div
      className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
      style={{ background: `${accent}15` }}
    >
      <Icon size={24} style={{ color: accent }} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-medium text-white">{title}</h3>
      <p className="text-sm text-slate-500 truncate">{subtitle}</p>
    </div>
    <ChevronRight size={20} className="text-slate-600 shrink-0" />
  </motion.button>
);

// ============================================================================
// GREETING CARD
// ============================================================================

const GreetingCard: React.FC<{ userName?: string; state: CognitiveState }> = ({
  userName,
  state,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Welcome back';
  };

  const getStateMessage = () => {
    switch (state) {
      case 'calm':
        return "You're doing great today";
      case 'maintenance':
        return 'Taking time for yourself';
      case 'high_stress':
        return "Let's find some calm together";
      case 'crisis':
        return "We're here for you";
      default:
        return 'Your sanctuary awaits';
    }
  };

  return (
    <motion.div
      className="p-5 rounded-3xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-slate-400 text-sm mb-1">{getGreeting()}</p>
      <h1 className="text-2xl font-light text-white mb-2">
        {userName || 'Friend'}
      </h1>
      <p className="text-slate-500 text-sm">{getStateMessage()}</p>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PocketSanctuaryLayout: React.FC<PocketSanctuaryLayoutProps> = ({
  cognitiveState = 'calm',
  bpm = 72,
  hrvTrend = 'stable',
  userName,
  onNavigate,
  onToolSelect,
  onSOSActivate,
}) => {
  const [activeTab, setActiveTab] = useState('sanctuary');

  const handleNavigate = useCallback(
    (section: string) => {
      setActiveTab(section);
      onNavigate?.(section);
    },
    [onNavigate]
  );

  const handleToolSelect = useCallback(
    (tool: string) => {
      onToolSelect?.(tool as ToolType);
      handleNavigate(tool);
    },
    [onToolSelect, handleNavigate]
  );

  return (
    <div className="min-h-screen relative" data-cognitive-state={cognitiveState}>
      {/* Background */}
      <CosmicBackground cognitiveState={cognitiveState} showStars={false} />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen pb-40 pt-6 px-4 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Greeting Card */}
          <GreetingCard userName={userName} state={cognitiveState} />

          {/* Compact Biometric Orb */}
          <motion.div
            className="flex justify-center py-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BiometricOrb
              bpm={bpm}
              cognitiveState={cognitiveState}
              hrvTrend={hrvTrend}
              size={200}
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-medium text-slate-400 mb-3">Quick Start</h2>
            <QuickActionsScroll onSelect={handleToolSelect} />
          </motion.div>

          {/* Tool List */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-medium text-slate-400 mb-3">Tools</h2>
            <MobileToolCard
              icon={Wind}
              title="Breathing Exercises"
              subtitle="Calm your nervous system"
              accent="#14b8a6"
              onClick={() => handleToolSelect('breathing')}
            />
            <MobileToolCard
              icon={Anchor}
              title="Grounding"
              subtitle="5-4-3-2-1 technique"
              accent="#8b5cf6"
              onClick={() => handleToolSelect('grounding')}
            />
            <MobileToolCard
              icon={PenLine}
              title="Journal"
              subtitle="Express your thoughts"
              accent="#ec4899"
              onClick={() => handleToolSelect('journal')}
            />
            <MobileToolCard
              icon={Activity}
              title="Body Scan"
              subtitle="Release tension"
              accent="#f59e0b"
              onClick={() => handleToolSelect('body_scan')}
            />
          </motion.div>
        </div>
      </main>

      {/* SOS Button (above tab bar) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <SOSButton onActivate={onSOSActivate} variant="inline" />
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar activeId={activeTab} onNavigate={handleNavigate} />
    </div>
  );
};

export default PocketSanctuaryLayout;
