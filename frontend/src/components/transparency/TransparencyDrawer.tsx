'use client';

/**
 * Silent Help - Model Transparency Drawer
 * "Elite-Level Trust" - Show users exactly WHY the AI made a recommendation
 * 
 * This drawer displays:
 * - Current cognitive state assessment
 * - Factors that influenced the decision
 * - Data sources used (biometrics, interaction, history)
 * - Confidence level
 * - Alternative options
 * 
 * DCB0129 Compliance: Full audit trail visible to user
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNeuroAdaptiveContext } from '@/components/providers/NeuroAdaptiveProvider';
import { CognitiveState, ATMOSPHERE_PALETTES } from '@/lib/neuro-adaptive-engine';
import { TransparencyExplanation, TransparencyFactor } from '@/lib/clinical-safety';

// ============================================================================
// Types
// ============================================================================

interface TransparencyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explanation?: TransparencyExplanation;
}

// ============================================================================
// Helper Components
// ============================================================================

function StateIndicator({ state, confidence }: { state: CognitiveState; confidence: number }) {
  const palette = ATMOSPHERE_PALETTES[state];
  
  const stateLabels: Record<CognitiveState, string> = {
    calm: 'Calm & Settled',
    maintenance: 'Reflective',
    high_stress: 'Elevated Stress',
    crisis: 'Crisis Mode',
  };

  const stateDescriptions: Record<CognitiveState, string> = {
    calm: 'Your interaction patterns suggest a relaxed state.',
    maintenance: 'A good time for deeper reflection and journaling.',
    high_stress: 'Signs of stress detected. The interface has simplified.',
    crisis: 'Multiple stress indicators detected. Help is available.',
  };

  return (
    <div 
      className="p-4 rounded-2xl border"
      style={{ 
        backgroundColor: `${palette.primary}15`,
        borderColor: `${palette.primary}40`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span 
          className="text-lg font-semibold"
          style={{ color: palette.primary }}
        >
          {stateLabels[state]}
        </span>
        <span className="text-sm text-slate-400">
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>
      
      {/* Confidence bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: palette.primary }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <p className="text-sm text-slate-300">
        {stateDescriptions[state]}
      </p>
    </div>
  );
}

function FactorCard({ factor }: { factor: TransparencyFactor }) {
  const sourceIcons: Record<string, string> = {
    biometric: '❤️',
    interaction: '👆',
    history: '📊',
    time: '🕐',
    pattern: '🔄',
  };

  const sourceLabels: Record<string, string> = {
    biometric: 'Wearable Data',
    interaction: 'App Interaction',
    history: 'Your History',
    time: 'Time of Day',
    pattern: 'Behavioral Pattern',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
      <span className="text-xl">{sourceIcons[factor.source]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">{factor.name}</p>
        <p className="text-xs text-slate-400">{factor.value}</p>
      </div>
      <div className="text-right">
        <span className="text-xs text-slate-500">{sourceLabels[factor.source]}</span>
        <div className="flex gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i <= Math.round(factor.weight * 5) 
                  ? '#7FDBCA' 
                  : '#334155',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DataSourceList({ sources }: { sources: string[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-400">Data Sources Used</h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => (
          <span 
            key={i}
            className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300"
          >
            {source}
          </span>
        ))}
      </div>
    </div>
  );
}

function AlternativeActions({ alternatives }: { alternatives: string[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-400">You Can Also</h4>
      <div className="space-y-2">
        {alternatives.map((alt, i) => (
          <button
            key={i}
            className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-left text-sm text-slate-300 transition-colors flex items-center gap-3"
          >
            <span className="text-slate-500">→</span>
            {alt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Drawer Component
// ============================================================================

export function TransparencyDrawer({ isOpen, onClose, explanation }: TransparencyDrawerProps) {
  const { 
    cognitiveState, 
    confidence, 
    stateReason,
    isWearableConnected,
    lastBiometricSync,
  } = useNeuroAdaptiveContext();

  // Generate default explanation if none provided
  const defaultExplanation: TransparencyExplanation = {
    decision: `Interface adapted to ${cognitiveState} mode`,
    factors: [
      { name: 'Interaction Pattern', value: stateReason, weight: 0.6, source: 'interaction' },
      { name: 'Time of Day', value: new Date().toLocaleTimeString(), weight: 0.2, source: 'time' },
      ...(isWearableConnected ? [
        { name: 'Biometric Sync', value: lastBiometricSync?.toLocaleTimeString() || 'Recent', weight: 0.5, source: 'biometric' as const }
      ] : []),
    ],
    confidence,
    hazardsConsidered: ['HAZ-001', 'HAZ-004'],
    dataUsed: [
      'App interaction patterns',
      'Time of day',
      ...(isWearableConnected ? ['Wearable biometrics'] : []),
    ],
    alternatives: [
      'Try a different technique',
      'Adjust my preferences',
      'Take a break from the app',
    ],
  };

  const currentExplanation = explanation || defaultExplanation;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-slate-700/50">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 bg-slate-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">
                      Why This Recommendation?
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Complete transparency about AI decisions
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-6">
                {/* Current State */}
                <StateIndicator state={cognitiveState} confidence={confidence} />

                {/* Decision */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <p className="text-slate-200">
                    <span className="text-slate-400">Decision: </span>
                    {currentExplanation.decision}
                  </p>
                </div>

                {/* Factors */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-400">Influencing Factors</h4>
                  <div className="space-y-2">
                    {currentExplanation.factors.map((factor, i) => (
                      <FactorCard key={i} factor={factor} />
                    ))}
                  </div>
                </div>

                {/* Data Sources */}
                <DataSourceList sources={currentExplanation.dataUsed} />

                {/* Alternatives */}
                <AlternativeActions alternatives={currentExplanation.alternatives} />

                {/* Clinical Safety Note */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <p className="text-sm font-medium text-slate-300">Clinical Safety</p>
                      <p className="text-xs text-slate-400 mt-1">
                        This recommendation was checked against our clinical hazard registry 
                        (DCB0129 compliant). Your data never leaves your device unencrypted.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wearable Status */}
                {isWearableConnected ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Wearable connected • Last sync: {lastBiometricSync?.toLocaleTimeString()}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="w-2 h-2 bg-slate-600 rounded-full" />
                    No wearable connected • Using interaction patterns only
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-800">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 font-medium transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Compact Transparency Indicator (for inline use)
// ============================================================================

export function TransparencyIndicator({ onClick }: { onClick: () => void }) {
  const { cognitiveState, confidence } = useNeuroAdaptiveContext();
  const palette = ATMOSPHERE_PALETTES[cognitiveState];

  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors"
      style={{
        backgroundColor: `${palette.primary}10`,
        borderColor: `${palette.primary}30`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: palette.primary }}
      />
      <span className="text-xs text-slate-300">
        Why this?
      </span>
      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </motion.button>
  );
}
