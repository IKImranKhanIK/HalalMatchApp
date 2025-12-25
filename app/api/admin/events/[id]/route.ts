import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { id } = await params;
    const body = await request.json();
    const { name, date, location, description, status } = body;

    // Build update object with only provided fields
    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name;
    if (date !== undefined) updates.date = date;
    if (location !== undefined) updates.location = location;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    // Update event
    const { data: event, error: updateError } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating event:", updateError);
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error in PATCH event API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
