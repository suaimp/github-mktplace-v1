/*
  # Add Menu Item Visibility Column
  
  1. Changes
    - Add visible_to column to menu_items table
    - Add check constraint for valid values
    - Set default value for existing records
    - Add index for performance
    - Update RLS policies
  
  2. Security
    - Drop existing policies first
    - Create new policy for visibility filtering
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view menu items based on role" ON menu_items;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add visible_to column with check constraint
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS visible_to text 
CHECK (visible_to IN ('all', 'publisher', 'advertiser'));

-- Set default value for existing records
UPDATE menu_items 
SET visible_to = 'all' 
WHERE visible_to IS NULL;

-- Make column required
ALTER TABLE menu_items 
ALTER COLUMN visible_to SET NOT NULL,
ALTER COLUMN visible_to SET DEFAULT 'all';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_visible_to 
ON menu_items(visible_to);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read menu_items" ON menu_items;
  DROP POLICY IF EXISTS "Admins can insert menu_items" ON menu_items;
  DROP POLICY IF EXISTS "Admins can update menu_items" ON menu_items;
  DROP POLICY IF EXISTS "Admins can delete menu_items" ON menu_items;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Admins can read menu_items" 
  ON menu_items 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    OR
    (
      EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid())
      AND (
        visible_to = 'all'
        OR
        visible_to = (SELECT role FROM platform_users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Admins can insert menu_items" 
  ON menu_items 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update menu_items" 
  ON menu_items 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete menu_items" 
  ON menu_items 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));