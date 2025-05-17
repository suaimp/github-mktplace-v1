/*
  # Final Cleanup of Service Package Tables
  
  1. Changes
    - Drop service_package_items table if it exists
    - Drop service_packages table if it exists
    - Remove any remaining permissions
  
  2. Security
    - Remove associated RLS policies
*/

-- Drop service_package_items table if exists
DROP TABLE IF EXISTS service_package_items CASCADE;

-- Drop service_packages table if exists
DROP TABLE IF EXISTS service_packages CASCADE;

-- Remove permissions related to service packages
DELETE FROM permissions 
WHERE code IN (
  'service_packages.view',
  'service_packages.create',
  'service_packages.edit',
  'service_packages.delete'
);

-- Remove role permissions related to service packages
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions 
  WHERE code LIKE 'service_packages%'
);

-- Remove menu items related to Service Packages
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
OR path = '/service-packages'
OR path LIKE '/service-packages/%';