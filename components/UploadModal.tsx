'use client';

import uniqid from 'uniqid';

import { useState, useEffect } from 'react';
import { Artist } from '@/types';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

import { useUploadModal } from '@/hooks/useUploadModal';
import { useUser } from '@/hooks/useUser';

import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

// Helper for filtering artists by name
function filterArtists(artists: Artist[], query: string) {
  return artists.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
}

export const UploadModal = () => {
  //* Initialising state and hooks
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistQuery, setArtistQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [addNewArtist, setAddNewArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistCountry, setNewArtistCountry] = useState('');
  // Filtered artists for dropdown
  const filteredArtists = artistQuery ? filterArtists(artists, artistQuery) : artists;
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
    // Fetch artists when modal opens
  useEffect(() => {
    if (!uploadModal.isOpen) return;

    const fetchArtists = async () => {
      const { data, error } = await supabaseClient
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log(error.message);
        setArtists([]);
      } else {
        setArtists(data || []);
      }
    };

    fetchArtists();
  }, [uploadModal.isOpen, supabaseClient]);
  //* Using null for the files
  //* Initialise react-hook-form methods and set default form values
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      song: null,
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];


      if (!imageFile || !songFile || !user) {
        toast.error('Missing fields');
        setIsLoading(false);
        return;
      }

      if (!values.title) {
        toast.error('Title is required');
        setIsLoading(false);
        return;
      }

      const uniqueID = uniqid();

      // Upload song to Supabase storage
      const { data: songData, error: songError } = await supabaseClient.storage
        .from('songs')
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: '3600',
          upsert: false,
        });
      if (songError) {
        setIsLoading(false);
        return toast.error('Failed song upload.');
      }

      // Upload image to Supabase storage
      const { data: imageData, error: imageError } = await supabaseClient.storage
        .from('images')
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });
      if (imageError) {
        setIsLoading(false);
        return toast.error('Failed image upload.');
      }

      if (!user.id || user.id === 'undefined') {
        setIsLoading(false);
        return toast.error('Invalid user ID');
      }

      // Prepare artist payload
      let artistPayload: any = null;
      if (addNewArtist) {
        if (!newArtistName) {
          setIsLoading(false);
          return toast.error('Artist name required');
        }
        artistPayload = {
          name: newArtistName,
          country: newArtistCountry || null,
        };
      } else if (selectedArtist) {
        artistPayload = {
          artist_id: selectedArtist.artist_id,
        };
      } else {
        setIsLoading(false);
        return toast.error('Please select or add an artist');
      }

      // Send to API route
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: values.title,
          image_path: imageData.path,
          song_path: songData.path,
          artist: artistPayload,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setIsLoading(false);
        return toast.error(err.error || 'Failed to create song');
      }

      router.refresh();
      setIsLoading(false);
      toast.success('Song is created!');
      reset();
      uploadModal.onClose();
    } catch (error) {
      setIsLoading(false);
      toast.error('Something went wrong');
    }
  };

  // Render the Modal component with a form to upload a new song
  return (
    <Modal
      title="Add a song"
      description="Upload a mp3 file"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        {/* Song fields */}
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Song title"
        />
        {/* No author input, artist selection below handles this */}
        {/* Artist selection */}
        <div>
          <div className="pb-1">Artist</div>
          {!addNewArtist ? (
            <div className="relative">
              <Input
                type="text"
                placeholder="Search or add artist"
                value={artistQuery}
                onChange={e => {
                  setArtistQuery(e.target.value);
                  setSelectedArtist(null);
                  setAddNewArtist(false);
                }}
                disabled={isLoading}
              />
              {artistQuery && (
                <div className="absolute z-10 bg-neutral-800 border border-neutral-700 w-full mt-1 rounded shadow-lg max-h-40 overflow-y-auto">
                  {filteredArtists.length > 0 ? (
                    filteredArtists.map(artist => (
                      <div
                        key={artist.artist_id}
                        className={`px-3 py-2 cursor-pointer hover:bg-neutral-700 ${selectedArtist?.artist_id === artist.artist_id ? 'bg-neutral-700' : ''}`}
                        onClick={() => {
                          setSelectedArtist(artist);
                          setArtistQuery(artist.name);
                          setAddNewArtist(false);
                        }}
                      >
                        {artist.name} {artist.country ? `(${artist.country})` : ''}
                      </div>
                    ))
                  ) : (
                    <div
                      className="px-3 py-2 cursor-pointer hover:bg-neutral-700 text-green-400"
                      onClick={() => {
                        setAddNewArtist(true);
                        setSelectedArtist(null);
                        setArtistQuery('');
                      }}
                    >
                      + Add new artist
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-y-2 mt-2">
              <Input
                type="text"
                placeholder="Artist name"
                value={newArtistName}
                onChange={e => setNewArtistName(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                type="text"
                placeholder="Country (optional)"
                value={newArtistCountry}
                onChange={e => setNewArtistCountry(e.target.value)}
                disabled={isLoading}
              />
              <div className="text-xs text-neutral-400 cursor-pointer underline mt-1" onClick={() => setAddNewArtist(false)}>
                Cancel new artist
              </div>
            </div>
          )}
        </div>
        {/* Song file */}
        <div>
          <div className="pb-1">Select a song file</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register('song', { required: true })}
          />
        </div>
        {/* Image file */}
        <div>
          <div className="pb-1">Select an image</div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register('image', { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
};
