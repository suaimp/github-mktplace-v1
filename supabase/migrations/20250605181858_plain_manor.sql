/*
  # Fix policy creation for order_items

  1. Changes
    - Add a DO block to check if the policy already exists before creating it
    - Use conditional logic to only create the policy if it doesn't exist
    - Maintain the same policy definition and functionality
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