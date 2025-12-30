'use client';

/**
 * MobileTabBar - Mobile Bottom Navigation
 * SANCTUARY V3 SPEC - Navigation Component
 * 
 * Features:
 * - Bottom tab bar with safe area respect
 * - Haptic feedback on tap
 * - Active state with icon lift and glow
 * - Glass morphism background
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Wind,
  Anchor,
  PenLine,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileTabBarProps {
  activeId?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}

// ============================================================================
// TAB ITEMS CONFIGURATION
// ============================================================================

const TAB_ITEMS: TabItem[] = [
  { id: 'sanctuary', label: 'Sanctuary', icon: Home },
  { id: 'breathing', label: 'Breathe', icon: Wind },
  { id: 'grounding', label: 'Ground', icon: Anchor },
  { id: 'journal', label: 'Journal', icon: PenLine },
];

// ============================================================================
// TAB ITEM COMPONENT
// ============================================================================

const TabItemButton: React.FC<{
  item: TabItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick();
  }, [onClick]);

  return (
    <motion.button
      className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] touch-44"
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <motion.div
        animate={{
          y: isActive ? -2 : 0,
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <Icon
          size={24}
          strokeWidth={isActive ? 2 : 1.5}
          style={{
            color: isActive ? '#6366f1' : '#64748b',
            filter: isActive ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' : 'none',
          }}
        />
      </motion.div>
      <span
        className="text-[10px] font-medium transition-colors"
        style={{ color: isActive ? '#6366f1' : '#64748b' }}
      >
        {item.label}
      </span>
    </motion.button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeId = 'sanctuary',
  onNavigate,
  className = '',
}) => {
  const handleNavigate = useCallback(
    (id: string) => {
      onNavigate?.(id);
    },
    [onNavigate]
  );

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        flex justify-around items-center
        px-4 py-2
        ${className}
      `}
      style={{
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
        background: 'rgba(13, 17, 23, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {TAB_ITEMS.map((item) => (
        <TabItemButton
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onClick={() => handleNavigate(item.id)}
        />
      ))}
    </nav>
  );
};

export default MobileTabBar;
