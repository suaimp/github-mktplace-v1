/*
  # Fix trigger errors in EditEntityModal

  ## Problem
  The auto_populate_promotion_sites trigger is causing errors when updating form_entry_values:
  - relation "debug_trigger_log" does not exist
  - The trigger contains unnecessary debug logging that's causing failures

  ## Solution
  1. Remove all debug_trigger_log references
  2. Simplify the populate_promotion_sites function
  3. Remove the debug_trigger_log table completely

  ## Changes
  - Drop debug_trigger_log table if it exists
  - Remove all debug logging from the populate_promotion_sites function
  - Recreate the trigger with clean, simple logic
*/

-- Remove debug_trigger_log table if it exists
DROP TABLE IF EXISTS debug_trigger_log;

-- Create a clean, simple populate_promotion_sites function without debug logging
CREATE OR REPLACE FUNCTION populate_promotion_sites()
RETURNS TRIGGER AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
BEGIN
  -- Collect all data for this entry_id from different records
  -- Get pricing data (from value_json)
  SELECT value_json INTO price_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id 
    AND value_json IS NOT NULL 
    AND (value_json ? 'price' OR value_json ? 'promotional_price')
  LIMIT 1;
  
  -- Get URL data (from value field)
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id 
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  -- Check if current record has pricing data
  IF NEW.value_json IS NOT NULL AND (
    NEW.value_json ? 'price' OR 
    NEW.value_json ? 'promotional_price'
  ) THEN
    price_data := NEW.value_json;
  END IF;
  
  -- Check if current record has URL data
  IF NEW.value IS NOT NULL AND NEW.value ~ '^https?://' THEN
    url_data := NEW.value;
  END IF;
  
  -- If we don't have pricing data, skip processing
  IF price_data IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Extract pricing data from collected JSON
  BEGIN
    price_val := COALESCE(REPLACE(price_data->>'price', ',', '.')::NUMERIC, 0);
  EXCEPTION WHEN OTHERS THEN
    price_val := 0;
  END;
  
  BEGIN
    promotional_price_val := COALESCE(REPLACE(price_data->>'promotional_price', ',', '.')::NUMERIC, 0);
  EXCEPTION WHEN OTHERS THEN
    promotional_price_val := 0;
  END;
  
  -- Validate pricing data
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    -- Delete any existing record for this entry if pricing is invalid
    DELETE FROM promotion_sites WHERE entry_id = NEW.entry_id;
    RETURN NEW;
  END IF;
  
  -- Calculate discount percentage
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  
  -- Set URL value
  url_val := COALESCE(url_data, '');
  
  -- Upsert into promotion_sites
  INSERT INTO promotion_sites (
    entry_id,
    percent,
    price,
    promotional_price,
    url,
    created_at,
    updated_at
  ) VALUES (
    NEW.entry_id,
    percent_val,
    price_val,
    promotional_price_val,
    url_val,
    NOW(),
    NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    percent = EXCLUDED.percent,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    url = EXCLUDED.url,
    updated_at = NOW();
  
  -- Keep only top 10 with best discount ratios
  DELETE FROM promotion_sites 
  WHERE id NOT IN (
    SELECT id 
    FROM promotion_sites 
    WHERE percent > 0 
      AND price IS NOT NULL 
      AND promotional_price IS NOT NULL
    ORDER BY percent DESC, price DESC
    LIMIT 10
  ) AND percent > 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS auto_populate_promotion_sites ON form_entry_values;
CREATE TRIGGER auto_populate_promotion_sites
  AFTER INSERT OR UPDATE ON form_entry_values
  FOR EACH ROW
  EXECUTE FUNCTION populate_promotion_sites();

-- Add unique constraint back to prevent duplicates (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_entry_id' 
    AND conrelid = 'promotion_sites'::regclass
  ) THEN
    ALTER TABLE promotion_sites ADD CONSTRAINT unique_entry_id UNIQUE (entry_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint already exists or other issues
  NULL;
END $$;
