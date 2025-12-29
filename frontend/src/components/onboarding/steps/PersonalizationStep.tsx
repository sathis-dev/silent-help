'use client';

/**
 * Silent Help - Personalization Step
 * "How should I greet you?" - Name and preferences
 * 
 * Features:
 * - Soft text input with gentle animations
 * - Time wheel for wind-down preference
 * - Voice input option (future)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding, useCurrentOnboardingStep } from '../OnboardingProvider';

// ============================================================================
// Colors
// ============================================================================

const COLORS = {
  lavender: {
    primary: '#B4A7D6',
    soft: '#D8D0E8',
  },
  mint: {
    primary: '#7FDBCA',
    soft: '#B8F0E4',
  },
};

// ============================================================================
// Time Options
// ============================================================================

const TIME_OPTIONS = [
  { value: '20:00', label: 'Early Evening', icon: '🌅', description: '8pm onwards' },
  { value: '21:00', label: 'Evening', icon: '🌆', description: '9pm onwards' },
  { value: '22:00', label: 'Late Evening', icon: '🌙', description: '10pm onwards' },
  { value: '23:00', label: 'Night', icon: '🌌', description: '11pm onwards' },
  { value: 'varies', label: 'It varies', icon: '🔄', description: 'No fixed time' },
];

// ============================================================================
// Component
// ============================================================================

export function PersonalizationStep() {
  const { nextStep, submitResponse, updateUserName, updatePreferences } = useOnboarding();
  const currentStep = useCurrentOnboardingStep();
  
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [interactionStart] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const isNameStep = currentStep?.id === 'personalization_name';
  const isTimeStep = currentStep?.id === 'personalization_time';

  // Auto-focus input for name step
  useEffect(() => {
    if (isNameStep && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [isNameStep]);

  // Handle name submission
  const handleNameSubmit = useCallback(() => {
    const displayName = value.trim() || 'friend';
    
    updateUserName(displayName);
    
    submitResponse({
      stepId: 'personalization_name',
      value: displayName,
      interactionTime: Date.now() - interactionStart,
      hesitationCount: 0,
      confidence: value.trim() ? 0.9 : 0.7,
    });

    nextStep();
  }, [value, updateUserName, submitResponse, nextStep, interactionStart]);

  // Handle time selection
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    
    updatePreferences({ windDownTime: time });
    
    submitResponse({
      stepId: 'personalization_time',
      value: time,
      interactionTime: Date.now() - interactionStart,
      hesitationCount: 0,
      confidence: 0.85,
    });

    setTimeout(() => {
      nextStep();
    }, 500);
  }, [updatePreferences, submitResponse, nextStep, interactionStart]);

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  return (
    <div className="space-y-10">
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
          {currentStep?.title}
        </h2>
        {currentStep?.subtitle && (
          <p className="text-slate-400 text-sm">{currentStep.subtitle}</p>
        )}
      </motion.div>

      {/* Name Input */}
      {isNameStep && (
        <motion.div
          className="max-w-sm mx-auto space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Input container */}
          <motion.div
            className="relative"
            animate={{
              boxShadow: isFocused 
                ? `0 0 40px ${COLORS.lavender.primary}20`
                : '0 0 0 transparent',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your name..."
              className="w-full px-6 py-4 text-center text-xl font-light bg-transparent rounded-2xl outline-none transition-all"
              style={{
                color: COLORS.lavender.soft,
                border: `1px solid ${isFocused ? COLORS.lavender.primary : 'rgba(148, 163, 184, 0.2)'}`,
                background: 'rgba(15, 23, 42, 0.6)',
              }}
              autoComplete="off"
              autoCorrect="off"
              maxLength={30}
            />
            
            {/* Placeholder animation */}
            {!value && !isFocused && (
              <motion.span
                className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500"
                animate={{ opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Skip option */}
          <div className="text-center">
            <motion.button
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              onClick={handleNameSubmit}
              whileHover={{ opacity: 1 }}
            >
              {value.trim() ? 'Continue' : 'Skip for now'}
            </motion.button>
          </div>

          {/* Continue button */}
          <motion.button
            className="w-full py-4 rounded-2xl font-medium text-white transition-all"
            style={{
              background: value.trim() 
                ? `linear-gradient(135deg, ${COLORS.lavender.primary}40 0%, ${COLORS.mint.primary}40 100%)`
                : 'rgba(15, 23, 42, 0.4)',
              border: `1px solid ${value.trim() ? COLORS.lavender.primary : 'rgba(148, 163, 184, 0.2)'}40`,
            }}
            animate={{
              opacity: value.trim() ? 1 : 0.6,
            }}
            whileHover={{ scale: value.trim() ? 1.01 : 1 }}
            whileTap={{ scale: value.trim() ? 0.99 : 1 }}
            onClick={handleNameSubmit}
          >
            <span className="flex items-center justify-center gap-2">
              {value.trim() ? `Continue as ${value.trim()}` : 'Continue as friend'}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Time Selection */}
      {isTimeStep && (
        <motion.div
          className="max-w-sm mx-auto space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {TIME_OPTIONS.map((option, index) => {
            const isSelected = selectedTime === option.value;
            
            return (
              <motion.button
                key={option.value}
                className="w-full p-4 rounded-2xl text-left transition-all"
                style={{
                  background: isSelected 
                    ? `linear-gradient(135deg, ${COLORS.lavender.primary}20 0%, ${COLORS.mint.primary}15 100%)`
                    : 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${isSelected ? COLORS.lavender.primary : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: isSelected ? `0 0 30px ${COLORS.lavender.primary}15` : 'none',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                whileHover={{ 
                  scale: 1.01,
                  borderColor: COLORS.lavender.primary,
                }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleTimeSelect(option.value)}
              >
                <div className="flex items-center gap-4">
                  <motion.span 
                    className="text-2xl"
                    animate={{ 
                      scale: isSelected ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {option.icon}
                  </motion.span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-slate-400">{option.description}</div>
                  </div>
                  <svg 
                    className="w-5 h-5 text-slate-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </motion.button>
            );
          })}

          {/* Skip option */}
          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              onClick={() => handleTimeSelect('varies')}
            >
              Skip this step
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default PersonalizationStep;
