/*
  # Create Contracts Table

  1. New Table
    - `contracts`
      - Stores contract content and metadata
      - Associates contracts with admins only
      - Supports different contract types (terms, individual, corporate)

  2. Security
    - Enable RLS
    - Add policies for access control
    - Only admins can manage contracts
    - Platform users have no access to contracts

  3. Relationships
    - References admins for admin users only
    - Cascading deletes when admin is removed
*/

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  type_of_contract text NOT NULL CHECK (type_of_contract IN ('termos_condicoes', 'contrato_pf', 'contrato_cnpj')),
  contract_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_admin_id ON contracts(admin_id);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type_of_contract);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for contracts

-- Only admins can read contracts
CREATE POLICY "Only admins can read contracts" 
  ON contracts 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Only admins can insert contracts  
CREATE POLICY "Only admins can insert contracts" 
  ON contracts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Only admins can update contracts
CREATE POLICY "Only admins can update contracts" 
  ON contracts 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Only admins can delete contracts
CREATE POLICY "Only admins can delete contracts" 
  ON contracts 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON contracts TO authenticated;

-- Create unique constraints for contract types per admin
-- Each admin can have only one contract of each type
CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_unique_admin_type 
  ON contracts(admin_id, type_of_contract);
