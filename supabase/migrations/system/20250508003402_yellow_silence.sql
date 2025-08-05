/*
  # Create service packages tables

  1. New Tables
    - `service_packages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `price` (numeric)
      - `status` (text)
      - `created_by` (uuid, references admins)
      - `updated_by` (uuid, references admins)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `service_package_items`
      - `id` (uuid, primary key)
      - `package_id` (uuid, references service_packages)
      - `name` (text)
      - `is_included` (boolean)
      - `position` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for admins to manage packages and items
*/

-- Create service_packages table
CREATE TABLE IF NOT EXISTS service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT service_packages_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create service_package_items table
CREATE TABLE IF NOT EXISTS service_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_included boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_items ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_status ON service_packages(status);
CREATE INDEX IF NOT EXISTS idx_service_packages_created_at ON service_packages(created_at);
CREATE INDEX IF NOT EXISTS idx_service_package_items_package_id ON service_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_service_package_items_position ON service_package_items(position);

-- Create policies for service_packages
CREATE POLICY "Admins can manage service packages"
  ON service_packages
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create policies for service_package_items
CREATE POLICY "Admins can manage service package items"
  ON service_package_items
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_packages_updated_at
  BEFORE UPDATE ON service_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_package_items_updated_at
  BEFORE UPDATE ON service_package_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();