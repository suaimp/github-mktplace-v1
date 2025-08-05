/*
  # Update Form Field Policies to Allow Public Access
  
  1. Changes
    - Drop existing policies
    - Create new policies that allow public access to form fields
    - Maintain admin-only restrictions for management
  
  2. Security
    - Keep admin-only restrictions for create/update/delete
    - Allow public read access
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read form fields" ON form_fields;
  DROP POLICY IF EXISTS "Admins can insert form fields" ON form_fields;
  DROP POLICY IF EXISTS "Admins can update form fields" ON form_fields;
  DROP POLICY IF EXISTS "Admins can delete form fields" ON form_fields;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Anyone can read form fields" 
  ON form_fields 
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admins can insert form fields" 
  ON form_fields 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update form fields" 
  ON form_fields 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete form fields" 
  ON form_fields 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Drop existing policies for form field settings
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read form field settings" ON form_field_settings;
  DROP POLICY IF EXISTS "Admins can insert form field settings" ON form_field_settings;
  DROP POLICY IF EXISTS "Admins can update form field settings" ON form_field_settings;
  DROP POLICY IF EXISTS "Admins can delete form field settings" ON form_field_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies for form field settings
CREATE POLICY "Anyone can read form field settings" 
  ON form_field_settings 
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admins can insert form field settings" 
  ON form_field_settings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update form field settings" 
  ON form_field_settings 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete form field settings" 
  ON form_field_settings 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));