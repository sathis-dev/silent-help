/**
 * SOS Route - Edge Optimized
 * 
 * This route serves the HIGH pathway content with minimal latency.
 * Pre-rendered crisis resources - no database calls required.
 * 
 * Target: <1.5 seconds from app launch
 */

import { NextResponse } from 'next/server';

// Edge runtime for fastest cold starts
export const runtime = 'edge';
export const revalidate = 3600; // Revalidate every hour

// Pre-rendered UK crisis resources - no API calls needed
const UK_CRISIS_RESOURCES = {
  emergency: {
    number: '999',
    name: 'Emergency Services',
    description: 'For immediate danger to life',
    type: 'call',
  },
  nhs111: {
    number: '111',
    name: 'NHS 111',
    description: 'Urgent medical help when not life-threatening',
    type: 'call',
  },
  samaritans: {
    number: '116 123',
    name: 'Samaritans',
    description: 'Free 24/7 emotional support',
    email: 'jo@samaritans.org',
    type: 'call',
  },
  shout: {
    number: '85258',
    name: 'Shout',
    description: 'Free text support - text SHOUT',
    type: 'text',
  },
  papyrus: {
    number: '0800 068 4141',
    name: 'PAPYRUS',
    description: 'Support for young people under 35',
    type: 'call',
  },
  calm: {
    number: '0800 58 58 58',
    name: 'CALM',
    description: 'Support for men, 5pm-midnight',
    type: 'call',
  },
  mind: {
    number: '0300 123 3393',
    name: 'Mind Infoline',
    description: 'Mental health information and support',
    type: 'call',
  },
};

// Pre-rendered breathing exercise
const CALM_BREATH = {
  name: 'Calm Breath',
  description: 'A simple pattern to slow your breathing',
  inhaleSeconds: 4,
  holdSeconds: 4,
  exhaleSeconds: 6,
  cycles: 3,
  totalDuration: 42,
};

// Pre-rendered safety message (no AI, deterministic)
const SAFETY_MESSAGE = {
  title: 'You are not alone',
  message: 'Support is here whenever you need it. These resources are free and available 24/7.',
  tone: 'calm',
};

export async function GET() {
  return NextResponse.json({
    pathway: 'HIGH',
    name: 'SOS Mode',
    description: 'Immediate support when you need it most',
    allowsAI: false,
    resources: UK_CRISIS_RESOURCES,
    breathingExercise: CALM_BREATH,
    safetyMessage: SAFETY_MESSAGE,
    // Cache headers for edge caching
    cacheControl: 'public, max-age=3600, stale-while-revalidate=86400',
  }, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=3600',
    },
  });
}
