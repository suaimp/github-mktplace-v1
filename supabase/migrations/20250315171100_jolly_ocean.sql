/*
  # Update Admin Policies for Data Management
  
  1. Changes
    - Add policies for admins to update their own data
    - Add policies for admins to delete their own account
    - Ensure proper data access control
  
  2. Security
    - Enable RLS
    - Add policies for admin data management
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read their own data" ON admins;
  DROP POLICY IF EXISTS "Admins can update their own data" ON admins;
  DROP POLICY IF EXISTS "Admins can delete their own account" ON admins;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can read their own data" 
  ON admins 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update their own data" 
  ON admins 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete their own account" 
  ON admins 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);