/**
 * Semantic Search Engine
 * 
 * Uses pgvector for finding patterns across journal entries.
 * The AI shouldn't just summarize; it should connect:
 * 
 * "You felt similar 3 days ago after the 'Work' trigger. 
 *  You used 'Box Breathing' then and felt better in 4 minutes. 
 *  Try it again?"
 */

import { prisma } from './prisma';
import type { StressPathway, JournalEntry, SemanticEmbedding, MoodLog } from '@prisma/client';
import { scrubPII } from './pii-scrubber';

// ============================================================================
// TYPES
// ============================================================================

export interface SemanticSearchResult {
  journalEntryId: string;
  similarity: number;
  createdAt: Date;
  dominantEmotion: string | null;
  themes: string[];
  triggers: string[];
  pathway: StressPathway;
}

export interface PatternInsight {
  type: 'trigger_pattern' | 'tool_effectiveness' | 'time_pattern' | 'emotional_cycle';
  title: string;
  description: string;
  confidence: number;
  actionSuggestion?: string;
  relatedEntries: string[];
  historicalData?: {
    previousOccurrence: Date;
    toolUsed?: string;
    recoveryTime?: number; // seconds
  };
}

export interface EmbeddingRequest {
  text: string;
  userId: string;
  journalEntryId?: string;
  emotion?: string;
  themes?: string[];
  triggers?: string[];
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generates an embedding vector for text using OpenAI's ada-002 model.
 * Text is PII-scrubbed before being sent to the API.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Scrub PII before sending to external API
    const { scrubbedText } = scrubPII(text, { preserveDates: true });
    
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: scrubbedText,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Stores an embedding in the database with metadata.
 */
export async function storeEmbedding(request: EmbeddingRequest): Promise<void> {
  const embedding = await generateEmbedding(request.text);
  
  // Convert embedding array to pgvector format
  const vectorString = `[${embedding.join(',')}]`;
  
  await prisma.$executeRaw`
    INSERT INTO semantic_embeddings (
      id, user_id, journal_entry_id, embedding, 
      dominant_emotion, themes, triggers, created_at, auto_delete_at
    ) VALUES (
      gen_random_uuid(),
      ${request.userId}::uuid,
      ${request.journalEntryId}::uuid,
      ${vectorString}::vector(1536),
      ${request.emotion},
      ${request.themes || []},
      ${request.triggers || []},
      NOW(),
      NOW() + INTERVAL '30 days'
    )
  `;
}

// ============================================================================
// SEMANTIC SEARCH
// ============================================================================

/**
 * Finds similar journal entries based on semantic meaning.
 * Uses cosine similarity via pgvector.
 */
export async function findSimilarEntries(
  userId: string,
  queryText: string,
  limit: number = 5,
  daysBack: number = 30
): Promise<SemanticSearchResult[]> {
  const queryEmbedding = await generateEmbedding(queryText);
  const vectorString = `[${queryEmbedding.join(',')}]`;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const results = await prisma.$queryRaw<SemanticSearchResult[]>`
    SELECT 
      se.journal_entry_id as "journalEntryId",
      1 - (se.embedding <=> ${vectorString}::vector(1536)) as similarity,
      se.created_at as "createdAt",
      se.dominant_emotion as "dominantEmotion",
      se.themes,
      se.triggers,
      je.pathway
    FROM semantic_embeddings se
    JOIN journal_entries je ON se.journal_entry_id = je.id
    WHERE se.user_id = ${userId}::uuid
      AND se.created_at >= ${cutoffDate}
      AND se.embedding IS NOT NULL
    ORDER BY se.embedding <=> ${vectorString}::vector(1536)
    LIMIT ${limit}
  `;
  
  return results.filter(r => r.similarity > 0.7); // Only return relevant matches
}

/**
 * Finds entries by emotional state rather than keywords.
 * "Find times I felt anxious" works even without the word "anxious".
 */
export async function findByFeeling(
  userId: string,
  feeling: string,
  limit: number = 5
): Promise<SemanticSearchResult[]> {
  // Create a rich query that captures the emotional essence
  const emotionalQuery = `I am feeling ${feeling}. ${getEmotionalContext(feeling)}`;
  
  return findSimilarEntries(userId, emotionalQuery, limit);
}

/**
 * Provides contextual words for emotional queries.
 */
function getEmotionalContext(feeling: string): string {
  const contexts: Record<string, string> = {
    anxious: 'Worried, nervous, on edge, can\'t relax, mind racing',
    sad: 'Down, low, tearful, hopeless, empty, heavy',
    angry: 'Frustrated, irritated, annoyed, furious, upset',
    stressed: 'Overwhelmed, too much, can\'t cope, pressure, tense',
    lonely: 'Isolated, alone, disconnected, nobody understands',
    happy: 'Content, joyful, pleased, good, positive, light',
    calm: 'Peaceful, relaxed, at ease, settled, grounded',
    scared: 'Afraid, frightened, terrified, panicked, fearful',
    confused: 'Lost, uncertain, don\'t know, unclear, foggy',
    tired: 'Exhausted, drained, no energy, fatigued, burnt out',
  };
  
  return contexts[feeling.toLowerCase()] || feeling;
}

// ============================================================================
// PATTERN RECOGNITION
// ============================================================================

/**
 * Analyzes patterns across the user's journal entries.
 * This is where the "connect, don't just summarize" magic happens.
 */
export async function findPatterns(userId: string, daysBack: number = 30): Promise<PatternInsight[]> {
  const insights: PatternInsight[] = [];
  
  // Get mood logs with tool effectiveness data
  const moodLogs = await prisma.moodLog.findMany({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  // Get tool usage statistics
  const toolUsageRaw = await prisma.toolUsageLog.findMany({
    where: { userId },
    orderBy: { successRate: 'desc' },
  });
  
  // Map to expected interface
  const toolUsage = toolUsageRaw.map(t => ({
    toolName: t.toolName,
    successRate: t.successRate,
    usageCount: t.usageCount,
    avgIntensityReduction: t.averageIntensityReduction,
  }));
  
  // Pattern 1: Trigger patterns
  const triggerPatterns = analyzeTriggerPatterns(moodLogs);
  insights.push(...triggerPatterns);
  
  // Pattern 2: Tool effectiveness
  const toolInsights = analyzeToolEffectiveness(toolUsage, moodLogs);
  insights.push(...toolInsights);
  
  // Pattern 3: Time-based patterns
  const timePatterns = analyzeTimePatterns(moodLogs);
  insights.push(...timePatterns);
  
  // Pattern 4: Emotional cycles
  const emotionalCycles = analyzeEmotionalCycles(moodLogs);
  insights.push(...emotionalCycles);
  
  return insights.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Analyzes recurring triggers across mood logs.
 */
function analyzeTriggerPatterns(moodLogs: MoodLog[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const triggerCounts: Record<string, { count: number; entries: string[]; avgIntensity: number }> = {};
  
  for (const log of moodLogs) {
    if (log.triggerCategory) {
      if (!triggerCounts[log.triggerCategory]) {
        triggerCounts[log.triggerCategory] = { count: 0, entries: [], avgIntensity: 0 };
      }
      triggerCounts[log.triggerCategory].count++;
      triggerCounts[log.triggerCategory].entries.push(log.id);
      triggerCounts[log.triggerCategory].avgIntensity += log.intensityStart;
    }
  }
  
  for (const [trigger, data] of Object.entries(triggerCounts)) {
    if (data.count >= 3) {
      const avgIntensity = data.avgIntensity / data.count;
      insights.push({
        type: 'trigger_pattern',
        title: `${trigger} affects you often`,
        description: `In the past 30 days, "${trigger}" has been a trigger ${data.count} times with an average intensity of ${avgIntensity.toFixed(1)}/10.`,
        confidence: Math.min(data.count / 10, 1),
        actionSuggestion: `Consider preparing a coping strategy specifically for ${trigger.toLowerCase()} situations.`,
        relatedEntries: data.entries.slice(0, 5),
      });
    }
  }
  
  return insights;
}

/**
 * Analyzes which tools work best for the user.
 */
function analyzeToolEffectiveness(
  toolUsage: Array<{ toolName: string; successRate: number | null; usageCount: number; avgIntensityReduction: number | null }>,
  moodLogs: MoodLog[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];
  
  // Find most effective tool
  const effectiveTools = toolUsage.filter(t => t.successRate && t.successRate > 0.6 && t.usageCount >= 3);
  
  if (effectiveTools.length > 0) {
    const bestTool = effectiveTools[0];
    const relatedLogs = moodLogs
      .filter(log => log.toolUsed === bestTool.toolName)
      .map(log => log.id);
    
    insights.push({
      type: 'tool_effectiveness',
      title: `${bestTool.toolName} works well for you`,
      description: `You've used ${bestTool.toolName} ${bestTool.usageCount} times with a ${Math.round((bestTool.successRate || 0) * 100)}% success rate.`,
      confidence: bestTool.successRate || 0,
      actionSuggestion: `When feeling overwhelmed, ${bestTool.toolName} has helped you before.`,
      relatedEntries: relatedLogs.slice(0, 5),
      historicalData: {
        previousOccurrence: new Date(), // Would come from actual data
        toolUsed: bestTool.toolName,
        recoveryTime: bestTool.avgIntensityReduction ? Math.round(bestTool.avgIntensityReduction * 60) : undefined,
      },
    });
  }
  
  return insights;
}

/**
 * Analyzes patterns based on time of day/week.
 */
function analyzeTimePatterns(moodLogs: MoodLog[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const hourCounts: Record<number, { count: number; totalIntensity: number }> = {};
  
  for (const log of moodLogs) {
    const hour = log.createdAt.getHours();
    if (!hourCounts[hour]) {
      hourCounts[hour] = { count: 0, totalIntensity: 0 };
    }
    hourCounts[hour].count++;
    hourCounts[hour].totalIntensity += log.intensityStart;
  }
  
  // Find peak stress times
  let peakHour = -1;
  let maxAvg = 0;
  
  for (const [hour, data] of Object.entries(hourCounts)) {
    const avg = data.totalIntensity / data.count;
    if (avg > maxAvg && data.count >= 3) {
      maxAvg = avg;
      peakHour = parseInt(hour);
    }
  }
  
  if (peakHour >= 0 && maxAvg >= 6) {
    const timeLabel = peakHour < 12 ? `${peakHour}am` : `${peakHour - 12}pm`;
    insights.push({
      type: 'time_pattern',
      title: `Stress peaks around ${timeLabel}`,
      description: `You tend to feel more stressed around ${timeLabel}. Consider scheduling a brief check-in or breathing exercise at this time.`,
      confidence: Math.min(hourCounts[peakHour].count / 5, 1),
      actionSuggestion: `Set a gentle reminder for ${timeLabel} to check in with yourself.`,
      relatedEntries: [],
    });
  }
  
  return insights;
}

/**
 * Analyzes emotional cycles and recovery patterns.
 */
function analyzeEmotionalCycles(moodLogs: MoodLog[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  
  // Calculate average recovery (when we have start and end intensity)
  const logsWithRecovery = moodLogs.filter(log => 
    log.intensityEnd !== null && log.intensityDelta !== null
  );
  
  if (logsWithRecovery.length >= 5) {
    const avgDelta = logsWithRecovery.reduce((sum, log) => 
      sum + (log.intensityDelta || 0), 0
    ) / logsWithRecovery.length;
    
    const avgRecoveryTime = logsWithRecovery
      .filter(log => log.timeToCalm)
      .reduce((sum, log) => sum + (log.timeToCalm || 0), 0) / logsWithRecovery.length;
    
    if (avgDelta > 0) {
      insights.push({
        type: 'emotional_cycle',
        title: 'Your techniques are helping',
        description: `On average, your stress decreases by ${avgDelta.toFixed(1)} points after using your coping tools, typically within ${Math.round(avgRecoveryTime / 60)} minutes.`,
        confidence: 0.8,
        relatedEntries: logsWithRecovery.map(l => l.id).slice(0, 5),
      });
    }
  }
  
  return insights;
}

// ============================================================================
// CONNECTION GENERATION
// ============================================================================

/**
 * Generates a connection message when a similar past entry is found.
 * This is the "You felt similar 3 days ago..." functionality.
 */
export async function generateConnectionMessage(
  userId: string,
  currentFeeling: string,
  currentTrigger?: string
): Promise<string | null> {
  // Find similar past entries
  const similarEntries = await findByFeeling(userId, currentFeeling, 3);
  
  if (similarEntries.length === 0) {
    return null;
  }
  
  const mostSimilar = similarEntries[0];
  const daysAgo = Math.floor(
    (Date.now() - mostSimilar.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );
  
  // Get the mood log for that entry to see what tool was used
  const relatedMoodLog = await prisma.moodLog.findFirst({
    where: {
      userId,
      createdAt: {
        gte: new Date(mostSimilar.createdAt.getTime() - 60 * 60 * 1000), // Within 1 hour
        lte: new Date(mostSimilar.createdAt.getTime() + 60 * 60 * 1000),
      },
    },
  });
  
  // Build the connection message
  let message = `You felt something similar ${daysAgo === 0 ? 'earlier today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}`;
  
  if (mostSimilar.triggers.length > 0) {
    message += ` around the "${mostSimilar.triggers[0]}" trigger`;
  }
  
  if (relatedMoodLog?.toolUsed) {
    message += `. You used "${relatedMoodLog.toolUsed}" then`;
    
    if (relatedMoodLog.timeToCalm) {
      message += ` and felt better in ${Math.round(relatedMoodLog.timeToCalm / 60)} minutes`;
    } else if (relatedMoodLog.resolutionSuccess) {
      message += ' and it helped';
    }
    
    message += '. Would you like to try it again?';
  } else {
    message += '. You got through it then, and you can now too.';
  }
  
  return message;
}
