-- Fix RLS policies for order_chat table
-- This migration fixes the admin authentication issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own chat messages" ON order_chat;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON order_chat;
DROP POLICY IF EXISTS "Admins can read all chat messages" ON order_chat;
DROP POLICY IF EXISTS "Admins can insert chat messages" ON order_chat;
DROP POLICY IF EXISTS "Admins can update chat messages" ON order_chat;

-- Create policy for users to read their own chat messages
CREATE POLICY "Users can read their own chat messages" ON order_chat
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            -- User can read if they own the order
            EXISTS (
                SELECT 1 FROM orders o 
                WHERE o.id = order_chat.order_id 
                AND o.user_id = auth.uid()
            )
            OR
            -- Admin can read all messages
            EXISTS (
                SELECT 1 FROM admins a
                JOIN roles r ON a.role_id = r.id
                WHERE a.id = auth.uid() AND r.name = 'admin'
            )
        )
    );

-- Create policy for users to insert their own chat messages
CREATE POLICY "Users can insert their own chat messages" ON order_chat
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        sender_id = auth.uid() AND
        (
            -- Regular user sending message
            (
                sender_type = 'user' AND
                EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.id = order_chat.order_id 
                    AND o.user_id = auth.uid()
                )
            )
            OR
            -- Admin sending message
            (
                sender_type = 'admin' AND
                EXISTS (
                    SELECT 1 FROM admins a
                    JOIN roles r ON a.role_id = r.id
                    WHERE a.id = auth.uid() AND r.name = 'admin'
                )
            )
        )
    );

-- Create policy for updating chat messages (mark as read)
CREATE POLICY "Users can update chat messages" ON order_chat
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            -- User can update if they own the order
            EXISTS (
                SELECT 1 FROM orders o 
                WHERE o.id = order_chat.order_id 
                AND o.user_id = auth.uid()
            )
            OR
            -- Admin can update all messages
            EXISTS (
                SELECT 1 FROM admins a
                JOIN roles r ON a.role_id = r.id
                WHERE a.id = auth.uid() AND r.name = 'admin'
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- User can update if they own the order
            EXISTS (
                SELECT 1 FROM orders o 
                WHERE o.id = order_chat.order_id 
                AND o.user_id = auth.uid()
            )
            OR
            -- Admin can update all messages
            EXISTS (
                SELECT 1 FROM admins a
                JOIN roles r ON a.role_id = r.id
                WHERE a.id = auth.uid() AND r.name = 'admin'
            )
        )
    );

-- Create policy for deleting chat messages (admin only)
CREATE POLICY "Admins can delete chat messages" ON order_chat
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM admins a
            JOIN roles r ON a.role_id = r.id
            WHERE a.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Add comment
COMMENT ON TABLE order_chat IS 'Stores chat messages between users and admins for specific order items with proper RLS policies';
