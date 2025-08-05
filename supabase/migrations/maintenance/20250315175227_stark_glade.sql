/*
  # Create Company Data Table

  1. New Tables
    - `company_data`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references admins.id)
      - `legal_status` (text) - 'business' or 'individual'
      - `country` (text)
      - `company_name` (text)
      - `city` (text)
      - `zip_code` (text)
      - `address` (text)
      - `document_number` (text) - CNPJ or CPF
      - `withdrawal_method` (text)
      - `bank_account` (text)
      - `paypal_id` (text)
      - `other_payment_info` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add indexes for performance
*/

-- Create company_data table
CREATE TABLE IF NOT EXISTS company_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id) ON DELETE CASCADE,
  legal_status text NOT NULL CHECK (legal_status IN ('business', 'individual')),
  country text NOT NULL,
  company_name text,
  city text NOT NULL,
  zip_code text NOT NULL,
  address text NOT NULL,
  document_number text NOT NULL,
  withdrawal_method text CHECK (withdrawal_method IN ('bank', 'paypal', 'other')),
  bank_account text,
  paypal_id text,
  other_payment_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT company_data_admin_unique UNIQUE (admin_id)
);

-- Enable RLS
ALTER TABLE company_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read their own company data" 
  ON company_data 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own company data" 
  ON company_data 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can insert their own company data" 
  ON company_data 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their own company data" 
  ON company_data 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = admin_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_data_updated_at
    BEFORE UPDATE ON company_data
    FOR EACH ROW
    EXECUTE FUNCTION update_company_data_updated_at();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_data_admin_id ON company_data(admin_id);
CREATE INDEX IF NOT EXISTS idx_company_data_legal_status ON company_data(legal_status);
CREATE INDEX IF NOT EXISTS idx_company_data_document_number ON company_data(document_number);