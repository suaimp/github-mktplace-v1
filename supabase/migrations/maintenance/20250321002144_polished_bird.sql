/*
  # Add Field Identifier to Form Field Settings
  
  1. Changes
    - Add field_identifier column to form_field_settings table
    - Update existing constraints and indexes
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add field_identifier column to form_field_settings table
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS field_identifier text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_field_identifier 
ON form_field_settings(field_identifier);

-- Update existing settings to use css_class as field_identifier
UPDATE form_field_settings ffs
SET field_identifier = ff.css_class
FROM form_fields ff
WHERE ffs.field_id = ff.id
  AND ffs.field_identifier IS NULL
  AND ff.css_class IS NOT NULL;