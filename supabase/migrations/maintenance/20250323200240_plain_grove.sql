/*
  # Fix Country Relation Settings
  
  1. Changes
    - Add country relation columns if not exists
    - Create index for faster lookups
    - Add default values
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add country relation columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS country_relation_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS country_field_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_country_field_id 
ON form_field_settings(country_field_id);

-- Update existing brazilian_states fields to have default values
UPDATE form_field_settings
SET 
  country_relation_enabled = false,
  country_field_id = NULL
WHERE field_id IN (
  SELECT id FROM form_fields WHERE field_type = 'brazilian_states'
)
AND country_relation_enabled IS NULL;