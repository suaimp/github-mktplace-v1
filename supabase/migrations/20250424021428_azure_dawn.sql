/*
  # Fix Editorial Manager Access Control
  
  1. Changes
    - Update form entries policies to allow admins to see all entries
    - Fix entry values access for editorial management
  
  2. Security
    - Maintain RLS
    - Add proper access control for admins
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read form entries" ON form_entries;
  DROP POLICY IF EXISTS "Anyone can read form entries" ON form_entries;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policy for admins to read all form entries
CREATE POLICY "Admins can read form entries" 
  ON form_entries 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- Update form entry values policies to allow admins to read all values
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read entry values" ON form_entry_values;
  DROP POLICY IF EXISTS "Anyone can read entry values" ON form_entry_values;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Admins can read entry values" 
  ON form_entry_values 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );