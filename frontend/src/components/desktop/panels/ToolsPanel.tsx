'use client';

/**
 * Silent Help - Tools Panel
 * "The Wellness Arsenal" - Left sidebar tools panel
 * 
 * Displays personalized tools based on user persona.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserPersona, UserPreferences, CopingPreference } from '@/lib/types/onboarding';

// ============================================================================
// Tool Definitions
// ============================================================================

interface Tool {
  id: CopingPreference;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  category: 'calming' | 'grounding' | 'reflective' | 'physical';
  color: string;
  premium?: boolean;
}

const ALL_TOOLS: Tool[] = [
  {
    id: 'breathing',
    label: 'Breathing Exercises',
    description: 'Regulate your nervous system with guided breathing patterns',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    duration: '2-10 min',
    category: 'calming',
    color: '#4ECDB3',
  },
  {
    id: 'grounding',
    label: '5-4-3-2-1 Grounding',
    description: 'Reconnect with the present through your senses',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M5 10l7 7 7-7" />
        <circle cx="12" cy="21" r="2" />
      </svg>
    ),
    duration: '5 min',
    category: 'grounding',
    color: '#B4A7D6',
  },
  {
    id: 'journaling',
    label: 'Reflective Journal',
    description: 'Express thoughts and discover patterns',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    duration: 'Open',
    category: 'reflective',
    color: '#F472B6',
  },
  {
    id: 'body_scan',
    label: 'Body Scan',
    description: 'Guided awareness through each part of your body',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v8M8 21l2-5h4l2 5M6 12h12" />
      </svg>
    ),
    duration: '10 min',
    category: 'calming',
    color: '#60A5FA',
  },
  {
    id: 'movement',
    label: 'Gentle Movement',
    description: 'Release tension through mindful stretches',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="2" />
        <path d="M4 17l4-4 4 4M16 13l4 4M12 7v6" />
      </svg>
    ),
    duration: '5-15 min',
    category: 'physical',
    color: '#FCD34D',
  },
  {
    id: 'connection',
    label: 'Connection Prompts',
    description: 'Guided ways to reach out to loved ones',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    duration: '5 min',
    category: 'reflective',
    color: '#F472B6',
    premium: true,
  },
];

// ============================================================================
// Persona Tool Priorities
// ============================================================================

const PERSONA_PRIORITIES: Record<UserPersona, CopingPreference[]> = {
  crisis_seeker: ['breathing', 'grounding', 'body_scan', 'connection'],
  anxiety_manager: ['breathing', 'grounding', 'journaling', 'body_scan'],
  stress_professional: ['breathing', 'journaling', 'movement', 'grounding'],
  curious_explorer: ['journaling', 'breathing', 'grounding', 'movement'],
  caregiver: ['breathing', 'journaling', 'connection', 'body_scan'],
  returning_user: ['breathing', 'journaling', 'grounding', 'body_scan'],
};

// ============================================================================
// Tools Panel Component
// ============================================================================

interface ToolsPanelProps {
  persona: UserPersona;
  onToolSelect: (toolId: string) => void;
  preferences?: UserPreferences;
}

export function ToolsPanel({ persona, onToolSelect, preferences }: ToolsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get prioritized tools based on persona
  const priorities = PERSONA_PRIORITIES[persona];
  const prioritizedTools = [...ALL_TOOLS].sort((a, b) => {
    const aIndex = priorities.indexOf(a.id);
    const bIndex = priorities.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  // Filter tools
  const filteredTools = prioritizedTools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'calming', label: 'Calming' },
    { id: 'grounding', label: 'Grounding' },
    { id: 'reflective', label: 'Reflective' },
    { id: 'physical', label: 'Physical' },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Wellness Tools</h2>
        <p className="text-sm text-slate-500">Personalized for you</p>
      </div>
      
      {/* Search */}
      <div className="relative mb-4">
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20"
        />
      </div>
      
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${activeCategory === cat.id 
                ? 'bg-white/10 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/8'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>
      
      {/* Tools List */}
      <div className="flex-1 overflow-y-auto space-y-3 -mx-2 px-2">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => (
            <motion.button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group w-full p-4 rounded-xl text-left transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{ 
                scale: 1.01,
                background: 'rgba(255,255,255,0.05)',
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div 
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: `${tool.color}15`,
                    color: tool.color,
                  }}
                >
                  {tool.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white truncate">
                      {tool.label}
                    </h3>
                    {tool.premium && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                
                {/* Duration */}
                <span className="text-xs text-slate-600 whitespace-nowrap">
                  {tool.duration}
                </span>
              </div>
              
              {/* Hover indicator */}
              <motion.div
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                initial={{ x: -5 }}
                whileHover={{ x: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.button>
          ))}
        </AnimatePresence>
        
        {filteredTools.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No tools found
          </div>
        )}
      </div>
      
      {/* Suggested Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(127, 219, 202, 0.1), rgba(180, 167, 214, 0.1))',
          border: '1px solid rgba(127, 219, 202, 0.2)',
        }}
      >
        <p className="text-xs text-slate-400 mb-2">✨ Suggested for now</p>
        <p className="text-sm text-white">
          Take a 2-minute breathing break to reset
        </p>
      </motion.div>
    </div>
  );
}
