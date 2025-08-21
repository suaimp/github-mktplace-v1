-- ==========================================
-- MIGRATION: Adicionar coluna order_id na tabela notifications
-- Data: 2025-08-21
-- Descrição: Adicionar referência ao pedido nas notificações
-- ==========================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase Studio
-- URL: http://localhost:54323 (desenvolvimento) ou Dashboard online (produção)

BEGIN;

-- STEP 1: Verificar estrutura atual
SELECT 
    '=== VERIFICANDO ESTRUTURA ATUAL DA TABELA NOTIFICATIONS ===' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- STEP 2: Adicionar coluna order_id (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN order_id UUID;
        RAISE NOTICE '✅ Coluna order_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna order_id já existe';
    END IF;
END $$;

-- STEP 3: Adicionar comentário na coluna
COMMENT ON COLUMN notifications.order_id IS 'ID do pedido relacionado à notificação (opcional, usado para redirecionamento)';

-- STEP 4: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

-- STEP 5: Verificar se há foreign key para orders (opcional - adicionar se necessário)
-- Descomente a linha abaixo se quiser garantir integridade referencial
-- ALTER TABLE notifications ADD CONSTRAINT fk_notifications_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- STEP 6: Verificar estrutura final
SELECT 
    '=== ESTRUTURA FINAL DA TABELA NOTIFICATIONS ===' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- STEP 7: Verificar índices criados
SELECT 
    '=== ÍNDICES DA TABELA NOTIFICATIONS ===' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications'
AND indexname LIKE '%order_id%'
ORDER BY indexname;

COMMIT;

-- ==========================================
-- MIGRATION COMPLETED ✅
-- Coluna order_id adicionada à tabela notifications
-- Índice de performance criado
-- Comentário explicativo adicionado
-- ==========================================

SELECT '🎉 MIGRATION CONCLUÍDA - COLUNA ORDER_ID ADICIONADA! 🎉' as status;
