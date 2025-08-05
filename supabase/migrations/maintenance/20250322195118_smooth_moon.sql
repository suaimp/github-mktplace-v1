CREATE OR REPLACE FUNCTION add_max_selections_column()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add max_selections column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'form_field_settings' 
    AND column_name = 'max_selections'
  ) THEN
    ALTER TABLE form_field_settings
    ADD COLUMN max_selections integer CHECK (max_selections > 0);
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_form_field_settings_max_selections 
    ON form_field_settings(max_selections);
  END IF;
END;
$$;