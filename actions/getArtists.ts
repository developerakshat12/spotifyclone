import { Artist } from "@/types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Fetch all artists, ordered by creation date
export const getArtists = async (): Promise<Artist[]> => {
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
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.log(error)
    return []
  }

  return (data as any) || []
}
