/*
  # Fix Form Entries Policies for Publishers
  
  1. Changes
    - Update form entries policies to allow publishers to submit forms
    - Fix entry creation and value insertion policies
  
  2. Security
    - Maintain RLS
    - Add proper access control
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can create form entries" ON form_entries;
  DROP POLICY IF EXISTS "Anyone can create entry values" ON form_entry_values;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies for form entries
CREATE POLICY "Anyone can create form entries" 
  ON form_entries 
  FOR INSERT 
  TO public 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM forms f
      WHERE f.id = form_entries.form_id
      AND f.status = 'published'
    )
  );

-- Create new policies for form entry values
CREATE POLICY "Anyone can create entry values" 
  ON form_entry_values 
  FOR INSERT 
  TO public 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      JOIN forms f ON f.id = fe.form_id
      WHERE fe.id = form_entry_values.entry_id
      AND f.status = 'published'
    )
  );

-- Update form entries status constraint to include all possible statuses
ALTER TABLE form_entries
DROP CONSTRAINT IF EXISTS form_entries_status_check;

ALTER TABLE form_entries
ADD CONSTRAINT form_entries_status_check 
CHECK (status IN ('em_analise', 'verificado', 'reprovado', 'active', 'spam', 'trash'));