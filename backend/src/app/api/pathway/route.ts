/**
 * Pathway Router API
 * 
 * Manages the Three-Tier Engine state transitions.
 * Returns appropriate UI configuration and tools for each pathway.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getPathwayConfig, 
  getAllPathways,
  suggestPathway,
  shouldChangePathway,
  getPathwayTransition,
  getToolRecommendations,
  type PathwayIndicators
} from '@/lib/contextual-router';
import type { StressPathway } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET: Get current pathway and configuration
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pathway = searchParams.get('pathway') as StressPathway | null;
    
    // If specific pathway requested, return its config
    if (pathway) {
      const config = getPathwayConfig(pathway);
      return NextResponse.json({
        success: true,
        pathway: config,
      });
    }
    
    // If userId provided, get user's current pathway
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          currentPathway: true,
          lastPathwayChange: true,
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get tool recommendations based on user history
      const toolLogs = await prisma.toolUsageLog.findMany({
        where: { userId },
        orderBy: { successRate: 'desc' },
        take: 5,
      });
      
      const config = getPathwayConfig(user.currentPathway);
      const recommendations = getToolRecommendations(
        user.currentPathway,
        undefined,
        toolLogs.map(t => ({
          toolName: t.toolName,
          successRate: t.successRate || 0,
          avgDuration: t.totalDurationSeconds / t.usageCount,
        }))
      );
      
      return NextResponse.json({
        success: true,
        currentPathway: user.currentPathway,
        lastChange: user.lastPathwayChange,
        config,
        recommendations,
      });
    }
    
    // Return all pathways overview
    const pathways = getAllPathways();
    return NextResponse.json({
      success: true,
      pathways: pathways.map(p => ({
        id: p.pathway,
        name: p.name,
        description: p.description,
        allowsAI: p.allowsAI,
      })),
    });
    
  } catch (error) {
    console.error('Pathway GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get pathway' },
      { status: 500 }
    );
  }
}

// POST: Update pathway or get suggestion
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, action, intensity, indicators } = body as {
      userId: string;
      action: 'suggest' | 'set' | 'escalate';
      intensity?: number;
      indicators?: PathwayIndicators;
      pathway?: StressPathway;
    };
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentPathway: true,
        lastPathwayChange: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Handle suggestion request
    if (action === 'suggest') {
      const pathwayIndicators: PathwayIndicators = {
        userReportedIntensity: intensity,
        ...indicators,
      };
      
      const suggested = suggestPathway(pathwayIndicators);
      const shouldChange = shouldChangePathway(
        user.currentPathway,
        suggested,
        user.lastPathwayChange
      );
      
      const transition = shouldChange 
        ? getPathwayTransition(user.currentPathway, suggested)
        : null;
      
      return NextResponse.json({
        success: true,
        currentPathway: user.currentPathway,
        suggestedPathway: suggested,
        shouldTransition: shouldChange,
        transition,
        config: shouldChange ? getPathwayConfig(suggested) : getPathwayConfig(user.currentPathway),
      });
    }
    
    // Handle escalate (immediate switch to HIGH)
    if (action === 'escalate') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentPathway: 'HIGH',
          lastPathwayChange: new Date(),
        },
      });
      
      const transition = getPathwayTransition(user.currentPathway, 'HIGH');
      const config = getPathwayConfig('HIGH');
      
      return NextResponse.json({
        success: true,
        previousPathway: user.currentPathway,
        currentPathway: 'HIGH',
        transition,
        config,
      });
    }
    
    // Handle set (explicit pathway change)
    if (action === 'set' && body.pathway) {
      const newPathway = body.pathway as StressPathway;
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentPathway: newPathway,
          lastPathwayChange: new Date(),
        },
      });
      
      const transition = getPathwayTransition(user.currentPathway, newPathway);
      const config = getPathwayConfig(newPathway);
      
      return NextResponse.json({
        success: true,
        previousPathway: user.currentPathway,
        currentPathway: newPathway,
        transition,
        config,
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Pathway POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pathway' },
      { status: 500 }
    );
  }
}
