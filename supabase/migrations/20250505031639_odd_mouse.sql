/*
  # Fix Service Packages Menu Position
  
  1. Changes
    - Delete existing Service Packages menu item
    - Add Service Packages to menu-admin section
    - Set proper position after Forms
  
  2. Security
    - No security changes needed
*/

-- First, delete any existing Service Packages menu items
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages';

-- Then, insert the Service Packages menu item in the administration section
INSERT INTO menu_items (
  name,
  description,
  icon,
  path,
  position,
  is_visible,
  visible_to,
  parent_id
) 
SELECT
  'Service Packages',
  'Manage service packages',
  'BoxIcon',
  '/service-packages',
  95, -- Position after Forms in the administration section
  true,
  'all',
  NULL -- This will be updated below to be in the menu-admin section
;

-- Update the parent_id to place it in the menu-admin section
-- First, find a menu item that's already in the menu-admin section
DO $$
DECLARE
  admin_menu_item_id uuid;
BEGIN
  -- Find an existing menu item in the menu-admin section (e.g., Forms)
  SELECT parent_id INTO admin_menu_item_id
  FROM menu_items
  WHERE name = 'Forms'
  LIMIT 1;
  
  -- Update the Service Packages menu item to have the same parent_id
  UPDATE menu_items
  SET parent_id = admin_menu_item_id
  WHERE name = 'Service Packages'
  AND path = '/service-packages';
END $$;