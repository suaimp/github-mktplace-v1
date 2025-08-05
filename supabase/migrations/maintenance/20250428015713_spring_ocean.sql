/*
  # Create Shopping Cart System
  
  1. New Tables
    - `shopping_cart_items`
      - For storing items added to the shopping cart
      - Links to form entries as products
      - Includes quantity and user information
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create shopping_cart_items table
CREATE TABLE IF NOT EXISTS shopping_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES form_entries(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraint to ensure quantity is positive
  CONSTRAINT shopping_cart_items_quantity_check CHECK (quantity > 0),
  
  -- Add unique constraint to prevent duplicate items
  CONSTRAINT shopping_cart_items_user_entry_unique UNIQUE (user_id, entry_id)
);

-- Enable RLS
ALTER TABLE shopping_cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cart items" 
  ON shopping_cart_items 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
  ON shopping_cart_items 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
  ON shopping_cart_items 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
  ON shopping_cart_items 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopping_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopping_cart_items_updated_at
    BEFORE UPDATE ON shopping_cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_shopping_cart_items_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_cart_items_user_id ON shopping_cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_items_entry_id ON shopping_cart_items(entry_id);