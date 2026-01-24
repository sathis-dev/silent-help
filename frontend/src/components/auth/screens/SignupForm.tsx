'use client';

/**
 * Silent Help - Signup Form
 * "Begin Your Journey" - Elegant account creation
 * 
 * Features:
 * - Multi-step signup flow
 * - Password strength indicator
 * - Beautiful floating animations
 * - Form validation with gentle feedback
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthProvider';
import { 
  AUTH_COLORS, 
  SignupFormData, 
  DEFAULT_SIGNUP_FORM,
  PASSWORD_STRENGTH_CONFIG,
  PasswordStrength,
} from '@/lib/types/auth';
import { 
  FloatingInput, 
  PasswordInput, 
  Checkbox, 
  PrimaryButton, 
  SocialButton, 
  Divider,
  LinkButton,
} from '../ui/AuthInputs';

// ============================================================================
// Password Strength Calculator
// ============================================================================

function calculatePasswordStrength(password: string): {
  strength: PasswordStrength;
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return { strength: 'weak', score: 0, label: '', color: '' };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lengthBonus: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
  };

  if (checks.length) score += 20;
  if (checks.lengthBonus) score += 10;
  if (checks.lowercase) score += 15;
  if (checks.uppercase) score += 15;
  if (checks.numbers) score += 20;
  if (checks.symbols) score += 20;

  let strength: PasswordStrength = 'weak';
  if (score >= 90) strength = 'excellent';
  else if (score >= 70) strength = 'strong';
  else if (score >= 50) strength = 'good';
  else if (score >= 30) strength = 'fair';

  const config = PASSWORD_STRENGTH_CONFIG[strength];
  return { 
    strength, 
    score, 
    label: config.label, 
    color: config.color,
  };
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

// ============================================================================
// Component
// ============================================================================

type SignupStep = 'credentials' | 'profile' | 'terms';

export function SignupForm() {
  const { signup, isLoading, errors, setMode, clearErrors } = useAuth();
  
  const [formData, setFormData] = useState<SignupFormData>(DEFAULT_SIGNUP_FORM);
  const [currentStep, setCurrentStep] = useState<SignupStep>('credentials');
  const [direction, setDirection] = useState(1);

  // Clear errors when form changes
  useEffect(() => {
    if (errors.length > 0) {
      clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleChange = useCallback((field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const handleNextStep = useCallback(() => {
    setDirection(1);
    if (currentStep === 'credentials') {
      setCurrentStep('profile');
    } else if (currentStep === 'profile') {
      setCurrentStep('terms');
    }
  }, [currentStep]);

  const handlePrevStep = useCallback(() => {
    setDirection(-1);
    if (currentStep === 'profile') {
      setCurrentStep('credentials');
    } else if (currentStep === 'terms') {
      setCurrentStep('profile');
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(formData);
  }, [signup, formData]);

  const getFieldError = (field: string) => {
    return errors.find(e => e.field === field)?.message;
  };

  const canProceedToProfile = formData.email && 
    formData.password && 
    formData.confirmPassword && 
    formData.password === formData.confirmPassword &&
    passwordStrength.score >= 30;

  const canProceedToTerms = canProceedToProfile && formData.displayName;

  const canSubmit = canProceedToTerms && formData.agreeToTerms && formData.agreeToPrivacy;

  const stepNumber = currentStep === 'credentials' ? 1 : currentStep === 'profile' ? 2 : 3;

  return (
    <motion.div
      className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg mx-auto px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <motion.div className="text-center mb-6 sm:mb-8" variants={itemVariants}>
        {/* Icon */}
        <motion.div
          className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}20, ${AUTH_COLORS.mint.primary}20)`,
            border: `1px solid ${AUTH_COLORS.lavender.border}`,
          }}
          animate={{
            boxShadow: [
              `0 0 20px ${AUTH_COLORS.lavender.glow}`,
              `0 0 30px ${AUTH_COLORS.mint.glow}`,
              `0 0 20px ${AUTH_COLORS.lavender.glow}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.svg 
            className="w-6 h-6 sm:w-8 sm:h-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={AUTH_COLORS.lavender.primary}
            strokeWidth={1.5}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </motion.svg>
        </motion.div>

        <h2
          className="text-xl sm:text-2xl font-light tracking-wide mb-1.5 sm:mb-2"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Create Your Sanctuary
        </h2>
        <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
          A safe space just for you
        </p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div 
        className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8"
        variants={itemVariants}
      >
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <motion.div
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all"
              style={{
                background: step <= stepNumber 
                  ? `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}, ${AUTH_COLORS.mint.primary})`
                  : AUTH_COLORS.void.card,
                color: step <= stepNumber ? AUTH_COLORS.void.deep : AUTH_COLORS.text.muted,
                border: step === stepNumber 
                  ? `2px solid ${AUTH_COLORS.lavender.primary}`
                  : `1px solid rgba(148, 163, 184, 0.2)`,
              }}
              animate={{
                scale: step === stepNumber ? 1.1 : 1,
                boxShadow: step === stepNumber 
                  ? `0 0 20px ${AUTH_COLORS.lavender.glow}`
                  : 'none',
              }}
            >
              {step < stepNumber ? (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step}
            </motion.div>
            {step < 3 && (
              <motion.div
                className="w-6 sm:w-8 h-0.5 rounded-full"
                style={{
                  background: step < stepNumber 
                    ? `linear-gradient(90deg, ${AUTH_COLORS.lavender.primary}, ${AUTH_COLORS.mint.primary})`
                    : 'rgba(148, 163, 184, 0.2)',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Credentials */}
          {currentStep === 'credentials' && (
            <motion.div
              key="credentials"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-4 sm:space-y-5"
            >
              <motion.div variants={itemVariants}>
                <FloatingInput
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={getFieldError('email')}
                  autoComplete="email"
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  }
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PasswordInput
                  label="Create password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={getFieldError('password')}
                  autoComplete="new-password"
                  showStrength
                  strength={passwordStrength}
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  }
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PasswordInput
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  error={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : getFieldError('confirmPassword')
                  }
                  autoComplete="new-password"
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PrimaryButton
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canProceedToProfile}
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                >
                  Continue
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Profile */}
          {currentStep === 'profile' && (
            <motion.div
              key="profile"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-4 sm:space-y-5"
            >
              <motion.p 
                className="text-center text-xs sm:text-sm mb-3 sm:mb-4"
                style={{ color: AUTH_COLORS.text.secondary }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                What should we call you?
              </motion.p>

              <motion.div variants={itemVariants}>
                <FloatingInput
                  label="Display name"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="A name, nickname, or nothing at all"
                  autoComplete="name"
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  }
                />
              </motion.div>

              <motion.p 
                className="text-[10px] sm:text-xs text-center"
                style={{ color: AUTH_COLORS.text.muted }}
                variants={itemVariants}
              >
                You can always change this later
              </motion.p>

              <motion.div 
                className="flex gap-2 sm:gap-3 pt-3 sm:pt-4"
                variants={itemVariants}
              >
                <PrimaryButton
                  type="button"
                  variant="secondary"
                  onClick={handlePrevStep}
                >
                  Back
                </PrimaryButton>
                <PrimaryButton
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.displayName}
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                >
                  Continue
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Terms */}
          {currentStep === 'terms' && (
            <motion.div
              key="terms"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-4 sm:space-y-5"
            >
              <motion.div
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl"
                style={{
                  background: AUTH_COLORS.void.card,
                  border: `1px solid rgba(148, 163, 184, 0.15)`,
                }}
                variants={itemVariants}
              >
                <div className="space-y-3 sm:space-y-4">
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(checked) => handleChange('agreeToTerms', checked)}
                    error={getFieldError('agreeToTerms')}
                    label={
                      <span>
                        I agree to the{' '}
                        <button 
                          type="button"
                          className="underline hover:no-underline"
                          style={{ color: AUTH_COLORS.lavender.primary }}
                        >
                          Terms of Service
                        </button>
                      </span>
                    }
                  />

                  <Checkbox
                    checked={formData.agreeToPrivacy}
                    onChange={(checked) => handleChange('agreeToPrivacy', checked)}
                    error={getFieldError('agreeToPrivacy')}
                    label={
                      <span>
                        I agree to the{' '}
                        <button 
                          type="button"
                          className="underline hover:no-underline"
                          style={{ color: AUTH_COLORS.lavender.primary }}
                        >
                          Privacy Policy
                        </button>
                      </span>
                    }
                  />
                </div>
              </motion.div>

              {/* Privacy assurance */}
              <motion.div
                className="flex items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg sm:rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.glow}10, ${AUTH_COLORS.mint.glow}10)`,
                  border: `1px solid ${AUTH_COLORS.lavender.border}40`,
                }}
                variants={itemVariants}
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke={AUTH_COLORS.lavender.primary}
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
                  Your data stays private and encrypted
                </span>
              </motion.div>

              <motion.div 
                className="flex gap-2 sm:gap-3 pt-1 sm:pt-2"
                variants={itemVariants}
              >
                <PrimaryButton
                  type="button"
                  variant="secondary"
                  onClick={handlePrevStep}
                >
                  Back
                </PrimaryButton>
                <PrimaryButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={!canSubmit}
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  }
                >
                  Create Sanctuary
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Divider & Social */}
      {currentStep === 'credentials' && (
        <>
          <motion.div variants={itemVariants}>
            <Divider text="or continue with" />
          </motion.div>

          <motion.div className="space-y-2 sm:space-y-3" variants={itemVariants}>
            <SocialButton provider="google" onClick={() => {}} />
            <SocialButton provider="apple" onClick={() => {}} />
          </motion.div>
        </>
      )}

      {/* Login Link */}
      <motion.div 
        className="text-center mt-6 sm:mt-8"
        variants={itemVariants}
      >
        <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
          Already have an account?{' '}
          <LinkButton onClick={() => setMode('login')}>
            Sign in
          </LinkButton>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default SignupForm;
