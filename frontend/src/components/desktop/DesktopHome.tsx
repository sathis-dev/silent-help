'use client';

/**
 * Silent Help - Desktop Home
 * "The Digital Sanctuary" - Premium website-style desktop experience
 * 
 * A cinematic, immersive interface designed for larger screens.
 * Features:
 * - Floating glassmorphic panels
 * - Ambient particle systems
 * - Smooth parallax effects
 * - Personalized based on onboarding results
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { DesktopNavigation } from './navigation/DesktopNavigation';
import { SanctuaryCenter } from './sanctuary/SanctuaryCenter';
import { ToolsPanel } from './panels/ToolsPanel';
import { InsightsPanel } from './panels/InsightsPanel';
import { QuickActionsBar } from './panels/QuickActionsBar';
import { useOnboarding } from '@/components/onboarding';
import type { UserProfile, UserPersona } from '@/lib/types/onboarding';

// ============================================================================
// Desktop Color Palette - Extended for larger screens
// ============================================================================

const DESKTOP_COLORS = {
  // Deep sanctuary colors
  void: '#020617',
  surface: '#0a0f1a',
  elevated: '#111827',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassBackground: 'rgba(15, 23, 42, 0.6)',
  
  // Accent gradients
  accent: {
    lavender: { from: '#B4A7D6', to: '#8B7FB8' },
    mint: { from: '#7FDBCA', to: '#4ECDB3' },
    rose: { from: '#F472B6', to: '#DB2777' },
    amber: { from: '#FCD34D', to: '#F59E0B' },
    blue: { from: '#60A5FA', to: '#3B82F6' },
  },
  
  // SOS
  sos: '#E53935',
};

// ============================================================================
// Ambient Particle System
// ============================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

function AmbientParticles({ persona }: { persona: UserPersona }) {
  // Generate particles based on persona using useMemo to avoid setState in effect
  const particles = useMemo(() => {
    const colors = {
      crisis_seeker: ['rgba(229, 57, 53, 0.15)', 'rgba(244, 114, 182, 0.1)'],
      anxiety_manager: ['rgba(180, 167, 214, 0.15)', 'rgba(139, 127, 184, 0.1)'],
      stress_professional: ['rgba(96, 165, 250, 0.15)', 'rgba(59, 130, 246, 0.1)'],
      curious_explorer: ['rgba(127, 219, 202, 0.15)', 'rgba(78, 205, 179, 0.1)'],
      caregiver: ['rgba(244, 114, 182, 0.15)', 'rgba(180, 167, 214, 0.1)'],
      returning_user: ['rgba(127, 219, 202, 0.15)', 'rgba(180, 167, 214, 0.1)'],
    };

    const personaColors = colors[persona] || colors.curious_explorer;
    
    // Use deterministic pseudo-random based on persona to avoid hydration mismatch
    const seed = persona.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 5) * 100,
      y: seededRandom(i * 5 + 1) * 100,
      size: seededRandom(i * 5 + 2) * 4 + 2,
      opacity: seededRandom(i * 5 + 3) * 0.5 + 0.2,
      duration: seededRandom(i * 5 + 4) * 20 + 15,
      delay: seededRandom(i * 5 + 5) * -20,
      color: personaColors[Math.floor(seededRandom(i * 5 + 6) * personaColors.length)],
    }));
  }, [persona]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
          animate={{
            y: [0, -200, 0],
            x: [0, (particle.x % 100) - 50, 0],
            opacity: [0, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Atmospheric Background
// ============================================================================

function DesktopAtmosphere({ persona }: { persona: UserPersona }) {
  const gradients = {
    crisis_seeker: [
      'radial-gradient(ellipse 80% 50% at 20% 30%, rgba(229, 57, 53, 0.08) 0%, transparent 50%)',
      'radial-gradient(ellipse 60% 40% at 80% 70%, rgba(244, 114, 182, 0.05) 0%, transparent 50%)',
    ],
    anxiety_manager: [
      'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(180, 167, 214, 0.1) 0%, transparent 50%)',
      'radial-gradient(ellipse 60% 40% at 70% 60%, rgba(139, 127, 184, 0.08) 0%, transparent 50%)',
    ],
    stress_professional: [
      'radial-gradient(ellipse 80% 50% at 25% 35%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
      'radial-gradient(ellipse 60% 40% at 75% 65%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
    ],
    curious_explorer: [
      'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(127, 219, 202, 0.1) 0%, transparent 50%)',
      'radial-gradient(ellipse 60% 40% at 70% 60%, rgba(78, 205, 179, 0.08) 0%, transparent 50%)',
    ],
    caregiver: [
      'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(244, 114, 182, 0.1) 0%, transparent 50%)',
      'radial-gradient(ellipse 60% 40% at 70% 60%, rgba(180, 167, 214, 0.08) 0%, transparent 50%)',
    ],
    returning_user: [
      'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(127, 219, 202, 0.1) 0%, transparent 50%)',
      'radial-gradient(ellipse 60% 40% at 70% 60%, rgba(180, 167, 214, 0.08) 0%, transparent 50%)',
    ],
  };

  const personaGradients = gradients[persona] || gradients.curious_explorer;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Base void */}
      <div 
        className="absolute inset-0"
        style={{ background: DESKTOP_COLORS.void }}
      />
      
      {/* Persona-specific gradients */}
      {personaGradients.map((gradient, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{ background: gradient }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Grid overlay for tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2, 6, 23, 0.8) 100%)',
        }}
      />
    </div>
  );
}

// ============================================================================
// Glassmorphic Panel Component
// ============================================================================

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  isFloating?: boolean;
}

function GlassPanel({ 
  children, 
  className = '', 
  style = {}, 
  glowColor,
  isFloating = false 
}: GlassPanelProps) {
  return (
    <motion.div
      className={`
        relative rounded-2xl overflow-hidden
        ${className}
      `}
      style={{
        background: DESKTOP_COLORS.glassBackground,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${DESKTOP_COLORS.glassBorder}`,
        boxShadow: glowColor 
          ? `0 0 60px ${glowColor}, 0 20px 60px rgba(0,0,0,0.3)`
          : '0 20px 60px rgba(0,0,0,0.3)',
        ...style,
      }}
      initial={isFloating ? { y: 10 } : undefined}
      animate={isFloating ? { y: [0, -5, 0] } : undefined}
      transition={isFloating ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Inner glow effect */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      />
      {children}
    </motion.div>
  );
}

// ============================================================================
// View States
// ============================================================================

type DesktopView = 
  | 'sanctuary'     // Main home view
  | 'breathing'     // Breathing exercise
  | 'grounding'     // Grounding exercise
  | 'journal'       // Journaling
  | 'bodyscan'      // Body scan
  | 'sos'           // Crisis mode
  | 'settings';     // Settings

// ============================================================================
// Main Desktop Home Component
// ============================================================================

interface DesktopHomeProps {
  userProfile: UserProfile | null;
}

export function DesktopHome({ userProfile }: DesktopHomeProps) {
  const [activeView, setActiveView] = useState<DesktopView>('sanctuary');
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get persona (default to curious_explorer)
  const persona: UserPersona = userProfile?.persona || 'curious_explorer';
  const displayName = userProfile?.preferences?.displayName || 'Explorer';
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'Deep in the night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Night has fallen';
  };
  
  // Handle tool selection
  const handleToolSelect = useCallback((tool: string) => {
    switch (tool) {
      case 'breathing':
        setActiveView('breathing');
        break;
      case 'grounding':
        setActiveView('grounding');
        break;
      case 'journal':
        setActiveView('journal');
        break;
      case 'bodyscan':
        setActiveView('bodyscan');
        break;
      default:
        break;
    }
  }, []);
  
  // Handle SOS
  const handleSOS = useCallback(() => {
    setActiveView('sos');
  }, []);
  
  // Handle back to sanctuary
  const handleBackToSanctuary = useCallback(() => {
    setActiveView('sanctuary');
  }, []);
  
  // Handle view change from navigation
  const handleViewChange = useCallback((view: string) => {
    const validViews: DesktopView[] = ['sanctuary', 'breathing', 'grounding', 'journal', 'bodyscan', 'sos', 'settings'];
    if (validViews.includes(view as DesktopView)) {
      setActiveView(view as DesktopView);
    }
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Atmospheric Background */}
      <DesktopAtmosphere persona={persona} />
      
      {/* Ambient Particles */}
      <AmbientParticles persona={persona} />
      
      {/* Main Layout Container */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Navigation Sidebar */}
        <DesktopNavigation 
          activeView={activeView}
          onViewChange={handleViewChange}
          userProfile={userProfile}
          onSOS={handleSOS}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/5">
            {/* Greeting */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-sm text-slate-500 font-light">
                  {getGreeting()}
                </span>
                <span className="text-lg text-white font-medium">
                  {displayName}
                </span>
              </motion.div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-6">
              {/* Sanctuary Status */}
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-slate-400">Sanctuary Active</span>
              </div>
              
              {/* Time */}
              <span className="text-sm text-slate-500 font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setActiveView('settings')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </motion.button>
            </div>
          </header>
          
          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Tools */}
            <AnimatePresence>
              {showToolsPanel && activeView === 'sanctuary' && (
                <motion.aside
                  initial={{ opacity: 0, x: -50, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 320 }}
                  exit={{ opacity: 0, x: -50, width: 0 }}
                  className="border-r border-white/5 overflow-hidden"
                >
                  <ToolsPanel 
                    persona={persona}
                    onToolSelect={handleToolSelect}
                    preferences={userProfile?.preferences}
                  />
                </motion.aside>
              )}
            </AnimatePresence>
            
            {/* Center - Main View */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeView === 'sanctuary' && (
                  <motion.div
                    key="sanctuary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full"
                  >
                    <SanctuaryCenter 
                      persona={persona}
                      displayName={displayName}
                      onToolSelect={handleToolSelect}
                      onSOS={handleSOS}
                    />
                  </motion.div>
                )}
                
                {activeView === 'breathing' && (
                  <BreathingView onBack={handleBackToSanctuary} />
                )}
                
                {activeView === 'grounding' && (
                  <GroundingView onBack={handleBackToSanctuary} />
                )}
                
                {activeView === 'journal' && (
                  <JournalView onBack={handleBackToSanctuary} />
                )}
                
                {activeView === 'bodyscan' && (
                  <BodyScanView onBack={handleBackToSanctuary} />
                )}
                
                {activeView === 'sos' && (
                  <SOSView onBack={handleBackToSanctuary} />
                )}
                
                {activeView === 'settings' && (
                  <SettingsView onBack={handleBackToSanctuary} userProfile={userProfile} />
                )}
              </AnimatePresence>
            </div>
            
            {/* Right Panel - Insights */}
            <AnimatePresence>
              {showInsightsPanel && activeView === 'sanctuary' && (
                <motion.aside
                  initial={{ opacity: 0, x: 50, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 340 }}
                  exit={{ opacity: 0, x: 50, width: 0 }}
                  className="border-l border-white/5 overflow-hidden"
                >
                  <InsightsPanel 
                    persona={persona}
                    preferences={userProfile?.preferences}
                  />
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
          
          {/* Quick Actions Bar - Always visible */}
          <QuickActionsBar 
            onToolSelect={handleToolSelect}
            onSOS={handleSOS}
            onToggleTools={() => setShowToolsPanel(prev => !prev)}
            onToggleInsights={() => setShowInsightsPanel(prev => !prev)}
            showToolsPanel={showToolsPanel}
            showInsightsPanel={showInsightsPanel}
          />
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Views (Placeholder Components)
// ============================================================================

function BreathingView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col items-center justify-center p-8"
    >
      <ViewHeader title="Breathing Exercise" onBack={onBack} />
      
      {/* Breathing Circle */}
      <motion.div
        className="w-64 h-64 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative"
        animate={{
          scale: [1, 1.3, 1.3, 1],
          borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.3)'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          times: [0, 0.33, 0.66, 1],
        }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1.2, 1],
            opacity: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            times: [0, 0.33, 0.66, 1],
          }}
        />
        
        <motion.span
          className="text-xl text-emerald-400 font-light"
          animate={{
            opacity: [1, 1, 1, 1],
          }}
        >
          <BreathingText />
        </motion.span>
      </motion.div>
      
      <p className="mt-8 text-slate-400 text-center max-w-md">
        Follow the circle. Breathe in as it expands, hold, then breathe out as it contracts.
      </p>
    </motion.div>
  );
}

function BreathingText() {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    const cycle = () => {
      setPhase('inhale');
      setTimeout(() => setPhase('hold'), 4000);
      setTimeout(() => setPhase('exhale'), 8000);
    };
    
    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, []);
  
  const texts = {
    inhale: 'Breathe in...',
    hold: 'Hold...',
    exhale: 'Breathe out...',
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {texts[phase]}
      </motion.span>
    </AnimatePresence>
  );
}

function GroundingView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col items-center justify-center p-8"
    >
      <ViewHeader title="Grounding Exercise" onBack={onBack} />
      
      <div className="text-center max-w-xl">
        <h2 className="text-3xl font-light text-white mb-8">5-4-3-2-1 Technique</h2>
        
        <div className="grid grid-cols-5 gap-4 mb-12">
          {[
            { num: 5, sense: 'See', icon: '👁️' },
            { num: 4, sense: 'Touch', icon: '✋' },
            { num: 3, sense: 'Hear', icon: '👂' },
            { num: 2, sense: 'Smell', icon: '👃' },
            { num: 1, sense: 'Taste', icon: '👅' },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <span className="text-3xl mb-2">{item.icon}</span>
              <span className="text-2xl font-bold text-white">{item.num}</span>
              <span className="text-sm text-slate-400">{item.sense}</span>
            </motion.div>
          ))}
        </div>
        
        <p className="text-slate-400">
          Take your time to notice each sensation. There&apos;s no rush.
        </p>
      </div>
    </motion.div>
  );
}

function JournalView({ onBack }: { onBack: () => void }) {
  const [entry, setEntry] = useState('');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col p-8"
    >
      <ViewHeader title="Journal" onBack={onBack} />
      
      <div className="flex-1 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-light text-white mb-4">How are you feeling?</h2>
        <p className="text-slate-400 mb-8">Write freely. Your words are encrypted and private.</p>
        
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Begin writing here..."
          className="w-full h-96 bg-white/5 border border-white/10 rounded-xl p-6 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-lavender-500/50"
          style={{ fontFamily: 'Georgia, serif' }}
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-slate-500">{entry.length} characters</span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-lavender-500 to-lavender-600 text-white font-medium"
            style={{ background: 'linear-gradient(to right, #B4A7D6, #8B7FB8)' }}
          >
            Save Entry
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function BodyScanView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col items-center justify-center p-8"
    >
      <ViewHeader title="Body Scan" onBack={onBack} />
      
      <div className="text-center max-w-md">
        <div className="text-6xl mb-8">🧘</div>
        <h2 className="text-2xl font-light text-white mb-4">Body Awareness</h2>
        <p className="text-slate-400 mb-8">
          Close your eyes and bring attention to each part of your body, 
          starting from your toes and moving upward.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
        >
          Begin Guided Scan
        </motion.button>
      </div>
    </motion.div>
  );
}

function SOSView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col items-center justify-center p-8"
      style={{ background: 'linear-gradient(to bottom, rgba(229, 57, 53, 0.1), transparent)' }}
    >
      <motion.button
        onClick={onBack}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2"
        whileHover={{ x: -5 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Safety
      </motion.button>
      
      <div className="text-center max-w-lg">
        <motion.div
          className="text-7xl mb-8"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🆘
        </motion.div>
        
        <h2 className="text-3xl font-semibold text-white mb-4">You&apos;re Not Alone</h2>
        <p className="text-slate-300 mb-8">
          If you&apos;re in crisis, please reach out. Help is available 24/7.
        </p>
        
        <div className="grid gap-4">
          <motion.a
            href="tel:988"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block px-8 py-4 rounded-xl bg-red-500 text-white font-bold text-lg"
          >
            📞 Call 988 (Suicide & Crisis Lifeline)
          </motion.a>
          
          <motion.a
            href="sms:741741"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block px-8 py-4 rounded-xl bg-white/10 text-white font-medium border border-white/20"
          >
            💬 Text HOME to 741741
          </motion.a>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-xl bg-white/5 text-slate-300 font-medium border border-white/10"
          >
            Find Local Resources
          </motion.button>
        </div>
        
        <p className="mt-8 text-sm text-slate-500">
          Your safety matters. These resources are confidential and free.
        </p>
      </div>
    </motion.div>
  );
}

function SettingsView({ onBack, userProfile }: { onBack: () => void; userProfile: UserProfile | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full overflow-y-auto p-8"
    >
      <ViewHeader title="Settings" onBack={onBack} />
      
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Section */}
        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-4">Profile</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Display Name</span>
              <span className="text-white">{userProfile?.preferences?.displayName || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Persona</span>
              <span className="text-white capitalize">{userProfile?.persona?.replace('_', ' ') || 'Explorer'}</span>
            </div>
          </div>
        </section>
        
        {/* Preferences Section */}
        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Animation Intensity</span>
              <span className="text-white capitalize">{userProfile?.preferences?.animationIntensity || 'Moderate'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Color Temperature</span>
              <span className="text-white capitalize">{userProfile?.preferences?.colorTemperature || 'Neutral'}</span>
            </div>
          </div>
        </section>
        
        {/* Danger Zone */}
        <section className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
          <h3 className="text-lg font-medium text-red-400 mb-4">Reset</h3>
          <p className="text-slate-400 mb-4">Clear all data and restart onboarding.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('silent_help_onboarding_complete');
                localStorage.removeItem('silent_help_user_profile');
                localStorage.removeItem('silent_help_onboarding_session');
                window.location.reload();
              }
            }}
          >
            Reset Onboarding
          </motion.button>
        </section>
      </div>
    </motion.div>
  );
}

// ============================================================================
// View Header Component
// ============================================================================

function ViewHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <motion.button
        onClick={onBack}
        className="text-slate-400 hover:text-white flex items-center gap-2 mb-4"
        whileHover={{ x: -5 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
    </div>
  );
}
