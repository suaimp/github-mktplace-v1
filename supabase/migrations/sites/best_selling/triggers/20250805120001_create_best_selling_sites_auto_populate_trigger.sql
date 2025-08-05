/*
  # Create Best Selling Sites Auto Population Trigger

  1. Trigger Function
    - Automatically populates best_selling_sites when order_items are inserted
    - Checks if entry_id already exists in best_selling_sites
    - Creates new record if not exists, updates quantity if exists

  2. Trigger Logic
    - Triggered on INSERT in order_items table
    - Uses UPSERT (INSERT ... ON CONFLICT) for efficiency
    - Sums quantities for existing entries

  3. Data Flow
    - order_items.entry_id → best_selling_sites.entry_id
    - order_items.product_name → best_selling_sites.product_name
    - order_items.product_url → best_selling_sites.product_url
    - order_items.quantity → best_selling_sites.quantity (summed if exists)
*/

-- Create function to auto-populate best_selling_sites
CREATE OR REPLACE FUNCTION auto_populate_best_selling_sites()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new record or update existing one using UPSERT
  INSERT INTO best_selling_sites (
    entry_id,
    product_name,
    product_url,
    quantity,
    created_at,
    updated_at
  )
  VALUES (
    NEW.entry_id,
    NEW.product_name,
    NEW.product_url,
    NEW.quantity,
    now(),
    now()
  )
  ON CONFLICT (entry_id) 
  DO UPDATE SET
    product_name = EXCLUDED.product_name,
    product_url = EXCLUDED.product_url,
    quantity = best_selling_sites.quantity + EXCLUDED.quantity,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on order_items table
DROP TRIGGER IF EXISTS trigger_auto_populate_best_selling_sites ON order_items;
CREATE TRIGGER trigger_auto_populate_best_selling_sites
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_best_selling_sites();

-- Add unique constraint on entry_id if not exists (needed for UPSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'best_selling_sites_entry_id_unique'
  ) THEN
    ALTER TABLE best_selling_sites 
    ADD CONSTRAINT best_selling_sites_entry_id_unique UNIQUE (entry_id);
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON FUNCTION auto_populate_best_selling_sites() IS 'Função que popula automaticamente a tabela best_selling_sites baseada em inserções na tabela order_items';
COMMENT ON TRIGGER trigger_auto_populate_best_selling_sites ON order_items IS 'Trigger que executa auto_populate_best_selling_sites() após inserção em order_items';
