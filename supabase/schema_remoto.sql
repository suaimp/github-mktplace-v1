

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."pix_key_type" AS ENUM (
    'cpf',
    'cnpj',
    'phone',
    'email',
    'random'
);


ALTER TYPE "public"."pix_key_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_max_selections_column"() RETURNS "void"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."add_max_selections_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_form_entry_data"() RETURNS TABLE("entry_id_val" "uuid", "has_price_json" boolean, "has_url_in_value" boolean, "value_content" "text", "value_json_content" "text", "extracted_price" "text", "extracted_promotional_price" "text", "extracted_url" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fev.entry_id,
        (fev.value_json ? 'price') AS has_price_json,
        (fev.value ~ '^https?://') AS has_url_in_value,
        LEFT(COALESCE(fev.value, 'NULL'), 100) AS value_content,
        LEFT(COALESCE(fev.value_json::TEXT, 'NULL'), 100) AS value_json_content,
        COALESCE(fev.value_json->>'price', 'NULL') AS extracted_price,
        COALESCE(fev.value_json->>'promotional_price', 'NULL') AS extracted_promotional_price,
        CASE 
            WHEN fev.value ~ '^https?://' THEN fev.value
            ELSE 'NOT_URL'
        END AS extracted_url
    FROM form_entry_values fev
    ORDER BY fev.created_at DESC
    LIMIT 10;
END;
$$;


ALTER FUNCTION "public"."analyze_form_entry_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_add_chat_participants"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Adicionar o dono do pedido como participante se não existir
  INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
  SELECT NEW.order_id, NEW.order_item_id, o.user_id, 'owner'
  FROM orders o
  WHERE o.id = NEW.order_id
  ON CONFLICT (order_item_id, user_id) DO NOTHING;
  
  -- Adicionar o remetente como participante baseado no tipo
  IF NEW.sender_type = 'user' THEN
    INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
    VALUES (NEW.order_id, NEW.order_item_id, NEW.sender_id, 'participant')
    ON CONFLICT (order_item_id, user_id) DO NOTHING;
  ELSIF NEW.sender_type = 'admin' THEN
    -- Admins são adicionados como 'admin' role
    INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
    VALUES (NEW.order_id, NEW.order_item_id, NEW.sender_id, 'admin')
    ON CONFLICT (order_item_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_add_chat_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_populate_best_selling_sites"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Insert new record or update existing one using UPSERT
  INSERT INTO best_selling_sites (
    entry_id,
    product_name,
    product_url,
    quantity,
    created_at,
    updated_at
  )
  VALUES (
    NEW.entry_id,
    NEW.product_name,
    NEW.product_url,
    NEW.quantity,
    now(),
    now()
  )
  ON CONFLICT (entry_id) 
  DO UPDATE SET
    product_name = EXCLUDED.product_name,
    product_url = EXCLUDED.product_url,
    quantity = best_selling_sites.quantity + EXCLUDED.quantity,
    updated_at = now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_populate_best_selling_sites"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_populate_best_selling_sites"() IS 'Função que popula automaticamente a tabela best_selling_sites baseada em inserções na tabela order_items';



CREATE OR REPLACE FUNCTION "public"."cleanup_stale_presence"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE user_presence 
    SET status = 'offline', 
        updated_at = NOW()
    WHERE status != 'offline' 
    AND last_seen < NOW() - INTERVAL '5 minutes';
END;
$$;


ALTER FUNCTION "public"."cleanup_stale_presence"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_price_processing"("p_entry_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  price_data JSONB;
  value_text TEXT;
  debug_info TEXT := '';
BEGIN
  debug_info := 'Processando entry_id: ' || p_entry_id || E'\n';
  
  -- Busca value
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%');
  
  price_data := value_text::jsonb;
  debug_info := debug_info || 'price original: ' || COALESCE((price_data->>'price'), 'NULL') || E'\n';
  debug_info := debug_info || 'promotional_price original: ' || COALESCE((price_data->>'promotional_price'), 'NULL') || E'\n';
  
  -- Normalizar price
  BEGIN
    price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
    debug_info := debug_info || 'price normalizado: ' || price_val || E'\n';
  EXCEPTION WHEN OTHERS THEN
    debug_info := debug_info || 'Erro no price: ' || SQLERRM || E'\n';
    price_val := 0;
  END;
  
  -- Normalizar promotional_price
  BEGIN
    promotional_price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'promotional_price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
    debug_info := debug_info || 'promotional_price normalizado: ' || promotional_price_val || E'\n';
  EXCEPTION WHEN OTHERS THEN
    debug_info := debug_info || 'Erro no promotional_price: ' || SQLERRM || E'\n';
    promotional_price_val := 0;
  END;
  
  -- Validação
  debug_info := debug_info || 'Validação:' || E'\n';
  debug_info := debug_info || '- price_val > 0: ' || (price_val > 0) || E'\n';
  debug_info := debug_info || '- promotional_price_val > 0: ' || (promotional_price_val > 0) || E'\n';
  debug_info := debug_info || '- promotional_price_val < price_val: ' || (promotional_price_val < price_val) || E'\n';
  
  IF price_val > 0 AND promotional_price_val > 0 AND promotional_price_val < price_val THEN
    percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
    debug_info := debug_info || 'Desconto calculado: ' || percent_val || '%' || E'\n';
    debug_info := debug_info || 'RESULTADO: SERIA INSERIDO' || E'\n';
  ELSE
    debug_info := debug_info || 'RESULTADO: SERIA IGNORADO' || E'\n';
  END IF;
  
  RETURN debug_info;
END;
$$;


ALTER FUNCTION "public"."debug_price_processing"("p_entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_promotion_processing"("p_entry_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  price_data JSONB;
  valuejson_text TEXT;
  value_text TEXT;
  debug_info TEXT := '';
BEGIN
  debug_info := 'Processando entry_id: ' || p_entry_id || E'\n';
  
  -- Busca value_json
  SELECT value_json::TEXT INTO valuejson_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value_json IS NOT NULL;
  
  debug_info := debug_info || 'value_json encontrado: ' || COALESCE(valuejson_text, 'NULL') || E'\n';
  
  -- Busca value
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%');
  
  debug_info := debug_info || 'value encontrado: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  -- Tenta converter
  IF value_text IS NOT NULL THEN
    BEGIN
      price_data := value_text::jsonb;
      debug_info := debug_info || 'Conversão para jsonb: OK' || E'\n';
      debug_info := debug_info || 'price: ' || COALESCE((price_data->>'price'), 'NULL') || E'\n';
      debug_info := debug_info || 'promotional_price: ' || COALESCE((price_data->>'promotional_price'), 'NULL') || E'\n';
    EXCEPTION WHEN OTHERS THEN
      debug_info := debug_info || 'Erro na conversão: ' || SQLERRM || E'\n';
    END;
  END IF;
  
  RETURN debug_info;
END;
$$;


ALTER FUNCTION "public"."debug_promotion_processing"("p_entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_coupon_usage"("coupon_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = coupon_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;
END;
$$;


ALTER FUNCTION "public"."increment_coupon_usage"("coupon_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if user exists in admins table and has admin role
    RETURN EXISTS (
        SELECT 1 
        FROM admins a
        JOIN roles r ON a.role_id = r.id
        WHERE a.id = user_id
          AND r.name = 'admin'
          AND a.role = 'admin'
    );
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_price_string"("price_str" "text") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF price_str IS NULL OR price_str = '' THEN
    RETURN 0;
  END IF;
  
  -- Remove tudo exceto números, vírgulas e pontos
  price_str := REGEXP_REPLACE(price_str, '[^0-9,\.]', '', 'g');
  
  -- Se tem vírgula E ponto, assume que vírgula é decimal e ponto é separador de milhares
  IF price_str LIKE '%,%' AND price_str LIKE '%.%' THEN
    -- Remove pontos (separadores de milhares) e substitui vírgula por ponto
    price_str := REPLACE(price_str, '.', '');
    price_str := REPLACE(price_str, ',', '.');
  -- Se tem só vírgula, substitui por ponto
  ELSIF price_str LIKE '%,%' THEN
    price_str := REPLACE(price_str, ',', '.');
  END IF;
  
  RETURN price_str::NUMERIC;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$;


ALTER FUNCTION "public"."normalize_price_string"("price_str" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."populate_promotion_sites"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
BEGIN
  -- Coleta dados de preço
  -- Sempre tenta converter value_json e value para jsonb
  DECLARE
    valuejson_text TEXT;
    value_text TEXT;
  BEGIN
    -- Tenta value_json primeiro
    SELECT value_json::TEXT INTO valuejson_text
    FROM form_entry_values
    WHERE entry_id = NEW.entry_id
      AND value_json IS NOT NULL
      AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%')
    LIMIT 1;
    IF valuejson_text IS NOT NULL THEN
      BEGIN
        price_data := valuejson_text::jsonb;
      EXCEPTION WHEN OTHERS THEN
        price_data := NULL;
      END;
    END IF;
    -- Se não achou, tenta value
    IF price_data IS NULL THEN
      SELECT value INTO value_text
      FROM form_entry_values
      WHERE entry_id = NEW.entry_id
        AND value IS NOT NULL
        AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
      LIMIT 1;
      IF value_text IS NOT NULL THEN
        BEGIN
          price_data := value_text::jsonb;
        EXCEPTION WHEN OTHERS THEN
          price_data := NULL;
        END;
      END IF;
    END IF;
  END;
  -- Coleta dados de URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = NEW.entry_id 
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  -- Se o registro atual tem dados de preço, prioriza
  IF NEW.value_json IS NOT NULL AND (NEW.value_json::TEXT LIKE '%"price"%' OR NEW.value_json::TEXT LIKE '%"promotional_price"%') THEN
    BEGIN
      price_data := NEW.value_json::TEXT::jsonb;
    EXCEPTION WHEN OTHERS THEN
      price_data := NULL;
    END;
  ELSIF NEW.value IS NOT NULL AND (NEW.value LIKE '%"price"%' OR NEW.value LIKE '%"promotional_price"%') THEN
    BEGIN
      price_data := NEW.value::jsonb;
    EXCEPTION WHEN OTHERS THEN
      price_data := NULL;
    END;
  END IF;
  -- Se o registro atual tem URL, prioriza
  IF NEW.value IS NOT NULL AND NEW.value ~ '^https?://' THEN
    url_data := NEW.value;
  END IF;
  -- Se não tem preço, não processa
  IF price_data IS NULL THEN
    RETURN NEW;
  END IF;
  -- Extrai e normaliza preço
  BEGIN
    price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
  EXCEPTION WHEN OTHERS THEN
    price_val := 0;
  END;
  BEGIN
    promotional_price_val := COALESCE(
      REPLACE(
        REGEXP_REPLACE((price_data::jsonb)->>'promotional_price', '[^0-9,\.]', '', 'g'),
        ',', '.'
      )::NUMERIC, 0
    );
  EXCEPTION WHEN OTHERS THEN
    promotional_price_val := 0;
  END;
  -- Valida preços
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    RAISE NOTICE 'Trigger populate_promotion_sites: entry_id=%, price=%, promo_price=% (ignorado)', NEW.entry_id, price_val, promotional_price_val;
    DELETE FROM promotion_sites WHERE entry_id = NEW.entry_id;
    RETURN NEW;
  END IF;
  RAISE NOTICE 'Trigger populate_promotion_sites: entry_id=%, price=%, promo_price=% (INSERIDO/ATUALIZADO)', NEW.entry_id, price_val, promotional_price_val;
  -- Calcula desconto
  percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
  url_val := COALESCE(url_data, '');
  -- Upsert
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
  -- Mantém só os 10 melhores
  DELETE FROM promotion_sites 
  WHERE id NOT IN (
    SELECT id FROM promotion_sites WHERE percent > 0 AND price IS NOT NULL AND promotional_price IS NOT NULL ORDER BY percent DESC, price DESC LIMIT 10
  ) AND percent > 0;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."populate_promotion_sites"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."populate_promotion_sites"() IS 'Função para popular automaticamente a tabela promotion_sites baseada em atualizações da form_entry_values';



CREATE OR REPLACE FUNCTION "public"."populate_promotion_sites_debug"("p_entry_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  price_val NUMERIC;
  promotional_price_val NUMERIC;
  percent_val NUMERIC;
  url_val TEXT;
  price_data JSONB;
  url_data TEXT;
  value_text TEXT;
  debug_log TEXT := '';
BEGIN
  debug_log := debug_log || 'Iniciando processamento para entry_id: ' || p_entry_id || E'\n';
  
  -- Busca dados
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
  LIMIT 1;
  
  debug_log := debug_log || 'value_text encontrado: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  IF value_text IS NOT NULL THEN
    BEGIN
      price_data := value_text::jsonb;
      debug_log := debug_log || 'Conversão para jsonb: OK' || E'\n';
    EXCEPTION WHEN OTHERS THEN
      debug_log := debug_log || 'Erro na conversão jsonb: ' || SQLERRM || E'\n';
      RETURN debug_log;
    END;
  ELSE
    debug_log := debug_log || 'Nenhum value_text encontrado, saindo' || E'\n';
    RETURN debug_log;
  END IF;
  
  -- URL
  SELECT value INTO url_data
  FROM form_entry_values 
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL 
    AND value ~ '^https?://'
  LIMIT 1;
  
  debug_log := debug_log || 'URL encontrada: ' || COALESCE(url_data, 'NULL') || E'\n';
  
  -- Normalizar preços
  debug_log := debug_log || 'price original: ' || (price_data->>'price') || E'\n';
  debug_log := debug_log || 'promotional_price original: ' || (price_data->>'promotional_price') || E'\n';
  
  price_val := normalize_price_string((price_data->>'price'));
  promotional_price_val := normalize_price_string((price_data->>'promotional_price'));
  
  debug_log := debug_log || 'price_val normalizado: ' || price_val || E'\n';
  debug_log := debug_log || 'promotional_price_val normalizado: ' || promotional_price_val || E'\n';
  
  -- Validações
  debug_log := debug_log || 'Validações:' || E'\n';
  debug_log := debug_log || '- price_val > 0: ' || (price_val > 0) || E'\n';
  debug_log := debug_log || '- promotional_price_val > 0: ' || (promotional_price_val > 0) || E'\n';
  debug_log := debug_log || '- promotional_price_val < price_val: ' || (promotional_price_val < price_val) || E'\n';
  
  IF price_val <= 0 OR promotional_price_val <= 0 OR promotional_price_val >= price_val THEN
    debug_log := debug_log || 'Validação FALHOU - seria deletado e ignorado' || E'\n';
  ELSE
    percent_val := ROUND(((price_val - promotional_price_val) / price_val * 100), 2);
    debug_log := debug_log || 'Desconto calculado: ' || percent_val || '%' || E'\n';
    debug_log := debug_log || 'SERIA INSERIDO/ATUALIZADO na tabela' || E'\n';
  END IF;
  
  RETURN debug_log;
END;
$$;


ALTER FUNCTION "public"."populate_promotion_sites_debug"("p_entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."populate_promotion_sites_debug_v2"("p_entry_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  price_data JSONB;
  value_text TEXT;
  debug_log TEXT := '';
  rec RECORD;
BEGIN
  debug_log := debug_log || 'Iniciando processamento para entry_id: ' || p_entry_id || E'\n';
  
  -- Ver TODOS os registros para esse entry_id
  debug_log := debug_log || 'Todos os registros para esse entry_id:' || E'\n';
  FOR rec IN 
    SELECT field_id, value, value_json
    FROM form_entry_values 
    WHERE entry_id = p_entry_id
  LOOP
    debug_log := debug_log || '- field_id: ' || rec.field_id || ', value: ' || COALESCE(rec.value, 'NULL') || ', value_json: ' || COALESCE(rec.value_json::TEXT, 'NULL') || E'\n';
  END LOOP;
  
  -- Tentar buscar dados de preço em value
  SELECT value INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value IS NOT NULL
    AND (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
  LIMIT 1;
  
  debug_log := debug_log || 'Busca em value com filtro de price: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  -- Se não achou, tentar sem filtro de price
  IF value_text IS NULL THEN
    SELECT value INTO value_text
    FROM form_entry_values
    WHERE entry_id = p_entry_id
      AND value IS NOT NULL
      AND value LIKE '%{%'
    LIMIT 1;
    
    debug_log := debug_log || 'Busca em value sem filtro (qualquer JSON): ' || COALESCE(value_text, 'NULL') || E'\n';
  END IF;
  
  -- Tentar buscar em value_json
  SELECT value_json::TEXT INTO value_text
  FROM form_entry_values
  WHERE entry_id = p_entry_id
    AND value_json IS NOT NULL
  LIMIT 1;
  
  debug_log := debug_log || 'Busca em value_json: ' || COALESCE(value_text, 'NULL') || E'\n';
  
  RETURN debug_log;
END;
$$;


ALTER FUNCTION "public"."populate_promotion_sites_debug_v2"("p_entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."populate_promotion_sites_manual"("p_entry_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."populate_promotion_sites_manual"("p_entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."populate_promotion_sites_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."populate_promotion_sites_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_all_promotion_data"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."process_all_promotion_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_existing_promotion_data"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT DISTINCT entry_id 
        FROM form_entry_values 
        WHERE (value LIKE '%"price"%' OR value LIKE '%"promotional_price"%')
           OR (value_json IS NOT NULL AND (value_json::TEXT LIKE '%"price"%' OR value_json::TEXT LIKE '%"promotional_price"%'))
    LOOP
        PERFORM populate_promotion_sites_manual(rec.entry_id);
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."process_existing_promotion_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_promotion_sites"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."refresh_promotion_sites"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."refresh_promotion_sites"() IS 'Função utilitária para reprocessar todos os dados e popular promotion_sites do zero';



CREATE OR REPLACE FUNCTION "public"."set_admin_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.role := 'admin';
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_admin_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_aprovment_payment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Se o status de pagamento mudou para 'paid', atualiza a data
  IF NEW.payment_status = 'paid' AND OLD.payment_status IS DISTINCT FROM 'paid' THEN
    NEW.aprovment_payment := NOW();
  -- Se o status de pagamento mudou para outro valor, zera a data
  ELSIF NEW.payment_status IS DISTINCT FROM 'paid' AND OLD.payment_status = 'paid' THEN
    NEW.aprovment_payment := NULL;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_aprovment_payment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_current_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.admin_id IS NOT NULL THEN
    NEW.current_id := NEW.admin_id;
  ELSIF NEW.user_id IS NOT NULL THEN
    NEW.current_id := NEW.user_id;
  ELSE
    RAISE EXCEPTION 'É necessário informar admin_id ou user_id';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_current_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_promotion_sites_trigger"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    test_entry_id UUID := gen_random_uuid();
    test_field_id UUID := gen_random_uuid();
    result_text TEXT := '';
BEGIN
    -- Inserir um registro de teste
    INSERT INTO form_entry_values (
        entry_id, 
        field_id, 
        value_json,
        value
    ) VALUES (
        test_entry_id,
        test_field_id,
        '{"price": "100.00", "promotional_price": "80.00", "url": "https://test.com"}'::jsonb,
        'test value'
    );
    
    -- Verificar se foi criado na promotion_sites
    IF EXISTS (SELECT 1 FROM promotion_sites WHERE entry_id = test_entry_id) THEN
        result_text := 'SUCCESS: Trigger funcionou! Registro criado na promotion_sites';
    ELSE
        result_text := 'FAIL: Trigger não funcionou. Nenhum registro na promotion_sites';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM form_entry_values WHERE entry_id = test_entry_id;
    DELETE FROM promotion_sites WHERE entry_id = test_entry_id;
    
    RETURN result_text;
END;
$$;


ALTER FUNCTION "public"."test_promotion_sites_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_real_data_trigger"() RETURNS TABLE("step" "text", "result" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    price_entry_id UUID;
    url_entry_id UUID;
    promotion_count INTEGER;
BEGIN
    -- Encontrar uma entrada com dados de preço
    SELECT fev.entry_id INTO price_entry_id
    FROM form_entry_values fev
    WHERE fev.value_json ? 'price' 
      AND fev.value_json ? 'promotional_price'
    LIMIT 1;
    
    -- Encontrar uma entrada com URL
    SELECT fev.entry_id INTO url_entry_id
    FROM form_entry_values fev
    WHERE fev.value ~ '^https?://'
    LIMIT 1;
    
    RETURN QUERY SELECT 'INFO'::TEXT, ('Entry com preços: ' || COALESCE(price_entry_id::TEXT, 'NENHUMA'))::TEXT;
    RETURN QUERY SELECT 'INFO'::TEXT, ('Entry com URL: ' || COALESCE(url_entry_id::TEXT, 'NENHUMA'))::TEXT;
    
    -- Combinar dados de preço e URL em uma única entrada para teste
    IF price_entry_id IS NOT NULL AND url_entry_id IS NOT NULL THEN
        -- Atualizar entrada de preço com URL
        UPDATE form_entry_values 
        SET value = (SELECT value FROM form_entry_values WHERE entry_id = url_entry_id LIMIT 1)
        WHERE entry_id = price_entry_id;
        
        RETURN QUERY SELECT 'UPDATE'::TEXT, 'Dados combinados - preço + URL'::TEXT;
        
        -- Aguardar trigger processar
        PERFORM pg_sleep(1);
        
        -- Verificar resultado
        SELECT COUNT(*) INTO promotion_count 
        FROM promotion_sites 
        WHERE entry_id = price_entry_id;
        
        IF promotion_count > 0 THEN
            RETURN QUERY SELECT 'SUCCESS'::TEXT, ('Encontrados ' || promotion_count || ' registros')::TEXT;
            
            RETURN QUERY 
            SELECT 'RESULT'::TEXT, 
                   ('percent: ' || COALESCE(percent::TEXT, 'NULL') || 
                    ', price: ' || COALESCE(price::TEXT, 'NULL') || 
                    ', promo: ' || COALESCE(promotional_price::TEXT, 'NULL') ||
                    ', url: ' || COALESCE(LEFT(url, 30), 'NULL'))::TEXT
            FROM promotion_sites 
            WHERE entry_id = price_entry_id;
        ELSE
            RETURN QUERY SELECT 'FAIL'::TEXT, 'Nenhum registro criado'::TEXT;
        END IF;
    ELSE
        RETURN QUERY SELECT 'ERROR'::TEXT, 'Dados insuficientes para teste'::TEXT;
    END IF;
END;
$$;


ALTER FUNCTION "public"."test_real_data_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_real_data_trigger_fixed"() RETURNS TABLE("step" "text", "result" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    test_entry_id UUID;
    test_record_count INTEGER;
BEGIN
    -- Criar um entry_id de teste
    test_entry_id := gen_random_uuid();
    
    RETURN QUERY SELECT 'INFO'::TEXT, ('Entry ID de teste: ' || test_entry_id::TEXT)::TEXT;
    
    -- Inserir dados de teste que simulam a estrutura real
    -- 1. Record com pricing data (value_json)
    INSERT INTO form_entry_values (id, entry_id, field_id, value, value_json, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_entry_id,
        '87866488-3270-447e-a0-d2579cb5-0517'::UUID, -- field_id fictício
        NULL,
        '{"price":"500,00","old_price":"500,00","promotional_price":"300,00","old_promotional_price":"300,00"}'::jsonb,
        now(),
        now()
    );
    
    -- 2. Record com URL (value)
    INSERT INTO form_entry_values (id, entry_id, field_id, value, value_json, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_entry_id,
        '87866488-3270-447e-a0-bfabf6e5-4986'::UUID, -- field_id fictício
        'https://www.teste.com',
        NULL,
        now(),
        now()
    );
    
    RETURN QUERY SELECT 'INSERT'::TEXT, 'Dados de teste inseridos'::TEXT;
    
    -- Aguardar trigger processar
    PERFORM pg_sleep(1);
    
    -- Verificar resultado
    SELECT COUNT(*) INTO test_record_count 
    FROM promotion_sites 
    WHERE entry_id = test_entry_id;
    
    IF test_record_count > 0 THEN
        RETURN QUERY SELECT 'SUCCESS'::TEXT, ('Encontrados ' || test_record_count || ' registros')::TEXT;
        
        RETURN QUERY 
        SELECT 'RESULT'::TEXT, 
               ('percent: ' || COALESCE(percent::TEXT, 'NULL') || 
                ', price: ' || COALESCE(price::TEXT, 'NULL') || 
                ', old_price: ' || COALESCE(old_price::TEXT, 'NULL') ||
                ', promo: ' || COALESCE(promotional_price::TEXT, 'NULL') ||
                ', old_promo: ' || COALESCE(old_promotional_price::TEXT, 'NULL') ||
                ', url: ' || COALESCE(LEFT(url, 30), 'NULL'))::TEXT
        FROM promotion_sites 
        WHERE entry_id = test_entry_id;
    ELSE
        RETURN QUERY SELECT 'FAIL'::TEXT, 'Nenhum registro criado'::TEXT;
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM form_entry_values WHERE entry_id = test_entry_id;
    DELETE FROM promotion_sites WHERE entry_id = test_entry_id;
    
    RETURN QUERY SELECT 'CLEANUP'::TEXT, 'Dados de teste removidos'::TEXT;
END;
$$;


ALTER FUNCTION "public"."test_real_data_trigger_fixed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_with_logs"() RETURNS TABLE("message" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Esta função vai mostrar as mensagens NOTICE como resultado
    SET client_min_messages TO NOTICE;
    
    -- Executar um update que deveria disparar o trigger
    UPDATE form_entry_values 
    SET value_json = '{"price": "200.00", "promotional-price": "150.00", "url": "https://example.com"}'::jsonb
    WHERE id = (SELECT id FROM form_entry_values LIMIT 1);
    
    RETURN QUERY SELECT 'Update executado - verifique os logs acima'::TEXT;
END;
$$;


ALTER FUNCTION "public"."test_with_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_best_selling_sites_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_best_selling_sites_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_company_data_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_company_data_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_contracts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_contracts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_email_templates_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_email_templates_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_form_entry_values_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_form_entry_values_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_form_entry_values_updated_at"() IS 'Função para atualizar automaticamente o campo updated_at da tabela form_entry_values';



CREATE OR REPLACE FUNCTION "public"."update_notification_types_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notification_types_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notifications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notifications_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_chat_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_order_chat_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_orders_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_orders_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_platform_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_platform_users_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_promotion_sites_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_promotion_sites_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sales_rank"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update rank based on total_sales in descending order
  WITH ranked_sites AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_sales DESC, monthly_sales DESC) as new_rank
    FROM best_selling_sites
    WHERE is_active = true
  )
  UPDATE best_selling_sites 
  SET sales_rank = ranked_sites.new_rank
  FROM ranked_sites
  WHERE best_selling_sites.id = ranked_sites.id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_sales_rank"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_shopping_cart_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_shopping_cart_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_presence_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_presence_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  user_month int;
  user_year int;
  month_name text;
  new_month_total int;
  new_last_date date;
BEGIN
  -- Descobre o mês e ano do usuário afetado
  IF (TG_OP = 'INSERT') THEN
    user_month := EXTRACT(MONTH FROM NEW.created_at);
    user_year := EXTRACT(YEAR FROM NEW.created_at);
  ELSE
    user_month := EXTRACT(MONTH FROM OLD.created_at);
    user_year := EXTRACT(YEAR FROM OLD.created_at);
  END IF;

  -- Nome do mês em português
  month_name := CASE user_month
    WHEN 1 THEN 'Janeiro'
    WHEN 2 THEN 'Fevereiro'
    WHEN 3 THEN 'Março'
    WHEN 4 THEN 'Abril'
    WHEN 5 THEN 'Maio'
    WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho'
    WHEN 8 THEN 'Agosto'
    WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro'
    WHEN 11 THEN 'Novembro'
    WHEN 12 THEN 'Dezembro'
    ELSE 'Desconhecido'
  END;

  -- Conta quantos usuários existem para o mês/ano
  SELECT COUNT(*), MAX(created_at::date)
    INTO new_month_total, new_last_date
    FROM auth.users
    WHERE EXTRACT(MONTH FROM created_at) = user_month
      AND EXTRACT(YEAR FROM created_at) = user_year;

  -- Se já existe registro em user_stats, atualiza. Se não, insere.
  IF EXISTS (
    SELECT 1 FROM public.user_stats WHERE name = month_name AND year = user_year
  ) THEN
    UPDATE public.user_stats
      SET month_total = new_month_total,
          last_date = new_last_date
      WHERE name = month_name AND year = user_year;
  ELSE
    INSERT INTO public.user_stats (month_total, name, last_date, year)
      VALUES (new_month_total, month_name, new_last_date, user_year);
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_user_stats"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "is_first_admin" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text",
    "marketing_automation" boolean DEFAULT false,
    "newsletter" boolean DEFAULT false,
    "offer_suggestions" boolean DEFAULT false,
    "avatar_url" "text",
    "role_id" "uuid" NOT NULL,
    "role" character varying(50)
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."best_selling_sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid",
    "product_name" "text" NOT NULL,
    "product_url" "text" NOT NULL,
    "quantity" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."best_selling_sites" OWNER TO "postgres";


COMMENT ON TABLE "public"."best_selling_sites" IS 'Tabela para armazenar informações sobre os sites mais vendidos';



COMMENT ON COLUMN "public"."best_selling_sites"."id" IS 'Identificador único do registro';



COMMENT ON COLUMN "public"."best_selling_sites"."entry_id" IS 'Referência ao form_entries (chave estrangeira com CASCADE)';



COMMENT ON COLUMN "public"."best_selling_sites"."product_name" IS 'Nome do produto';



COMMENT ON COLUMN "public"."best_selling_sites"."product_url" IS 'URL do produto';



COMMENT ON COLUMN "public"."best_selling_sites"."quantity" IS 'Quantidade vendida';



COMMENT ON COLUMN "public"."best_selling_sites"."created_at" IS 'Data de criação do registro';



COMMENT ON COLUMN "public"."best_selling_sites"."updated_at" IS 'Data da última atualização';



CREATE TABLE IF NOT EXISTS "public"."cart_checkout_resume" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entry_id" "uuid",
    "product_url" character varying(255),
    "quantity" integer DEFAULT 1,
    "niche" character varying(255),
    "price" numeric(10,2),
    "service_content" character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "niche_selected" "text"[],
    "service_selected" "text"[],
    "item_total" numeric DEFAULT 0
);


ALTER TABLE "public"."cart_checkout_resume" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid",
    "legal_status" "text" NOT NULL,
    "country" "text" NOT NULL,
    "company_name" "text",
    "city" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "address" "text" NOT NULL,
    "document_number" "text" NOT NULL,
    "withdrawal_method" "text",
    "bank_account" "text",
    "paypal_id" "text",
    "other_payment_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pix_key_type" "public"."pix_key_type",
    "pix_key" "text",
    "bank_transfer_type" "text",
    "bank_code" "text",
    "bank_agency" "text",
    "bank_account_number" "text",
    "bank_account_type" "text",
    "bank_account_holder" "text",
    "bank_account_holder_document" "text",
    "bank_swift" "text",
    "bank_iban" "text",
    "bank_routing_number" "text",
    "bank_address" "text",
    "bank_country" "text",
    "state" character varying(32),
    "user_id" "uuid",
    CONSTRAINT "company_data_bank_transfer_type_check" CHECK (("bank_transfer_type" = ANY (ARRAY['domestic'::"text", 'international'::"text"]))),
    CONSTRAINT "company_data_legal_status_check" CHECK (("legal_status" = ANY (ARRAY['business'::"text", 'individual'::"text"]))),
    CONSTRAINT "company_data_withdrawal_method_check" CHECK (("withdrawal_method" = ANY (ARRAY['bank'::"text", 'paypal'::"text", 'pix'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."company_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "type_of_contract" "text" NOT NULL,
    "contract_content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contracts_type_of_contract_check" CHECK (("type_of_contract" = ANY (ARRAY['termos_condicoes'::"text", 'contrato_pf'::"text", 'contrato_cnpj'::"text", 'politica_privacidade'::"text"])))
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "discount_type" "text" NOT NULL,
    "discount_value" numeric(10,2) NOT NULL,
    "minimum_amount" numeric(10,2),
    "maximum_discount" numeric(10,2),
    "usage_limit" integer,
    "usage_count" integer DEFAULT 0 NOT NULL,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "maximum_amount" numeric(10,2),
    "individual_use_only" boolean DEFAULT false NOT NULL,
    "exclude_sale_items" boolean DEFAULT false NOT NULL,
    "usage_limit_per_customer" integer,
    CONSTRAINT "check_usage_limit_per_customer" CHECK ((("usage_limit_per_customer" IS NULL) OR ("usage_limit_per_customer" > 0))),
    CONSTRAINT "coupons_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'cart_fixed'::"text", 'product_fixed'::"text"]))),
    CONSTRAINT "coupons_discount_value_check" CHECK (("discount_value" > (0)::numeric)),
    CONSTRAINT "coupons_usage_limit_check" CHECK (("usage_limit" > 0)),
    CONSTRAINT "valid_date_range" CHECK ((("end_date" IS NULL) OR ("start_date" IS NULL) OR ("end_date" > "start_date"))),
    CONSTRAINT "valid_percentage" CHECK ((("discount_type" <> 'percentage'::"text") OR (("discount_value" >= (0)::numeric) AND ("discount_value" <= (100)::numeric))))
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


COMMENT ON COLUMN "public"."coupons"."maximum_amount" IS 'Valor máximo que pode ser aplicado no pedido para usar este cupom';



COMMENT ON COLUMN "public"."coupons"."individual_use_only" IS 'Indica se o cupom não pode ser usado junto com outros cupons';



COMMENT ON COLUMN "public"."coupons"."exclude_sale_items" IS 'Indica se o cupom não é válido para produtos em promoção';



COMMENT ON COLUMN "public"."coupons"."usage_limit_per_customer" IS 'Limite de vezes que um cliente pode usar este cupom';



CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorite_sites" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entry_id" "uuid" NOT NULL
);


ALTER TABLE "public"."favorite_sites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "category" "text"[] NOT NULL,
    "priority" "text"[] NOT NULL,
    "subject" character varying(500) NOT NULL,
    "message" "text" NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "admin_notes" "text",
    "user_type" character varying(50) DEFAULT 'user'::character varying,
    "is_internal" boolean DEFAULT false
);


ALTER TABLE "public"."feedback_submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."feedback_submissions" IS 'Tabela para armazenar feedback e sugestões dos usuários';



COMMENT ON COLUMN "public"."feedback_submissions"."category" IS 'Array [nome_categoria, id_categoria]: ex: ["Melhoria do Produto", "1"]';



COMMENT ON COLUMN "public"."feedback_submissions"."priority" IS 'Array [nome_prioridade, id_prioridade]: ex: ["Alta", "3"]';



CREATE TABLE IF NOT EXISTS "public"."form_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_id" "uuid",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "form_entries_status_check" CHECK (("status" = ANY (ARRAY['em_analise'::"text", 'verificado'::"text", 'reprovado'::"text", 'active'::"text", 'spam'::"text", 'trash'::"text"])))
);


ALTER TABLE "public"."form_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_entry_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid",
    "note" "text" NOT NULL,
    "type" "text" DEFAULT 'note'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "form_entry_notes_type_check" CHECK (("type" = ANY (ARRAY['note'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."form_entry_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_entry_values" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid",
    "field_id" "uuid",
    "value" "text",
    "value_json" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."form_entry_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_field_niche" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_field_id" "uuid",
    "options" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."form_field_niche" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_field_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_id" "uuid",
    "label_text" "text",
    "label_visibility" "text",
    "placeholder_text" "text",
    "help_text" "text",
    "is_required" boolean DEFAULT false,
    "no_duplicates" boolean DEFAULT false,
    "visibility" "text" DEFAULT 'visible'::"text",
    "validation_type" "text",
    "validation_regex" "text",
    "min_length" integer,
    "max_length" integer,
    "min_value" numeric,
    "max_value" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "field_identifier" "text",
    "input_mask_enabled" boolean DEFAULT false,
    "input_mask_pattern" "text",
    "columns" smallint DEFAULT 1,
    "max_selections" integer,
    "inline_layout" boolean DEFAULT false,
    "allowed_extensions" "text",
    "multiple_files" boolean DEFAULT false,
    "max_files" integer,
    "max_file_size" integer,
    "product_currency" "text" DEFAULT 'BRL'::"text",
    "product_description" "text",
    "commission_rate" numeric,
    "disable_quantity" boolean DEFAULT false,
    "date_format" "text" DEFAULT 'dd/mm/yyyy'::"text",
    "time_format" "text" DEFAULT 'HH:mm'::"text",
    "countries" "jsonb" DEFAULT '[]'::"jsonb",
    "show_percentage" boolean DEFAULT false,
    "country_field_id" "text",
    "country_relation_enabled" boolean DEFAULT false NOT NULL,
    "show_logo" boolean DEFAULT true,
    "marketplace_label" "text",
    "custom_button_text" boolean DEFAULT false,
    "button_text" "text",
    "position_last_column" boolean DEFAULT false,
    "button_style" "text" DEFAULT 'primary'::"text",
    "sort_by_field" boolean DEFAULT false,
    "is_product_name" boolean DEFAULT false,
    "is_site_url" boolean DEFAULT false,
    CONSTRAINT "form_field_settings_columns_check" CHECK (("columns" = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT "form_field_settings_label_visibility_check" CHECK (("label_visibility" = ANY (ARRAY['visible'::"text", 'hidden'::"text"]))),
    CONSTRAINT "form_field_settings_max_file_size_check" CHECK (("max_file_size" > 0)),
    CONSTRAINT "form_field_settings_max_files_check" CHECK (("max_files" > 0)),
    CONSTRAINT "form_field_settings_max_selections_check" CHECK (("max_selections" > 0)),
    CONSTRAINT "form_field_settings_visibility_check" CHECK (("visibility" = ANY (ARRAY['visible'::"text", 'hidden'::"text", 'admin'::"text", 'marketplace'::"text"])))
);


ALTER TABLE "public"."form_field_settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."form_field_settings"."commission_rate" IS 'Sales commission percentage for products';



CREATE TABLE IF NOT EXISTS "public"."form_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_id" "uuid",
    "field_type" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "placeholder" "text",
    "default_value" "text",
    "options" "jsonb" DEFAULT '[]'::"jsonb",
    "validation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "is_required" boolean DEFAULT false,
    "position" integer DEFAULT 0 NOT NULL,
    "width" "text" DEFAULT 'full'::"text",
    "css_class" "text",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "modal_content" "text",
    CONSTRAINT "form_fields_field_type_check" CHECK (("field_type" = ANY (ARRAY['text'::"text", 'textarea'::"text", 'number'::"text", 'email'::"text", 'phone'::"text", 'url'::"text", 'date'::"text", 'time'::"text", 'select'::"text", 'multiselect'::"text", 'radio'::"text", 'checkbox'::"text", 'toggle'::"text", 'section'::"text", 'file'::"text", 'html'::"text", 'country'::"text", 'brazilian_states'::"text", 'moz_da'::"text", 'semrush_as'::"text", 'ahrefs_dr'::"text", 'ahrefs_traffic'::"text", 'similarweb_traffic'::"text", 'google_traffic'::"text", 'brand'::"text", 'button_buy'::"text", 'commission'::"text", 'product'::"text", 'niche'::"text", 'import_csv'::"text"]))),
    CONSTRAINT "form_fields_width_check" CHECK (("width" = ANY (ARRAY['full'::"text", 'half'::"text", 'third'::"text", 'quarter'::"text"])))
);


ALTER TABLE "public"."form_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "fields" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "validation_rules" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "success_message" "text",
    "failure_message" "text",
    "submit_button_text" "text" DEFAULT 'Enviar'::"text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "redirect_page" "text",
    "visible_to" "text" DEFAULT 'all'::"text" NOT NULL,
    "no_data_message" "text" DEFAULT 'No entries found'::"text",
    CONSTRAINT "forms_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "forms_visible_to_check" CHECK (("visible_to" = ANY (ARRAY['all'::"text", 'publisher'::"text", 'advertiser'::"text"])))
);


ALTER TABLE "public"."forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."menu_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "path" "text",
    "parent_id" "uuid",
    "position" integer DEFAULT 0 NOT NULL,
    "is_visible" boolean DEFAULT true NOT NULL,
    "requires_permission" "text",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "visible_to" "text" DEFAULT 'all'::"text" NOT NULL,
    CONSTRAINT "menu_items_visible_to_check" CHECK (("visible_to" = ANY (ARRAY['all'::"text", 'publisher'::"text", 'advertiser'::"text"])))
);


ALTER TABLE "public"."menu_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_id" "uuid",
    "recipient" "text" DEFAULT 'admins'::"text" NOT NULL,
    "order_id" "uuid"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."notifications"."sender_id" IS 'ID do usuário que enviou a mensagem (quem criou a notificação)';



COMMENT ON COLUMN "public"."notifications"."customer_id" IS 'ID do cliente/comprador do pedido (orders.user_id)';



COMMENT ON COLUMN "public"."notifications"."recipient" IS 'Destinatário da notificação: UUID do usuário específico ou "admins" para todos os admins';



COMMENT ON COLUMN "public"."notifications"."order_id" IS 'ID do pedido relacionado à notificação (opcional, usado para redirecionamento)';



CREATE TABLE IF NOT EXISTS "public"."order_chat" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "entry_id" "uuid",
    "sender_id" "uuid" NOT NULL,
    "sender_type" character varying(20) NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "order_chat_sender_type_check" CHECK ((("sender_type")::"text" = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::"text"[])))
);

ALTER TABLE ONLY "public"."order_chat" REPLICA IDENTITY FULL;


ALTER TABLE "public"."order_chat" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_chat" IS 'Stores chat messages between users and admins for specific order items with proper RLS policies';



CREATE TABLE IF NOT EXISTS "public"."order_chat_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "order_chat_participants_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'participant'::"text", 'admin'::"text", 'support'::"text"])))
);

ALTER TABLE ONLY "public"."order_chat_participants" REPLICA IDENTITY FULL;


ALTER TABLE "public"."order_chat_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "entry_id" "uuid",
    "product_name" "text" NOT NULL,
    "product_url" "text",
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "niche" "jsonb",
    "service_content" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "article_document_path" "text",
    "article_doc" "text",
    "article_url_status" "text" DEFAULT 'pending'::"text",
    "publication_status" "text" DEFAULT 'pending'::"text",
    "article_url" "text",
    "outline" "jsonb",
    CONSTRAINT "order_items_article_url_status_check" CHECK (("article_url_status" = ANY (ARRAY['pending'::"text", 'sent'::"text"]))),
    CONSTRAINT "order_items_publication_status_check" CHECK (("publication_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."order_items"."outline" IS 'JSON data containing article outline information (palavra-chave, url_site, texto_ancora, requisitos_especiais)';



CREATE TABLE IF NOT EXISTS "public"."order_totals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_product_price" numeric NOT NULL,
    "total_final_price" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "total_content_price" numeric,
    "total_word_count" integer DEFAULT 0,
    "applied_coupon_id" "uuid",
    "discount_value" numeric(10,2) DEFAULT 0,
    CONSTRAINT "order_totals_discount_value_check" CHECK (("discount_value" >= (0)::numeric))
);


ALTER TABLE "public"."order_totals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."order_totals"."total_word_count" IS 'Total de palavras do pedido (conteúdo)';



COMMENT ON COLUMN "public"."order_totals"."applied_coupon_id" IS 'ID do cupom aplicado no pedido';



COMMENT ON COLUMN "public"."order_totals"."discount_value" IS 'Valor do desconto aplicado ao pedido';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "payment_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "billing_name" "text" NOT NULL,
    "billing_email" "text" NOT NULL,
    "billing_address" "text" NOT NULL,
    "billing_city" "text" NOT NULL,
    "billing_state" "text" NOT NULL,
    "billing_zip_code" "text" NOT NULL,
    "billing_document_number" "text" NOT NULL,
    "payment_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" character varying(20),
    "aprovment_payment" timestamp without time zone,
    "idempotency_key" "text"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pagarme_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pagarme_webhook_secret" "text",
    "pagarme_test_mode" boolean DEFAULT true,
    "currency" "text" DEFAULT 'BRL'::"text",
    "payment_methods" "text"[] DEFAULT ARRAY['credit_card'::"text"],
    "antifraude_enabled" boolean DEFAULT true,
    "antifraude_min_amount" numeric(10,2) DEFAULT 10.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pagarme_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "meta_title" "text",
    "meta_description" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "visible_to" "text" DEFAULT 'all'::"text" NOT NULL,
    CONSTRAINT "pages_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "pages_visible_to_check" CHECK (("visible_to" = ANY (ARRAY['all'::"text", 'publisher'::"text", 'advertiser'::"text"])))
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stripe_public_key" "text",
    "stripe_secret_key" "text",
    "stripe_webhook_secret" "text",
    "stripe_enabled" boolean DEFAULT false,
    "stripe_test_mode" boolean DEFAULT true,
    "currency" "text" DEFAULT 'BRL'::"text",
    "payment_methods" "text"[] DEFAULT ARRAY['card'::"text"],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "payment_method" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "transaction_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "terms_accepted" boolean DEFAULT false NOT NULL,
    "terms_accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "avatar_url" "text",
    "role_id" "uuid",
    CONSTRAINT "platform_users_role_check" CHECK (("role" = ANY (ARRAY['advertiser'::"text", 'publisher'::"text"]))),
    CONSTRAINT "platform_users_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."platform_users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."platform_users"."role_id" IS 'Foreign key to roles table. Can be null during registration flow but should be set after role verification.';



CREATE TABLE IF NOT EXISTS "public"."promotion_sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid",
    "percent" numeric(5,2),
    "price" numeric(10,2),
    "old_price" numeric(10,2),
    "promotional_price" numeric(10,2),
    "old_promotional_price" numeric(10,2),
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "promotion_sites_old_price_check" CHECK (("old_price" >= (0)::numeric)),
    CONSTRAINT "promotion_sites_old_promotional_price_check" CHECK (("old_promotional_price" >= (0)::numeric)),
    CONSTRAINT "promotion_sites_percent_check" CHECK ((("percent" >= (0)::numeric) AND ("percent" <= (100)::numeric))),
    CONSTRAINT "promotion_sites_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "promotion_sites_promotional_price_check" CHECK (("promotional_price" >= (0)::numeric))
);


ALTER TABLE "public"."promotion_sites" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_sites" IS 'Tabela para armazenar informações promocionais de sites vinculadas a entradas de formulário';



COMMENT ON COLUMN "public"."promotion_sites"."id" IS 'Identificador único da promoção';



COMMENT ON COLUMN "public"."promotion_sites"."entry_id" IS 'Referência para a entrada do formulário';



COMMENT ON COLUMN "public"."promotion_sites"."percent" IS 'Percentual de desconto (0-100)';



COMMENT ON COLUMN "public"."promotion_sites"."price" IS 'Preço atual';



COMMENT ON COLUMN "public"."promotion_sites"."old_price" IS 'Preço anterior';



COMMENT ON COLUMN "public"."promotion_sites"."promotional_price" IS 'Preço promocional atual';



COMMENT ON COLUMN "public"."promotion_sites"."old_promotional_price" IS 'Preço promocional anterior';



COMMENT ON COLUMN "public"."promotion_sites"."url" IS 'URL do site promocional';



CREATE TABLE IF NOT EXISTS "public"."publisher_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid",
    "user_id" "uuid",
    "current_id" "uuid" NOT NULL,
    "service_title" "text" NOT NULL,
    "service_type" "text" NOT NULL,
    "product_type" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."publisher_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid",
    "title" "text" NOT NULL,
    "subtitle" "text",
    "price" numeric(12,2) NOT NULL,
    "price_per_word" numeric(12,2) NOT NULL,
    "word_count" integer NOT NULL,
    "benefits" "text"[] NOT NULL,
    "not_benefits" "text"[],
    "period" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order_layout" integer,
    "layout_toggle" boolean DEFAULT false,
    "is_free" boolean,
    CONSTRAINT "period_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "period")) > 0)),
    CONSTRAINT "title_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "title")) > 0))
);


ALTER TABLE "public"."service_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "services_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "light_logo" "text",
    "dark_logo" "text",
    "platform_icon" "text",
    "smtp_host" "text" DEFAULT 'smtp.resend.com'::"text",
    "smtp_port" "text" DEFAULT '465'::"text",
    "smtp_user" "text" DEFAULT 'resend'::"text",
    "smtp_pass" "text",
    "smtp_from_email" "text" DEFAULT 'noreply@cp.suaimprensa.com.br'::"text",
    "smtp_from_name" "text" DEFAULT 'Sua Imprensa'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "site_title" "text" DEFAULT 'Marketplace Platform'::"text",
    "site_description" "text" DEFAULT 'Plataforma de marketplace para conectar publishers e anunciantes'::"text",
    "marketplace_in_test" boolean DEFAULT false,
    "marketplace_in_maintenance" boolean DEFAULT false,
    "marketplace_test_message" "text" DEFAULT 'O marketplace está em modo de teste. Algumas funcionalidades podem não estar disponíveis.'::"text",
    "marketplace_maintenance_message" "text" DEFAULT 'O marketplace está temporariamente em manutenção. Tente novamente em alguns minutos.'::"text",
    "header_scripts" "text",
    "footer_scripts" "text"
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."settings"."marketplace_in_test" IS 'Flag to enable/disable test mode for the marketplace';



COMMENT ON COLUMN "public"."settings"."marketplace_in_maintenance" IS 'Flag to enable/disable maintenance mode for the marketplace';



COMMENT ON COLUMN "public"."settings"."marketplace_test_message" IS 'Message displayed when marketplace is in test mode';



COMMENT ON COLUMN "public"."settings"."marketplace_maintenance_message" IS 'Message displayed when marketplace is in maintenance mode';



COMMENT ON COLUMN "public"."settings"."header_scripts" IS 'HTML/JavaScript code to be injected in <head> section for analytics, meta tags, etc.';



COMMENT ON COLUMN "public"."settings"."footer_scripts" IS 'HTML/JavaScript code to be injected before </body> tag for widgets, tracking, etc.';



CREATE TABLE IF NOT EXISTS "public"."shopping_cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "entry_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shopping_cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."shopping_cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trigger_debug_log" (
    "id" integer NOT NULL,
    "trigger_name" "text",
    "entry_id" "uuid",
    "action_type" "text",
    "message" "text",
    "data" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."trigger_debug_log" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trigger_debug_log_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trigger_debug_log_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trigger_debug_log_id_seq" OWNED BY "public"."trigger_debug_log"."id";



CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "entry_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_presence" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text",
    "status" "text" NOT NULL,
    "last_seen" timestamp with time zone DEFAULT "now"() NOT NULL,
    "online_at" timestamp with time zone,
    "order_item_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_presence_status_check" CHECK (("status" = ANY (ARRAY['online'::"text", 'offline'::"text", 'typing'::"text", 'idle'::"text"])))
);

ALTER TABLE ONLY "public"."user_presence" REPLICA IDENTITY FULL;


ALTER TABLE "public"."user_presence" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_presence" IS 'Tabela para gerenciar presença online/offline dos usuários';



COMMENT ON COLUMN "public"."user_presence"."user_id" IS 'ID do usuário (referência para auth.users)';



COMMENT ON COLUMN "public"."user_presence"."status" IS 'Status atual: online, offline, typing, idle';



COMMENT ON COLUMN "public"."user_presence"."last_seen" IS 'Último momento em que o usuário foi visto ativo';



COMMENT ON COLUMN "public"."user_presence"."online_at" IS 'Momento em que ficou online pela última vez';



COMMENT ON COLUMN "public"."user_presence"."order_item_id" IS 'Chat específico (opcional, para presença global use NULL)';



CREATE TABLE IF NOT EXISTS "public"."user_stats" (
    "id" integer NOT NULL,
    "month_total" integer DEFAULT 0 NOT NULL,
    "name" "text" NOT NULL,
    "last_date" "date" NOT NULL,
    "year" integer NOT NULL
);


ALTER TABLE "public"."user_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_stats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_stats_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_stats_id_seq" OWNED BY "public"."user_stats"."id";



ALTER TABLE ONLY "public"."trigger_debug_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trigger_debug_log_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_stats" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_stats_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."best_selling_sites"
    ADD CONSTRAINT "best_selling_sites_entry_id_unique" UNIQUE ("entry_id");



ALTER TABLE ONLY "public"."best_selling_sites"
    ADD CONSTRAINT "best_selling_sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_checkout_resume"
    ADD CONSTRAINT "cart_checkout_resume_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_data"
    ADD CONSTRAINT "company_data_admin_unique" UNIQUE ("admin_id");



ALTER TABLE ONLY "public"."company_data"
    ADD CONSTRAINT "company_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorite_sites"
    ADD CONSTRAINT "favorite_sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback_submissions"
    ADD CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_entries"
    ADD CONSTRAINT "form_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_entry_notes"
    ADD CONSTRAINT "form_entry_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_entry_values"
    ADD CONSTRAINT "form_entry_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_field_niche"
    ADD CONSTRAINT "form_field_niche_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_field_settings"
    ADD CONSTRAINT "form_field_settings_field_id_key" UNIQUE ("field_id");



ALTER TABLE ONLY "public"."form_field_settings"
    ADD CONSTRAINT "form_field_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."menu_items"
    ADD CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_types"
    ADD CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_types"
    ADD CONSTRAINT "notification_types_type_unique" UNIQUE ("type");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_chat_participants"
    ADD CONSTRAINT "order_chat_participants_order_item_id_user_id_key" UNIQUE ("order_item_id", "user_id");



ALTER TABLE ONLY "public"."order_chat_participants"
    ADD CONSTRAINT "order_chat_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_chat"
    ADD CONSTRAINT "order_chat_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_totals"
    ADD CONSTRAINT "order_totals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_idempotency_key_key" UNIQUE ("idempotency_key");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pagarme_settings"
    ADD CONSTRAINT "pagarme_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."payment_settings"
    ADD CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_users"
    ADD CONSTRAINT "platform_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."platform_users"
    ADD CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_sites"
    ADD CONSTRAINT "promotion_sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."publisher_services"
    ADD CONSTRAINT "publisher_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_cards"
    ADD CONSTRAINT "service_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shopping_cart_items"
    ADD CONSTRAINT "shopping_cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shopping_cart_items"
    ADD CONSTRAINT "shopping_cart_items_user_entry_unique" UNIQUE ("user_id", "entry_id");



ALTER TABLE ONLY "public"."trigger_debug_log"
    ADD CONSTRAINT "trigger_debug_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_entry_values"
    ADD CONSTRAINT "unique_entry_field" UNIQUE ("entry_id", "field_id");



ALTER TABLE ONLY "public"."promotion_sites"
    ADD CONSTRAINT "unique_entry_id" UNIQUE ("entry_id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_entry_unique" UNIQUE ("user_id", "entry_id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admins_email" ON "public"."admins" USING "btree" ("email");



CREATE INDEX "idx_admins_is_first_admin" ON "public"."admins" USING "btree" ("is_first_admin");



CREATE INDEX "idx_best_selling_sites_created_at" ON "public"."best_selling_sites" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_best_selling_sites_entry_id" ON "public"."best_selling_sites" USING "btree" ("entry_id");



CREATE INDEX "idx_best_selling_sites_product_name" ON "public"."best_selling_sites" USING "btree" ("product_name");



CREATE INDEX "idx_best_selling_sites_quantity" ON "public"."best_selling_sites" USING "btree" ("quantity" DESC);



CREATE INDEX "idx_company_data_admin_id" ON "public"."company_data" USING "btree" ("admin_id");



CREATE INDEX "idx_company_data_document_number" ON "public"."company_data" USING "btree" ("document_number");



CREATE INDEX "idx_company_data_legal_status" ON "public"."company_data" USING "btree" ("legal_status");



CREATE INDEX "idx_contracts_admin_id" ON "public"."contracts" USING "btree" ("admin_id");



CREATE INDEX "idx_contracts_type" ON "public"."contracts" USING "btree" ("type_of_contract");



CREATE UNIQUE INDEX "idx_contracts_unique_admin_type" ON "public"."contracts" USING "btree" ("admin_id", "type_of_contract");



CREATE INDEX "idx_coupons_code" ON "public"."coupons" USING "btree" ("code");



CREATE INDEX "idx_coupons_created_at" ON "public"."coupons" USING "btree" ("created_at");



CREATE INDEX "idx_coupons_dates" ON "public"."coupons" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_coupons_exclude_sale_items" ON "public"."coupons" USING "btree" ("exclude_sale_items");



CREATE INDEX "idx_coupons_individual_use" ON "public"."coupons" USING "btree" ("individual_use_only");



CREATE INDEX "idx_coupons_is_active" ON "public"."coupons" USING "btree" ("is_active");



CREATE INDEX "idx_email_templates_code" ON "public"."email_templates" USING "btree" ("code");



CREATE INDEX "idx_feedback_category" ON "public"."feedback_submissions" USING "gin" ("category");



CREATE INDEX "idx_feedback_created_at" ON "public"."feedback_submissions" USING "btree" ("created_at");



CREATE INDEX "idx_feedback_email" ON "public"."feedback_submissions" USING "btree" ("email");



CREATE INDEX "idx_feedback_priority" ON "public"."feedback_submissions" USING "gin" ("priority");



CREATE INDEX "idx_feedback_status" ON "public"."feedback_submissions" USING "btree" ("status");



CREATE INDEX "idx_feedback_user_id" ON "public"."feedback_submissions" USING "btree" ("user_id");



CREATE INDEX "idx_feedback_user_type" ON "public"."feedback_submissions" USING "btree" ("user_type");



CREATE INDEX "idx_form_entries_created_at" ON "public"."form_entries" USING "btree" ("created_at");



CREATE INDEX "idx_form_entries_created_by" ON "public"."form_entries" USING "btree" ("created_by");



CREATE INDEX "idx_form_entries_form_id" ON "public"."form_entries" USING "btree" ("form_id");



CREATE INDEX "idx_form_entries_status" ON "public"."form_entries" USING "btree" ("status");



CREATE INDEX "idx_form_entry_notes_created_at" ON "public"."form_entry_notes" USING "btree" ("created_at");



CREATE INDEX "idx_form_entry_notes_entry_id" ON "public"."form_entry_notes" USING "btree" ("entry_id");



CREATE INDEX "idx_form_entry_values_entry_id" ON "public"."form_entry_values" USING "btree" ("entry_id");



CREATE INDEX "idx_form_entry_values_field_id" ON "public"."form_entry_values" USING "btree" ("field_id");



CREATE INDEX "idx_form_entry_values_updated_at" ON "public"."form_entry_values" USING "btree" ("updated_at");



CREATE INDEX "idx_form_entry_values_value" ON "public"."form_entry_values" USING "btree" ("value");



CREATE INDEX "idx_form_entry_values_value_json" ON "public"."form_entry_values" USING "gin" ("value_json");



CREATE INDEX "idx_form_entry_values_value_json_price" ON "public"."form_entry_values" USING "gin" ((("value_json" -> 'price'::"text"))) WHERE ("value_json" ? 'price'::"text");



CREATE INDEX "idx_form_entry_values_value_json_promotional_price" ON "public"."form_entry_values" USING "gin" ((("value_json" -> 'promotional_price'::"text"))) WHERE ("value_json" ? 'promotional_price'::"text");



CREATE INDEX "idx_form_field_settings_countries" ON "public"."form_field_settings" USING "gin" ("countries");



CREATE INDEX "idx_form_field_settings_country_field_id" ON "public"."form_field_settings" USING "btree" ("country_field_id");



CREATE INDEX "idx_form_field_settings_country_relation" ON "public"."form_field_settings" USING "btree" ("country_relation_enabled");



CREATE INDEX "idx_form_field_settings_field_id" ON "public"."form_field_settings" USING "btree" ("field_id");



CREATE INDEX "idx_form_field_settings_field_identifier" ON "public"."form_field_settings" USING "btree" ("field_identifier");



CREATE INDEX "idx_form_field_settings_is_product_name" ON "public"."form_field_settings" USING "btree" ("is_product_name");



CREATE INDEX "idx_form_field_settings_is_site_url" ON "public"."form_field_settings" USING "btree" ("is_site_url");



CREATE INDEX "idx_form_field_settings_max_selections" ON "public"."form_field_settings" USING "btree" ("max_selections");



CREATE INDEX "idx_form_field_settings_multiple_files" ON "public"."form_field_settings" USING "btree" ("multiple_files");



CREATE INDEX "idx_form_field_settings_sort_by_field" ON "public"."form_field_settings" USING "btree" ("sort_by_field");



CREATE INDEX "idx_form_field_settings_validation_type" ON "public"."form_field_settings" USING "btree" ("validation_type");



CREATE INDEX "idx_form_fields_field_type" ON "public"."form_fields" USING "btree" ("field_type");



CREATE INDEX "idx_form_fields_form_id" ON "public"."form_fields" USING "btree" ("form_id");



CREATE INDEX "idx_form_fields_position" ON "public"."form_fields" USING "btree" ("position");



CREATE INDEX "idx_forms_redirect_page" ON "public"."forms" USING "btree" ("redirect_page");



CREATE INDEX "idx_forms_status" ON "public"."forms" USING "btree" ("status");



CREATE INDEX "idx_forms_visible_to" ON "public"."forms" USING "btree" ("visible_to");



CREATE INDEX "idx_menu_items_parent_id" ON "public"."menu_items" USING "btree" ("parent_id");



CREATE INDEX "idx_menu_items_position" ON "public"."menu_items" USING "btree" ("position");



CREATE INDEX "idx_menu_items_visible_to" ON "public"."menu_items" USING "btree" ("visible_to");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at");



CREATE INDEX "idx_notifications_customer_id" ON "public"."notifications" USING "btree" ("customer_id");



CREATE INDEX "idx_notifications_customer_type_created" ON "public"."notifications" USING "btree" ("customer_id", "type", "created_at" DESC);



CREATE INDEX "idx_notifications_order_id" ON "public"."notifications" USING "btree" ("order_id");



CREATE INDEX "idx_notifications_recipient" ON "public"."notifications" USING "btree" ("recipient");



CREATE INDEX "idx_notifications_recipient_created" ON "public"."notifications" USING "btree" ("recipient", "created_at" DESC);



CREATE INDEX "idx_notifications_sender_id" ON "public"."notifications" USING "btree" ("sender_id");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_order_chat_created_at" ON "public"."order_chat" USING "btree" ("created_at");



CREATE INDEX "idx_order_chat_is_read" ON "public"."order_chat" USING "btree" ("is_read");



CREATE INDEX "idx_order_chat_order_id" ON "public"."order_chat" USING "btree" ("order_id");



CREATE INDEX "idx_order_chat_order_item_id" ON "public"."order_chat" USING "btree" ("order_item_id");



CREATE INDEX "idx_order_chat_sender_id" ON "public"."order_chat" USING "btree" ("sender_id");



CREATE INDEX "idx_order_items_article_doc" ON "public"."order_items" USING "btree" ("article_doc");



CREATE INDEX "idx_order_items_article_url_status" ON "public"."order_items" USING "btree" ("article_url_status");



CREATE INDEX "idx_order_items_entry_id" ON "public"."order_items" USING "btree" ("entry_id");



CREATE INDEX "idx_order_items_has_outline" ON "public"."order_items" USING "btree" ((("outline" IS NOT NULL)));



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_outline" ON "public"."order_items" USING "gin" ("outline");



CREATE INDEX "idx_order_items_publication_status" ON "public"."order_items" USING "btree" ("publication_status");



CREATE INDEX "idx_order_totals_applied_coupon_id" ON "public"."order_totals" USING "btree" ("applied_coupon_id");



CREATE INDEX "idx_orders_payment_status" ON "public"."orders" USING "btree" ("payment_status");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_pages_slug" ON "public"."pages" USING "btree" ("slug");



CREATE INDEX "idx_pages_status" ON "public"."pages" USING "btree" ("status");



CREATE INDEX "idx_pages_visible_to" ON "public"."pages" USING "btree" ("visible_to");



CREATE INDEX "idx_permissions_category" ON "public"."permissions" USING "btree" ("category");



CREATE INDEX "idx_permissions_code" ON "public"."permissions" USING "btree" ("code");



CREATE INDEX "idx_platform_users_email" ON "public"."platform_users" USING "btree" ("email");



CREATE INDEX "idx_platform_users_role" ON "public"."platform_users" USING "btree" ("role");



CREATE INDEX "idx_platform_users_role_status" ON "public"."platform_users" USING "btree" ("role", "status");



CREATE INDEX "idx_platform_users_status" ON "public"."platform_users" USING "btree" ("status");



CREATE INDEX "idx_promotion_sites_created_at" ON "public"."promotion_sites" USING "btree" ("created_at");



CREATE INDEX "idx_promotion_sites_entry_id" ON "public"."promotion_sites" USING "btree" ("entry_id");



CREATE INDEX "idx_roles_name" ON "public"."roles" USING "btree" ("name");



CREATE INDEX "idx_services_status" ON "public"."services" USING "btree" ("status");



CREATE INDEX "idx_settings_footer_scripts" ON "public"."settings" USING "btree" ("footer_scripts") WHERE ("footer_scripts" IS NOT NULL);



CREATE INDEX "idx_settings_header_scripts" ON "public"."settings" USING "btree" ("header_scripts") WHERE ("header_scripts" IS NOT NULL);



CREATE INDEX "idx_settings_marketplace_modes" ON "public"."settings" USING "btree" ("marketplace_in_test", "marketplace_in_maintenance");



CREATE INDEX "idx_settings_site_meta" ON "public"."settings" USING "btree" ("site_title", "site_description");



CREATE INDEX "idx_shopping_cart_items_entry_id" ON "public"."shopping_cart_items" USING "btree" ("entry_id");



CREATE INDEX "idx_shopping_cart_items_user_id" ON "public"."shopping_cart_items" USING "btree" ("user_id");



CREATE INDEX "idx_user_favorites_entry_id" ON "public"."user_favorites" USING "btree" ("entry_id");



CREATE INDEX "idx_user_favorites_user_id" ON "public"."user_favorites" USING "btree" ("user_id");



CREATE INDEX "idx_user_presence_last_seen" ON "public"."user_presence" USING "btree" ("last_seen");



CREATE INDEX "idx_user_presence_order_item_id" ON "public"."user_presence" USING "btree" ("order_item_id");



CREATE INDEX "idx_user_presence_status" ON "public"."user_presence" USING "btree" ("status");



CREATE INDEX "idx_user_presence_user_id" ON "public"."user_presence" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_user_presence_user_order_unique" ON "public"."user_presence" USING "btree" ("user_id", COALESCE("order_item_id", '00000000-0000-0000-0000-000000000000'::"uuid"));



CREATE INDEX "notifications_created_at_idx" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "notifications_type_idx" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("sender_id");



CREATE OR REPLACE TRIGGER "admins_set_role" BEFORE INSERT ON "public"."admins" FOR EACH ROW EXECUTE FUNCTION "public"."set_admin_role"();



CREATE OR REPLACE TRIGGER "auto_add_chat_participants_trigger" BEFORE INSERT ON "public"."order_chat" FOR EACH ROW EXECUTE FUNCTION "public"."auto_add_chat_participants"();



CREATE OR REPLACE TRIGGER "auto_populate_promotion_sites" AFTER INSERT OR UPDATE ON "public"."form_entry_values" FOR EACH ROW EXECUTE FUNCTION "public"."populate_promotion_sites"();



CREATE OR REPLACE TRIGGER "best_selling_sites_updated_at" BEFORE UPDATE ON "public"."best_selling_sites" FOR EACH ROW EXECUTE FUNCTION "public"."update_best_selling_sites_updated_at"();



CREATE OR REPLACE TRIGGER "contracts_updated_at" BEFORE UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."update_contracts_updated_at"();



CREATE OR REPLACE TRIGGER "form_entry_values_updated_at" BEFORE UPDATE ON "public"."form_entry_values" FOR EACH ROW EXECUTE FUNCTION "public"."update_form_entry_values_updated_at"();



CREATE OR REPLACE TRIGGER "populate_promotion_sites_on_insert" AFTER INSERT ON "public"."form_entry_values" FOR EACH ROW EXECUTE FUNCTION "public"."populate_promotion_sites_trigger"();



CREATE OR REPLACE TRIGGER "populate_promotion_sites_on_update" AFTER UPDATE ON "public"."form_entry_values" FOR EACH ROW EXECUTE FUNCTION "public"."populate_promotion_sites_trigger"();



CREATE OR REPLACE TRIGGER "promotion_sites_updated_at" BEFORE UPDATE ON "public"."promotion_sites" FOR EACH ROW EXECUTE FUNCTION "public"."update_promotion_sites_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."form_field_niche" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."order_totals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."publisher_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_set_current_id" BEFORE INSERT ON "public"."publisher_services" FOR EACH ROW EXECUTE FUNCTION "public"."set_current_id"();



CREATE OR REPLACE TRIGGER "trigger_auto_populate_best_selling_sites" AFTER INSERT ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."auto_populate_best_selling_sites"();



COMMENT ON TRIGGER "trigger_auto_populate_best_selling_sites" ON "public"."order_items" IS 'Trigger que executa auto_populate_best_selling_sites() após inserção em order_items';



CREATE OR REPLACE TRIGGER "trigger_set_aprovment_payment" BEFORE UPDATE OF "payment_status" ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_aprovment_payment"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."form_entries" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at" BEFORE UPDATE ON "public"."service_cards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_user_presence_updated_at" BEFORE UPDATE ON "public"."user_presence" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_presence_updated_at"();



CREATE OR REPLACE TRIGGER "update_admins_updated_at" BEFORE UPDATE ON "public"."admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_company_data_updated_at" BEFORE UPDATE ON "public"."company_data" FOR EACH ROW EXECUTE FUNCTION "public"."update_company_data_updated_at"();



CREATE OR REPLACE TRIGGER "update_coupons_updated_at" BEFORE UPDATE ON "public"."coupons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_templates_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_email_templates_updated_at"();



CREATE OR REPLACE TRIGGER "update_feedback_updated_at" BEFORE UPDATE ON "public"."feedback_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_form_field_settings_updated_at" BEFORE UPDATE ON "public"."form_field_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_form_fields_updated_at" BEFORE UPDATE ON "public"."form_fields" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_forms_updated_at" BEFORE UPDATE ON "public"."forms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_menu_items_updated_at" BEFORE UPDATE ON "public"."menu_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_types_updated_at" BEFORE UPDATE ON "public"."notification_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_types_updated_at"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_notifications_updated_at"();



CREATE OR REPLACE TRIGGER "update_order_chat_updated_at_trigger" BEFORE UPDATE ON "public"."order_chat" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_chat_updated_at"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_orders_updated_at"();



CREATE OR REPLACE TRIGGER "update_pagarme_settings_updated_at" BEFORE UPDATE ON "public"."pagarme_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pages_updated_at" BEFORE UPDATE ON "public"."pages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_payment_settings_updated_at" BEFORE UPDATE ON "public"."payment_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_permissions_updated_at" BEFORE UPDATE ON "public"."permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_platform_users_updated_at" BEFORE UPDATE ON "public"."platform_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_platform_users_updated_at"();



CREATE OR REPLACE TRIGGER "update_roles_updated_at" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_services_updated_at" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_settings_updated_at" BEFORE UPDATE ON "public"."settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_settings_updated_at"();



CREATE OR REPLACE TRIGGER "update_shopping_cart_items_updated_at" BEFORE UPDATE ON "public"."shopping_cart_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_shopping_cart_items_updated_at"();



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."best_selling_sites"
    ADD CONSTRAINT "best_selling_sites_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_checkout_resume"
    ADD CONSTRAINT "cart_checkout_resume_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_data"
    ADD CONSTRAINT "company_data_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_data"
    ADD CONSTRAINT "company_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."favorite_sites"
    ADD CONSTRAINT "favorite_sites_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_chat"
    ADD CONSTRAINT "fk_order_chat_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_chat"
    ADD CONSTRAINT "fk_order_chat_order_item" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_chat"
    ADD CONSTRAINT "fk_order_chat_sender" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_entries"
    ADD CONSTRAINT "form_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_entries"
    ADD CONSTRAINT "form_entries_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_entry_notes"
    ADD CONSTRAINT "form_entry_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_entry_notes"
    ADD CONSTRAINT "form_entry_notes_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_entry_values"
    ADD CONSTRAINT "form_entry_values_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_entry_values"
    ADD CONSTRAINT "form_entry_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_field_niche"
    ADD CONSTRAINT "form_field_niche_form_field_id_fkey" FOREIGN KEY ("form_field_id") REFERENCES "public"."form_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_field_settings"
    ADD CONSTRAINT "form_field_settings_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."menu_items"
    ADD CONSTRAINT "menu_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."menu_items"
    ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."menu_items"
    ADD CONSTRAINT "menu_items_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_type_fkey" FOREIGN KEY ("type") REFERENCES "public"."notification_types"("type") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_chat_participants"
    ADD CONSTRAINT "order_chat_participants_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_chat_participants"
    ADD CONSTRAINT "order_chat_participants_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_chat_participants"
    ADD CONSTRAINT "order_chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_totals"
    ADD CONSTRAINT "order_totals_applied_coupon_id_fkey" FOREIGN KEY ("applied_coupon_id") REFERENCES "public"."coupons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_users"
    ADD CONSTRAINT "platform_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_users"
    ADD CONSTRAINT "platform_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."promotion_sites"
    ADD CONSTRAINT "promotion_sites_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."publisher_services"
    ADD CONSTRAINT "publisher_services_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."publisher_services"
    ADD CONSTRAINT "publisher_services_product_type_fkey" FOREIGN KEY ("product_type") REFERENCES "public"."forms"("id");



ALTER TABLE ONLY "public"."publisher_services"
    ADD CONSTRAINT "publisher_services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_cards"
    ADD CONSTRAINT "service_cards_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."publisher_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shopping_cart_items"
    ADD CONSTRAINT "shopping_cart_items_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shopping_cart_items"
    ADD CONSTRAINT "shopping_cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."form_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create entry notes" ON "public"."form_entry_notes" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete all order items" ON "public"."order_items" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete all orders" ON "public"."orders" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete chat messages" ON "public"."order_chat" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text"))))));



CREATE POLICY "Admins can delete coupons" ON "public"."coupons" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete entry notes" ON "public"."form_entry_notes" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete form entries" ON "public"."form_entries" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete form field settings" ON "public"."form_field_settings" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete form fields" ON "public"."form_fields" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete forms" ON "public"."forms" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete menu_items" ON "public"."menu_items" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete pages" ON "public"."pages" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete promotion sites" ON "public"."promotion_sites" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Admins can delete services" ON "public"."services" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete their own account" ON "public"."admins" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Admins can delete their own company data" ON "public"."company_data" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "admin_id"));



CREATE POLICY "Admins can insert coupons" ON "public"."coupons" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert form field settings" ON "public"."form_field_settings" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert form fields" ON "public"."form_fields" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert forms" ON "public"."forms" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert menu_items" ON "public"."menu_items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert pages" ON "public"."pages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert services" ON "public"."services" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert their own company data" ON "public"."company_data" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "admin_id"));



CREATE POLICY "Admins can manage all payments" ON "public"."payments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage payment settings" ON "public"."payment_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read coupons" ON "public"."coupons" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read email templates" ON "public"."email_templates" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read entry notes" ON "public"."form_entry_notes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read entry values" ON "public"."form_entry_values" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read form entries" ON "public"."form_entries" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read menu_items" ON "public"."menu_items" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))) OR ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))) AND (("visible_to" = 'all'::"text") OR ("visible_to" = ( SELECT "platform_users"."role"
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"())))))));



CREATE POLICY "Admins can read pages" ON "public"."pages" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))) OR ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))) AND ("status" = 'published'::"text") AND (("visible_to" = 'all'::"text") OR ("visible_to" = ( SELECT "platform_users"."role"
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"())))))));



CREATE POLICY "Admins can read permissions" ON "public"."permissions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read promotion sites" ON "public"."promotion_sites" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Admins can read role_permissions" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read roles" ON "public"."roles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read services" ON "public"."services" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read their own company data" ON "public"."company_data" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "admin_id"));



CREATE POLICY "Admins can read their own data" ON "public"."admins" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Admins can update all orders" ON "public"."orders" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update coupons" ON "public"."coupons" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update email templates" ON "public"."email_templates" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update entry notes" ON "public"."form_entry_notes" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update form entries" ON "public"."form_entries" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update form field settings" ON "public"."form_field_settings" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update form fields" ON "public"."form_fields" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update forms" ON "public"."forms" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update menu_items" ON "public"."menu_items" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update pages" ON "public"."pages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update promotion sites" ON "public"."promotion_sites" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Admins can update services" ON "public"."services" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update settings" ON "public"."settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update their own company data" ON "public"."company_data" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "admin_id")) WITH CHECK (("auth"."uid"() = "admin_id"));



CREATE POLICY "Admins can update their own data" ON "public"."admins" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Admins can view all order items" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view all orders" ON "public"."orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view all presence" ON "public"."user_presence" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins" "a"
  WHERE ("a"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view platform users" ON "public"."platform_users" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins podem inserir admins" ON "public"."admins" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins" "a"
  WHERE ("a"."id" = "auth"."uid"()))));



CREATE POLICY "Allow admin creation" ON "public"."admins" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow admins and owners to delete form_entry_values" ON "public"."form_entry_values" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("r"."id" = "a"."role_id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Allow admins and owners to insert form_entry_values" ON "public"."form_entry_values" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("r"."id" = "a"."role_id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Allow admins and owners to read form_entry_values" ON "public"."form_entry_values" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("r"."id" = "a"."role_id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Allow admins and owners to update form_entry_values" ON "public"."form_entry_values" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("r"."id" = "a"."role_id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"())))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("r"."id" = "a"."role_id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Allow anonymous read access to roles" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "Allow anonymous user creation" ON "public"."platform_users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated delete own company_data" ON "public"."company_data" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND (("admin_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated insert own company_data" ON "public"."company_data" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND (("admin_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated read own company_data" ON "public"."company_data" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (("admin_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated update own company_data" ON "public"."company_data" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND (("admin_id" = "auth"."uid"()) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to manage pagarme settings" ON "public"."pagarme_settings" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete for authenticated" ON "public"."order_totals" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow delete for owner" ON "public"."order_items" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Allow insert for authenticated" ON "public"."order_totals" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert for owner" ON "public"."order_items" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Allow read for authenticated users or service role" ON "public"."pagarme_settings" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) OR ("current_setting"('request.jwt.claim.role'::"text", true) = 'service_role'::"text")));



CREATE POLICY "Allow select for authenticated" ON "public"."order_totals" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow select for owner" ON "public"."order_items" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Allow update for authenticated" ON "public"."order_totals" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow update for owner" ON "public"."order_items" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))))) WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Anyone can create entry values" ON "public"."form_entry_values" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."form_entries" "fe"
     JOIN "public"."forms" "f" ON (("f"."id" = "fe"."form_id")))
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("f"."status" = 'published'::"text")))));



CREATE POLICY "Anyone can create form entries" ON "public"."form_entries" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."forms" "f"
  WHERE (("f"."id" = "form_entries"."form_id") AND ("f"."status" = 'published'::"text")))));



CREATE POLICY "Anyone can read form field settings" ON "public"."form_field_settings" FOR SELECT USING (true);



CREATE POLICY "Anyone can read form fields" ON "public"."form_fields" FOR SELECT USING (true);



CREATE POLICY "Anyone can read published forms" ON "public"."forms" FOR SELECT USING ((("status" = 'published'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"())))));



CREATE POLICY "Anyone can read settings" ON "public"."settings" FOR SELECT USING (true);



CREATE POLICY "Anyone can view all entries for marketplace" ON "public"."form_entries" FOR SELECT USING (true);



CREATE POLICY "Anyone can view all entry values for marketplace" ON "public"."form_entry_values" FOR SELECT USING (true);



CREATE POLICY "Anyone can view values of verified entries" ON "public"."form_entry_values" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."status" = 'verificado'::"text")))));



CREATE POLICY "Anyone can view verified entries" ON "public"."form_entries" FOR SELECT USING (("status" = 'verificado'::"text"));



CREATE POLICY "Authenticated users can access their own favorite sites" ON "public"."favorite_sites" USING (((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))) OR ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))) AND ("user_id" = "auth"."uid"()))));



CREATE POLICY "Authenticated users can delete best selling sites" ON "public"."best_selling_sites" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert best selling sites" ON "public"."best_selling_sites" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert favorite sites" ON "public"."favorite_sites" FOR INSERT WITH CHECK ((((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"())))) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Authenticated users can read best selling sites" ON "public"."best_selling_sites" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read payment settings" ON "public"."payment_settings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read privacy policy" ON "public"."contracts" FOR SELECT TO "authenticated" USING (("type_of_contract" = 'politica_privacidade'::"text"));



CREATE POLICY "Authenticated users can read terms and conditions" ON "public"."contracts" FOR SELECT TO "authenticated" USING (("type_of_contract" = 'termos_condicoes'::"text"));



CREATE POLICY "Authenticated users can update best selling sites" ON "public"."best_selling_sites" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "No delete on user_stats" ON "public"."user_stats" FOR DELETE USING (false);



CREATE POLICY "No insert on user_stats" ON "public"."user_stats" FOR INSERT WITH CHECK (false);



CREATE POLICY "No update on user_stats" ON "public"."user_stats" FOR UPDATE USING (false) WITH CHECK (false);



CREATE POLICY "Only admins can delete contracts" ON "public"."contracts" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Only admins can insert contracts" ON "public"."contracts" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Only admins can read contracts" ON "public"."contracts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Only admins can update contracts" ON "public"."contracts" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Permitir delete para autenticados" ON "public"."cart_checkout_resume" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir delete para autenticados" ON "public"."form_field_niche" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir delete para autenticados" ON "public"."publisher_services" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir delete para autenticados" ON "public"."service_cards" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir insert para autenticados" ON "public"."cart_checkout_resume" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir insert para autenticados" ON "public"."form_field_niche" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir insert para autenticados" ON "public"."publisher_services" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir insert para autenticados" ON "public"."service_cards" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir select para autenticados" ON "public"."cart_checkout_resume" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir select para autenticados" ON "public"."form_field_niche" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir select para autenticados" ON "public"."publisher_services" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir select para autenticados" ON "public"."service_cards" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir update para autenticados" ON "public"."cart_checkout_resume" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir update para autenticados" ON "public"."form_field_niche" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir update para autenticados" ON "public"."publisher_services" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Permitir update para autenticados" ON "public"."service_cards" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Platform users can delete promotion sites" ON "public"."promotion_sites" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))));



CREATE POLICY "Platform users can insert promotion sites" ON "public"."promotion_sites" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))));



CREATE POLICY "Platform users can read promotion sites" ON "public"."promotion_sites" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))));



CREATE POLICY "Platform users can update promotion sites" ON "public"."promotion_sites" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."platform_users"
  WHERE ("platform_users"."id" = "auth"."uid"()))));



CREATE POLICY "Public can read privacy policy" ON "public"."contracts" FOR SELECT TO "anon" USING (("type_of_contract" = 'politica_privacidade'::"text"));



CREATE POLICY "Public can read terms and conditions" ON "public"."contracts" FOR SELECT TO "anon" USING (("type_of_contract" = 'termos_condicoes'::"text"));



CREATE POLICY "Public can verify admin emails" ON "public"."admins" FOR SELECT USING (true);



CREATE POLICY "Public can verify user emails" ON "public"."platform_users" FOR SELECT USING (true);



CREATE POLICY "Test insert promotion sites" ON "public"."promotion_sites" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Todos autenticados podem ver user_stats" ON "public"."user_stats" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can add notes to their own entries" ON "public"."form_entry_notes" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_notes"."entry_id") AND ("fe"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can create own feedback_submissions" ON "public"."feedback_submissions" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Users can create own orders" ON "public"."orders" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Users can create their own orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own feedback_submissions" ON "public"."feedback_submissions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own orders" ON "public"."orders" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own cart items" ON "public"."shopping_cart_items" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own entries" ON "public"."form_entries" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their own entry values" ON "public"."form_entry_values" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own favorites" ON "public"."user_favorites" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own order items" ON "public"."order_items" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own orders" ON "public"."orders" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their participation" ON "public"."order_chat_participants" FOR DELETE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"())))));



CREATE POLICY "Users can insert participants" ON "public"."order_chat_participants" FOR INSERT WITH CHECK (((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_chat_participants"."order_id") AND ("orders"."user_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))) OR ("auth"."uid"() IS NULL)));



CREATE POLICY "Users can insert their own cart items" ON "public"."shopping_cart_items" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own chat messages" ON "public"."order_chat" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("sender_id" = "auth"."uid"()) AND (((("sender_type")::"text" = 'user'::"text") AND ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_chat"."order_id") AND ("o"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."order_chat_participants" "p"
  WHERE (("p"."order_item_id" = "order_chat"."order_item_id") AND ("p"."user_id" = "auth"."uid"())))))) OR ((("sender_type")::"text" = 'admin'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."admins" "a"
  WHERE ("a"."id" = "auth"."uid"())))))));



CREATE POLICY "Users can insert their own favorites" ON "public"."user_favorites" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own order items" ON "public"."order_items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read active coupons for validation" ON "public"."coupons" FOR SELECT TO "authenticated" USING (("is_active" = true));



COMMENT ON POLICY "Users can read active coupons for validation" ON "public"."coupons" IS 'Permite que usuários autenticados leiam cupons ativos para validação durante o checkout';



CREATE POLICY "Users can read their own chat messages" ON "public"."order_chat" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND (true OR (EXISTS ( SELECT 1
   FROM "public"."admins" "a"
  WHERE ("a"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can read their own data" ON "public"."platform_users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can read their participation" ON "public"."order_chat_participants" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_chat_participants"."order_id") AND ("orders"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update chat messages" ON "public"."order_chat" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_chat"."order_id") AND ("o"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."admins" "a"
  WHERE ("a"."id" = "auth"."uid"())))))) WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_chat"."order_id") AND ("o"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."admins" "a"
  WHERE ("a"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can update own feedback_submissions" ON "public"."feedback_submissions" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own orders" ON "public"."orders" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own presence" ON "public"."user_presence" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own cart items" ON "public"."shopping_cart_items" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own data" ON "public"."platform_users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own entries" ON "public"."form_entries" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their own entry values" ON "public"."form_entry_values" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can update their participation" ON "public"."order_chat_participants" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))))) WITH CHECK ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"())))));



CREATE POLICY "Users can view notes on their own entries" ON "public"."form_entry_notes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_notes"."entry_id") AND ("fe"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can view others presence in same chat" ON "public"."user_presence" FOR SELECT USING ((("order_item_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."order_chat_participants" "ocp"
  WHERE (("ocp"."order_item_id" = "user_presence"."order_item_id") AND ("ocp"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view own feedback_submissions" ON "public"."feedback_submissions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own presence" ON "public"."user_presence" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own cart items" ON "public"."shopping_cart_items" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own entries" ON "public"."form_entries" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can view their own entry values" ON "public"."form_entry_values" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."form_entries" "fe"
  WHERE (("fe"."id" = "form_entry_values"."entry_id") AND ("fe"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can view their own favorites" ON "public"."user_favorites" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own order items" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."best_selling_sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cart_checkout_resume" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorite_sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_entry_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_entry_values" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_field_niche" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_field_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."menu_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notification_types_delete_admin_only" ON "public"."notification_types" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "notification_types_insert_admin_only" ON "public"."notification_types" FOR INSERT WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "notification_types_select_admin_only" ON "public"."notification_types" FOR SELECT USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "notification_types_update_admin_only" ON "public"."notification_types" FOR UPDATE USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_create_policy" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "notifications_delete_all" ON "public"."notifications" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "notifications_delete_policy" ON "public"."notifications" FOR DELETE TO "authenticated" USING ((("customer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text"))))));



CREATE POLICY "notifications_insert_own" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "notifications_read_policy" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((("recipient" = ("auth"."uid"())::"text") OR (("recipient" = 'admins'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text"))))) OR (EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text"))))));



CREATE POLICY "notifications_select_all" ON "public"."notifications" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "notifications_update_all" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "notifications_update_policy" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((("customer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."admins" "a"
     JOIN "public"."roles" "r" ON (("a"."role_id" = "r"."id")))
  WHERE (("a"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text"))))));



ALTER TABLE "public"."order_chat" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_chat_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_totals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pagarme_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotion_sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."publisher_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shopping_cart_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "temp_allow_all_for_authenticated" ON "public"."order_items" USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_presence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_max_selections_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_max_selections_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_max_selections_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."analyze_form_entry_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_form_entry_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_form_entry_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_add_chat_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_add_chat_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_add_chat_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_populate_best_selling_sites"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_populate_best_selling_sites"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_populate_best_selling_sites"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_stale_presence"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_stale_presence"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_stale_presence"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_price_processing"("p_entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."debug_price_processing"("p_entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_price_processing"("p_entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_promotion_processing"("p_entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."debug_promotion_processing"("p_entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_promotion_processing"("p_entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_coupon_usage"("coupon_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_coupon_usage"("coupon_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_coupon_usage"("coupon_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_price_string"("price_str" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_price_string"("price_str" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_price_string"("price_str" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_promotion_sites"() TO "anon";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites"() TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_promotion_sites_debug"("p_entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_debug"("p_entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_debug"("p_entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_promotion_sites_debug_v2"("p_entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_debug_v2"("p_entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_debug_v2"("p_entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_promotion_sites_manual"("p_entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_manual"("p_entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_manual"("p_entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_promotion_sites_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_promotion_sites_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_all_promotion_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_all_promotion_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_all_promotion_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_existing_promotion_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_existing_promotion_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_existing_promotion_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_promotion_sites"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_promotion_sites"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_promotion_sites"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_admin_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_admin_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_admin_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_aprovment_payment"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_aprovment_payment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_aprovment_payment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_current_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_current_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_current_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_promotion_sites_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_promotion_sites_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_promotion_sites_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_real_data_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_real_data_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_real_data_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_real_data_trigger_fixed"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_real_data_trigger_fixed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_real_data_trigger_fixed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_with_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_with_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_with_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_best_selling_sites_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_best_selling_sites_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_best_selling_sites_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_company_data_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_company_data_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_company_data_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_contracts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contracts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contracts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_email_templates_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_email_templates_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_email_templates_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_form_entry_values_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_form_entry_values_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_form_entry_values_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notification_types_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notification_types_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notification_types_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notifications_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_chat_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_chat_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_chat_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_orders_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_orders_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_orders_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_platform_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_platform_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_platform_users_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_promotion_sites_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_promotion_sites_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_promotion_sites_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sales_rank"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sales_rank"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sales_rank"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_settings_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_shopping_cart_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_shopping_cart_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_shopping_cart_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_presence_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_presence_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_presence_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_stats"() TO "service_role";



GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."best_selling_sites" TO "anon";
GRANT ALL ON TABLE "public"."best_selling_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."best_selling_sites" TO "service_role";



GRANT ALL ON TABLE "public"."cart_checkout_resume" TO "anon";
GRANT ALL ON TABLE "public"."cart_checkout_resume" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_checkout_resume" TO "service_role";



GRANT ALL ON TABLE "public"."company_data" TO "anon";
GRANT ALL ON TABLE "public"."company_data" TO "authenticated";
GRANT ALL ON TABLE "public"."company_data" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."favorite_sites" TO "anon";
GRANT ALL ON TABLE "public"."favorite_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorite_sites" TO "service_role";



GRANT ALL ON TABLE "public"."feedback_submissions" TO "anon";
GRANT ALL ON TABLE "public"."feedback_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."form_entries" TO "anon";
GRANT ALL ON TABLE "public"."form_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."form_entries" TO "service_role";



GRANT ALL ON TABLE "public"."form_entry_notes" TO "anon";
GRANT ALL ON TABLE "public"."form_entry_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."form_entry_notes" TO "service_role";



GRANT ALL ON TABLE "public"."form_entry_values" TO "anon";
GRANT ALL ON TABLE "public"."form_entry_values" TO "authenticated";
GRANT ALL ON TABLE "public"."form_entry_values" TO "service_role";



GRANT ALL ON TABLE "public"."form_field_niche" TO "anon";
GRANT ALL ON TABLE "public"."form_field_niche" TO "authenticated";
GRANT ALL ON TABLE "public"."form_field_niche" TO "service_role";



GRANT ALL ON TABLE "public"."form_field_settings" TO "anon";
GRANT ALL ON TABLE "public"."form_field_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."form_field_settings" TO "service_role";



GRANT ALL ON TABLE "public"."form_fields" TO "anon";
GRANT ALL ON TABLE "public"."form_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."form_fields" TO "service_role";



GRANT ALL ON TABLE "public"."forms" TO "anon";
GRANT ALL ON TABLE "public"."forms" TO "authenticated";
GRANT ALL ON TABLE "public"."forms" TO "service_role";



GRANT ALL ON TABLE "public"."menu_items" TO "anon";
GRANT ALL ON TABLE "public"."menu_items" TO "authenticated";
GRANT ALL ON TABLE "public"."menu_items" TO "service_role";



GRANT ALL ON TABLE "public"."notification_types" TO "anon";
GRANT ALL ON TABLE "public"."notification_types" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_types" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_chat" TO "anon";
GRANT ALL ON TABLE "public"."order_chat" TO "authenticated";
GRANT ALL ON TABLE "public"."order_chat" TO "service_role";



GRANT ALL ON TABLE "public"."order_chat_participants" TO "anon";
GRANT ALL ON TABLE "public"."order_chat_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."order_chat_participants" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_totals" TO "anon";
GRANT ALL ON TABLE "public"."order_totals" TO "authenticated";
GRANT ALL ON TABLE "public"."order_totals" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."pagarme_settings" TO "anon";
GRANT ALL ON TABLE "public"."pagarme_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."pagarme_settings" TO "service_role";



GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";



GRANT ALL ON TABLE "public"."payment_settings" TO "anon";
GRANT ALL ON TABLE "public"."payment_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_settings" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."platform_users" TO "anon";
GRANT ALL ON TABLE "public"."platform_users" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_users" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_sites" TO "anon";
GRANT ALL ON TABLE "public"."promotion_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_sites" TO "service_role";



GRANT ALL ON TABLE "public"."publisher_services" TO "anon";
GRANT ALL ON TABLE "public"."publisher_services" TO "authenticated";
GRANT ALL ON TABLE "public"."publisher_services" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."service_cards" TO "anon";
GRANT ALL ON TABLE "public"."service_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."service_cards" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."shopping_cart_items" TO "anon";
GRANT ALL ON TABLE "public"."shopping_cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."shopping_cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."trigger_debug_log" TO "anon";
GRANT ALL ON TABLE "public"."trigger_debug_log" TO "authenticated";
GRANT ALL ON TABLE "public"."trigger_debug_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trigger_debug_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trigger_debug_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trigger_debug_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."user_presence" TO "anon";
GRANT ALL ON TABLE "public"."user_presence" TO "authenticated";
GRANT ALL ON TABLE "public"."user_presence" TO "service_role";



GRANT ALL ON TABLE "public"."user_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_stats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_stats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_stats_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
