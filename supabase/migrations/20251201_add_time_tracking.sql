-- Migration: Add time tracking columns to obligations and installments
-- Created: 2025-12-01
-- Purpose: Track time spent on obligations and time to payment for installments

-- Add time tracking columns to obligations table
ALTER TABLE obligations 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER;

-- Add comments to columns
COMMENT ON COLUMN obligations.started_at IS 'Timestamp when work on this obligation started';
COMMENT ON COLUMN obligations.completed_at IS 'Timestamp when this obligation was marked as completed (already exists)';
COMMENT ON COLUMN obligations.time_spent_minutes IS 'Total time spent in minutes (calculated automatically)';

-- Add time tracking column to installments table
ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS time_to_payment_minutes INTEGER;

-- Add comment to column
COMMENT ON COLUMN installments.time_to_payment_minutes IS 'Time from creation to payment in minutes';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_obligations_completed_at ON obligations(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_installments_paid_at ON installments(paid_at) WHERE paid_at IS NOT NULL;

-- Create function to automatically calculate time_spent_minutes for obligations
CREATE OR REPLACE FUNCTION calculate_obligation_time_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'completed' and completed_at is being set
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.status != 'completed') THEN
    -- Calculate time spent in minutes from created_at to completed_at
    NEW.time_spent_minutes := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.created_at)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate time when obligation is completed
DROP TRIGGER IF EXISTS trigger_calculate_obligation_time ON obligations;
CREATE TRIGGER trigger_calculate_obligation_time
  BEFORE UPDATE ON obligations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_obligation_time_spent();

-- Create function to automatically calculate time_to_payment_minutes for installments
CREATE OR REPLACE FUNCTION calculate_installment_time_to_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'paid' and paid_at is being set
  IF NEW.status = 'paid' AND NEW.paid_at IS NOT NULL AND (OLD.paid_at IS NULL OR OLD.status != 'paid') THEN
    -- Calculate time to payment in minutes from created_at to paid_at
    NEW.time_to_payment_minutes := EXTRACT(EPOCH FROM (NEW.paid_at - NEW.created_at)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate time when installment is paid
DROP TRIGGER IF EXISTS trigger_calculate_installment_time ON installments;
CREATE TRIGGER trigger_calculate_installment_time
  BEFORE UPDATE ON installments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_installment_time_to_payment();
