import { SongWithArtists } from "@/types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const getSongsWithArtists = async (): Promise<SongWithArtists[]> => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("songs")
    .select(`
      *,
      artist_song (
        id,
        artist_id,
        song_id,
        artists (*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  return (data as SongWithArtists[]) || [];
};
