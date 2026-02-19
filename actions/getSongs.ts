import { Song } from "@/types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Fetch song data
export const getSongs = async (): Promise<Song[]> => {
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
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.log(error)
    return []
  }

  return (data as any) || []
}
