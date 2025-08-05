/*
  # Fix Form Field Settings Table
  
  1. Changes
    - Drop existing table if exists
    - Create form_field_settings table with proper constraints
    - Add RLS policies
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing table if exists
DROP TABLE IF EXISTS form_field_settings CASCADE;

-- Create form_field_settings table
CREATE TABLE IF NOT EXISTS form_field_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES form_fields(id) ON DELETE CASCADE,
  label_text text,
  label_visibility text CHECK (label_visibility IN ('visible', 'hidden')),
  placeholder_text text,
  help_text text,
  is_required boolean DEFAULT false,
  no_duplicates boolean DEFAULT false,
  visibility text DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden', 'admin')),
  validation_type text,
  validation_regex text,
  min_length integer,
  max_length integer,
  min_value numeric,
  max_value numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT form_field_settings_field_id_key UNIQUE (field_id)
);

-- Enable RLS
ALTER TABLE form_field_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
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
  ));

CREATE POLICY "Admins can delete form field settings" 
  ON form_field_settings 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_form_field_settings_updated_at
    BEFORE UPDATE ON form_field_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_form_field_settings_field_id ON form_field_settings(field_id);
CREATE INDEX IF NOT EXISTS idx_form_field_settings_validation_type ON form_field_settings(validation_type);