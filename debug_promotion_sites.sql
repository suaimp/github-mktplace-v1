-- Script de debug para verificar o funcionamento do trigger

-- 1. Verificar se o trigger foi criado
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    t.tgenabled AS enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'form_entry_values'
  AND t.tgname LIKE '%populate%';

-- 2. Verificar se a constraint unique existe
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'promotion_sites'::regclass 
  AND conname = 'unique_entry_id';

-- 3. Verificar estrutura da form_entry_values
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'form_entry_values'
ORDER BY ordinal_position;

-- 4. Exemplo de teste manual da função
-- Substitua os valores pelos reais do seu teste
/*
-- Simular um INSERT/UPDATE que deveria disparar o trigger
INSERT INTO form_entry_values (
    entry_id, 
    field_id, 
    value_json,
    value
) VALUES (
    'sua-entry-id-aqui'::uuid,
    'sua-field-id-aqui'::uuid,
    '{"price": "100.00", "promotional_price": "80.00", "url": "https://example.com"}'::jsonb,
    'test value'
);
*/

-- 5. Verificar registros existentes na promotion_sites
SELECT COUNT(*) as total_records FROM promotion_sites;

-- 6. Verificar form_entry_values com dados de preço
SELECT 
    fev.id,
    fev.entry_id,
    fev.value_json,
    fev.value_json ? 'price' as has_price,
    fev.value_json ? 'promotional_price' as has_promotional_price
FROM form_entry_values fev
WHERE fev.value_json IS NOT NULL 
  AND (
    fev.value_json ? 'price' OR 
    fev.value_json ? 'promotional_price'
  )
LIMIT 5;

-- 7. Testar a função manualmente
-- SELECT refresh_promotion_sites();

-- 8. Ver logs de erro (se houver)
-- No PostgreSQL, os logs RAISE WARNING aparecerão nos logs do servidor
