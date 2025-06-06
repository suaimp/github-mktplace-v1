/*
  # Add Service Packages Menu Item
  
  1. Changes
    - Add service packages menu item to admin sidebar
    - Set proper position and visibility
  
  2. Security
    - Maintain existing RLS policies
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