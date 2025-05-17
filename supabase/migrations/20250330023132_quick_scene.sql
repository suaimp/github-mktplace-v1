-- First check if the constraint already exists and drop it if it does
DO $$ 
BEGIN
  -- Try to drop the constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'table_layouts_form_id_unique'
  ) THEN
    ALTER TABLE table_layouts DROP CONSTRAINT table_layouts_form_id_unique;
  END IF;

  -- Add the constraint
  ALTER TABLE table_layouts
  ADD CONSTRAINT table_layouts_form_id_unique UNIQUE (form_id);
EXCEPTION
  WHEN others THEN
    -- If there's any error, do nothing (constraint may already exist)
    NULL;
END $$;