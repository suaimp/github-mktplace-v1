-- Política temporária mais permissiva para resolver o problema do chat
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;

CREATE POLICY "Users can insert their own chat messages" ON order_chat
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
  AND sender_id = auth.uid()
  AND
  (
    -- Qualquer usuário autenticado pode enviar como 'user'
    sender_type = 'user'
    OR
    -- Admins podem enviar como 'admin'
    (sender_type = 'admin' AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  )
);

SELECT 'Temporary permissive policy applied' as status;
