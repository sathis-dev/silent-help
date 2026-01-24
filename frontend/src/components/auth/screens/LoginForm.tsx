'use client';

/**
 * Silent Help - Login Form
 * "Welcome Back" - Elegant login experience
 * 
 * Features:
 * - Floating label inputs
 * - Remember me functionality
 * - Forgot password flow
 * - Social login options
 * - Beautiful animations
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthProvider';
import { AUTH_COLORS, LoginFormData, DEFAULT_LOGIN_FORM } from '@/lib/types/auth';
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

// ============================================================================
// Component
// ============================================================================

export function LoginForm() {
  const { login, isLoading, errors, setMode, clearErrors } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>(() => {
    // Initialize with remembered email if available
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('silent_help_remember_email');
      if (rememberedEmail) {
        return { ...DEFAULT_LOGIN_FORM, email: rememberedEmail, rememberMe: true };
      }
    }
    return DEFAULT_LOGIN_FORM;
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Clear errors when form changes
  useEffect(() => {
    if (errors.length > 0) {
      clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleChange = useCallback((field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  }, [login, formData]);

  const handleForgotPassword = useCallback(async () => {
    // Simulate sending reset email
    await new Promise(resolve => setTimeout(resolve, 1500));
    setForgotSent(true);
  }, []);

  const getFieldError = (field: string) => {
    return errors.find(e => e.field === field)?.message;
  };

  return (
    <motion.div
      className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg mx-auto px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatePresence mode="wait">
        {!showForgotPassword ? (
          <motion.div key="login-form">
            {/* Header */}
            <motion.div className="text-center mb-6 sm:mb-8" variants={itemVariants}>
              {/* Welcome icon */}
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
                <svg 
                  className="w-6 h-6 sm:w-8 sm:h-8" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke={AUTH_COLORS.lavender.primary}
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </motion.div>

              <h2
                className="text-xl sm:text-2xl font-light tracking-wide mb-1.5 sm:mb-2"
                style={{
                  background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
                We&apos;ve missed you. Let&apos;s continue your journey.
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Input */}
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

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <PasswordInput
                  label="Password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={getFieldError('password')}
                  autoComplete="current-password"
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  }
                />
              </motion.div>

              {/* Remember Me & Forgot Password Row */}
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0"
                variants={itemVariants}
              >
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={(checked) => handleChange('rememberMe', checked)}
                  label="Remember me"
                />
                <LinkButton onClick={() => setShowForgotPassword(true)}>
                  Forgot password?
                </LinkButton>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <PrimaryButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={!formData.email || !formData.password}
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                >
                  Sign In
                </PrimaryButton>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants}>
              <Divider text="or continue with" />
            </motion.div>

            {/* Social Login */}
            <motion.div className="space-y-2 sm:space-y-3" variants={itemVariants}>
              <SocialButton provider="google" onClick={() => {}} />
              <SocialButton provider="apple" onClick={() => {}} />
            </motion.div>

            {/* Sign Up Link */}
            <motion.div 
              className="text-center mt-6 sm:mt-8"
              variants={itemVariants}
            >
              <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
                New to Silent Help?{' '}
                <LinkButton onClick={() => setMode('signup')}>
                  Create an account
                </LinkButton>
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* Forgot Password Flow */
          <motion.div
            key="forgot-password"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="text-center mb-6 sm:mb-8" variants={itemVariants}>
              <motion.div
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}20, ${AUTH_COLORS.mint.primary}20)`,
                  border: `1px solid ${AUTH_COLORS.lavender.border}`,
                }}
              >
                {forgotSent ? (
                  <motion.svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={AUTH_COLORS.success.primary}
                    strokeWidth={2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                ) : (
                  <svg 
                    className="w-6 h-6 sm:w-8 sm:h-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke={AUTH_COLORS.lavender.primary}
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                )}
              </motion.div>

              <h2
                className="text-xl sm:text-2xl font-light tracking-wide mb-1.5 sm:mb-2"
                style={{
                  background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {forgotSent ? 'Check Your Email' : 'Reset Password'}
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
                {forgotSent 
                  ? 'We sent a password reset link to your email'
                  : 'Enter your email and we\'ll send you a reset link'
                }
              </p>
            </motion.div>

            {!forgotSent ? (
              <div className="space-y-4 sm:space-y-5">
                <motion.div variants={itemVariants}>
                  <FloatingInput
                    label="Email address"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    }
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <PrimaryButton
                    onClick={handleForgotPassword}
                    isLoading={isLoading}
                    disabled={!forgotEmail}
                  >
                    Send Reset Link
                  </PrimaryButton>
                </motion.div>
              </div>
            ) : (
              <motion.div variants={itemVariants}>
                <PrimaryButton
                  variant="secondary"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSent(false);
                    setForgotEmail('');
                  }}
                >
                  Back to Sign In
                </PrimaryButton>
              </motion.div>
            )}

            {!forgotSent && (
              <motion.div 
                className="text-center mt-5 sm:mt-6"
                variants={itemVariants}
              >
                <LinkButton onClick={() => setShowForgotPassword(false)}>
                  ← Back to Sign In
                </LinkButton>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LoginForm;
