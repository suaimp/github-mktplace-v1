/*
  # Create Service Packages System
  
  1. New Tables
    - `service_packages`
      - For storing service package information
      - Includes title, description, price
    - `service_package_items`
      - For storing items within a service package
      - Includes name, included status, and order
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_package_items table
CREATE TABLE IF NOT EXISTS service_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES service_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_included boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_items ENABLE ROW LEVEL SECURITY;

-- Create policies for service_packages
CREATE POLICY "Admins can read service packages" 
  ON service_packages 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert service packages" 
  ON service_packages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update service packages" 
  ON service_packages 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete service packages" 
  ON service_packages 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create policies for service_package_items
CREATE POLICY "Admins can read service package items" 
  ON service_package_items 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert service package items" 
  ON service_package_items 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update service package items" 
  ON service_package_items 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete service package items" 
  ON service_package_items 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_service_packages_updated_at
    BEFORE UPDATE ON service_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_package_items_updated_at
    BEFORE UPDATE ON service_package_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_status ON service_packages(status);
CREATE INDEX IF NOT EXISTS idx_service_package_items_package_id ON service_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_service_package_items_position ON service_package_items(position);

-- Add new permissions
INSERT INTO permissions (code, name, description, category) VALUES
  ('service_packages.view', 'View service packages', 'Allows viewing service packages', 'service_packages'),
  ('service_packages.create', 'Create service packages', 'Allows creating new service packages', 'service_packages'),
  ('service_packages.edit', 'Edit service packages', 'Allows editing service packages', 'service_packages'),
  ('service_packages.delete', 'Delete service packages', 'Allows deleting service packages', 'service_packages')
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
    'service_packages.view',
    'service_packages.create',
    'service_packages.edit',
    'service_packages.delete'
  )
ON CONFLICT DO NOTHING;

-- Add public access policy for published packages
CREATE POLICY "Anyone can view published service packages" 
  ON service_packages 
  FOR SELECT 
  TO public 
  USING (
    status = 'published'
  );

CREATE POLICY "Anyone can view service package items" 
  ON service_package_items 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 
      FROM service_packages sp
      WHERE sp.id = package_id
      AND sp.status = 'published'
    )
  );