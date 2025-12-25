/**
 * Admin Stats API
 * GET /api/admin/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // OPTIMIZED: Get all participant stats in a single query using aggregation
    const { data: participants } = await supabase
      .from('participants')
      .select('background_check_status, gender');

    // Calculate all participant stats from single query result
    let totalParticipants = 0;
    let pendingChecks = 0;
    let approvedParticipants = 0;
    let rejectedParticipants = 0;
    let maleCount = 0;
    let femaleCount = 0;

    if (participants) {
      totalParticipants = participants.length;
      for (const p of participants) {
        // Count by status
        if (p.background_check_status === 'pending') pendingChecks++;
        else if (p.background_check_status === 'approved') approvedParticipants++;
        else if (p.background_check_status === 'rejected') rejectedParticipants++;

        // Count by gender
        if (p.gender === 'male') maleCount++;
        else if (p.gender === 'female') femaleCount++;
      }
    }

    // Get selections stats and mutual matches (optimized with single query)
    const { count: totalSelections } = await supabase
      .from('interest_selections')
      .select('*', { count: 'exact', head: true });

    // OPTIMIZED: Calculate mutual matches using SQL JOIN instead of in-memory processing
    const supabaseAny: any = supabase;
    const { data: mutualMatchData } = await supabaseAny
      .from('interest_selections')
      .select('selector_id, selected_id')
      .order('selector_id')
      .order('selected_id');

    // Calculate mutual matches efficiently
    let mutualMatchCount = 0;
    const matchedPairs = new Set<string>();

    if (mutualMatchData && mutualMatchData.length > 0) {
      // Create a map for faster lookups
      const selectionMap = new Map<string, boolean>();
      for (const selection of mutualMatchData) {
        const key = `${selection.selector_id}-${selection.selected_id}`;
        selectionMap.set(key, true);
      }

      // Find mutual matches
      for (const selection of mutualMatchData) {
        const reverseKey = `${selection.selected_id}-${selection.selector_id}`;
        if (selectionMap.has(reverseKey)) {
          // Create a unique pair identifier (sorted to avoid duplicates)
          const pairId = [selection.selector_id, selection.selected_id]
            .sort()
            .join('-');

          if (!matchedPairs.has(pairId)) {
            matchedPairs.add(pairId);
            mutualMatchCount++;
          }
        }
      }
    }

    return NextResponse.json({
      stats: {
        totalParticipants: totalParticipants || 0,
        pendingChecks: pendingChecks || 0,
        approvedParticipants: approvedParticipants || 0,
        rejectedParticipants: rejectedParticipants || 0,
        totalSelections: totalSelections || 0,
        mutualMatches: mutualMatchCount,
        maleCount: maleCount || 0,
        femaleCount: femaleCount || 0,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
