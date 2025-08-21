-- ==========================================
-- MIGRATION 2: Fix notifications RLS policy
-- Original: 20250821160000_fix_notifications_rls_policy.sql
-- ==========================================

-- Verificar se a migration anterior foi aplicada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications'
    ) THEN
        RAISE EXCEPTION 'Tabela notifications não existe. Execute primeiro as migrations anteriores.';
    END IF;
    
    RAISE NOTICE '✅ Verificação das dependências passou.';
END $$;
