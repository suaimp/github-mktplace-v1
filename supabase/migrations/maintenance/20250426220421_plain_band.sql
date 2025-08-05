/*
  # Add Marketplace Visibility Option
  
  1. Changes
    - Update form_field_settings visibility check constraint
    - Add 'marketplace' as a valid visibility option
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update visibility check constraint to include marketplace
ALTER TABLE form_field_settings
DROP CONSTRAINT IF EXISTS form_field_settings_visibility_check;

ALTER TABLE form_field_settings
ADD CONSTRAINT form_field_settings_visibility_check 
CHECK (visibility IN ('visible', 'hidden', 'admin', 'marketplace'));