/**
 * Silent Help - Onboarding Components Index
 */

// Main components
export { OnboardingProvider, useOnboarding, useCurrentOnboardingStep, useStepResponse } from './OnboardingProvider';
export { OnboardingFlow } from './OnboardingFlow';

// Step components
export { WelcomeStep } from './steps/WelcomeStep';
export { EmotionalEntryStep } from './steps/EmotionalEntryStep';
export { ContextualStep } from './steps/ContextualStep';
export { PersonalizationStep } from './steps/PersonalizationStep';
export { TransitionStep } from './steps/TransitionStep';

// UI components
export { EmotionOrb } from './ui/EmotionOrb';
export { ParticleField } from './ui/ParticleField';
export { ProgressRing } from './ui/ProgressRing';
