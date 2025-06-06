/*
  # Add Toggle Switch Field Type Support
  
  1. Changes
    - Update form_fields field_type check constraint
    - Add toggle to allowed field types
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update field_type check constraint to include toggle
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
    'file',
    'hidden',
    'html'
  )
);