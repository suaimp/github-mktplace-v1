/*
  # Fix SMTP Settings

  1. Changes
    - Drop existing policies and triggers
    - Recreate settings table with proper constraints
    - Add RLS policies for admin access
    - Add trigger for updated_at
    - Ensure single settings row exists
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read settings" ON settings;
  DROP POLICY IF EXISTS "Admins can update settings" ON settings;
  DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
  DROP FUNCTION IF EXISTS update_settings_updated_at CASCADE;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  light_logo text,
  dark_logo text,
  platform_icon text,
  smtp_host text,
  smtp_port text,
  smtp_user text,
  smtp_pass text,
  smtp_from_email text,
  smtp_from_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings table
CREATE POLICY "Admins can read settings" 
  ON settings 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update settings" 
  ON settings 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert settings" 
  ON settings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings row if none exists
INSERT INTO settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM settings);