-- Add missing DELETE policies for orders and order_items
-- This restores the DELETE functionality that was working before

-- Add DELETE policy for orders table (users can delete their own orders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can delete their own orders'
  ) THEN
    CREATE POLICY "Users can delete their own orders"
      ON orders
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Add DELETE policy for orders table (admins can delete any order)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Admins can delete all orders'
  ) THEN
    CREATE POLICY "Admins can delete all orders"
      ON orders
      FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
      ));
  END IF;
END
$$;

-- Add DELETE policy for order_items table (users can delete items from their orders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Users can delete their own order items'
  ) THEN
    CREATE POLICY "Users can delete their own order items"
      ON order_items
      FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
      ));
  END IF;
END
$$;

-- Add DELETE policy for order_items table (admins can delete any order items)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Admins can delete all order items'
  ) THEN
    CREATE POLICY "Admins can delete all order items"
      ON order_items
      FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
      ));
  END IF;
END
$$;
