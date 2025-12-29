/**
 * Pattern Insights API Route
 * 
 * Returns pattern analysis from the user's journal history.
 * This powers the "connect, don't just summarize" feature.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findPatterns } from '@/lib/semantic-search';

// GET: Get pattern insights for user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const daysBackParam = searchParams.get('daysBack');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }
    
    const daysBack = daysBackParam ? parseInt(daysBackParam, 10) : 30;
    
    // Get pattern insights
    const patterns = await findPatterns(userId, daysBack);
    
    return NextResponse.json({
      success: true,
      patterns,
      count: patterns.length,
      daysAnalyzed: daysBack,
    });
    
  } catch (error) {
    console.error('Pattern insights error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze patterns' },
      { status: 500 }
    );
  }
}
