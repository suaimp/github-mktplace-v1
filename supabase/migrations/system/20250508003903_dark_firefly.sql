-- Delete Service Packages menu item from the main menu
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages'
AND parent_id IS NULL;

-- Add Service Packages menu item to the admin menu section
-- First find an existing admin menu item to determine the parent_id
DO $$ 
DECLARE
  admin_parent_id uuid;
BEGIN
  -- Find an existing admin menu item (like Forms or Pages)
  SELECT parent_id INTO admin_parent_id
  FROM menu_items
  WHERE name IN ('Forms', 'Pages')
  AND parent_id IS NOT NULL
  LIMIT 1;
  
  -- If we found a parent_id, insert the Service Packages menu item with that parent
  IF admin_parent_id IS NOT NULL THEN
    INSERT INTO menu_items (
      name,
      description,
      icon,
      path,
      parent_id,
      position,
      is_visible,
      visible_to
    ) VALUES (
      'Service Packages',
      'Manage service packages',
      'BoxIcon',
      '/service-packages',
      admin_parent_id,
      6, -- Position
      true,
      'all'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;