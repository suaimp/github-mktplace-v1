/*
  # Create Services Management System
  
  1. New Tables
    - `services`
      - For storing service information
      - Includes title, description, status
      - Created and updated timestamps
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Admins can read services" 
  ON services 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert services" 
  ON services 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update services" 
  ON services 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete services" 
  ON services 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Add new permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('services.view', 'View services', 'Allows viewing services', 'services'),
  ('services.create', 'Create services', 'Allows creating new services', 'services'),
  ('services.edit', 'Edit services', 'Allows editing services', 'services'),
  ('services.delete', 'Delete services', 'Allows deleting services', 'services')
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
    'services.view',
    'services.create',
    'services.edit',
    'services.delete'
  )
ON CONFLICT DO NOTHING;

-- Add Services menu item
INSERT INTO menu_items (
  name,
  description,
  icon,
  path,
  position,
  is_visible,
  visible_to
) VALUES (
  'Services',
  'Manage services',
  'BoxIcon',
  '/services',
  6, -- Position after Forms
  true,
  'all'
)
ON CONFLICT (id) DO NOTHING;