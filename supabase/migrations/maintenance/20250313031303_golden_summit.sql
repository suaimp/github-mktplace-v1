/*
  # Create Settings Configuration Table

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `light_logo` (text) - URL/path for light theme logo
      - `dark_logo` (text) - URL/path for dark theme logo
      - `platform_icon` (text) - URL/path for platform icon (512x512)
      - `smtp_host` (text)
      - `smtp_port` (text)
      - `smtp_user` (text)
      - `smtp_pass` (text)
      - `smtp_from_email` (text)
      - `smtp_from_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on settings table
    - Add policies for admin access
*/

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

-- Create policies
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

-- Insert default settings row
INSERT INTO settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;