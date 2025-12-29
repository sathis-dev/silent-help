/**
 * Mood Logging API
 * 
 * Tracks intensity_start and intensity_end to measure tool effectiveness.
 * Supports the "Resolution Efficiency" tracking mandate.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { StressPathway } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Validation schemas
const createMoodLogSchema = z.object({
  userId: z.string().uuid(),
  pathway: z.enum(['HIGH', 'MID', 'LOW']),
  intensityStart: z.number().min(1).max(10),
  primaryEmotion: z.string().min(1).max(50),
  secondaryEmotions: z.array(z.string()).optional().default([]),
  physicalSymptoms: z.array(z.string()).optional().default([]),
  triggerCategory: z.string().optional(),
  triggerDescription: z.string().optional(),
});

const updateMoodLogSchema = z.object({
  intensityEnd: z.number().min(1).max(10).optional(),
  toolUsed: z.string().optional(),
  toolDurationSeconds: z.number().optional(),
  resolutionSuccess: z.boolean().optional(),
});

// POST: Create new mood log
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = createMoodLogSchema.parse(body);
    
    const moodLog = await prisma.moodLog.create({
      data: {
        userId: validated.userId,
        pathway: validated.pathway as StressPathway,
        intensityStart: validated.intensityStart,
        primaryEmotion: validated.primaryEmotion,
        secondaryEmotions: validated.secondaryEmotions,
        physicalSymptoms: validated.physicalSymptoms,
        triggerCategory: validated.triggerCategory,
        triggerDescription: validated.triggerDescription,
      },
    });
    
    return NextResponse.json({
      success: true,
      moodLog: {
        id: moodLog.id,
        createdAt: moodLog.createdAt,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Create mood log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create mood log' },
      { status: 500 }
    );
  }
}

// PATCH: Update mood log with resolution data
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');
    
    if (!logId) {
      return NextResponse.json(
        { success: false, error: 'Log ID required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validated = updateMoodLogSchema.parse(body);
    
    // Get current log to calculate delta
    const currentLog = await prisma.moodLog.findUnique({
      where: { id: logId },
    });
    
    if (!currentLog) {
      return NextResponse.json(
        { success: false, error: 'Mood log not found' },
        { status: 404 }
      );
    }
    
    // Calculate intensity delta and time to calm
    const updateData: Record<string, unknown> = { ...validated };
    
    if (validated.intensityEnd !== undefined) {
      updateData.intensityDelta = currentLog.intensityStart - validated.intensityEnd;
      updateData.resolvedAt = new Date();
      
      // Calculate time to calm (50% reduction)
      const targetIntensity = currentLog.intensityStart * 0.5;
      if (validated.intensityEnd <= targetIntensity) {
        const timeToCalm = Math.round(
          (Date.now() - currentLog.createdAt.getTime()) / 1000
        );
        updateData.timeToCalm = timeToCalm;
      }
    }
    
    const updatedLog = await prisma.moodLog.update({
      where: { id: logId },
      data: updateData,
    });
    
    // Update tool usage statistics if tool was used
    if (validated.toolUsed) {
      await updateToolUsageStats(
        currentLog.userId,
        validated.toolUsed,
        currentLog.pathway,
        validated.toolDurationSeconds || 0,
        validated.resolutionSuccess || false,
        updateData.intensityDelta as number || 0
      );
    }
    
    return NextResponse.json({
      success: true,
      moodLog: {
        id: updatedLog.id,
        intensityStart: updatedLog.intensityStart,
        intensityEnd: updatedLog.intensityEnd,
        intensityDelta: updatedLog.intensityDelta,
        timeToCalm: updatedLog.timeToCalm,
        resolutionSuccess: updatedLog.resolutionSuccess,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Update mood log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update mood log' },
      { status: 500 }
    );
  }
}

// GET: Get mood logs with statistics
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const moodLogs = await prisma.moodLog.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    
    // Calculate statistics
    const stats = calculateMoodStats(moodLogs);
    
    return NextResponse.json({
      success: true,
      logs: moodLogs.map(log => ({
        id: log.id,
        pathway: log.pathway,
        intensityStart: log.intensityStart,
        intensityEnd: log.intensityEnd,
        intensityDelta: log.intensityDelta,
        primaryEmotion: log.primaryEmotion,
        toolUsed: log.toolUsed,
        timeToCalm: log.timeToCalm,
        resolutionSuccess: log.resolutionSuccess,
        createdAt: log.createdAt,
      })),
      statistics: stats,
    });
    
  } catch (error) {
    console.error('Get mood logs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get mood logs' },
      { status: 500 }
    );
  }
}

// Helper: Update tool usage statistics
async function updateToolUsageStats(
  userId: string,
  toolName: string,
  pathway: StressPathway,
  durationSeconds: number,
  success: boolean,
  intensityReduction: number
): Promise<void> {
  const existing = await prisma.toolUsageLog.findUnique({
    where: { userId_toolName: { userId, toolName } },
  });
  
  if (existing) {
    const newCount = existing.usageCount + 1;
    const newSuccessRate = ((existing.successRate || 0) * existing.usageCount + (success ? 1 : 0)) / newCount;
    const newAvgReduction = ((existing.averageIntensityReduction || 0) * existing.usageCount + intensityReduction) / newCount;
    
    await prisma.toolUsageLog.update({
      where: { id: existing.id },
      data: {
        usageCount: newCount,
        totalDurationSeconds: existing.totalDurationSeconds + durationSeconds,
        successRate: newSuccessRate,
        averageIntensityReduction: newAvgReduction,
        lastUsedAt: new Date(),
      },
    });
  } else {
    await prisma.toolUsageLog.create({
      data: {
        userId,
        toolName,
        pathway,
        usageCount: 1,
        totalDurationSeconds: durationSeconds,
        successRate: success ? 1.0 : 0.0,
        averageIntensityReduction: intensityReduction,
      },
    });
  }
}

// Helper: Calculate mood statistics
function calculateMoodStats(logs: Array<{
  intensityStart: number;
  intensityEnd: number | null;
  intensityDelta: number | null;
  timeToCalm: number | null;
  resolutionSuccess: boolean | null;
  primaryEmotion: string;
  triggerCategory: string | null;
}>) {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      averageStartIntensity: 0,
      averageReduction: 0,
      averageTimeToCalm: 0,
      successRate: 0,
      topEmotions: [],
      topTriggers: [],
    };
  }
  
  const avgStart = logs.reduce((sum, l) => sum + l.intensityStart, 0) / logs.length;
  
  const logsWithDelta = logs.filter(l => l.intensityDelta !== null);
  const avgReduction = logsWithDelta.length > 0
    ? logsWithDelta.reduce((sum, l) => sum + (l.intensityDelta || 0), 0) / logsWithDelta.length
    : 0;
  
  const logsWithTimeToCalm = logs.filter(l => l.timeToCalm !== null);
  const avgTimeToCalm = logsWithTimeToCalm.length > 0
    ? logsWithTimeToCalm.reduce((sum, l) => sum + (l.timeToCalm || 0), 0) / logsWithTimeToCalm.length
    : 0;
  
  const logsWithSuccess = logs.filter(l => l.resolutionSuccess !== null);
  const successRate = logsWithSuccess.length > 0
    ? logsWithSuccess.filter(l => l.resolutionSuccess).length / logsWithSuccess.length
    : 0;
  
  // Count emotions
  const emotionCounts: Record<string, number> = {};
  for (const log of logs) {
    emotionCounts[log.primaryEmotion] = (emotionCounts[log.primaryEmotion] || 0) + 1;
  }
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, count]) => ({ emotion, count }));
  
  // Count triggers
  const triggerCounts: Record<string, number> = {};
  for (const log of logs) {
    if (log.triggerCategory) {
      triggerCounts[log.triggerCategory] = (triggerCounts[log.triggerCategory] || 0) + 1;
    }
  }
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));
  
  return {
    totalLogs: logs.length,
    averageStartIntensity: Math.round(avgStart * 10) / 10,
    averageReduction: Math.round(avgReduction * 10) / 10,
    averageTimeToCalm: Math.round(avgTimeToCalm),
    successRate: Math.round(successRate * 100),
    topEmotions,
    topTriggers,
  };
}
