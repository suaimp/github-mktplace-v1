/*
  # Add Role Relationships to Users

  1. Changes
    - Add role_id to admins and platform_users tables
    - Add foreign key constraints
    - Update existing users with default roles
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add role_id to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES roles(id);

-- Add role_id to platform_users table
ALTER TABLE platform_users
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES roles(id);

-- Update existing admins to have admin role
UPDATE admins
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE role_id IS NULL;

-- Update existing platform users based on their role
UPDATE platform_users
SET role_id = (
  CASE 
    WHEN role = 'publisher' THEN (SELECT id FROM roles WHERE name = 'publisher')
    WHEN role = 'advertiser' THEN (SELECT id FROM roles WHERE name = 'advertiser')
  END
)
WHERE role_id IS NULL;

-- Make role_id required for new records
ALTER TABLE admins
ALTER COLUMN role_id SET NOT NULL;

ALTER TABLE platform_users
ALTER COLUMN role_id SET NOT NULL;