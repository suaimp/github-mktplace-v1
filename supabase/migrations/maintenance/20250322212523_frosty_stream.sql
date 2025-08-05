/*
  # Fix Form Field Type Constraints
  
  1. Changes
    - Drop existing field_type constraint
    - Recreate constraint with all valid field types
    - Ensure toggle and section types are included
  
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing constraint
ALTER TABLE form_fields
DROP CONSTRAINT IF EXISTS form_fields_field_type_check;

-- Recreate constraint with all valid field types
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
    'hidden',
    'html'
  )
);