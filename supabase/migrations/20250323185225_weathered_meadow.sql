/*
  # Add Brazilian States Field Type
  
  1. Changes
    - Update form_fields field_type check constraint
    - Add brazilian_states to allowed field types
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update field_type check constraint to include brazilian_states
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
    'country',
    'brazilian_states',
    'moz_da',
    'semrush_as',
    'ahrefs_dr',
    'ahrefs_traffic',
    'similarweb_traffic',
    'google_traffic'
  )
);