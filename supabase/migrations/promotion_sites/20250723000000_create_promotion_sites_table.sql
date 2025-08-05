/*
  # Create Promotion Sites Table

  1. New Table
    - `promotion_sites`
      - Links promotional offers to form entries
      - Stores pricing information for promotions
      - Includes current and old pricing data
      - Contains promotional URLs

  2. Security
    - Enable RLS
    - Add policies for admin and platform user access
    - Admins: Full CRUD access
    - Platform Users: Full CRUD access
*/

-- Create promotion_sites table
CREATE TABLE IF NOT EXISTS promotion_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES form_entries(id) ON DELETE CASCADE,
  percent numeric(5,2),
  price numeric(10,2),
  old_price numeric(10,2),
  promotional_price numeric(10,2),
  old_promotional_price numeric(10,2),
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE promotion_sites ENABLE ROW LEVEL SECURITY;

-- Create policies for promotion_sites
DROP POLICY IF EXISTS "Admins can read promotion sites" ON promotion_sites;
CREATE POLICY "Admins can read promotion sites" 
  ON promotion_sites 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN roles r ON a.role_id = r.id
      WHERE a.id = auth.uid() AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert promotion sites" ON promotion_sites;
CREATE POLICY "Admins can insert promotion sites" 
  ON promotion_sites 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN roles r ON a.role_id = r.id
      WHERE a.id = auth.uid() AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update promotion sites" ON promotion_sites;
CREATE POLICY "Admins can update promotion sites" 
  ON promotion_sites 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN roles r ON a.role_id = r.id
      WHERE a.id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN roles r ON a.role_id = r.id
      WHERE a.id = auth.uid() AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete promotion sites" ON promotion_sites;
CREATE POLICY "Admins can delete promotion sites" 
  ON promotion_sites 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN roles r ON a.role_id = r.id
      WHERE a.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create policies for platform users (CRUD access)
DROP POLICY IF EXISTS "Platform users can read promotion sites" ON promotion_sites;
CREATE POLICY "Platform users can read promotion sites" 
  ON promotion_sites 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Platform users can insert promotion sites" ON promotion_sites;
CREATE POLICY "Platform users can insert promotion sites" 
  ON promotion_sites 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Platform users can update promotion sites" ON promotion_sites;
CREATE POLICY "Platform users can update promotion sites" 
  ON promotion_sites 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Platform users can delete promotion sites" ON promotion_sites;
CREATE POLICY "Platform users can delete promotion sites" 
  ON promotion_sites 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promotion_sites_entry_id ON promotion_sites(entry_id);
CREATE INDEX IF NOT EXISTS idx_promotion_sites_created_at ON promotion_sites(created_at);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotion_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS promotion_sites_updated_at ON promotion_sites;
CREATE TRIGGER promotion_sites_updated_at
  BEFORE UPDATE ON promotion_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_sites_updated_at();

-- Add comments for documentation
COMMENT ON TABLE promotion_sites IS 'Tabela para armazenar informações promocionais de sites vinculadas a entradas de formulário';
COMMENT ON COLUMN promotion_sites.id IS 'Identificador único da promoção';
COMMENT ON COLUMN promotion_sites.entry_id IS 'Referência para a entrada do formulário';
COMMENT ON COLUMN promotion_sites.percent IS 'Percentual de desconto (0-100)';
COMMENT ON COLUMN promotion_sites.price IS 'Preço atual';
COMMENT ON COLUMN promotion_sites.old_price IS 'Preço anterior';
COMMENT ON COLUMN promotion_sites.promotional_price IS 'Preço promocional atual';
COMMENT ON COLUMN promotion_sites.old_promotional_price IS 'Preço promocional anterior';
COMMENT ON COLUMN promotion_sites.url IS 'URL do site promocional';
