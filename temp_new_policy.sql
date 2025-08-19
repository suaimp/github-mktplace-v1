-- Remover política problemática e criar uma nova com nome diferente
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;
DROP POLICY IF EXISTS "allow_authenticated_chat_insert" ON order_chat;

CREATE POLICY "allow_authenticated_chat_insert" ON order_chat
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
  AND sender_id = auth.uid()
  AND
  (
    sender_type = 'user'
    OR
    (sender_type = 'admin' AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  )
);

SELECT 'New policy created with different name' as status;
