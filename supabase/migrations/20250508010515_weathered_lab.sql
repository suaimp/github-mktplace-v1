/*
  # Remove Service Packages Menu Item
  
  1. Changes
    - Delete Service Packages menu item from menu_items table
    - Ensure all related items are removed
  
  2. Security
    - No security changes needed
*/

-- Delete Service Packages menu item
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages';