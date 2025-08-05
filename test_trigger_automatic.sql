-- Script para testar o trigger automático

-- 1. Primeiro, vamos aplicar a migração com o trigger
-- Execute o arquivo: supabase/migrations/promotion_sites/20250804_update_populate_promotion_sites.sql

-- 2. Verificar se os triggers foram criados
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'form_entry_values'
ORDER BY trigger_name;

-- 3. Testar o trigger com uma inserção/atualização
-- Vamos fazer um UPDATE em um registro existente para disparar o trigger
UPDATE form_entry_values 
SET updated_at = NOW() 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075' 
AND value IS NOT NULL
LIMIT 1;

-- 4. Verificar se o trigger processou automaticamente
SELECT * FROM promotion_sites 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075';

-- 5. Verificar quantos registros existem agora
SELECT COUNT(*) as total_promotion_sites FROM promotion_sites;

-- 6. Para processar todos os dados existentes uma única vez (usar a função manual)
-- SELECT process_all_promotion_data();

-- 7. Verificar se há logs do trigger (se RAISE NOTICE estiver habilitado)
-- Os logs aparecerão no console do Supabase
