import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

    if (!events || events.length === 0) {
      return NextResponse.json({
        success: true,
        events: [],
      });
    }

    // OPTIMIZED: Fetch ALL participants and selections in parallel (2 queries instead of N*2)
    const supabaseAny: any = supabase;
    const [{ data: allParticipants }, { data: allSelections }] = await Promise.all([
      supabaseAny
        .from("participants")
        .select("event_id, gender"),
      supabaseAny
        .from("interest_selections")
        .select("event_id, is_mutual"),
    ]);

    // Group participants by event_id
    const participantsByEvent = new Map<string, Array<{ gender: string }>>();
    if (allParticipants) {
      for (const participant of allParticipants as any[]) {
        if (!participantsByEvent.has(participant.event_id)) {
          participantsByEvent.set(participant.event_id, []);
        }
        participantsByEvent.get(participant.event_id)!.push({ gender: participant.gender });
      }
    }

    // Group selections by event_id
    const selectionsByEvent = new Map<string, Array<{ is_mutual: boolean }>>();
    if (allSelections) {
      for (const selection of allSelections as any[]) {
        if (!selectionsByEvent.has(selection.event_id)) {
          selectionsByEvent.set(selection.event_id, []);
        }
        selectionsByEvent.get(selection.event_id)!.push({ is_mutual: selection.is_mutual });
      }
    }

    // Calculate stats for each event from the grouped data
    const eventsWithStats = events.map((event) => {
      const participants = participantsByEvent.get(event.id) || [];
      const selections = selectionsByEvent.get(event.id) || [];

      const participantCount = participants.length;
      const maleCount = participants.filter((p) => p.gender === "male").length;
      const femaleCount = participants.filter((p) => p.gender === "female").length;
      const selectionCount = selections.length;
      const mutualMatchCount = selections.filter((s) => s.is_mutual).length;

      return {
        ...event,
        participantCount,
        maleCount,
        femaleCount,
        selectionCount,
        mutualMatchCount,
      };
    });

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

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();
    const { name, date, location, description, status } = body;

    // Validate required fields
    if (!name || !date || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new event
    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert([
        {
          name,
          date,
          location,
          description: description || "",
          status: status || "upcoming",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating event:", insertError);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error in POST events API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
