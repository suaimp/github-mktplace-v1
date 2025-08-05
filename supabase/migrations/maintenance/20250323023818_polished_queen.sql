/*
  # Create Form Entries System
  
  1. New Tables
    - `form_entries`
      - Main table for form submissions
      - Stores metadata about each submission
    
    - `form_entry_values` 
      - Stores individual field values for each submission
      - Uses EAV (Entity-Attribute-Value) model for flexibility
    
    - `form_entry_notes`
      - For admin notes/comments on entries
  
  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Create form_entries table
CREATE TABLE IF NOT EXISTS form_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'spam', 'trash')),
  ip_address text,
  user_agent text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form_entry_values table (EAV model)
CREATE TABLE IF NOT EXISTS form_entry_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES form_entries(id) ON DELETE CASCADE,
  field_id uuid REFERENCES form_fields(id) ON DELETE CASCADE,
  value text,
  value_json jsonb, -- For complex values like file uploads, multi-select, etc
  created_at timestamptz DEFAULT now()
);

-- Create form_entry_notes table
CREATE TABLE IF NOT EXISTS form_entry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES form_entries(id) ON DELETE CASCADE,
  note text NOT NULL,
  type text DEFAULT 'note' CHECK (type IN ('note', 'system')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE form_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entry_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entry_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for form_entries
CREATE POLICY "Admins can read form entries" 
  ON form_entries 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Anyone can create form entries" 
  ON form_entries 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

CREATE POLICY "Admins can update form entries" 
  ON form_entries 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete form entries" 
  ON form_entries 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create policies for form_entry_values
CREATE POLICY "Admins can read entry values" 
  ON form_entry_values 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Anyone can create entry values" 
  ON form_entry_values 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Create policies for form_entry_notes
CREATE POLICY "Admins can read entry notes" 
  ON form_entry_notes 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can create entry notes" 
  ON form_entry_notes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update entry notes" 
  ON form_entry_notes 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete entry notes" 
  ON form_entry_notes 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_entries_form_id ON form_entries(form_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_status ON form_entries(status);
CREATE INDEX IF NOT EXISTS idx_form_entries_created_at ON form_entries(created_at);

CREATE INDEX IF NOT EXISTS idx_form_entry_values_entry_id ON form_entry_values(entry_id);
CREATE INDEX IF NOT EXISTS idx_form_entry_values_field_id ON form_entry_values(field_id);

CREATE INDEX IF NOT EXISTS idx_form_entry_notes_entry_id ON form_entry_notes(entry_id);
CREATE INDEX IF NOT EXISTS idx_form_entry_notes_created_at ON form_entry_notes(created_at);

-- Add new permissions for form entries
INSERT INTO permissions (code, name, description, category) VALUES
  ('forms.entries.view', 'View form entries', 'Allows viewing form submissions', 'forms'),
  ('forms.entries.manage', 'Manage form entries', 'Allows managing form submissions', 'forms'),
  ('forms.entries.delete', 'Delete form entries', 'Allows deleting form submissions', 'forms'),
  ('forms.entries.export', 'Export form entries', 'Allows exporting form submissions', 'forms')
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
    'forms.entries.view',
    'forms.entries.manage',
    'forms.entries.delete',
    'forms.entries.export'
  )
ON CONFLICT DO NOTHING;