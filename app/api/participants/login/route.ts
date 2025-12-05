/**
 * Participant Login API
 * POST /api/participants/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participant_number } = body;

    if (!participant_number) {
      return NextResponse.json(
        { error: 'Participant number is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Find participant by number
    const { data: participant, error } = await supabase
      .from('participants')
      .select('id, participant_number, full_name, gender, background_check_status')
      .eq('participant_number', participant_number)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if approved
    if (participant.background_check_status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Your background check is still pending. Please wait for approval.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        participant_number: participant.participant_number,
        full_name: participant.full_name,
        gender: participant.gender,
      },
    });
  } catch (error) {
    console.error('Participant login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
