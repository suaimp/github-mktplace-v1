-- Migration para adicionar coluna order_id na tabela notifications
-- Data: 2025-08-22
-- Descrição: Adicionar referência ao pedido nas notificações de chat

BEGIN;

-- Verificar se a coluna order_id já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'order_id'
    ) THEN
        -- Adicionar coluna order_id
        ALTER TABLE notifications 
        ADD COLUMN order_id UUID;
        
        RAISE NOTICE '✅ Coluna order_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna order_id já existe';
    END IF;
END $$;

-- Adicionar comentário na coluna
COMMENT ON COLUMN notifications.order_id IS 'ID do pedido relacionado à notificação (opcional, usado para redirecionamento)';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

-- Adicionar foreign key para orders (opcional - garante integridade referencial)
-- Esta constraint falhará se não existe a tabela orders, mas é seguro
DO $$
BEGIN
    BEGIN
        ALTER TABLE notifications 
        ADD CONSTRAINT fk_notifications_order_id 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Foreign key constraint adicionada';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'ℹ️ Tabela orders não encontrada, foreign key não adicionada';
    END;
END $$;

COMMIT;
