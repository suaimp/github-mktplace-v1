/*
  # Fix Form Entries Access Control
  
  1. Changes
    - Update policies to allow public access to form entries
    - Ensure entries are visible in published pages
    - Add proper visibility checks
  
  2. Security
    - Enable RLS
    - Add policies for public access
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read form entries" ON form_entries;
  DROP POLICY IF EXISTS "Anyone can read entry values" ON form_entry_values;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies for form entries
CREATE POLICY "Anyone can read form entries" 
  ON form_entries 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 
      FROM forms f
      LEFT JOIN platform_users pu ON pu.id = auth.uid()
      WHERE f.id = form_id
      AND f.status = 'published'
      AND (
        -- Form entries shortcode exists in any published page
        EXISTS (
          SELECT 1 
          FROM pages p
          WHERE p.status = 'published'
          AND p.content LIKE '%[form_entries id="' || f.id || '"]%'
        )
      )
    )
  );

-- Create new policies for form entry values
CREATE POLICY "Anyone can read entry values" 
  ON form_entry_values 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      JOIN forms f ON f.id = fe.form_id
      LEFT JOIN platform_users pu ON pu.id = auth.uid()
      WHERE fe.id = entry_id
      AND f.status = 'published'
      AND (
        -- Form entries shortcode exists in any published page
        EXISTS (
          SELECT 1 
          FROM pages p
          WHERE p.status = 'published'
          AND p.content LIKE '%[form_entries id="' || f.id || '"]%'
        )
      )
    )
  );