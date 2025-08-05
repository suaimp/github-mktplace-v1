/*
  # Add Form Visibility Support
  
  1. Changes
    - Add visible_to column to forms table
    - Update RLS policies to check visibility
    - Add index for performance
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Add visible_to column with check constraint
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS visible_to text 
CHECK (visible_to IN ('all', 'publisher', 'advertiser'));

-- Set default value for existing records
UPDATE forms 
SET visible_to = 'all' 
WHERE visible_to IS NULL;

-- Make column required
ALTER TABLE forms 
ALTER COLUMN visible_to SET NOT NULL,
ALTER COLUMN visible_to SET DEFAULT 'all';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_forms_visible_to 
ON forms(visible_to);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read forms" ON forms;
  DROP POLICY IF EXISTS "Admins can insert forms" ON forms;
  DROP POLICY IF EXISTS "Admins can update forms" ON forms;
  DROP POLICY IF EXISTS "Admins can delete forms" ON forms;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Admins can read forms" 
  ON forms 
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

CREATE POLICY "Admins can insert forms" 
  ON forms 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update forms" 
  ON forms 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete forms" 
  ON forms 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));