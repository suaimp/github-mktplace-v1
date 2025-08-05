/*
  # Add Marketplace Policies
  
  1. Changes
    - Add policies to allow public access to verified form entries
    - Ensure marketplace can display entries properly
  
  2. Security
    - Maintain RLS
    - Add proper access control
*/

-- Create policy to allow public access to verified form entries
CREATE POLICY "Anyone can view verified entries" 
  ON form_entries 
  FOR SELECT 
  TO public 
  USING (
    status = 'verificado'
  );

-- Create policy to allow public access to values of verified entries
CREATE POLICY "Anyone can view values of verified entries" 
  ON form_entry_values 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 
      FROM form_entries fe
      WHERE fe.id = entry_id
      AND fe.status = 'verificado'
    )
  );