/**
 * Approved Participants API
 * GET /api/participants/approved - Get all approved participants for selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentParticipant } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const participant = await getCurrentParticipant();

    if (!participant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const participantId = participant.participantId;
    const supabase = createServerClient();

    // Get all approved participants except the requesting participant
    const { data: participants, error } = await supabase
      .from('participants')
      .select('id, participant_number, full_name, gender')
      .eq('background_check_status', 'approved')
      .neq('id', participantId)
      .order('participant_number', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Approved participants GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
