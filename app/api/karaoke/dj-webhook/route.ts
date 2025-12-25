import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
// TODO: Implement DJ integration service
// import {
//   notifyDJAppSongStarted,
//   notifyDJAppSongCompleted,
//   notifyDJAppSongSkipped,
// } from "@/lib/services/dj-integration";

/**
 * DJ Webhook Endpoint
 * 
 * This endpoint can be called by DJ apps to:
 * 1. Get current song info
 * 2. Trigger song playback
 * 3. Receive queue updates
 * 
 * Webhook format: POST /api/karaoke/dj-webhook?event_id={id}&action={action}
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");
    const action = searchParams.get("action") || "current";

    if (!eventId) {
      return NextResponse.json(
        { error: "event_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    if (action === "current") {
      // Get current song
      const { data: currentSong } = await supabase
        .from("karaoke_queue")
        .select(`
          *,
          karaoke_songs(title, artist, spotify_uri, spotify_track_id)
        `)
        .eq("event_id", eventId)
        .eq("status", "singing")
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (!currentSong) {
        return NextResponse.json({
          success: true,
          current_song: null,
          message: "No song currently playing",
        });
      }

      const songData = currentSong as any;
      const songTitle =
        songData.karaoke_songs?.title ||
        songData.custom_song_title ||
        "Unknown";
      const songArtist =
        songData.karaoke_songs?.artist ||
        songData.custom_song_artist ||
        "Unknown";

      return NextResponse.json({
        success: true,
        current_song: {
          queue_id: songData.id,
          title: songTitle,
          artist: songArtist,
          spotify_uri:
            songData.karaoke_songs?.spotify_uri ||
            songData.spotify_uri,
          spotify_track_id:
            songData.karaoke_songs?.spotify_track_id ||
            songData.spotify_track_id,
          spotify_url: songData.spotify_external_url,
          queue_position: songData.queue_position,
          started_at: songData.started_at,
        },
      });
    }

    if (action === "queue") {
      // Get next 5 songs in queue
      const { data: queue } = await supabase
        .from("karaoke_queue")
        .select(`
          *,
          karaoke_songs(title, artist, spotify_uri, spotify_track_id)
        `)
        .eq("event_id", eventId)
        .in("status", ["queued", "up_next"])
        .order("queue_position", { ascending: true })
        .limit(5);

      const formattedQueue = (queue || []).map((entry: any) => {
        const songTitle =
          entry.karaoke_songs?.title || entry.custom_song_title || "Unknown";
        const songArtist =
          entry.karaoke_songs?.artist || entry.custom_song_artist || "Unknown";

        return {
          queue_id: entry.id,
          title: songTitle,
          artist: songArtist,
          spotify_uri:
            entry.karaoke_songs?.spotify_uri || entry.spotify_uri,
          spotify_track_id:
            entry.karaoke_songs?.spotify_track_id || entry.spotify_track_id,
          queue_position: entry.queue_position,
          status: entry.status,
        };
      });

      return NextResponse.json({
        success: true,
        queue: formattedQueue,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'current' or 'queue'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in DJ webhook API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for DJ apps to register webhook URL
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json(
        { error: "event_id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { webhook_url } = body;

    if (!webhook_url) {
      return NextResponse.json(
        { error: "webhook_url is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Update event with webhook URL
    const supabaseAny: any = supabase;
    const { error } = await supabaseAny
      .from("karaoke_events")
      .update({ dj_webhook_url: webhook_url })
      .eq("id", eventId);

    if (error) {
      console.error("Error updating webhook URL:", error);
      return NextResponse.json(
        { error: "Failed to update webhook URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook URL registered successfully",
    });
  } catch (error) {
    console.error("Error in DJ webhook POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

