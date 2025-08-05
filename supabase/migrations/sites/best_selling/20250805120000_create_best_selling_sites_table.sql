/*
  # Create Best Selling Sites Table

  1. New Table
    - `best_selling_sites`
      - Stores information about the best selling sites
      - Links to form entries for tracking
      - Contains product details and quantity sold

  2. Security
    - Enable RLS
    - Add policies for authenticated users to have full CRUD access
*/

-- Create best_selling_sites table
CREATE TABLE IF NOT EXISTS best_selling_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES form_entries(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_url text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE best_selling_sites ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (Full CRUD access)
DROP POLICY IF EXISTS "Authenticated users can read best selling sites" ON best_selling_sites;
CREATE POLICY "Authenticated users can read best selling sites" 
  ON best_selling_sites 
  FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert best selling sites" ON best_selling_sites;
CREATE POLICY "Authenticated users can insert best selling sites" 
  ON best_selling_sites 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update best selling sites" ON best_selling_sites;
CREATE POLICY "Authenticated users can update best selling sites" 
  ON best_selling_sites 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete best selling sites" ON best_selling_sites;
CREATE POLICY "Authenticated users can delete best selling sites" 
  ON best_selling_sites 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_best_selling_sites_entry_id ON best_selling_sites(entry_id);
CREATE INDEX IF NOT EXISTS idx_best_selling_sites_quantity ON best_selling_sites(quantity DESC);
CREATE INDEX IF NOT EXISTS idx_best_selling_sites_product_name ON best_selling_sites(product_name);
CREATE INDEX IF NOT EXISTS idx_best_selling_sites_created_at ON best_selling_sites(created_at DESC);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_best_selling_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS best_selling_sites_updated_at ON best_selling_sites;
CREATE TRIGGER best_selling_sites_updated_at
  BEFORE UPDATE ON best_selling_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_best_selling_sites_updated_at();

-- Add comments for documentation
COMMENT ON TABLE best_selling_sites IS 'Tabela para armazenar informações sobre os sites mais vendidos';
COMMENT ON COLUMN best_selling_sites.id IS 'Identificador único do registro';
COMMENT ON COLUMN best_selling_sites.entry_id IS 'Referência ao form_entries (chave estrangeira com CASCADE)';
COMMENT ON COLUMN best_selling_sites.product_name IS 'Nome do produto';
COMMENT ON COLUMN best_selling_sites.product_url IS 'URL do produto';
COMMENT ON COLUMN best_selling_sites.quantity IS 'Quantidade vendida';
COMMENT ON COLUMN best_selling_sites.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN best_selling_sites.updated_at IS 'Data da última atualização';
