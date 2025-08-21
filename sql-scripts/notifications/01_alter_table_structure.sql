-- Criação e alteração da estrutura da tabela notifications
-- Parte 1: Modificações estruturais

-- Verificar se a coluna customer_id já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'customer_id'
    ) THEN
        -- Adicionar nova coluna customer_id
        ALTER TABLE notifications 
        ADD COLUMN customer_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Coluna customer_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna customer_id já existe';
    END IF;
END $$;

-- Verificar se a coluna user_id ainda existe antes de renomear
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
        -- Renomear user_id para sender_id
        ALTER TABLE notifications 
        RENAME COLUMN user_id TO sender_id;
        RAISE NOTICE 'Coluna user_id renomeada para sender_id';
    ELSE
        RAISE NOTICE 'Coluna user_id não existe ou já foi renomeada';
    END IF;
END $$;

-- Atualizar comentários das colunas
COMMENT ON COLUMN notifications.sender_id IS 'ID do usuário que enviou a mensagem (quem criou a notificação)';
COMMENT ON COLUMN notifications.customer_id IS 'ID do cliente/comprador do pedido (orders.user_id)';
