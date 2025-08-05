/*
  # Add Max Selections Column to Form Field Settings
  
  1. Changes
    - Add max_selections column to form_field_settings table
    - Add check constraint to ensure valid values
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add max_selections column to form_field_settings table
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS max_selections integer CHECK (max_selections > 0);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_max_selections 
ON form_field_settings(max_selections);