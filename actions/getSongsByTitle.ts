import { Song } from "@/types"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSongs } from "./getSongs"

export const getSongsByTitle = async (title: string): Promise<Song[]> => {
  if (!title) {
    return await getSongs()
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
      },
    }
  )

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .ilike("title", `%${title}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.log(error.message)
    return []
  }

  return (data as any) || []
}
