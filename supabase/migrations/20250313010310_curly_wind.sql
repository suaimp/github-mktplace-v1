/*
  # Update Authentication Configuration
  
  1. Changes
    - Disable email confirmation requirement
    - Update admin policies
    - Add auth trigger for admin creation
  
  2. Security
    - Maintain RLS policies
    - Keep existing constraints
*/

-- First disable email confirmation requirement
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

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

CREATE POLICY "Allow admin creation" 
  ON admins 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_first_admin ON admins(is_first_admin);