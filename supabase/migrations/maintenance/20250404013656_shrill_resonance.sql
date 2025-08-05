/*
  # Add Status Field to Form Entries
  
  1. Changes
    - Add status column to form_entries table
    - Update existing entries to have default status
    - Add check constraint for valid values
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add status column to form_entries table if it doesn't exist
DO $$ 
BEGIN
  -- Check if the column already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'form_entries' 
    AND column_name = 'status'
  ) THEN
    -- Add the column with default value
    ALTER TABLE form_entries 
    ADD COLUMN status text DEFAULT 'em_analise';
    
    -- Update existing entries to have default status
    UPDATE form_entries 
    SET status = 'em_analise' 
    WHERE status IS NULL;
    
    -- Add check constraint
    ALTER TABLE form_entries 
    ADD CONSTRAINT form_entries_status_check 
    CHECK (status IN ('em_analise', 'ativo', 'desativado', 'active', 'spam', 'trash'));
  END IF;
END $$;

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