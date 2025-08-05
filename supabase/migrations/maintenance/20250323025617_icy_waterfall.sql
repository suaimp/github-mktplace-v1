/*
  # Add Product Field Type Support
  
  1. Changes
    - Update form_fields field_type check constraint
    - Add product to allowed field types
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update field_type check constraint to include product
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
    'hidden',
    'html',
    'product'  -- Added new product field type
  )
);

-- Add product-specific columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS product_price numeric,
ADD COLUMN IF NOT EXISTS product_currency text DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS product_description text;