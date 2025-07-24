/*
  # Add Auto-Population System for Promotion Sites

  1. Schema Changes
    - Add updated_at column to form_entry_values table
    - Add trigger for updated_at timestamp

  2. Functions
    - Create function to populate promotion_sites table
    - Analyzes top 10 sites with best discount ratios
    - Triggered on form_entry_values updates

  3. Triggers
    - Auto-update updated_at on form_entry_values
    - Auto-populate promotion_sites on relevant changes
*/

-- Add updated_at column to form_entry_values if it doesn't exist
ALTER TABLE form_entry_values 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create debug table to track trigger execution
CREATE TABLE IF NOT EXISTS debug_trigger_log (
  id SERIAL PRIMARY KEY,
  entry_id TEXT,
  trigger_action TEXT,
  price_val NUMERIC,
  promotional_price_val NUMERIC,
  price_string TEXT,
  promo_string TEXT,
  url_found TEXT,
  has_pricing_data BOOLEAN,
  existing_record_found BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on entry_id to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_entry_id' 
    AND conrelid = 'promotion_sites'::regclass
  ) THEN
    ALTER TABLE promotion_sites ADD CONSTRAINT unique_entry_id UNIQUE (entry_id);
  END IF;
END $$;

-- Create function to automatically update updated_at timestamp for form_entry_values
CREATE OR REPLACE FUNCTION update_form_entry_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on form_entry_values
DROP TRIGGER IF EXISTS form_entry_values_updated_at ON form_entry_values;
CREATE TRIGGER form_entry_values_updated_at
  BEFORE UPDATE ON form_entry_values
  FOR EACH ROW
  EXECUTE FUNCTION update_form_entry_values_updated_at();

-- Create function to populate promotion_sites table
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
  -- Log que o trigger foi disparado
  INSERT INTO debug_trigger_log (entry_id, trigger_action, created_at)
  VALUES (NEW.entry_id, 'TRIGGER_STARTED', NOW());
  
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
    has_pricing_data := TRUE;
  END IF;
  
  -- Check if current record has URL data
  IF NEW.value IS NOT NULL AND NEW.value ~ '^https?://' THEN
    url_data := NEW.value;
    has_url_data := TRUE;
  END IF;
  
  -- If we found pricing data OR this is a URL update for existing pricing entry
  IF price_data IS NOT NULL OR url_data IS NOT NULL THEN
    
    -- Extract pricing data from collected JSON
    IF price_data IS NOT NULL THEN
      BEGIN
        -- Parse price (convert comma decimal separator to dot)
        price_val := COALESCE(REPLACE(price_data->>'price', ',', '.')::NUMERIC, 0);
      EXCEPTION WHEN OTHERS THEN
        price_val := 0;
      END;
      
      BEGIN
        -- Parse promotional_price (convert comma decimal separator to dot)
        promotional_price_val := COALESCE(REPLACE(price_data->>'promotional_price', ',', '.')::NUMERIC, 0);
      EXCEPTION WHEN OTHERS THEN
        promotional_price_val := 0;
      END;
      
      BEGIN
        -- Parse old_price (convert comma decimal separator to dot)
        old_price_val := COALESCE(REPLACE(price_data->>'old_price', ',', '.')::NUMERIC, 0);
      EXCEPTION WHEN OTHERS THEN
        old_price_val := 0;
      END;
      
      BEGIN
        -- Parse old_promotional_price (convert comma decimal separator to dot)
        old_promotional_price_val := COALESCE(REPLACE(price_data->>'old_promotional_price', ',', '.')::NUMERIC, 0);
      EXCEPTION WHEN OTHERS THEN
        old_promotional_price_val := 0;
      END;
      
      has_pricing_data := TRUE;
      
      -- Debug: log dos valores na tabela
      INSERT INTO debug_trigger_log (
        entry_id, trigger_action, price_val, promotional_price_val, 
        price_string, promo_string, has_pricing_data
      ) VALUES (
        NEW.entry_id, 'PRICING_DATA_FOUND', price_val, promotional_price_val,
        price_data->>'price', price_data->>'promotional_price', has_pricing_data
      );
      
      -- Se os dados de preço forem inválidos, exclui o registro e retorna
      IF price_data IS NULL OR price_val IS NULL OR price_val <= 0 OR promotional_price_val IS NULL OR promotional_price_val <= 0
         OR TRIM(COALESCE(price_data->>'price','')) = '' OR TRIM(COALESCE(price_data->>'promotional_price','')) = '' THEN
        
        INSERT INTO debug_trigger_log (
          entry_id, trigger_action, price_val, promotional_price_val,
          error_message
        ) VALUES (
          NEW.entry_id, 'VALIDATION_FAILED', price_val, promotional_price_val,
          'price_data IS NULL: ' || (price_data IS NULL)::text || 
          ', price_val <= 0: ' || (price_val <= 0)::text ||
          ', promotional_price_val <= 0: ' || (promotional_price_val <= 0)::text
        );
        
        DELETE FROM promotion_sites WHERE entry_id = NEW.entry_id;
        RETURN NEW;
      END IF;
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
    
    -- Check if record already exists
    SELECT id INTO existing_record_id
    FROM promotion_sites 
    WHERE entry_id = NEW.entry_id;
    
    -- Log se já existe registro
    INSERT INTO debug_trigger_log (
      entry_id, trigger_action, existing_record_found, url_found
    ) VALUES (
      NEW.entry_id, 'CHECKING_EXISTING_RECORD', 
      (existing_record_id IS NOT NULL), url_val
    );
    
    IF existing_record_id IS NOT NULL THEN
      -- Update existing record
      UPDATE promotion_sites SET
        percent = CASE WHEN has_pricing_data THEN percent_val ELSE percent END,
        price = CASE WHEN has_pricing_data THEN price_val ELSE price END,
        old_price = CASE WHEN has_pricing_data THEN old_price_val ELSE old_price END,
        promotional_price = CASE WHEN has_pricing_data THEN promotional_price_val ELSE promotional_price END,
        old_promotional_price = CASE WHEN has_pricing_data THEN old_promotional_price_val ELSE old_promotional_price END,
        url = CASE WHEN url_val != '' THEN url_val ELSE url END,
        updated_at = now()
      WHERE id = existing_record_id;
      
      INSERT INTO debug_trigger_log (entry_id, trigger_action) 
      VALUES (NEW.entry_id, 'UPDATED_EXISTING_RECORD');
    ELSE
      -- Insert new record only if we have meaningful data
      IF has_pricing_data OR url_val != '' THEN
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
          price_val,
          old_price_val,
          promotional_price_val,
          old_promotional_price_val,
          CASE WHEN url_val != '' THEN url_val ELSE NULL END,
          now(),
          now()
        );
        
        INSERT INTO debug_trigger_log (entry_id, trigger_action) 
        VALUES (NEW.entry_id, 'INSERTED_NEW_RECORD');
      ELSE
        INSERT INTO debug_trigger_log (entry_id, trigger_action) 
        VALUES (NEW.entry_id, 'NO_MEANINGFUL_DATA_TO_INSERT');
      END IF;
    END IF;
    
    -- Clean up: Keep only top 10 sites with best discount ratios
    -- Only run cleanup occasionally to avoid performance issues
    IF RANDOM() < 0.1 THEN -- 10% chance to run cleanup
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
    END IF;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error na tabela de debug
    INSERT INTO debug_trigger_log (entry_id, trigger_action, error_message)
    VALUES (NEW.entry_id, 'ERROR_OCCURRED', SQLERRM);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-populating promotion_sites
DROP TRIGGER IF EXISTS auto_populate_promotion_sites ON form_entry_values;
CREATE TRIGGER auto_populate_promotion_sites
  AFTER INSERT OR UPDATE ON form_entry_values
  FOR EACH ROW
  EXECUTE FUNCTION populate_promotion_sites();

-- Create function to manually refresh promotion_sites (utility function)
CREATE OR REPLACE FUNCTION refresh_promotion_sites()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  entry_record RECORD;
BEGIN
  -- Clear existing promotion_sites
  TRUNCATE TABLE promotion_sites;
  
  -- Process all form_entry_values with pricing data
  FOR entry_record IN 
    SELECT DISTINCT fev.entry_id, fev.value_json
    FROM form_entry_values fev
    WHERE fev.value_json IS NOT NULL 
      AND (
        fev.value_json ? 'price' OR 
        fev.value_json ? 'promotional_price' OR
        fev.value_json ? 'url'
      )
      AND COALESCE((fev.value_json->>'price')::NUMERIC, 0) > 0
      AND COALESCE((fev.value_json->>'promotional_price')::NUMERIC, 0) > 0
  LOOP
    -- Insert promotion data
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
      CASE 
        WHEN COALESCE((entry_record.value_json->>'price')::NUMERIC, 0) > 0 
         AND COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0) > 0
         AND COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0) < COALESCE((entry_record.value_json->>'price')::NUMERIC, 0)
        THEN ROUND(((COALESCE((entry_record.value_json->>'price')::NUMERIC, 0) - COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0)) / COALESCE((entry_record.value_json->>'price')::NUMERIC, 0) * 100), 2)
        ELSE 0
      END,
      NULLIF(COALESCE((entry_record.value_json->>'price')::NUMERIC, 0), 0),
      NULLIF(COALESCE((entry_record.value_json->>'old_price')::NUMERIC, 0), 0),
      NULLIF(COALESCE((entry_record.value_json->>'promotional_price')::NUMERIC, 0), 0),
      NULLIF(COALESCE((entry_record.value_json->>'old_promotional_price')::NUMERIC, 0), 0),
      entry_record.value_json->>'url'
    )
    ON CONFLICT (entry_id) DO NOTHING;
    
    processed_count := processed_count + 1;
  END LOOP;
  
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
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON FUNCTION populate_promotion_sites() IS 'Função para popular automaticamente a tabela promotion_sites baseada em atualizações da form_entry_values';
COMMENT ON FUNCTION refresh_promotion_sites() IS 'Função utilitária para reprocessar todos os dados e popular promotion_sites do zero';
COMMENT ON FUNCTION update_form_entry_values_updated_at() IS 'Função para atualizar automaticamente o campo updated_at da tabela form_entry_values';

-- Create index for better performance on the trigger
CREATE INDEX IF NOT EXISTS idx_form_entry_values_value_json_price ON form_entry_values 
USING GIN ((value_json->'price')) WHERE value_json ? 'price';

CREATE INDEX IF NOT EXISTS idx_form_entry_values_value_json_promotional_price ON form_entry_values 
USING GIN ((value_json->'promotional_price')) WHERE value_json ? 'promotional_price';

CREATE INDEX IF NOT EXISTS idx_form_entry_values_updated_at ON form_entry_values(updated_at);
