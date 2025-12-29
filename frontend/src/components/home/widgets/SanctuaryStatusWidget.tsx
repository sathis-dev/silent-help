'use client';

/**
 * Silent Help - Sanctuary Status Widget
 * Biometric and mood overview card
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SanctuaryStatusWidgetProps {
  heartRate?: number;
  showBiometrics: boolean;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

export function SanctuaryStatusWidget({
  heartRate = 72,
  showBiometrics,
  accentColor,
}: SanctuaryStatusWidgetProps) {
  const stressLevel = heartRate > 85 ? 'elevated' : heartRate > 100 ? 'high' : 'calm';
  
  const statusColors = {
    calm: { color: '#7FDBCA', label: 'Calm', icon: '😊' },
    elevated: { color: '#F59E0B', label: 'Elevated', icon: '😐' },
    high: { color: '#E53935', label: 'Stressed', icon: '😰' },
  };

  const status = statusColors[stressLevel];

  return (
    <motion.div
      className="col-span-2 p-5 rounded-3xl"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        {/* Heart Rate Section */}
        {showBiometrics && (
          <div className="flex items-center gap-4">
            <motion.div
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${status.color}20 0%, transparent 100%)`,
                border: `1px solid ${status.color}40`,
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${status.color}20`,
                  `0 0 30px ${status.color}30`,
                  `0 0 20px ${status.color}20`,
                ],
              }}
              transition={{ duration: 60 / heartRate, repeat: Infinity }}
            >
              <span className="text-xl font-light" style={{ color: status.color }}>
                {heartRate}
              </span>
            </motion.div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">BPM</div>
              <div className="text-sm text-slate-300">Heart Rate</div>
            </div>
          </div>
        )}

        {/* Status Section */}
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {status.icon}
          </motion.span>
          <div className="text-right">
            <div className="text-sm font-medium" style={{ color: status.color }}>
              {status.label}
            </div>
            <div className="text-xs text-slate-500">
              Sanctuary status
            </div>
          </div>
        </div>
      </div>

      {/* Connection status */}
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-2">
          {showBiometrics ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Wearable connected
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              No wearable
            </>
          )}
        </span>
        <span>Updated now</span>
      </div>
    </motion.div>
  );
}

export default SanctuaryStatusWidget;
