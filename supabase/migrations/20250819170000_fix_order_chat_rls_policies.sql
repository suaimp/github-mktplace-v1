-- Fix RLS policies for order_chat table
-- This migration addresses the 403 Forbidden error when inserting chat messages

BEGIN;

-- Drop existing INSERT policy and recreate with proper logic
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;

-- Create new INSERT policy that properly handles both user and admin messages
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
      -- For user messages: check if user owns the order
      sender_type = 'user'
      AND EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.id = order_chat.order_id 
        AND o.user_id = auth.uid()
      )
    )
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

-- Also make sure the SELECT policy is working correctly
DROP POLICY IF EXISTS "Users can read their own chat messages" ON order_chat;

CREATE POLICY "Users can read their own chat messages" ON order_chat
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
  AND
  (
    -- Users can read messages from orders they own
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_chat.order_id 
      AND o.user_id = auth.uid()
    )
    OR
    -- Admins can read all messages
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.id = auth.uid()
    )
  )
);

-- Update the UPDATE policy as well for consistency
DROP POLICY IF EXISTS "Users can update chat messages" ON order_chat;

CREATE POLICY "Users can update chat messages" ON order_chat
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL
  AND
  (
    -- Users can update messages from orders they own
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_chat.order_id 
      AND o.user_id = auth.uid()
    )
    OR
    -- Admins can update all messages
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  (
    -- Users can update messages from orders they own
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_chat.order_id 
      AND o.user_id = auth.uid()
    )
    OR
    -- Admins can update all messages
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.id = auth.uid()
    )
  )
);

COMMIT;
