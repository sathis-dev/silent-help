'use client';

/**
 * BentoToolGrid - Tool Grid Layout
 * SANCTUARY V3 SPEC - Tools Component
 * 
 * Asymmetric 12-column bento grid for tool cards.
 * Features:
 * - Responsive grid layout
 * - Staggered entry animations
 * - Configurable tool cards
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BentoToolCard, type ToolType } from './BentoToolCard';

// ============================================================================
// TYPES
// ============================================================================

interface ToolGridItem {
  type: ToolType;
  title: string;
  subtitle: string;
  span: 'small' | 'medium' | 'large';
  priority: number;
}

interface BentoToolGridProps {
  onToolSelect?: (tool: ToolType) => void;
  className?: string;
}

// ============================================================================
// DEFAULT TOOL CONFIGURATION
// ============================================================================

const DEFAULT_TOOLS: ToolGridItem[] = [
  {
    type: 'breathing',
    title: 'Breathing',
    subtitle: 'Calm your nervous system',
    span: 'large',
    priority: 1,
  },
  {
    type: 'grounding',
    title: 'Grounding',
    subtitle: '5-4-3-2-1 technique',
    span: 'small',
    priority: 2,
  },
  {
    type: 'journal',
    title: 'Journal',
    subtitle: 'Express your thoughts',
    span: 'small',
    priority: 3,
  },
  {
    type: 'body_scan',
    title: 'Body Scan',
    subtitle: 'Release tension',
    span: 'medium',
    priority: 4,
  },
  {
    type: 'mood_log',
    title: 'Mood Log',
    subtitle: 'Track how you feel',
    span: 'medium',
    priority: 5,
  },
  {
    type: 'patterns',
    title: 'Patterns',
    subtitle: 'View your trends',
    span: 'medium',
    priority: 6,
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 200,
    },
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BentoToolGrid: React.FC<BentoToolGridProps> = ({
  onToolSelect,
  className = '',
}) => {
  // Sort tools by priority
  const sortedTools = [...DEFAULT_TOOLS].sort((a, b) => a.priority - b.priority);

  return (
    <motion.div
      className={`bento-grid ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {sortedTools.map((tool) => (
        <motion.div
          key={tool.type}
          variants={itemVariants}
          className={`
            ${tool.span === 'small' ? 'bento-span-3' : ''}
            ${tool.span === 'medium' ? 'bento-span-4' : ''}
            ${tool.span === 'large' ? 'bento-span-6' : ''}
          `}
        >
          <BentoToolCard
            type={tool.type}
            title={tool.title}
            subtitle={tool.subtitle}
            span={tool.span}
            onClick={() => onToolSelect?.(tool.type)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BentoToolGrid;
