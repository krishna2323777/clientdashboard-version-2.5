-- Add officials-related columns to branch_registration_data table
ALTER TABLE branch_registration_data 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS country_of_birth TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS residential_address TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS appointment_date TEXT,
ADD COLUMN IF NOT EXISTS authorities TEXT,
ADD COLUMN IF NOT EXISTS restrictions TEXT;

-- Add officials_data column to store array of officials
ALTER TABLE branch_registration_data 
ADD COLUMN IF NOT EXISTS officials_data JSONB;

-- Add branch-related columns if they don't exist
ALTER TABLE branch_registration_data 
ADD COLUMN IF NOT EXISTS branch_starting_date TEXT,
ADD COLUMN IF NOT EXISTS is_continuation_of_existing_branch BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS branch_address TEXT,
ADD COLUMN IF NOT EXISTS branch_city TEXT,
ADD COLUMN IF NOT EXISTS branch_postal_code TEXT,
ADD COLUMN IF NOT EXISTS separate_postal_address BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS branch_phone TEXT,
ADD COLUMN IF NOT EXISTS branch_website TEXT,
ADD COLUMN IF NOT EXISTS branch_email TEXT,
ADD COLUMN IF NOT EXISTS message_box_name TEXT,
ADD COLUMN IF NOT EXISTS full_time_employees INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS part_time_employees INTEGER DEFAULT 0; 