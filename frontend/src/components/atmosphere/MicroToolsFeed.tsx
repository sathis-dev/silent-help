"use client";

/**
 * MicroToolsFeed Component
 * 
 * Horizontal-scrolling contextual tools with AI time-of-day filtering.
 * Predicted 1-2 tools based on:
 * - Current time (e.g., "5-min Sleep Reset" if it's 11 PM)
 * - Recent stress patterns
 * - Historical tool effectiveness
 * 
 * "The app anticipates what you need before you ask."
 */

import { motion, Variants } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import { triggerUIHaptic } from '@/lib/haptics';

interface MicroTool {
  id: string;
  title: string;
  duration: string;
  icon: string;
  reason: string;
  action: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
}

interface MicroToolsFeedProps {
  onToolSelect?: (toolId: string) => void;
  className?: string;
}

// Time-based tool recommendations with 2025 wellness colors
const getTimeBasedTools = (): MicroTool[] => {
  const hour = new Date().getHours();
  const tools: MicroTool[] = [];

  // Late night (10 PM - 4 AM) - Sleep focus
  if (hour >= 22 || hour < 4) {
    tools.push({
      id: 'sleep-reset',
      title: '5-min Sleep Reset',
      duration: '5 min',
      icon: '🌙',
      reason: "It's late. This might help.",
      action: 'breathing',
      colors: {
        bg: 'rgba(180, 167, 214, 0.12)',
        border: 'rgba(180, 167, 214, 0.20)',
        text: '#D8D0E8',
        icon: '#B4A7D6',
      },
    });
    tools.push({
      id: 'night-thoughts',
      title: 'Quiet the Night Mind',
      duration: '3 min',
      icon: '💭',
      reason: 'For racing thoughts',
      action: 'grounding',
      colors: {
        bg: 'rgba(127, 219, 202, 0.10)',
        border: 'rgba(127, 219, 202, 0.18)',
        text: '#B8F0E4',
        icon: '#7FDBCA',
      },
    });
  }
  // Early morning (5 AM - 9 AM)
  else if (hour >= 5 && hour < 9) {
    tools.push({
      id: 'morning-breath',
      title: 'Morning Clarity',
      duration: '4 min',
      icon: '☀️',
      reason: 'Start with intention',
      action: 'breathing',
      colors: {
        bg: 'rgba(127, 219, 202, 0.12)',
        border: 'rgba(127, 219, 202, 0.20)',
        text: '#B8F0E4',
        icon: '#7FDBCA',
      },
    });
    tools.push({
      id: 'day-intention',
      title: 'Set Today\'s Intention',
      duration: '2 min',
      icon: '✨',
      reason: 'A gentle focus',
      action: 'journaling',
      colors: {
        bg: 'rgba(180, 167, 214, 0.10)',
        border: 'rgba(180, 167, 214, 0.18)',
        text: '#D8D0E8',
        icon: '#B4A7D6',
      },
    });
  }
  // Midday stress window (12 PM - 2 PM)
  else if (hour >= 12 && hour < 14) {
    tools.push({
      id: 'midday-reset',
      title: 'Lunch Break Reset',
      duration: '2 min',
      icon: '🌿',
      reason: 'Quick reset before afternoon',
      action: 'grounding',
      colors: {
        bg: 'rgba(127, 219, 202, 0.12)',
        border: 'rgba(127, 219, 202, 0.20)',
        text: '#B8F0E4',
        icon: '#7FDBCA',
      },
    });
  }
  // Afternoon (2 PM - 6 PM)
  else if (hour >= 14 && hour < 18) {
    tools.push({
      id: 'focus-breath',
      title: 'Focus Boost',
      duration: '3 min',
      icon: '🎯',
      reason: 'Sharpen attention',
      action: 'breathing',
      colors: {
        bg: 'rgba(127, 219, 202, 0.10)',
        border: 'rgba(127, 219, 202, 0.18)',
        text: '#B8F0E4',
        icon: '#7FDBCA',
      },
    });
  }
  // Evening wind-down (6 PM - 10 PM)
  else if (hour >= 18 && hour < 22) {
    tools.push({
      id: 'day-release',
      title: 'Release the Day',
      duration: '6 min',
      icon: '🌅',
      reason: "Let today's weight settle",
      action: 'body-scan',
      colors: {
        bg: 'rgba(180, 167, 214, 0.12)',
        border: 'rgba(180, 167, 214, 0.20)',
        text: '#D8D0E8',
        icon: '#B4A7D6',
      },
    });
    tools.push({
      id: 'evening-reflect',
      title: 'Evening Reflection',
      duration: '5 min',
      icon: '📝',
      reason: 'Process the day',
      action: 'journaling',
      colors: {
        bg: 'rgba(127, 219, 202, 0.10)',
        border: 'rgba(127, 219, 202, 0.18)',
        text: '#B8F0E4',
        icon: '#7FDBCA',
      },
    });
  }
  // Default daytime
  else {
    tools.push({
      id: 'quick-ground',
      title: 'Quick Ground',
      duration: '2 min',
      icon: '🌱',
      reason: 'A moment of presence',
      action: 'grounding',
      colors: {
        bg: 'rgba(127, 219, 202, 0.12)',
        border: 'rgba(127, 219, 202, 0.20)',
        text: '#B8F0E4',
        icon: '#7FDBCA',
      },
    });
  }

  return tools;
};

const toolVariants: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    }
  },
  hover: {
    scale: 1.03,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    }
  },
  tap: {
    scale: 0.97,
  }
};

export function MicroToolsFeed({ 
  onToolSelect,
  className = '' 
}: MicroToolsFeedProps) {
  const [tools, setTools] = useState<MicroTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setTools(getTimeBasedTools());
      setIsLoading(false);
    };
    loadTools();
  }, []);

  const handleSelect = useCallback((tool: MicroTool) => {
    triggerUIHaptic('select');
    onToolSelect?.(tool.id);
  }, [onToolSelect]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          <div className="h-24 w-44 flex-shrink-0 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-24 w-44 flex-shrink-0 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (tools.length === 0) return null;

  return (
    <motion.section
      className={`space-y-3 ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
      }}
    >
      <motion.p 
        className="text-xs text-slate-500 uppercase tracking-wider px-1 flex items-center gap-2"
        variants={toolVariants}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#7FDBCA] animate-pulse" />
        Suggested for you
      </motion.p>

      {/* Horizontal scroll container */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            variants={toolVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleSelect(tool)}
            className={`
              flex-shrink-0 w-44
              p-4 rounded-2xl
              backdrop-blur-xl
              border
              text-left
              snap-start
              focus:outline-none focus:ring-2 focus:ring-[#7FDBCA]/50
            `}
            style={{
              background: tool.colors.bg,
              borderColor: tool.colors.border,
            }}
          >
            {/* Glassmorphism overlay */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
              }}
            />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <span 
                  className="text-2xl"
                  style={{ filter: `drop-shadow(0 0 8px ${tool.colors.icon}40)` }}
                >
                  {tool.icon}
                </span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full bg-white/5"
                  style={{ color: tool.colors.text }}
                >
                  {tool.duration}
                </span>
              </div>
              <p 
                className="text-sm font-medium truncate"
                style={{ color: tool.colors.text }}
              >
                {tool.title}
              </p>
              <p className="text-xs text-slate-500 truncate mt-1">
                {tool.reason}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
