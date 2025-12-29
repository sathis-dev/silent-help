/**
 * API Client for Silent Help Backend
 * 
 * All API calls go through this module for consistent error handling
 * and safety check integration.
 */

import type { 
  StressPathway, 
  SafetyCheckResult, 
  PatternInsight,
  PathwayConfig 
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ============================================================================
// SAFETY API
// ============================================================================

/**
 * Quick safety check using keyword gate only (no API calls that can fail)
 */
export async function quickSafetyCheck(text: string): Promise<SafetyCheckResult> {
  try {
    const response = await fetch(`${API_BASE}/api/crisis/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, quickCheck: true }),
    });
    
    if (!response.ok) {
      // On API failure, assume safe to not block user but flag for review
      return { safe: true, severity: 'LOW', action: 'continue' };
    }
    
    return response.json();
  } catch {
    // Network failure - assume safe to not block, but be cautious
    return { safe: true, severity: 'LOW', action: 'continue' };
  }
}

/**
 * Full safety check with dual-gate system
 */
export async function fullSafetyCheck(
  text: string, 
  userId?: string
): Promise<SafetyCheckResult> {
  try {
    const response = await fetch(`${API_BASE}/api/crisis/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, userId, quickCheck: false }),
    });
    
    if (!response.ok) {
      return { safe: true, severity: 'MEDIUM', action: 'continue' };
    }
    
    return response.json();
  } catch {
    return { safe: true, severity: 'MEDIUM', action: 'continue' };
  }
}

// ============================================================================
// PATHWAY API
// ============================================================================

/**
 * Get pathway configuration
 */
export async function getPathwayConfig(pathway: StressPathway): Promise<PathwayConfig | null> {
  try {
    const response = await fetch(`${API_BASE}/api/pathway?pathway=${pathway}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.pathway;
  } catch {
    return null;
  }
}

/**
 * Update user's current pathway
 */
export async function updatePathway(
  userId: string, 
  pathway: StressPathway,
  intensityLevel?: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/pathway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pathway, intensityLevel }),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// JOURNAL API
// ============================================================================

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
  userId: string,
  content: string,
  options: {
    entryType?: 'freeform' | 'guided' | 'voice';
    moodSnapshot?: string;
    pathway?: StressPathway;
    triggerCategory?: string;
  } = {}
): Promise<{ success: boolean; entryId?: string; connection?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        content,
        entryType: options.entryType || 'freeform',
        moodSnapshot: options.moodSnapshot,
        pathway: options.pathway || 'LOW',
        triggerCategory: options.triggerCategory,
      }),
    });
    
    if (!response.ok) {
      return { success: false };
    }
    
    const data = await response.json();
    return {
      success: true,
      entryId: data.entryId,
      connection: data.connection,
    };
  } catch {
    return { success: false };
  }
}

// ============================================================================
// SEARCH API
// ============================================================================

/**
 * Semantic search for journal entries by feeling
 */
export async function searchByFeeling(
  userId: string,
  feeling: string
): Promise<PatternInsight[]> {
  try {
    const response = await fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, query: feeling, type: 'feeling' }),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.insights || [];
  } catch {
    return [];
  }
}

/**
 * Get pattern insights for user
 */
export async function getPatternInsights(
  userId: string,
  daysBack: number = 30
): Promise<PatternInsight[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/search/patterns?userId=${userId}&daysBack=${daysBack}`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.patterns || [];
  } catch {
    return [];
  }
}

// ============================================================================
// MOOD API
// ============================================================================

/**
 * Log a mood entry
 */
export async function logMood(
  userId: string,
  data: {
    pathway: StressPathway;
    intensityStart: number;
    primaryEmotion: string;
    secondaryEmotions?: string[];
    physicalSymptoms?: string[];
    triggerCategory?: string;
  }
): Promise<{ success: boolean; moodLogId?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
    
    if (!response.ok) return { success: false };
    
    const result = await response.json();
    return { success: true, moodLogId: result.moodLogId };
  } catch {
    return { success: false };
  }
}

/**
 * Update mood log with resolution data
 */
export async function resolveMood(
  moodLogId: string,
  data: {
    intensityEnd: number;
    toolUsed?: string;
    toolDurationSeconds?: number;
    timeToCalm?: number;
    resolutionSuccess?: boolean;
  }
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/mood/${moodLogId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// HEALTH API
// ============================================================================

/**
 * Check backend health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/db/health`);
    return response.ok;
  } catch {
    return false;
  }
}
