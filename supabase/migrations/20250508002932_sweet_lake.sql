/*
  # Fix Services Menu Link
  
  1. Changes
    - Update menu item path to match the correct route
    - Ensure the menu item is visible to admins
  
  2. Security
    - No security changes needed
*/

-- First, delete any existing Services menu items to avoid duplicates
DELETE FROM menu_items 
WHERE name = 'Services' 
AND path = '/services';

-- Then, insert the Services menu item with the correct path
INSERT INTO menu_items (
  name,
  description,
  icon,
  path,
  position,
  is_visible,
  visible_to
) VALUES (
  'Services',
  'Manage services',
  'BoxIcon',
  '/services',
  6, -- Position after Forms
  true,
  'all'
)
ON CONFLICT (id) DO NOTHING;