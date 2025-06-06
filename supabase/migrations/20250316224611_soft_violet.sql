/*
  # Add Public Policy for Platform Users Table
  
  1. Changes
    - Add policy for admins to view platform users
    - Update existing policies
  
  2. Security
    - Maintain RLS
    - Add specific policy for admin access
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can verify admin emails" ON admins;
  DROP POLICY IF EXISTS "Admins can view platform users" ON platform_users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Add policy for email verification
CREATE POLICY "Public can verify admin emails"
  ON admins
  FOR SELECT
  TO public
  USING (true);

-- Add policy for admins to view platform users
CREATE POLICY "Admins can view platform users"
  ON platform_users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));