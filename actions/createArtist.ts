import { Artist } from "@/types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Create a new artist (returns the inserted artist)
export const createArtist = async (
  artist: Omit<Artist, "artist_id">
): Promise<Artist | null> => {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data, error } = await supabase
    .from("artists")
    .insert([artist])
    .select()
    .single()

  if (error) {
    console.log(error)
    return null
  }

  return data as Artist
}
