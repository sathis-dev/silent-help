'use client';

/**
 * Silent Help - Auth UI Components
 * "Elegant Sanctuary Inputs" - Beautiful form components
 */

import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTH_COLORS } from '@/lib/types/auth';

// ============================================================================
// Floating Label Input
// ============================================================================

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(({
  label,
  error,
  icon,
  rightIcon,
  onRightIconClick,
  className = '',
  value,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused
            ? `0 0 30px ${error ? AUTH_COLORS.error.glow : AUTH_COLORS.lavender.glow}`
            : '0 0 0 transparent',
        }}
        style={{ borderRadius: '16px' }}
      >
        {/* Icon */}
        {icon && (
          <div 
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 transition-colors"
            style={{ color: isFocused ? AUTH_COLORS.lavender.primary : AUTH_COLORS.text.muted }}
          >
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`
            w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-transparent rounded-xl sm:rounded-2xl outline-none transition-all
            ${icon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4'}
            ${rightIcon ? 'pr-10 sm:pr-12' : 'pr-3 sm:pr-4'}
            ${isActive ? 'pt-5 sm:pt-6 pb-1.5 sm:pb-2' : 'py-3 sm:py-4'}
            ${className}
          `}
          style={{
            color: AUTH_COLORS.text.primary,
            border: `1px solid ${error 
              ? AUTH_COLORS.error.primary 
              : isFocused 
                ? AUTH_COLORS.lavender.primary 
                : 'rgba(148, 163, 184, 0.2)'}`,
            background: AUTH_COLORS.void.card,
          }}
          {...props}
        />

        {/* Floating Label */}
        <motion.label
          className="absolute left-3 sm:left-4 pointer-events-none transition-all text-sm sm:text-base"
          style={{ 
            left: icon ? '40px' : '12px',
            color: error ? AUTH_COLORS.error.primary : AUTH_COLORS.text.muted,
          }}
          animate={{
            top: isActive ? '6px' : '50%',
            y: isActive ? '0%' : '-50%',
            fontSize: isActive ? '10px' : '14px',
            color: isActive 
              ? (error ? AUTH_COLORS.error.primary : AUTH_COLORS.lavender.primary)
              : AUTH_COLORS.text.muted,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {label}
        </motion.label>

        {/* Right Icon */}
        {rightIcon && (
          <button
            type="button"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 transition-colors hover:opacity-80"
            style={{ color: AUTH_COLORS.text.muted }}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </button>
        )}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] sm:text-xs mt-1.5 sm:mt-2 ml-3 sm:ml-4"
            style={{ color: AUTH_COLORS.error.primary }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';

// ============================================================================
// Password Input with Visibility Toggle
// ============================================================================

interface PasswordInputProps extends Omit<FloatingInputProps, 'type' | 'rightIcon' | 'onRightIconClick'> {
  showStrength?: boolean;
  strength?: {
    score: number;
    label: string;
    color: string;
  };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showStrength = false,
  strength,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <FloatingInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            {showPassword ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </>
            )}
          </svg>
        }
        onRightIconClick={() => setShowPassword(!showPassword)}
        {...props}
      />

      {/* Password Strength Indicator */}
      {showStrength && strength && props.value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-1"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: strength.color }}
                initial={{ width: 0 }}
                animate={{ width: `${strength.score}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// ============================================================================
// Checkbox
// ============================================================================

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: string;
}

export function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
  return (
    <div>
      <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
        <motion.div
          className="relative w-4 h-4 sm:w-5 sm:h-5 mt-0.5 rounded-md flex-shrink-0"
          style={{
            border: `1.5px solid ${error 
              ? AUTH_COLORS.error.primary 
              : checked 
                ? AUTH_COLORS.lavender.primary 
                : 'rgba(148, 163, 184, 0.3)'}`,
            background: checked 
              ? `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary}40, ${AUTH_COLORS.mint.primary}40)`
              : 'transparent',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(!checked)}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                className="absolute inset-0 w-full h-full p-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={AUTH_COLORS.lavender.soft}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
        <span 
          className="text-xs sm:text-sm transition-colors"
          style={{ color: AUTH_COLORS.text.secondary }}
        >
          {label}
        </span>
      </label>
      {error && (
        <p className="text-[10px] sm:text-xs mt-1 ml-6 sm:ml-8" style={{ color: AUTH_COLORS.error.primary }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Primary Button
// ============================================================================

interface PrimaryButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export function PrimaryButton({
  children,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  className = '',
  type = 'button',
  onClick,
}: PrimaryButtonProps) {
  const sizeClasses = {
    sm: 'py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm',
    md: 'py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base',
    lg: 'py-4 sm:py-5 px-6 sm:px-8 text-base sm:text-lg',
  };

  const getStyles = () => {
    if (variant === 'primary') {
      return {
        background: `linear-gradient(135deg, ${AUTH_COLORS.lavender.primary} 0%, ${AUTH_COLORS.mint.primary} 100%)`,
        color: AUTH_COLORS.void.deep,
        border: 'none',
      };
    }
    if (variant === 'secondary') {
      return {
        background: AUTH_COLORS.void.card,
        color: AUTH_COLORS.text.primary,
        border: `1px solid ${AUTH_COLORS.lavender.border}`,
      };
    }
    return {
      background: 'transparent',
      color: AUTH_COLORS.text.secondary,
      border: 'none',
    };
  };

  return (
    <motion.button
      type={type}
      className={`
        relative w-full rounded-xl sm:rounded-2xl font-medium sm:font-semibold overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
      style={getStyles()}
      whileHover={{ scale: disabled ? 1 : 1.01, opacity: disabled ? 0.5 : 0.95 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {/* Shimmer effect for primary */}
      {variant === 'primary' && !isLoading && (
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}

      <span className="relative flex items-center justify-center gap-1.5 sm:gap-2">
        {isLoading ? (
          <motion.div
            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </span>
    </motion.button>
  );
}

// ============================================================================
// Social Button
// ============================================================================

interface SocialButtonProps {
  provider: 'google' | 'apple' | 'github';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const socialIcons = {
  google: (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
      <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
      <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
      <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7## 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
    </svg>
  ),
  apple: (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  ),
  github: (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  ),
};

const socialLabels = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  github: 'Continue with GitHub',
};

export function SocialButton({ provider, isLoading, disabled, onClick }: SocialButtonProps) {
  return (
    <motion.button
      type="button"
      className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: AUTH_COLORS.void.card,
        color: AUTH_COLORS.text.primary,
        border: `1px solid rgba(148, 163, 184, 0.2)`,
      }}
      whileHover={{ 
        scale: disabled ? 1 : 1.01,
        borderColor: AUTH_COLORS.lavender.border,
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          {socialIcons[provider]}
          <span>{socialLabels[provider]}</span>
        </>
      )}
    </motion.button>
  );
}

// ============================================================================
// Divider
// ============================================================================

interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 my-4 sm:my-6">
      <div className="flex-1 h-px" style={{ background: 'rgba(148, 163, 184, 0.2)' }} />
      {text && (
        <span className="text-[10px] sm:text-xs font-medium" style={{ color: AUTH_COLORS.text.muted }}>
          {text}
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: 'rgba(148, 163, 184, 0.2)' }} />
    </div>
  );
}

// ============================================================================
// Link Button
// ============================================================================

interface LinkButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LinkButton({ children, className = '', onClick }: LinkButtonProps) {
  return (
    <motion.button
      type="button"
      className={`text-xs sm:text-sm font-medium transition-colors ${className}`}
      style={{ color: AUTH_COLORS.lavender.primary }}
      whileHover={{ opacity: 0.8 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
