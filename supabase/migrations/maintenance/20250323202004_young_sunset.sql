/*
  # Fix Brazilian States Settings
  
  1. Changes
    - Drop existing policies
    - Add proper constraints for country relation fields
    - Update existing settings
    - Add proper RLS policies
  
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

-- Add country relation columns if they don't exist
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS country_relation_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS country_field_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_country_field_id 
ON form_field_settings(country_field_id);

-- Enable RLS
ALTER TABLE form_field_settings ENABLE ROW LEVEL SECURITY;

-- Create policies with proper permissions
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

-- Update existing brazilian_states fields to have default values
UPDATE form_field_settings
SET 
  country_relation_enabled = false
WHERE field_id IN (
  SELECT id FROM form_fields WHERE field_type = 'brazilian_states'
)
AND country_relation_enabled IS NULL;