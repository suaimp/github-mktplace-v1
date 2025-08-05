-- Add marketplace_label column to form_field_settings if it doesn't exist
DO $$ 
BEGIN
  -- Check if the column already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'form_field_settings' 
    AND column_name = 'marketplace_label'
  ) THEN
    -- Add the column
    ALTER TABLE form_field_settings 
    ADD COLUMN marketplace_label text;
  END IF;
END $$;

-- Check if policies already exist before creating them
DO $$ 
BEGIN
  -- Check if the policy for form_entries exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_entries' 
    AND policyname = 'Anyone can view verified entries'
  ) THEN
    -- Create policy to allow public access to verified form entries
    CREATE POLICY "Anyone can view verified entries" 
      ON form_entries 
      FOR SELECT 
      TO public 
      USING (
        status = 'verificado'
      );
  END IF;

  -- Check if the policy for form_entry_values exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_entry_values' 
    AND policyname = 'Anyone can view values of verified entries'
  ) THEN
    -- Create policy to allow public access to values of verified entries
    CREATE POLICY "Anyone can view values of verified entries" 
      ON form_entry_values 
      FOR SELECT 
      TO public 
      USING (
        EXISTS (
          SELECT 1 
          FROM form_entries fe
          WHERE fe.id = entry_id
          AND fe.status = 'verificado'
        )
      );
  END IF;
END $$;