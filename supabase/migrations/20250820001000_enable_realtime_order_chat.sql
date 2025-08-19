-- Enable realtime for order_chat table
-- This allows the table to publish changes to realtime subscribers

-- Add the order_chat table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE order_chat;

-- Set replica identity to FULL to include all column values in the realtime payload
-- This is needed for the subscription filters to work properly
ALTER TABLE order_chat REPLICA IDENTITY FULL;

-- Optional: Also enable for order_chat_participants table for future use
ALTER PUBLICATION supabase_realtime ADD TABLE order_chat_participants;
ALTER TABLE order_chat_participants REPLICA IDENTITY FULL;

-- Optional: Also enable for user_presence table for future use
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER TABLE user_presence REPLICA IDENTITY FULL;

SELECT 'Realtime enabled for order_chat tables successfully!' as resultado;
