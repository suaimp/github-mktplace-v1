/*
  # Add Button Position Last Column Option
  
  1. Changes
    - Add position_last_column column to form_field_settings table
    - Set default value to false
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add position_last_column column to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS position_last_column boolean DEFAULT false;