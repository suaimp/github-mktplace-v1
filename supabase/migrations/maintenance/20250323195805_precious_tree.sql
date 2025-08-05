-- Add country relation columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS country_relation_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS country_field_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_country_field_id 
ON form_field_settings(country_field_id);