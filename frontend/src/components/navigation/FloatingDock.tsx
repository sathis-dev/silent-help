'use client';

/**
 * FloatingDock - Desktop Navigation
 * SANCTUARY V3 SPEC - Navigation Component
 * 
 * Icon-only navigation that expands on hover with spring physics.
 * Features:
 * - Collapsed state: 72px icons only
 * - Expanded state: 240px with labels
 * - Spring animation for label reveal
 * - Active state glow halo
 * - SOS at top, Settings at bottom (separated)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Home,
  Wind,
  Anchor,
  PenLine,
  Activity,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DockItem {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  separated?: boolean;
  position?: 'top' | 'bottom';
}

interface FloatingDockProps {
  activeId?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}

// ============================================================================
// DOCK ITEMS CONFIGURATION
// ============================================================================

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'sos',
    label: 'SOS',
    icon: Heart,
    accent: '#ef4444',
    position: 'top',
    separated: true,
  },
  {
    id: 'sanctuary',
    label: 'Sanctuary',
    icon: Home,
    accent: '#6366f1',
  },
  {
    id: 'breathing',
    label: 'Breathing',
    icon: Wind,
    accent: '#14b8a6',
  },
  {
    id: 'grounding',
    label: 'Grounding',
    icon: Anchor,
    accent: '#8b5cf6',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: PenLine,
    accent: '#ec4899',
  },
  {
    id: 'body_scan',
    label: 'Body Scan',
    icon: Activity,
    accent: '#f59e0b',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: Sparkles,
    accent: '#0ea5e9',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    accent: '#64748b',
    position: 'bottom',
    separated: true,
  },
];

// ============================================================================
// SPRING CONFIGURATION
// ============================================================================

const springConfig = {
  type: 'spring' as const,
  damping: 20,
  stiffness: 300,
};

// ============================================================================
// DOCK ITEM COMPONENT
// ============================================================================

interface DockItemButtonProps {
  item: DockItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

const DockItemButton: React.FC<DockItemButtonProps> = ({
  item,
  isActive,
  isExpanded,
  onClick,
}) => {
  const Icon = item.icon;
  const isSOS = item.id === 'sos';

  return (
    <motion.button
      className="group relative flex items-center justify-center rounded-xl transition-colors focus-ring"
      style={{
        background: isActive
          ? `${item.accent}15`
          : isSOS
          ? 'rgba(239, 68, 68, 0.1)'
          : 'transparent',
        height: '44px',
        width: '100%',
        justifyContent: isExpanded ? 'flex-start' : 'center',
        paddingLeft: isExpanded ? '8px' : '0',
        paddingRight: isExpanded ? '8px' : '0',
      }}
      onClick={onClick}
      whileHover={{ background: isActive ? `${item.accent}20` : 'rgba(255,255,255,0.05)' }}
      whileTap={{ scale: 0.98 }}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator bar - positioned on left edge */}
      {(isActive || isSOS) && (
        <motion.div
          className="absolute left-0 top-1/2 w-[3px] rounded-r-full"
          style={{ 
            background: item.accent,
            height: '20px',
            transform: 'translateY(-50%)',
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={springConfig}
        />
      )}

      {/* Icon - centered when collapsed, left-aligned when expanded */}
      <motion.div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: '32px',
          height: '32px',
          background: isActive ? `${item.accent}20` : 'transparent',
          boxShadow: isActive ? `0 0 16px ${item.accent}30` : 'none',
        }}
        animate={{
          scale: isActive ? 1.05 : 1,
        }}
        transition={springConfig}
      >
        <Icon
          size={18}
          style={{
            color: isActive || isSOS ? item.accent : '#64748b',
          }}
          strokeWidth={isSOS ? 2.5 : 1.5}
        />
      </motion.div>

      {/* Label - only visible when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            className="text-sm font-medium whitespace-nowrap ml-3"
            style={{
              color: isActive ? '#f1f5f9' : '#94a3b8',
            }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ ...springConfig, duration: 0.15 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {!isExpanded && (
        <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 text-xs text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg border border-white/10">
          {item.label}
        </div>
      )}
    </motion.button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeId = 'sanctuary',
  onNavigate,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNavigate = useCallback(
    (id: string) => {
      onNavigate?.(id);
    },
    [onNavigate]
  );

  // Separate items by position
  const topItems = DOCK_ITEMS.filter((item) => item.position === 'top');
  const mainItems = DOCK_ITEMS.filter(
    (item) => !item.position || (item.position !== 'top' && item.position !== 'bottom')
  );
  const bottomItems = DOCK_ITEMS.filter((item) => item.position === 'bottom');

  return (
    <motion.nav
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 ${className}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{
        width: isExpanded ? 180 : 56,
      }}
      transition={springConfig}
    >
      <div
        className="flex flex-col rounded-2xl"
        style={{
          padding: '10px 6px',
          background: 'rgba(10, 15, 20, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Top section (SOS) */}
        {topItems.length > 0 && (
          <div className="pb-2 mb-2 border-b border-white/10">
            {topItems.map((item) => (
              <DockItemButton
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                isExpanded={isExpanded}
                onClick={() => handleNavigate(item.id)}
              />
            ))}
          </div>
        )}

        {/* Main navigation items */}
        <div className="space-y-0.5 flex-1">
          {mainItems.map((item) => (
            <DockItemButton
              key={item.id}
              item={item}
              isActive={activeId === item.id}
              isExpanded={isExpanded}
              onClick={() => handleNavigate(item.id)}
            />
          ))}
        </div>

        {/* Bottom section (Settings) */}
        {bottomItems.length > 0 && (
          <div className="pt-2 mt-2 border-t border-white/10">
            {bottomItems.map((item) => (
              <DockItemButton
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                isExpanded={isExpanded}
                onClick={() => handleNavigate(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default FloatingDock;
