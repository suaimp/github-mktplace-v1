/*
  # Fix Platform Users Registration
  
  1. Changes
    - Drop existing policies
    - Add proper RLS policies for registration
    - Fix role_id requirement
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read their own data" ON platform_users;
  DROP POLICY IF EXISTS "Users can update their own data" ON platform_users;
  DROP POLICY IF EXISTS "Allow user creation" ON platform_users;
  DROP POLICY IF EXISTS "Public can verify user emails" ON platform_users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data" 
  ON platform_users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON platform_users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow both authenticated and anonymous users to create accounts
CREATE POLICY "Allow user creation" 
  ON platform_users 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Allow public email verification
CREATE POLICY "Public can verify user emails"
  ON platform_users
  FOR SELECT
  TO public
  USING (true);

-- Ensure roles exist and get proper IDs
INSERT INTO roles (name, description)
VALUES 
  ('publisher', 'Publisher com acesso a ferramentas de publicação'),
  ('advertiser', 'Anunciante com acesso a ferramentas de anúncios')
ON CONFLICT (name) DO NOTHING;