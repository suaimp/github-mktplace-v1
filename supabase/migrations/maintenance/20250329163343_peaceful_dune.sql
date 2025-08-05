/*
  # Add Page Visibility Support
  
  1. Changes
    - Add visible_to column to pages table
    - Update RLS policies to check visibility
    - Add index for performance
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Add visible_to column with check constraint
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS visible_to text 
CHECK (visible_to IN ('all', 'publisher', 'advertiser'));

-- Set default value for existing records
UPDATE pages 
SET visible_to = 'all' 
WHERE visible_to IS NULL;

-- Make column required
ALTER TABLE pages 
ALTER COLUMN visible_to SET NOT NULL,
ALTER COLUMN visible_to SET DEFAULT 'all';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_pages_visible_to 
ON pages(visible_to);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read pages" ON pages;
  DROP POLICY IF EXISTS "Admins can insert pages" ON pages;
  DROP POLICY IF EXISTS "Admins can update pages" ON pages;
  DROP POLICY IF EXISTS "Admins can delete pages" ON pages;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Admins can read pages" 
  ON pages 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    OR
    (
      EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid())
      AND status = 'published'
      AND (
        visible_to = 'all'
        OR
        visible_to = (SELECT role FROM platform_users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Admins can insert pages" 
  ON pages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update pages" 
  ON pages 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete pages" 
  ON pages 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));