/*
  # Payment System Database Structure
  
  1. New Tables
    - `payment_settings` - Stores Stripe API keys and configuration
    - `payments` - Records payment transactions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    
  3. Triggers
    - Add updated_at triggers for timestamp management
*/

-- Create payment_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_public_key text,
  stripe_secret_key text,
  stripe_webhook_secret text,
  stripe_enabled boolean DEFAULT false,
  stripe_test_mode boolean DEFAULT true,
  currency text DEFAULT 'BRL',
  payment_methods text[] DEFAULT ARRAY['card'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage payment settings (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_settings' AND policyname = 'Admins can manage payment settings'
  ) THEN
    CREATE POLICY "Admins can manage payment settings"
      ON payment_settings
      FOR ALL
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins
        WHERE admins.id = auth.uid()
      ));
  END IF;
END
$$;

-- Create policy for authenticated users to read payment settings (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_settings' AND policyname = 'Authenticated users can read payment settings'
  ) THEN
    CREATE POLICY "Authenticated users can read payment settings"
      ON payment_settings
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid,
  payment_method text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payments (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'Users can view their own payments'
  ) THEN
    CREATE POLICY "Users can view their own payments"
      ON payments
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create policy for admins to manage all payments (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'Admins can manage all payments'
  ) THEN
    CREATE POLICY "Admins can manage all payments"
      ON payments
      FOR ALL
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins
        WHERE admins.id = auth.uid()
      ));
  END IF;
END
$$;

-- Create function to update the updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp for payment_settings (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payment_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION
  WHEN others THEN
    -- If trigger already exists, do nothing
END
$$;

-- Create trigger to update the updated_at timestamp for payments (with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION
  WHEN others THEN
    -- If trigger already exists, do nothing
END
$$;