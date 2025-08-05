/*
  # Fix Table Layouts Unique Constraint
  
  1. Changes
    - Drop existing constraint if it exists
    - Add unique constraint on form_id column
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing constraint if it exists
DO $$ BEGIN
  ALTER TABLE table_layouts
  DROP CONSTRAINT IF EXISTS table_layouts_form_id_unique;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add unique constraint
ALTER TABLE table_layouts
ADD CONSTRAINT table_layouts_form_id_unique UNIQUE (form_id);