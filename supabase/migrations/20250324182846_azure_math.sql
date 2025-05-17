/*
  # Fix Platform Users Registration Permissions
  
  1. Changes
    - Drop existing policies
    - Add new policy to allow public registration
    - Update existing policies for authenticated users
  
  2. Security
    - Enable RLS
    - Add proper policies for user access
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
  TO anon, authenticated
  WITH CHECK (
    -- Allow creation if authenticated user matches the ID
    -- OR if no authenticated user (anon registration)
    (auth.uid() = id OR auth.uid() IS NULL)
  );

-- Allow public email verification
CREATE POLICY "Public can verify user emails"
  ON platform_users
  FOR SELECT
  TO public
  USING (true);