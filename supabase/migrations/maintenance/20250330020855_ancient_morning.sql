/*
  # Create Table Layouts System
  
  1. New Tables
    - `table_layouts`
      - For storing table layout configurations
      - Links to form and defines column structure
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create table_layouts table
CREATE TABLE IF NOT EXISTS table_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  header_layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  expandable_rows_layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE table_layouts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read table layouts" 
  ON table_layouts 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert table layouts" 
  ON table_layouts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update table layouts" 
  ON table_layouts 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete table layouts" 
  ON table_layouts 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_table_layouts_updated_at
    BEFORE UPDATE ON table_layouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_table_layouts_form_id ON table_layouts(form_id);
CREATE INDEX IF NOT EXISTS idx_table_layouts_status ON table_layouts(status);

-- Add new permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('table_layouts.view', 'View table layouts', 'Allows viewing table layouts', 'tables'),
  ('table_layouts.create', 'Create table layouts', 'Allows creating new table layouts', 'tables'),
  ('table_layouts.edit', 'Edit table layouts', 'Allows editing table layouts', 'tables'),
  ('table_layouts.delete', 'Delete table layouts', 'Allows deleting table layouts', 'tables')
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
    'table_layouts.view',
    'table_layouts.create',
    'table_layouts.edit',
    'table_layouts.delete'
  )
ON CONFLICT DO NOTHING;