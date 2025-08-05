/*
  # Create Form Field Settings Table

  1. New Tables
    - `form_field_settings`
      - `id` (uuid, primary key)
      - `field_id` (uuid, references form_fields)
      - `label_text` (text) - Custom label text
      - `label_visibility` (text) - visible/hidden
      - `placeholder_text` (text) - Placeholder text
      - `help_text` (text) - Help text below field
      - `is_required` (boolean)
      - `no_duplicates` (boolean)
      - `visibility` (text) - visible/hidden/admin
      - `validation_type` (text) - Type of validation
      - `validation_regex` (text) - Custom regex pattern
      - `min_length` (integer)
      - `max_length` (integer)
      - `min_value` (numeric)
      - `max_value` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

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

-- Add new permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('forms.field_settings.view', 'View field settings', 'Allows viewing form field settings', 'forms'),
  ('forms.field_settings.edit', 'Edit field settings', 'Allows editing form field settings', 'forms')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.code IN (
    'forms.field_settings.view',
    'forms.field_settings.edit'
  )
ON CONFLICT DO NOTHING;