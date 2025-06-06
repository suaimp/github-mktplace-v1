/*
  # Create Admin Authentication Schema

  1. New Tables
    - `admins`
      - `id` (uuid, primary key) - Maps to auth.users.id
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `is_first_admin` (boolean) - Indicates if this is the first admin
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admins` table
    - Add policies for admin access
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  is_first_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
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