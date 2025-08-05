/*
  # Add PIX Payment Support
  
  1. Changes
    - Add PIX key type enum
    - Add PIX key field
    - Add bank transfer type (domestic/international)
    - Add domestic bank fields
    - Add international bank fields
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add PIX key type enum
DO $$ BEGIN
  CREATE TYPE pix_key_type AS ENUM ('cpf', 'cnpj', 'phone', 'email', 'random');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to company_data table
ALTER TABLE company_data 
  ADD COLUMN IF NOT EXISTS pix_key_type pix_key_type,
  ADD COLUMN IF NOT EXISTS pix_key text,
  ADD COLUMN IF NOT EXISTS bank_transfer_type text CHECK (bank_transfer_type IN ('domestic', 'international')),
  -- Domestic bank fields
  ADD COLUMN IF NOT EXISTS bank_code text,
  ADD COLUMN IF NOT EXISTS bank_agency text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_account_type text,
  ADD COLUMN IF NOT EXISTS bank_account_holder text,
  ADD COLUMN IF NOT EXISTS bank_account_holder_document text,
  -- International bank fields
  ADD COLUMN IF NOT EXISTS bank_swift text,
  ADD COLUMN IF NOT EXISTS bank_iban text,
  ADD COLUMN IF NOT EXISTS bank_routing_number text,
  ADD COLUMN IF NOT EXISTS bank_address text,
  ADD COLUMN IF NOT EXISTS bank_country text;

-- Update withdrawal_method check constraint to include pix
ALTER TABLE company_data 
  DROP CONSTRAINT IF EXISTS company_data_withdrawal_method_check,
  ADD CONSTRAINT company_data_withdrawal_method_check 
    CHECK (withdrawal_method IN ('bank', 'paypal', 'pix', 'other'));