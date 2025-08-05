/*
  # Fix Form Visibility Policies
  
  1. Changes
    - Drop existing policies
    - Add proper RLS policies for form visibility
    - Update form entries and values policies
  
  2. Security
    - Enable RLS
    - Add policies for proper access control
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read forms" ON forms;
  DROP POLICY IF EXISTS "Anyone can create form entries" ON form_entries;
  DROP POLICY IF EXISTS "Admins can read entry values" ON form_entry_values;
  DROP POLICY IF EXISTS "Anyone can create entry values" ON form_entry_values;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies for forms
CREATE POLICY "Admins can read forms" 
  ON forms 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Admins can see all forms
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    OR
    -- Platform users can see published forms based on visibility
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

-- Create new policies for form entries
CREATE POLICY "Anyone can create form entries" 
  ON form_entries 
  FOR INSERT 
  TO public 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM forms f
      LEFT JOIN platform_users pu ON pu.id = auth.uid()
      WHERE f.id = form_id
      AND f.status = 'published'
      AND (
        f.visible_to = 'all'
        OR (
          pu.id IS NOT NULL 
          AND pu.status = 'active'
          AND pu.role = f.visible_to
        )
      )
    )
  );

-- Create new policies for form entry values
CREATE POLICY "Admins can read entry values" 
  ON form_entry_values 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Admins can see all entries
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    OR
    -- Platform users can see entries for forms they have access to
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      JOIN forms f ON f.id = fe.form_id
      JOIN platform_users pu ON pu.id = auth.uid()
      WHERE fe.id = entry_id
      AND pu.status = 'active'
      AND (
        f.visible_to = 'all'
        OR
        f.visible_to = pu.role
      )
    )
  );

CREATE POLICY "Anyone can create entry values" 
  ON form_entry_values 
  FOR INSERT 
  TO public 
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      JOIN forms f ON f.id = fe.form_id
      LEFT JOIN platform_users pu ON pu.id = auth.uid()
      WHERE fe.id = entry_id
      AND f.status = 'published'
      AND (
        f.visible_to = 'all'
        OR (
          pu.id IS NOT NULL 
          AND pu.status = 'active'
          AND pu.role = f.visible_to
        )
      )
    )
  );

-- Create index for faster policy evaluation
CREATE INDEX IF NOT EXISTS idx_platform_users_role_status 
ON platform_users(role, status);