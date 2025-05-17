/*
  # Add Country Settings to Form Field Settings
  
  1. Changes
    - Add countries column for storing selected countries
    - Add show_percentage column for percentage toggle
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS countries jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS show_percentage boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_countries 
ON form_field_settings USING gin(countries);