-- Script de Setup Completo - Execute na ordem!

-- ==================================================
-- PASSO 1: PRIMEIRO EXECUTE A MIGRAÇÃO PRINCIPAL
-- ==================================================
-- Execute primeiro TODA a migração: 
-- supabase/migrations/promotion_sites/20250804_update_populate_promotion_sites.sql

-- ==================================================
-- PASSO 2: VERIFICAR SE OS TRIGGERS FORAM CRIADOS
-- ==================================================
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'form_entry_values'
ORDER BY trigger_name;

-- ==================================================
-- PASSO 3: CRIAR TABELA DE LOG PARA DEBUG
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
-- PASSO 4: TESTE SIMPLES DO TRIGGER
-- ==================================================
-- Fazer um update simples para disparar o trigger
UPDATE form_entry_values 
SET updated_at = NOW() 
WHERE entry_id = '1b6d327c-7df7-4578-9e50-4ab89d88b075';

-- ==================================================
-- PASSO 5: VER SE O TRIGGER EXECUTOU
-- ==================================================
-- Ver logs dos últimos minutos
SELECT 
    to_char(created_at, 'HH24:MI:SS') as hora,
    action_type,
    message,
    entry_id
FROM trigger_debug_log 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- Se não há logs, o trigger não está funcionando
-- Se há logs, mostra o que aconteceu
