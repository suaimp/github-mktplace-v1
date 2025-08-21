-- Migration para reestruturar a tabela notifications
-- Renomear user_id para sender_id e adicionar customer_id

-- Adicionar nova coluna customer_id
ALTER TABLE notifications 
ADD COLUMN customer_id UUID REFERENCES auth.users(id);

-- Renomear user_id para sender_id
ALTER TABLE notifications 
RENAME COLUMN user_id TO sender_id;

-- Atualizar comentários das colunas
COMMENT ON COLUMN notifications.sender_id IS 'ID do usuário que enviou a mensagem (quem criou a notificação)';
COMMENT ON COLUMN notifications.customer_id IS 'ID do cliente/comprador do pedido (orders.user_id)';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);

-- Atualizar as RLS policies para usar as novas colunas
DROP POLICY IF EXISTS "Usuários autenticados podem ver suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar suas notificações" ON notifications;

-- Criar novas policies com a estrutura correta
CREATE POLICY "Authenticated users can read notifications" 
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

CREATE POLICY "Authenticated users can create notifications" 
ON notifications FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Qualquer usuário autenticado pode criar notificações
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update notifications" 
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

CREATE POLICY "Authenticated users can delete notifications" 
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
