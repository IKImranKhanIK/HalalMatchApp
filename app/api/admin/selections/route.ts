/**
 * Admin Selections API
 * GET /api/admin/selections - Get all selections with participant details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get all selections with participant details
    const supabaseAny: any = supabase;
    const { data: selections, error } = await supabaseAny
      .from('interest_selections')
      .select(`
        id,
        created_at,
        selector:selector_id (
          id,
          participant_number,
          full_name,
          gender,
          email
        ),
        selected:selected_id (
          id,
          participant_number,
          full_name,
          gender,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching selections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch selections' },
        { status: 500 }
      );
    }

    // Calculate mutual matches
    const mutualMatches = new Set<string>();
    const selectionsArray: any[] = selections || [];

    for (const selection of selectionsArray) {
      if (!selection.selector || !selection.selected) continue;

      // Check if reverse selection exists
      const reverseExists = selectionsArray.find(
        (s) =>
          s.selector?.id === selection.selected.id &&
          s.selected?.id === selection.selector.id
      );

      if (reverseExists) {
        // Create a unique pair identifier (sorted to avoid duplicates)
        const pairId = [selection.selector.id, selection.selected.id]
          .sort()
          .join('-');
        mutualMatches.add(pairId);
      }
    }

    // Add mutual match flag to selections
    const selectionsWithMutualFlag = selectionsArray.map((selection) => {
      if (!selection.selector || !selection.selected) {
        return { ...selection, is_mutual: false };
      }

      const pairId = [selection.selector.id, selection.selected.id]
        .sort()
        .join('-');
      return {
        ...selection,
        is_mutual: mutualMatches.has(pairId),
      };
    });

    return NextResponse.json({
      selections: selectionsWithMutualFlag,
      total: selectionsArray.length,
      mutualMatchesCount: mutualMatches.size,
    });
  } catch (error) {
    console.error('Admin selections API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
