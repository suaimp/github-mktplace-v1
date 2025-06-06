/*
  # Add Display Menu Items
  
  1. Changes
    - Add parent Display menu item
    - Add Tables submenu item
  
  2. Security
    - Maintain existing RLS policies
*/

-- Insert Display parent menu item
INSERT INTO menu_items (
  name,
  description,
  icon,
  path,
  position,
  is_visible,
  visible_to
) VALUES (
  'Display',
  'Display components and elements',
  'TableIcon',
  '#',
  90, -- Position after Forms
  true,
  'all'
);

-- Get the ID of the Display menu item
DO $$ 
DECLARE
  display_id uuid;
BEGIN
  SELECT id INTO display_id FROM menu_items WHERE name = 'Display' AND path = '#';
  
  -- Insert Tables submenu item
  INSERT INTO menu_items (
    name,
    description,
    icon,
    path,
    parent_id,
    position,
    is_visible,
    visible_to
  ) VALUES (
    'Tables',
    'Table display components',
    'TableIcon',
    '/basic-tables',
    display_id,
    0,
    true,
    'all'
  );
END $$;