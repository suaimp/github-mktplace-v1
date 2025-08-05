-- Drop existing policies if they exist to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read form fields" ON form_fields;
  DROP POLICY IF EXISTS "Anyone can read form field settings" ON form_field_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policies to allow public access to form fields
CREATE POLICY "Anyone can read form fields" 
  ON form_fields 
  FOR SELECT 
  TO public 
  USING (true);

-- Create policies to allow public access to form field settings
CREATE POLICY "Anyone can read form field settings" 
  ON form_field_settings 
  FOR SELECT 
  TO public 
  USING (true);