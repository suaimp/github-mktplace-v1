-- Fix order_chat INSERT policy
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;

CREATE POLICY "Users can insert their own chat messages" ON order_chat
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
  AND 
  sender_id = auth.uid()
  AND
  (
    (
      sender_type = 'user'
      AND (
        EXISTS (
          SELECT 1 FROM orders o 
          WHERE o.id = order_chat.order_id 
          AND o.user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM order_chat_participants p
          WHERE p.order_item_id = order_chat.order_item_id
          AND p.user_id = auth.uid()
        )
      )
    )
    OR
    (
      sender_type = 'admin'
      AND EXISTS (
        SELECT 1 FROM admins a
        WHERE a.id = auth.uid()
      )
    )
  )
);

SELECT 'Policy fixed successfully!' as status;
