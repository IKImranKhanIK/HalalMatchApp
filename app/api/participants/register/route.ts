/**
 * Participant Registration API
 * POST /api/participants/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  participantRegistrationSchema,
  formatZodError,
} from '@/lib/utils/validation';
import { generateQRCode } from '@/lib/utils/qr-code';
import { generateParticipantToken, setParticipantCookie } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/utils/rate-limit';
import { sanitizeParticipantData } from '@/lib/utils/sanitize';

export async function POST(request: NextRequest) {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`participant-registration:${identifier}`, RateLimitPresets.REGISTRATION);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Too many registration attempts. Please try again later.',
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

    // Sanitize input
    const sanitizedBody = sanitizeParticipantData(body);

    // Validate input
    const validation = participantRegistrationSchema.safeParse(sanitizedBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatZodError(validation.error),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = createServerClient();
    const supabaseAny: any = supabase;

    // Get the default event (or specific event if provided)
    let eventId = data.event_id;

    if (!eventId) {
      const { data: events, error: eventError } = await supabaseAny
        .from('events')
        .select('id')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true })
        .limit(1)
        .single();

      if (eventError || !events) {
        return NextResponse.json(
          { error: 'No active event found' },
          { status: 400 }
        );
      }

      eventId = events.id;
    }

    // Check for duplicate email in this event
    const { data: existingEmail } = await supabaseAny
      .from('participants')
      .select('email')
      .eq('email', data.email)
      .eq('event_id', eventId)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered for this event' },
        { status: 409 }
      );
    }

    // Check for duplicate participant number in this event
    const { data: existingNumber } = await supabaseAny
      .from('participants')
      .select('participant_number')
      .eq('participant_number', data.participant_number)
      .eq('event_id', eventId)
      .single();

    if (existingNumber) {
      return NextResponse.json(
        { error: 'This participant number is already taken' },
        { status: 409 }
      );
    }

    // Insert participant with provided participant_number
    const { data: participant, error: insertError } = await supabaseAny
      .from('participants')
      .insert({
        participant_number: data.participant_number,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        event_id: eventId,
        background_check_status: 'pending',
      })
      .select()
      .single();

    if (insertError || !participant) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create participant' },
        { status: 500 }
      );
    }

    // Generate QR code
    const qrCodeData = await generateQRCode({
      participantId: participant.id,
      participantNumber: participant.participant_number,
      eventId: participant.event_id || undefined,
    });

    // Update participant with QR code
    const { error: updateError } = await supabaseAny
      .from('participants')
      .update({ qr_code_data: qrCodeData })
      .eq('id', participant.id);

    if (updateError) {
      console.error('QR code update error:', updateError);
      // Non-fatal - participant is already created
    }

    // Generate JWT token for automatic login
    const token = await generateParticipantToken({
      participantId: participant.id,
      participantNumber: participant.participant_number,
      gender: participant.gender,
      fullName: participant.full_name,
    });

    // Set as httpOnly cookie
    await setParticipantCookie(token);

    // Return success with participant data
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          id: participant.id,
          participant_number: participant.participant_number,
          full_name: participant.full_name,
          email: participant.email,
          qr_code: qrCodeData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
