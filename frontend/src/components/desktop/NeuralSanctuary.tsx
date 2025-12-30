'use client';

/**
 * ============================================================================
 * SILENT HELP AI - NEURAL SANCTUARY
 * Ultra Upgrade 2025 - "God-Tier" Implementation
 * ============================================================================
 * 
 * Architecture Philosophy:
 * - Zero-Gravity Design: No sharp edges, no high-contrast white-on-black
 * - Cognitive Load Decompression & Parasympathetic Activation
 * - Low-Pass Visual Filter: Everything feels softer, floatier
 * 
 * Visual Engine:
 * - Dynamic Mesh Gradient Canvas with animated blobs
 * - Glassmorphic Standards: backdrop-blur-3xl bg-white/5 border-white/10
 * - Monochromatic noise 3% for tactile depth
 * 
 * Interaction Physics:
 * - Magnetic elements (20px radius pull)
 * - Stagger sequence: y:20 → y:0 with 0.05s stagger
 * - Haptic feedback on tool card hover
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Home, Wind, Anchor, PenLine, Activity, 
  Sparkles, Heart, Settings, X, ChevronRight,
  Moon, Waves
} from 'lucide-react';
import { NeuralMeshBackground } from '@/components/atmosphere/AtmosphericBackground';
import type { UserProfile } from '@/lib/types/onboarding';
import type { CognitiveState } from '@/lib/neuro-adaptive-engine';

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

const springConfig = {
  damping: 25,
  stiffness: 200,
  mass: 0.8,
};

const magneticSpring = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

// Stagger sequence: 0.05s between cards
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      ...springConfig,
    },
  },
};

// ============================================================================
// GLASSMORPHIC STYLES
// ============================================================================

const glassStyles = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  cardElevated: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
  },
  rail: {
    background: 'rgba(13, 17, 23, 0.6)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
};

// ============================================================================
// MAGNETIC BUTTON COMPONENT
// ============================================================================

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  magneticRadius?: number;
}

function MagneticButton({ 
  children, 
  className = '', 
  onClick,
  magneticRadius = 20,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, magneticSpring);
  const springY = useSpring(y, magneticSpring);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distX = (e.clientX - centerX) * 0.3;
    const distY = (e.clientY - centerY) * 0.3;
    
    // Limit to magnetic radius
    const dist = Math.sqrt(distX * distX + distY * distY);
    if (dist < magneticRadius) {
      x.set(distX);
      y.set(distY);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

// ============================================================================
// VANISHING RAIL NAVIGATION (64px Icon-Only)
// ============================================================================

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  view: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'sanctuary', icon: <Home size={22} strokeWidth={1.5} />, label: 'Sanctuary', view: 'sanctuary' },
  { id: 'breathing', icon: <Wind size={22} strokeWidth={1.5} />, label: 'Breathing', view: 'breathing' },
  { id: 'grounding', icon: <Anchor size={22} strokeWidth={1.5} />, label: 'Grounding', view: 'grounding' },
  { id: 'journal', icon: <PenLine size={22} strokeWidth={1.5} />, label: 'Journal', view: 'journal' },
  { id: 'bodyscan', icon: <Activity size={22} strokeWidth={1.5} />, label: 'Body Scan', view: 'bodyscan' },
];

function VanishingRail({ 
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
      transition={{ delay: 0.3, type: 'spring', ...springConfig }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
    >
      <div 
        className="flex flex-col gap-1 p-2 rounded-2xl"
        style={glassStyles.rail}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          const isHovered = hoveredItem === item.id;
          
          return (
            <div key={item.id} className="relative">
              <MagneticButton
                onClick={() => onViewChange(item.view)}
                className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <div
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-full h-full rounded-xl flex items-center justify-center"
                  style={{
                    color: isActive ? '#6366F1' : 'rgba(148, 163, 184, 0.7)',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    boxShadow: isActive ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none',
                  }}
                >
                  {item.icon}
                </div>
              </MagneticButton>
              
              {/* Hover Label - Spring Slide Out */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute left-full ml-3 px-4 py-2 rounded-xl whitespace-nowrap pointer-events-none"
                    style={{
                      ...glassStyles.cardElevated,
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
        <MagneticButton
          className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Settings size={20} strokeWidth={1.5} />
        </MagneticButton>
      </div>
    </motion.nav>
  );
}

// ============================================================================
// BIO-RESPONSIVE PULSAR (Sanctuary Heart)
// ============================================================================

interface BioPulsarProps {
  bpm: number;
  cognitiveState: CognitiveState;
  onClick?: () => void;
}

function BioPulsar({ bpm, cognitiveState, onClick }: BioPulsarProps) {
  // Sync animation to BPM
  const pulseDuration = 60 / bpm;
  
  // State-based glow color
  const glowColors: Record<CognitiveState, string> = {
    calm: '#6366F1',
    maintenance: '#8B5CF6',
    high_stress: '#F43F5E',
    crisis: '#DC2626',
  };
  
  const glowColor = glowColors[cognitiveState];
  
  // State label
  const stateLabels: Record<CognitiveState, { text: string; color: string }> = {
    calm: { text: 'Calm', color: '#10B981' },
    maintenance: { text: 'Reflective', color: '#8B5CF6' },
    high_stress: { text: 'Elevated', color: '#F59E0B' },
    crisis: { text: 'Crisis', color: '#EF4444' },
  };
  
  const stateInfo = stateLabels[cognitiveState];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, type: 'spring', ...springConfig }}
      className="relative w-80 h-80 flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      {/* Outer Aura - Expanding pulse synced to BPM */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor}15 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      
      {/* Outer Ring - Slow Conic Gradient Rotation */}
      <motion.div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${glowColor}, #8B5CF6, #A855F7, ${glowColor})`,
          opacity: 0.25,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Inner Dark Ring */}
      <div 
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: '#02040A',
          border: `2px solid ${glowColor}40`,
        }}
      />
      
      {/* Data Core - Glassmorphic */}
      <motion.div
        className="absolute w-56 h-56 rounded-full flex flex-col items-center justify-center"
        style={{
          ...glassStyles.cardElevated,
          borderRadius: '100%',
          filter: `drop-shadow(0 0 30px ${glowColor}40)`,
        }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* BPM Display */}
        <motion.span
          className="text-6xl text-white"
          style={{ fontWeight: 200, letterSpacing: '-0.02em' }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: pulseDuration, repeat: Infinity }}
        >
          {bpm}
        </motion.span>
        <span className="text-sm text-slate-400 tracking-[0.3em] mt-1">BPM</span>
        
        {/* State Indicator Pill */}
        <motion.div
          className="mt-4 px-4 py-1.5 rounded-full flex items-center gap-2"
          style={{
            background: `${stateInfo.color}20`,
            border: `1px solid ${stateInfo.color}40`,
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles size={12} style={{ color: stateInfo.color }} />
          <span className="text-xs font-medium" style={{ color: stateInfo.color }}>
            {stateInfo.text}
          </span>
        </motion.div>
      </motion.div>
      
      {/* Interaction Hint */}
      <motion.p
        className="absolute -bottom-8 text-xs text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Tap to expand meditation
      </motion.p>
    </motion.div>
  );
}

// ============================================================================
// BENTO GRID TOOLS (Asymmetric 4-Column)
// ============================================================================

interface BentoItem {
  id: string;
  title: string;
  subtext: string;
  span: number;
  icon: React.ReactNode;
  accentColor: string;
  visual?: 'waveform' | 'ink' | 'pulse';
}

const BENTO_ITEMS: BentoItem[] = [
  {
    id: 'breathing',
    title: 'Breathing',
    subtext: 'Sync your breath',
    span: 2,
    icon: <Wind size={26} strokeWidth={1.5} />,
    accentColor: '#6366F1',
    visual: 'waveform',
  },
  {
    id: 'journal',
    title: 'Journal',
    subtext: 'Release thoughts',
    span: 1,
    icon: <PenLine size={24} strokeWidth={1.5} />,
    accentColor: '#EC4899',
    visual: 'ink',
  },
  {
    id: 'grounding',
    title: 'Grounding',
    subtext: '5-4-3-2-1',
    span: 1,
    icon: <Anchor size={24} strokeWidth={1.5} />,
    accentColor: '#8B5CF6',
    visual: 'pulse',
  },
];

// Live Waveform SVG Component
function LiveWaveform({ color }: { color: string }) {
  return (
    <svg width="140" height="50" viewBox="0 0 140 50" className="opacity-30 group-hover:opacity-60 transition-opacity">
      <motion.path
        d="M0 25 Q17.5 5, 35 25 T70 25 T105 25 T140 25"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: 1, pathOffset: [0, 1] }}
        transition={{ 
          pathLength: { duration: 1.5 },
          pathOffset: { duration: 3, repeat: Infinity, ease: 'linear' }
        }}
      />
    </svg>
  );
}

// Ink Bleed Effect for Journal
function InkBleedEffect({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute bottom-4 right-4 w-16 h-16 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(10px)',
      }}
      animate={{
        scale: [1, 1.5, 1],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  );
}

// Tactile Pulse for Grounding
function TactilePulse({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute bottom-4 right-4 w-12 h-12 rounded-full opacity-0 group-hover:opacity-50 transition-opacity"
      style={{
        border: `2px solid ${color}`,
      }}
      animate={{
        scale: [1, 1.8],
        opacity: [0.5, 0],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

function BentoGrid({ onToolSelect }: { onToolSelect: (tool: string) => void }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-4 gap-4 w-full max-w-2xl"
    >
      {BENTO_ITEMS.map((item) => (
        <motion.div
          key={item.id}
          variants={staggerItem}
          style={{ gridColumn: `span ${item.span}` }}
        >
          <MagneticButton
            onClick={() => onToolSelect(item.id)}
            className="relative w-full rounded-2xl p-5 text-left overflow-hidden group"
          >
            <div
              className="absolute inset-0 rounded-2xl transition-all duration-500"
              style={{
                ...glassStyles.card,
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
            
            {/* Hover Glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: `0 0 40px ${item.accentColor}30`,
              }}
            />
            
            {/* Top Accent Line */}
            <div
              className="absolute top-0 left-0 w-full h-[2px] opacity-60 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${item.accentColor}, transparent)` }}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                style={{
                  background: `${item.accentColor}15`,
                  color: item.accentColor,
                }}
              >
                {item.icon}
              </div>
              
              <h3 className="text-white font-medium mb-1">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.subtext}</p>
            </div>
            
            {/* Visual Effects */}
            {item.visual === 'waveform' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <LiveWaveform color={item.accentColor} />
              </div>
            )}
            {item.visual === 'ink' && <InkBleedEffect color={item.accentColor} />}
            {item.visual === 'pulse' && <TactilePulse color={item.accentColor} />}
          </MagneticButton>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// INSIGHTS FLOATING BUTTON & DRAWER
// ============================================================================

function InsightsFAB({ onClick }: { onClick: () => void }) {
  return (
    <MagneticButton
      onClick={onClick}
      className="fixed right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center z-40"
    >
      <motion.div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          ...glassStyles.cardElevated,
          borderRadius: '100%',
          background: 'rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
        whileHover={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' }}
      >
        <Sparkles size={22} className="text-indigo-400" strokeWidth={1.5} />
      </motion.div>
    </MagneticButton>
  );
}

function InsightsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer - Side Peek */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 z-50 p-6 overflow-y-auto fade-scroll-mask"
            style={{
              ...glassStyles.rail,
              background: 'rgba(2, 4, 10, 0.95)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-indigo-400" />
                <h2 className="text-xl font-light text-white">Insights</h2>
              </div>
              <MagneticButton
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </MagneticButton>
            </div>
            
            {/* Insight Cards */}
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { type: 'OBSERVATION', color: '#10B981', text: 'Your breathing pattern has been more relaxed this evening. Consider maintaining this state.' },
                { type: 'REMINDER', color: '#F59E0B', text: "You haven't journaled in 2 days. Writing can help process emotions." },
                { type: 'ACHIEVEMENT', color: '#6366F1', text: '3 day streak! Opening this app took courage. That matters.' },
              ].map((insight, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="p-4 rounded-xl"
                  style={glassStyles.card}
                >
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full inline-block mb-2"
                    style={{ background: `${insight.color}20`, color: insight.color }}
                  >
                    {insight.type}
                  </span>
                  <p className="text-sm text-slate-300">{insight.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// FLOATING SOS BUTTON (Hold 2 Seconds)
// ============================================================================

function FloatingSOS({ onActivate }: { onActivate: () => void }) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const startHold = useCallback(() => {
    setIsHolding(true);
  }, []);
  
  const endHold = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
    }
  }, []);
  
  useEffect(() => {
    if (isHolding) {
      const interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) {
            endHold();
            onActivate();
            return 0;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isHolding, onActivate, endHold]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        className="relative"
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
            className="absolute inset-0 bg-red-500/40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: holdProgress / 100 }}
            style={{ transformOrigin: 'left' }}
          />
          
          <Heart size={18} className="text-red-400 relative z-10" strokeWidth={1.5} />
          <span className="text-sm font-medium text-red-400 relative z-10">
            {isHolding ? 'Hold...' : 'SOS'}
          </span>
        </div>
      </button>
      
      <p className="text-[10px] text-slate-500 text-center mt-2">
        Hold 2s for emergency
      </p>
    </motion.div>
  );
}

// ============================================================================
// MAIN NEURAL SANCTUARY COMPONENT
// ============================================================================

interface NeuralSanctuaryProps {
  userProfile: UserProfile | null;
}

export function NeuralSanctuary({ userProfile }: NeuralSanctuaryProps) {
  const [activeView, setActiveView] = useState('sanctuary');
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [bpm, setBpm] = useState(65);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('calm');
  
  const displayName = userProfile?.preferences?.displayName || 'Friend';
  
  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Simulate BPM changes (in production, connect to neuro-adaptive-engine)
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(55, Math.min(95, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToolSelect = (tool: string) => {
    setActiveView(tool);
    // TODO: Navigate to tool view
  };

  const handleSOS = () => {
    console.log('SOS Activated - Emergency Protocol');
    // TODO: Implement SOS flow
  };

  const handlePulsarClick = () => {
    // TODO: Expand to full-screen meditation mode
    console.log('Expanding to meditation mode');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Neural Mesh Background - Synced to Cognitive State */}
      <NeuralMeshBackground cognitiveState={cognitiveState} />
      
      {/* Vanishing Rail Navigation */}
      <VanishingRail activeView={activeView} onViewChange={setActiveView} />
      
      {/* Main Content with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-12"
        >
          {/* Header - Variable Weight Typography */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', ...springConfig }}
            className="text-center mb-12"
          >
            <motion.p 
              className="text-sm text-slate-500 mb-3 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getGreeting()}, {displayName}
            </motion.p>
            
            {/* Display font: Bricolage Grotesque style (simulated with weight) */}
            <h1 
              className="text-5xl md:text-6xl tracking-tight"
              style={{
                fontWeight: cognitiveState === 'calm' ? 200 : cognitiveState === 'high_stress' ? 300 : 250,
                background: 'linear-gradient(to right, #ffffff, #64748b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'font-weight 0.5s ease',
              }}
            >
              Your Sanctuary
            </h1>
            
            <motion.p
              className="text-slate-500 mt-3 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              A safe space, just for you
            </motion.p>
          </motion.div>
          
          {/* Bio-Responsive Pulsar */}
          <BioPulsar 
            bpm={bpm} 
            cognitiveState={cognitiveState} 
            onClick={handlePulsarClick}
          />
          
          {/* Quick Access Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-slate-500 tracking-[0.3em] uppercase mt-16 mb-6"
          >
            Quick Access
          </motion.p>
          
          {/* Bento Grid Tools */}
          <BentoGrid onToolSelect={handleToolSelect} />
          
          {/* Safety Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-slate-600 mt-16 italic"
          >
            You&apos;re safe here. Take all the time you need.
          </motion.p>
        </motion.main>
      </AnimatePresence>
      
      {/* Insights FAB */}
      <InsightsFAB onClick={() => setInsightsOpen(true)} />
      
      {/* Floating SOS */}
      <FloatingSOS onActivate={handleSOS} />
      
      {/* Insights Drawer */}
      <InsightsDrawer isOpen={insightsOpen} onClose={() => setInsightsOpen(false)} />
    </div>
  );
}

export default NeuralSanctuary;
