-- Delete any existing Service Packages menu items to avoid duplicates
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages';

-- Insert Service Packages menu item in the administration section
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
  6, -- Position after Forms (which is typically position 5)
  true,
  'all'
);