/**
 * Silent Help - Neuro-Adaptive Context Engine
 * "The Sentient UI" - Interface that physically changes based on cognitive load
 * 
 * This engine monitors user interaction patterns to detect:
 * - Cognitive fatigue (slow typing, long pauses, erratic behavior)
 * - High stress (rapid typing, short pauses, repeated actions)
 * - Calm/maintenance state (steady rhythm, deliberate actions)
 * 
 * The detected state drives the entire UI adaptation:
 * - HIGH_STRESS: Simplified UI, 40% larger icons, reduced cognitive density
 * - MAINTENANCE: Deep journaling prompts, pattern reflections
 * - CALM: Full feature access, exploratory mode
 * - CRISIS: Maximum simplification, immediate SOS prominence
 * 
 * Clinical Safety: DCB0129 compliant - all state changes logged
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CognitiveState = 'calm' | 'maintenance' | 'high_stress' | 'crisis';

export interface InteractionMetrics {
  typingSpeed: number;           // chars per second
  pauseDuration: number;         // average pause in ms
  errorRate: number;             // backspaces per 100 chars
  scrollVelocity: number;        // pixels per second
  tapForce: number;              // 0-1 normalized (if available)
  sessionDuration: number;       // seconds since session start
  actionsPerMinute: number;      // interaction frequency
}

export interface BiometricData {
  heartRate?: number;            // BPM from wearable
  hrv?: number;                  // Heart Rate Variability in ms
  restingHR?: number;            // Baseline resting HR
  sleepScore?: number;           // 0-100 from last night
  stressLevel?: number;          // 0-100 computed stress
  lastSync?: Date;               // When biometrics were last updated
}

export interface NeuroAdaptiveState {
  currentState: CognitiveState;
  confidence: number;            // 0-1 how confident in detection
  stateHistory: StateTransition[];
  metrics: InteractionMetrics;
  biometrics: BiometricData | null;
  recommendations: Recommendation[];
  uiOverrides: UIOverrides;
}

export interface StateTransition {
  from: CognitiveState;
  to: CognitiveState;
  timestamp: Date;
  trigger: string;               // What caused the transition
  confidence: number;
}

export interface Recommendation {
  id: string;
  type: 'breathing' | 'grounding' | 'journal' | 'break' | 'sos';
  priority: number;              // 1-10, higher = more urgent
  reason: string;                // Model transparency
  preloaded: boolean;            // Ready for zero-tap?
}

export interface UIOverrides {
  iconScale: number;             // 1.0 = normal, 1.4 = high stress
  contrastBoost: number;         // 0 = normal, 1 = maximum
  animationSpeed: number;        // 1.0 = normal, 0.5 = slower for calm
  reducedMotion: boolean;        // Disable non-essential animations
  simplifiedLayout: boolean;     // Hide secondary UI elements
  atmosphereColor: AtmosphereColor;
  fontScale: number;             // Text size multiplier
}

export interface AtmosphereColor {
  primary: string;               // Main gradient color
  secondary: string;             // Secondary gradient color
  accent: string;                // Accent for interactive elements
  glow: string;                  // Ambient glow color
}

// ============================================================================
// Atmosphere Color Palettes
// ============================================================================

export const ATMOSPHERE_PALETTES: Record<CognitiveState, AtmosphereColor> = {
  calm: {
    primary: '#0D9488',          // Teal-600 - Deep calm
    secondary: '#7FDBCA',        // Neo-Mint - Fresh vitality
    accent: '#B4A7D6',           // Digital Lavender
    glow: 'rgba(127, 219, 202, 0.15)',
  },
  maintenance: {
    primary: '#B4A7D6',          // Digital Lavender - Reflective
    secondary: '#8B7FB8',        // Lavender Deep
    accent: '#7FDBCA',           // Neo-Mint
    glow: 'rgba(180, 167, 214, 0.2)',
  },
  high_stress: {
    primary: '#F59E0B',          // Amber-500 - Awareness
    secondary: '#FCD34D',        // Amber-300 - Softer
    accent: '#7FDBCA',           // Neo-Mint for grounding
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  crisis: {
    primary: '#E53935',          // Lifebuoy Red
    secondary: '#FFCDD2',        // Red-100 - Softer
    accent: '#FFFFFF',           // High contrast
    glow: 'rgba(229, 57, 53, 0.25)',
  },
};

// ============================================================================
// Default UI Overrides per State
// ============================================================================

export const STATE_UI_OVERRIDES: Record<CognitiveState, UIOverrides> = {
  calm: {
    iconScale: 1.0,
    contrastBoost: 0,
    animationSpeed: 1.0,
    reducedMotion: false,
    simplifiedLayout: false,
    atmosphereColor: ATMOSPHERE_PALETTES.calm,
    fontScale: 1.0,
  },
  maintenance: {
    iconScale: 1.0,
    contrastBoost: 0.1,
    animationSpeed: 0.8,
    reducedMotion: false,
    simplifiedLayout: false,
    atmosphereColor: ATMOSPHERE_PALETTES.maintenance,
    fontScale: 1.05,
  },
  high_stress: {
    iconScale: 1.4,              // 40% larger for reduced fine motor control
    contrastBoost: 0.5,
    animationSpeed: 0.6,
    reducedMotion: true,         // Reduce cognitive load
    simplifiedLayout: true,      // Hide non-essential elements
    atmosphereColor: ATMOSPHERE_PALETTES.high_stress,
    fontScale: 1.2,
  },
  crisis: {
    iconScale: 1.6,              // Maximum accessibility
    contrastBoost: 1.0,          // Maximum contrast
    animationSpeed: 0.4,
    reducedMotion: true,
    simplifiedLayout: true,
    atmosphereColor: ATMOSPHERE_PALETTES.crisis,
    fontScale: 1.3,
  },
};

// ============================================================================
// Interaction Pattern Analyzer
// ============================================================================

class InteractionBuffer {
  private keystrokes: { timestamp: number; isBackspace: boolean }[] = [];
  private scrollEvents: { timestamp: number; delta: number }[] = [];
  private taps: { timestamp: number; force?: number }[] = [];
  private readonly bufferWindow = 30000; // 30 second rolling window

  recordKeystroke(isBackspace: boolean = false) {
    this.keystrokes.push({ timestamp: Date.now(), isBackspace });
    this.cleanup();
  }

  recordScroll(delta: number) {
    this.scrollEvents.push({ timestamp: Date.now(), delta });
    this.cleanup();
  }

  recordTap(force?: number) {
    this.taps.push({ timestamp: Date.now(), force });
    this.cleanup();
  }

  private cleanup() {
    const cutoff = Date.now() - this.bufferWindow;
    this.keystrokes = this.keystrokes.filter(k => k.timestamp > cutoff);
    this.scrollEvents = this.scrollEvents.filter(s => s.timestamp > cutoff);
    this.taps = this.taps.filter(t => t.timestamp > cutoff);
  }

  getMetrics(): Partial<InteractionMetrics> {
    const now = Date.now();
    const windowStart = now - this.bufferWindow;

    // Typing speed (chars per second)
    const recentKeystrokes = this.keystrokes.filter(k => !k.isBackspace);
    const typingSpeed = recentKeystrokes.length / (this.bufferWindow / 1000);

    // Pause duration (average gap between keystrokes)
    const gaps: number[] = [];
    for (let i = 1; i < this.keystrokes.length; i++) {
      gaps.push(this.keystrokes[i].timestamp - this.keystrokes[i-1].timestamp);
    }
    const pauseDuration = gaps.length > 0 
      ? gaps.reduce((a, b) => a + b, 0) / gaps.length 
      : 0;

    // Error rate (backspaces per 100 chars)
    const backspaces = this.keystrokes.filter(k => k.isBackspace).length;
    const totalChars = this.keystrokes.length;
    const errorRate = totalChars > 0 ? (backspaces / totalChars) * 100 : 0;

    // Scroll velocity
    const scrollVelocity = this.scrollEvents.reduce((sum, s) => sum + Math.abs(s.delta), 0) 
      / (this.bufferWindow / 1000);

    // Tap force (average if available)
    const forceTaps = this.taps.filter(t => t.force !== undefined);
    const tapForce = forceTaps.length > 0
      ? forceTaps.reduce((sum, t) => sum + (t.force || 0), 0) / forceTaps.length
      : 0.5;

    // Actions per minute
    const totalActions = this.keystrokes.length + this.scrollEvents.length + this.taps.length;
    const actionsPerMinute = totalActions / (this.bufferWindow / 60000);

    return {
      typingSpeed,
      pauseDuration,
      errorRate,
      scrollVelocity,
      tapForce,
      actionsPerMinute,
    };
  }
}

// ============================================================================
// Cognitive State Classifier
// ============================================================================

function classifyCognitiveState(
  metrics: InteractionMetrics,
  biometrics: BiometricData | null
): { state: CognitiveState; confidence: number; trigger: string } {
  let stressScore = 0;
  let triggers: string[] = [];

  // === Typing Pattern Analysis ===
  
  // High typing speed with many errors = stress
  if (metrics.typingSpeed > 5 && metrics.errorRate > 15) {
    stressScore += 25;
    triggers.push('rapid erratic typing');
  }
  
  // Very slow typing with long pauses = fatigue/low energy
  if (metrics.typingSpeed < 1 && metrics.pauseDuration > 3000) {
    stressScore += 15;
    triggers.push('slow hesitant input');
  }

  // High actions per minute = agitation
  if (metrics.actionsPerMinute > 60) {
    stressScore += 20;
    triggers.push('high interaction frequency');
  }

  // Erratic scrolling = searching/anxiety
  if (metrics.scrollVelocity > 500) {
    stressScore += 15;
    triggers.push('rapid scrolling');
  }

  // === Biometric Analysis (if available) ===
  
  if (biometrics) {
    // HRV drop indicates stress
    if (biometrics.hrv && biometrics.hrv < 30) {
      stressScore += 30;
      triggers.push(`low HRV (${biometrics.hrv}ms)`);
    }

    // Elevated heart rate
    if (biometrics.heartRate && biometrics.restingHR) {
      const hrElevation = biometrics.heartRate - biometrics.restingHR;
      if (hrElevation > 20) {
        stressScore += 25;
        triggers.push(`elevated HR (+${hrElevation} BPM)`);
      }
    }

    // Poor sleep affects cognitive load
    if (biometrics.sleepScore && biometrics.sleepScore < 50) {
      stressScore += 15;
      triggers.push(`poor sleep (${biometrics.sleepScore}%)`);
    }

    // Direct stress level from wearable
    if (biometrics.stressLevel && biometrics.stressLevel > 70) {
      stressScore += 20;
      triggers.push(`wearable stress: ${biometrics.stressLevel}%`);
    }
  }

  // === State Classification ===
  
  let state: CognitiveState;
  let confidence: number;

  if (stressScore >= 70) {
    state = 'crisis';
    confidence = Math.min(0.95, stressScore / 100);
  } else if (stressScore >= 45) {
    state = 'high_stress';
    confidence = 0.7 + (stressScore - 45) / 100;
  } else if (stressScore >= 20) {
    state = 'maintenance';
    confidence = 0.6 + (stressScore - 20) / 100;
  } else {
    state = 'calm';
    confidence = 0.8 - stressScore / 50;
  }

  return {
    state,
    confidence,
    trigger: triggers.length > 0 ? triggers.join(', ') : 'baseline state',
  };
}

// ============================================================================
// Recommendation Generator
// ============================================================================

function generateRecommendations(
  state: CognitiveState,
  metrics: InteractionMetrics,
  biometrics: BiometricData | null
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  switch (state) {
    case 'crisis':
      recommendations.push({
        id: 'crisis-sos',
        type: 'sos',
        priority: 10,
        reason: 'Multiple stress indicators detected. Immediate support available.',
        preloaded: true,
      });
      recommendations.push({
        id: 'crisis-grounding',
        type: 'grounding',
        priority: 9,
        reason: '5-4-3-2-1 technique preloaded for immediate use.',
        preloaded: true,
      });
      break;

    case 'high_stress':
      recommendations.push({
        id: 'stress-breathing',
        type: 'breathing',
        priority: 8,
        reason: biometrics?.hrv 
          ? `Your HRV dropped to ${biometrics.hrv}ms. Box breathing can help stabilize.`
          : 'Elevated stress patterns detected in your interaction.',
        preloaded: true,
      });
      recommendations.push({
        id: 'stress-break',
        type: 'break',
        priority: 7,
        reason: 'A 2-minute pause might help reset your nervous system.',
        preloaded: false,
      });
      break;

    case 'maintenance':
      recommendations.push({
        id: 'maintenance-journal',
        type: 'journal',
        priority: 5,
        reason: 'Good time for reflection. Your patterns suggest you\'re in a thoughtful state.',
        preloaded: false,
      });
      recommendations.push({
        id: 'maintenance-breathing',
        type: 'breathing',
        priority: 4,
        reason: 'Gentle breathing to maintain your current calm.',
        preloaded: false,
      });
      break;

    case 'calm':
      recommendations.push({
        id: 'calm-journal',
        type: 'journal',
        priority: 3,
        reason: 'You seem settled. Perfect time for deeper self-exploration.',
        preloaded: false,
      });
      break;
  }

  return recommendations;
}

// ============================================================================
// Main Neuro-Adaptive Engine Class
// ============================================================================

export class NeuroAdaptiveEngine {
  private state: NeuroAdaptiveState;
  private interactionBuffer: InteractionBuffer;
  private sessionStart: number;
  private listeners: Set<(state: NeuroAdaptiveState) => void>;
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.interactionBuffer = new InteractionBuffer();
    this.sessionStart = Date.now();
    this.listeners = new Set();
    
    this.state = {
      currentState: 'calm',
      confidence: 0.5,
      stateHistory: [],
      metrics: {
        typingSpeed: 0,
        pauseDuration: 0,
        errorRate: 0,
        scrollVelocity: 0,
        tapForce: 0.5,
        sessionDuration: 0,
        actionsPerMinute: 0,
      },
      biometrics: null,
      recommendations: [],
      uiOverrides: STATE_UI_OVERRIDES.calm,
    };
  }

  // === Public API ===

  start() {
    // Update state every 2 seconds
    this.updateInterval = setInterval(() => this.updateState(), 2000);
    console.log('[NeuroAdaptive] Engine started');
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('[NeuroAdaptive] Engine stopped');
  }

  subscribe(listener: (state: NeuroAdaptiveState) => void): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): NeuroAdaptiveState {
    return { ...this.state };
  }

  // === Input Recording ===

  recordKeystroke(isBackspace: boolean = false) {
    this.interactionBuffer.recordKeystroke(isBackspace);
  }

  recordScroll(delta: number) {
    this.interactionBuffer.recordScroll(delta);
  }

  recordTap(force?: number) {
    this.interactionBuffer.recordTap(force);
  }

  // === Biometric Integration ===

  updateBiometrics(data: Partial<BiometricData>) {
    this.state.biometrics = {
      ...this.state.biometrics,
      ...data,
      lastSync: new Date(),
    };
    this.updateState();
  }

  // === Manual State Override (for testing/clinical use) ===

  forceState(state: CognitiveState, reason: string = 'manual override') {
    const previousState = this.state.currentState;
    this.state.currentState = state;
    this.state.confidence = 1.0;
    this.state.uiOverrides = STATE_UI_OVERRIDES[state];
    this.state.recommendations = generateRecommendations(state, this.state.metrics, this.state.biometrics);

    if (previousState !== state) {
      this.state.stateHistory.push({
        from: previousState,
        to: state,
        timestamp: new Date(),
        trigger: reason,
        confidence: 1.0,
      });
    }

    this.notifyListeners();
  }

  // === Private Methods ===

  private updateState() {
    const bufferMetrics = this.interactionBuffer.getMetrics();
    
    this.state.metrics = {
      ...this.state.metrics,
      ...bufferMetrics,
      sessionDuration: (Date.now() - this.sessionStart) / 1000,
    };

    const classification = classifyCognitiveState(this.state.metrics, this.state.biometrics);
    const previousState = this.state.currentState;

    // Only transition if confidence is high enough (prevents jitter)
    if (classification.confidence > 0.6 || classification.state === 'crisis') {
      this.state.currentState = classification.state;
      this.state.confidence = classification.confidence;
      this.state.uiOverrides = STATE_UI_OVERRIDES[classification.state];

      // Record state transition
      if (previousState !== classification.state) {
        this.state.stateHistory.push({
          from: previousState,
          to: classification.state,
          timestamp: new Date(),
          trigger: classification.trigger,
          confidence: classification.confidence,
        });

        // Keep history bounded
        if (this.state.stateHistory.length > 50) {
          this.state.stateHistory = this.state.stateHistory.slice(-50);
        }

        console.log(`[NeuroAdaptive] State transition: ${previousState} → ${classification.state} (${classification.trigger})`);
      }
    }

    // Always update recommendations
    this.state.recommendations = generateRecommendations(
      this.state.currentState,
      this.state.metrics,
      this.state.biometrics
    );

    this.notifyListeners();
  }

  private notifyListeners() {
    const snapshot = { ...this.state };
    this.listeners.forEach(listener => listener(snapshot));
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let engineInstance: NeuroAdaptiveEngine | null = null;

export function getNeuroAdaptiveEngine(): NeuroAdaptiveEngine {
  if (!engineInstance) {
    engineInstance = new NeuroAdaptiveEngine();
  }
  return engineInstance;
}

export function initNeuroAdaptiveEngine(): NeuroAdaptiveEngine {
  const engine = getNeuroAdaptiveEngine();
  engine.start();
  return engine;
}

// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useNeuroAdaptive() {
  const [state, setState] = useState<NeuroAdaptiveState | null>(null);
  const engine = getNeuroAdaptiveEngine();

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    return unsubscribe;
  }, [engine]);

  const recordKeystroke = useCallback((isBackspace: boolean = false) => {
    engine.recordKeystroke(isBackspace);
  }, [engine]);

  const recordScroll = useCallback((delta: number) => {
    engine.recordScroll(delta);
  }, [engine]);

  const recordTap = useCallback((force?: number) => {
    engine.recordTap(force);
  }, [engine]);

  const updateBiometrics = useCallback((data: Partial<BiometricData>) => {
    engine.updateBiometrics(data);
  }, [engine]);

  const forceState = useCallback((state: CognitiveState, reason?: string) => {
    engine.forceState(state, reason);
  }, [engine]);

  const isReady = state !== null;

  // Memoize return object to prevent infinite loops in consumers
  return useMemo(() => ({
    state,
    recordKeystroke,
    recordScroll,
    recordTap,
    updateBiometrics,
    forceState,
    isReady,
  }), [state, recordKeystroke, recordScroll, recordTap, updateBiometrics, forceState, isReady]);
}
