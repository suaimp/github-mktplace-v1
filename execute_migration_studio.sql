-- ==========================================
-- EXECUTE NOTIFICATIONS MIGRATIONS
-- Execute este arquivo no Supabase Studio
-- URL: http://localhost:54323
-- ==========================================

-- IMPORTANTE: Execute este script completo no SQL Editor do Supabase Studio
-- Acesse: http://localhost:54323 > SQL Editor > Cole este código > RUN

-- ==========================================
-- MIGRATION: Reestruturação da tabela notifications
-- Data: 2025-08-21
-- Descrição: Renomear user_id para sender_id e adicionar customer_id
-- ==========================================

-- STEP 1: Verificar estrutura atual
SELECT 
    '=== ESTRUTURA ATUAL DA TABELA NOTIFICATIONS ===' as info,
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
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE notifications RENAME COLUMN user_id TO sender_id;
    END IF;
END $$;

-- 3. Adicionar comentários
COMMENT ON COLUMN notifications.sender_id IS 'ID do usuário que enviou a mensagem';
COMMENT ON COLUMN notifications.customer_id IS 'ID do cliente/comprador do pedido';

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);

-- 5. Remover policies antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar suas notificações" ON notifications;

-- 6. Criar novas policies
CREATE POLICY "Authenticated users can read notifications" 
ON notifications FOR SELECT TO authenticated 
USING (
  customer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "Authenticated users can create notifications" 
ON notifications FOR INSERT TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update notifications" 
ON notifications FOR UPDATE TO authenticated 
USING (
  customer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "Authenticated users can delete notifications" 
ON notifications FOR DELETE TO authenticated 
USING (
  customer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;
