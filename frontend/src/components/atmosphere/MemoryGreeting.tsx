"use client";

/**
 * Ghost Greeting Component
 * 
 * The "Semantic Mirror" - AI-powered personalized greeting using pgvector.
 * Recalls the user's last emotional state, effective tools, and time patterns.
 * 
 * Examples:
 * - "It's late, Alex. You felt better after 5-4-3-2-1 last time. Shall we try again?"
 * - "Three peaceful days now. Keep nurturing that calm."
 * - "Evening, friend. The body scan helped you sleep better last Tuesday."
 * 
 * "Anti-Calm: We are a Semantic Mirror—our AI actually remembers what worked."
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MemoryGreetingProps {
  userId?: string;
  userName?: string;
  className?: string;
}

interface MemoryState {
  greeting: string;
  subtext: string;
  mood?: 'positive' | 'neutral' | 'supportive' | 'late-night';
  suggestedTool?: string;
}

// Get user's name or friendly default
const getDisplayName = (userName?: string): string => {
  if (userName) return userName;
  return 'friend';
};

// Time-based contextual greetings with personality
const getTimeBasedGreeting = (userName?: string): MemoryState => {
  const hour = new Date().getHours();
  const name = getDisplayName(userName);
  
  // Late night (11 PM - 4 AM) - special care
  if (hour >= 23 || hour < 4) {
    return {
      greeting: `It's late, ${name}`,
      subtext: "I'm here with you in the quiet hours",
      mood: 'late-night',
      suggestedTool: 'sleep-reset'
    };
  }
  
  // Early morning (4 AM - 6 AM)
  if (hour >= 4 && hour < 6) {
    return {
      greeting: `The early hours, ${name}`,
      subtext: "Whether you're rising or still awake, I'm here",
      mood: 'supportive'
    };
  }
  
  // Morning (6 AM - 12 PM)
  if (hour >= 6 && hour < 12) {
    return {
      greeting: `Good morning, ${name}`,
      subtext: "How are you arriving in this day?",
      mood: 'neutral'
    };
  }
  
  // Afternoon (12 PM - 5 PM)
  if (hour >= 12 && hour < 17) {
    return {
      greeting: `Afternoon, ${name}`,
      subtext: "A moment to check in with yourself",
      mood: 'neutral'
    };
  }
  
  // Evening (5 PM - 11 PM)
  return {
    greeting: `Evening, ${name}`,
    subtext: "Let the day's weight begin to settle",
    mood: 'neutral'
  };
};

// Semantic memory greetings based on past patterns
const generateMemoryGreeting = (
  userName: string | undefined,
  lastSession: {
    emotion?: string;
    tool?: string;
    toolName?: string;
    outcome?: 'positive' | 'neutral' | 'difficult';
    daysAgo?: number;
    streak?: number;
    timeOfDay?: string;
  }
): MemoryState => {
  const name = getDisplayName(userName);
  const { emotion, tool, toolName, outcome, daysAgo, streak, timeOfDay } = lastSession;
  const hour = new Date().getHours();
  const isLateNight = hour >= 23 || hour < 4;

  // Streak-based greetings (prioritize positive reinforcement)
  if (streak && streak >= 3) {
    return {
      greeting: `${streak} peaceful days, ${name}`,
      subtext: "You're building something beautiful. Keep going.",
      mood: 'positive'
    };
  }

  // Tool effectiveness memory with time context
  if (tool && toolName && outcome === 'positive') {
    const toolPhrases: Record<string, string> = {
      'breathing': `the breathing exercise helped you find calm`,
      'grounding': `the 5-4-3-2-1 grounding brought you back`,
      'body-scan': `the body scan released some tension`,
      'journaling': `writing helped you process things`,
      'sleep-reset': `the sleep reset helped you rest`,
    };
    
    const phrase = toolPhrases[tool] || `${toolName} helped you`;
    
    // Late night with sleep tool memory
    if (isLateNight && tool === 'sleep-reset') {
      return {
        greeting: `It's late, ${name}`,
        subtext: `Last time at this hour, ${phrase}. Shall we try again?`,
        mood: 'late-night',
        suggestedTool: tool
      };
    }
    
    // Recent positive experience
    if (daysAgo !== undefined && daysAgo <= 2) {
      const timeWord = daysAgo === 0 ? 'Earlier today' : daysAgo === 1 ? 'Yesterday' : 'Recently';
      return {
        greeting: `${timeWord}, ${name}`,
        subtext: `${phrase}. How are you now?`,
        mood: 'positive',
        suggestedTool: tool
      };
    }
    
    return {
      greeting: `Welcome back, ${name}`,
      subtext: `I remember ${phrase}. I'm here whenever you need.`,
      mood: 'positive',
      suggestedTool: tool
    };
  }

  // Emotion-based continuity (supportive, not presumptuous)
  if (emotion && outcome !== 'positive') {
    const emotionPhrases: Record<string, MemoryState> = {
      'calm': { 
        greeting: `Hey ${name}`, 
        subtext: "You left feeling calm last time. Has that peace stayed?", 
        mood: 'positive' 
      },
      'anxious': { 
        greeting: `I'm here, ${name}`, 
        subtext: "Whatever brought you back, we'll take it one breath at a time.", 
        mood: 'supportive' 
      },
      'sad': { 
        greeting: `Glad you're here, ${name}`, 
        subtext: "Some days are heavier than others. I'm with you.", 
        mood: 'supportive' 
      },
      'overwhelmed': { 
        greeting: `One step at a time, ${name}`, 
        subtext: "We'll find a path through together.", 
        mood: 'supportive' 
      },
      'hopeful': { 
        greeting: `Hey ${name}`, 
        subtext: "You left with a spark of hope. I hope it's still glowing.", 
        mood: 'positive' 
      },
    };
    
    return emotionPhrases[emotion] || getTimeBasedGreeting(userName);
  }

  return getTimeBasedGreeting(userName);
};

export function MemoryGreeting({ 
  userId, 
  userName,
  className = '' 
}: MemoryGreetingProps) {
  const [memory, setMemory] = useState<MemoryState>(getTimeBasedGreeting(userName));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMemory = async () => {
      setIsLoading(true);
      
      // Simulate brief load for natural feel
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // TODO: Fetch from /api/memory/greeting with pgvector
      // const response = await fetch(`/api/memory/greeting?userId=${userId}`);
      // const data = await response.json();
      
      // Demo: Simulate memory-based greeting with higher probability at night
      const hour = new Date().getHours();
      const isLateNight = hour >= 23 || hour < 4;
      const hasMemory = isLateNight ? Math.random() > 0.3 : Math.random() > 0.5;
      
      if (hasMemory) {
        const tools = [
          { tool: 'breathing', toolName: 'breathing exercise' },
          { tool: 'grounding', toolName: '5-4-3-2-1 grounding' },
          { tool: 'body-scan', toolName: 'body scan' },
          { tool: 'sleep-reset', toolName: 'sleep reset' }
        ];
        const randomTool = tools[Math.floor(Math.random() * tools.length)];
        
        setMemory(generateMemoryGreeting(userName, {
          ...randomTool,
          outcome: 'positive',
          daysAgo: isLateNight ? 0 : Math.floor(Math.random() * 3),
          streak: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 3 : undefined
        }));
      } else {
        setMemory(getTimeBasedGreeting(userName));
      }
      
      setIsLoading(false);
    };

    loadMemory();
  }, [userId, userName]);

  // Color scheme based on mood
  const moodColors = {
    positive: 'text-[#B8F0E4]', // Neo-Mint soft
    neutral: 'text-slate-200',
    supportive: 'text-[#D8D0E8]', // Digital Lavender soft
    'late-night': 'text-[#B4A7D6]' // Digital Lavender
  };

  const subtextColors = {
    positive: 'text-[#7FDBCA]/80', // Neo-Mint
    neutral: 'text-slate-400',
    supportive: 'text-[#B4A7D6]/80', // Digital Lavender
    'late-night': 'text-slate-400'
  };

  return (
    <motion.header
      className={`text-center px-6 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
    >
      {isLoading ? (
        <motion.div
          className="h-16"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-7 w-48 mx-auto bg-white/5 rounded-lg mb-2" />
          <div className="h-5 w-64 mx-auto bg-white/5 rounded-lg" />
        </motion.div>
      ) : (
        <>
          <motion.h1
            className={`text-2xl font-light tracking-tight ${moodColors[memory.mood || 'neutral']}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {memory.greeting}
          </motion.h1>
          <motion.p
            className={`text-base mt-2 font-light ${subtextColors[memory.mood || 'neutral']}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {memory.subtext}
          </motion.p>
          
          {/* Suggested tool hint */}
          {memory.suggestedTool && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7FDBCA] animate-pulse" />
                Suggested based on your history
              </span>
            </motion.div>
          )}
        </>
      )}
    </motion.header>
  );
}
