/*
  # Add Best Selling Sites Auto Population Trigger

  1. Trigger Function
    - `populate_best_selling_sites()`
      - Triggered when data is inserted into order_items
      - Creates or updates records in best_selling_sites based on entry_id
      - Accumulates quantity for existing records

  2. Logic
    - If entry_id doesn't exist: Create new record with order_items data
    - If entry_id exists: Update record and sum quantities
    - Always updates product_name and product_url with latest data

  3. Trigger
    - Fires AFTER INSERT on order_items
    - Calls populate_best_selling_sites() function
*/

-- Create function to populate best_selling_sites table
CREATE OR REPLACE FUNCTION populate_best_selling_sites()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a record with the same entry_id already exists
  IF EXISTS (
    SELECT 1 FROM best_selling_sites 
    WHERE entry_id = NEW.entry_id
  ) THEN
    -- Update existing record: sum quantities and update other fields
    UPDATE best_selling_sites
    SET 
      product_name = NEW.product_name,
      product_url = NEW.product_url,
      quantity = quantity + NEW.quantity,
      updated_at = now()
    WHERE entry_id = NEW.entry_id;
  ELSE
    -- Create new record with data from order_items
    INSERT INTO best_selling_sites (
      entry_id,
      product_name,
      product_url,
      quantity,
      created_at,
      updated_at
    ) VALUES (
      NEW.entry_id,
      NEW.product_name,
      NEW.product_url,
      NEW.quantity,
      now(),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on order_items table
DROP TRIGGER IF EXISTS trigger_populate_best_selling_sites ON order_items;
CREATE TRIGGER trigger_populate_best_selling_sites
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION populate_best_selling_sites();

-- Add comment for documentation
COMMENT ON FUNCTION populate_best_selling_sites() IS 'Função que popula automaticamente a tabela best_selling_sites baseada nos dados inseridos em order_items';
