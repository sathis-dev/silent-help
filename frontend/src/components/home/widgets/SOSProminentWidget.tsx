'use client';

/**
 * Silent Help - SOS Prominent Widget
 * Large, accessible emergency button for crisis persona
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SOSProminentWidgetProps {
  onTriggerSOS: () => void;
  accentColor: string;
  userName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
}

export function SOSProminentWidget({
  onTriggerSOS,
}: SOSProminentWidgetProps) {
  return (
    <motion.div
      className="col-span-2 py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.button
        className="w-full py-6 rounded-3xl text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.2) 0%, rgba(229, 57, 53, 0.1) 100%)',
          border: '2px solid rgba(229, 57, 53, 0.5)',
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 0 50px rgba(229, 57, 53, 0.3)',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onTriggerSOS}
      >
        {/* Pulse rings */}
        {[1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-3xl"
            style={{ border: '2px solid rgba(229, 57, 53, 0.3)' }}
            animate={{
              scale: [1, 1.05 + ring * 0.02],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: ring * 0.5,
            }}
          />
        ))}

        <div className="relative flex flex-col items-center gap-2">
          <span className="text-3xl font-bold text-red-500">SOS</span>
          <span className="text-white text-lg">Get Immediate Support</span>
          <span className="text-slate-400 text-sm">Tap to connect with crisis resources</span>
        </div>
      </motion.button>

      {/* Reassurance */}
      <motion.p
        className="text-center text-slate-500 text-xs mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        You&apos;re not alone. Help is available 24/7.
      </motion.p>
    </motion.div>
  );
}

export default SOSProminentWidget;
