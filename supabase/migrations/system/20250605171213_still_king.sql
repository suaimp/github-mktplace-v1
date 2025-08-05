/*
  # Add order items insert policy

  1. Changes
    - Add INSERT policy for order_items table to allow users to create order items for their own orders
    
  2. Security
    - Ensures users can only insert order items for orders they own
    - Maintains existing policies for other operations
*/

-- Add INSERT policy for order_items
CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );