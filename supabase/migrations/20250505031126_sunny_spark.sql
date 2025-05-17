-- First, delete any duplicated Service Packages menu items
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages'
AND position = 85;

-- Then, insert the Service Packages menu item in the administration section
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
  95, -- Position after Forms in the administration section
  true,
  'all'
)
ON CONFLICT (id) DO NOTHING;