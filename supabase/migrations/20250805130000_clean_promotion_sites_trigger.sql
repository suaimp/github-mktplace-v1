-- Migration: Remove debug references from promotion_sites trigger
-- Created: 2025-08-05
-- Purpose: Remove trigger_debug_log references while keeping promotion_sites functionality

-- ==================================================
-- 1. DROP OLD TRIGGER AND FUNCTION
-- ==================================================
DROP TRIGGER IF EXISTS trigger_populate_promotion_sites ON form_entry_values;
DROP FUNCTION IF EXISTS populate_promotion_sites_trigger();

-- ==================================================
-- 2. CREATE CLEAN FUNCTION WITHOUT DEBUG LOGS
-- ==================================================
CREATE OR REPLACE FUNCTION populate_promotion_sites_trigger()
RETURNS TRIGGER AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
  value_text TEXT;
BEGIN
  -- Busca dados de preço usando a mesma lógica da função manual
  SELECT 
    CASE 
      WHEN value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%') 
      THEN value_json::TEXT
      WHEN value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
      THEN value
      ELSE NULL
    END INTO value_text
  FROM form_entry_values
  WHERE entry_id = NEW.entry_id
    AND (
      (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
      OR 
      (value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%'))
    )
  LIMIT 1;
  
  -- Se não encontrou dados de preço, sair
  IF value_text IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Converter para JSONB
  BEGIN
    price_data := value_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
  END;
  
  -- Buscar URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  -- Normalizar preços
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  -- Validar dados
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    -- Remove registro existente se inválido
    DELETE FROM promotion_sites WHERE entry_id = NEW.entry_id;
    RETURN NEW;
  END IF;
  
  -- Calcular desconto
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  url_val := COALESCE(url_data, '');
  
  -- Inserir/atualizar na tabela promotion_sites
  INSERT INTO promotion_sites (
    entry_id, percent, price, promotional_price, url, created_at, updated_at
  ) VALUES (
    NEW.entry_id, percent_val, price_val, promotional_price_val, url_val, NOW(), NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    percent = EXCLUDED.percent,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    url = EXCLUDED.url,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 3. CREATE CLEAN TRIGGER
-- ==================================================
CREATE TRIGGER trigger_populate_promotion_sites
    AFTER INSERT OR UPDATE ON form_entry_values
    FOR EACH ROW
    EXECUTE FUNCTION populate_promotion_sites_trigger();

-- ==================================================
-- 4. CLEANUP DEBUG FUNCTIONS IF THEY EXIST
-- ==================================================
DROP FUNCTION IF EXISTS normalize_price_string(TEXT);

-- Recreate normalize_price_string function if needed
CREATE OR REPLACE FUNCTION normalize_price_string(price_str TEXT)
RETURNS NUMERIC AS $$
BEGIN
  IF price_str IS NULL OR price_str = '' THEN
    RETURN 0;
  END IF;
  
  -- Remove caracteres não numéricos exceto vírgula e ponto
  price_str := regexp_replace(price_str, '[^0-9,.]', '', 'g');
  
  -- Tratar vírgula como separador decimal (formato brasileiro)
  IF position(',' in price_str) > 0 AND position('.' in price_str) = 0 THEN
    price_str := replace(price_str, ',', '.');
  ELSIF position(',' in price_str) > 0 AND position('.' in price_str) > 0 THEN
    -- Se tem ambos, assume que ponto é milhar e vírgula é decimal
    price_str := replace(price_str, '.', '');
    price_str := replace(price_str, ',', '.');
  END IF;
  
  RETURN COALESCE(price_str::NUMERIC, 0);
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$ LANGUAGE plpgsql;
