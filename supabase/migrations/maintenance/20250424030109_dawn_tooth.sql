-- Create policies to allow public access to all form entries and values
DO $$ 
BEGIN
  -- Check if the policy for form_entries exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_entries' 
    AND policyname = 'Anyone can view all entries for marketplace'
  ) THEN
    -- Create policy to allow public access to all form entries
    CREATE POLICY "Anyone can view all entries for marketplace" 
      ON form_entries 
      FOR SELECT 
      TO public 
      USING (true);
  END IF;

  -- Check if the policy for form_entry_values exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'form_entry_values' 
    AND policyname = 'Anyone can view all entry values for marketplace'
  ) THEN
    -- Create policy to allow public access to all entry values
    CREATE POLICY "Anyone can view all entry values for marketplace" 
      ON form_entry_values 
      FOR SELECT 
      TO public 
      USING (true);
  END IF;
END $$;