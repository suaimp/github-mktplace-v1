/*
  # Update Form Field Settings for Product Commission
  
  1. Changes
    - Rename product_price to commission_rate
    - Update column description
  
  2. Security
    - Maintain existing RLS policies
*/

-- Rename product_price to commission_rate
ALTER TABLE form_field_settings
DROP COLUMN IF EXISTS product_price,
ADD COLUMN commission_rate numeric;

-- Add comment to explain commission_rate
COMMENT ON COLUMN form_field_settings.commission_rate IS 'Sales commission percentage for products';