-- Sistema de participantes do chat - permite múltiplos usuários por conversa
-- Versão mais controlada com tabela de participantes

BEGIN;

-- Criar tabela de participantes do chat (se não existir)
CREATE TABLE IF NOT EXISTS order_chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'participant', 'admin', 'support')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_item_id, user_id)
);

-- Enable RLS na tabela de participantes
ALTER TABLE order_chat_participants ENABLE ROW LEVEL SECURITY;

-- Política para participantes
CREATE POLICY "Users can read their participation" ON order_chat_participants
FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Nova política de INSERT para order_chat baseada em participantes
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;

CREATE POLICY "Users can insert their own chat messages" ON order_chat
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
  AND sender_id = auth.uid()
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
      -- Para admins
      sender_type = 'admin'
      AND EXISTS (
        SELECT 1 FROM admins a
        WHERE a.id = auth.uid()
      )
    )
  )
);

-- Função para adicionar participantes automaticamente
CREATE OR REPLACE FUNCTION auto_add_chat_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Adicionar o dono do pedido como participante se não existir
  INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
  SELECT NEW.order_id, NEW.order_item_id, o.user_id, 'owner'
  FROM orders o
  WHERE o.id = NEW.order_id
  ON CONFLICT (order_item_id, user_id) DO NOTHING;
  
  -- Adicionar o remetente como participante se for usuário e não existir
  IF NEW.sender_type = 'user' THEN
    INSERT INTO order_chat_participants (order_id, order_item_id, user_id, role)
    VALUES (NEW.order_id, NEW.order_item_id, NEW.sender_id, 'participant')
    ON CONFLICT (order_item_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para adicionar participantes automaticamente
DROP TRIGGER IF EXISTS auto_add_chat_participants_trigger ON order_chat;
CREATE TRIGGER auto_add_chat_participants_trigger
  BEFORE INSERT ON order_chat
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_chat_participants();

COMMIT;
