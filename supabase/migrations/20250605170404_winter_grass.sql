/*
  # Create orders and order_items tables
  
  1. New Tables
    - `orders` - Stores order information including payment details and billing information
    - `order_items` - Stores individual items within an order
  
  2. Security
    - Enable RLS on both tables
    - Add policies for users to view/create their own orders
    - Add policies for admins to view/update all orders
  
  3. Indexes
    - Add indexes for better query performance
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL,
  billing_name text NOT NULL,
  billing_email text NOT NULL,
  billing_address text NOT NULL,
  billing_city text NOT NULL,
  billing_state text NOT NULL,
  billing_zip_code text NOT NULL,
  billing_document_number text NOT NULL,
  payment_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES form_entries(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_url text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  niche jsonb,
  service_content jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add updated_at trigger for orders - check if it exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders with checks to avoid duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
  ) THEN
    CREATE POLICY "Users can view their own orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can create their own orders'
  ) THEN
    CREATE POLICY "Users can create their own orders"
      ON orders
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
  ) THEN
    CREATE POLICY "Admins can view all orders"
      ON orders
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Admins can update all orders'
  ) THEN
    CREATE POLICY "Admins can update all orders"
      ON orders
      FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
      ));
  END IF;
END
$$;

-- Create policies for order_items with checks to avoid duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Users can view their own order items'
  ) THEN
    CREATE POLICY "Users can view their own order items"
      ON order_items
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Admins can view all order items'
  ) THEN
    CREATE POLICY "Admins can view all order items"
      ON order_items
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins WHERE admins.id = auth.uid()
      ));
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_entry_id ON order_items(entry_id);