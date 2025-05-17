/*
  # Add Input Mask Support to Form Field Settings
  
  1. Changes
    - Add input_mask_enabled column (boolean)
    - Add input_mask_pattern column (text)
    - Add field_identifier column if not exists
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add input mask columns to form_field_settings table
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS input_mask_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS input_mask_pattern text,
ADD COLUMN IF NOT EXISTS field_identifier text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_field_identifier 
ON form_field_settings(field_identifier);