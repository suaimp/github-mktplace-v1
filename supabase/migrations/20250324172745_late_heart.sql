/*
  # Fix Role Names Case
  
  1. Changes
    - Update role names to lowercase
    - Ensure consistent naming between auth and roles
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update role names to lowercase
UPDATE roles
SET name = LOWER(name)
WHERE name != LOWER(name);

-- Ensure advertiser and publisher roles exist
INSERT INTO roles (name, description)
VALUES 
  ('advertiser', 'Anunciante com acesso a ferramentas de anúncios'),
  ('publisher', 'Publisher com acesso a ferramentas de publicação')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;