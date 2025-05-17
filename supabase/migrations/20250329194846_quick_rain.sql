-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read published forms" ON forms;
  DROP POLICY IF EXISTS "Anyone can create form entries" ON form_entries;
  DROP POLICY IF EXISTS "Anyone can create entry values" ON form_entry_values;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies for forms
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

-- Create new policies for form entries
CREATE POLICY "Anyone can create form entries" 
  ON form_entries 
  FOR INSERT 
  TO public 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM forms f
      WHERE f.id = form_id
      AND f.status = 'published'
  ));

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
      WHERE fe.id = entry_id
      AND f.status = 'published'
    )
  );