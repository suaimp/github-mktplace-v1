-- Migration: Add Pagar.me settings table
-- Created: 2025-07-14

-- Create pagarme_settings table
CREATE TABLE IF NOT EXISTS pagarme_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pagarme_webhook_secret TEXT,
  pagarme_test_mode BOOLEAN DEFAULT true,
  currency TEXT DEFAULT 'BRL',
  payment_methods TEXT[] DEFAULT ARRAY['credit_card'],
  antifraude_enabled BOOLEAN DEFAULT true,
  antifraude_min_amount DECIMAL(10,2) DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE pagarme_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow authenticated users to manage pagarme settings" ON pagarme_settings;

-- Create policy to allow authenticated users to read/write settings
CREATE POLICY "Allow authenticated users to manage pagarme settings" ON pagarme_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_pagarme_settings_updated_at ON pagarme_settings;

CREATE TRIGGER update_pagarme_settings_updated_at 
  BEFORE UPDATE ON pagarme_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO pagarme_settings (
  pagarme_test_mode,
  currency,
  payment_methods,
  antifraude_enabled,
  antifraude_min_amount
) VALUES (
  true,
  'BRL',
  ARRAY['credit_card'],
  true,
  10.00
) ON CONFLICT DO NOTHING;
