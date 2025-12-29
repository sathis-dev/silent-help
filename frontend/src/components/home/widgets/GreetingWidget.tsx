'use client';

/**
 * Silent Help - Greeting Widget
 * Personalized greeting based on time and user preferences
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface GreetingWidgetProps {
  userName: string;
  currentTime: Date;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
  accentColor: string;
}

const GREETINGS = {
  formal: {
    morning: (name: string) => ({ main: `Good morning, ${name}`, sub: 'How may I assist you today?' }),
    afternoon: (name: string) => ({ main: `Good afternoon, ${name}`, sub: 'I hope your day is going well' }),
    evening: (name: string) => ({ main: `Good evening, ${name}`, sub: 'Winding down for the day' }),
    night: (name: string) => ({ main: `Good evening, ${name}`, sub: 'Rest is important' }),
  },
  casual: {
    morning: (name: string) => ({ main: `Hey ${name}! ☀️`, sub: "Let's make today a good one" }),
    afternoon: (name: string) => ({ main: `Hey ${name}`, sub: 'Taking a moment for yourself?' }),
    evening: (name: string) => ({ main: `Evening, ${name}`, sub: 'Time to unwind' }),
    night: (name: string) => ({ main: `Still up, ${name}?`, sub: "I'm here with you" }),
  },
  nurturing: {
    morning: (name: string) => ({ main: `Good morning, ${name}`, sub: 'How are you arriving in this day?' }),
    afternoon: (name: string) => ({ main: `Afternoon, ${name}`, sub: 'A moment to check in with yourself' }),
    evening: (name: string) => ({ main: `Evening, ${name}`, sub: "Let the day's weight begin to settle" }),
    night: (name: string) => ({ main: `It's late, ${name}`, sub: "I'm here with you in the quiet hours" }),
  },
};

export function GreetingWidget({
  userName,
  currentTime,
  greetingStyle,
  accentColor,
}: GreetingWidgetProps) {
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    const style = GREETINGS[greetingStyle];
    
    if (hour >= 5 && hour < 12) return style.morning(userName);
    if (hour >= 12 && hour < 17) return style.afternoon(userName);
    if (hour >= 17 && hour < 22) return style.evening(userName);
    return style.night(userName);
  }, [currentTime, userName, greetingStyle]);

  return (
    <motion.div 
      className="col-span-2 text-center py-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.h1 
        className="text-3xl font-light tracking-wide"
        style={{ 
          background: `linear-gradient(135deg, #D8D0E8 0%, #B8F0E4 100%)`,
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
        transition={{ delay: 0.2 }}
      >
        {greeting.sub}
      </motion.p>
    </motion.div>
  );
}

export default GreetingWidget;
