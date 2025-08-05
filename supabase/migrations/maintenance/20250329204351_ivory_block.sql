/*
  # Remove Display Menu Items
  
  1. Changes
    - Delete Display menu item and its children
    - Clean up any orphaned items
  
  2. Security
    - No security changes needed
*/

-- Delete Display menu item and its children
DELETE FROM menu_items 
WHERE name = 'Display' 
OR parent_id IN (
  SELECT id FROM menu_items WHERE name = 'Display'
);