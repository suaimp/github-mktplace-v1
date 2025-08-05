/*
  # Add Columns Field to Form Field Settings
  
  1. Changes
    - Add columns field to form_field_settings table
    - Add check constraint for valid values
    - Set default value
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add columns field to form_field_settings table
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS columns smallint DEFAULT 1 CHECK (columns IN (1, 2, 3));