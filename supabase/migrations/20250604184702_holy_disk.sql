/*
  # Payment Settings Table

  1. New Tables
    - `payment_settings` - Stores Stripe API integration settings
      - `id` (uuid, primary key)
      - `stripe_public_key` (text, nullable)
      - `stripe_secret_key` (text, nullable)
      - `stripe_webhook_secret` (text, nullable)
      - `stripe_enabled` (boolean)
      - `stripe_test_mode` (boolean)
      - `currency` (text)
      - `payment_methods` (text array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `payment_settings` table
    - Add policy for authenticated users to read payment settings
    - Add policy for admins to update payment settings
*/

-- Create payment_settings table
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

-- Create policy for admins to manage payment settings
CREATE POLICY "Admins can manage payment settings"
  ON payment_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  ));

-- Create policy for authenticated users to read payment settings
CREATE POLICY "Authenticated users can read payment settings"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON payment_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();