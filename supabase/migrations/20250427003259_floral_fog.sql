-- Add button_style column to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'primary';