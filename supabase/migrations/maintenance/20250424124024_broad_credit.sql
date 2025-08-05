/*
  # Remove Table Displays System
  
  1. Changes
    - Drop table_displays table
    - Drop table_layouts table
    - Remove related permissions
  
  2. Security
    - Remove associated RLS policies
*/

-- Drop table_displays table if exists
DROP TABLE IF EXISTS table_displays CASCADE;

-- Drop table_layouts table if exists
DROP TABLE IF EXISTS table_layouts CASCADE;

-- Remove permissions related to tables
DELETE FROM permissions 
WHERE code IN (
  'tables.view',
  'tables.create',
  'tables.edit',
  'tables.delete',
  'table_layouts.view',
  'table_layouts.create',
  'table_layouts.edit',
  'table_layouts.delete'
);

-- Remove role permissions related to tables
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions 
  WHERE code LIKE 'table%'
);

-- Remove menu items related to Display
DELETE FROM menu_items 
WHERE name = 'Display' 
OR path = '/tables'
OR parent_id IN (
  SELECT id FROM menu_items WHERE name = 'Display'
);