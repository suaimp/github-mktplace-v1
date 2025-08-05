-- Migration: Add support for privacy policy type and public access
-- This allows managing privacy policy as a contract type with public read access

-- Add public read policy for privacy policy
CREATE POLICY "Public can read privacy policy" 
  ON contracts 
  FOR SELECT 
  TO anon  -- This allows anonymous (unauthenticated) users
  USING (type_of_contract = 'politica_privacidade');

-- Also allow authenticated users to read privacy policy (in addition to admin policy)
CREATE POLICY "Authenticated users can read privacy policy" 
  ON contracts 
  FOR SELECT 
  TO authenticated
  USING (type_of_contract = 'politica_privacidade');
