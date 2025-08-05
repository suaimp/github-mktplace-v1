/*
  # Fix Form Entries Visibility
  
  1. Changes
    - Update form entries policies to respect page visibility
    - Allow form access when embedded in accessible pages
    - Fix platform user access checks
  
  2. Security
    - Enable RLS
    - Add policies for proper access control
*/

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can create form entries" ON form_entries;
  DROP POLICY IF EXISTS "Admins can read form entries" ON form_entries;
  DROP POLICY IF EXISTS "Admins can read entry values" ON form_entry_values;
  DROP POLICY IF EXISTS "Anyone can create entry values" ON form_entry_values;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies for form entries
CREATE POLICY "Admins can read form entries" 
  ON form_entries 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

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
        -- Form is directly accessible
        f.visible_to = 'all'
        OR (
          pu.id IS NOT NULL 
          AND pu.status = 'active'
          AND pu.role = f.visible_to
        )
        OR
        -- Form is embedded in an accessible page
        EXISTS (
          SELECT 1 
          FROM pages p
          WHERE p.status = 'published'
          AND p.content LIKE '%[form id="' || f.id || '"]%'
          AND (
            p.visible_to = 'all'
            OR (
              pu.id IS NOT NULL 
              AND pu.status = 'active'
              AND pu.role = p.visible_to
            )
          )
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
        -- Form is directly accessible
        f.visible_to = 'all'
        OR f.visible_to = pu.role
        OR
        -- Form is embedded in an accessible page
        EXISTS (
          SELECT 1 
          FROM pages p
          WHERE p.status = 'published'
          AND p.content LIKE '%[form id="' || f.id || '"]%'
          AND (
            p.visible_to = 'all'
            OR p.visible_to = pu.role
          )
        )
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
        -- Form is directly accessible
        f.visible_to = 'all'
        OR (
          pu.id IS NOT NULL 
          AND pu.status = 'active'
          AND pu.role = f.visible_to
        )
        OR
        -- Form is embedded in an accessible page
        EXISTS (
          SELECT 1 
          FROM pages p
          WHERE p.status = 'published'
          AND p.content LIKE '%[form id="' || f.id || '"]%'
          AND (
            p.visible_to = 'all'
            OR (
              pu.id IS NOT NULL 
              AND pu.status = 'active'
              AND pu.role = p.visible_to
            )
          )
        )
      )
    )
  );