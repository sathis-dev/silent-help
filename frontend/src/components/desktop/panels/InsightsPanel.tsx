'use client';

/**
 * Silent Help - Insights Panel
 * "The Wisdom Sidebar" - Right sidebar with AI insights
 * 
 * Displays personalized insights, patterns, and recommendations.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserPersona, UserPreferences } from '@/lib/types/onboarding';

// ============================================================================
// Insight Types
// ============================================================================

interface Insight {
  id: string;
  type: 'pattern' | 'tip' | 'achievement' | 'reminder';
  title: string;
  content: string;
  icon: string;
  color: string;
  timestamp?: Date;
}

// ============================================================================
// Persona-specific Insights
// ============================================================================

const PERSONA_INSIGHTS: Record<UserPersona, Insight[]> = {
  crisis_seeker: [
    {
      id: 'crisis-1',
      type: 'reminder',
      title: 'You Are Not Alone',
      content: 'Help is always available. The 988 Lifeline is there 24/7.',
      icon: '💙',
      color: '#60A5FA',
    },
    {
      id: 'crisis-2',
      type: 'tip',
      title: 'Grounding Helps',
      content: 'When overwhelmed, try naming 5 things you can see around you.',
      icon: '🌱',
      color: '#4ECDB3',
    },
    {
      id: 'crisis-3',
      type: 'achievement',
      title: 'You Showed Up',
      content: 'Opening this app took courage. That matters.',
      icon: '⭐',
      color: '#FCD34D',
    },
  ],
  anxiety_manager: [
    {
      id: 'anxiety-1',
      type: 'pattern',
      title: 'Evening Anxiety',
      content: 'You tend to feel more anxious after 8pm. Consider a wind-down routine.',
      icon: '📊',
      color: '#B4A7D6',
    },
    {
      id: 'anxiety-2',
      type: 'tip',
      title: '4-7-8 Breathing',
      content: 'This technique activates your parasympathetic nervous system.',
      icon: '💨',
      color: '#4ECDB3',
    },
    {
      id: 'anxiety-3',
      type: 'achievement',
      title: '3-Day Streak',
      content: 'You\'ve used breathing exercises 3 days in a row!',
      icon: '🔥',
      color: '#F59E0B',
    },
  ],
  stress_professional: [
    {
      id: 'stress-1',
      type: 'pattern',
      title: 'Midday Peak',
      content: 'Your stress peaks around 2pm. Try a micro-break before meetings.',
      icon: '📈',
      color: '#60A5FA',
    },
    {
      id: 'stress-2',
      type: 'tip',
      title: 'Boundary Setting',
      content: 'Consider blocking 15 minutes between meetings for transition time.',
      icon: '🛡️',
      color: '#B4A7D6',
    },
    {
      id: 'stress-3',
      type: 'reminder',
      title: 'Scheduled Break',
      content: 'Your wind-down time starts in 2 hours.',
      icon: '⏰',
      color: '#4ECDB3',
    },
  ],
  curious_explorer: [
    {
      id: 'explorer-1',
      type: 'tip',
      title: 'Try Journaling',
      content: 'Writing 3 things you\'re grateful for can boost wellbeing.',
      icon: '✍️',
      color: '#F472B6',
    },
    {
      id: 'explorer-2',
      type: 'achievement',
      title: 'Explorer Badge',
      content: 'You\'ve tried 2 different tools today!',
      icon: '🧭',
      color: '#7FDBCA',
    },
    {
      id: 'explorer-3',
      type: 'pattern',
      title: 'Morning Person',
      content: 'You\'re most active in the mornings. Great time for reflection!',
      icon: '🌅',
      color: '#FCD34D',
    },
  ],
  caregiver: [
    {
      id: 'caregiver-1',
      type: 'reminder',
      title: 'Self-Care Check',
      content: 'When did you last do something just for yourself?',
      icon: '💝',
      color: '#F472B6',
    },
    {
      id: 'caregiver-2',
      type: 'tip',
      title: 'Compassion Fatigue',
      content: 'It\'s normal to feel drained. Your feelings are valid.',
      icon: '🤗',
      color: '#B4A7D6',
    },
    {
      id: 'caregiver-3',
      type: 'pattern',
      title: 'Support Resources',
      content: 'There are support groups for caregivers like you.',
      icon: '👥',
      color: '#60A5FA',
    },
  ],
  returning_user: [
    {
      id: 'return-1',
      type: 'achievement',
      title: 'Welcome Back',
      content: 'Great to see you again! Your sanctuary remembers you.',
      icon: '🏠',
      color: '#7FDBCA',
    },
    {
      id: 'return-2',
      type: 'pattern',
      title: 'Your Favorite',
      content: 'Breathing exercises work well for you. Continue the streak?',
      icon: '❤️',
      color: '#F472B6',
    },
    {
      id: 'return-3',
      type: 'tip',
      title: 'New Feature',
      content: 'Try the body scan - it\'s been updated with new guidance.',
      icon: '✨',
      color: '#B4A7D6',
    },
  ],
};

// ============================================================================
// Insights Panel Component
// ============================================================================

interface InsightsPanelProps {
  persona: UserPersona;
  preferences?: UserPreferences;
}

export function InsightsPanel({ persona, preferences }: InsightsPanelProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const insights = PERSONA_INSIGHTS[persona];
  
  // Current time-based greeting
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { label: 'Late Night', icon: '🌙' };
    if (hour < 12) return { label: 'Morning', icon: '☀️' };
    if (hour < 17) return { label: 'Afternoon', icon: '🌤️' };
    if (hour < 21) return { label: 'Evening', icon: '🌅' };
    return { label: 'Night', icon: '🌙' };
  };
  
  const timeContext = getTimeContext();

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{timeContext.icon}</span>
          <h2 className="text-lg font-semibold text-white">Insights</h2>
        </div>
        <p className="text-sm text-slate-500">
          Personalized observations for your {timeContext.label.toLowerCase()}
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(127, 219, 202, 0.1)',
            border: '1px solid rgba(127, 219, 202, 0.2)',
          }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-2xl font-light text-emerald-400 mb-1">3</p>
          <p className="text-xs text-slate-500">Day Streak</p>
        </motion.div>
        <motion.div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(180, 167, 214, 0.1)',
            border: '1px solid rgba(180, 167, 214, 0.2)',
          }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-2xl font-light text-lavender-400" style={{ color: '#B4A7D6' }}>12</p>
          <p className="text-xs text-slate-500">Min Today</p>
        </motion.div>
      </div>
      
      {/* Insights List */}
      <div className="flex-1 overflow-y-auto space-y-3 -mx-2 px-2">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onClick={() => setExpandedInsight(
                expandedInsight === insight.id ? null : insight.id
              )}
              whileHover={{ scale: 1.01 }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  {/* Type Badge */}
                  <span 
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                    style={{
                      background: `${insight.color}20`,
                      color: insight.color,
                    }}
                  >
                    {insight.type}
                  </span>
                  
                  {/* Title */}
                  <h4 className="text-sm font-medium text-white mb-1">
                    {insight.title}
                  </h4>
                  
                  {/* Content */}
                  <AnimatePresence>
                    <motion.p
                      className={`text-xs text-slate-400 ${
                        expandedInsight === insight.id ? '' : 'line-clamp-2'
                      }`}
                      layout
                    >
                      {insight.content}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Expand indicator */}
              <motion.div
                className="mt-2 text-center"
                animate={{ rotate: expandedInsight === insight.id ? 180 : 0 }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="mx-auto text-slate-600"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Weekly Summary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 rounded-xl text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(180, 167, 214, 0.1))',
          border: '1px solid rgba(96, 165, 250, 0.2)',
        }}
      >
        <p className="text-sm text-white mb-2">Weekly Summary Available</p>
        <motion.button
          className="text-xs px-4 py-2 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
          }}
          whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
          whileTap={{ scale: 0.95 }}
        >
          View Report →
        </motion.button>
      </motion.div>
      
      {/* AI Transparency Notice */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-slate-600">
          🔒 All insights are generated locally • Your data stays private
        </p>
      </div>
    </div>
  );
}
