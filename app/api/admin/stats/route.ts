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

    // Get total participants
    const { count: totalParticipants } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });

    // Get participants by background check status
    const { count: pendingChecks } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('background_check_status', 'pending');

    const { count: approvedParticipants } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('background_check_status', 'approved');

    const { count: rejectedParticipants } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('background_check_status', 'rejected');

    // Get total selections
    const { count: totalSelections } = await supabase
      .from('interest_selections')
      .select('*', { count: 'exact', head: true });

    // Get mutual matches count (selections where both participants selected each other)
    const supabaseAny: any = supabase;
    const { data: mutualMatches } = await supabaseAny
      .from('interest_selections')
      .select(`
        id,
        selector_id,
        selected_id
      `);

    // Calculate mutual matches
    let mutualMatchCount = 0;
    const matchedPairs = new Set<string>();

    if (mutualMatches) {
      for (const selection of mutualMatches as any[]) {
        // Check if reverse selection exists
        const reverseExists = (mutualMatches as any[]).find(
          (s: any) =>
            s.selector_id === selection.selected_id &&
            s.selected_id === selection.selector_id
        );

        if (reverseExists) {
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

    // Get participants by gender
    const { count: maleCount } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'male');

    const { count: femaleCount } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'female');

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
