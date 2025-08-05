/*
  # Create Table Displays System
  
  1. New Tables
    - `table_displays`
      - For storing table display configurations
      - Links to form for data source
      - Includes title, description, settings
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create table_displays table
CREATE TABLE IF NOT EXISTS table_displays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  columns jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE table_displays ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read table displays" 
  ON table_displays 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert table displays" 
  ON table_displays 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update table displays" 
  ON table_displays 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete table displays" 
  ON table_displays 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_table_displays_updated_at
    BEFORE UPDATE ON table_displays
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_table_displays_form_id ON table_displays(form_id);
CREATE INDEX IF NOT EXISTS idx_table_displays_status ON table_displays(status);

-- Add new permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('tables.view', 'View table displays', 'Allows viewing table displays', 'tables'),
  ('tables.create', 'Create table displays', 'Allows creating new table displays', 'tables'),
  ('tables.edit', 'Edit table displays', 'Allows editing table displays', 'tables'),
  ('tables.delete', 'Delete table displays', 'Allows deleting table displays', 'tables')
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
    'tables.view',
    'tables.create',
    'tables.edit',
    'tables.delete'
  )
ON CONFLICT DO NOTHING;