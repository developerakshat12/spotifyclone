"use server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const updateSong = async (id: number, data: { title: string }) => {
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
  const { data: updated, error } = await supabase
    .from('songs')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteSong = async (id: number) => {
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
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
};

export const updateArtist = async (id: number, data: { name: string }) => {
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
  const { data: updated, error } = await supabase
    .from('artists')
    .update(data)
    .eq('artist_id', id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteArtist = async (id: number) => {
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
  // Remove artist_song associations
  const { error: artistSongError } = await supabase
    .from('artist_song')
    .delete()
    .eq('artist_id', id);
  if (artistSongError) throw artistSongError;
  // Remove the artist
  const { error: artistError } = await supabase
    .from('artists')
    .delete()
    .eq('artist_id', id);
  if (artistError) throw artistError;
  return { success: true };
};

export const updateArtistSong = async (id: number, data: { artist_id: number, song_id: number }) => {
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
  const { data: updated, error } = await supabase
    .from('artist_song')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteArtistSong = async (id: number) => {
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
  const { error } = await supabase
    .from('artist_song')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
};
