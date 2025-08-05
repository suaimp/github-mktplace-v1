/*
  # Add No Data Message to Forms
  
  1. Changes
    - Add no_data_message column to forms table
    - Set default value
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add no_data_message column to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS no_data_message text DEFAULT 'No entries found';