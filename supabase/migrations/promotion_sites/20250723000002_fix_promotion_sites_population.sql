/*
  # Fix Promotion Sites Auto-Population

  ## Problem
  - Function only populated 1 record instead of processing all form_entry_values with promotional_price
  - Trigger is not reacting to manual edits of promotional_price fields in other records
  - Constraint unique_entry_id prevents multiple records per entry_id

  ## Solution
  1. Remove the unique constraint limitation 
  2. Modify the function to process all existing records
  3. Add a manual refresh function call to populate existing data
  4. Improve trigger logic to handle all pricing updates

  ## Changes
  - Remove unique constraint on entry_id (allow multiple promotional sites per entry)
  - Update populate_promotion_sites function
  - Run refresh to populate all existing data
*/

-- Step 1: Remove the unique constraint on entry_id to allow multiple promotional sites per entry
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_entry_id' 
    AND conrelid = 'promotion_sites'::regclass
  ) THEN
    ALTER TABLE promotion_sites DROP CONSTRAINT unique_entry_id;
    RAISE NOTICE 'Removed unique_entry_id constraint from promotion_sites';
  END IF;
END $$;

-- Step 2: Update the populate_promotion_sites function to handle multiple records better
CREATE OR REPLACE FUNCTION populate_promotion_sites()
RETURNS TRIGGER AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  old_price_val NUMERIC;
  old_promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  existing_record_id UUID;
  has_pricing_data BOOLEAN := FALSE;
  has_url_data BOOLEAN := FALSE;
  
  -- Collect data from all entries with same entry_id
  price_data JSONB;
  url_data TEXT;
BEGIN
  -- Only process if this record has pricing or URL data
  IF (NEW.value_json IS NOT NULL AND (
    NEW.value_json ? 'price' OR 
    NEW.value_json ? 'promotional_price'
  )) OR (NEW.value IS NOT NULL AND NEW.value ~ '^https?://') THEN
  
    -- Collect all data for this entry_id from different records
    -- Get pricing data (from value_json) - prioritize current record
    IF NEW.value_json IS NOT NULL AND (
      NEW.value_json ? 'price' OR 
      NEW.value_json ? 'promotional_price'
    ) THEN
      price_data := NEW.value_json;
      has_pricing_data := TRUE;
    ELSE
      -- Get from other records with same entry_id
      SELECT value_json INTO price_data
      FROM form_entry_values 
      WHERE entry_id = NEW.entry_id 
        AND id != NEW.id
        AND value_json IS NOT NULL 
        AND (value_json ? 'price' OR value_json ? 'promotional_price')
      LIMIT 1;
      has_pricing_data := (price_data IS NOT NULL);
    END IF;
    
    -- Get URL data (from value field) - prioritize current record
    IF NEW.value IS NOT NULL AND NEW.value ~ '^https?://' THEN
      url_data := NEW.value;
      has_url_data := TRUE;
    ELSE
      -- Get from other records with same entry_id
      SELECT value INTO url_data
      FROM form_entry_values 
      WHERE entry_id = NEW.entry_id 
        AND id != NEW.id
        AND value IS NOT NULL 
        AND value ~ '^https?://'
      LIMIT 1;
      has_url_data := (url_data IS NOT NULL);
    END IF;
    
    -- Only proceed if we have meaningful data
    IF price_data IS NOT NULL OR url_data IS NOT NULL THEN
      
      -- Extract pricing data from collected JSON
      IF price_data IS NOT NULL THEN
        BEGIN
          -- Parse price (convert comma decimal separator to dot)
          price_val := COALESCE(NULLIF(REPLACE(price_data->>'price', ',', '.'), '')::NUMERIC, 0);
        EXCEPTION WHEN OTHERS THEN
          price_val := 0;
        END;
        
        BEGIN
          -- Parse promotional_price (convert comma decimal separator to dot)
          promotional_price_val := COALESCE(NULLIF(REPLACE(price_data->>'promotional_price', ',', '.'), '')::NUMERIC, 0);
        EXCEPTION WHEN OTHERS THEN
          promotional_price_val := 0;
        END;
        
        BEGIN
          -- Parse old_price (convert comma decimal separator to dot)
          old_price_val := COALESCE(NULLIF(REPLACE(price_data->>'old_price', ',', '.'), '')::NUMERIC, 0);
        EXCEPTION WHEN OTHERS THEN
          old_price_val := 0;
        END;
        
        BEGIN
          -- Parse old_promotional_price (convert comma decimal separator to dot)
          old_promotional_price_val := COALESCE(NULLIF(REPLACE(price_data->>'old_promotional_price', ',', '.'), '')::NUMERIC, 0);
        EXCEPTION WHEN OTHERS THEN
          old_promotional_price_val := 0;
        END;
      ELSE
        price_val := 0;
        promotional_price_val := 0;
        old_price_val := 0;
        old_promotional_price_val := 0;
      END IF;
      
      -- Set URL value
      url_val := COALESCE(url_data, '');
      
      -- Calculate discount percentage
      IF price_val > 0 AND promotional_price_val > 0 AND promotional_price_val < price_val THEN
        percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
      ELSE
        percent_val := 0;
      END IF;
      
      -- Check if record already exists for this entry_id
      SELECT id INTO existing_record_id
      FROM promotion_sites 
      WHERE entry_id = NEW.entry_id;
      
      IF existing_record_id IS NOT NULL THEN
        -- Update existing record
        UPDATE promotion_sites SET
          percent = CASE WHEN has_pricing_data THEN percent_val ELSE percent END,
          price = CASE WHEN has_pricing_data THEN NULLIF(price_val, 0) ELSE price END,
          old_price = CASE WHEN has_pricing_data THEN NULLIF(old_price_val, 0) ELSE old_price END,
          promotional_price = CASE WHEN has_pricing_data THEN NULLIF(promotional_price_val, 0) ELSE promotional_price END,
          old_promotional_price = CASE WHEN has_pricing_data THEN NULLIF(old_promotional_price_val, 0) ELSE old_promotional_price END,
          url = CASE WHEN url_val != '' THEN url_val ELSE url END,
          updated_at = now()
        WHERE id = existing_record_id;
      ELSE
        -- Insert new record only if we have meaningful data
        IF (has_pricing_data AND price_val > 0 AND promotional_price_val > 0) OR url_val != '' THEN
          INSERT INTO promotion_sites (
            entry_id,
            percent,
            price,
            old_price,
            promotional_price,
            old_promotional_price,
            url,
            created_at,
            updated_at
          ) VALUES (
            NEW.entry_id,
            percent_val,
            NULLIF(price_val, 0),
            NULLIF(old_price_val, 0),
            NULLIF(promotional_price_val, 0),
            NULLIF(old_promotional_price_val, 0),
            CASE WHEN url_val != '' THEN url_val ELSE NULL END,
            now(),
            now()
          );
        END IF;
      END IF;
      
      -- Clean up: Keep only top 20 sites with best discount ratios (increased from 10)
      -- Only run cleanup occasionally to avoid performance issues
      IF RANDOM() < 0.05 THEN -- 5% chance to run cleanup (reduced frequency)
        DELETE FROM promotion_sites 
        WHERE id NOT IN (
          SELECT id 
          FROM promotion_sites 
          WHERE percent > 0 
            AND price IS NOT NULL 
            AND promotional_price IS NOT NULL
          ORDER BY percent DESC, price DESC
          LIMIT 20
        ) AND percent > 0;
      END IF;
      
    END IF;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the original operation
    RAISE WARNING 'Error in populate_promotion_sites(): %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update the refresh function to process all existing data
CREATE OR REPLACE FUNCTION refresh_promotion_sites()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  entry_record RECORD;
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  old_price_val NUMERIC;
  old_promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
BEGIN
  -- Clear existing promotion_sites
  TRUNCATE TABLE promotion_sites;
  
  RAISE NOTICE 'Starting refresh_promotion_sites - processing all form_entry_values with pricing data';
  
  -- Process all form_entry_values with pricing data
  FOR entry_record IN 
    SELECT DISTINCT 
      fev.entry_id, 
      fev.value_json,
      (SELECT value FROM form_entry_values WHERE entry_id = fev.entry_id AND value ~ '^https?://' LIMIT 1) as url_value
    FROM form_entry_values fev
    WHERE fev.value_json IS NOT NULL 
      AND (
        fev.value_json ? 'price' OR 
        fev.value_json ? 'promotional_price'
      )
  LOOP
    BEGIN
      -- Parse values safely
      price_val := COALESCE(NULLIF(REPLACE(entry_record.value_json->>'price', ',', '.'), '')::NUMERIC, 0);
      promotional_price_val := COALESCE(NULLIF(REPLACE(entry_record.value_json->>'promotional_price', ',', '.'), '')::NUMERIC, 0);
      old_price_val := COALESCE(NULLIF(REPLACE(entry_record.value_json->>'old_price', ',', '.'), '')::NUMERIC, 0);
      old_promotional_price_val := COALESCE(NULLIF(REPLACE(entry_record.value_json->>'old_promotional_price', ',', '.'), '')::NUMERIC, 0);
      url_val := COALESCE(entry_record.url_value, entry_record.value_json->>'url', '');
      
      -- Calculate discount percentage
      IF price_val > 0 AND promotional_price_val > 0 AND promotional_price_val < price_val THEN
        percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
      ELSE
        percent_val := 0;
      END IF;
      
      -- Insert only if we have valid pricing data
      IF price_val > 0 AND promotional_price_val > 0 THEN
        INSERT INTO promotion_sites (
          entry_id,
          percent,
          price,
          old_price,
          promotional_price,
          old_promotional_price,
          url
        ) VALUES (
          entry_record.entry_id,
          percent_val,
          NULLIF(price_val, 0),
          NULLIF(old_price_val, 0),
          NULLIF(promotional_price_val, 0),
          NULLIF(old_promotional_price_val, 0),
          NULLIF(url_val, '')
        );
        
        processed_count := processed_count + 1;
        
        -- Log progress every 10 records
        IF processed_count % 10 = 0 THEN
          RAISE NOTICE 'Processed % records so far', processed_count;
        END IF;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error processing entry_id %: %', entry_record.entry_id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;
  
  -- Keep only top 20 with best discount ratios
  DELETE FROM promotion_sites 
  WHERE id NOT IN (
    SELECT id 
    FROM promotion_sites 
    WHERE percent > 0 
      AND price IS NOT NULL 
      AND promotional_price IS NOT NULL
    ORDER BY percent DESC, price DESC
    LIMIT 20
  ) AND percent > 0;
  
  RAISE NOTICE 'Completed refresh_promotion_sites - processed % total records', processed_count;
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Run the refresh function to populate all existing data
SELECT refresh_promotion_sites() as records_processed;

-- Step 5: Add helpful comments
COMMENT ON FUNCTION populate_promotion_sites() IS 'Função atualizada para popular automaticamente a tabela promotion_sites - permite múltiplos registros por entry_id';
COMMENT ON FUNCTION refresh_promotion_sites() IS 'Função utilitária atualizada para reprocessar todos os dados de pricing existentes';

-- Verification queries
SELECT 'Total records in promotion_sites after fix:' as info, COUNT(*) as count FROM promotion_sites
UNION ALL
SELECT 'Records with pricing data in form_entry_values:' as info, COUNT(DISTINCT entry_id) as count 
FROM form_entry_values 
WHERE value_json IS NOT NULL 
  AND (value_json ? 'price' OR value_json ? 'promotional_price');
