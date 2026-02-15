import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createArtist } from "./createArtist"
import { linkArtistToSong } from "./linkArtistToSong"

// Handles artist creation (if needed) and linking to a song
// artistInfo can be: { artist_id: number } OR { name: string, country?: string|null }
export const handleArtistForSong = async (
  artistInfo: { artist_id?: number; name?: string; country?: string | null },
  song_id: number
) => {
  let artistId: number | null = null

  if (artistInfo.artist_id) {
    // Existing artist selected
    artistId = artistInfo.artist_id
  } else if (artistInfo.name) {
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

    // Try to find existing artist
    const { data: existing, error: queryError } = await supabase
      .from("artists")
      .select("*")
      .eq("name", artistInfo.name)
      .eq("country", artistInfo.country ?? null)
      .maybeSingle()

    if (queryError) {
      console.log(queryError)
    }

    if (existing?.artist_id) {
      artistId = existing.artist_id
    } else {
      const created = await createArtist({
        name: artistInfo.name,
        country: artistInfo.country ?? null,
      })

      artistId = created?.artist_id ?? null
    }
  }

  if (!artistId) {
    throw new Error("Failed to determine artist ID")
  }

  await linkArtistToSong(artistId, song_id)
}
