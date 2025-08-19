-- Fix RLS policy for order_chat to allow admins to send messages without being participants

BEGIN;

-- Drop e recriar a política de INSERT mais permissiva para admins
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
    (
      -- Para mensagens de usuário: verificar se é participante ou dono do pedido
      sender_type = 'user'
      AND (
        -- É dono do pedido
        EXISTS (
          SELECT 1 FROM orders o 
          WHERE o.id = order_chat.order_id 
          AND o.user_id = auth.uid()
        )
        OR
        -- É participante autorizado
        EXISTS (
          SELECT 1 FROM order_chat_participants p
          WHERE p.order_item_id = order_chat.order_item_id
          AND p.user_id = auth.uid()
        )
      )
    )
    OR
    (
      -- Para admins: sempre permitir (não precisa ser participante)
      sender_type = 'admin'
      AND EXISTS (
        SELECT 1 FROM admins a
        WHERE a.id = auth.uid()
      )
    )
  )
);

-- Também vamos criar uma função melhorada para adicionar participantes
-- que inclui admins automaticamente quando enviam mensagens
CREATE OR REPLACE FUNCTION auto_add_chat_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Adicionar o dono do pedido como participante se não existir
  INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
  SELECT NEW.order_id, NEW.order_item_id, o.user_id, 'owner'
  FROM orders o
  WHERE o.id = NEW.order_id
  ON CONFLICT (order_item_id, user_id) DO NOTHING;
  
  -- Adicionar o remetente como participante baseado no tipo
  IF NEW.sender_type = 'user' THEN
    INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
    VALUES (NEW.order_id, NEW.order_item_id, NEW.sender_id, 'participant')
    ON CONFLICT (order_item_id, user_id) DO NOTHING;
  ELSIF NEW.sender_type = 'admin' THEN
    -- Admins são adicionados como 'admin' role
    INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
    VALUES (NEW.order_id, NEW.order_item_id, NEW.sender_id, 'admin')
    ON CONFLICT (order_item_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;

SELECT 'RLS policy updated to allow admins to send messages' as status;
