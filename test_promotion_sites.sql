-- Script para testar e processar dados de promoção

-- 0. Primeiro, vamos verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'form_entry_values' 
ORDER BY ordinal_position;

-- 1. Verificar todos os dados existentes para entry_id específico
SELECT 
    field_id,
    value, 
    value_json,
    CASE 
        WHEN value_json IS NOT NULL THEN 'value_json'
        WHEN value IS NOT NULL THEN 'value'
        ELSE 'neither'
    END as data_source
FROM form_entry_values 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075'
ORDER BY field_id;

-- 1.5. Vamos ver se existe uma tabela de fields para entender os field_ids
SELECT * FROM form_fields WHERE id IN (
    'bfabf6e5-4e86-4961-848c-e5619d7fb8c1',
    '8e4ede58-7a38-478b-b086-ee1890e80344', 
    '65100556-01ea-4037-863d-8bb87ada090e',
    '03343d83-78e6-4a23-9b9b-2580f5bdf12',
    'd2579cb5-d517-44bb-86f7-e34709dbf60e'
);

-- 2. Testar a função manual para entry_id específico
SELECT populate_promotion_sites_manual('1b6d327c-7df7-4578-9e50-4ab89d88b075');

-- 3. Verificar se o registro foi criado na tabela promotion_sites
SELECT * FROM promotion_sites WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075';

-- 4. AGORA VAMOS PROCESSAR TODOS OS DADOS!
SELECT process_all_promotion_data();

-- 5. Verificar quantos registros foram processados no total
SELECT COUNT(*) as total_registros FROM promotion_sites;

-- 6. Ver uma amostra dos registros criados
SELECT 
    entry_id,
    percent,
    price,
    promotional_price,
    url,
    created_at
FROM promotion_sites 
ORDER BY created_at DESC 
LIMIT 10;
