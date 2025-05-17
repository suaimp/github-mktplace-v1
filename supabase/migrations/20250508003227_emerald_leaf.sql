-- First, delete any existing Services menu items to avoid duplicates
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages';

-- Then, insert the Services menu item with the correct path and admin-only visibility
INSERT INTO menu_items (
  name,
  description,
  icon,
  path,
  position,
  is_visible,
  visible_to
) VALUES (
  'Service Packages',
  'Manage service packages',
  'BoxIcon',
  '/service-packages',
  6, -- Position after Forms
  true,
  'all' -- This is a valid value for visible_to
)
ON CONFLICT (id) DO NOTHING;

-- Check if service_packages table exists before trying to modify its policies
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'service_packages'
  ) THEN
    -- Update the service_packages table policies to ensure only admins can access
    DROP POLICY IF EXISTS "Anyone can view published service packages" ON service_packages;
    DROP POLICY IF EXISTS "Admins can read service packages" ON service_packages;

    CREATE POLICY "Admins can read service packages" 
      ON service_packages 
      FOR SELECT 
      TO authenticated 
      USING (EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
      ));
  END IF;

  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'service_package_items'
  ) THEN
    -- Update the service_package_items table policies
    DROP POLICY IF EXISTS "Anyone can view service package items" ON service_package_items;
    DROP POLICY IF EXISTS "Admins can read service package items" ON service_package_items;

    CREATE POLICY "Admins can read service package items" 
      ON service_package_items 
      FOR SELECT 
      TO authenticated 
      USING (EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
      ));
  END IF;
END $$;