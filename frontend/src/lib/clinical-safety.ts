/**
 * Silent Help - Clinical Safety Framework
 * DCB0129 Compliant Clinical Hazard Management
 * 
 * This module ensures all AI responses and interventions pass through
 * a clinical safety layer before reaching the user.
 * 
 * Compliance Standards:
 * - DCB0129: Clinical Risk Management (NHS Digital)
 * - UK GDPR 2025: Data Protection
 * - WCAG 2.2 Level AA: Accessibility
 * - NHS DTAC: Digital Technology Assessment Criteria
 * 
 * Key Components:
 * 1. Clinical Hazard Log - All AI decisions logged for audit
 * 2. Response Safety Filter - Prevents harmful advice
 * 3. Escalation Pathways - Clear crisis routing
 * 4. Consent Management - Granular user consent tracking
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type HazardSeverity = 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
export type HazardLikelihood = 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
export type RiskLevel = 'acceptable' | 'tolerable' | 'unacceptable';

export interface ClinicalHazard {
  id: string;
  category: HazardCategory;
  description: string;
  severity: HazardSeverity;
  likelihood: HazardLikelihood;
  riskLevel: RiskLevel;
  mitigations: string[];
  residualRisk: RiskLevel;
}

export type HazardCategory =
  | 'harmful_advice'
  | 'delayed_crisis_response'
  | 'privacy_breach'
  | 'incorrect_assessment'
  | 'system_failure'
  | 'accessibility_barrier';

export interface SafetyLogEntry {
  id: string;
  timestamp: Date;
  eventType: SafetyEventType;
  severity: HazardSeverity;
  context: string;
  aiResponse?: string;
  userState?: string;
  action: string;
  outcome: 'passed' | 'blocked' | 'escalated' | 'modified';
  hazardIds: string[];
}

export type SafetyEventType =
  | 'ai_response'
  | 'state_transition'
  | 'intervention_triggered'
  | 'crisis_detected'
  | 'user_consent'
  | 'data_access'
  | 'system_error';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  expiresAt?: Date;
  scope: string[];
  version: string;
}

export type ConsentType =
  | 'data_collection'
  | 'biometric_processing'
  | 'ai_analysis'
  | 'anonymous_research'
  | 'third_party_sharing'
  | 'crisis_escalation';

export interface SafetyContext {
  userState: string;
  cognitiveLoad: string;
  recentActions: string[];
  biometricState?: string;
  timeOfDay: string;
  sessionDuration: number;
}

// ============================================================================
// Clinical Hazard Registry
// ============================================================================

export const CLINICAL_HAZARDS: ClinicalHazard[] = [
  {
    id: 'HAZ-001',
    category: 'harmful_advice',
    description: 'AI provides advice that could worsen mental health state',
    severity: 'major',
    likelihood: 'unlikely',
    riskLevel: 'unacceptable',
    mitigations: [
      'All AI responses pass through safety filter',
      'Banned phrase detection active',
      'Clinical review of response templates',
      'Real-time escalation to human support',
    ],
    residualRisk: 'tolerable',
  },
  {
    id: 'HAZ-002',
    category: 'delayed_crisis_response',
    description: 'Crisis state not detected or response delayed',
    severity: 'catastrophic',
    likelihood: 'rare',
    riskLevel: 'unacceptable',
    mitigations: [
      'Multiple crisis detection pathways',
      'SOS always accessible (max 2 taps)',
      'Biometric triggers for proactive intervention',
      'Fallback to human crisis lines',
    ],
    residualRisk: 'tolerable',
  },
  {
    id: 'HAZ-003',
    category: 'privacy_breach',
    description: 'Sensitive mental health data exposed',
    severity: 'major',
    likelihood: 'rare',
    riskLevel: 'unacceptable',
    mitigations: [
      'Zero-knowledge encryption (local only)',
      'No PII in server logs',
      'UK-only data residency (eu-west-2)',
      'Automatic data expiry',
    ],
    residualRisk: 'acceptable',
  },
  {
    id: 'HAZ-004',
    category: 'incorrect_assessment',
    description: 'AI misclassifies user cognitive/emotional state',
    severity: 'moderate',
    likelihood: 'possible',
    riskLevel: 'tolerable',
    mitigations: [
      'Conservative state classification thresholds',
      'User can override AI assessment',
      'Confidence scores displayed',
      'Gradual state transitions (no sudden shifts)',
    ],
    residualRisk: 'acceptable',
  },
  {
    id: 'HAZ-005',
    category: 'system_failure',
    description: 'App crashes during crisis moment',
    severity: 'major',
    likelihood: 'unlikely',
    riskLevel: 'unacceptable',
    mitigations: [
      'Offline-first architecture',
      'Critical features work without network',
      'Emergency numbers cached locally',
      'Graceful degradation design',
    ],
    residualRisk: 'tolerable',
  },
  {
    id: 'HAZ-006',
    category: 'accessibility_barrier',
    description: 'User cannot access help due to accessibility issues',
    severity: 'major',
    likelihood: 'possible',
    riskLevel: 'unacceptable',
    mitigations: [
      'WCAG 2.2 AA compliance',
      'Screen reader native support',
      'Voice-first interaction mode',
      'High contrast always available',
      'Minimum 18px touch targets',
    ],
    residualRisk: 'acceptable',
  },
];

// ============================================================================
// Banned Phrases & Patterns
// ============================================================================

const BANNED_PHRASES = [
  // Never minimize
  'just calm down',
  'just relax',
  'just breathe',
  'it\'s not that bad',
  'others have it worse',
  'snap out of it',
  'cheer up',
  'think positive',
  'get over it',
  
  // Never diagnose
  'you have depression',
  'you have anxiety',
  'you are bipolar',
  'you have ptsd',
  'you are mentally ill',
  
  // Never prescribe
  'you should take',
  'stop taking your',
  'you don\'t need medication',
  'try this supplement',
  
  // Never promise
  'this will definitely',
  'guaranteed to',
  'you will feel better',
  'this always works',
  
  // Never dismiss crisis
  'you\'re overreacting',
  'it\'s all in your head',
  'you\'re being dramatic',
];

const CRISIS_INDICATORS = [
  'want to die',
  'kill myself',
  'end my life',
  'suicide',
  'no point living',
  'better off dead',
  'hurt myself',
  'self harm',
  'cutting',
  'overdose',
  'can\'t go on',
  'give up',
  'end it all',
];

// ============================================================================
// Safety Filter Functions
// ============================================================================

export interface SafetyCheckResult {
  passed: boolean;
  modified: boolean;
  originalText?: string;
  safeText: string;
  blockedReasons: string[];
  hazardIds: string[];
  crisisDetected: boolean;
}

export function checkResponseSafety(text: string): SafetyCheckResult {
  const lowerText = text.toLowerCase();
  const blockedReasons: string[] = [];
  const hazardIds: string[] = [];
  let safeText = text;
  let modified = false;
  let crisisDetected = false;

  // Check for banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase)) {
      blockedReasons.push(`Contains banned phrase: "${phrase}"`);
      hazardIds.push('HAZ-001');
      // Remove or replace the phrase
      const regex = new RegExp(phrase, 'gi');
      safeText = safeText.replace(regex, '[removed for safety]');
      modified = true;
    }
  }

  // Check for crisis indicators (these should escalate, not block)
  for (const indicator of CRISIS_INDICATORS) {
    if (lowerText.includes(indicator)) {
      crisisDetected = true;
      hazardIds.push('HAZ-002');
      break;
    }
  }

  return {
    passed: blockedReasons.length === 0,
    modified,
    originalText: modified ? text : undefined,
    safeText,
    blockedReasons,
    hazardIds,
    crisisDetected,
  };
}

export function checkUserInputForCrisis(text: string): {
  isCrisis: boolean;
  indicators: string[];
  suggestedAction: 'sos' | 'support' | 'normal';
} {
  const lowerText = text.toLowerCase();
  const foundIndicators: string[] = [];

  for (const indicator of CRISIS_INDICATORS) {
    if (lowerText.includes(indicator)) {
      foundIndicators.push(indicator);
    }
  }

  if (foundIndicators.length >= 2) {
    return { isCrisis: true, indicators: foundIndicators, suggestedAction: 'sos' };
  } else if (foundIndicators.length === 1) {
    return { isCrisis: true, indicators: foundIndicators, suggestedAction: 'support' };
  }

  return { isCrisis: false, indicators: [], suggestedAction: 'normal' };
}

// ============================================================================
// Clinical Hazard Logger
// ============================================================================

class ClinicalHazardLogger {
  private logs: SafetyLogEntry[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 entries in memory
  private listeners: Set<(entry: SafetyLogEntry) => void> = new Set();

  log(entry: Omit<SafetyLogEntry, 'id' | 'timestamp'>): SafetyLogEntry {
    const fullEntry: SafetyLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.logs.push(fullEntry);
    
    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(fullEntry));

    // Console log for development
    if (entry.severity === 'major' || entry.severity === 'catastrophic') {
      console.warn('[ClinicalSafety] High severity event:', fullEntry);
    }

    return fullEntry;
  }

  logAIResponse(
    response: string,
    context: SafetyContext,
    safetyResult: SafetyCheckResult
  ): SafetyLogEntry {
    return this.log({
      eventType: 'ai_response',
      severity: safetyResult.crisisDetected ? 'major' : 
                safetyResult.passed ? 'negligible' : 'moderate',
      context: JSON.stringify(context),
      aiResponse: safetyResult.safeText,
      action: safetyResult.passed ? 'allowed' : 
              safetyResult.modified ? 'modified' : 'blocked',
      outcome: safetyResult.passed ? 'passed' : 
               safetyResult.modified ? 'modified' : 'blocked',
      hazardIds: safetyResult.hazardIds,
    });
  }

  logCrisisDetection(
    indicators: string[],
    context: SafetyContext,
    actionTaken: string
  ): SafetyLogEntry {
    return this.log({
      eventType: 'crisis_detected',
      severity: 'major',
      context: JSON.stringify(context),
      userState: `Crisis indicators: ${indicators.join(', ')}`,
      action: actionTaken,
      outcome: 'escalated',
      hazardIds: ['HAZ-002'],
    });
  }

  logStateTransition(
    from: string,
    to: string,
    trigger: string,
    context: SafetyContext
  ): SafetyLogEntry {
    return this.log({
      eventType: 'state_transition',
      severity: to === 'crisis' ? 'major' : 'negligible',
      context: JSON.stringify(context),
      userState: `${from} → ${to}`,
      action: `Triggered by: ${trigger}`,
      outcome: 'passed',
      hazardIds: [],
    });
  }

  logConsent(
    userId: string,
    consentType: ConsentType,
    granted: boolean
  ): SafetyLogEntry {
    return this.log({
      eventType: 'user_consent',
      severity: 'negligible',
      context: `User: ${userId.substring(0, 8)}...`,
      action: `${consentType}: ${granted ? 'granted' : 'revoked'}`,
      outcome: 'passed',
      hazardIds: [],
    });
  }

  // === Query Methods ===

  getRecentLogs(count: number = 50): SafetyLogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByHazard(hazardId: string): SafetyLogEntry[] {
    return this.logs.filter(log => log.hazardIds.includes(hazardId));
  }

  getLogsBySeverity(severity: HazardSeverity): SafetyLogEntry[] {
    return this.logs.filter(log => log.severity === severity);
  }

  getCrisisLogs(): SafetyLogEntry[] {
    return this.logs.filter(log => log.eventType === 'crisis_detected');
  }

  // === Export for Audit ===

  exportForAudit(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      logCount: this.logs.length,
      logs: this.logs,
      hazardRegistry: CLINICAL_HAZARDS,
    }, null, 2);
  }

  // === Subscription ===

  subscribe(listener: (entry: SafetyLogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private generateId(): string {
    return `SL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}

// ============================================================================
// Consent Manager
// ============================================================================

class ConsentManager {
  private consents: Map<string, ConsentRecord> = new Map();
  private readonly defaultVersion = '1.0.0';

  async getConsent(userId: string, type: ConsentType): Promise<boolean> {
    const key = `${userId}-${type}`;
    const record = this.consents.get(key);
    
    if (!record) return false;
    if (record.expiresAt && record.expiresAt < new Date()) return false;
    
    return record.granted;
  }

  async setConsent(
    userId: string,
    type: ConsentType,
    granted: boolean,
    scope: string[] = [],
    expiresInDays?: number
  ): Promise<ConsentRecord> {
    const key = `${userId}-${type}`;
    
    const record: ConsentRecord = {
      id: `CON-${Date.now()}`,
      userId,
      consentType: type,
      granted,
      timestamp: new Date(),
      expiresAt: expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined,
      scope,
      version: this.defaultVersion,
    };

    this.consents.set(key, record);
    
    // Log for audit trail
    getClinicalLogger().logConsent(userId, type, granted);
    
    return record;
  }

  async revokeAllConsents(userId: string): Promise<void> {
    const keys = Array.from(this.consents.keys())
      .filter(k => k.startsWith(userId));
    
    for (const key of keys) {
      this.consents.delete(key);
    }
  }

  async getConsentSummary(userId: string): Promise<Record<ConsentType, boolean>> {
    const types: ConsentType[] = [
      'data_collection',
      'biometric_processing',
      'ai_analysis',
      'anonymous_research',
      'third_party_sharing',
      'crisis_escalation',
    ];

    const summary: Record<ConsentType, boolean> = {} as Record<ConsentType, boolean>;
    
    for (const type of types) {
      summary[type] = await this.getConsent(userId, type);
    }

    return summary;
  }
}

// ============================================================================
// Model Transparency Generator
// ============================================================================

export interface TransparencyExplanation {
  decision: string;
  factors: TransparencyFactor[];
  confidence: number;
  hazardsConsidered: string[];
  dataUsed: string[];
  alternatives: string[];
}

export interface TransparencyFactor {
  name: string;
  value: string;
  weight: number;  // 0-1, how much this influenced the decision
  source: 'biometric' | 'interaction' | 'history' | 'time' | 'pattern';
}

export function generateTransparencyExplanation(
  decision: string,
  factors: Partial<TransparencyFactor>[],
  confidence: number
): TransparencyExplanation {
  const fullFactors: TransparencyFactor[] = factors.map(f => ({
    name: f.name || 'Unknown',
    value: f.value || '',
    weight: f.weight || 0.5,
    source: f.source || 'pattern',
  }));

  // Sort by weight (most influential first)
  fullFactors.sort((a, b) => b.weight - a.weight);

  const dataUsed = fullFactors.map(f => {
    switch (f.source) {
      case 'biometric': return 'Wearable data';
      case 'interaction': return 'App interaction patterns';
      case 'history': return 'Your past preferences';
      case 'time': return 'Time of day';
      case 'pattern': return 'Behavioral patterns';
    }
  });

  return {
    decision,
    factors: fullFactors,
    confidence,
    hazardsConsidered: ['HAZ-001', 'HAZ-004'], // Always consider these
    dataUsed: [...new Set(dataUsed)],
    alternatives: generateAlternatives(decision),
  };
}

function generateAlternatives(decision: string): string[] {
  // Provide user with alternatives to AI suggestion
  return [
    'Try a different technique',
    'Speak to a real person',
    'Take a break from the app',
    'Adjust your preferences',
  ];
}

// ============================================================================
// Singleton Instances
// ============================================================================

let clinicalLogger: ClinicalHazardLogger | null = null;
let consentManager: ConsentManager | null = null;

export function getClinicalLogger(): ClinicalHazardLogger {
  if (!clinicalLogger) {
    clinicalLogger = new ClinicalHazardLogger();
  }
  return clinicalLogger;
}

export function getConsentManager(): ConsentManager {
  if (!consentManager) {
    consentManager = new ConsentManager();
  }
  return consentManager;
}

// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useClinicalSafety() {
  const [recentLogs, setRecentLogs] = useState<SafetyLogEntry[]>([]);
  const logger = getClinicalLogger();
  const consent = getConsentManager();

  useEffect(() => {
    // Get initial logs - defer to avoid synchronous setState in effect
    const timeout = setTimeout(() => {
      setRecentLogs(logger.getRecentLogs(20));
    }, 0);

    // Subscribe to new logs
    const unsubscribe = logger.subscribe((entry) => {
      setRecentLogs(prev => [...prev.slice(-19), entry]);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [logger]);

  const checkSafety = useCallback((text: string) => {
    return checkResponseSafety(text);
  }, []);

  const checkCrisis = useCallback((text: string) => {
    return checkUserInputForCrisis(text);
  }, []);

  const setUserConsent = useCallback(async (
    userId: string,
    type: ConsentType,
    granted: boolean
  ) => {
    return consent.setConsent(userId, type, granted);
  }, [consent]);

  const getConsentSummary = useCallback(async (userId: string) => {
    return consent.getConsentSummary(userId);
  }, [consent]);

  return {
    recentLogs,
    hazards: CLINICAL_HAZARDS,
    checkSafety,
    checkCrisis,
    setUserConsent,
    getConsentSummary,
    exportAuditLog: () => logger.exportForAudit(),
  };
}
