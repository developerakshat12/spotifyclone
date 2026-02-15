import { ArtistSong } from "@/types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Link an artist to a song (returns the inserted artist_song row)
export const linkArtistToSong = async (
  artist_id: number,
  song_id: number
): Promise<ArtistSong | null> => {
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

  const { data, error } = await supabase
    .from("artist_song")
    .insert([{ artist_id, song_id }])
    .select()
    .single()

  if (error) {
    console.log(error)
    return null
  }

  return data as ArtistSong
}
