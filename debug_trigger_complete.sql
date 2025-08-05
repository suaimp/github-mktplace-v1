-- Script de Debug Completo para Triggers

-- ==================================================
-- 1. VERIFICAR SE OS TRIGGERS EXISTEM
-- ==================================================
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement,
    trigger_schema
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'form_entry_values'
ORDER BY trigger_name;

-- ==================================================
-- 2. CRIAR TABELA DE LOG PARA TRIGGER
-- ==================================================
CREATE TABLE IF NOT EXISTS trigger_debug_log (
    id SERIAL PRIMARY KEY,
    trigger_name TEXT,
    entry_id UUID,
    action_type TEXT,
    message TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================================================
-- 3. ATUALIZAR FUNÇÃO DO TRIGGER COM LOGS DETALHADOS
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
  -- Log de início
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, TG_OP, 'TRIGGER INICIADO', 
          jsonb_build_object('field_id', NEW.field_id, 'value', NEW.value, 'value_json', NEW.value_json));
  
  RAISE NOTICE 'TRIGGER DEBUG: Iniciado para entry_id=% field_id=% operation=%', NEW.entry_id, NEW.field_id, TG_OP;
  
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
  
  -- Log da busca de preços
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'PRICE_SEARCH', 
          CASE WHEN value_text IS NULL THEN 'NENHUM PREÇO ENCONTRADO' ELSE 'PREÇO ENCONTRADO' END,
          jsonb_build_object('value_text', value_text));
  
  -- Se não encontrou dados de preço, sair
  IF value_text IS NULL THEN
    RAISE NOTICE 'TRIGGER DEBUG: Nenhum dado de preço encontrado para entry_id=%', NEW.entry_id;
    RETURN NEW;
  END IF;
  
  -- Converter para JSONB
  BEGIN
    price_data := value_text::jsonb;
    
    -- Log da conversão
    INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
    VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'JSONB_CONVERT', 'CONVERSÃO OK', price_data);
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TRIGGER DEBUG: Erro na conversão jsonb para entry_id=% erro=%', NEW.entry_id, SQLERRM;
    
    -- Log do erro
    INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
    VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'ERROR', 'ERRO CONVERSÃO JSONB: ' || SQLERRM, 
            jsonb_build_object('value_text', value_text));
    
    RETURN NEW;
  END;
  
  -- Buscar URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  -- Log da URL
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'URL_SEARCH', 
          CASE WHEN url_data IS NULL THEN 'URL NÃO ENCONTRADA' ELSE 'URL ENCONTRADA' END,
          jsonb_build_object('url', url_data));
  
  -- Normalizar preços
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  -- Log dos preços normalizados
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'PRICE_NORMALIZE', 'PREÇOS NORMALIZADOS',
          jsonb_build_object(
            'price_original', price_data->>'price',
            'promotional_price_original', price_data->>'promotional_price',
            'price_normalized', price_val,
            'promotional_price_normalized', promotional_price_val
          ));
  
  -- Validar dados
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    RAISE NOTICE 'TRIGGER DEBUG: Validação falhou para entry_id=%', NEW.entry_id;
    
    -- Log da validação falhou
    INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
    VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'VALIDATION', 'VALIDAÇÃO FALHOU',
            jsonb_build_object(
              'price_val', price_val,
              'promotional_price_val', promotional_price_val,
              'price_valid', price_val > 0,
              'promo_valid', promotional_price_val > 0,
              'promo_less_than_price', promotional_price_val < price_val
            ));
    
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
  
  -- Log final de sucesso
  INSERT INTO trigger_debug_log (trigger_name, entry_id, action_type, message, data)
  VALUES ('populate_promotion_sites_trigger', NEW.entry_id, 'SUCCESS', 'PROCESSAMENTO CONCLUÍDO',
          jsonb_build_object(
            'percent', percent_val,
            'price', price_val,
            'promotional_price', promotional_price_val,
            'url', url_val
          ));
    
  RAISE NOTICE 'TRIGGER DEBUG: Processamento concluído para entry_id=%', NEW.entry_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 4. TESTAR O TRIGGER COM UPDATE SIMPLES
-- ==================================================
UPDATE form_entry_values 
SET updated_at = NOW() 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075' 
AND value IS NOT NULL;

-- ==================================================
-- 5. VER TODOS OS LOGS DO TRIGGER
-- ==================================================
SELECT 
    id,
    trigger_name,
    entry_id,
    action_type,
    message,
    data,
    created_at
FROM trigger_debug_log 
ORDER BY created_at DESC 
LIMIT 20;

-- ==================================================
-- 6. VERIFICAR SE PROMOTION_SITES FOI ATUALIZADO
-- ==================================================
SELECT * FROM promotion_sites 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075';

-- ==================================================
-- 7. TESTE ADICIONAL: INSERIR UM REGISTRO NOVO
-- ==================================================
-- Descomente para testar inserção:
/*
INSERT INTO form_entry_values (entry_id, field_id, value) 
VALUES (
    gen_random_uuid(), 
    gen_random_uuid(), 
    '{"price": "100.00", "promotional_price": "80.00"}'
);
*/

-- ==================================================
-- 8. LIMPAR LOGS DE DEBUG (execute quando quiser)
-- ==================================================
-- DELETE FROM trigger_debug_log;
