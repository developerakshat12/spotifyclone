import { ArtistSong } from "@/types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Fetch all artist-song links (for admin or analytics)
export const getArtistSongs = async (): Promise<ArtistSong[]> => {
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
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.log(error)
    return []
  }

  return (data as any) || []
}
