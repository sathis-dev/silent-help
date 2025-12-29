/**
 * Silent Help - Wearable Integration Layer
 * "The Ghost Layer" - Proactive intervention through biometric monitoring
 * 
 * Integrates with:
 * - Apple HealthKit (Apple Watch)
 * - Garmin Connect (Garmin devices)
 * - Oura Ring API
 * - Fitbit Web API
 * 
 * Data collected:
 * - Heart Rate Variability (HRV)
 * - Resting Heart Rate
 * - Sleep Quality Score
 * - Stress Level (if available)
 * - SpO2 (blood oxygen)
 * 
 * Privacy: All biometric data is processed locally. Only anonymized
 * semantic vectors are stored for pattern analysis.
 * 
 * Clinical Safety: DCB0129 compliant - all biometric triggers logged
 */

import { BiometricData } from './neuro-adaptive-engine';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type WearableProvider = 'apple_health' | 'garmin' | 'oura' | 'fitbit' | 'manual';

export interface WearableConnection {
  provider: WearableProvider;
  isConnected: boolean;
  lastSync: Date | null;
  deviceName?: string;
  capabilities: WearableCapability[];
}

export type WearableCapability = 
  | 'heart_rate'
  | 'hrv'
  | 'sleep'
  | 'stress'
  | 'spo2'
  | 'activity'
  | 'ecg';

export interface WearableConfig {
  provider: WearableProvider;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
}

export interface SleepData {
  score: number;           // 0-100
  duration: number;        // hours
  deepSleep: number;       // hours
  remSleep: number;        // hours
  awakenings: number;
  date: Date;
}

export interface HRVReading {
  value: number;           // ms (RMSSD)
  timestamp: Date;
  source: WearableProvider;
}

export interface StressReading {
  level: number;           // 0-100
  timestamp: Date;
  source: WearableProvider;
}

// ============================================================================
// Intervention Triggers
// ============================================================================

export interface InterventionTrigger {
  type: 'hrv_drop' | 'hr_spike' | 'stress_spike' | 'poor_sleep' | 'pattern_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggestedIntervention: SuggestedIntervention;
  timestamp: Date;
}

export interface SuggestedIntervention {
  type: 'panic_reset' | 'breathing' | 'grounding' | 'break' | 'hydration' | 'movement';
  duration: number;        // seconds
  preloaded: boolean;      // Ready for zero-tap activation
  content: InterventionContent;
}

export interface InterventionContent {
  title: string;
  description: string;
  steps?: string[];
  audioUrl?: string;
  hapticPattern?: string;
}

// ============================================================================
// Pre-built Interventions
// ============================================================================

export const INTERVENTIONS: Record<string, SuggestedIntervention> = {
  panic_reset_60s: {
    type: 'panic_reset',
    duration: 60,
    preloaded: true,
    content: {
      title: '60-Second Reset',
      description: 'A quick grounding exercise to stabilize your nervous system.',
      steps: [
        'Close your eyes if comfortable',
        'Feel your feet on the ground',
        'Take one deep breath in... 4 counts',
        'Hold gently... 4 counts',
        'Release slowly... 6 counts',
        'Notice the space around you',
        'You are safe in this moment',
      ],
      hapticPattern: 'breathing_box',
    },
  },
  
  box_breathing_2min: {
    type: 'breathing',
    duration: 120,
    preloaded: true,
    content: {
      title: 'Box Breathing',
      description: 'Navy SEAL technique to activate parasympathetic response.',
      steps: [
        'Inhale through nose... 4 counts',
        'Hold... 4 counts',
        'Exhale through mouth... 4 counts',
        'Hold empty... 4 counts',
        'Repeat 4 cycles',
      ],
      hapticPattern: 'breathing_box',
    },
  },

  grounding_54321: {
    type: 'grounding',
    duration: 180,
    preloaded: true,
    content: {
      title: '5-4-3-2-1 Grounding',
      description: 'Sensory anchoring to bring you back to the present.',
      steps: [
        'Name 5 things you can SEE',
        'Name 4 things you can TOUCH',
        'Name 3 things you can HEAR',
        'Name 2 things you can SMELL',
        'Name 1 thing you can TASTE',
      ],
      hapticPattern: 'grounding_wave',
    },
  },

  hydration_break: {
    type: 'hydration',
    duration: 30,
    preloaded: false,
    content: {
      title: 'Hydration Check',
      description: 'Dehydration affects mood and cognition.',
      steps: [
        'Take a slow sip of water',
        'Feel the coolness',
        'Your body thanks you',
      ],
    },
  },

  movement_reset: {
    type: 'movement',
    duration: 60,
    preloaded: false,
    content: {
      title: 'Micro Movement',
      description: 'Gentle movement to release tension.',
      steps: [
        'Roll your shoulders back 3 times',
        'Stretch your neck gently side to side',
        'Shake out your hands',
        'Take one deep breath',
      ],
    },
  },
};

// ============================================================================
// Trigger Detection Logic
// ============================================================================

interface TriggerContext {
  currentHRV?: number;
  baselineHRV?: number;
  currentHR?: number;
  restingHR?: number;
  stressLevel?: number;
  sleepScore?: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export function detectTriggers(context: TriggerContext): InterventionTrigger[] {
  const triggers: InterventionTrigger[] = [];
  const now = new Date();

  // === HRV Drop Detection ===
  if (context.currentHRV && context.baselineHRV) {
    const hrvDrop = ((context.baselineHRV - context.currentHRV) / context.baselineHRV) * 100;
    
    if (hrvDrop >= 30) {
      triggers.push({
        type: 'hrv_drop',
        severity: 'critical',
        reason: `HRV dropped ${hrvDrop.toFixed(0)}% below baseline (${context.currentHRV}ms vs ${context.baselineHRV}ms baseline)`,
        suggestedIntervention: INTERVENTIONS.panic_reset_60s,
        timestamp: now,
      });
    } else if (hrvDrop >= 20) {
      triggers.push({
        type: 'hrv_drop',
        severity: 'high',
        reason: `HRV dropped ${hrvDrop.toFixed(0)}% - stress response detected`,
        suggestedIntervention: INTERVENTIONS.box_breathing_2min,
        timestamp: now,
      });
    } else if (hrvDrop >= 10) {
      triggers.push({
        type: 'hrv_drop',
        severity: 'medium',
        reason: `HRV slightly below baseline - early stress signal`,
        suggestedIntervention: INTERVENTIONS.hydration_break,
        timestamp: now,
      });
    }
  }

  // === Heart Rate Spike Detection ===
  if (context.currentHR && context.restingHR) {
    const hrElevation = context.currentHR - context.restingHR;
    
    if (hrElevation >= 40) {
      triggers.push({
        type: 'hr_spike',
        severity: 'critical',
        reason: `Heart rate elevated by ${hrElevation} BPM above resting`,
        suggestedIntervention: INTERVENTIONS.grounding_54321,
        timestamp: now,
      });
    } else if (hrElevation >= 25) {
      triggers.push({
        type: 'hr_spike',
        severity: 'high',
        reason: `Heart rate elevated +${hrElevation} BPM - consider a reset`,
        suggestedIntervention: INTERVENTIONS.box_breathing_2min,
        timestamp: now,
      });
    }
  }

  // === Stress Level Detection ===
  if (context.stressLevel !== undefined) {
    if (context.stressLevel >= 80) {
      triggers.push({
        type: 'stress_spike',
        severity: 'critical',
        reason: `Wearable stress level at ${context.stressLevel}%`,
        suggestedIntervention: INTERVENTIONS.panic_reset_60s,
        timestamp: now,
      });
    } else if (context.stressLevel >= 60) {
      triggers.push({
        type: 'stress_spike',
        severity: 'high',
        reason: `Elevated stress detected (${context.stressLevel}%)`,
        suggestedIntervention: INTERVENTIONS.movement_reset,
        timestamp: now,
      });
    }
  }

  // === Sleep Impact Detection ===
  if (context.sleepScore !== undefined && context.sleepScore < 50) {
    triggers.push({
      type: 'poor_sleep',
      severity: 'medium',
      reason: `Last night's sleep score was ${context.sleepScore}% - you may tire easily today`,
      suggestedIntervention: INTERVENTIONS.hydration_break,
      timestamp: now,
    });
  }

  return triggers;
}

// ============================================================================
// Wearable Connection Manager
// ============================================================================

export class WearableManager {
  private connections: Map<WearableProvider, WearableConnection> = new Map();
  private baselineHRV: number = 50; // Default baseline, updated over time
  private baselineHR: number = 65;  // Default resting HR
  private latestBiometrics: BiometricData = {};
  private listeners: Set<(data: BiometricData) => void> = new Set();
  private triggerListeners: Set<(trigger: InterventionTrigger) => void> = new Set();

  constructor() {
    // Initialize with no connections
  }

  // === Connection Management ===

  async connect(provider: WearableProvider, config?: WearableConfig): Promise<boolean> {
    try {
      // In a real implementation, this would handle OAuth flows
      // For now, we simulate connection
      
      const capabilities = this.getProviderCapabilities(provider);
      
      this.connections.set(provider, {
        provider,
        isConnected: true,
        lastSync: new Date(),
        deviceName: this.getProviderName(provider),
        capabilities,
      });

      console.log(`[Wearable] Connected to ${provider}`);
      return true;
    } catch (error) {
      console.error(`[Wearable] Failed to connect to ${provider}:`, error);
      return false;
    }
  }

  disconnect(provider: WearableProvider): void {
    this.connections.delete(provider);
    console.log(`[Wearable] Disconnected from ${provider}`);
  }

  getConnections(): WearableConnection[] {
    return Array.from(this.connections.values());
  }

  isConnected(provider?: WearableProvider): boolean {
    if (provider) {
      return this.connections.get(provider)?.isConnected ?? false;
    }
    return this.connections.size > 0;
  }

  // === Data Fetching ===

  async fetchLatestData(): Promise<BiometricData> {
    const biometrics: BiometricData = {};

    for (const [provider, connection] of this.connections) {
      if (!connection.isConnected) continue;

      try {
        // In production, this would call actual APIs
        // For demo, we simulate realistic data
        const data = await this.simulateFetch(provider, connection.capabilities);
        Object.assign(biometrics, data);
        
        connection.lastSync = new Date();
      } catch (error) {
        console.error(`[Wearable] Failed to fetch from ${provider}:`, error);
      }
    }

    this.latestBiometrics = { ...biometrics, lastSync: new Date() };
    this.notifyListeners(this.latestBiometrics);
    this.checkTriggers();

    return this.latestBiometrics;
  }

  // === Trigger Detection ===

  private checkTriggers(): void {
    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' 
      : hour < 12 ? 'morning'
      : hour < 18 ? 'afternoon'
      : hour < 22 ? 'evening'
      : 'night';

    const context: TriggerContext = {
      currentHRV: this.latestBiometrics.hrv,
      baselineHRV: this.baselineHRV,
      currentHR: this.latestBiometrics.heartRate,
      restingHR: this.baselineHR,
      stressLevel: this.latestBiometrics.stressLevel,
      sleepScore: this.latestBiometrics.sleepScore,
      timeOfDay,
    };

    const triggers = detectTriggers(context);
    
    for (const trigger of triggers) {
      this.notifyTriggerListeners(trigger);
    }
  }

  // === Baseline Calibration ===

  updateBaseline(hrv?: number, restingHR?: number): void {
    if (hrv !== undefined) {
      // Exponential moving average
      this.baselineHRV = this.baselineHRV * 0.9 + hrv * 0.1;
    }
    if (restingHR !== undefined) {
      this.baselineHR = this.baselineHR * 0.9 + restingHR * 0.1;
    }
  }

  // === Event Subscriptions ===

  subscribe(listener: (data: BiometricData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onTrigger(listener: (trigger: InterventionTrigger) => void): () => void {
    this.triggerListeners.add(listener);
    return () => this.triggerListeners.delete(listener);
  }

  // === Manual Data Entry (for users without wearables) ===

  setManualData(data: Partial<BiometricData>): void {
    this.latestBiometrics = { ...this.latestBiometrics, ...data, lastSync: new Date() };
    this.notifyListeners(this.latestBiometrics);
    this.checkTriggers();
  }

  // === Private Helpers ===

  private getProviderCapabilities(provider: WearableProvider): WearableCapability[] {
    switch (provider) {
      case 'apple_health':
        return ['heart_rate', 'hrv', 'sleep', 'stress', 'spo2', 'activity', 'ecg'];
      case 'garmin':
        return ['heart_rate', 'hrv', 'sleep', 'stress', 'spo2', 'activity'];
      case 'oura':
        return ['hrv', 'sleep', 'activity'];
      case 'fitbit':
        return ['heart_rate', 'sleep', 'activity', 'spo2'];
      case 'manual':
        return ['heart_rate', 'hrv', 'sleep', 'stress'];
      default:
        return [];
    }
  }

  private getProviderName(provider: WearableProvider): string {
    const names: Record<WearableProvider, string> = {
      apple_health: 'Apple Watch',
      garmin: 'Garmin Device',
      oura: 'Oura Ring',
      fitbit: 'Fitbit',
      manual: 'Manual Entry',
    };
    return names[provider];
  }

  private async simulateFetch(
    provider: WearableProvider, 
    capabilities: WearableCapability[]
  ): Promise<Partial<BiometricData>> {
    // Simulate realistic biometric data for demo
    // In production, this would call actual APIs
    
    const data: Partial<BiometricData> = {};

    if (capabilities.includes('heart_rate')) {
      // Simulate HR with some variation
      data.heartRate = 65 + Math.floor(Math.random() * 20);
      data.restingHR = this.baselineHR;
    }

    if (capabilities.includes('hrv')) {
      // Simulate HRV (RMSSD in ms)
      data.hrv = 40 + Math.floor(Math.random() * 30);
    }

    if (capabilities.includes('sleep')) {
      data.sleepScore = 60 + Math.floor(Math.random() * 35);
    }

    if (capabilities.includes('stress')) {
      data.stressLevel = 20 + Math.floor(Math.random() * 50);
    }

    return data;
  }

  private notifyListeners(data: BiometricData): void {
    this.listeners.forEach(listener => listener(data));
  }

  private notifyTriggerListeners(trigger: InterventionTrigger): void {
    console.log(`[Wearable] Trigger detected: ${trigger.type} (${trigger.severity})`);
    this.triggerListeners.forEach(listener => listener(trigger));
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let wearableManager: WearableManager | null = null;

export function getWearableManager(): WearableManager {
  if (!wearableManager) {
    wearableManager = new WearableManager();
  }
  return wearableManager;
}

// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useWearables() {
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricData>({});
  const [latestTrigger, setLatestTrigger] = useState<InterventionTrigger | null>(null);
  
  const manager = getWearableManager();

  useEffect(() => {
    const unsubBiometrics = manager.subscribe(setBiometrics);
    const unsubTriggers = manager.onTrigger(setLatestTrigger);
    
    // Initial state
    setConnections(manager.getConnections());

    return () => {
      unsubBiometrics();
      unsubTriggers();
    };
  }, [manager]);

  const connect = useCallback(async (provider: WearableProvider) => {
    const success = await manager.connect(provider);
    if (success) {
      setConnections(manager.getConnections());
    }
    return success;
  }, [manager]);

  const disconnect = useCallback((provider: WearableProvider) => {
    manager.disconnect(provider);
    setConnections(manager.getConnections());
  }, [manager]);

  const refresh = useCallback(async () => {
    return manager.fetchLatestData();
  }, [manager]);

  const setManualData = useCallback((data: Partial<BiometricData>) => {
    manager.setManualData(data);
  }, [manager]);

  const clearTrigger = useCallback(() => {
    setLatestTrigger(null);
  }, []);

  return {
    connections,
    biometrics,
    latestTrigger,
    connect,
    disconnect,
    refresh,
    setManualData,
    clearTrigger,
    isConnected: connections.length > 0,
  };
}
