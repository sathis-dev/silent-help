'use client';

/**
 * Silent Help AI - Ultra Upgrade
 * Build Year: 2025
 * 
 * Design DNA:
 * - Theme: Midnight Stealth (Low-light UI)
 * - Aesthetic: Glassmorphism & Neural-Organic
 * - Objective: Total Cognitive Silence
 * - Motion: Damped Spring (Viscous & Calm)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Wind, Anchor, PenLine, Activity, 
  Sparkles, Heart, Settings, X 
} from 'lucide-react';
import type { UserProfile } from '@/lib/types/onboarding';

// ============================================================================
// Animation Configuration
// ============================================================================

const springConfig = {
  damping: 25,
  stiffness: 120,
  mass: 1,
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};

// ============================================================================
// Glass Styles
// ============================================================================

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.02)',
};

// ============================================================================
// Neural Mesh Background
// ============================================================================

function NeuralMeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: '#02040A' }}>
      {/* Animated Blob 1 */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #1E293B 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: '-20%',
          left: '-10%',
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Animated Blob 2 */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #312E81 0%, transparent 70%)',
          filter: 'blur(80px)',
          bottom: '-10%',
          right: '-5%',
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -30, 0],
          scale: [0.8, 1, 0.9, 0.8],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Blob 3 - Subtle accent */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #0F172A 0%, transparent 60%)',
          filter: 'blur(60px)',
          top: '40%',
          left: '30%',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// ============================================================================
// Floating Rail Navigation
// ============================================================================

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  view: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'sanctuary', icon: <Home size={20} />, label: 'Sanctuary', view: 'sanctuary' },
  { id: 'breathing', icon: <Wind size={20} />, label: 'Breathing', view: 'breathing' },
  { id: 'grounding', icon: <Anchor size={20} />, label: 'Grounding', view: 'grounding' },
  { id: 'journal', icon: <PenLine size={20} />, label: 'Journal', view: 'journal' },
  { id: 'bodyscan', icon: <Activity size={20} />, label: 'Body Scan', view: 'bodyscan' },
];

function FloatingRail({ 
  activeView, 
  onViewChange 
}: { 
  activeView: string; 
  onViewChange: (view: string) => void;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, ...springConfig }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
    >
      <div 
        className="flex flex-col gap-2 p-2 rounded-2xl"
        style={glassStyle}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          const isHovered = hoveredItem === item.id;
          
          return (
            <div key={item.id} className="relative">
              <motion.button
                onClick={() => onViewChange(item.view)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  color: isActive ? '#6366F1' : 'rgba(148, 163, 184, 0.7)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon}
              </motion.button>
              
              {/* Hover Label - Slides out */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute left-full ml-3 px-3 py-2 rounded-lg whitespace-nowrap"
                    style={{
                      ...glassStyle,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        
        {/* Divider */}
        <div className="w-8 h-px bg-white/10 mx-auto my-2" />
        
        {/* Settings */}
        <motion.button
          className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings size={20} />
        </motion.button>
      </div>
    </motion.nav>
  );
}

// ============================================================================
// Heartbeat Pulsar
// ============================================================================

function HeartbeatPulsar({ bpm = 65 }: { bpm?: number }) {
  const [pulsePhase, setPulsePhase] = useState(0);
  
  // Simulate heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 100);
    }, (60 / bpm) * 1000 / 100);
    return () => clearInterval(interval);
  }, [bpm]);

  const pulseIntensity = Math.sin(pulsePhase * Math.PI / 50) * 0.5 + 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative w-80 h-80 flex items-center justify-center cursor-pointer"
    >
      {/* Outer Aura - Expanding pulse */}
      <motion.div
        className="absolute w-full h-full rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 60 / bpm,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      
      {/* Outer Ring - Conic Gradient */}
      <motion.div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #6366F1, #8B5CF6, #A855F7, #6366F1)',
          opacity: 0.3,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Inner Ring */}
      <div 
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: '#02040A',
          border: '2px solid rgba(99, 102, 241, 0.3)',
        }}
      />
      
      {/* Data Core */}
      <motion.div
        className="absolute w-56 h-56 rounded-full flex flex-col items-center justify-center"
        style={{
          ...glassStyle,
          boxShadow: `0 0 ${30 + pulseIntensity * 20}px rgba(99, 102, 241, ${0.2 + pulseIntensity * 0.2})`,
        }}
      >
        {/* BPM Display */}
        <motion.span
          className="text-6xl font-extralight text-white"
          style={{ fontWeight: 200 }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 60 / bpm, repeat: Infinity }}
        >
          {bpm}
        </motion.span>
        <span className="text-sm text-slate-400 tracking-widest mt-1">BPM</span>
        
        {/* Status Pill */}
        <motion.div
          className="mt-4 px-4 py-1.5 rounded-full flex items-center gap-2"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles size={14} className="text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Calm</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Bento Grid Tools
// ============================================================================

interface BentoItem {
  id: string;
  title: string;
  subtext: string;
  span: number;
  icon: React.ReactNode;
  color: string;
  duration?: string;
}

const BENTO_ITEMS: BentoItem[] = [
  {
    id: 'breathing',
    title: 'Breathing',
    subtext: 'Sync your breath',
    span: 2,
    icon: <Wind size={24} />,
    color: '#6366F1',
    duration: '2 min',
  },
  {
    id: 'grounding',
    title: 'Grounding',
    subtext: '5-4-3-2-1',
    span: 1,
    icon: <Anchor size={24} />,
    color: '#8B5CF6',
    duration: '5 min',
  },
  {
    id: 'journal',
    title: 'Journal',
    subtext: 'Release thoughts',
    span: 1,
    icon: <PenLine size={24} />,
    color: '#EC4899',
  },
];

function BentoGrid({ onToolSelect }: { onToolSelect: (tool: string) => void }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="grid grid-cols-4 gap-4 w-full max-w-2xl"
    >
      {BENTO_ITEMS.map((item, index) => (
        <motion.button
          key={item.id}
          variants={fadeInUp}
          onClick={() => onToolSelect(item.id)}
          className={`relative rounded-2xl p-5 text-left overflow-hidden group`}
          style={{
            ...glassStyle,
            gridColumn: `span ${item.span}`,
          }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Gradient Accent */}
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-60"
            style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
          />
          
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
            style={{
              background: `${item.color}15`,
              color: item.color,
            }}
          >
            {item.icon}
          </div>
          
          {/* Content */}
          <h3 className="text-white font-medium mb-1">{item.title}</h3>
          <p className="text-sm text-slate-400">{item.subtext}</p>
          
          {/* Duration Badge */}
          {item.duration && (
            <span 
              className="absolute bottom-4 right-4 text-xs px-2 py-1 rounded-full"
              style={{ background: `${item.color}20`, color: item.color }}
            >
              {item.duration}
            </span>
          )}
          
          {/* Waveform for Breathing */}
          {item.id === 'breathing' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
              <svg width="120" height="40" viewBox="0 0 120 40">
                <motion.path
                  d="M0 20 Q15 5, 30 20 T60 20 T90 20 T120 20"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ============================================================================
// Insights Drawer (Side-Peek)
// ============================================================================

function InsightsDrawer({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 z-50 p-6 overflow-y-auto"
            style={{
              ...glassStyle,
              background: 'rgba(2, 4, 10, 0.95)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-indigo-400" />
                <h2 className="text-xl font-light text-white">Insights</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Insight Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={glassStyle}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    OBSERVATION
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Your breathing pattern has been more relaxed this evening. 
                  Consider maintaining this state with a short session.
                </p>
              </div>
              
              <div className="p-4 rounded-xl" style={glassStyle}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    REMINDER
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  You haven&apos;t journaled in 2 days. Writing can help process emotions.
                </p>
              </div>
              
              <div className="p-4 rounded-xl" style={glassStyle}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                    ACHIEVEMENT
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  3 day streak! Opening this app took courage. That matters.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Floating SOS Button
// ============================================================================

function FloatingSOSButton({ onActivate }: { onActivate: () => void }) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) {
            setIsHolding(false);
            onActivate();
            return 0;
          }
          return p + 5;
        });
      }, 100);
    } else {
      // Defer state update to avoid synchronous setState in effect
      const timeout = setTimeout(() => setHoldProgress(0), 0);
      return () => clearTimeout(timeout);
    }
    
    return () => clearInterval(interval);
  }, [isHolding, onActivate]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
    >
      <div
        className="relative px-6 py-3 rounded-full flex items-center gap-3 overflow-hidden"
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        {/* Progress Fill */}
        <motion.div
          className="absolute inset-0 bg-red-500/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: holdProgress / 100 }}
          style={{ transformOrigin: 'left' }}
        />
        
        <Heart size={18} className="text-red-400 relative z-10" />
        <span className="text-sm font-medium text-red-400 relative z-10">
          {isHolding ? 'Hold...' : 'SOS'}
        </span>
      </div>
      
      {/* Instruction */}
      <p className="text-[10px] text-slate-500 text-center mt-2">
        Hold 2 seconds for emergency
      </p>
    </motion.button>
  );
}

// ============================================================================
// Insights FAB
// ============================================================================

function InsightsFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      onClick={onClick}
      className="fixed right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center z-40"
      style={{
        ...glassStyle,
        background: 'rgba(99, 102, 241, 0.2)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Sparkles size={22} className="text-indigo-400" />
    </motion.button>
  );
}

// ============================================================================
// Main Ultra Desktop Home
// ============================================================================

interface UltraDesktopHomeProps {
  userProfile: UserProfile | null;
}

export function UltraDesktopHome({ userProfile }: UltraDesktopHomeProps) {
  const [activeView, setActiveView] = useState('sanctuary');
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [bpm, setBpm] = useState(65);
  
  const displayName = userProfile?.preferences?.displayName || 'Friend';
  
  // Simulate BPM changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToolSelect = (tool: string) => {
    setActiveView(tool);
  };

  const handleSOS = () => {
    console.log('SOS Activated');
    // Handle SOS activation
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Neural Mesh Background */}
      <NeuralMeshBackground />
      
      {/* Floating Rail Navigation */}
      <FloatingRail activeView={activeView} onViewChange={setActiveView} />
      
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm text-slate-500 mb-2">Good evening, {displayName}</p>
          <h1 
            className="text-5xl font-extralight tracking-tight"
            style={{
              background: 'linear-gradient(to right, #ffffff, #64748b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 200,
            }}
          >
            Your Sanctuary
          </h1>
          <p className="text-slate-500 mt-3">A safe space, just for you</p>
        </motion.div>
        
        {/* Heartbeat Pulsar */}
        <HeartbeatPulsar bpm={bpm} />
        
        {/* Quick Access Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-slate-500 tracking-widest uppercase mt-16 mb-6"
        >
          Quick Access
        </motion.p>
        
        {/* Bento Grid */}
        <BentoGrid onToolSelect={handleToolSelect} />
        
        {/* Bottom Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-slate-600 mt-16 italic"
        >
          You&apos;re safe here. Take all the time you need.
        </motion.p>
      </main>
      
      {/* Insights FAB */}
      <InsightsFAB onClick={() => setInsightsOpen(true)} />
      
      {/* Floating SOS */}
      <FloatingSOSButton onActivate={handleSOS} />
      
      {/* Insights Drawer */}
      <InsightsDrawer isOpen={insightsOpen} onClose={() => setInsightsOpen(false)} />
    </div>
  );
}