'use client';

/**
 * Silent Help - Insight Card Widget
 * AI-generated personalized insights
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { UserPersona } from '@/lib/types/onboarding';

interface InsightCardWidgetProps {
  persona: UserPersona;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

const PERSONA_INSIGHTS: Record<UserPersona, { icon: string; title: string; message: string }[]> = {
  crisis_seeker: [
    { icon: '💚', title: 'Remember', message: "It's okay to reach out for help. You don't have to face this alone." },
    { icon: '🌊', title: 'Breathe', message: 'Your next breath is always available to you.' },
  ],
  anxiety_manager: [
    { icon: '📊', title: 'Pattern noticed', message: 'You tend to feel calmer after breathing exercises in the evening.' },
    { icon: '✨', title: 'Progress', message: "You've used calming tools 5 times this week. That's self-care in action." },
  ],
  stress_professional: [
    { icon: '⏰', title: 'Timing insight', message: 'Stress often peaks around 3pm. Consider a micro-break then.' },
    { icon: '📈', title: 'Trend', message: 'Your evening wind-down routine is improving your morning mood.' },
  ],
  curious_explorer: [
    { icon: '🎯', title: 'Try this', message: 'Box breathing is popular with first-time users. Give it a try!' },
    { icon: '📚', title: 'Discovery', message: 'Journaling can help you understand your emotional patterns.' },
  ],
  caregiver: [
    { icon: '💜', title: 'Self-care reminder', message: "Supporting others is beautiful. Don't forget to care for yourself too." },
    { icon: '🌱', title: 'Resource', message: 'Explore our caregiver resources section for support strategies.' },
  ],
  returning_user: [
    { icon: '👋', title: 'Welcome back', message: 'Your sanctuary remembers you. Pick up where you left off.' },
    { icon: '📊', title: 'Progress', message: "You're building consistent wellness habits. Keep going!" },
  ],
};

export function InsightCardWidget({
  persona,
}: InsightCardWidgetProps) {
  const insight = useMemo(() => {
    const insights = PERSONA_INSIGHTS[persona] || PERSONA_INSIGHTS.curious_explorer;
    // Use deterministic selection based on persona hash to avoid Math.random
    const hash = persona.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return insights[hash % insights.length];
  }, [persona]);

  return (
    <motion.div
      className="col-span-2 p-5 rounded-3xl"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-4">
        <motion.span 
          className="text-2xl mt-1"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {insight.icon}
        </motion.span>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              💡 Insight
            </span>
          </div>
          <h3 className="text-white font-medium">{insight.title}</h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            {insight.message}
          </p>
        </div>
      </div>

      {/* AI transparency */}
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          AI-generated insight
        </span>
        <span>Based on your patterns</span>
      </div>
    </motion.div>
  );
}

export default InsightCardWidget;
