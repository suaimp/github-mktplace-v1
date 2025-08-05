-- Add date and time format columns
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS date_format text DEFAULT 'dd/mm/yyyy',
ADD COLUMN IF NOT EXISTS time_format text DEFAULT 'HH:mm';