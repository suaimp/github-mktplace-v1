-- Permitir que qualquer usuário autenticado envie mensagens no chat
-- Solução para quando múltiplos usuários participam da conversa

BEGIN;

-- Drop e recriar a política de INSERT para permitir qualquer usuário autenticado
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;

CREATE POLICY "Users can insert their own chat messages" ON order_chat
FOR INSERT 
WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- sender_id must match the authenticated user
  sender_id = auth.uid()
  AND
  (
    -- For user messages: qualquer usuário autenticado pode enviar
    sender_type = 'user'
    OR
    (
      -- For admin messages: check if user is admin
      sender_type = 'admin'
      AND EXISTS (
        SELECT 1 FROM admins a
        WHERE a.id = auth.uid()
      )
    )
  )
);

-- Atualizar política de SELECT para permitir leitura mais ampla
DROP POLICY IF EXISTS "Users can read their own chat messages" ON order_chat;

CREATE POLICY "Users can read their own chat messages" ON order_chat
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND
  (
    -- Qualquer usuário autenticado pode ler mensagens (para suporte/chat público)
    true
    OR
    -- Admins podem ler todas as mensagens
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.id = auth.uid()
    )
  )
);

COMMIT;
