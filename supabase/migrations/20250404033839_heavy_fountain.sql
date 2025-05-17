-- Drop existing constraint if it exists
DO $$ BEGIN
  ALTER TABLE form_entries
  DROP CONSTRAINT IF EXISTS form_entries_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add status column to form_entries table if it doesn't exist
ALTER TABLE form_entries
ADD COLUMN IF NOT EXISTS status text DEFAULT 'em_analise';

-- Update existing entries to have default status
UPDATE form_entries 
SET status = 'em_analise' 
WHERE status IS NULL OR status = 'active';

-- Add check constraint with all valid status values
ALTER TABLE form_entries 
ADD CONSTRAINT form_entries_status_check 
CHECK (status IN ('em_analise', 'verificado', 'reprovado', 'active', 'spam', 'trash'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_form_entries_status 
ON form_entries(status);