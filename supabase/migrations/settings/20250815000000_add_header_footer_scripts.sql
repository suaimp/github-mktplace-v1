/*
  # Add Header and Footer Scripts to Settings Table

  1. Changes
    - Add `header_scripts` column to settings table for <head> injection
    - Add `footer_scripts` column to settings table for before </body> injection

  2. Purpose
    - Allow admins to inject custom scripts like Google Analytics, Tag Manager, etc.
    - Support for marketing tracking, chat widgets, and other third-party integrations

  3. Security
    - Fields are TEXT type to support HTML/JavaScript content
    - Access restricted to admins through existing RLS policies
    - Scripts are validated and sanitized on the frontend

  4. Modular Organization
    - Located in settings/ folder following table-specific organization
    - Focuses only on settings table modifications
*/

-- Add header_scripts column for <head> injection
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS header_scripts TEXT;

-- Add footer_scripts column for before </body> injection  
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS footer_scripts TEXT;

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_settings_header_scripts 
ON settings(header_scripts) WHERE header_scripts IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_settings_footer_scripts 
ON settings(footer_scripts) WHERE footer_scripts IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN settings.header_scripts IS 'HTML/JavaScript code to be injected in <head> section for analytics, meta tags, etc.';
COMMENT ON COLUMN settings.footer_scripts IS 'HTML/JavaScript code to be injected before </body> tag for widgets, tracking, etc.';
