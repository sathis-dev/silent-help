'use client';

/**
 * Silent Help - Authentication Provider
 * "Secure Sanctuary Gateway" - State Management for Auth System
 * 
 * Features:
 * - Complete auth state management
 * - Login/Signup/Guest flow handling
 * - Local storage persistence
 * - Smooth transitions between modes
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  AuthState,
  AuthContextValue,
  AuthMode,
  AuthStep,
  AuthUser,
  GuestUser,
  LoginFormData,
  SignupFormData,
  GuestFormData,
  ForgotPasswordFormData,
  ValidationError,
} from '@/lib/types/auth';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  AUTH_USER: 'silent_help_auth_user',
  AUTH_SESSION: 'silent_help_auth_session',
  GUEST_USER: 'silent_help_guest_user',
  REMEMBER_EMAIL: 'silent_help_remember_email',
};

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadStoredUser(): AuthUser | GuestUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const authUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (authUser) {
      const parsed = JSON.parse(authUser);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastLoginAt: new Date(parsed.lastLoginAt),
      };
    }

    const guestUser = localStorage.getItem(STORAGE_KEYS.GUEST_USER);
    if (guestUser) {
      const parsed = JSON.parse(guestUser);
      // Check if guest session expired (24 hours)
      const sessionExpiry = parsed.sessionExpiry ? new Date(parsed.sessionExpiry) : null;
      if (sessionExpiry && sessionExpiry < new Date()) {
        localStorage.removeItem(STORAGE_KEYS.GUEST_USER);
        return null;
      }
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        sessionExpiry: sessionExpiry,
      };
    }
  } catch (error) {
    console.error('Failed to load stored user:', error);
  }
  return null;
}

function saveUser(user: AuthUser | GuestUser): void {
  if (typeof window === 'undefined') return;

  try {
    if (user.isGuest) {
      localStorage.setItem(STORAGE_KEYS.GUEST_USER, JSON.stringify(user));
    } else {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem(STORAGE_KEYS.GUEST_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
}

function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  return null;
}

function validateSignupForm(data: SignupFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (!data.agreeToTerms) {
    errors.push({ field: 'agreeToTerms', message: 'Please accept the terms of service' });
  }

  if (!data.agreeToPrivacy) {
    errors.push({ field: 'agreeToPrivacy', message: 'Please accept the privacy policy' });
  }

  return errors;
}

function validateLoginForm(data: LoginFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
  mode: 'choice',
  step: 'initial',
  isLoading: false,
  isAuthenticated: false,
  user: null,
  errors: [],
  animationDirection: 'forward',
};

// ============================================================================
// Provider Props
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
  onAuthComplete?: (user: AuthUser | GuestUser) => void;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children, onAuthComplete }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage
  useEffect(() => {
    const storedUser = loadStoredUser();
    if (storedUser) {
      // Use callback form to avoid effect dependency issues
      setState({
        ...initialState,
        isAuthenticated: true,
        user: storedUser,
        mode: 'choice',
      });
      onAuthComplete?.(storedUser);
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set auth mode
  const setMode = useCallback((mode: AuthMode) => {
    setState(prev => ({
      ...prev,
      mode,
      step: 'initial',
      errors: [],
      animationDirection: 'forward',
    }));
  }, []);

  // Set current step
  const setStep = useCallback((step: AuthStep) => {
    setState(prev => ({
      ...prev,
      step,
    }));
  }, []);

  // Go back
  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.mode !== 'choice') {
        return {
          ...prev,
          mode: 'choice',
          step: 'initial',
          errors: [],
          animationDirection: 'backward',
        };
      }
      return prev;
    });
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }));
  }, []);

  // Login
  const login = useCallback(async (data: LoginFormData) => {
    setState(prev => ({ ...prev, isLoading: true, errors: [] }));

    const errors = validateLoginForm(data);
    if (errors.length > 0) {
      setState(prev => ({ ...prev, isLoading: false, errors }));
      return;
    }

    // Simulate API call (frontend only for now)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user: AuthUser = {
      id: generateUserId(),
      email: data.email,
      displayName: data.email.split('@')[0],
      isGuest: false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    if (data.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, data.email);
    }

    saveUser(user);

    setState(prev => ({
      ...prev,
      isLoading: false,
      isAuthenticated: true,
      user,
      mode: 'choice',
    }));

    onAuthComplete?.(user);
  }, [onAuthComplete]);

  // Signup
  const signup = useCallback(async (data: SignupFormData) => {
    setState(prev => ({ ...prev, isLoading: true, errors: [] }));

    const errors = validateSignupForm(data);
    if (errors.length > 0) {
      setState(prev => ({ ...prev, isLoading: false, errors }));
      return;
    }

    // Simulate API call (frontend only for now)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const user: AuthUser = {
      id: generateUserId(),
      email: data.email,
      displayName: data.displayName || data.email.split('@')[0],
      isGuest: false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    saveUser(user);

    setState(prev => ({
      ...prev,
      isLoading: false,
      isAuthenticated: true,
      user,
      mode: 'choice',
    }));

    onAuthComplete?.(user);
  }, [onAuthComplete]);

  // Continue as Guest
  const continueAsGuest = useCallback(async (data: GuestFormData) => {
    setState(prev => ({ ...prev, isLoading: true, errors: [] }));

    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 800));

    const guestUser: GuestUser = {
      id: generateGuestId(),
      displayName: data.displayName || 'Friend',
      isGuest: true,
      createdAt: new Date(),
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    saveUser(guestUser);

    setState(prev => ({
      ...prev,
      isLoading: false,
      isAuthenticated: true,
      user: guestUser,
      mode: 'choice',
    }));

    onAuthComplete?.(guestUser);
  }, [onAuthComplete]);

  // Forgot Password
  const forgotPassword = useCallback(async (data: ForgotPasswordFormData) => {
    setState(prev => ({ ...prev, isLoading: true, errors: [] }));

    const emailError = validateEmail(data.email);
    if (emailError) {
      setState(prev => ({ ...prev, isLoading: false, errors: [emailError] }));
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setState(prev => ({
      ...prev,
      isLoading: false,
      step: 'complete', // Show success message
    }));
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearStoredUser();
    setState({
      ...initialState,
      mode: 'choice',
    });
  }, []);

  // Memoized context value
  const contextValue = useMemo<AuthContextValue>(() => ({
    ...state,
    setMode,
    setStep,
    login,
    signup,
    continueAsGuest,
    forgotPassword,
    logout,
    goBack,
    clearErrors,
  }), [state, setMode, setStep, login, signup, continueAsGuest, forgotPassword, logout, goBack, clearErrors]);

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthMode(): AuthMode {
  const { mode } = useAuth();
  return mode;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useAuthUser(): AuthUser | GuestUser | null {
  const { user } = useAuth();
  return user;
}
