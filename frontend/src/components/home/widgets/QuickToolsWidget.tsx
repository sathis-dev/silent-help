'use client';

/**
 * Silent Help - Quick Tools Widget
 * Personalized tool grid based on user preferences
 */

import React from 'react';
import { motion } from 'framer-motion';

interface QuickToolsWidgetProps {
  tools: string[];
  onSelectTool: (toolId: string) => void;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

const TOOL_CONFIG: Record<string, { icon: string; label: string; color: string; description: string }> = {
  breathing: {
    icon: '🌊',
    label: 'Breathing',
    color: '#14B8A6',
    description: 'Calm your mind',
  },
  grounding: {
    icon: '✋',
    label: 'Grounding',
    color: '#8B5CF6',
    description: '5-4-3-2-1',
  },
  journaling: {
    icon: '📝',
    label: 'Journal',
    color: '#F59E0B',
    description: 'Write it out',
  },
  body_scan: {
    icon: '✨',
    label: 'Body Scan',
    color: '#EC4899',
    description: 'Release tension',
  },
  movement: {
    icon: '🚶',
    label: 'Movement',
    color: '#10B981',
    description: 'Gentle motion',
  },
  crisis_contact: {
    icon: '📞',
    label: 'Support',
    color: '#E53935',
    description: 'Talk to someone',
  },
};

export function QuickToolsWidget({
  tools,
  onSelectTool,
  accentColor,
}: QuickToolsWidgetProps) {
  return (
    <motion.div
      className="col-span-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
          Your Tools
        </span>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-3">
        {tools.slice(0, 4).map((toolId, index) => {
          const tool = TOOL_CONFIG[toolId];
          if (!tool) return null;

          return (
            <motion.button
              key={toolId}
              className="p-4 rounded-2xl text-left"
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${tool.color}30`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                boxShadow: `0 0 30px ${tool.color}20`,
                borderColor: `${tool.color}60`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTool(toolId)}
            >
              {/* Icon */}
              <motion.span 
                className="text-2xl block mb-2"
                whileHover={{ scale: 1.1 }}
              >
                {tool.icon}
              </motion.span>
              
              {/* Label */}
              <div className="text-sm font-medium text-white">
                {tool.label}
              </div>
              
              {/* Description */}
              <div className="text-xs text-slate-500 mt-0.5">
                {tool.description}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default QuickToolsWidget;
