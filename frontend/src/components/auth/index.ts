/**
 * Silent Help - Authentication Module
 * "Secure Sanctuary Gateway"
 * 
 * Complete authentication system with:
 * - Sign up with password strength
 * - Login with remember me
 * - Guest access for immediate help
 * - Social authentication (UI ready)
 * - Beautiful atmospheric design
 */

// Main Flow
export { AuthFlow, AuthFlowInner } from './AuthFlow';

// Provider & Hooks
export { 
  AuthProvider, 
  useAuth, 
  useAuthMode, 
  useIsAuthenticated, 
  useAuthUser 
} from './AuthProvider';

// Individual Screens
export { AuthChoice } from './screens/AuthChoice';
export { LoginForm } from './screens/LoginForm';
export { SignupForm } from './screens/SignupForm';
export { GuestEntry } from './screens/GuestEntry';

// UI Components
export {
  FloatingInput,
  PasswordInput,
  Checkbox,
  PrimaryButton,
  SocialButton,
  Divider,
  LinkButton,
} from './ui/AuthInputs';
