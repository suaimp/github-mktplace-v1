/*
  # Add phone column to orders table

  1. Changes
    - Add phone column to orders table to store customer phone numbers
    - Phone number will be required for checkout process

  2. Security
    - Maintains existing RLS policies
*/

-- Add phone column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for phone for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
