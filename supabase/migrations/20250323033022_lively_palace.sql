/*
  # Add Disable Quantity Column to Form Field Settings
  
  1. Changes
    - Add disable_quantity column to form_field_settings table
    - Set default value to false
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add disable_quantity column to form_field_settings table
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS disable_quantity boolean DEFAULT false;