-- Fix order_totals duplicates and add unique constraint
-- This migration will clean up duplicate records and prevent future duplicates

-- First, let's backup any duplicate records before cleaning
CREATE TABLE IF NOT EXISTS order_totals_backup_duplicates AS
SELECT * FROM order_totals
WHERE user_id IN (
  SELECT user_id 
  FROM order_totals 
  GROUP BY user_id 
  HAVING COUNT(*) > 1
);

-- Delete duplicate records, keeping only the most recent one per user
DELETE FROM order_totals
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM order_totals
  ORDER BY user_id, created_at DESC
);

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE order_totals
ADD CONSTRAINT order_totals_user_id_unique UNIQUE (user_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT order_totals_user_id_unique ON order_totals 
IS 'Ensures only one order_total record per user at any time';

-- Update the updated_at column to use current timestamp on updates
ALTER TABLE order_totals 
ALTER COLUMN updated_at SET DEFAULT now();

-- Create or replace function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_order_totals_updated_at ON order_totals;
CREATE TRIGGER update_order_totals_updated_at
    BEFORE UPDATE ON order_totals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
