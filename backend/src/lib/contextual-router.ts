/**
 * Contextual Router - The Three-Tier Engine
 * 
 * The entire application state revolves around these three modes:
 * 
 * HIGH (Priority Zero):
 *   - Context: Panic, acute anxiety, crisis
 *   - Guidance: Zero Generative AI. Deterministic responses only.
 *   - UX: Large-scale UI (Fitts's Law), interactive haptics
 *   - Features: One-tap access to UK crisis lines (999, 111, Samaritans)
 *   - Tech: Pre-rendered SVGs, lightweight CSS animations. No API calls.
 * 
 * MID (The Bridge):
 *   - Context: Overwhelmed, "stuck," brain fog
 *   - Guidance: Guided labels, Body Scan interface
 *   - Features: Help user name the feeling, provide 3 specific actions
 *   - Actions: 5-4-3-2-1 Grounding, Write one sentence, Cold water splash
 * 
 * LOW (Maintenance):
 *   - Context: Calm, reflective, "maintenance" mode
 *   - Guidance: Semantic Journal lives here
 *   - Features: Subtle AI reflection, pattern recognition across 30 days
 *   - AI: Connects patterns, not just summarizes
 */

import type { StressPathway } from '@prisma/client';

// ============================================================================
// PATHWAY DEFINITIONS
// ============================================================================

export interface PathwayConfig {
  pathway: StressPathway;
  name: string;
  description: string;
  allowsAI: boolean;
  uiScale: 'large' | 'medium' | 'normal';
  hapticFeedback: boolean;
  animationLevel: 'minimal' | 'standard' | 'rich';
  primaryActions: PathwayAction[];
  breathingExercise: BreathingExercise | null;
  groundingTechnique: GroundingTechnique | null;
}

export interface PathwayAction {
  id: string;
  label: string;
  description: string;
  type: 'crisis_contact' | 'breathing' | 'grounding' | 'journal' | 'body_scan' | 'action';
  priority: number;
  icon: string;
  color: string;
  tactileWeight: 'heavy' | 'medium' | 'light';
}

export interface BreathingExercise {
  name: string;
  description: string;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  cycles: number;
  totalDuration: number;
}

export interface GroundingTechnique {
  name: string;
  description: string;
  steps: string[];
  targetDuration: number;
}

// ============================================================================
// HIGH PATHWAY CONFIGURATION
// ============================================================================

const HIGH_PATHWAY: PathwayConfig = {
  pathway: 'HIGH',
  name: 'SOS Mode',
  description: 'Immediate support when you need it most',
  allowsAI: false, // Zero AI - deterministic only
  uiScale: 'large', // Fitts's Law - big touch targets
  hapticFeedback: true,
  animationLevel: 'minimal', // Reduce cognitive load
  
  primaryActions: [
    {
      id: 'call-999',
      label: 'Emergency',
      description: 'Call 999 for immediate danger',
      type: 'crisis_contact',
      priority: 1,
      icon: 'emergency',
      color: '#EF4444', // Red
      tactileWeight: 'heavy',
    },
    {
      id: 'call-samaritans',
      label: 'Samaritans',
      description: '116 123 - Free 24/7 support',
      type: 'crisis_contact',
      priority: 2,
      icon: 'phone',
      color: '#10B981', // Green
      tactileWeight: 'heavy',
    },
    {
      id: 'text-shout',
      label: 'Text SHOUT',
      description: 'Text SHOUT to 85258',
      type: 'crisis_contact',
      priority: 3,
      icon: 'message',
      color: '#3B82F6', // Blue
      tactileWeight: 'heavy',
    },
    {
      id: 'call-111',
      label: 'NHS 111',
      description: 'Urgent but not emergency',
      type: 'crisis_contact',
      priority: 4,
      icon: 'medical',
      color: '#0EA5E9', // Light blue
      tactileWeight: 'medium',
    },
    {
      id: 'breathing-sos',
      label: 'Breathe',
      description: 'Simple breathing to calm',
      type: 'breathing',
      priority: 5,
      icon: 'wind',
      color: '#14B8A6', // Teal
      tactileWeight: 'medium',
    },
  ],
  
  breathingExercise: {
    name: 'Calm Breath',
    description: 'A simple pattern to slow your breathing',
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 6,
    cycles: 3,
    totalDuration: 42, // Under 60 seconds target
  },
  
  groundingTechnique: null, // Too complex for HIGH state
};

// ============================================================================
// MID PATHWAY CONFIGURATION
// ============================================================================

const MID_PATHWAY: PathwayConfig = {
  pathway: 'MID',
  name: 'Bridge Mode',
  description: 'Tools to help when you feel stuck',
  allowsAI: false, // Limited AI - guided labels only
  uiScale: 'medium',
  hapticFeedback: true,
  animationLevel: 'standard',
  
  primaryActions: [
    {
      id: 'grounding-54321',
      label: '5-4-3-2-1',
      description: 'Ground yourself in the present',
      type: 'grounding',
      priority: 1,
      icon: 'hand',
      color: '#8B5CF6', // Purple
      tactileWeight: 'medium',
    },
    {
      id: 'body-scan',
      label: 'Body Scan',
      description: 'Notice where you feel tension',
      type: 'body_scan',
      priority: 2,
      icon: 'body',
      color: '#F59E0B', // Amber
      tactileWeight: 'medium',
    },
    {
      id: 'box-breathing',
      label: 'Box Breathing',
      description: 'A calming breathing technique',
      type: 'breathing',
      priority: 3,
      icon: 'square',
      color: '#14B8A6', // Teal
      tactileWeight: 'medium',
    },
    {
      id: 'cold-water',
      label: 'Cold Water',
      description: 'Reset with cold water splash',
      type: 'action',
      priority: 4,
      icon: 'droplet',
      color: '#0EA5E9', // Light blue
      tactileWeight: 'light',
    },
    {
      id: 'write-sentence',
      label: 'One Sentence',
      description: 'Write just one thought',
      type: 'journal',
      priority: 5,
      icon: 'edit',
      color: '#10B981', // Green
      tactileWeight: 'light',
    },
    {
      id: 'call-support',
      label: 'Talk to Someone',
      description: 'Contact Samaritans or SHOUT',
      type: 'crisis_contact',
      priority: 6,
      icon: 'phone',
      color: '#6366F1', // Indigo
      tactileWeight: 'medium',
    },
  ],
  
  breathingExercise: {
    name: 'Box Breathing',
    description: 'Square breathing to restore calm',
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 4,
    cycles: 4,
    totalDuration: 64,
  },
  
  groundingTechnique: {
    name: '5-4-3-2-1 Grounding',
    description: 'Engage your senses to anchor yourself',
    steps: [
      'Notice 5 things you can SEE around you',
      'Notice 4 things you can TOUCH or feel',
      'Notice 3 things you can HEAR',
      'Notice 2 things you can SMELL',
      'Notice 1 thing you can TASTE',
    ],
    targetDuration: 180, // 3 minutes
  },
};

// ============================================================================
// LOW PATHWAY CONFIGURATION
// ============================================================================

const LOW_PATHWAY: PathwayConfig = {
  pathway: 'LOW',
  name: 'Reflect Mode',
  description: 'Space for reflection and growth',
  allowsAI: true, // Full AI capabilities for journaling
  uiScale: 'normal',
  hapticFeedback: false,
  animationLevel: 'rich',
  
  primaryActions: [
    {
      id: 'journal',
      label: 'Journal',
      description: 'Write freely about your thoughts',
      type: 'journal',
      priority: 1,
      icon: 'book',
      color: '#10B981', // Green
      tactileWeight: 'light',
    },
    {
      id: 'patterns',
      label: 'My Patterns',
      description: 'See what helps you over time',
      type: 'action',
      priority: 2,
      icon: 'chart',
      color: '#8B5CF6', // Purple
      tactileWeight: 'light',
    },
    {
      id: 'body-scan-gentle',
      label: 'Body Check-in',
      description: 'A gentle awareness practice',
      type: 'body_scan',
      priority: 3,
      icon: 'body',
      color: '#F59E0B', // Amber
      tactileWeight: 'light',
    },
    {
      id: 'breathing-extended',
      label: 'Deep Breathing',
      description: 'Extended relaxation practice',
      type: 'breathing',
      priority: 4,
      icon: 'wind',
      color: '#14B8A6', // Teal
      tactileWeight: 'light',
    },
    {
      id: 'gratitude',
      label: 'Gratitude',
      description: 'Note something positive',
      type: 'journal',
      priority: 5,
      icon: 'heart',
      color: '#EC4899', // Pink
      tactileWeight: 'light',
    },
  ],
  
  breathingExercise: {
    name: '4-7-8 Relaxation',
    description: 'A deeper practice for relaxation',
    inhaleSeconds: 4,
    holdSeconds: 7,
    exhaleSeconds: 8,
    cycles: 4,
    totalDuration: 76,
  },
  
  groundingTechnique: {
    name: 'Mindful Check-in',
    description: 'A gentle body and mind awareness practice',
    steps: [
      'Close your eyes if comfortable',
      'Take three slow, deep breaths',
      'Notice any tension in your body',
      'Acknowledge your thoughts without judgment',
      'Set an intention for this moment',
    ],
    targetDuration: 300, // 5 minutes
  },
};

// ============================================================================
// PATHWAY ROUTING
// ============================================================================

const PATHWAY_CONFIGS: Record<StressPathway, PathwayConfig> = {
  HIGH: HIGH_PATHWAY,
  MID: MID_PATHWAY,
  LOW: LOW_PATHWAY,
};

/**
 * Gets the configuration for a specific pathway.
 */
export function getPathwayConfig(pathway: StressPathway): PathwayConfig {
  return PATHWAY_CONFIGS[pathway];
}

/**
 * Gets all pathway configurations.
 */
export function getAllPathways(): PathwayConfig[] {
  return [HIGH_PATHWAY, MID_PATHWAY, LOW_PATHWAY];
}

// ============================================================================
// PATHWAY DETECTION
// ============================================================================

export interface PathwayIndicators {
  heartRateElevated?: boolean;
  respirationRapid?: boolean;
  userReportedIntensity?: number; // 1-10
  recentCrisisHistory?: boolean;
  timeOfDay?: string;
  sessionDuration?: number;
  interactionPattern?: 'frantic' | 'slow' | 'normal';
}

/**
 * Suggests a pathway based on various indicators.
 * Used for automatic pathway detection/recommendation.
 */
export function suggestPathway(indicators: PathwayIndicators): StressPathway {
  // Crisis indicators -> HIGH
  if (indicators.recentCrisisHistory) {
    return 'HIGH';
  }
  
  // High intensity -> HIGH
  if (indicators.userReportedIntensity && indicators.userReportedIntensity >= 8) {
    return 'HIGH';
  }
  
  // Medium intensity or frantic interaction -> MID
  if (indicators.userReportedIntensity && indicators.userReportedIntensity >= 5) {
    return 'MID';
  }
  
  if (indicators.interactionPattern === 'frantic') {
    return 'MID';
  }
  
  // Default to LOW
  return 'LOW';
}

/**
 * Determines if a pathway change is appropriate.
 * Includes cooldown logic to prevent rapid switching.
 */
export function shouldChangePathway(
  currentPathway: StressPathway,
  suggestedPathway: StressPathway,
  lastChange: Date,
  minimumCooldownMs: number = 30000 // 30 seconds default
): boolean {
  // Always allow escalation to HIGH
  if (suggestedPathway === 'HIGH' && currentPathway !== 'HIGH') {
    return true;
  }
  
  // Check cooldown for other changes
  const timeSinceLastChange = Date.now() - lastChange.getTime();
  if (timeSinceLastChange < minimumCooldownMs) {
    return false;
  }
  
  // Allow change if different
  return currentPathway !== suggestedPathway;
}

// ============================================================================
// PATHWAY TRANSITIONS
// ============================================================================

export interface PathwayTransition {
  from: StressPathway;
  to: StressPathway;
  message: string;
  transitionDuration: number; // ms
}

/**
 * Gets appropriate transition messaging when changing pathways.
 * Tone is always calm and grounded.
 */
export function getPathwayTransition(from: StressPathway, to: StressPathway): PathwayTransition {
  if (from === 'HIGH' && to === 'MID') {
    return {
      from,
      to,
      message: 'You seem a bit calmer. Taking it one step at a time.',
      transitionDuration: 500,
    };
  }
  
  if (from === 'MID' && to === 'LOW') {
    return {
      from,
      to,
      message: 'You\'re doing well. Space to reflect if you\'d like.',
      transitionDuration: 500,
    };
  }
  
  if (from === 'LOW' && to === 'MID') {
    return {
      from,
      to,
      message: 'Here when you need some extra support.',
      transitionDuration: 300,
    };
  }
  
  if ((from === 'LOW' || from === 'MID') && to === 'HIGH') {
    return {
      from,
      to,
      message: 'Support is right here.',
      transitionDuration: 200, // Faster for escalation
    };
  }
  
  return {
    from,
    to,
    message: '',
    transitionDuration: 300,
  };
}

// ============================================================================
// TOOL RECOMMENDATIONS
// ============================================================================

export interface ToolRecommendation {
  toolName: string;
  reason: string;
  historicalSuccess: number; // 0-1
  suggestedDuration: number; // seconds
}

/**
 * Recommends tools based on pathway and user history.
 * This is where the "don't just summarize, connect" logic lives.
 */
export function getToolRecommendations(
  pathway: StressPathway,
  triggerCategory?: string,
  historicalTools?: Array<{ toolName: string; successRate: number; avgDuration: number }>
): ToolRecommendation[] {
  const pathwayConfig = getPathwayConfig(pathway);
  const recommendations: ToolRecommendation[] = [];
  
  // First, check historical effectiveness
  if (historicalTools && historicalTools.length > 0) {
    const bestTool = historicalTools.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
    
    if (bestTool.successRate > 0.6) {
      recommendations.push({
        toolName: bestTool.toolName,
        reason: `This helped you before. You felt better in ${Math.round(bestTool.avgDuration / 60)} minutes last time.`,
        historicalSuccess: bestTool.successRate,
        suggestedDuration: bestTool.avgDuration,
      });
    }
  }
  
  // Add pathway-specific defaults
  if (pathway === 'HIGH' && pathwayConfig.breathingExercise) {
    recommendations.push({
      toolName: pathwayConfig.breathingExercise.name,
      reason: 'A simple breathing pattern to help right now.',
      historicalSuccess: 0.7, // Default effectiveness
      suggestedDuration: pathwayConfig.breathingExercise.totalDuration,
    });
  }
  
  if (pathway === 'MID') {
    if (pathwayConfig.groundingTechnique) {
      recommendations.push({
        toolName: pathwayConfig.groundingTechnique.name,
        reason: 'Engage your senses to feel more grounded.',
        historicalSuccess: 0.75,
        suggestedDuration: pathwayConfig.groundingTechnique.targetDuration,
      });
    }
    
    if (pathwayConfig.breathingExercise) {
      recommendations.push({
        toolName: pathwayConfig.breathingExercise.name,
        reason: 'A calming pattern to restore balance.',
        historicalSuccess: 0.7,
        suggestedDuration: pathwayConfig.breathingExercise.totalDuration,
      });
    }
  }
  
  return recommendations;
}
