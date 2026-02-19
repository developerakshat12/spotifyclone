import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { handleArtistForSong } from "@/actions/handleArtistForSong"

// This API route expects:
// { title, image_path, song_path, user_id, artist: { name, country } OR { artist_id } }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, image_path, song_path, user_id, artist } = body

    if (!title || !image_path || !song_path || !user_id || !artist) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
    }

    if (!artist.artist_id && !artist.name) {
      return new Response(
        JSON.stringify({ error: "Artist must have artist_id or name" }),
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Insert song
    const { data: songData, error: songError } = await supabase
      .from("songs")
      .insert({
        user_id,
        title,
        image_path,
        song_path,
      })
      .select()
      .single()

    if (songError || !songData) {
      console.log("SONG INSERT ERROR:", songError)
      return new Response(
        JSON.stringify({ error: songError?.message || "Song insert failed" }),
        { status: 500 }
      )
    }

    // Handle artist creation/linking
    try {
      const artistPayload = artist.artist_id
        ? { artist_id: artist.artist_id }
        : { name: artist.name, country: artist.country || null }

      await handleArtistForSong(artistPayload, songData.id)
    } catch (artistError) {
        console.error("Artist link error:", artistError)
        return new Response(
          JSON.stringify({
            error: "Artist link failed",
            details: String(artistError),
          }),
          { status: 500 }
        )
      }

    return new Response(
      JSON.stringify({ success: true, song: songData }),
      { status: 201 }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: String(err) }),
      { status: 500 }
    )
  }
}
