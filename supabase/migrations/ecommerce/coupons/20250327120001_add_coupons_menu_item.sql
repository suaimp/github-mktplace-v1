/*
  # Add Coupons Menu Item

  1. Insert new menu item for Coupons page
    - Position after service packages
    - Icon and path configuration
    - Admin permission requirement

  2. Update positions to maintain order
*/

-- Get the position of service packages to insert coupons after it
DO $$
DECLARE
    service_packages_position INTEGER;
    new_position INTEGER;
BEGIN
    -- Find the position of service packages
    SELECT position INTO service_packages_position 
    FROM menu_items 
    WHERE path = '/service-packages';
    
    -- Calculate new position (after service packages)
    new_position := COALESCE(service_packages_position, 0) + 1;
    
    -- Update positions of items that come after service packages
    UPDATE menu_items 
    SET position = position + 1 
    WHERE position >= new_position;
    
    -- Insert the coupons menu item
    INSERT INTO menu_items (
        name, 
        description, 
        icon, 
        path, 
        position, 
        is_visible, 
        requires_permission
    ) VALUES (
        'Cupons',
        'Gerenciar cupons de desconto',
        'ticket',
        '/tickets',
        new_position,
        true,
        'coupons.view'
    ) ON CONFLICT DO NOTHING;
END $$;
