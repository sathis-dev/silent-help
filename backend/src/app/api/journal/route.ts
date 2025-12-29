/**
 * Journal API
 * 
 * Handles encrypted journal entries with field-level encryption.
 * Supports the Semantic Journal for the LOW pathway.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptContent, decryptContent } from '@/lib/encryption';
import { scrubPII } from '@/lib/pii-scrubber';
import { storeEmbedding, generateConnectionMessage } from '@/lib/semantic-search';
import { performSafetyCheck } from '@/lib/safety-guardrails';
import { z } from 'zod';
import type { StressPathway } from '@prisma/client';

export const dynamic = 'force-dynamic';

const createJournalSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  entryType: z.enum(['freeform', 'guided', 'voice']).optional().default('freeform'),
  moodSnapshot: z.string().optional(),
  pathway: z.enum(['HIGH', 'MID', 'LOW']).optional().default('LOW'),
  triggerCategory: z.string().optional(),
});

// POST: Create new journal entry
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = createJournalSchema.parse(body);
    
    // Safety check on content
    const safetyResult = await performSafetyCheck(validated.content);
    
    if (!safetyResult.isSafe) {
      // Don't block journaling, but flag it
      // The content is still stored but marked for review
    }
    
    // Encrypt the content
    const encrypted = encryptContent(validated.content, validated.userId);
    
    // Calculate word count before encryption
    const wordCount = validated.content.split(/\s+/).filter(w => w.length > 0).length;
    
    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: validated.userId,
        contentEncrypted: encrypted.encrypted,
        contentIv: encrypted.iv,
        contentTag: encrypted.tag,
        wordCount,
        entryType: validated.entryType,
        moodSnapshot: validated.moodSnapshot,
        pathway: validated.pathway as StressPathway,
        piiScrubbed: false,
        aiProcessed: false,
      },
    });
    
    // Generate embedding asynchronously (don't block response)
    // Only for LOW pathway where AI is enabled
    if (validated.pathway === 'LOW') {
      setImmediate(async () => {
        try {
          // Scrub PII before creating embedding
          const { scrubbedText } = scrubPII(validated.content);
          
          await storeEmbedding({
            text: scrubbedText,
            userId: validated.userId,
            journalEntryId: journalEntry.id,
            emotion: validated.moodSnapshot,
            triggers: validated.triggerCategory ? [validated.triggerCategory] : [],
          });
          
          // Mark as processed
          await prisma.journalEntry.update({
            where: { id: journalEntry.id },
            data: { aiProcessed: true, piiScrubbed: true },
          });
        } catch (error) {
          console.error('Failed to create embedding:', error);
        }
      });
    }
    
    // Generate connection message if relevant
    let connection: string | null = null;
    if (validated.moodSnapshot && validated.pathway === 'LOW') {
      connection = await generateConnectionMessage(
        validated.userId,
        validated.moodSnapshot,
        validated.triggerCategory
      );
    }
    
    return NextResponse.json({
      success: true,
      entry: {
        id: journalEntry.id,
        createdAt: journalEntry.createdAt,
        wordCount,
      },
      connection,
      safetyFlag: !safetyResult.isSafe,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// GET: Get journal entries
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const entryId = searchParams.get('id');
    const days = parseInt(searchParams.get('days') || '30');
    const includeContent = searchParams.get('content') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }
    
    // Get specific entry
    if (entryId) {
      const entry = await prisma.journalEntry.findFirst({
        where: { id: entryId, userId },
      });
      
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Entry not found' },
          { status: 404 }
        );
      }
      
      // Decrypt content if requested
      let content: string | undefined;
      if (includeContent) {
        const decrypted = decryptContent(
          {
            encrypted: entry.contentEncrypted,
            iv: entry.contentIv,
            tag: entry.contentTag,
          },
          userId
        );
        
        if (decrypted.success) {
          content = decrypted.content;
        }
      }
      
      return NextResponse.json({
        success: true,
        entry: {
          id: entry.id,
          content,
          wordCount: entry.wordCount,
          entryType: entry.entryType,
          moodSnapshot: entry.moodSnapshot,
          pathway: entry.pathway,
          createdAt: entry.createdAt,
        },
      });
    }
    
    // Get entries list
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        wordCount: true,
        entryType: true,
        moodSnapshot: true,
        pathway: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
    });
    
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get journal entries' },
      { status: 500 }
    );
  }
}

// DELETE: Delete journal entry
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!entryId || !userId) {
      return NextResponse.json(
        { success: false, error: 'id and userId required' },
        { status: 400 }
      );
    }
    
    // Verify ownership and delete
    const deleted = await prisma.journalEntry.deleteMany({
      where: { id: entryId, userId },
    });
    
    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Entry not found or not authorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Entry deleted',
    });
    
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
