-- Add country relation columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS country_relation_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS country_field_id text;