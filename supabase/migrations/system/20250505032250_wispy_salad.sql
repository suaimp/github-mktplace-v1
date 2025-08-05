/*
  # Add Service Packages Menu Item to Admin Section
  
  1. Changes
    - Add Service Packages menu item to the admin section
    - Position it after Forms
  
  2. Security
    - No security changes needed
*/

-- Delete any existing Service Packages menu items to avoid duplicates
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages';

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
  6, -- Position after Forms
  true,
  'all'
);