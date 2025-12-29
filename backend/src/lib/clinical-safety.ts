/**
 * Silent Help Backend - Clinical Safety Framework
 * DCB0129 Compliant Clinical Hazard Management (Server-Side)
 * 
 * Mirrors frontend clinical safety but for API responses
 */

// ============================================================================
// Types
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

export interface SafetyContext {
  userState: string;
  cognitiveLoad: string;
  recentActions: string[];
  timeOfDay: string;
  sessionDuration: number;
}

export interface SafetyLogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  severity: string;
  context: string;
  action: string;
  outcome: string;
  hazardIds: string[];
}

// ============================================================================
// Banned Phrases & Patterns
// ============================================================================

const BANNED_PHRASES = [
  'just calm down', 'just relax', 'just breathe', "it's not that bad",
  'others have it worse', 'snap out of it', 'cheer up', 'think positive',
  'get over it', 'you have depression', 'you have anxiety', 'you are bipolar',
  'you should take', 'stop taking your', "you don't need medication",
  "you're overreacting", "it's all in your head", "you're being dramatic",
];

const CRISIS_INDICATORS = [
  'want to die', 'kill myself', 'end my life', 'suicide', 'no point living',
  'better off dead', 'hurt myself', 'self harm', 'cutting', 'overdose',
  "can't go on", 'give up', 'end it all',
];

// ============================================================================
// Safety Check Functions
// ============================================================================

export function checkResponseSafety(text: string): SafetyCheckResult {
  const lowerText = text.toLowerCase();
  const blockedReasons: string[] = [];
  const hazardIds: string[] = [];
  let safeText = text;
  let modified = false;
  let crisisDetected = false;

  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase)) {
      blockedReasons.push(`Contains banned phrase: "${phrase}"`);
      hazardIds.push('HAZ-001');
      const regex = new RegExp(phrase, 'gi');
      safeText = safeText.replace(regex, '[removed for safety]');
      modified = true;
    }
  }

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
// Clinical Logger (Simplified for Backend)
// ============================================================================

class ClinicalHazardLogger {
  private logs: SafetyLogEntry[] = [];

  log(entry: Omit<SafetyLogEntry, 'id' | 'timestamp'>): SafetyLogEntry {
    const fullEntry: SafetyLogEntry = {
      ...entry,
      id: `SL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date(),
    };

    this.logs.push(fullEntry);
    
    if (entry.severity === 'major' || entry.severity === 'catastrophic') {
      console.warn('[ClinicalSafety] High severity event:', fullEntry);
    }

    return fullEntry;
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
      action: actionTaken,
      outcome: 'escalated',
      hazardIds: ['HAZ-002'],
    });
  }
}

let clinicalLogger: ClinicalHazardLogger | null = null;

export function getClinicalLogger(): ClinicalHazardLogger {
  if (!clinicalLogger) {
    clinicalLogger = new ClinicalHazardLogger();
  }
  return clinicalLogger;
}
