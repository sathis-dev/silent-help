'use client';

/**
 * Silent Help - Account Step
 * "Save Your Sanctuary" - Login/Signup/Guest Option
 * 
 * This step integrates with the onboarding flow to offer users
 * the option to create an account, login, or continue as guest.
 * Uses the same beautiful UI from the auth system.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../OnboardingProvider';
import { 
  FloatingInput, 
  PasswordInput, 
  Checkbox,
  PrimaryButton, 
  SocialButton, 
  Divider,
  LinkButton,
} from '@/components/auth/ui/AuthInputs';
import { AUTH_COLORS } from '@/lib/types/auth';

// ============================================================================
// Types
// ============================================================================

type AccountMode = 'choice' | 'signup' | 'login' | 'guest';

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
};

const modeVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ============================================================================
// Password Strength Calculator
// ============================================================================

function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  if (score >= 90) return { score, label: 'Excellent', color: '#10B981' };
  if (score >= 70) return { score, label: 'Strong', color: '#7FDBCA' };
  if (score >= 50) return { score, label: 'Good', color: '#F59E0B' };
  if (score >= 30) return { score, label: 'Fair', color: '#FB923C' };
  return { score, label: 'Weak', color: '#EF4444' };
}

// ============================================================================
// Component
// ============================================================================

export function AccountStep() {
  const { nextStep, session, updateUserName } = useOnboarding();
  const [mode, setMode] = useState<AccountMode>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const interactionStartRef = useRef<number>(0);

  // Get the name from the previous personalization step
  const userName = session.userName || session.userPreferences.displayName || '';

  useEffect(() => {
    interactionStartRef.current = Date.now();
  }, []);

  // Form states
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const passwordStrength = calculatePasswordStrength(signupData.password);

  // Handle guest continue
  const handleGuestContinue = useCallback(async () => {
    setIsLoading(true);
    
    // Store guest session
    const guestUser = {
      id: `guest_${Date.now()}`,
      displayName: userName || 'Friend',
      isGuest: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    localStorage.setItem('silent_help_guest_user', JSON.stringify(guestUser));
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    nextStep();
  }, [nextStep, userName]);

  // Handle signup
  const handleSignup = useCallback(async () => {
    if (signupData.password !== signupData.confirmPassword) return;
    if (!signupData.agreeToTerms) return;
    
    setIsLoading(true);
    
    // Simulate signup (replace with real auth later)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const authUser = {
      id: `user_${Date.now()}`,
      email: signupData.email,
      displayName: userName || signupData.email.split('@')[0],
      isGuest: false,
      createdAt: new Date(),
    };
    localStorage.setItem('silent_help_auth_user', JSON.stringify(authUser));
    
    setIsLoading(false);
    nextStep();
  }, [signupData, userName, nextStep]);

  // Handle login
  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate login (replace with real auth later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const authUser = {
      id: `user_${Date.now()}`,
      email: loginData.email,
      displayName: userName || loginData.email.split('@')[0],
      isGuest: false,
      createdAt: new Date(),
    };
    localStorage.setItem('silent_help_auth_user', JSON.stringify(authUser));
    
    if (loginData.rememberMe) {
      localStorage.setItem('silent_help_remember_email', loginData.email);
    }
    
    setIsLoading(false);
    nextStep();
  }, [loginData, userName, nextStep]);

  const canSignup = signupData.email && 
    signupData.password && 
    signupData.password === signupData.confirmPassword &&
    passwordStrength.score >= 30 &&
    signupData.agreeToTerms;

  const canLogin = loginData.email && loginData.password;

  // ============================================================================
  // Render Choice Screen
  // ============================================================================

  const renderChoice = () => (
    <motion.div
      key="choice"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-5"
    >
      {/* Header */}
      <motion.div className="text-center mb-6 sm:mb-8" variants={itemVariants}>
        <motion.div
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}20, ${AUTH_COLORS.mint.primary}20)`,
            border: `1px solid ${AUTH_COLORS.lavender.border}`,
          }}
          animate={{
            boxShadow: [
              `0 0 25px ${AUTH_COLORS.lavender.glow}`,
              `0 0 40px ${AUTH_COLORS.mint.glow}`,
              `0 0 25px ${AUTH_COLORS.lavender.glow}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <svg 
            className="w-8 h-8 sm:w-10 sm:h-10" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={AUTH_COLORS.lavender.primary}
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </motion.div>

        <h2
          className="text-xl sm:text-2xl font-light tracking-wide mb-2"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Save Your Sanctuary
        </h2>
        <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
          {userName ? `${userName}, would you like to save your progress?` : 'Would you like to save your progress?'}
        </p>
      </motion.div>

      {/* Create Account */}
      <motion.div variants={itemVariants}>
        <PrimaryButton
          variant="primary"
          size="lg"
          onClick={() => setMode('signup')}
          icon={
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        >
          Create Account
        </PrimaryButton>
      </motion.div>

      {/* Login */}
      <motion.div variants={itemVariants}>
        <PrimaryButton
          variant="secondary"
          size="lg"
          onClick={() => setMode('login')}
          icon={
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          }
        >
          I Have an Account
        </PrimaryButton>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants}>
        <Divider text="or" />
      </motion.div>

      {/* Continue as Guest */}
      <motion.div variants={itemVariants}>
        <motion.button
          className="w-full group"
          onClick={handleGuestContinue}
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div
            className="relative py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px dashed rgba(148, 163, 184, 0.3)',
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.glow}10, ${AUTH_COLORS.mint.glow}10)`,
              }}
            />

            <div className="relative flex items-center justify-center gap-2 sm:gap-3">
              {isLoading ? (
                <motion.div
                  className="w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-full"
                  style={{ borderColor: AUTH_COLORS.text.secondary, borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke={AUTH_COLORS.text.secondary}
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-sm sm:text-base" style={{ color: AUTH_COLORS.text.secondary }}>
                    Continue Without Account
                  </span>
                  <svg 
                    className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke={AUTH_COLORS.text.muted}
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </div>

            <p className="text-[10px] sm:text-xs text-center mt-1.5 sm:mt-2" style={{ color: AUTH_COLORS.text.muted }}>
              24-hour session • Create account anytime
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Privacy note */}
      <motion.div 
        className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6"
        variants={itemVariants}
      >
        <span className="text-sm">🔒</span>
        <span className="text-[10px] sm:text-xs" style={{ color: AUTH_COLORS.text.muted }}>
          Your data stays private and encrypted
        </span>
      </motion.div>
    </motion.div>
  );

  // ============================================================================
  // Render Signup Form
  // ============================================================================

  const renderSignup = () => (
    <motion.div
      key="signup"
      variants={modeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4 sm:space-y-5"
    >
      <motion.div className="text-center mb-4 sm:mb-6" variants={itemVariants}>
        <h2
          className="text-lg sm:text-xl font-light tracking-wide mb-1.5"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Create Your Account
        </h2>
        <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
          Keep your sanctuary forever
        </p>
      </motion.div>

      <FloatingInput
        label="Email address"
        type="email"
        value={signupData.email}
        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
        icon={
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        }
      />

      <PasswordInput
        label="Password"
        value={signupData.password}
        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
        showStrength
        strength={passwordStrength}
        icon={
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        }
      />

      <PasswordInput
        label="Confirm password"
        value={signupData.confirmPassword}
        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        error={
          signupData.confirmPassword && signupData.password !== signupData.confirmPassword
            ? 'Passwords do not match'
            : undefined
        }
        icon={
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <Checkbox
        checked={signupData.agreeToTerms}
        onChange={(checked) => setSignupData(prev => ({ ...prev, agreeToTerms: checked }))}
        label={
          <span className="text-xs sm:text-sm">
            I agree to the{' '}
            <button className="underline" style={{ color: AUTH_COLORS.lavender.primary }}>Terms</button>
            {' '}and{' '}
            <button className="underline" style={{ color: AUTH_COLORS.lavender.primary }}>Privacy Policy</button>
          </span>
        }
      />

      <div className="flex gap-2 sm:gap-3 pt-2">
        <PrimaryButton variant="ghost" onClick={() => setMode('choice')}>
          Back
        </PrimaryButton>
        <PrimaryButton
          onClick={handleSignup}
          isLoading={isLoading}
          disabled={!canSignup}
        >
          Create Account
        </PrimaryButton>
      </div>

      <Divider text="or" />

      <div className="space-y-2 sm:space-y-3">
        <SocialButton provider="google" onClick={() => {}} />
        <SocialButton provider="apple" onClick={() => {}} />
      </div>
    </motion.div>
  );

  // ============================================================================
  // Render Login Form
  // ============================================================================

  const renderLogin = () => (
    <motion.div
      key="login"
      variants={modeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4 sm:space-y-5"
    >
      <motion.div className="text-center mb-4 sm:mb-6" variants={itemVariants}>
        <h2
          className="text-lg sm:text-xl font-light tracking-wide mb-1.5"
          style={{
            background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.soft} 0%, ${AUTH_COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm" style={{ color: AUTH_COLORS.text.secondary }}>
          Your sanctuary awaits
        </p>
      </motion.div>

      <FloatingInput
        label="Email address"
        type="email"
        value={loginData.email}
        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
        icon={
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        }
      />

      <PasswordInput
        label="Password"
        value={loginData.password}
        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
        icon={
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <Checkbox
          checked={loginData.rememberMe}
          onChange={(checked) => setLoginData(prev => ({ ...prev, rememberMe: checked }))}
          label="Remember me"
        />
        <LinkButton onClick={() => {}}>Forgot password?</LinkButton>
      </div>

      <div className="flex gap-2 sm:gap-3 pt-2">
        <PrimaryButton variant="ghost" onClick={() => setMode('choice')}>
          Back
        </PrimaryButton>
        <PrimaryButton
          onClick={handleLogin}
          isLoading={isLoading}
          disabled={!canLogin}
        >
          Sign In
        </PrimaryButton>
      </div>

      <Divider text="or" />

      <div className="space-y-2 sm:space-y-3">
        <SocialButton provider="google" onClick={() => {}} />
        <SocialButton provider="apple" onClick={() => {}} />
      </div>
    </motion.div>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg mx-auto px-2 sm:px-4">
      <AnimatePresence mode="wait">
        {mode === 'choice' && renderChoice()}
        {mode === 'signup' && renderSignup()}
        {mode === 'login' && renderLogin()}
      </AnimatePresence>
    </div>
  );
}

export default AccountStep;
