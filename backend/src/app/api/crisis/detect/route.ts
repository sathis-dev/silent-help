/**
 * Crisis Detection API Route
 * 
 * Implements the dual-gate safety system:
 * 1. Regex/Keyword Gate (instant)
 * 2. LLM Intent Classifier (when needed)
 * 
 * Edge-optimized for <1.5 second response time.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  performSafetyCheck, 
  keywordSafetyCheck,
  generateClinicalSafetyCard,
  logHazardEvent,
  UK_CRISIS_RESOURCES
} from '@/lib/safety-guardrails';
import { scrubPII } from '@/lib/pii-scrubber';
import { prisma } from '@/lib/prisma';

// Edge runtime for fastest cold starts
export const runtime = 'nodejs'; // Use nodejs for Prisma compatibility
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

interface CrisisDetectRequest {
  text: string;
  userId?: string;
  quickCheck?: boolean; // Only run keyword gate (faster)
}

interface CrisisDetectResponse {
  safe: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'continue' | 'show_resources' | 'show_safety_card' | 'kill_session';
  safetyCard?: {
    title: string;
    message: string;
    tone: string;
    primaryResource: {
      name: string;
      number: string;
      description: string;
    };
    additionalResources: Array<{
      name: string;
      number: string;
      description: string;
    }>;
    selfCareOptions: string[];
  };
  resources?: Array<{
    name: string;
    number: string;
    description: string;
  }>;
  timestamp: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CrisisDetectResponse>> {
  const startTime = Date.now();
  
  try {
    const body: CrisisDetectRequest = await request.json();
    const { text, userId, quickCheck } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        safe: true,
        severity: 'LOW',
        action: 'continue',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Scrub PII from the text before processing
    const { scrubbedText, isHighRisk: piiHighRisk } = scrubPII(text);
    
    // Run safety check
    let safetyResult;
    
    if (quickCheck) {
      // Quick check: Only keyword gate (no API calls)
      safetyResult = keywordSafetyCheck(scrubbedText);
    } else {
      // Full check: Dual-gate system
      safetyResult = await performSafetyCheck(scrubbedText);
    }
    
    // Log hazard event if triggered
    if (!safetyResult.isSafe && userId) {
      await logHazardEvent(userId, safetyResult);
    }
    
    // Build response
    const response: CrisisDetectResponse = {
      safe: safetyResult.isSafe,
      severity: safetyResult.severity,
      action: determineAction(safetyResult),
      timestamp: new Date().toISOString(),
    };
    
    // Add safety card if required
    if (safetyResult.clinicalCardRequired) {
      const card = generateClinicalSafetyCard(safetyResult);
      response.safetyCard = {
        title: card.title,
        message: card.message,
        tone: card.tone,
        primaryResource: {
          name: card.primaryResource.name,
          number: card.primaryResource.number,
          description: card.primaryResource.description,
        },
        additionalResources: card.additionalResources.map(r => ({
          name: r.name,
          number: r.number,
          description: r.description,
        })),
        selfCareOptions: card.selfCareOptions,
      };
    }
    
    // Add resources if recommended (even for safe messages)
    if (safetyResult.recommendedResources.length > 0 && !response.safetyCard) {
      response.resources = safetyResult.recommendedResources.map(r => ({
        name: r.name,
        number: r.number,
        description: r.description,
      }));
    }
    
    // Log response time for monitoring
    const responseTime = Date.now() - startTime;
    if (responseTime > 1500) {
      console.warn(`Crisis detection took ${responseTime}ms - exceeds 1.5s target`);
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Crisis detection error:', error);
    
    // On error, return safe with resources as precaution
    return NextResponse.json({
      safe: true,
      severity: 'LOW',
      action: 'show_resources',
      resources: [
        {
          name: UK_CRISIS_RESOURCES.samaritans.name,
          number: UK_CRISIS_RESOURCES.samaritans.number,
          description: UK_CRISIS_RESOURCES.samaritans.description,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  }
}

function determineAction(result: { isSafe: boolean; shouldKillSession: boolean; clinicalCardRequired: boolean }): 
  'continue' | 'show_resources' | 'show_safety_card' | 'kill_session' {
  
  if (result.shouldKillSession) {
    return 'kill_session';
  }
  
  if (result.clinicalCardRequired) {
    return 'show_safety_card';
  }
  
  if (!result.isSafe) {
    return 'show_resources';
  }
  
  return 'continue';
}

// GET method for health check
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'crisis-detection',
    timestamp: new Date().toISOString(),
  });
}
