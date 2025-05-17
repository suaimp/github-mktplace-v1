/*
  # Add Button Buy Field Type Support
  
  1. Changes
    - Update form_fields field_type check constraint
    - Add button_buy to allowed field types
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update field_type check constraint to include button_buy
ALTER TABLE form_fields
DROP CONSTRAINT IF EXISTS form_fields_field_type_check;

ALTER TABLE form_fields
ADD CONSTRAINT form_fields_field_type_check CHECK (
  field_type IN (
    'text',
    'textarea', 
    'number',
    'email',
    'phone',
    'url',
    'date',
    'time',
    'select',
    'multiselect',
    'radio',
    'checkbox',
    'toggle',
    'section',
    'file',
    'html',
    'product',
    'commission',
    'country',
    'brazilian_states',
    'brand',
    'button_buy',
    'moz_da',
    'semrush_as',
    'ahrefs_dr',
    'ahrefs_traffic',
    'similarweb_traffic',
    'google_traffic'
  )
);

-- Add button-specific columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS custom_button_text boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS button_text text;