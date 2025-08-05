-- Migration: Add public read policy for terms and conditions
-- This allows unauthenticated users to read terms and conditions

-- Add public read policy for terms and conditions
CREATE POLICY "Public can read terms and conditions" 
  ON contracts 
  FOR SELECT 
  TO anon  -- This allows anonymous (unauthenticated) users
  USING (type_of_contract = 'termos_condicoes');

-- Also allow authenticated users to read terms (in addition to admin policy)
CREATE POLICY "Authenticated users can read terms and conditions" 
  ON contracts 
  FOR SELECT 
  TO authenticated
  USING (type_of_contract = 'termos_condicoes');
