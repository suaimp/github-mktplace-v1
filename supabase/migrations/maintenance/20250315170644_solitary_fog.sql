-- Add new columns to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS marketing_automation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS offer_suggestions boolean DEFAULT false;