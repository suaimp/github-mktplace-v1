-- Migration: Update contract type constraint to include privacy policy
-- This allows the new type 'politica_privacidade' to be saved in the database

-- Drop the existing constraint
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_type_of_contract_check;

-- Add the new constraint with privacy policy support
ALTER TABLE contracts ADD CONSTRAINT contracts_type_of_contract_check 
  CHECK (type_of_contract IN ('termos_condicoes', 'contrato_pf', 'contrato_cnpj', 'politica_privacidade'));
