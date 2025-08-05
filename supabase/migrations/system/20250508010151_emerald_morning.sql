-- Remove all menu items related to Service Packages
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
OR path = '/service-packages'
OR path LIKE '/service-packages/%';