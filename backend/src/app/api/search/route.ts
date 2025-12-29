/**
 * Semantic Search API
 * 
 * Enables searching journal entries by "feeling" rather than keywords.
 * Uses pgvector for similarity matching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findSimilarEntries, findByFeeling, findPatterns, generateConnectionMessage } from '@/lib/semantic-search';
import { decryptContent } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  userId: z.string().uuid(),
  query: z.string().min(1).max(500),
  type: z.enum(['semantic', 'feeling', 'pattern']).optional().default('semantic'),
  limit: z.number().min(1).max(20).optional().default(5),
  daysBack: z.number().min(1).max(365).optional().default(30),
  includeContent: z.boolean().optional().default(false),
});

// POST: Perform semantic search
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = searchSchema.parse(body);
    
    let results;
    
    switch (validated.type) {
      case 'feeling':
        // Search by emotional state
        results = await findByFeeling(
          validated.userId,
          validated.query,
          validated.limit
        );
        break;
        
      case 'pattern':
        // Find patterns across entries
        const patterns = await findPatterns(validated.userId, validated.daysBack);
        return NextResponse.json({
          success: true,
          type: 'patterns',
          patterns,
        });
        
      default:
        // Standard semantic search
        results = await findSimilarEntries(
          validated.userId,
          validated.query,
          validated.limit,
          validated.daysBack
        );
    }
    
    // Optionally include decrypted content
    let entriesWithContent = results;
    
    if (validated.includeContent && results.length > 0) {
      const entryIds = results.map(r => r.journalEntryId).filter(Boolean);
      
      const entries = await prisma.journalEntry.findMany({
        where: { id: { in: entryIds as string[] } },
      });
      
      entriesWithContent = results.map(result => {
        const entry = entries.find(e => e.id === result.journalEntryId);
        if (!entry) return result;
        
        const decrypted = decryptContent(
          {
            encrypted: entry.contentEncrypted,
            iv: entry.contentIv,
            tag: entry.contentTag,
          },
          validated.userId
        );
        
        return {
          ...result,
          content: decrypted.success ? decrypted.content : undefined,
          contentPreview: decrypted.success 
            ? decrypted.content.slice(0, 200) + (decrypted.content.length > 200 ? '...' : '')
            : undefined,
        };
      });
    }
    
    return NextResponse.json({
      success: true,
      type: validated.type,
      query: validated.query,
      results: entriesWithContent,
      count: results.length,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

// GET: Get connection message for current state
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const feeling = searchParams.get('feeling');
    const trigger = searchParams.get('trigger');
    
    if (!userId || !feeling) {
      return NextResponse.json(
        { success: false, error: 'userId and feeling required' },
        { status: 400 }
      );
    }
    
    const connection = await generateConnectionMessage(
      userId,
      feeling,
      trigger || undefined
    );
    
    return NextResponse.json({
      success: true,
      connection,
      hasConnection: connection !== null,
    });
    
  } catch (error) {
    console.error('Connection message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate connection' },
      { status: 500 }
    );
  }
}
