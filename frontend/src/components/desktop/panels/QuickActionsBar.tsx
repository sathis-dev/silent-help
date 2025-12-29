'use client';

/**
 * Silent Help - Quick Actions Bar
 * "The Command Center" - Bottom action bar for quick access
 * 
 * Always-visible bar with essential actions and panel toggles.
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Quick Actions Bar Component
// ============================================================================

interface QuickActionsBarProps {
  onToolSelect: (tool: string) => void;
  onSOS: () => void;
  onToggleTools: () => void;
  onToggleInsights: () => void;
  showToolsPanel: boolean;
  showInsightsPanel: boolean;
}

export function QuickActionsBar({
  onToolSelect,
  onSOS,
  onToggleTools,
  onToggleInsights,
  showToolsPanel,
  showInsightsPanel,
}: QuickActionsBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="h-16 border-t border-white/5 flex items-center justify-between px-6"
      style={{
        background: 'rgba(10, 15, 26, 0.9)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left Section - Panel Toggles */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={onToggleTools}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
            ${showToolsPanel 
              ? 'bg-white/10 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/8'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className="hidden lg:inline">Tools</span>
        </motion.button>
        
        <motion.button
          onClick={onToggleInsights}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
            ${showInsightsPanel 
              ? 'bg-white/10 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/8'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="hidden lg:inline">Insights</span>
        </motion.button>
      </div>
      
      {/* Center Section - Quick Tools */}
      <div className="flex items-center gap-3">
        <QuickActionButton
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          }
          label="Breathe"
          color="#4ECDB3"
          onClick={() => onToolSelect('breathing')}
        />
        
        <QuickActionButton
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M5 10l7 7 7-7" />
            </svg>
          }
          label="Ground"
          color="#B4A7D6"
          onClick={() => onToolSelect('grounding')}
        />
        
        <QuickActionButton
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          }
          label="Journal"
          color="#F472B6"
          onClick={() => onToolSelect('journal')}
        />
        
        {/* SOS Button */}
        <motion.button
          onClick={onSOS}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm"
          style={{
            background: 'linear-gradient(90deg, #E53935, #C62828)',
            boxShadow: '0 0 30px rgba(229, 57, 53, 0.3)',
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 40px rgba(229, 57, 53, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🆘
          </motion.span>
          <span className="text-white hidden sm:inline">SOS</span>
        </motion.button>
      </div>
      
      {/* Right Section - Status & Help */}
      <div className="flex items-center gap-4">
        {/* Privacy Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <motion.div 
            className="w-2 h-2 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="hidden xl:inline">Private & Encrypted</span>
        </div>
        
        {/* Help Button */}
        <motion.button
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </motion.button>
        
        {/* Keyboard Shortcuts */}
        <motion.button
          className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-500 hover:bg-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">⌘</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">K</kbd>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Quick Action Button Component
// ============================================================================

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, color, onClick }: QuickActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      whileHover={{ 
        scale: 1.05,
        background: `${color}20`,
        borderColor: `${color}40`,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-white hidden lg:inline">{label}</span>
    </motion.button>
  );
}
