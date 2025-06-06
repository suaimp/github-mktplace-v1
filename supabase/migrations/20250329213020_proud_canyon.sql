/*
  # Add Visibility Control to Table Displays
  
  1. Changes
    - Add visible_to column to table_displays table
    - Add check constraint for valid values
    - Update RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for visibility control
*/

-- Add visible_to column with check constraint
ALTER TABLE table_displays 
ADD COLUMN IF NOT EXISTS visible_to text 
CHECK (visible_to IN ('all', 'publisher', 'advertiser'));

-- Set default value for existing records
UPDATE table_displays 
SET visible_to = 'all' 
WHERE visible_to IS NULL;

-- Make column required
ALTER TABLE table_displays 
ALTER COLUMN visible_to SET NOT NULL,
ALTER COLUMN visible_to SET DEFAULT 'all';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_table_displays_visible_to 
ON table_displays(visible_to);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read table displays" ON table_displays;
  DROP POLICY IF EXISTS "Admins can insert table displays" ON table_displays;
  DROP POLICY IF EXISTS "Admins can update table displays" ON table_displays;
  DROP POLICY IF EXISTS "Admins can delete table displays" ON table_displays;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Admins can read table displays" 
  ON table_displays 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Admins can see all displays
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    OR
    -- Platform users can see published displays based on visibility
    (
      EXISTS (
        SELECT 1 
        FROM platform_users pu 
        WHERE pu.id = auth.uid()
        AND pu.status = 'active'
      )
      AND status = 'published'
      AND (
        visible_to = 'all'
        OR
        visible_to = (
          SELECT role 
          FROM platform_users 
          WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can insert table displays" 
  ON table_displays 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update table displays" 
  ON table_displays 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete table displays" 
  ON table_displays 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));