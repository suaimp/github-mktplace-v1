/*
  # Add Avatar URL Column
  
  1. Changes
    - Add avatar_url column to admins and platform_users tables
    - Create avatars storage bucket
    - Add storage policies for avatar uploads
  
  2. Security
    - Enable RLS
    - Add storage policies for user access
*/

-- Add avatar_url column to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add avatar_url column to platform_users table
ALTER TABLE platform_users
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Enable storage access for avatars
BEGIN;
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

  -- Policy to allow authenticated users to upload avatars
  DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
  CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM platform_users WHERE id = auth.uid()
    ))
  );

  -- Policy to allow users to update their own avatars
  DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
  CREATE POLICY "Users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM platform_users WHERE id = auth.uid()
    ))
  );

  -- Policy to allow public access to read avatars
  DROP POLICY IF EXISTS "Public users can read avatars" ON storage.objects;
  CREATE POLICY "Public users can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

  -- Policy to allow users to delete their own avatars
  DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
  CREATE POLICY "Users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM platform_users WHERE id = auth.uid()
    ))
  );
COMMIT;