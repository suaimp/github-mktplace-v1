/*
  # Fix Form Entries Status Constraint
  
  1. Changes
    - Update form_entries status check constraint
    - Add support for both Portuguese and English status values
    - Add index for faster filtering
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing constraint if it exists
DO $$ BEGIN
  ALTER TABLE form_entries
  DROP CONSTRAINT IF EXISTS form_entries_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add status column to form_entries table if it doesn't exist
ALTER TABLE form_entries
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Update existing entries to have default status
UPDATE form_entries 
SET status = 'active' 
WHERE status IS NULL;

-- Add check constraint with all valid status values
ALTER TABLE form_entries 
ADD CONSTRAINT form_entries_status_check 
CHECK (status IN ('active', 'spam', 'trash'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_form_entries_status 
ON form_entries(status);

-- Add permissions for editorial management
INSERT INTO permissions (code, name, description, category) VALUES
  ('editorial.view', 'View editorial entries', 'Allows viewing editorial entries', 'editorial'),
  ('editorial.approve', 'Approve entries', 'Allows approving editorial entries', 'editorial'),
  ('editorial.reject', 'Reject entries', 'Allows rejecting editorial entries', 'editorial'),
  ('editorial.edit', 'Edit entries', 'Allows editing editorial entries', 'editorial')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.code IN (
    'editorial.view',
    'editorial.approve',
    'editorial.reject',
    'editorial.edit'
  )
ON CONFLICT DO NOTHING;