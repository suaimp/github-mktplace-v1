/*
  # Add Sort By Field Setting
  
  1. Changes
    - Add sort_by_field column to form_field_settings table
    - Set default value to false
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add sort_by_field column to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS sort_by_field boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_sort_by_field 
ON form_field_settings(sort_by_field);