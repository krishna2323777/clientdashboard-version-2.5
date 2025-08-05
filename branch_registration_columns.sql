-- Add missing columns to company_info table for branch registration form
ALTER TABLE company_info 
ADD COLUMN IF NOT EXISTS foreign_register_name TEXT,
ADD COLUMN IF NOT EXISTS foreign_registering_institution TEXT,
ADD COLUMN IF NOT EXISTS formally_registered_since TEXT,
ADD COLUMN IF NOT EXISTS principal_place_of_business TEXT,
ADD COLUMN IF NOT EXISTS issued_capital TEXT,
ADD COLUMN IF NOT EXISTS trade_names TEXT,
ADD COLUMN IF NOT EXISTS activities_description TEXT,
ADD COLUMN IF NOT EXISTS main_activity TEXT,
ADD COLUMN IF NOT EXISTS foreign_registration_location TEXT,
ADD COLUMN IF NOT EXISTS is_eea BOOLEAN DEFAULT true;

-- Add missing columns to user_profiles table if needed
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS foreign_register_name TEXT,
ADD COLUMN IF NOT EXISTS foreign_registering_institution TEXT,
ADD COLUMN IF NOT EXISTS formally_registered_since TEXT,
ADD COLUMN IF NOT EXISTS principal_place_of_business TEXT,
ADD COLUMN IF NOT EXISTS issued_capital TEXT,
ADD COLUMN IF NOT EXISTS trade_names TEXT,
ADD COLUMN IF NOT EXISTS activities_description TEXT,
ADD COLUMN IF NOT EXISTS main_activity TEXT,
ADD COLUMN IF NOT EXISTS foreign_registration_location TEXT,
ADD COLUMN IF NOT EXISTS is_eea BOOLEAN DEFAULT true;

-- Create a new table specifically for branch registration data if preferred
CREATE TABLE IF NOT EXISTS branch_registration_data (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT,
    legal_form TEXT,
    reg_number TEXT,
    vat_number TEXT,
    foreign_register_name TEXT,
    foreign_registering_institution TEXT,
    formally_registered_since TEXT,
    registered_office TEXT,
    principal_place_of_business TEXT,
    issued_capital TEXT,
    trade_names TEXT,
    activities_description TEXT,
    main_activity TEXT,
    country_of_incorporation TEXT,
    foreign_registration_location TEXT,
    is_eea BOOLEAN DEFAULT true,
    -- Branch Information
    branch_starting_date TEXT,
    is_continuation_of_existing_branch BOOLEAN DEFAULT false,
    branch_address TEXT,
    branch_city TEXT,
    branch_postal_code TEXT,
    separate_postal_address BOOLEAN DEFAULT false,
    branch_phone TEXT,
    branch_website TEXT,
    branch_email TEXT,
    message_box_name TEXT,
    full_time_employees INTEGER DEFAULT 0,
    part_time_employees INTEGER DEFAULT 0,
    -- Officials Information (from KYC documents)
    full_name TEXT,
    role TEXT,
    date_of_birth TEXT,
    place_of_birth TEXT,
    country_of_birth TEXT,
    nationality TEXT,
    passport_number TEXT,
    residential_address TEXT,
    email TEXT,
    phone TEXT,
    appointment_date TEXT,
    authorities TEXT,
    restrictions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for branch_registration_data
ALTER TABLE branch_registration_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own branch registration data" ON branch_registration_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branch registration data" ON branch_registration_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branch registration data" ON branch_registration_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branch registration data" ON branch_registration_data
    FOR DELETE USING (auth.uid() = user_id); 