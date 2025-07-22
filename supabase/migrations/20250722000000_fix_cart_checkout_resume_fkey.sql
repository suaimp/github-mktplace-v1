-- Fix foreign key constraint for cart_checkout_resume.entry_id
-- This ensures that when a form_entry is deleted, the entry_id in cart_checkout_resume is set to NULL

-- First, remove the NOT NULL constraint from entry_id column
ALTER TABLE cart_checkout_resume 
ALTER COLUMN entry_id DROP NOT NULL;

-- Check if the foreign key constraint exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'cart_checkout_resume_entry_id_fkey' 
        AND table_name = 'cart_checkout_resume'
    ) THEN
        ALTER TABLE cart_checkout_resume 
        DROP CONSTRAINT cart_checkout_resume_entry_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint with ON DELETE SET NULL
ALTER TABLE cart_checkout_resume 
ADD CONSTRAINT cart_checkout_resume_entry_id_fkey 
FOREIGN KEY (entry_id) REFERENCES form_entries(id) ON DELETE SET NULL;
