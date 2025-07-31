/*
  # Add Site Meta Fields to Settings Table
  
  1. Changes
    - Add site_title column to settings table
    - Add site_description column to settings table
    - Set default values for better UX
    - Update existing settings row if it exists
  
  2. Security
    - Maintain existing RLS policies
    - No new permissions needed (uses existing admin policies)
*/

-- Add site meta fields to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS site_title text DEFAULT 'Marketplace Platform',
ADD COLUMN IF NOT EXISTS site_description text DEFAULT 'Plataforma de marketplace para conectar publishers e anunciantes';

-- Update existing settings row with default values if they are null
UPDATE settings 
SET 
  site_title = COALESCE(site_title, 'Marketplace Platform'),
  site_description = COALESCE(site_description, 'Plataforma de marketplace para conectar publishers e anunciantes')
WHERE site_title IS NULL OR site_description IS NULL;

-- Create index for faster lookups (optional, good for performance)
CREATE INDEX IF NOT EXISTS idx_settings_site_meta 
ON settings(site_title, site_description);
