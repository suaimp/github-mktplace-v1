-- Delete any existing Service Packages menu items
DELETE FROM menu_items 
WHERE name = 'Service Packages' 
AND path = '/service-packages';