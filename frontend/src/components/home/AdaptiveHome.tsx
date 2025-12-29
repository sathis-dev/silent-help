'use client';

/**
 * Silent Help - Adaptive Home Page
 * "The Personalized Sanctuary" - Home that adapts to user persona
 * 
 * This component renders a personalized home layout based on:
 * - User's detected persona from onboarding
 * - Current emotional state
 * - Time of day
 * - Historical patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, HomeLayoutConfig, HomeWidget, HomeWidgetType } from '@/lib/types/onboarding';
import type { StressPathway } from '@/lib/types';

// Import widgets
import { GreetingWidget } from './widgets/GreetingWidget';
import { SanctuaryStatusWidget } from './widgets/SanctuaryStatusWidget';
import { QuickToolsWidget } from './widgets/QuickToolsWidget';
import { DailyCheckInWidget } from './widgets/DailyCheckInWidget';
import { InsightCardWidget } from './widgets/InsightCardWidget';
import { SOSProminentWidget } from './widgets/SOSProminentWidget';
import { BreathingWidget } from './widgets/BreathingWidget';
import { PathwaySelectorWidget } from './widgets/PathwaySelectorWidget';

// ============================================================================
// Colors
// ============================================================================

const THEME_COLORS = {
  midnight: {
    primary: '#020617',
    surface: '#0F172A',
    lavender: '#B4A7D6',
    mint: '#7FDBCA',
  },
  dusk: {
    primary: '#0A0A0F',
    surface: '#15151F',
    lavender: '#C4B7E6',
    mint: '#8FEBB0',
  },
  dawn: {
    primary: '#0F0A14',
    surface: '#1A1520',
    lavender: '#D4C7F6',
    mint: '#9FFBD0',
  },
  neutral: {
    primary: '#0A0D10',
    surface: '#12151A',
    lavender: '#B4A7D6',
    mint: '#7FDBCA',
  },
};

// ============================================================================
// Component
// ============================================================================

interface AdaptiveHomeProps {
  userProfile: UserProfile;
  onSelectPathway: (pathway: StressPathway) => void;
  onOpenTool: (toolId: string) => void;
  onOpenJournal: () => void;
  onTriggerSOS: () => void;
}

export function AdaptiveHome({
  userProfile,
  onSelectPathway,
  onOpenTool,
  onOpenJournal,
  onTriggerSOS,
}: AdaptiveHomeProps) {
  const { homeLayout, preferences, persona } = userProfile;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [heartRate] = useState(72); // Would come from wearable integration

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get theme colors
  const theme = THEME_COLORS[homeLayout.backgroundTheme] || THEME_COLORS.midnight;

  // Sort widgets by position
  const sortedWidgets = useMemo(() => {
    return [...homeLayout.widgets]
      .filter(w => w.visible)
      .sort((a, b) => a.position - b.position);
  }, [homeLayout.widgets]);

  // Render individual widget
  const renderWidget = (widget: HomeWidget, index: number) => {
    const commonProps = {
      accentColor: homeLayout.accentColor,
      userName: preferences.displayName,
      greetingStyle: preferences.greetingStyle,
    };

    const widgetContent = () => {
      switch (widget.type) {
        case 'greeting':
          return (
            <GreetingWidget 
              {...commonProps}
              currentTime={currentTime}
            />
          );
        
        case 'sanctuary_status':
          return (
            <SanctuaryStatusWidget
              {...commonProps}
              heartRate={heartRate}
              showBiometrics={homeLayout.showBiometrics}
            />
          );
        
        case 'quick_tools':
          return (
            <QuickToolsWidget
              {...commonProps}
              tools={homeLayout.quickAccessTools}
              onSelectTool={onOpenTool}
            />
          );
        
        case 'daily_checkin':
          return (
            <DailyCheckInWidget
              {...commonProps}
              windDownTime={preferences.windDownTime}
              currentTime={currentTime}
            />
          );
        
        case 'insight_card':
          return (
            <InsightCardWidget
              {...commonProps}
              persona={persona}
            />
          );
        
        case 'sos_prominent':
          return (
            <SOSProminentWidget
              {...commonProps}
              onTriggerSOS={onTriggerSOS}
            />
          );
        
        case 'breathing_widget':
          return (
            <BreathingWidget
              {...commonProps}
              onStart={() => onOpenTool('breathing')}
            />
          );
        
        case 'pathway_selector':
          return (
            <PathwaySelectorWidget
              {...commonProps}
              onSelectPathway={onSelectPathway}
            />
          );
        
        default:
          return null;
      }
    };

    // Widget size classes
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-1 md:col-span-2',
      large: 'col-span-2',
      full: 'col-span-2',
    };

    return (
      <motion.div
        key={widget.type}
        className={sizeClasses[widget.size]}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {widgetContent()}
      </motion.div>
    );
  };

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ backgroundColor: theme.primary }}
    >
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Gradient orbs based on theme */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            left: '10%',
            top: '20%',
            background: `radial-gradient(circle, ${homeLayout.accentColor}15 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            right: '5%',
            bottom: '30%',
            background: `radial-gradient(circle, ${theme.mint}10 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />

        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2, 6, 23, 0.6) 100%)',
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-12">
        {/* Widget Grid */}
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {sortedWidgets.map((widget, index) => renderWidget(widget, index))}
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Bar placeholder - would be imported from existing components */}
    </div>
  );
}

export default AdaptiveHome;
