/**
 * Silent Help - Authentication Types
 * "Secure Sanctuary Gateway" - Type definitions for auth system
 */

// ============================================================================
// Auth Mode Types
// ============================================================================

export type AuthMode = 'choice' | 'login' | 'signup' | 'guest' | 'forgot-password';

export type AuthStep = 
  | 'initial'
  | 'email'
  | 'password'
  | 'confirm-password'
  | 'name'
  | 'verification'
  | 'complete';

// ============================================================================
// User Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  isGuest: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface GuestUser {
  id: string;
  displayName: string;
  isGuest: true;
  createdAt: Date;
  sessionExpiry?: Date;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface GuestFormData {
  displayName: string;
  acknowledgeTemporary: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Auth State Types
// ============================================================================

export interface AuthState {
  mode: AuthMode;
  step: AuthStep;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | GuestUser | null;
  errors: ValidationError[];
  animationDirection: 'forward' | 'backward';
}

export interface AuthActions {
  setMode: (mode: AuthMode) => void;
  setStep: (step: AuthStep) => void;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  continueAsGuest: (data: GuestFormData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
  logout: () => void;
  goBack: () => void;
  clearErrors: () => void;
}

export interface AuthContextValue extends AuthState, AuthActions {}

// ============================================================================
// Password Strength Types
// ============================================================================

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'excellent';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
  color: string;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface AuthTransition {
  from: AuthMode;
  to: AuthMode;
  direction: 'forward' | 'backward';
}

// ============================================================================
// Social Auth Types (for future)
// ============================================================================

export type SocialProvider = 'google' | 'apple' | 'github';

export interface SocialAuthConfig {
  provider: SocialProvider;
  enabled: boolean;
  icon: string;
  label: string;
}

// ============================================================================
// Constants
// ============================================================================

export const AUTH_COLORS = {
  lavender: {
    primary: '#B4A7D6',
    soft: '#D8D0E8',
    glow: 'rgba(180, 167, 214, 0.25)',
    border: 'rgba(180, 167, 214, 0.3)',
  },
  mint: {
    primary: '#7FDBCA',
    soft: '#B8F0E4',
    glow: 'rgba(127, 219, 202, 0.25)',
    border: 'rgba(127, 219, 202, 0.3)',
  },
  rose: {
    primary: '#F472B6',
    soft: '#FBB6CE',
    glow: 'rgba(244, 114, 182, 0.25)',
  },
  void: {
    deep: '#020617',
    surface: '#0F172A',
    card: 'rgba(15, 23, 42, 0.6)',
    cardElevated: 'rgba(15, 23, 42, 0.8)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    placeholder: '#475569',
  },
  success: {
    primary: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
  },
  error: {
    primary: '#EF4444',
    soft: '#FCA5A5',
    glow: 'rgba(239, 68, 68, 0.25)',
  },
};

export const PASSWORD_STRENGTH_CONFIG: Record<PasswordStrength, { color: string; label: string }> = {
  weak: { color: '#EF4444', label: 'Weak' },
  fair: { color: '#F59E0B', label: 'Fair' },
  good: { color: '#FBBF24', label: 'Good' },
  strong: { color: '#10B981', label: 'Strong' },
  excellent: { color: '#14B8A6', label: 'Excellent' },
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_LOGIN_FORM: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

export const DEFAULT_SIGNUP_FORM: SignupFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  agreeToTerms: false,
  agreeToPrivacy: false,
};

export const DEFAULT_GUEST_FORM: GuestFormData = {
  displayName: '',
  acknowledgeTemporary: false,
};
