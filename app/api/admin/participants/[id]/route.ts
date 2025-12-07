/**
 * Admin Single Participant API
 * GET /api/admin/participants/[id] - Get single participant
 * PATCH /api/admin/participants/[id] - Update participant
 * DELETE /api/admin/participants/[id] - Delete participant
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import { logParticipantUpdate, logParticipantDeletion } from '@/lib/utils/audit-log';
import type { Database } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();

    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ participant });
  } catch (error) {
    console.error('Get participant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    // Allowed fields to update
    const allowedFields = [
      'full_name',
      'email',
      'phone',
      'gender',
      'background_check_status',
    ] as const;

    type ParticipantUpdate = Database['public']['Tables']['participants']['Update'];
    const updates: ParticipantUpdate = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updates as any)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Supabase type inference has issues with dynamic updates, using type assertion
    // The updates object is validated against allowedFields above
    const supabaseUpdate: any = supabase;
    const { data: participant, error } = await supabaseUpdate
      .from('participants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update participant error:', error);
      return NextResponse.json(
        { error: 'Failed to update participant' },
        { status: 500 }
      );
    }

    // Audit log
    await logParticipantUpdate(
      session.user?.id as string,
      session.user?.email || 'unknown',
      id,
      updates,
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Participant updated successfully',
      participant,
    });
  } catch (error) {
    console.error('Update participant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();

    // First, delete all selections where this participant is involved
    // Delete selections where this participant is the selector
    await supabase
      .from('interest_selections')
      .delete()
      .eq('selector_id', id);

    // Delete selections where this participant is the selected
    await supabase
      .from('interest_selections')
      .delete()
      .eq('selected_id', id);

    // Then delete the participant
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete participant error:', error);
      return NextResponse.json(
        { error: 'Failed to delete participant' },
        { status: 500 }
      );
    }

    // Audit log
    await logParticipantDeletion(
      session.user?.id as string,
      session.user?.email || 'unknown',
      id,
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Participant deleted successfully',
    });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
