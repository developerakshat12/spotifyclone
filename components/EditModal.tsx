'use client';

import React, { useState } from 'react';
import { Artist } from '@/types';
import toast from 'react-hot-toast';

interface EditModalProps {
  data: any;
  artists: Artist[];
  onClose: () => void;

  updateSong: (id: number, data: { title: string }) => Promise<any>;
  deleteSong: (id: number) => Promise<any>;
  updateArtistSong: (
    id: number,
    data: { artist_id: number; song_id: number }
  ) => Promise<any>;
}

export const EditModal: React.FC<EditModalProps> = ({
  data,
  artists,
  onClose,
  updateSong,
  deleteSong,
  updateArtistSong,
}) => {
  // Current artist relation row
  const currentRelation = data.artist_song?.[0] ?? null;

  const currentArtistId =
    currentRelation?.artists?.artist_id ?? 0;

  const [title, setTitle] = useState<string>(data.title || '');
  const [artistId, setArtistId] = useState<number>(currentArtistId);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // =============================
  // UPDATE
  // =============================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let songUpdated = false;
      let artistUpdated = false;

      // 1️⃣ Update song title
      if (title !== data.title) {
        await updateSong(data.id, { title });
        songUpdated = true;
      }

      // 2️⃣ Update artist relation (only if changed)
      if (
        currentRelation &&
        artistId !== currentArtistId
      ) {
        await updateArtistSong(currentRelation.id, {
          artist_id: artistId,
          song_id: data.id,
        });

        artistUpdated = true;
      }

                console.log({
        relationId: currentRelation?.id,
        artistId,
        songId: data.id,
        });

      if (songUpdated && artistUpdated) {
        toast.success('Song and Artist updated successfully');
      } else if (songUpdated) {
        toast.success('Song updated successfully');
      } else if (artistUpdated) {
        toast.success('Artist updated successfully');
      } else {
        toast('No changes detected');
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update');
    } finally {
      setLoading(false);
                console.log({
        relationId: currentRelation?.id,
        artistId,
        songId: data.id,
        });
    }
          console.log({
        relationId: currentRelation?.id,
        artistId,
        songId: data.id,
        });
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSong(data.id);
      toast.success('Song deleted successfully');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded-lg shadow-xl w-full max-w-md border border-neutral-700">
        <h2 className="text-xl font-bold mb-4 text-white">
          Edit Song and Artist
        </h2>

        <form onSubmit={handleUpdate}>
          {/* Song Title */}
          <label className="block mb-2 text-sm text-neutral-300">
            Song Title
          </label>

          <input
            className="w-full bg-neutral-800 border border-neutral-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          {/* Artist Dropdown */}
          <label className="block mb-2 text-sm text-neutral-300 mt-4">
            Artist
          </label>

          <div className="relative">
            <select
              value={artistId}
              onChange={(e) =>
                setArtistId(Number(e.target.value))
              }
              disabled={loading || artists.length === 0}
              className="w-full bg-neutral-800 border border-neutral-600 text-white p-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              <option value={0}>Select artist</option>

              {artists.map((artist) => (
                <option
                  key={artist.artist_id}
                  value={artist.artist_id}
                >
                  {artist.name}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
              ▼
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition"
            >
              Update
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition"
            >
              Delete
            </button>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-neutral-800 border border-red-700 rounded">
            <p className="text-red-400 text-sm">
              Are you sure you want to delete this song?
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};