/*
  # Remove RLS Policies and User ID Constraints

  1. Changes
    - Disable RLS on all tables
    - Drop all RLS policies
    - Drop user_id foreign key constraints
    - Drop user_id columns
*/

-- Disable RLS on all tables
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE workforce DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can create recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can update their own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can delete their own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can manage their own operations" ON operations;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON finance_transactions;
DROP POLICY IF EXISTS "Users can manage their own shipments" ON logistics_shipments;
DROP POLICY IF EXISTS "Users can manage their workforce" ON workforce;
DROP POLICY IF EXISTS "Users can manage their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their inventory" ON inventory_items;

-- Drop user_id foreign key constraints and columns
DO $$ 
BEGIN
  -- recommendations table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recommendations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE recommendations DROP COLUMN user_id;
  END IF;

  -- operations table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'operations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE operations DROP COLUMN user_id;
  END IF;

  -- finance_transactions table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'finance_transactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE finance_transactions DROP COLUMN user_id;
  END IF;

  -- logistics_shipments table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logistics_shipments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE logistics_shipments DROP COLUMN user_id;
  END IF;

  -- workforce table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workforce' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workforce DROP COLUMN user_id;
  END IF;

  -- tasks table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tasks DROP COLUMN user_id;
  END IF;

  -- inventory_items table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE inventory_items DROP COLUMN user_id;
  END IF;
END $$;