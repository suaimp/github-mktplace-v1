-- SQL Script to fix form_entry_values duplication issue
-- This script adds the necessary unique constraint to prevent duplicates
-- when multiple admins edit the same entry

-- 1. Add the unique constraint to prevent future duplicates
-- This ensures that each entry can have only one value per field
-- Note: If constraint already exists, this will give an error (which is fine)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'form_entry_values' 
    AND constraint_name = 'unique_entry_field'
  ) THEN
    ALTER TABLE form_entry_values 
    ADD CONSTRAINT unique_entry_field 
    UNIQUE (entry_id, field_id);
  END IF;
END $$;

-- 2. Verify the constraint was added successfully
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'form_entry_values' 
  AND constraint_name = 'unique_entry_field';

-- 3. Check for any remaining duplicates (should return 0 rows after cleanup)
-- This query should return 0 rows after the cleanup
SELECT 
  entry_id,
  field_id,
  COUNT(*) as duplicate_count
FROM form_entry_values
GROUP BY entry_id, field_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
