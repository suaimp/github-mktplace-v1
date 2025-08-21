-- ==========================================
-- MIGRATION: Reestruturação da tabela notifications
-- Data: 2025-08-21
-- Descrição: Renomear user_id para sender_id e adicionar customer_id
-- ==========================================

-- STEP 1: Verificar estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- STEP 2: Adicionar coluna customer_id (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN customer_id UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ Coluna customer_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna customer_id já existe';
    END IF;
END $$;

-- STEP 3: Renomear user_id para sender_id (se ainda não foi renomeado)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE notifications 
        RENAME COLUMN user_id TO sender_id;
        RAISE NOTICE '✅ Coluna user_id renomeada para sender_id';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna user_id não existe ou já foi renomeada';
    END IF;
END $$;

-- STEP 4: Atualizar comentários das colunas
COMMENT ON COLUMN notifications.sender_id IS 'ID do usuário que enviou a mensagem (quem criou a notificação)';
COMMENT ON COLUMN notifications.customer_id IS 'ID do cliente/comprador do pedido (orders.user_id)';

-- STEP 5: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_notifications_customer_type_created 
ON notifications(customer_id, type, created_at DESC);

-- STEP 6: Remover policies antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar suas notificações" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can read notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can delete notifications" ON notifications;

-- STEP 7: Criar novas policies com estrutura correta

-- Policy para leitura (SELECT)
CREATE POLICY "notifications_read_policy" 
ON notifications FOR SELECT 
TO authenticated 
USING (
  -- Usuário pode ver notificações onde ele é o customer (destinatário)
  customer_id = auth.uid() OR
  -- Admins podem ver todas as notificações
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

-- Policy para criação (INSERT)
CREATE POLICY "notifications_create_policy" 
ON notifications FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Qualquer usuário autenticado pode criar notificações
  auth.uid() IS NOT NULL
);

-- Policy para atualização (UPDATE)
CREATE POLICY "notifications_update_policy" 
ON notifications FOR UPDATE 
TO authenticated 
USING (
  -- Usuário pode atualizar notificações onde ele é o customer
  customer_id = auth.uid() OR
  -- Admins podem atualizar todas as notificações
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

-- Policy para exclusão (DELETE)
CREATE POLICY "notifications_delete_policy" 
ON notifications FOR DELETE 
TO authenticated 
USING (
  -- Usuário pode deletar notificações onde ele é o customer
  customer_id = auth.uid() OR
  -- Admins podem deletar todas as notificações
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

-- STEP 8: Verificar estrutura final
SELECT 
    'notifications' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- STEP 9: Verificar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications'
ORDER BY indexname;

-- STEP 10: Verificar policies criadas
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- ==========================================
-- MIGRATION COMPLETED
-- Nova estrutura:
-- - sender_id: Quem enviou a mensagem
-- - customer_id: Cliente do pedido (destinatário)
-- - Políticas RLS atualizadas
-- - Índices de performance criados
-- ==========================================
