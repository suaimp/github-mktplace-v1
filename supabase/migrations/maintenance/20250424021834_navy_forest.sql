/*
  # Fix Menu Visibility for Platform Users
  
  1. Changes
    - Update menu_items policies to properly respect visibility settings
    - Ensure platform users can see appropriate menu items
  
  2. Security
    - Maintain RLS
    - Add proper access control
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read menu_items" ON menu_items;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policy with proper visibility checks
CREATE POLICY "Admins can read menu_items" 
  ON menu_items 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Admins can see all menu items
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    OR
    -- Platform users can see items based on visibility
    (
      EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid())
      AND (
        visible_to = 'all'
        OR
        visible_to = (SELECT role FROM platform_users WHERE id = auth.uid())
      )
    )
  );