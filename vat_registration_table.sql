-- VAT Registration Table for Supabase
-- This table stores all VAT registration application data

CREATE TABLE IF NOT EXISTS vat_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'pending')),
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submission_date TIMESTAMP WITH TIME ZONE,
    
    -- Company Information
    company_name VARCHAR(255) NOT NULL,
    company_type VARCHAR(100),
    legal_form VARCHAR(100),
    reg_number VARCHAR(100),
    vat_number_existing VARCHAR(100),
    base_location VARCHAR(100),
    registered_address TEXT,
    incorporation_date DATE,
    business_activity TEXT,
    special_activities TEXT,
    
    -- Contact Information
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- VAT Registration Details
    registration_reasons JSONB, -- Array of selected reasons
    has_vat_id_own_country BOOLEAN,
    vat_id_own_country VARCHAR(100),
    trade_name VARCHAR(255),
    
    -- Directors and Shareholders
    directors JSONB, -- Array of director objects
    shareholders JSONB, -- Array of shareholder objects
    
    -- Target Companies (if applicable)
    target_companies JSONB, -- Array of target company objects
    
    -- Form Data
    form_data JSONB, -- Store complete form data for flexibility
    
    -- Processing Information
    processing_notes TEXT,
    assigned_agent VARCHAR(255),
    estimated_completion_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    source_company_id UUID, -- Reference to company_info if imported from existing company
    application_version VARCHAR(20) DEFAULT '1.0',
    
    -- Constraints
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (contact_phone ~* '^[+]?[0-9\s\-\(\)]+$')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vat_registrations_user_id ON vat_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_vat_registrations_status ON vat_registrations(status);
CREATE INDEX IF NOT EXISTS idx_vat_registrations_application_date ON vat_registrations(application_date);
CREATE INDEX IF NOT EXISTS idx_vat_registrations_company_name ON vat_registrations(company_name);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_vat_registrations_updated_at 
    BEFORE UPDATE ON vat_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE vat_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own VAT registrations" ON vat_registrations;
DROP POLICY IF EXISTS "Users can insert their own VAT registrations" ON vat_registrations;
DROP POLICY IF EXISTS "Users can update their own VAT registrations" ON vat_registrations;
DROP POLICY IF EXISTS "Users can delete their own VAT registrations" ON vat_registrations;

-- Create RLS policies with proper naming and conditions
CREATE POLICY "Users can view their own VAT registrations" ON vat_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own VAT registrations" ON vat_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VAT registrations" ON vat_registrations
    FOR UPDATE USING (auth.uid() = user_id);

-- Enhanced delete policy with additional conditions
CREATE POLICY "Users can delete their own VAT registrations" ON vat_registrations
    FOR DELETE USING (
        auth.uid() = user_id AND 
        status IN ('draft', 'pending') -- Only allow deletion of drafts or pending applications
    );

-- Alternative: More permissive delete policy (if you want to allow deletion of all user's records)
-- CREATE POLICY "Users can delete their own VAT registrations" ON vat_registrations
--     FOR DELETE USING (auth.uid() = user_id);

-- Create a view for easier querying
CREATE OR REPLACE VIEW vat_registrations_summary AS
SELECT 
    id,
    user_id,
    status,
    application_date,
    company_name,
    company_type,
    base_location,
    contact_person,
    contact_email,
    business_activity,
    created_at,
    updated_at
FROM vat_registrations;

-- Grant permissions
GRANT ALL ON vat_registrations TO authenticated;
GRANT SELECT ON vat_registrations_summary TO authenticated;

-- Comments for documentation
COMMENT ON TABLE vat_registrations IS 'Stores VAT registration applications with all associated data';
COMMENT ON COLUMN vat_registrations.registration_reasons IS 'JSON array of selected registration reasons (e.g., ["VAT refund", "VAT return filing"])';
COMMENT ON COLUMN vat_registrations.directors IS 'JSON array of director objects with name, position, etc.';
COMMENT ON COLUMN vat_registrations.shareholders IS 'JSON array of shareholder objects with name, percentage, etc.';
COMMENT ON COLUMN vat_registrations.target_companies IS 'JSON array of associated target companies';
COMMENT ON COLUMN vat_registrations.form_data IS 'Complete form data stored as JSON for flexibility'; 