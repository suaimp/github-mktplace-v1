/*
  # Create User Favorites System
  
  1. New Tables
    - `user_favorites`
      - For storing user favorite items
      - Links to form entries as favorite products
      - Includes user information
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES form_entries(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Add unique constraint to prevent duplicate favorites
  CONSTRAINT user_favorites_user_entry_unique UNIQUE (user_id, entry_id)
);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites" 
  ON user_favorites 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON user_favorites 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON user_favorites 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entry_id ON user_favorites(entry_id);