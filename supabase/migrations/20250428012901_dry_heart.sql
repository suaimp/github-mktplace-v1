/*
  # Add Site URL Field Support
  
  1. Changes
    - Add is_site_url column to form_field_settings table
    - Set default value to false
    - Create index for faster lookups
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add is_site_url column to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS is_site_url boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_is_site_url 
ON form_field_settings(is_site_url);