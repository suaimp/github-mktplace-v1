/*
  # Update Admin Table Schema and Policies

  1. Changes
    - Drop existing policies
    - Recreate admin table with proper constraints
    - Add RLS policies for admin access
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for admin data access
    - Ensure proper cascade deletion
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read their own data" ON admins;
  DROP POLICY IF EXISTS "Admins can update their own data" ON admins;
  DROP POLICY IF EXISTS "Allow admin creation" ON admins;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create admins table with proper constraints and references
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  is_first_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  USING (auth.uid() = id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_first_admin ON admins(is_first_admin);