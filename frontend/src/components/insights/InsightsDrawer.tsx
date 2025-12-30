'use client';

/**
 * InsightsDrawer - AI Observations Side Panel
 * SANCTUARY V3 SPEC - Insights Component
 * 
 * Features:
 * - FAB trigger with sparkles icon
 * - Slide-in drawer from right
 * - AI-generated observation cards
 * - Reminders and achievements
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  TrendingUp,
  Bell,
  Trophy,
  Lightbulb,
  Heart,
  Brain,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface InsightCard {
  id: string;
  type: 'observation' | 'reminder' | 'achievement' | 'tip';
  title: string;
  content: string;
  timestamp?: string;
}

interface InsightsDrawerProps {
  insights?: InsightCard[];
  className?: string;
}

// ============================================================================
// DEFAULT INSIGHTS (for demo)
// ============================================================================

const DEFAULT_INSIGHTS: InsightCard[] = [
  {
    id: '1',
    type: 'observation',
    title: 'Pattern Detected',
    content:
      'Your stress levels tend to peak around 3 PM. Consider scheduling a breathing exercise reminder.',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'achievement',
    title: '7-Day Streak! 🎉',
    content:
      "You've completed breathing exercises for 7 consecutive days. Your consistency is building resilience.",
    timestamp: 'Today',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Gentle Reminder',
    content:
      "You haven't journaled in 3 days. Writing can help process emotions.",
    timestamp: '1 day ago',
  },
  {
    id: '4',
    type: 'tip',
    title: 'Did You Know?',
    content:
      'The 4-7-8 breathing technique can help activate your parasympathetic nervous system in under 2 minutes.',
    timestamp: '3 days ago',
  },
];

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================

const CARD_CONFIGS = {
  observation: {
    icon: Brain,
    accent: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  reminder: {
    icon: Bell,
    accent: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  achievement: {
    icon: Trophy,
    accent: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    border: 'rgba(99, 102, 241, 0.2)',
  },
  tip: {
    icon: Lightbulb,
    accent: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.2)',
  },
};

const InsightCardComponent: React.FC<{ insight: InsightCard; index: number }> = ({
  insight,
  index,
}) => {
  const config = CARD_CONFIGS[insight.type];
  const Icon = config.icon;

  return (
    <motion.div
      className="p-4 rounded-2xl"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{ background: `${config.accent}20` }}
        >
          <Icon size={20} style={{ color: config.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1">{insight.title}</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{insight.content}</p>
          {insight.timestamp && (
            <span className="text-xs text-slate-500 mt-2 block">
              {insight.timestamp}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InsightsDrawer: React.FC<InsightsDrawerProps> = ({
  insights = DEFAULT_INSIGHTS,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* FAB Trigger */}
      <motion.button
        className={`
          fixed bottom-24 right-6 z-40
          flex items-center justify-center
          w-14 h-14 rounded-full
          focus-ring
          ${className}
        `}
        style={{
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)',
        }}
        onClick={toggleDrawer}
        whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open insights drawer"
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles size={24} className="text-indigo-400" />
        </motion.div>
        
        {/* Notification dot */}
        {insights.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-medium">
            {insights.length}
          </span>
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px]"
            style={{
              background: '#020408',
              borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                >
                  <Sparkles size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">Insights</h2>
                  <p className="text-xs text-slate-500">AI-powered observations</p>
                </div>
              </div>
              
              <button
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/5 transition-colors"
                onClick={closeDrawer}
                aria-label="Close drawer"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]">
              {/* Summary card */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-white">This Week</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-light text-white">7</div>
                    <div className="text-xs text-slate-500">Sessions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light text-emerald-400">↑12%</div>
                    <div className="text-xs text-slate-500">HRV</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light text-white">23m</div>
                    <div className="text-xs text-slate-500">Avg Time</div>
                  </div>
                </div>
              </div>

              {/* Insight cards */}
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <InsightCardComponent
                    key={insight.id}
                    insight={insight}
                    index={index}
                  />
                ))}
              </div>

              {/* Empty state */}
              {insights.length === 0 && (
                <div className="text-center py-12">
                  <Heart size={40} className="mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-500">No insights yet</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Use the app more to generate personalized insights
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InsightsDrawer;
