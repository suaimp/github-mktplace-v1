/*
  # Create Contracts Table
  
  1. New Tables
    - `contracts`
      - `id` (uuid, primary key)
      - `title` (text, contract title)
      - `content` (text, contract content - can include HTML)
      - `type` (text, contract type: terms_of_service, privacy_policy, user_agreement, vendor_agreement, refund_policy)
      - `is_active` (boolean, only one contract per type can be active)
      - `version` (text, contract version)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `contracts` table
    - Add policies for authenticated users to read/manage contracts
*/

-- Create the contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('terms_of_service', 'privacy_policy', 'user_agreement', 'vendor_agreement', 'refund_policy')),
  is_active boolean NOT NULL DEFAULT false,
  version text NOT NULL DEFAULT '1.0.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contracts_type_idx ON contracts(type);
CREATE INDEX IF NOT EXISTS contracts_is_active_idx ON contracts(is_active);
CREATE INDEX IF NOT EXISTS contracts_created_by_idx ON contracts(created_by);

-- Create unique constraint to ensure only one active contract per type
CREATE UNIQUE INDEX IF NOT EXISTS contracts_type_active_unique 
ON contracts(type) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Allow public read access to active contracts (for displaying terms, privacy policy, etc.)
CREATE POLICY "Public can read active contracts" ON contracts
  FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users to read all contracts
CREATE POLICY "Authenticated users can read all contracts" ON contracts
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated users to create contracts
CREATE POLICY "Authenticated users can create contracts" ON contracts
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update contracts they created
CREATE POLICY "Users can update their own contracts" ON contracts
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to delete contracts they created
CREATE POLICY "Users can delete their own contracts" ON contracts
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- Create function to ensure only one active contract per type
CREATE OR REPLACE FUNCTION ensure_single_active_contract()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated contract is being set to active
  IF NEW.is_active = true THEN
    -- Deactivate all other contracts of the same type
    UPDATE contracts 
    SET is_active = false 
    WHERE type = NEW.type 
      AND id != NEW.id 
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain single active contract per type
CREATE TRIGGER ensure_single_active_contract_trigger
  BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_contract();
