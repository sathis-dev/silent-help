/**
 * Haptic Feedback Engine
 * 
 * The "Tactile Hug" - Every interaction has a unique pulse signature.
 * Uses the Vibration API with graceful degradation.
 * 
 * Pathway Signatures:
 * - SOS (HIGH): Heavy double-pulse - urgent but not panic-inducing
 * - Overwhelmed (MID): Medium wave - grounding, like a heartbeat
 * - Reflect (LOW): Soft feather tap - gentle, inviting
 */

type HapticIntensity = 'heavy' | 'medium' | 'light';
type PathwayHaptic = 'sos' | 'overwhelmed' | 'reflect' | 'success' | 'error';

// Intensity-based patterns (legacy support)
const HAPTIC_PATTERNS: Record<HapticIntensity, number[]> = {
  heavy: [50, 30, 100],   // Strong double tap
  medium: [30, 20, 40],   // Medium feedback
  light: [15],            // Subtle tap
};

// Pathway-specific haptic signatures
const PATHWAY_PATTERNS: Record<PathwayHaptic, number[]> = {
  // SOS: Heavy double-pulse (urgent but controlled)
  sos: [80, 60, 120, 60, 80],
  
  // Overwhelmed: Medium wave (like a calming heartbeat)
  overwhelmed: [40, 80, 60, 80, 40, 80, 30],
  
  // Reflect: Soft feather tap (gentle invitation)
  reflect: [8, 40, 12],
  
  // Success: Satisfying completion
  success: [20, 50, 40, 50, 60],
  
  // Error: Subtle alert
  error: [30, 30, 30, 30, 30],
};

// SOS emergency pattern - Morse code SOS
const SOS_EMERGENCY_PATTERN = [
  100, 50, 100, 50, 100,  // S: ...
  150,                      // gap
  200, 50, 200, 50, 200,  // O: ---
  150,                      // gap
  100, 50, 100, 50, 100   // S: ...
];

// Breathing phase patterns (subtle biofeedback)
const INHALE_PATTERN = [15, 80, 20, 80, 25, 80, 30]; // Gentle crescendo
const EXHALE_PATTERN = [30, 80, 25, 80, 20, 80, 15]; // Gentle decrescendo
const HOLD_PATTERN = [8];                              // Minimal presence

// Button interaction patterns
const BUTTON_TAP_PATTERN = [12];
const BUTTON_PRESS_PATTERN = [20, 30, 15];
const CARD_SELECT_PATTERN = [15, 40, 25];

/**
 * Check if haptic feedback is available
 */
export function isHapticAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback based on intensity (legacy)
 */
export function triggerHaptic(intensity: HapticIntensity): void {
  if (!isHapticAvailable()) return;
  
  try {
    navigator.vibrate(HAPTIC_PATTERNS[intensity]);
  } catch {
    // Silently fail - haptics are enhancement only
  }
}

/**
 * Trigger pathway-specific haptic signature
 * The unique "feel" of each pathway
 */
export function triggerPathwayHaptic(pathway: PathwayHaptic): void {
  if (!isHapticAvailable()) return;
  
  try {
    navigator.vibrate(PATHWAY_PATTERNS[pathway]);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger SOS emergency haptic (Morse code pattern)
 */
export function triggerSOSHaptic(): void {
  if (!isHapticAvailable()) return;
  
  try {
    navigator.vibrate(SOS_EMERGENCY_PATTERN);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger breathing phase haptic for biofeedback
 */
export function triggerBreathingHaptic(phase: 'inhale' | 'hold' | 'exhale'): void {
  if (!isHapticAvailable()) return;
  
  const patterns: Record<string, number[]> = {
    inhale: INHALE_PATTERN,
    hold: HOLD_PATTERN,
    exhale: EXHALE_PATTERN,
  };
  
  try {
    navigator.vibrate(patterns[phase]);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger UI interaction haptics
 */
export function triggerUIHaptic(type: 'tap' | 'press' | 'select'): void {
  if (!isHapticAvailable()) return;
  
  const patterns: Record<string, number[]> = {
    tap: BUTTON_TAP_PATTERN,
    press: BUTTON_PRESS_PATTERN,
    select: CARD_SELECT_PATTERN,
  };
  
  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently fail
  }
}

/**
 * Stop any ongoing haptic feedback
 */
export function stopHaptic(): void {
  if (!isHapticAvailable()) return;
  
  try {
    navigator.vibrate(0);
  } catch {
    // Silently fail
  }
}

/**
 * Trigger success haptic (for completing exercises)
 */
export function triggerSuccessHaptic(): void {
  if (!isHapticAvailable()) return;
  
  try {
    navigator.vibrate([30, 80, 30, 80, 60]);
  } catch {
    // Silently fail
  }
}
