/*
  # Add Inline Layout Option for Form Fields
  
  1. Changes
    - Add inline_layout column to form_field_settings table
    - Add default value of false
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add inline_layout column to form_field_settings table
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS inline_layout boolean DEFAULT false;