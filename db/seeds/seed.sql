-- Idempotent seed for products, prices, and songs
-- Creates tables if missing and inserts sample rows used by the app

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text,
  description text,
  image text,
  metadata jsonb,
  active boolean DEFAULT true
);

-- PRICES
CREATE TABLE IF NOT EXISTS public.prices (
  id text PRIMARY KEY,
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  unit_amount integer,
  currency text,
  active boolean DEFAULT true,
  type text,
  interval text,
  interval_count integer,
  metadata jsonb
);

-- SONGS
CREATE TABLE IF NOT EXISTS public.songs (
  id serial PRIMARY KEY,
  title text,
  song_path text,
  image_path text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Insert a sample song row pointing to a storage path (upload files to 'songs/' bucket/path)
INSERT INTO public.songs (title, song_path, image_path, user_id)
VALUES (
  'Sample Track',
  'Demo Artist',
  'songs/sample.mp3',
  'images/sample.jpg',
  NULL
)
ON CONFLICT DO NOTHING;

-- You can add additional INSERTs here to seed more songs/products/prices
