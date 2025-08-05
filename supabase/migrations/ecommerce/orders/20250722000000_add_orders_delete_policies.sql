/*
  # Add DELETE policies for orders and order_items tables

  1. Changes
    - Add DELETE policy for orders table to allow users to delete their own orders
    - Add DELETE policy for orders table to allow admins to delete any order
    - Add DELETE policy for order_items table to allow users to delete items from their own orders
    - Add DELETE policy for order_items table to allow admins to delete any order items

  2. Security
    - Users can only delete their own orders and order items
    - Admins can delete any orders and order items
*/

-- Add DELETE policies for orders table
-- Users can delete their own orders
CREATE POLICY "Users can delete their own orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can delete any orders
CREATE POLICY "Admins can delete all orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins WHERE admins.id = auth.uid()
  ));

-- Add DELETE policies for order_items table
-- Users can delete order items from their own orders
CREATE POLICY "Users can delete their own order items"
  ON order_items
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

-- Admins can delete any order items
CREATE POLICY "Admins can delete all order items"
  ON order_items
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins WHERE admins.id = auth.uid()
  ));
