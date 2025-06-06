/*
  # Fix Platform Users Creation
  
  1. Changes
    - Drop existing policies
    - Add new policy to allow public creation
    - Ensure proper role assignments
  
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

-- Allow public creation without restrictions
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

-- Make role_id nullable temporarily to allow registration flow
ALTER TABLE platform_users
ALTER COLUMN role_id DROP NOT NULL;

-- Ensure default roles exist
INSERT INTO roles (name, description)
VALUES 
  ('publisher', 'Publisher com acesso a ferramentas de publicação'),
  ('advertiser', 'Anunciante com acesso a ferramentas de anúncios')
ON CONFLICT (name) DO NOTHING;