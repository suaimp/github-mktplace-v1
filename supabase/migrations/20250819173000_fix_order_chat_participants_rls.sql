-- Fix RLS policies for order_chat_participants table

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read their participation" ON order_chat_participants;

-- Create comprehensive RLS policies for order_chat_participants

-- SELECT policy: Users can read their own participation or admins can read all
CREATE POLICY "Users can read their participation" ON order_chat_participants
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- INSERT policy: Users can insert themselves as participants or admins can insert anyone
CREATE POLICY "Users can insert participants" ON order_chat_participants
  FOR INSERT
  WITH CHECK (
    -- User can insert themselves as participant for their own orders
    (auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()
    ))
    OR
    -- Admins can insert any participant
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
    OR
    -- System can insert participants (for automatic participant creation)
    auth.uid() IS NULL
  );

-- UPDATE policy: Users can update their own participation, admins can update all
CREATE POLICY "Users can update their participation" ON order_chat_participants
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- DELETE policy: Users can delete their own participation, admins can delete all
CREATE POLICY "Users can delete their participation" ON order_chat_participants
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Comentário para verificação
SELECT 'RLS policies for order_chat_participants updated successfully!' as resultado;
