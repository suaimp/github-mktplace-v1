/*
  # Add API Fields Support
  
  1. Changes
    - Update field_type check constraint
    - Add default field identifiers for API fields
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update field_type check constraint to include API fields
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
    'moz_da',
    'semrush_as',
    'ahrefs_dr',
    'ahrefs_traffic',
    'similarweb_traffic',
    'google_traffic'
  )
);

-- Add input mask patterns for traffic fields
UPDATE form_field_settings
SET 
  input_mask_enabled = true,
  input_mask_pattern = '999,999,999,999'
WHERE field_id IN (
  SELECT id FROM form_fields 
  WHERE field_type IN ('ahrefs_traffic', 'similarweb_traffic', 'google_traffic')
);

-- Set default field identifiers for API fields
UPDATE form_fields
SET css_class = CASE field_type
  WHEN 'moz_da' THEN 'moz_domain_authority'
  WHEN 'semrush_as' THEN 'semrush_authority_score'
  WHEN 'ahrefs_dr' THEN 'ahrefs_domain_rating'
  WHEN 'ahrefs_traffic' THEN 'ahrefs_organic_traffic'
  WHEN 'similarweb_traffic' THEN 'similarweb_total_traffic'
  WHEN 'google_traffic' THEN 'google_estimated_traffic'
END
WHERE field_type IN (
  'moz_da', 'semrush_as', 'ahrefs_dr',
  'ahrefs_traffic', 'similarweb_traffic', 'google_traffic'
);