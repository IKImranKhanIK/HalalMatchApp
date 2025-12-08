import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    // For each event, get participants and selections count
    const eventsWithStats = await Promise.all(
      (events || []).map(async (event) => {
        // Get participants for this event
        const { data: participants } = await supabase
          .from("participants")
          .select("gender")
          .eq("event_id", event.id);

        // Get selections for this event
        const { data: selections } = await supabase
          .from("interest_selections")
          .select("is_mutual")
          .eq("event_id", event.id);

        const participantCount = participants?.length || 0;
        const maleCount =
          participants?.filter((p) => p.gender === "male").length || 0;
        const femaleCount =
          participants?.filter((p) => p.gender === "female").length || 0;
        const selectionCount = selections?.length || 0;
        const mutualMatchCount =
          selections?.filter((s) => s.is_mutual).length || 0;

        return {
          ...event,
          participantCount,
          maleCount,
          femaleCount,
          selectionCount,
          mutualMatchCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      events: eventsWithStats,
    });
  } catch (error) {
    console.error("Error in events API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
