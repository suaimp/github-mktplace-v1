-- ==========================================
-- MIGRATION 1: Create notification_types table
-- Original: 20250821154721_create_notifications_table.sql
-- ==========================================

-- Verificar se já foi aplicada
DO $$
BEGIN
    -- Verificar se a migration já foi aplicada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications'
    ) THEN
        RAISE NOTICE '❌ Tabela notifications não existe. Execute primeiro a migration de criação da tabela.';
    ELSE
        RAISE NOTICE '✅ Tabela notifications existe.';
    END IF;
END $$;
