-- Atualizar a função manual para usar a nova normalização
CREATE OR REPLACE FUNCTION populate_promotion_sites_manual(p_entry_id uuid)
RETURNS void AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
  valuejson_text TEXT;
  value_text TEXT;
BEGIN
  RAISE NOTICE 'DEBUG: Iniciando processamento para entry_id=%', p_entry_id;
  
  -- Busca dados de preço em AMBAS as colunas (value_json E value)
  -- Prioriza value_json, mas também verifica value
  SELECT 
    CASE 
      WHEN value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%') 
      THEN value_json::TEXT
      WHEN value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
      THEN value
      ELSE NULL
    END INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND (
      (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
      OR 
      (value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%'))
    )
  LIMIT 1;
  
  IF value_text IS NOT NULL THEN
    BEGIN
      price_data := value_text::jsonb;
      RAISE NOTICE 'DEBUG: Conversão para jsonb OK';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'DEBUG: Erro na conversão jsonb: %', SQLERRM;
      RETURN;
    END;
  ELSE
    RAISE NOTICE 'DEBUG: Nenhum value_text encontrado, saindo';
    RETURN;
  END IF;
  
  -- URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  RAISE NOTICE 'DEBUG: URL encontrada=%', COALESCE(url_data, 'NULL');
  
  -- Normalizar preços usando a nova função
  RAISE NOTICE 'DEBUG: price original=%', (price_data->>'price');
  RAISE NOTICE 'DEBUG: promotional_price original=%', (price_data->>'promotional_price');
  
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  RAISE NOTICE 'DEBUG: price_val normalizado=%', price_val;
  RAISE NOTICE 'DEBUG: promotional_price_val normalizado=%', promotional_price_val;
  
  -- Validações detalhadas
  RAISE NOTICE 'DEBUG: Validações:';
  RAISE NOTICE 'DEBUG: - price_val > 0: %', (price_val > 0);
  RAISE NOTICE 'DEBUG: - promotional_price_val > 0: %', (promotional_price_val > 0);
  RAISE NOTICE 'DEBUG: - promotional_price_val < price_val: %', (promotional_price_val < price_val);
  
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    RAISE NOTICE 'DEBUG: Validação FALHOU - deletando registro existente e saindo';
    DELETE FROM promotion_sites WHERE entry_id = p_entry_id;
    RETURN;
  END IF;
  
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  url_val := COALESCE(url_data, '');
  
  RAISE NOTICE 'DEBUG: Desconto calculado=% %', percent_val, '%';
  RAISE NOTICE 'DEBUG: Inserindo/atualizando na tabela promotion_sites';
  
  INSERT INTO promotion_sites (
    entry_id, percent, price, promotional_price, url, created_at, updated_at
  ) VALUES (
    p_entry_id, percent_val, price_val, promotional_price_val, url_val, NOW(), NOW()
  )
  ON CONFLICT (entry_id) DO UPDATE SET
    percent = EXCLUDED.percent,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    url = EXCLUDED.url,
    updated_at = NOW();
    
  RAISE NOTICE 'DEBUG: Inserção/atualização concluída com sucesso';
END;
$$ LANGUAGE plpgsql;

-- Função de processamento para todos os dados existentes
CREATE OR REPLACE FUNCTION process_all_promotion_data()
RETURNS void AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT DISTINCT entry_id 
        FROM form_entry_values 
        WHERE (
          (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
          OR 
          (value IS NOT NULL AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%'))
        )
    LOOP
        PERFORM populate_promotion_sites_manual(rec.entry_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função do trigger que será executada automaticamente
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
  -- Log para debugging
  RAISE NOTICE 'TRIGGER: Processando entry_id=%', NEW.entry_id;
  
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
    RAISE NOTICE 'TRIGGER: Nenhum dado de preço encontrado para entry_id=%', NEW.entry_id;
    RETURN NEW;
  END IF;
  
  -- Converter para JSONB
  BEGIN
    price_data := value_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TRIGGER: Erro na conversão jsonb para entry_id=%', NEW.entry_id;
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
    RAISE NOTICE 'TRIGGER: Validação falhou para entry_id=%', NEW.entry_id;
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
    
  RAISE NOTICE 'TRIGGER: Processamento concluído para entry_id=%', NEW.entry_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS populate_promotion_sites_on_insert ON form_entry_values;
DROP TRIGGER IF EXISTS populate_promotion_sites_on_update ON form_entry_values;

-- Criar o trigger para INSERT
CREATE TRIGGER populate_promotion_sites_on_insert
  AFTER INSERT ON form_entry_values
  FOR EACH ROW
  EXECUTE FUNCTION populate_promotion_sites_trigger();

-- Criar o trigger para UPDATE  
CREATE TRIGGER populate_promotion_sites_on_update
  AFTER UPDATE ON form_entry_values
  FOR EACH ROW
  EXECUTE FUNCTION populate_promotion_sites_trigger();