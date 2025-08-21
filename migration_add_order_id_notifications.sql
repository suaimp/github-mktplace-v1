-- ==========================================
-- MIGRATION: Adicionar coluna order_id na tabela notifications
-- Data: 2025-08-21
-- Descrição: Adicionar order_id para redirecionamento de notificações
-- ==========================================

-- STEP 1: Verificar estrutura atual da tabela notifications
SELECT 
    '=== ESTRUTURA ATUAL DA TABELA NOTIFICATIONS ===' as info;

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

-- STEP 3: Adicionar comentário explicativo
COMMENT ON COLUMN notifications.order_id IS 'ID do pedido relacionado à notificação (para redirecionamento)';

-- STEP 4: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

-- STEP 5: Verificar estrutura final
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

-- STEP 6: Verificar índices criados
SELECT 
    '=== ÍNDICES ATUALIZADOS ===' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications'
ORDER BY indexname;

-- ==========================================
-- MIGRATION COMPLETED ✅
-- Nova coluna order_id disponível para redirecionamento
-- ==========================================

SELECT '🎉 MIGRATION order_id CONCLUÍDA COM SUCESSO! 🎉' as status;
