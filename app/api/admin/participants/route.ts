/**
 * Admin Participants API
 * GET /api/admin/participants - Get all participants
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by background check status
    if (status && status !== 'all') {
      query = query.eq('background_check_status', status);
    }

    // Search by name, email, or participant number
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,participant_number.eq.${parseInt(
          search
        ) || 0}`
      );
    }

    const { data: participants, error } = await query;

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Participants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
