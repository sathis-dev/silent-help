'use client';

/**
 * Silent Help - Daily Check-In Widget
 * Time-aware ritual prompt
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DailyCheckInWidgetProps {
  windDownTime?: string;
  currentTime: Date;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

export function DailyCheckInWidget({
  windDownTime,
  currentTime,
  accentColor,
}: DailyCheckInWidgetProps) {
  const checkInType = useMemo(() => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 10) {
      return {
        type: 'morning',
        title: 'Morning Check-In',
        prompt: 'How are you starting this day?',
        icon: '🌅',
      };
    }
    
    if (windDownTime) {
      const [windHour] = windDownTime.split(':').map(Number);
      if (hour >= windHour) {
        return {
          type: 'evening',
          title: 'Evening Wind-Down',
          prompt: 'Time to let the day settle',
          icon: '🌙',
        };
      }
    }
    
    if (hour >= 21) {
      return {
        type: 'evening',
        title: 'Evening Check-In',
        prompt: 'How was your day?',
        icon: '🌙',
      };
    }
    
    return {
      type: 'general',
      title: 'Quick Check-In',
      prompt: 'A moment for yourself',
      icon: '💭',
    };
  }, [currentTime, windDownTime]);

  return (
    <motion.button
      className="col-span-2 p-5 rounded-3xl text-left"
      style={{
        background: `linear-gradient(135deg, ${accentColor}15 0%, rgba(15, 23, 42, 0.9) 100%)`,
        border: `1px solid ${accentColor}30`,
      }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: `0 0 40px ${accentColor}15`,
      }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-4">
        <motion.span 
          className="text-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {checkInType.icon}
        </motion.span>
        
        <div className="flex-1">
          <h3 className="text-white font-medium">{checkInType.title}</h3>
          <p className="text-slate-400 text-sm mt-0.5">{checkInType.prompt}</p>
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
  );
}

export default DailyCheckInWidget;
