-- Add officials-specific columns to branch_registration_data table for Form 13
ALTER TABLE branch_registration_data 
ADD COLUMN IF NOT EXISTS residential_address TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS appointment_date TEXT,
ADD COLUMN IF NOT EXISTS authorities TEXT,
ADD COLUMN IF NOT EXISTS restrictions TEXT; 