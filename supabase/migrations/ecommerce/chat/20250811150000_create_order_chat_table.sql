-- Create order_chat table for storing chat messages between users and admins
-- Related to order items

CREATE TABLE IF NOT EXISTS order_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    order_item_id UUID NOT NULL,
    entry_id UUID,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_order_chat_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_chat_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_chat_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_chat_order_id ON order_chat(order_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_order_item_id ON order_chat(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_sender_id ON order_chat(sender_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_created_at ON order_chat(created_at);
CREATE INDEX IF NOT EXISTS idx_order_chat_is_read ON order_chat(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE order_chat ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own chat messages
CREATE POLICY "Users can read their own chat messages" ON order_chat
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_chat.order_id 
            AND o.user_id = auth.uid()
        )
    );

-- Create policy for users to insert their own chat messages
CREATE POLICY "Users can insert their own chat messages" ON order_chat
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() 
        AND sender_type = 'user'
        AND EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_chat.order_id 
            AND o.user_id = auth.uid()
        )
    );

-- Create policy for admins to read all chat messages
CREATE POLICY "Admins can read all chat messages" ON order_chat
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins a
            JOIN roles r ON a.role_id = r.id
            WHERE a.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Create policy for admins to insert chat messages
CREATE POLICY "Admins can insert chat messages" ON order_chat
    FOR INSERT WITH CHECK (
        sender_type = 'admin'
        AND EXISTS (
            SELECT 1 FROM admins a
            JOIN roles r ON a.role_id = r.id
            WHERE a.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Create policy for admins to update chat messages (mark as read)
CREATE POLICY "Admins can update chat messages" ON order_chat
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admins a
            JOIN roles r ON a.role_id = r.id
            WHERE a.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_order_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_order_chat_updated_at_trigger
    BEFORE UPDATE ON order_chat
    FOR EACH ROW
    EXECUTE FUNCTION update_order_chat_updated_at();

-- Add comment to table
COMMENT ON TABLE order_chat IS 'Stores chat messages between users and admins for specific order items';
