-- Add branch-specific columns to branch_registration_data table for Form 9
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

-- Add the same columns to company_info table for consistency
ALTER TABLE company_info 
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

-- Add the same columns to user_profiles table for consistency
ALTER TABLE user_profiles 
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