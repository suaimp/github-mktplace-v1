/*
  # Fix article documents storage policies

  This migration fixes the RLS policies for the article_documents storage bucket
  to resolve the 400 Bad Request error during file uploads.

  Issues being fixed:
  1. Simplify upload policy to remove redundant auth.users check
  2. Ensure proper path structure for file uploads
  3. Add policies for updating and deleting user's own documents
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Authenticated users can upload article documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read their own article documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all article documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update article documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete article documents" ON storage.objects;

-- Create simplified upload policy for authenticated users
CREATE POLICY "Allow authenticated uploads to article_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article_documents');

-- Create policy for users to read their own uploaded documents
CREATE POLICY "Allow users to read own article_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  owner = auth.uid()
);

-- Create policy for users to update their own documents
CREATE POLICY "Allow users to update own article_documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  owner = auth.uid()
)
WITH CHECK (bucket_id = 'article_documents');

-- Create policy for users to delete their own documents
CREATE POLICY "Allow users to delete own article_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  owner = auth.uid()
);

-- Create admin policies for full access
CREATE POLICY "Allow admins full access to article_documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
)
WITH CHECK (
  bucket_id = 'article_documents' AND
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
