'use client';

/**
 * Silent Help - Desktop Navigation
 * "The Gentle Sanctuary" - Calming Sidebar Navigation
 * 
 * OPTIMIZED FOR SMOOTH PERFORMANCE:
 * - Uses CSS transitions instead of Framer Motion for layout
 * - GPU-accelerated transforms only (translateX, opacity)
 * - Minimal React state changes
 * - CSS-based hover states (no re-renders)
 */

import React, { useState, useCallback } from 'react';
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
    primary: '#E8A5A5',
    soft: 'rgba(232, 165, 165, 0.15)',
    text: '#F5D5D5',
    bg: 'rgba(232, 165, 165, 0.08)',
  },
  anxiety_manager: {
    primary: '#C4B8DC',
    soft: 'rgba(196, 184, 220, 0.15)',
    text: '#E8E0F0',
    bg: 'rgba(196, 184, 220, 0.08)',
  },
  stress_professional: {
    primary: '#A5C4E8',
    soft: 'rgba(165, 196, 232, 0.15)',
    text: '#D5E5F5',
    bg: 'rgba(165, 196, 232, 0.08)',
  },
  curious_explorer: {
    primary: '#A8D8CC',
    soft: 'rgba(168, 216, 204, 0.15)',
    text: '#D0EDE6',
    bg: 'rgba(168, 216, 204, 0.08)',
  },
  caregiver: {
    primary: '#E8C4D8',
    soft: 'rgba(232, 196, 216, 0.15)',
    text: '#F5E0EC',
    bg: 'rgba(232, 196, 216, 0.08)',
  },
  returning_user: {
    primary: '#B8D4C8',
    soft: 'rgba(184, 212, 200, 0.15)',
    text: '#DCF0E8',
    bg: 'rgba(184, 212, 200, 0.08)',
  },
};

// ============================================================================
// Navigation Items
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
// CSS Keyframes (injected once)
// ============================================================================

const styles = `
  @keyframes gentleBreath {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.12); }
  }
  
  @keyframes softPulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 0.5; }
  }
  
  .nav-sidebar {
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
  }
  
  .nav-item {
    transition: transform 0.2s ease, background-color 0.25s ease;
    will-change: transform;
  }
  
  .nav-item:hover {
    transform: translateX(3px);
    background-color: rgba(255, 255, 255, 0.03);
  }
  
  .nav-label {
    transition: opacity 0.2s ease, transform 0.2s ease;
    will-change: opacity, transform;
  }
  
  .nav-icon-container {
    transition: color 0.25s ease, background-color 0.25s ease;
  }
  
  .tooltip {
    transition: opacity 0.15s ease, transform 0.15s ease;
    will-change: opacity, transform;
  }
  
  .breathing-orb {
    animation: gentleBreath 5s ease-in-out infinite;
  }
  
  .active-indicator {
    animation: softPulse 6s ease-in-out infinite;
  }
`;

// ============================================================================
// Main Navigation Component - Pure CSS Transitions
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
  
  const persona: UserPersona = userProfile?.persona || 'curious_explorer';
  const displayName = userProfile?.preferences?.displayName || 'Friend';
  const theme = PERSONA_THEMES[persona];

  const handleMouseEnter = useCallback(() => setIsExpanded(true), []);
  const handleMouseLeave = useCallback(() => setIsExpanded(false), []);

  return (
    <>
      {/* Inject styles once */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <nav
        className="nav-sidebar relative h-screen flex flex-col border-r border-white/5"
        style={{ 
          width: isExpanded ? 260 : 76,
          background: 'linear-gradient(180deg, rgba(18, 22, 30, 0.98) 0%, rgba(12, 16, 22, 0.99) 100%)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Subtle ambient glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.bg}, transparent)`,
          }}
        />
        
        {/* ================================================================== */}
        {/* Logo */}
        {/* ================================================================== */}
        <div className="h-18 flex items-center px-4 py-5 border-b border-white/5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: theme.soft,
              border: `1px solid ${theme.primary}25`,
            }}
          >
            <div
              className="breathing-orb w-3.5 h-3.5 rounded-full"
              style={{ background: theme.primary }}
            />
          </div>
          
          <div
            className="nav-label ml-3 whitespace-nowrap overflow-hidden"
            style={{
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
            }}
          >
            <span className="text-lg font-medium" style={{ color: theme.primary }}>
              Silent
            </span>
            <span className="text-lg font-light text-slate-400 ml-1">Help</span>
          </div>
        </div>
        
        {/* ================================================================== */}
        {/* Navigation Items */}
        {/* ================================================================== */}
        <div className="flex-1 py-5 px-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.view)}
                className="nav-item relative w-full mb-1.5 rounded-xl overflow-hidden group"
                style={{ 
                  height: 52,
                  background: isActive ? theme.soft : 'transparent',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="active-indicator absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: theme.primary }}
                  />
                )}
                
                {/* Content */}
                <div className={`relative h-full flex items-center ${isExpanded ? 'px-3.5' : 'justify-center'}`}>
                  {/* Icon */}
                  <div
                    className="nav-icon-container w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      color: isActive ? theme.primary : 'rgba(148, 163, 184, 0.8)',
                      background: isActive ? `${theme.primary}12` : 'transparent',
                    }}
                  >
                    {item.icon}
                  </div>
                  
                  {/* Label */}
                  <div
                    className="nav-label ml-3 text-left overflow-hidden"
                    style={{
                      opacity: isExpanded ? 1 : 0,
                      transform: isExpanded ? 'translateX(0)' : 'translateX(-6px)',
                    }}
                  >
                    <p 
                      className="text-sm font-medium"
                      style={{ color: isActive ? theme.text : 'rgba(226, 232, 240, 0.85)' }}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Tooltip (CSS only, no state) */}
                {!isExpanded && (
                  <div
                    className="tooltip absolute left-full ml-3 px-3.5 py-2.5 rounded-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'rgba(20, 25, 35, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      transform: 'translateX(8px)',
                    }}
                  >
                    <p className="text-sm font-medium text-slate-200">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* ================================================================== */}
        {/* Help Button */}
        {/* ================================================================== */}
        <div className="px-2.5 py-3 border-t border-white/5">
          <button
            onClick={onSOS}
            className="nav-item relative w-full h-12 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(232, 165, 165, 0.08)',
              border: '1px solid rgba(232, 165, 165, 0.15)',
            }}
          >
            <div className={`relative h-full flex items-center ${isExpanded ? 'px-3.5' : 'justify-center'}`}>
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
              
              <div
                className="nav-label ml-3 overflow-hidden"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateX(0)' : 'translateX(-6px)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: '#E8A5A5' }}>
                  Need Support
                </p>
                <p className="text-[11px] text-slate-500">We&apos;re here for you</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* ================================================================== */}
        {/* User Profile */}
        {/* ================================================================== */}
        <div className="px-2.5 py-4 border-t border-white/5">
          <div
            className="h-14 rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div className={`h-full flex items-center ${isExpanded ? 'px-3' : 'justify-center'}`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: theme.soft,
                  border: `1px solid ${theme.primary}30`,
                }}
              >
                <span className="text-sm font-medium" style={{ color: theme.primary }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div
                className="nav-label ml-3 flex-1 min-w-0 overflow-hidden"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateX(0)' : 'translateX(-6px)',
                }}
              >
                <p className="text-sm font-medium text-slate-200 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Welcome back 💚
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
