-- Função para analisar os dados reais da form_entry_values
CREATE OR REPLACE FUNCTION analyze_form_entry_data()
RETURNS TABLE(
    entry_id_val UUID,
    has_price_json BOOLEAN,
    has_url_in_value BOOLEAN,
    value_content TEXT,
    value_json_content TEXT,
    extracted_price TEXT,
    extracted_promotional_price TEXT,
    extracted_url TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- Função para testar com dados reais que correspondem à estrutura encontrada
CREATE OR REPLACE FUNCTION test_real_data_trigger_fixed()
RETURNS TABLE(step TEXT, result TEXT) AS $$
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
$$ LANGUAGE plpgsql;

-- Para executar as análises:
-- SELECT * FROM analyze_form_entry_data();
-- SELECT * FROM test_real_data_trigger();

-- Para executar o teste e ver resultados detalhados:
-- SELECT * FROM test_promotion_sites_trigger();

-- Função adicional para capturar logs em uma tabela
CREATE OR REPLACE FUNCTION test_with_logs()
RETURNS TABLE(message TEXT) AS $$
BEGIN
    -- Esta função vai mostrar as mensagens NOTICE como resultado
    SET client_min_messages TO NOTICE;
    
    -- Executar um update que deveria disparar o trigger
    UPDATE form_entry_values 
    SET value_json = '{"price": "200.00", "promotional-price": "150.00", "url": "https://example.com"}'::jsonb
    WHERE id = (SELECT id FROM form_entry_values LIMIT 1);
    
    RETURN QUERY SELECT 'Update executado - verifique os logs acima'::TEXT;
END;
$$ LANGUAGE plpgsql;
