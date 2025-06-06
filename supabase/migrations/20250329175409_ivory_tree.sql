/*
  # Update Form Policies to Allow Public Access
  
  1. Changes
    - Drop existing policies
    - Create new policies that allow public access to forms
    - Maintain admin-only restrictions for management
  
  2. Security
    - Keep admin-only restrictions for create/update/delete
    - Allow public read access
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read forms" ON forms;
  DROP POLICY IF EXISTS "Admins can insert forms" ON forms;
  DROP POLICY IF EXISTS "Admins can update forms" ON forms;
  DROP POLICY IF EXISTS "Admins can delete forms" ON forms;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Anyone can read published forms" 
  ON forms 
  FOR SELECT 
  TO public 
  USING (
    -- Allow access to published forms
    status = 'published'
    OR
    -- Admins can see all forms
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert forms" 
  ON forms 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update forms" 
  ON forms 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete forms" 
  ON forms 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Update form entries policies
DROP POLICY IF EXISTS "Admins can read form entries" ON form_entries;
CREATE POLICY "Anyone can read form entries" 
  ON form_entries 
  FOR SELECT 
  TO public 
  USING (true);

-- Update form entry values policies
DROP POLICY IF EXISTS "Admins can read entry values" ON form_entry_values;
CREATE POLICY "Anyone can read entry values" 
  ON form_entry_values 
  FOR SELECT 
  TO public 
  USING (true);