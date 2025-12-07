/**
 * Admin Reset Participants API
 * POST /api/admin/reset/participants - Delete all participants and selections
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';
import { logDatabaseReset } from '@/lib/utils/audit-log';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // First delete all selections
    await supabase
      .from('interest_selections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Then delete all participants
    const { error } = await supabase
      .from('participants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Reset participants error:', error);
      return NextResponse.json(
        { error: 'Failed to reset participants' },
        { status: 500 }
      );
    }

    // Audit log
    await logDatabaseReset(
      session.user?.id as string,
      session.user?.email || 'unknown',
      'all',
      request
    );

    return NextResponse.json({
      success: true,
      message: 'All participants and selections have been cleared',
    });
  } catch (error) {
    console.error('Reset participants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
