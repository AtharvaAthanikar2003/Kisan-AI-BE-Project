/*
  # Add user_id columns to all tables

  1. Changes
    - Add user_id column to all tables
    - Add foreign key constraints to auth.users
    - Add indexes for better query performance
*/

-- Add user_id column to all tables
ALTER TABLE operations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE finance_transactions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE logistics_shipments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE workforce 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS operations_user_id_idx ON operations(user_id);
CREATE INDEX IF NOT EXISTS finance_transactions_user_id_idx ON finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS logistics_shipments_user_id_idx ON logistics_shipments(user_id);
CREATE INDEX IF NOT EXISTS workforce_user_id_idx ON workforce(user_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS inventory_items_user_id_idx ON inventory_items(user_id);