/**
 * Admin Reset Selections API
 * POST /api/admin/reset/selections - Delete all selections
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Delete all selections
    const { error } = await supabase
      .from('interest_selections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('Reset selections error:', error);
      return NextResponse.json(
        { error: 'Failed to reset selections' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All selections have been cleared',
    });
  } catch (error) {
    console.error('Reset selections error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
