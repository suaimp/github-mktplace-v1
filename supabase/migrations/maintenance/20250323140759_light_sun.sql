/*
  # Add Date and Time Format Settings
  
  1. Changes
    - Add date_format and time_format columns to form_field_settings table
    - Add default values for Brazilian formats
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add date and time format columns
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS date_format text DEFAULT 'dd/mm/yyyy',
ADD COLUMN IF NOT EXISTS time_format text DEFAULT 'HH:mm';