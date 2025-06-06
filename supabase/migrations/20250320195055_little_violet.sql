/*
  # Fix Form Fields Migration
  
  1. Changes
    - Drop existing policies first
    - Recreate form_fields table
    - Add RLS policies
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read form fields" ON form_fields;
  DROP POLICY IF EXISTS "Admins can insert form fields" ON form_fields;
  DROP POLICY IF EXISTS "Admins can update form fields" ON form_fields;
  DROP POLICY IF EXISTS "Admins can delete form fields" ON form_fields;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create form_fields table if not exists
CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  field_type text NOT NULL,
  label text NOT NULL,
  description text,
  placeholder text,
  default_value text,
  options jsonb DEFAULT '[]'::jsonb,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  is_required boolean DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  width text DEFAULT 'full',
  css_class text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT form_fields_field_type_check CHECK (
    field_type IN (
      'text',
      'textarea', 
      'number',
      'email',
      'phone',
      'url',
      'date',
      'time',
      'select',
      'multiselect',
      'radio',
      'checkbox',
      'file',
      'hidden',
      'html'
    )
  ),
  CONSTRAINT form_fields_width_check CHECK (
    width IN ('full', 'half', 'third', 'quarter')
  )
);

-- Enable RLS
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read form fields" 
  ON form_fields 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

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

-- Drop existing trigger if exists
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_form_fields_updated_at ON form_fields;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_form_fields_updated_at
    BEFORE UPDATE ON form_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop existing indexes if they exist
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_form_fields_form_id;
  DROP INDEX IF EXISTS idx_form_fields_position;
  DROP INDEX IF EXISTS idx_form_fields_field_type;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_position ON form_fields(position);
CREATE INDEX IF NOT EXISTS idx_form_fields_field_type ON form_fields(field_type);

-- Add new permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('forms.fields.view', 'View form fields', 'Allows viewing form fields', 'forms'),
  ('forms.fields.create', 'Create form fields', 'Allows creating new form fields', 'forms'),
  ('forms.fields.edit', 'Edit form fields', 'Allows editing form fields', 'forms'),
  ('forms.fields.delete', 'Delete form fields', 'Allows deleting form fields', 'forms')
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
    'forms.fields.view',
    'forms.fields.create', 
    'forms.fields.edit',
    'forms.fields.delete'
  )
ON CONFLICT DO NOTHING;