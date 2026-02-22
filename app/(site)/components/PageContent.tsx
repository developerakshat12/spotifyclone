'use client';

import { SongItem } from '@/components/SongItem';
import { useOnPlay } from '@/hooks/useOnPlay';
import { Artist, SongWithArtists } from '@/types';

interface PageContentProps {
  songs: SongWithArtists[];
  artists: Artist[];
  updateSong: (id: number, data: { title: string }) => Promise<any>;
  deleteSong: (id: number) => Promise<any>;
  updateArtistSong: (
    id: number,
    data: { artist_id: number; song_id: number }
  ) => Promise<any>;
}

export const PageContent: React.FC<PageContentProps> = ({
  songs,
  artists,
  updateSong,
  deleteSong,
  updateArtistSong }) => {
  const onPlay = useOnPlay(songs);

  if (songs.length === 0) {
    return <div className="mt-4 text-neutral-400">No songs available</div>;
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-8
        gap-4
        mt-4
        "
    >
      {songs.map((item) => (
        <SongItem
          key={item.id}
          onClick={(id: string) => onPlay(id)}
          data={item}
          artists={artists}
          updateSong={updateSong}
          deleteSong={deleteSong}
          updateArtistSong={updateArtistSong} />
      ))}
    </div>
  );
};
