/*
  # Create AI Recommendations Schema

  1. New Tables
    - `recommendations`
      - `id` (uuid, primary key)
      - `title` (text) - Recommendation title
      - `description` (text) - Detailed recommendation
      - `priority` (text) - Priority level (high, medium, low)
      - `category` (text) - Category of recommendation
      - `created_at` (timestamptz) - Creation timestamp
      - `expires_at` (timestamptz) - Expiration timestamp
      - `user_id` (uuid) - Reference to auth.users
      - `status` (text) - Status of recommendation (active, completed, dismissed)
      - `metadata` (jsonb) - Additional metadata

  2. Security
    - Enable RLS on recommendations table
    - Add policies for CRUD operations
*/

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_expires_at CHECK (expires_at > created_at)
);

-- Enable RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create recommendations"
  ON recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
  ON recommendations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX recommendations_user_id_idx ON recommendations(user_id);
CREATE INDEX recommendations_status_idx ON recommendations(status);