'use client';

import { Artist, SongWithArtists } from '@/types';

import { PlayButton } from './PlayButton';
import Image from 'next/image';
import { useLoadImage } from '@/hooks/useLoadImage';
import { useState } from 'react';
import { EditModal } from './EditModal';
import { Pencil } from 'lucide-react';

interface SongItemProps {
  data: SongWithArtists;
  artists: Artist[];
  onClick: (id: string) => void;

  updateSong: (id: number, data: { title: string }) => Promise<any>;
  deleteSong: (id: number) => Promise<any>;
  updateArtistSong: (
    id: number,
    data: { artist_id: number; song_id: number }
  ) => Promise<any>;
}

export const SongItem: React.FC<SongItemProps> = ({ 
  data, 
  artists,
  onClick, 
  updateSong, 
  deleteSong, 
  updateArtistSong }) => {
  const imagePath = useLoadImage(data);
  const [showEdit, setShowEdit] = useState(false);
  return (
    <div
      onClick={() => onClick(data.id)}
      className="
        relative 
        group
        flex 
        flex-col
        items-center
        justify-center
        overflow-hidden
        gap-x-4
        bg-neutral-400/5
        cursor-pointer
        hover:bg-neutral-400/10
        transition
        p-3
        "
    >
      <div
        className="
            relative 
            aspect-square
            w-full
            h-full
            rounded-md
            overflow-hidden
            "
      >
        <Image
          loading="eager"
          className="object-cover"
          src={imagePath || '/images/liked.png'}
          fill
          alt="Image"
        />
        {/* Pencil icon appears on hover */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setShowEdit(true);
          }}
          className="absolute bottom-2 left-2 
          opacity-0
          transition 
          bg-green-600
          p-2
          rounded-full        
          group-hover:opacity-100
          group-hover:translate-y-0
          hover:scale-110"
        >
          <Pencil size={18} className="text-neutral-700" />
        </button>
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className="font-semibold truncate w-full">{data.title}</p>
        <p className="text-neutral-400 text-sm pb-4 w-full truncate">
          By {data.artist_song?.length
            ? data.artist_song.map(a => a.artists.name).join(", ")
            : "Unknown Artist"}
        </p>
      </div>
      <div className="absolute bottom-24 right-5">
        <PlayButton 
          />
      </div>
      {showEdit && (
        <EditModal
          data={data}
          artists = {artists}
          onClose={() => setShowEdit(false)}
          updateSong={updateSong}
          deleteSong={deleteSong}
          updateArtistSong={updateArtistSong}
        />
      )}
    </div>
  );
};
