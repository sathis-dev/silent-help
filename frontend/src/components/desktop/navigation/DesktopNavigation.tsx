'use client';

/**
 * Silent Help - Desktop Navigation
 * "The Gentle Sanctuary" - Calming Sidebar Navigation
 * 
 * Designed with mental wellness in mind:
 * - Soft, muted colors that don't overwhelm
 * - Slow, breathing-pace animations (4-7 seconds)
 * - Minimal movement to reduce anxiety
 * - Warm, welcoming atmosphere
 * - Safe, stable visual experience
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, UserPersona } from '@/lib/types/onboarding';

// ============================================================================
// Gentle Persona Themes - Soft, Calming Colors
// ============================================================================

const PERSONA_THEMES: Record<UserPersona, {
  primary: string;
  soft: string;
  text: string;
  bg: string;
}> = {
  crisis_seeker: {
    primary: '#E8A5A5',     // Soft rose - gentle, not alarming
    soft: 'rgba(232, 165, 165, 0.15)',
    text: '#F5D5D5',
    bg: 'rgba(232, 165, 165, 0.08)',
  },
  anxiety_manager: {
    primary: '#C4B8DC',     // Soft lavender - calming
    soft: 'rgba(196, 184, 220, 0.15)',
    text: '#E8E0F0',
    bg: 'rgba(196, 184, 220, 0.08)',
  },
  stress_professional: {
    primary: '#A5C4E8',     // Soft sky blue - peaceful
    soft: 'rgba(165, 196, 232, 0.15)',
    text: '#D5E5F5',
    bg: 'rgba(165, 196, 232, 0.08)',
  },
  curious_explorer: {
    primary: '#A8D8CC',     // Soft sage - natural, grounding
    soft: 'rgba(168, 216, 204, 0.15)',
    text: '#D0EDE6',
    bg: 'rgba(168, 216, 204, 0.08)',
  },
  caregiver: {
    primary: '#E8C4D8',     // Soft blush - warm, nurturing
    soft: 'rgba(232, 196, 216, 0.15)',
    text: '#F5E0EC',
    bg: 'rgba(232, 196, 216, 0.08)',
  },
  returning_user: {
    primary: '#B8D4C8',     // Soft mint - fresh, familiar
    soft: 'rgba(184, 212, 200, 0.15)',
    text: '#DCF0E8',
    bg: 'rgba(184, 212, 200, 0.08)',
  },
};

// ============================================================================
// Navigation Items - Simple, Clear Icons
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  description: string;
  view: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'sanctuary',
    label: 'Sanctuary',
    description: 'Your peaceful space',
    view: 'sanctuary',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'breathing',
    label: 'Breathing',
    description: 'Calm your mind',
    view: 'breathing',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'grounding',
    label: 'Grounding',
    description: 'Connect to now',
    view: 'grounding',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 4v12" />
        <path d="M8 12l4 4 4-4" />
        <circle cx="12" cy="20" r="2" />
      </svg>
    ),
  },
  {
    id: 'journal',
    label: 'Journal',
    description: 'Express yourself',
    view: 'journal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: 'bodyscan',
    label: 'Body Scan',
    description: 'Gentle awareness',
    view: 'bodyscan',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="5" r="2.5" />
        <path d="M12 8v6" />
        <path d="M8 21l2-5h4l2 5" />
        <path d="M7 11h10" />
      </svg>
    ),
  },
];

// ============================================================================
// Gentle Breathing Indicator - Very Slow, Calming
// ============================================================================

function BreathingIndicator({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
      style={{ background: color, opacity: 0.4 }}
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ 
        duration: 6, // Slow, calming breath pace
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ============================================================================
// Main Navigation Component - Calm & Therapeutic
// ============================================================================

interface DesktopNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userProfile: UserProfile | null;
  onSOS: () => void;
}

export function DesktopNavigation({ 
  activeView, 
  onViewChange, 
  userProfile,
  onSOS 
}: DesktopNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const persona: UserPersona = userProfile?.persona || 'curious_explorer';
  const displayName = userProfile?.preferences?.displayName || 'Friend';
  const theme = PERSONA_THEMES[persona];

  return (
    <motion.nav
      className="relative h-screen flex flex-col border-r"
      initial={{ width: 76 }}
      animate={{ width: isExpanded ? 260 : 76 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1], // Smooth, gentle easing
      }}
      style={{ 
        background: 'linear-gradient(180deg, rgba(18, 22, 30, 0.98) 0%, rgba(12, 16, 22, 0.99) 100%)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Subtle warm ambient glow - very gentle */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.bg}, transparent)`,
        }}
      />
      
      {/* ================================================================== */}
      {/* Logo - Calm, Welcoming */}
      {/* ================================================================== */}
      <div className="h-18 flex items-center px-4 py-5 border-b border-white/5">
        <motion.div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            background: theme.soft,
            border: `1px solid ${theme.primary}25`,
          }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gentle breathing core */}
          <motion.div
            className="w-3.5 h-3.5 rounded-full"
            style={{ background: theme.primary }}
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{ 
              duration: 5, // Very slow, like deep breathing
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="ml-3 whitespace-nowrap"
            >
              <span 
                className="text-lg font-medium"
                style={{ color: theme.primary }}
              >
                Silent
              </span>
              <span className="text-lg font-light text-slate-400 ml-1">Help</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* ================================================================== */}
      {/* Navigation Items - Clean, Simple */}
      {/* ================================================================== */}
      <div className="flex-1 py-5 px-2.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          const isHovered = hoveredItem === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.view)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative w-full mb-1.5 rounded-xl overflow-hidden"
              style={{ height: 52 }}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.25 }}
            >
              {/* Subtle background on hover/active */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={false}
                animate={{
                  background: isActive 
                    ? theme.soft
                    : isHovered
                      ? 'rgba(255,255,255,0.03)'
                      : 'transparent',
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Active indicator - gentle line */}
              {isActive && (
                <BreathingIndicator color={theme.primary} />
              )}
              
              {/* Content */}
              <div className={`relative h-full flex items-center ${isExpanded ? 'px-3.5' : 'justify-center'}`}>
                {/* Icon container */}
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                  style={{
                    color: isActive ? theme.primary : isHovered ? theme.text : 'rgba(148, 163, 184, 0.8)',
                    background: isActive ? `${theme.primary}12` : 'transparent',
                  }}
                >
                  {item.icon}
                </motion.div>
                
                {/* Label & Description */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 text-left"
                    >
                      <p 
                        className="text-sm font-medium transition-colors duration-300"
                        style={{ color: isActive ? theme.text : 'rgba(226, 232, 240, 0.85)' }}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Tooltip - clean, simple */}
              <AnimatePresence>
                {!isExpanded && isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-full ml-3 px-3.5 py-2.5 rounded-xl whitespace-nowrap z-50"
                    style={{
                      background: 'rgba(20, 25, 35, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                  >
                    <p className="text-sm font-medium text-slate-200">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      
      {/* ================================================================== */}
      {/* Help Button - Calm, Accessible (Not Alarming) */}
      {/* ================================================================== */}
      <div className="px-2.5 py-3 border-t border-white/5">
        <motion.button
          onClick={onSOS}
          className="relative w-full h-12 rounded-xl overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div 
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'rgba(232, 165, 165, 0.08)',
              border: '1px solid rgba(232, 165, 165, 0.15)',
            }}
          />
          
          <div className={`relative h-full flex items-center ${isExpanded ? 'px-3.5' : 'justify-center'}`}>
            {/* Gentle heart icon instead of aggressive pulse line */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(232, 165, 165, 0.1)' }}
            >
              <svg 
                width="20" height="20" viewBox="0 0 24 24" 
                fill="none" 
                stroke="#E8A5A5" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <p className="text-sm font-medium" style={{ color: '#E8A5A5' }}>
                    Need Support
                  </p>
                  <p className="text-[11px] text-slate-500">We're here for you</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
      
      {/* ================================================================== */}
      {/* User Profile - Warm, Personal */}
      {/* ================================================================== */}
      <div className="px-2.5 py-4 border-t border-white/5">
        <div
          className="h-14 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div className={`h-full flex items-center ${isExpanded ? 'px-3' : 'justify-center'}`}>
            {/* Avatar - warm and welcoming */}
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: theme.soft,
                border: `1px solid ${theme.primary}30`,
              }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <span 
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
            </motion.div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Welcome back 💚
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
