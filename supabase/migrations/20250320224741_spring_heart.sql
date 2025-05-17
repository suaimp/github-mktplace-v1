/*
  # Add Redirect Page Column to Forms Table

  1. Changes
    - Add redirect_page column to forms table
    - Add index for faster lookups
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add redirect_page column to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS redirect_page text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forms_redirect_page ON forms(redirect_page);