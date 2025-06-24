import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Farm Management Types
export interface Operation {
  id?: string;
  title: string;
  type: string;
  field: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
  created_at?: string;
}

export interface FinanceTransaction {
  id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed';
  created_at?: string;
}

export interface LogisticsShipment {
  id?: string;
  type: 'inbound' | 'outbound';
  cargo: string;
  origin: string;
  destination: string;
  date: string;
  status: 'pending' | 'in-transit' | 'delivered';
  vehicle: string;
  quantity: string;
  created_at?: string;
}

export interface Employee {
  id?: string;
  name: string;
  role: string;
  status: 'active' | 'on-leave' | 'unavailable';
  current_task?: string;
  performance: number;
  hours_worked: number;
  created_at?: string;
}

export interface Task {
  id?: string;
  title: string;
  assignee_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  created_at?: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  category: 'seeds' | 'fertilizer' | 'equipment' | 'harvest' | 'supplies';
  quantity: number;
  unit: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  minimum_stock: number;
  created_at?: string;
  last_updated?: string;
}

// Farm Management API Functions
export const farmManagementApi = {
  // Operations
  async getOperations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('operations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Operation[];
  },

  async createOperation(operation: Omit<Operation, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('operations')
      .insert([{ ...operation, user_id: user.id }]);
    
    if (error) throw error;
    return { ...operation, user_id: user.id };
  },

  // Finance
  async getTransactions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as FinanceTransaction[];
  },

  async createTransaction(transaction: Omit<FinanceTransaction, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('finance_transactions')
      .insert([{ ...transaction, user_id: user.id }]);
    
    if (error) throw error;
    return { ...transaction, user_id: user.id };
  },

  // Logistics
  async getShipments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('logistics_shipments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as LogisticsShipment[];
  },

  async createShipment(shipment: Omit<LogisticsShipment, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('logistics_shipments')
      .insert([{ ...shipment, user_id: user.id }]);
    
    if (error) throw error;
    return { ...shipment, user_id: user.id };
  },

  // Workforce
  async getEmployees() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workforce')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) throw error;
    return data as Employee[];
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('workforce')
      .insert([{ ...employee, user_id: user.id }]);
    
    if (error) throw error;
    return { ...employee, user_id: user.id };
  },

  async getTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:workforce(name)
      `)
      .eq('user_id', user.id)
      .order('start_date');
    
    if (error) throw error;
    return data as (Task & { assignee: { name: string } })[];
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }]);
    
    if (error) throw error;
    return { ...task, user_id: user.id };
  },

  // Inventory
  async getInventoryItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) throw error;
    return data as InventoryItem[];
  },

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'last_updated'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('inventory_items')
      .insert([{ ...item, user_id: user.id }]);
    
    if (error) throw error;
    return { ...item, user_id: user.id };
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('inventory_items')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own items
      .select()
      .single();
    
    if (error) throw error;
    return data as InventoryItem;
  }
};