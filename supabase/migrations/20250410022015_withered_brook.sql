/*
  # Fix User Form Entries Policies
  
  1. Changes
    - Drop existing policies before recreating them
    - Add policies for user form entries with proper error handling
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own entries" ON form_entries;
  DROP POLICY IF EXISTS "Users can update their own entries" ON form_entries;
  DROP POLICY IF EXISTS "Users can delete their own entries" ON form_entries;
  DROP POLICY IF EXISTS "Users can view their own entry values" ON form_entry_values;
  DROP POLICY IF EXISTS "Users can update their own entry values" ON form_entry_values;
  DROP POLICY IF EXISTS "Users can delete their own entry values" ON form_entry_values;
  DROP POLICY IF EXISTS "Users can add notes to their own entries" ON form_entry_notes;
  DROP POLICY IF EXISTS "Users can view notes on their own entries" ON form_entry_notes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policy to allow users to view their own entries
CREATE POLICY "Users can view their own entries" 
  ON form_entries 
  FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = created_by
  );

-- Create policy to allow users to update their own entries
CREATE POLICY "Users can update their own entries" 
  ON form_entries 
  FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = created_by
  );

-- Create policy to allow users to delete their own entries
CREATE POLICY "Users can delete their own entries" 
  ON form_entries 
  FOR DELETE 
  TO authenticated 
  USING (
    auth.uid() = created_by
  );

-- Create policy to allow users to view their own entry values
CREATE POLICY "Users can view their own entry values" 
  ON form_entry_values 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      WHERE fe.id = entry_id
      AND fe.created_by = auth.uid()
    )
  );

-- Create policy to allow users to update their own entry values
CREATE POLICY "Users can update their own entry values" 
  ON form_entry_values 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      WHERE fe.id = entry_id
      AND fe.created_by = auth.uid()
    )
  );

-- Create policy to allow users to delete their own entry values
CREATE POLICY "Users can delete their own entry values" 
  ON form_entry_values 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      WHERE fe.id = entry_id
      AND fe.created_by = auth.uid()
    )
  );

-- Create policy to allow users to add notes to their own entries
CREATE POLICY "Users can add notes to their own entries" 
  ON form_entry_notes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      WHERE fe.id = entry_id
      AND fe.created_by = auth.uid()
    )
  );

-- Create policy to allow users to view notes on their own entries
CREATE POLICY "Users can view notes on their own entries" 
  ON form_entry_notes 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      WHERE fe.id = entry_id
      AND fe.created_by = auth.uid()
    )
  );