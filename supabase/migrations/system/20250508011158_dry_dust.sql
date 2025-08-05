/*
  # Remove Service Menu Item
  
  1. Changes
    - Delete Service menu item from menu_items table
    - Ensure all related items are removed
  
  2. Security
    - No security changes needed
*/

-- Delete Service menu item
DELETE FROM menu_items 
WHERE name = 'Services' 
AND path = '/services';