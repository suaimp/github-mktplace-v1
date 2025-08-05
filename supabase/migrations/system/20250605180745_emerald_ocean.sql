/*
  # Fix Order Items Policy

  1. Changes
    - Adds a check to see if the policy already exists before creating it
    - Ensures the policy is only created if it doesn't already exist
    - Prevents the "policy already exists" error

  2. Security
    - Maintains the same security rules as the original policy
    - Users can only insert order items for orders they own
*/

-- Check if the policy already exists and create it only if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' 
    AND policyname = 'Users can insert their own order items'
  ) THEN
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
  END IF;
END
$$;