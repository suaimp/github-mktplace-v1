/*
  # Create Coupons Table

  1. New Table
    - `coupons`
      - For managing discount coupons
      - Includes code, name, discount details, usage limits, dates
      - Supports percentage and fixed value discounts

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL CHECK (discount_value > 0),
  minimum_amount decimal(10,2),
  maximum_discount decimal(10,2),
  usage_limit integer CHECK (usage_limit > 0),
  usage_count integer NOT NULL DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date),
  CONSTRAINT valid_percentage CHECK (
    discount_type != 'percentage' OR 
    (discount_value >= 0 AND discount_value <= 100)
  )
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Admins can read coupons" 
  ON coupons 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert coupons" 
  ON coupons 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update coupons" 
  ON coupons 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete coupons" 
  ON coupons 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at);

-- Insert default permissions for coupons management
INSERT INTO permissions (code, name, description, category) VALUES
  ('coupons.view', 'Visualizar cupons', 'Permite visualizar cupons de desconto', 'commerce'),
  ('coupons.create', 'Criar cupons', 'Permite criar novos cupons de desconto', 'commerce'),
  ('coupons.edit', 'Editar cupons', 'Permite editar cupons existentes', 'commerce'),
  ('coupons.delete', 'Excluir cupons', 'Permite excluir cupons', 'commerce'),
  ('coupons.activate', 'Ativar/Desativar cupons', 'Permite ativar ou desativar cupons', 'commerce')
ON CONFLICT (code) DO NOTHING;

-- Assign new permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.code IN (
    'coupons.view', 'coupons.create', 'coupons.edit', 'coupons.delete', 'coupons.activate'
  )
ON CONFLICT DO NOTHING;

-- Insert sample coupons (optional)
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, is_active) VALUES
  ('WELCOME10', 'Desconto de Boas-vindas', 'Desconto de 10% para novos clientes', 'percentage', 10.00, 100.00, 100, true),
  ('FRETE50', 'Desconto no Frete', 'R$ 50 de desconto no frete', 'fixed', 50.00, 200.00, NULL, true),
  ('BLACKFRIDAY', 'Black Friday', 'Desconto especial de Black Friday', 'percentage', 25.00, 150.00, 500, false)
ON CONFLICT (code) DO NOTHING;
