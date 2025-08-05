-- Update field_type check constraint to include brand
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
    'moz_da',
    'semrush_as',
    'ahrefs_dr',
    'ahrefs_traffic',
    'similarweb_traffic',
    'google_traffic'
  )
);

-- Add brand-specific columns to form_field_settings
ALTER TABLE form_field_settings
ADD COLUMN IF NOT EXISTS show_logo boolean DEFAULT true;

-- Create storage bucket for brand logos if it doesn't exist
BEGIN;
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('brand_logos', 'brand_logos', true)
  ON CONFLICT (id) DO NOTHING;

  -- Policy to allow authenticated users to upload brand logos
  DROP POLICY IF EXISTS "Users can upload brand logos" ON storage.objects;
  CREATE POLICY "Users can upload brand logos"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'brand_logos'
  );

  -- Policy to allow users to update their own brand logos
  DROP POLICY IF EXISTS "Users can update brand logos" ON storage.objects;
  CREATE POLICY "Users can update brand logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand_logos'
  );

  -- Policy to allow public access to read brand logos
  DROP POLICY IF EXISTS "Public users can read brand logos" ON storage.objects;
  CREATE POLICY "Public users can read brand logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'brand_logos');

  -- Policy to allow users to delete their own brand logos
  DROP POLICY IF EXISTS "Users can delete brand logos" ON storage.objects;
  CREATE POLICY "Users can delete brand logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand_logos'
  );
COMMIT;