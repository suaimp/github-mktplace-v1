/*
  # Fix Registration Role Issues
  
  1. Changes
    - Ensure required roles exist in roles table
    - Make role_id properly nullable for registration flow
    - Add RLS policies to allow anonymous users to read roles during registration
    - Add RLS policies to allow anonymous users to create platform_users during registration
    - Add helpful comments
  
  2. Security
    - Maintain existing RLS policies for authenticated users
    - Allow anonymous access only for registration-related operations
*/

-- Ensure required roles exist
INSERT INTO roles (name, description)
VALUES 
  ('publisher', 'Publisher com acesso a ferramentas de publicação'),
  ('advertiser', 'Anunciante com acesso a ferramentas de anúncios'),
  ('admin', 'Administrador com acesso total ao sistema')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- Ensure role_id can be null during registration flow
ALTER TABLE platform_users
ALTER COLUMN role_id DROP NOT NULL;

-- Drop existing policies for roles table
DROP POLICY IF EXISTS "Allow public read access to roles" ON roles;
DROP POLICY IF EXISTS "Allow anonymous read access to roles" ON roles;

-- Add RLS policy to allow anonymous users to read roles during registration
CREATE POLICY "Allow anonymous read access to roles" 
  ON roles 
  FOR SELECT 
  TO anon, public
  USING (true);

-- Drop existing policies for platform_users registration
DROP POLICY IF EXISTS "Allow user creation" ON platform_users;
DROP POLICY IF EXISTS "Allow anonymous user creation" ON platform_users;
DROP POLICY IF EXISTS "Users can read their own data" ON platform_users;
DROP POLICY IF EXISTS "Users can update their own data" ON platform_users;

-- Add RLS policy to allow anonymous users to create platform_users during registration
CREATE POLICY "Allow anonymous user creation" 
  ON platform_users 
  FOR INSERT 
  TO anon, public
  WITH CHECK (true);

-- Recreate authenticated user policies for platform_users
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

-- Add helpful comment
COMMENT ON COLUMN platform_users.role_id IS 'Foreign key to roles table. Can be null during registration flow but should be set after role verification.';
