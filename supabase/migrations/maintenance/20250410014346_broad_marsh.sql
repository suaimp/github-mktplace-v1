/*
  # Add Policies for User Form Entries
  
  1. Changes
    - Add policies to allow users to view their own entries
    - Add policies to allow users to edit their own entries
  
  2. Security
    - Maintain RLS
    - Add proper access control
*/

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