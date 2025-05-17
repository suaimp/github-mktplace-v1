/*
  # Add Unique Constraint to Table Layouts
  
  1. Changes
    - Add unique constraint on form_id column
    - Ensure only one layout per form
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add unique constraint on form_id
ALTER TABLE table_layouts
ADD CONSTRAINT table_layouts_form_id_unique UNIQUE (form_id);