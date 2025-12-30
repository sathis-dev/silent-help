'use client';

/**
 * Silent Help - Contextual Step
 * "What helps you?" - Deep-dive based on emotional state
 * 
 * This step adapts based on the user's previous emotional selection:
 * - Overwhelmed → Crisis support options
 * - Anxious → Tool preferences
 * - Just okay/Curious → Goals
 * - Caregiver → Support context
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding, useCurrentOnboardingStep, useStepResponse } from '../OnboardingProvider';
import type { OnboardingOption } from '@/lib/types/onboarding';

// ============================================================================
// Colors
// ============================================================================

const COLORS = {
  lavender: {
    soft: '#D8D0E8',
  },
  mint: {
    soft: '#B8F0E4',
  },
};

// ============================================================================
// Component
// ============================================================================

export function ContextualStep() {
  const { nextStep, submitResponse } = useOnboarding();
  const currentStep = useCurrentOnboardingStep();
  const emotionalResponse = useStepResponse('emotional_entry');
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hesitationCount, setHesitationCount] = useState(0);
  const interactionStartRef = useRef<number>(0);
  
  // Capture interaction start time on mount
  useEffect(() => {
    interactionStartRef.current = Date.now();
  }, []);

  const isMultiSelect = currentStep?.inputType === 'multi_select';

  // Handle option selection
  const handleSelect = useCallback((option: OnboardingOption) => {
    if (isMultiSelect) {
      setSelectedOptions(prev => {
        const newSelection = prev.includes(option.id)
          ? prev.filter(id => id !== option.id)
          : [...prev, option.id];
        return newSelection;
      });
    } else {
      setSelectedOptions([option.id]);
      
      // Submit and advance for single select
      submitResponse({
        stepId: currentStep!.id,
        value: option.id,
        interactionTime: Date.now() - interactionStartRef.current,
        hesitationCount,
        confidence: hesitationCount < 2 ? 0.85 : 0.6,
      });

      setTimeout(() => {
        nextStep();
      }, 500);
    }
  }, [isMultiSelect, submitResponse, nextStep, currentStep, hesitationCount]);

  // Handle continue for multi-select
  const handleContinue = useCallback(() => {
    if (selectedOptions.length === 0) return;

    submitResponse({
      stepId: currentStep!.id,
      value: selectedOptions,
      interactionTime: Date.now() - interactionStartRef.current,
      hesitationCount,
      confidence: selectedOptions.length > 0 ? 0.8 : 0.5,
    });

    nextStep();
  }, [selectedOptions, submitResponse, nextStep, currentStep, hesitationCount]);

  if (!currentStep?.options) return null;

  return (
    <div className="space-y-8">
      {/* Title */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 
          className="text-2xl font-light tracking-wide"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.lavender.soft} 0%, ${COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {currentStep.title}
        </h2>
        {currentStep.subtitle && (
          <p className="text-slate-400 text-sm">{currentStep.subtitle}</p>
        )}
      </motion.div>

      {/* Options */}
      <motion.div
        className="space-y-3 max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep.options.map((option, index) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <motion.button
              key={option.id}
              className="w-full p-4 rounded-2xl text-left transition-all"
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${option.color}20 0%, ${option.color}10 100%)`
                  : 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${isSelected ? option.color : 'rgba(148, 163, 184, 0.2)'}`,
                boxShadow: isSelected ? `0 0 30px ${option.color}20` : 'none',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
              whileHover={{ 
                scale: 1.01,
                borderColor: option.color,
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(option)}
              onHoverStart={() => setHesitationCount(prev => prev + 1)}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <motion.span 
                  className="text-2xl"
                  animate={{ 
                    scale: isSelected ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {option.icon}
                </motion.span>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="font-medium text-white">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-slate-400 mt-0.5">{option.description}</div>
                  )}
                </div>
                
                {/* Selection indicator */}
                {isMultiSelect && (
                  <motion.div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: isSelected ? option.color : 'rgba(148, 163, 184, 0.3)',
                      backgroundColor: isSelected ? option.color : 'transparent',
                    }}
                    animate={{ scale: isSelected ? [1, 1.1, 1] : 1 }}
                  >
                    {isSelected && (
                      <motion.svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.div>
                )}
                
                {/* Arrow for single select */}
                {!isMultiSelect && (
                  <svg 
                    className="w-5 h-5 text-slate-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Continue button for multi-select */}
      {isMultiSelect && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: selectedOptions.length > 0 ? 1 : 0.5, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="px-8 py-3 rounded-full text-white font-medium"
            style={{
              background: selectedOptions.length > 0 
                ? `linear-gradient(135deg, ${COLORS.lavender.soft}30 0%, ${COLORS.mint.soft}30 100%)`
                : 'rgba(15, 23, 42, 0.5)',
              border: `1px solid ${selectedOptions.length > 0 ? COLORS.lavender.soft : 'rgba(148, 163, 184, 0.2)'}50`,
            }}
            whileHover={{ scale: selectedOptions.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedOptions.length > 0 ? 0.98 : 1 }}
            onClick={handleContinue}
            disabled={selectedOptions.length === 0}
          >
            <span className="flex items-center gap-2">
              Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Helper text */}
      <motion.p
        className="text-center text-slate-500 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {isMultiSelect 
          ? 'Select all that apply' 
          : 'Your choice helps personalize your experience'
        }
      </motion.p>
    </div>
  );
}

export default ContextualStep;
