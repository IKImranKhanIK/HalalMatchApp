/**
 * Selections API
 * GET /api/selections - Get my selections
 * POST /api/selections - Create new selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const participantId = request.headers.get('x-participant-id');

    if (!participantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Get all selections made by this participant
    const { data: selections, error } = await supabase
      .from('interest_selections')
      .select(`
        id,
        selected_id,
        created_at,
        participants:selected_id (
          participant_number,
          full_name,
          gender
        )
      `)
      .eq('selector_id', participantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching selections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch selections' },
        { status: 500 }
      );
    }

    return NextResponse.json({ selections });
  } catch (error) {
    console.error('Selections GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const participantId = request.headers.get('x-participant-id');

    if (!participantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { selected_participant_number } = body;

    if (!selected_participant_number) {
      return NextResponse.json(
        { error: 'Selected participant number is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get the selected participant's ID from their number
    const { data: selectedParticipant, error: lookupError } = await supabase
      .from('participants')
      .select('id, participant_number')
      .eq('participant_number', selected_participant_number)
      .eq('background_check_status', 'approved')
      .single();

    if (lookupError || !selectedParticipant) {
      return NextResponse.json(
        { error: 'Participant not found or not approved' },
        { status: 404 }
      );
    }

    // Check for self-selection
    if (selectedParticipant.id === participantId) {
      return NextResponse.json(
        { error: 'Cannot select yourself' },
        { status: 400 }
      );
    }

    // Create the selection
    const { data: selection, error: insertError } = await supabase
      .from('interest_selections')
      .insert({
        selector_id: participantId,
        selected_id: selectedParticipant.id,
      })
      .select()
      .single();

    if (insertError) {
      // Check if it's a duplicate
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already selected this participant' },
          { status: 409 }
        );
      }

      console.error('Selection insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create selection' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Selection created',
        selection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Selection POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
