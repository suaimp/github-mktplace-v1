-- Add file upload settings columns
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS allowed_extensions text,
ADD COLUMN IF NOT EXISTS multiple_files boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_files integer CHECK (max_files > 0),
ADD COLUMN IF NOT EXISTS max_file_size integer CHECK (max_file_size > 0);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_field_settings_multiple_files 
ON form_field_settings(multiple_files);