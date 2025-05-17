/*
  # Fix Platform Users Migration

  1. Changes
    - Drop existing policies and triggers first
    - Recreate platform_users table
    - Add RLS policies
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Drop existing policies and triggers if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read their own data" ON platform_users;
  DROP POLICY IF EXISTS "Users can update their own data" ON platform_users;
  DROP POLICY IF EXISTS "Allow user creation" ON platform_users;
  DROP TRIGGER IF EXISTS update_platform_users_updated_at ON platform_users;
  DROP FUNCTION IF EXISTS update_platform_users_updated_at CASCADE;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create platform_users table
CREATE TABLE IF NOT EXISTS platform_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('advertiser', 'publisher')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  terms_accepted boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE POLICY "Allow user creation" 
  ON platform_users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platform_users_updated_at
    BEFORE UPDATE ON platform_users
    FOR EACH ROW
    EXECUTE FUNCTION update_platform_users_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_platform_users_role ON platform_users(role);
CREATE INDEX IF NOT EXISTS idx_platform_users_status ON platform_users(status);