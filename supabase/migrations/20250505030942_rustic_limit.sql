/*
  # Add Service Packages Menu Item
  
  1. Changes
    - Add Service Packages menu item to the admin sidebar
    - Set position after Forms
    - Make visible to all users
  
  2. Security
    - No security changes needed
*/

-- Insert Service Packages menu item
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
  85, -- Position after Forms
  true,
  'all'
)
ON CONFLICT (id) DO NOTHING;