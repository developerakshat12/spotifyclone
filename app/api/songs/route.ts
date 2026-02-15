import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { handleArtistForSong } from "@/actions/handleArtistForSong";

// This API route expects: { title, author, image_path, song_path, user_id, artist: { name, country } OR artist: { artist_id } }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, author, image_path, song_path, user_id, artist } = body;

    if (!title || !author || !image_path || !song_path || !user_id || !artist) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Check that artist has either artist_id (existing) or name (new)
    if (!artist.artist_id && !artist.name) {
      return new Response(JSON.stringify({ error: "Artist must have artist_id or name" }), { status: 400 });
    }

    const supabase = createServerComponentClient({
      cookies: cookies()
    });

    // Insert song
    const { data: songData, error: songError } = await supabase
      .from("songs")
      .insert({
        user_id,
        title,
        author,
        image_path,
        song_path,
      })
      .select()
      .single();

    if (songError || !songData) {
      return new Response(JSON.stringify({ error: songError?.message || "Song insert failed" }), { status: 500 });
    }

    // Handle artist creation/linking
    try {
      const artistPayload = artist.artist_id 
        ? { artist_id: artist.artist_id } 
        : { name: artist.name, country: artist.country || null };
      await handleArtistForSong(artistPayload, songData.id);
    } catch (artistError) {
      console.error('Artist link error:', artistError);
      return new Response(JSON.stringify({ error: "Artist link failed", details: String(artistError) }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, song: songData }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err }), { status: 500 });
  }
}
