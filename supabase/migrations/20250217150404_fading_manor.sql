/*
  # Create Farm Management Tables

  1. New Tables
    - operations
    - finance_transactions
    - logistics_shipments
    - workforce
    - tasks
    - inventory_items

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add proper indexes
*/

-- Operations Table
CREATE TABLE IF NOT EXISTS public.operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  field text NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  description text,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own operations"
  ON public.operations
  FOR ALL
  USING (auth.uid() = user_id);

-- Finance Transactions Table
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  amount numeric NOT NULL,
  description text,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed')),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions"
  ON public.finance_transactions
  FOR ALL
  USING (auth.uid() = user_id);

-- Logistics Shipments Table
CREATE TABLE IF NOT EXISTS public.logistics_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('inbound', 'outbound')),
  cargo text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in-transit', 'delivered')),
  vehicle text NOT NULL,
  quantity text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shipments"
  ON public.logistics_shipments
  FOR ALL
  USING (auth.uid() = user_id);

-- Workforce Table
CREATE TABLE IF NOT EXISTS public.workforce (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'on-leave', 'unavailable')),
  current_task text,
  performance integer CHECK (performance >= 0 AND performance <= 100),
  hours_worked integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workforce ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workforce"
  ON public.workforce
  FOR ALL
  USING (auth.uid() = user_id);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  assignee_id uuid REFERENCES public.workforce(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  description text,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tasks"
  ON public.tasks
  FOR ALL
  USING (auth.uid() = user_id);

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('seeds', 'fertilizer', 'equipment', 'harvest', 'supplies')),
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  location text NOT NULL,
  status text NOT NULL CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock')),
  minimum_stock numeric NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT positive_minimum_stock CHECK (minimum_stock >= 0)
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their inventory"
  ON public.inventory_items
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS operations_user_id_idx ON public.operations(user_id);
CREATE INDEX IF NOT EXISTS finance_transactions_user_id_idx ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS logistics_shipments_user_id_idx ON public.logistics_shipments(user_id);
CREATE INDEX IF NOT EXISTS workforce_user_id_idx ON public.workforce(user_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS inventory_items_user_id_idx ON public.inventory_items(user_id);