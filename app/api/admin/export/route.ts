/**
 * Admin Export API
 * GET /api/admin/export - Export selections to CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

interface ParticipantData {
  participant_number: number;
  full_name: string;
  gender: string;
  email: string;
  phone: string;
}

interface SelectionData {
  id: string;
  created_at: string;
  selector: ParticipantData | null;
  selected: ParticipantData | null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get all selections with participant details
    const { data: selections, error } = await supabase
      .from('interest_selections')
      .select(`
        id,
        created_at,
        selector:selector_id (
          participant_number,
          full_name,
          gender,
          email,
          phone
        ),
        selected:selected_id (
          participant_number,
          full_name,
          gender,
          email,
          phone
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
    const selectionsArray: SelectionData[] = (selections as SelectionData[]) || [];

    for (const selection of selectionsArray) {
      if (!selection.selector || !selection.selected) continue;

      // Find reverse selection
      const reverseExists = selectionsArray.find(
        (s) =>
          s.selector?.participant_number === selection.selected.participant_number &&
          s.selected?.participant_number === selection.selector.participant_number
      );

      if (reverseExists) {
        const pairId = [
          selection.selector.participant_number,
          selection.selected.participant_number,
        ]
          .sort()
          .join('-');
        mutualMatches.add(pairId);
      }
    }

    // Build CSV
    const headers = [
      'Selector Number',
      'Selector Name',
      'Selector Gender',
      'Selector Email',
      'Selector Phone',
      'Selected Number',
      'Selected Name',
      'Selected Gender',
      'Selected Email',
      'Selected Phone',
      'Mutual Match',
      'Selection Date',
    ];

    const rows = selectionsArray
      .filter((s) => s.selector && s.selected)
      .map((selection) => {
        const pairId = [
          selection.selector!.participant_number,
          selection.selected!.participant_number,
        ]
          .sort()
          .join('-');
        const isMutual = mutualMatches.has(pairId);

        return [
          selection.selector!.participant_number,
          selection.selector!.full_name,
          selection.selector!.gender,
          selection.selector!.email,
          selection.selector!.phone,
          selection.selected!.participant_number,
          selection.selected!.full_name,
          selection.selected!.gender,
          selection.selected!.email,
          selection.selected!.phone,
          isMutual ? 'Yes' : 'No',
          new Date(selection.created_at).toLocaleString(),
        ];
      });

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="halal-match-selections-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
