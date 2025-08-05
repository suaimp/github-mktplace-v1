/*
  # Fix Form Field Settings Permissions
  
  1. Changes
    - Drop existing policies
    - Add new policies for form field settings
    - Ensure proper permissions for saving settings
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read form field settings" ON form_field_settings;
  DROP POLICY IF EXISTS "Admins can insert form field settings" ON form_field_settings;
  DROP POLICY IF EXISTS "Admins can update form field settings" ON form_field_settings;
  DROP POLICY IF EXISTS "Admins can delete form field settings" ON form_field_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE form_field_settings ENABLE ROW LEVEL SECURITY;

-- Create policies with broader permissions
CREATE POLICY "Admins can read form field settings" 
  ON form_field_settings 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

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
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete form field settings" 
  ON form_field_settings 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Add index for faster permission checks
CREATE INDEX IF NOT EXISTS idx_form_field_settings_field_id ON form_field_settings(field_id);