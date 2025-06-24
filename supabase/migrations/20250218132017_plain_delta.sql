/*
  # Database Triggers

  1. Triggers
    - Update last_updated timestamp for inventory items
    - Auto-update task status based on dates
    - Auto-calculate employee performance
    - Auto-update operation status based on completion
    - Auto-update shipment status tracking
    - Auto-update inventory status based on stock levels

  2. Functions
    - Function to update inventory status
    - Function to update task status
    - Function to calculate employee performance
    - Function to update operation status
    - Function to update shipment status
*/

-- Function to update inventory status based on quantity and minimum_stock
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on quantity relative to minimum_stock
  IF NEW.quantity <= 0 THEN
    NEW.status = 'out-of-stock';
  ELSIF NEW.quantity <= NEW.minimum_stock THEN
    NEW.status = 'low-stock';
  ELSE
    NEW.status = 'in-stock';
  END IF;
  
  -- Update last_updated timestamp
  NEW.last_updated = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory status updates
CREATE TRIGGER inventory_status_update
  BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Function to update task status based on dates
CREATE OR REPLACE FUNCTION update_task_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't update if status is already 'completed'
  IF NEW.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Update status based on dates
  IF CURRENT_DATE < NEW.start_date THEN
    NEW.status = 'pending';
  ELSIF CURRENT_DATE >= NEW.start_date AND CURRENT_DATE <= NEW.end_date THEN
    NEW.status = 'in-progress';
  ELSE
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task status updates
CREATE TRIGGER task_status_update
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_status();

-- Function to calculate employee performance
CREATE OR REPLACE FUNCTION calculate_employee_performance()
RETURNS TRIGGER AS $$
DECLARE
  completed_tasks INTEGER;
  total_tasks INTEGER;
  completion_rate NUMERIC;
BEGIN
  -- Count completed and total tasks for the employee
  SELECT 
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    COUNT(*)
  INTO completed_tasks, total_tasks
  FROM tasks
  WHERE assignee_id = NEW.id
  AND end_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate performance based on task completion rate
  IF total_tasks > 0 THEN
    completion_rate := (completed_tasks::NUMERIC / total_tasks) * 100;
    NEW.performance := GREATEST(0, LEAST(100, completion_rate::INTEGER));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for employee performance calculation
CREATE TRIGGER employee_performance_update
  BEFORE INSERT OR UPDATE ON workforce
  FOR EACH ROW
  EXECUTE FUNCTION calculate_employee_performance();

-- Function to update operation status
CREATE OR REPLACE FUNCTION update_operation_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on date
  IF CURRENT_DATE < NEW.date THEN
    NEW.status = 'pending';
  ELSIF CURRENT_DATE = NEW.date THEN
    NEW.status = 'in-progress';
  ELSE
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for operation status updates
CREATE TRIGGER operation_status_update
  BEFORE INSERT OR UPDATE ON operations
  FOR EACH ROW
  EXECUTE FUNCTION update_operation_status();

-- Function to update shipment status
CREATE OR REPLACE FUNCTION update_shipment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on date
  IF CURRENT_DATE < NEW.date THEN
    NEW.status = 'pending';
  ELSIF CURRENT_DATE = NEW.date THEN
    NEW.status = 'in-transit';
  ELSE
    NEW.status = 'delivered';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shipment status updates
CREATE TRIGGER shipment_status_update
  BEFORE INSERT OR UPDATE ON logistics_shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_shipment_status();

-- Function to update recommendation status based on expiry
CREATE OR REPLACE FUNCTION update_recommendation_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-dismiss expired recommendations
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= CURRENT_TIMESTAMP THEN
    NEW.status = 'dismissed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recommendation status updates
CREATE TRIGGER recommendation_status_update
  BEFORE INSERT OR UPDATE ON recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_recommendation_status();