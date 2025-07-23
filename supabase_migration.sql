-- Create Stripe webhook events table
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(255) NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(255) REFERENCES private.invoices(invoice_number) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'eur',
  status VARCHAR(50) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_invoice_number ON payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_email ON payments(client_email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to handle Stripe webhook events
CREATE OR REPLACE FUNCTION handle_stripe_webhook()
RETURNS TRIGGER AS $$
DECLARE
  invoice_record RECORD;
BEGIN
  -- Insert the webhook event into the stripe_webhook_events table
  INSERT INTO stripe_webhook_events (event_id, event_type, event_data)
  VALUES (NEW.event_id, NEW.event_type, NEW.event_data)
  ON CONFLICT (event_id) DO NOTHING;

  -- Process payment_intent.succeeded events
  IF NEW.event_type = 'payment_intent.succeeded' THEN
    -- Get invoice details
    SELECT * INTO invoice_record 
    FROM private.invoices 
    WHERE invoice_number = NEW.event_data->>'metadata'->>'invoice_number';

    -- Insert payment record
    INSERT INTO payments (
      invoice_number,
      stripe_payment_id,
      amount,
      currency,
      status,
      client_email,
      user_id,
      metadata
    )
    VALUES (
      NEW.event_data->>'metadata'->>'invoice_number',
      NEW.event_data->>'id',
      (NEW.event_data->>'amount')::DECIMAL / 100, -- Convert from cents to euros
      'eur',
      'succeeded',
      NEW.event_data->>'metadata'->>'client_email',
      invoice_record.user_id,
      NEW.event_data->'metadata'
    )
    ON CONFLICT (stripe_payment_id) DO UPDATE
    SET
      status = 'succeeded',
      updated_at = NOW();

    -- Update invoice status in private.invoices
    UPDATE private.invoices
    SET payment_status = true
    WHERE invoice_number = NEW.event_data->>'metadata'->>'invoice_number';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for webhook events
CREATE TRIGGER stripe_webhook_trigger
  AFTER INSERT ON stripe_webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION handle_stripe_webhook(); 