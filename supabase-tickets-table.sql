-- Create tickets table for the support system
CREATE TABLE public.tickets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

-- Create RLS policies for the tickets table
-- Allow users to view only their own tickets
CREATE POLICY "Users can view their own tickets" 
  ON public.tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own tickets
CREATE POLICY "Users can create new tickets" 
  ON public.tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own tickets
CREATE POLICY "Users can update their own tickets" 
  ON public.tickets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status <> 'closed');

-- Create index on user_id for faster queries
CREATE INDEX tickets_user_id_idx ON public.tickets(user_id);

-- Create index on status for filtering
CREATE INDEX tickets_status_idx ON public.tickets(status);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create or replace function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 
-- Create the storage bucket for VAT forms
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vat-forms', 'vat-forms', false);

-- Create storage policy to allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vat-forms' AND 
  auth.uid() = owner
);

-- Create policy to allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vat-forms' AND 
  auth.uid() = owner
);
-- Create the storage bucket for VAT forms
CREATE POLICY "Allow authenticated users to upload VAT forms"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vat-forms');

-- Create the submissions table
CREATE TABLE vat_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  form_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  form_data JSONB,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT valid_status CHECK (status IN ('completed', 'pending', 'error'))
);

-- Add RLS policies
ALTER TABLE vat_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions"
ON vat_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
ON vat_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);