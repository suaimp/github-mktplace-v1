/*
  # Update Storage and Settings Policies

  1. Changes
    - Add storage bucket creation and policies
    - Update settings table policies
    - Add proper error handling
  
  2. Security
    - Enable RLS on settings table
    - Add storage policies for admin access
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

-- Enable storage access for admins
BEGIN;
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('logos', 'logos', true)
  ON CONFLICT (id) DO NOTHING;

  -- Policy to allow authenticated users to create objects in logos bucket
  DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
  CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

  -- Policy to allow authenticated users to update objects in logos bucket
  DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
  CREATE POLICY "Authenticated users can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

  -- Policy to allow public access to read logos
  DROP POLICY IF EXISTS "Public users can read logos" ON storage.objects;
  CREATE POLICY "Public users can read logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'logos');

  -- Policy to allow admins to delete their own logos
  DROP POLICY IF EXISTS "Admins can delete logos" ON storage.objects;
  CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );
COMMIT;