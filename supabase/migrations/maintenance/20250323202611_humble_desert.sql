/*
  # Fix Brazilian States Relation Settings
  
  1. Changes
    - Drop and recreate country_relation_enabled column
    - Add proper default value and constraint
    - Update existing settings
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop and recreate column with proper default
ALTER TABLE form_field_settings 
DROP COLUMN IF EXISTS country_relation_enabled;

ALTER TABLE form_field_settings
ADD COLUMN country_relation_enabled boolean NOT NULL DEFAULT false;

-- Update existing brazilian_states fields
UPDATE form_field_settings
SET country_relation_enabled = false
WHERE field_id IN (
  SELECT id FROM form_fields 
  WHERE field_type = 'brazilian_states'
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_country_relation 
ON form_field_settings(country_relation_enabled);