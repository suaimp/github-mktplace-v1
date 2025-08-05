-- Script de Monitoramento em Tempo Real

-- ==================================================
-- MONITORAMENTO SIMPLES EM TEMPO REAL
-- ==================================================

-- 1. Ver quantos registros existem ANTES do teste
SELECT 'ANTES DO TESTE' as momento, COUNT(*) as total FROM promotion_sites;

-- 2. Executar um UPDATE para disparar o trigger
UPDATE form_entry_values 
SET value = value || '' -- Força um update sem alterar o valor
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075';

-- 3. Ver quantos registros existem DEPOIS do teste
SELECT 'DEPOIS DO TESTE' as momento, COUNT(*) as total FROM promotion_sites;

-- 4. Ver logs em tempo real (execute várias vezes)
SELECT 
    to_char(created_at, 'HH24:MI:SS') as hora,
    action_type,
    message,
    entry_id
FROM trigger_debug_log 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- 5. Verificar se o registro específico foi processado
SELECT 
    'REGISTRO PROCESSADO' as status,
    entry_id,
    percent,
    price,
    promotional_price,
    updated_at
FROM promotion_sites 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075';

-- ==================================================
-- PARA TESTAR COM DADOS REAIS DO FRONTEND
-- ==================================================

-- Se você quiser testar com dados reais do EntriesEditModal:
-- 1. Vá ao frontend
-- 2. Abra o EntriesEditModal
-- 3. Edite qualquer campo de preço
-- 4. Salve
-- 5. Execute esta query para ver os logs:

SELECT 
    to_char(created_at, 'HH24:MI:SS.MS') as timestamp_preciso,
    action_type,
    message,
    data
FROM trigger_debug_log 
WHERE created_at > NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC;
