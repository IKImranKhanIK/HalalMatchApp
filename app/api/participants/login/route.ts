/**
 * Participant Login API
 * POST /api/participants/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateParticipantToken, setParticipantCookie } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`participant-login:${identifier}`, RateLimitPresets.LOGIN);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: rateLimit.blocked
          ? 'Too many login attempts. Please try again later.'
          : 'Rate limit exceeded',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        },
      }
    );
  }

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
    const supabaseAny: any = supabase;
    const { data: participant, error } = await supabaseAny
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

    // Generate JWT token
    const token = await generateParticipantToken({
      participantId: participant.id,
      participantNumber: participant.participant_number,
      gender: participant.gender,
      fullName: participant.full_name,
    });

    // Set as httpOnly cookie
    await setParticipantCookie(token);

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
