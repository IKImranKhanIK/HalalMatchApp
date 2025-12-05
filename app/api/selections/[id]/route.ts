/**
 * Selection Management API
 * DELETE /api/selections/[id] - Delete a selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const participantId = request.headers.get('x-participant-id');

    if (!participantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();

    // Delete the selection (only if it belongs to this participant)
    const { error } = await supabase
      .from('interest_selections')
      .delete()
      .eq('id', id)
      .eq('selector_id', participantId);

    if (error) {
      console.error('Selection delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete selection' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Selection removed',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Selection DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
