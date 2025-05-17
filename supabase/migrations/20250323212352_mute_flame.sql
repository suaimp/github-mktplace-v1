/*
  # Fix Form Fields Type Constraint
  
  1. Changes
    - Update form_fields field_type check constraint
    - Add all valid field types including commission
  
  2. Security
    - Maintain existing RLS policies
*/

-- First update any existing rows with invalid field_type to a valid type
UPDATE form_fields
SET field_type = 'text'
WHERE field_type NOT IN (
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
  'moz_da',
  'semrush_as',
  'ahrefs_dr',
  'ahrefs_traffic',
  'similarweb_traffic',
  'google_traffic'
);

-- Now safely update the constraint
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
    'moz_da',
    'semrush_as',
    'ahrefs_dr',
    'ahrefs_traffic',
    'similarweb_traffic',
    'google_traffic'
  )
);