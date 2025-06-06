/*
  # Add Form Redirect Page Column
  
  1. Changes
    - Add redirect_page column to forms table
    - Update existing forms table structure
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add redirect_page column to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS redirect_page text;

-- Update forms table constraints
DO $$ BEGIN
  ALTER TABLE forms
    DROP CONSTRAINT IF EXISTS forms_status_check;
  
  ALTER TABLE forms
    ADD CONSTRAINT forms_status_check 
    CHECK (status IN ('draft', 'published', 'archived'));
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forms_redirect_page ON forms(redirect_page);