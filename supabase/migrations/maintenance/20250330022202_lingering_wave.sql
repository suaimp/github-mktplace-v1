/*
  # Fix Table Layouts Schema
  
  1. Changes
    - Drop existing table if exists
    - Create table with proper constraints
    - Add unique constraint on form_id
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing table if exists
DROP TABLE IF EXISTS table_layouts CASCADE;

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
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT table_layouts_form_id_unique UNIQUE (form_id)
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