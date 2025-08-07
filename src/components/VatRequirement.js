import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseClient'; // Import supabase client

const VatRequirement = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState({
    // Basic company info
    companyName: '',
    companyType: '',
    baseLocation: '',
    startDate: '',
    businessActivity: '',
    
    // Additional company details
    regNumber: '',
    legalForm: '',
    vatNumber: '',
    registeredAddress: '',
    
    // Contact information
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    
    // Directors and shareholders
    directors: [],
    shareholders: [],
    
    // User profile data
    userName: '',
    userEmail: '',
    userPhone: '',
    userAddress: '',
    userCountry: '',
    
    // Target companies (if any)
    targetCompanies: []
  });

  // Form state for VAT registration
  const [vatFormData, setVatFormData] = useState({
    registrationReasons: [],
    hasVatIdOwnCountry: null,
    vatIdOwnCountry: '',
    tradeName: '',
    specialActivities: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const navigate = useNavigate();

  // Comprehensive data fetching
  useEffect(() => {
    const fetchAllCompanyData = async () => {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;
        const userId = sessionData.session.user.id;

        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('name, company_name, address, phone, status, email, country')
          .eq('user_id', userId)
          .single();

        // Fetch company info data
        const { data: companyData, error: companyError } = await supabase
          .from('company_info')
          .select('company_type, base_location, incorporation_date, business_activity, reg_number, legal_form, vat_number, directors, shareholders')
          .eq('user_id', userId)
          .single();

        // Fetch target companies
        const { data: targetCompaniesData, error: targetError } = await supabase
          .from('target_companies')
          .select('company_name, reg_number, vat_number, incorporation_date, base_location, registered_address, directors, shareholders, company_type')
          .eq('user_id', userId);

        // Parse directors and shareholders with error handling
        let directors = [];
        let shareholders = [];
        let targetCompanies = [];

        try {
          if (companyData?.directors) {
            directors = typeof companyData.directors === 'string' 
              ? JSON.parse(companyData.directors) 
              : companyData.directors;
          }
        } catch (e) {
          console.warn('Error parsing directors:', e);
          directors = [];
        }

        try {
          if (companyData?.shareholders) {
            shareholders = typeof companyData.shareholders === 'string' 
              ? JSON.parse(companyData.shareholders) 
              : companyData.shareholders;
          }
        } catch (e) {
          console.warn('Error parsing shareholders:', e);
          shareholders = [];
        }

        // Process target companies
        if (targetCompaniesData && targetCompaniesData.length > 0) {
          targetCompanies = targetCompaniesData.map(company => {
            let companyDirectors = [];
            let companyShareholders = [];
            
            try {
              if (company.directors && company.directors !== 'null' && company.directors !== '') {
                companyDirectors = typeof company.directors === 'string' 
                  ? JSON.parse(company.directors) 
                  : company.directors;
              }
            } catch (e) {
              console.warn('Error parsing target company directors:', e);
            }

            try {
              if (company.shareholders && company.shareholders !== 'null' && company.shareholders !== '') {
                companyShareholders = typeof company.shareholders === 'string' 
                  ? JSON.parse(company.shareholders) 
                  : company.shareholders;
              }
            } catch (e) {
              console.warn('Error parsing target company shareholders:', e);
            }

            return {
              name: company.company_name || '',
              reg_number: company.reg_number || '',
              vat_number: company.vat_number || '',
              incorporation_date: company.incorporation_date || '',
              country: company.base_location || '',
              address: company.registered_address || '',
              directors: companyDirectors,
              shareholders: companyShareholders,
              company_type: company.company_type || 'ebranch'
            };
          });
        }

        // Consolidate all data
        setCompanyData({
          // Basic company info
          companyName: userData?.company_name || companyData?.company_name || '',
          companyType: companyData?.company_type || '',
          baseLocation: companyData?.base_location || userData?.country || '',
          startDate: companyData?.incorporation_date || '',
          businessActivity: companyData?.business_activity || '',
          
          // Additional company details
          regNumber: companyData?.reg_number || '',
          legalForm: companyData?.legal_form || '',
          vatNumber: companyData?.vat_number || '',
          registeredAddress: userData?.address || '',
          
          // Contact information
          contactPerson: userData?.name || '',
          contactEmail: userData?.email || '',
          contactPhone: userData?.phone || '',
          
          // Directors and shareholders
          directors: directors,
          shareholders: shareholders,
          
          // User profile data
          userName: userData?.name || '',
          userEmail: userData?.email || '',
          userPhone: userData?.phone || '',
          userAddress: userData?.address || '',
          userCountry: userData?.country || companyData?.base_location || '',
          
          // Target companies
          targetCompanies: targetCompanies
        });

        // Fetch existing VAT registration data
        await fetchExistingVatRegistration();

      } catch (err) {
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCompanyData();
  }, []);

    // State to track existing VAT registration
  const [existingVatRegistration, setExistingVatRegistration] = useState(null);

  // Function to fetch existing VAT registration
  const fetchExistingVatRegistration = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;

        const userId = sessionData.session.user.id;

      // Fetch existing VAT registration for this user
      const { data, error } = await supabase
        .from('vat_registrations')
        .select('*')
          .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching existing VAT registration:', error);
        return;
      }

      if (data && data.length > 0) {
        setExistingVatRegistration(data[0]);
        console.log('Found existing VAT registration:', data[0]);
        
        // Pre-fill form with existing data
        if (data[0].form_data) {
          const existingFormData = data[0].form_data;
          if (existingFormData.vatFormData) {
            setVatFormData(existingFormData.vatFormData);
          }
        }
      }
      } catch (err) {
      console.error('Error fetching existing VAT registration:', err);
    }
  };

  // Function to save VAT registration as draft
  const saveVatRegistrationAsDraft = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      
        const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error('No user session found');
      }

        const userId = sessionData.session.user.id;

      // Prepare the VAT registration data
      const vatRegistrationData = {
        user_id: userId,
        status: 'draft',
        company_name: companyData.companyName,
        company_type: companyData.companyType,
        legal_form: companyData.legalForm,
        reg_number: companyData.regNumber,
        vat_number_existing: companyData.vatNumber,
        base_location: companyData.baseLocation,
        registered_address: companyData.registeredAddress,
        incorporation_date: companyData.startDate,
        business_activity: companyData.businessActivity,
        special_activities: vatFormData.specialActivities,
        contact_person: vatFormData.contactPerson || companyData.contactPerson,
        contact_email: vatFormData.contactEmail || companyData.contactEmail,
        contact_phone: vatFormData.contactPhone || companyData.contactPhone,
        registration_reasons: vatFormData.registrationReasons,
        has_vat_id_own_country: vatFormData.hasVatIdOwnCountry,
        vat_id_own_country: vatFormData.vatIdOwnCountry,
        trade_name: vatFormData.tradeName,
        directors: companyData.directors,
        shareholders: companyData.shareholders,
        target_companies: companyData.targetCompanies,
        form_data: {
          companyData,
          vatFormData
        }
      };

      let result;

      // If existing registration exists, update it; otherwise insert new
      if (existingVatRegistration) {
        console.log('Updating existing VAT registration:', existingVatRegistration.id);
        
        const { data, error } = await supabase
          .from('vat_registrations')
          .update(vatRegistrationData)
          .eq('id', existingVatRegistration.id)
          .select();

        if (error) {
          console.error('Error updating VAT registration:', error);
          throw error;
        }

        result = data;
        setSaveMessage('VAT registration updated successfully!');
      } else {
        console.log('Creating new VAT registration');
        
        const { data, error } = await supabase
          .from('vat_registrations')
          .insert([vatRegistrationData])
          .select();

        if (error) {
          console.error('Error saving VAT registration:', error);
          throw error;
        }

        result = data;
        setExistingVatRegistration(data[0]); // Set the new record as existing
        setSaveMessage('VAT registration saved as draft successfully!');
      }

      console.log('VAT registration operation completed:', result);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);

      } catch (err) {
      console.error('Error saving VAT registration:', err);
      setSaveMessage('Failed to save VAT registration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

    // Function to submit VAT registration
  const submitVatRegistration = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      
        const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error('No user session found');
      }

        const userId = sessionData.session.user.id;

      // Prepare the VAT registration data
      const vatRegistrationData = {
        user_id: userId,
        status: 'submitted',
        submission_date: new Date().toISOString(),
        company_name: companyData.companyName,
        company_type: companyData.companyType,
        legal_form: companyData.legalForm,
        reg_number: companyData.regNumber,
        vat_number_existing: companyData.vatNumber,
        base_location: companyData.baseLocation,
        registered_address: companyData.registeredAddress,
        incorporation_date: companyData.startDate,
        business_activity: companyData.businessActivity,
        special_activities: vatFormData.specialActivities,
        contact_person: vatFormData.contactPerson || companyData.contactPerson,
        contact_email: vatFormData.contactEmail || companyData.contactEmail,
        contact_phone: vatFormData.contactPhone || companyData.contactPhone,
        registration_reasons: vatFormData.registrationReasons,
        has_vat_id_own_country: vatFormData.hasVatIdOwnCountry,
        vat_id_own_country: vatFormData.vatIdOwnCountry,
        trade_name: vatFormData.tradeName,
        directors: companyData.directors,
        shareholders: companyData.shareholders,
        target_companies: companyData.targetCompanies,
        form_data: {
          companyData,
          vatFormData
        }
      };

      let result;

      // If existing registration exists, update it; otherwise insert new
      if (existingVatRegistration) {
        console.log('Updating existing VAT registration for submission:', existingVatRegistration.id);
        
        const { data, error } = await supabase
          .from('vat_registrations')
          .update(vatRegistrationData)
          .eq('id', existingVatRegistration.id)
          .select();

        if (error) {
          console.error('Error updating VAT registration:', error);
          throw error;
        }

        result = data;
        setSaveMessage('VAT registration submitted successfully!');
      } else {
        console.log('Creating new VAT registration for submission');
        
        const { data, error } = await supabase
          .from('vat_registrations')
          .insert([vatRegistrationData])
          .select();

        if (error) {
          console.error('Error submitting VAT registration:', error);
          throw error;
        }

        result = data;
        setExistingVatRegistration(data[0]); // Set the new record as existing
        setSaveMessage('VAT registration submitted successfully!');
      }

      console.log('VAT registration submission completed:', result);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);

      // Redirect to /vat after successful submission
      navigate('/vat');

      } catch (err) {
      console.error('Error submitting VAT registration:', err);
      setSaveMessage('Failed to submit VAT registration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Function to fetch existing VAT registrations
  const fetchVatRegistrations = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;

        const userId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from('vat_registrations')
        .select('*')
          .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching VAT registrations:', error);
        return;
      }

      console.log('Fetched VAT registrations:', data);
      return data;
      } catch (err) {
      console.error('Error fetching VAT registrations:', err);
    }
  };

  // Function to update form data
  const updateVatFormData = (field, value) => {
    setVatFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to handle registration reasons
  const handleRegistrationReason = (reason) => {
    setVatFormData(prev => ({
      ...prev,
      registrationReasons: prev.registrationReasons.includes(reason)
        ? prev.registrationReasons.filter(r => r !== reason)
        : [...prev.registrationReasons, reason]
    }));
  };

  // Function to handle VAT ID own country selection
  const handleVatIdOwnCountryChange = (hasVatId) => {
    setVatFormData(prev => ({
      ...prev,
      hasVatIdOwnCountry: hasVatId,
      // Auto-populate VAT ID with existing company VAT number when "Yes" is selected
      vatIdOwnCountry: hasVatId ? (prev.vatIdOwnCountry || companyData.vatNumber || '') : ''
    }));
  };

  const steps = [
    'Requirements Overview',
    'Import Data',
    'Company Info',
    'VAT Details',
    'Review & Submit'
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1A1A4A 0%, #12123A 100%)',
        padding: '48px 0',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#23234a',
          borderRadius: 18,
          padding: '40px 32px',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Loading company information...</div>
          <div style={{ color: '#bfc6e0', fontSize: 14, marginTop: 8 }}>
            Fetching your company details and preparing the VAT registration form
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A4A 0%, #12123A 100%)',
      padding: '48px 0',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        background: '#23234a',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(59,130,246,0.08)',
        padding: '40px 32px',
        color: '#fff'
      }}>
        {/* Stepper */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          marginBottom: 32,
          fontSize: 16,
          fontWeight: 600
        }}>
          {steps.map((label, idx) => (
            <div
              key={label}
              style={{
                color: currentStep === idx ? '#3b82f6' : '#bfc6e0',
                fontWeight: currentStep === idx ? 700 : 600,
                borderBottom: currentStep === idx ? '2px solid #3b82f6' : 'none',
                paddingBottom: 2
              }}
            >
              {idx + 1}. {label}
            </div>
          ))}
        </div>

       
        {currentStep === 0 && (
          <>
           
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
              <div style={{
                background: '#18183a',
                borderRadius: 12,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                color: '#fff'
              }}>
                <span style={{ fontSize: 24, color: '#3b82f6' }}>ℹ️</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 16 }}>VAT ID Registration Requirements</div>
                  <div style={{ color: '#bfc6e0', fontSize: 15, marginTop: 4 }}>
                    Before proceeding with your VAT ID registration in the Netherlands, please ensure you have the following documents and information ready.
                  </div>
                </div>
              </div>
              <div style={{
                background: '#18183a',
                borderRadius: 12,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                color: '#fff'
              }}>
                <span style={{ fontSize: 24, color: '#3b82f6' }}>🌀</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 16 }}>Simplified Registration Process</div>
                  <div style={{ color: '#bfc6e0', fontSize: 15, marginTop: 4 }}>
                    Our system will help you complete the required Tax Office registration forms by:
                    <ul style={{ margin: '8px 0 0 16px', color: '#22c55e', fontSize: 14 }}>
                      <li>Importing data from your base company information</li>
                      <li>Scanning and extracting information from uploaded documents</li>
                      <li>Automatically generating all required forms</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div style={{
                background: '#18183a',
                borderRadius: 12,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                color: '#fff'
              }}>
                <span style={{ fontSize: 24, color: '#3b82f6' }}>⏳</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 16 }}>Timeline Overview</div>
                  <div style={{ color: '#bfc6e0', fontSize: 15, marginTop: 4 }}>
                    The VAT ID registration process typically takes 10-21 business days from submission of all required documents to formal registration.
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        background: '#10b981',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '2px 10px',
                        fontWeight: 600,
                        fontSize: 13
                      }}>✔ eBranch Plan Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          
            <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#3b82f6', marginBottom: 18 }}>Required Documents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{
                    background: '#23234a',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <span style={{ fontSize: 22, color: '#3b82f6' }}>📄</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Applicant company documents</div>
                      <div style={{ color: '#bfc6e0', fontSize: 14 }}>Certificate of incorporation, articles of association</div>
                    </div>
                  </div>
                  <div style={{
                    background: '#23234a',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <span style={{ fontSize: 22, color: '#3b82f6' }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Proof of address</div>
                      <div style={{ color: '#bfc6e0', fontSize: 14 }}>Business address verification</div>
                    </div>
                  </div>
                  <div style={{
                    background: '#23234a',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <span style={{ fontSize: 22, color: '#3b82f6' }}>🧑‍💼</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Director identification</div>
                      <div style={{ color: '#bfc6e0', fontSize: 14 }}>Passport copies of directors and representatives</div>
                    </div>
                  </div>
                  <div style={{
                    background: '#23234a',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <span style={{ fontSize: 22, color: '#3b82f6' }}>🌐</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Business activities</div>
                      <div style={{ color: '#bfc6e0', fontSize: 14 }}>Description of planned activities in the Netherlands</div>
                    </div>
                  </div>
                </div>
              </div>
             
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#3b82f6', marginBottom: 18 }}>Forms We'll Generate</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{
                    background: '#23234a',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <span style={{ fontSize: 22, color: '#3b82f6' }}>📝</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Application VAT Number</div>
                      <div style={{ color: '#bfc6e0', fontSize: 14 }}>Belastingdienst.nl registration form</div>
                    </div>
                  </div>
                  <div style={{
                    background: '#23234a',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <span style={{ fontSize: 22, color: '#3b82f6' }}>🔄</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Process Overview</div>
                      <div style={{ color: '#22c55e', fontSize: 14 }}>
                        <ul style={{ margin: '8px 0 0 16px' }}>
                          <li>Information gathering and document preparation (1-2 days)</li>
                          <li>Document verification (1-2 days)</li>
                          <li>Tax authority registration (10-21 days)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          
            <div style={{ textAlign: 'right', marginTop: 32 }}>
              <button
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 32px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)'
                }}
                onClick={() => setCurrentStep(1)}
              >
                Continue to Registration
              </button>
            </div>
          </>
        )}

       
        {currentStep === 1 && (
          <>
            <div style={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: 16,
              padding: '22px 32px',
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 36,
              textAlign: 'center'
            }}>
              Let's make the registration process easier by importing your data. Choose one of the options below to get started.
            </div>
            <div style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center'
            }}>
             
              <div style={{
                background: '#23234a',
                borderRadius: 20,
                boxShadow: '0 2px 16px rgba(59,130,246,0.10)',
                padding: '38px 32px 28px 32px',
                width: 420,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#2563eb',
                  borderRadius: '50%',
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18
                }}>
                  <span style={{ fontSize: 32 }}>🏢</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Import from Base Company</div>
                <div style={{ color: '#bfc6e0', fontSize: 16, marginBottom: 18 }}>
                  We'll use information from your existing company profile to pre-fill the registration forms.
                </div>
                <ul style={{ color: '#22c55e', fontSize: 15, marginBottom: 22, paddingLeft: 0, listStyle: 'none' }}>
                  <li style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>📄</span>
                    Company details automatically imported
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>👥</span>
                    Directors and shareholders information pre-filled
                  </li>
                  <li>
                    <span style={{ marginRight: 8 }}>✔️</span>
                    Faster registration process
                  </li>
                </ul>
                <button style={{
                  background: 'linear-gradient(90deg,#2563eb 0%,#3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '16px 0',
                  width: '100%',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
                  onClick={() => setCurrentStep(2)}
                >
                  Import from Base Company &nbsp; →
                </button>
              </div>
             
              <div style={{
                background: '#23234a',
                borderRadius: 20,
                boxShadow: '0 2px 16px rgba(59,130,246,0.10)',
                padding: '38px 32px 28px 32px',
                width: 420,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  background: '#2563eb',
                  borderRadius: '50%',
                  width: 64,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18
                }}>
                  <span style={{ fontSize: 32 }}>⬆️</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Upload Documents</div>
                <div style={{ color: '#bfc6e0', fontSize: 16, marginBottom: 18 }}>
                  Upload key documents and we'll extract the information to help pre-fill your registration forms.
                </div>
                <ul style={{ color: '#22c55e', fontSize: 15, marginBottom: 22, paddingLeft: 0, listStyle: 'none' }}>
                  <li style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>📄</span>
                    Upload passport copies
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>📄</span>
                    Upload company extract
                  </li>
                  <li>
                    <span style={{ marginRight: 8 }}>✔️</span>
                    AI-powered data extraction
                  </li>
                </ul>
                <button style={{
                  background: 'linear-gradient(90deg,#2563eb 0%,#3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '16px 0',
                  width: '100%',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
                  onClick={() => setCurrentStep(2)}
                >
                  Upload Documents &nbsp; →
                </button>
              </div>
            </div>
          </>
        )}

       
        {currentStep === 2 && (
          <div style={{
            background: '#23234a',
            borderRadius: 16,
            padding: '32px',
            color: '#fff'
          }}>
            
            <div style={{
              background: '#2563eb',
              borderRadius: 10,
              padding: '16px 24px',
              color: '#fff',
              marginBottom: 32,
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: 8, fontSize: 20 }}>📝</span>
              VAT Registration Form&nbsp;
              <span style={{ color: '#bfc6e0', fontWeight: 400 }}>
                Please answer the following questions to determine your VAT registration requirements. This information will be used to complete your official VAT registration with the Dutch Tax Administration.
              </span>
            </div>
           
            <div style={{
              background: '#18183a',
              borderRadius: 10,
              padding: '24px',
              marginBottom: 28,
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
            }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8, fontSize: 20 }}>📋</span>
                Reason for Registration
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('VAT refund')}
                    onChange={() => handleRegistrationReason('VAT refund')}
                  />
                  Are you established in a non-EU country and want to apply for a Dutch VAT refund?
                </label>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('VAT return filing')}
                    onChange={() => handleRegistrationReason('VAT return filing')}
                  />
                  Do you want to register for filing a VAT return?
                </label>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('One Stop Shop')}
                    onChange={() => handleRegistrationReason('One Stop Shop')}
                  />
                  Are you established in a non-EU country and want to register to use the One Stop Shop for VAT?
                </label>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('Corporation tax')}
                    onChange={() => handleRegistrationReason('Corporation tax')}
                  />
                  Do you want to register for corporation tax?
                </label>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('Payroll taxes')}
                    onChange={() => handleRegistrationReason('Payroll taxes')}
                  />
                  Do you want to register for payroll taxes?
                </label>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('Transfer tax')}
                    onChange={() => handleRegistrationReason('Transfer tax')}
                  />
                  Do you want to apply for the transfer tax?
                </label>
                <label style={{ display: 'block', marginBottom: 10, color: '#bfc6e0', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: 8 }}
                    checked={vatFormData.registrationReasons.includes('Dividend tax refund')}
                    onChange={() => handleRegistrationReason('Dividend tax refund')}
                  />
                  Do you want to apply for the dividend tax refund?
                </label>
              </div>
            </div>
           
            <div style={{
              background: '#18183a',
              borderRadius: 10,
              padding: '24px',
              marginBottom: 28,
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
            }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8, fontSize: 20 }}>🏢</span>
                Company Details
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Legal name of the company *</label>
                  <input
                    type="text"
                    value={companyData.companyName}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      marginTop: 6,
                      marginBottom: 12,
                      fontSize: 15,
                      background: '#23234a',
                      color: '#fff'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Trade name (if different)</label>
                  <input 
                    type="text" 
                    value={vatFormData.tradeName}
                    onChange={(e) => updateVatFormData('tradeName', e.target.value)}
                    style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                    }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Legal form of the company *</label>
                <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 500 }}>
                    <input type="radio" name="legalForm" style={{ marginRight: 8 }} />
                    Sole proprietorship
                  </label>
                  <label style={{ color: '#bfc6e0', fontWeight: 500 }}>
                    <input type="radio" name="legalForm" style={{ marginRight: 8 }} />
                    Association
                  </label>
                  <label style={{ color: '#bfc6e0', fontWeight: 500 }}>
                    <input type="radio" name="legalForm" style={{ marginRight: 8 }} defaultChecked />
                    Other
                  </label>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Company Type</label>
                  <input
                    type="text"
                    value={companyData.companyType}
                    placeholder="Company type"
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      marginTop: 6,
                      marginBottom: 12,
                      fontSize: 15,
                      background: '#23234a',
                      color: '#fff'
                    }}
                  />
                </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Country of establishment *</label>
                  <input type="text" value={companyData.baseLocation} style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Do you have a VAT identification number in your own country?</label>
                  <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
                    <label style={{ color: '#bfc6e0', fontWeight: 500 }}>
                      <input 
                        type="radio" 
                        name="vatId" 
                        style={{ marginRight: 8 }}
                        checked={vatFormData.hasVatIdOwnCountry === true}
                        onChange={() => handleVatIdOwnCountryChange(true)}
                      />
                      Yes
                    </label>
                    <label style={{ color: '#bfc6e0', fontWeight: 500 }}>
                      <input 
                        type="radio" 
                        name="vatId" 
                        style={{ marginRight: 8 }}
                        checked={vatFormData.hasVatIdOwnCountry === false}
                        onChange={() => handleVatIdOwnCountryChange(false)}
                      />
                      No
                    </label>
                  </div>
                  {vatFormData.hasVatIdOwnCountry === true && (
                    <div>
                      <div style={{
                        marginBottom: 8,
                        fontSize: 14,
                        color: '#bfc6e0',
                        fontWeight: 500
                      }}>
                        VAT Identification Number
                </div>
                      <input 
                        type="text" 
                        placeholder="Enter your VAT ID"
                        value={vatFormData.vatIdOwnCountry || companyData.vatNumber || ''}
                        onChange={(e) => updateVatFormData('vatIdOwnCountry', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: 8,
                          border: '1px solid #334155',
                          marginTop: 4,
                          fontSize: 15,
                          background: '#23234a',
                          color: '#fff'
                        }}
                      />
                      {companyData.vatNumber && !vatFormData.vatIdOwnCountry && (
                        <div style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: '#10b981',
                          fontStyle: 'italic'
                        }}>
                          💡 Auto-filled from your company data
                        </div>
                      )}
                      {vatFormData.vatIdOwnCountry && vatFormData.vatIdOwnCountry !== companyData.vatNumber && (
                        <div style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: '#f59e0b',
                          fontStyle: 'italic'
                        }}>
                          ✏️ Modified from original: {companyData.vatNumber}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button
                style={{
                  background: '#23234a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)'
                }}  
                onClick={() => setCurrentStep(1)}
              >
                ← Back
              </button>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                    opacity: saving ? 0.6 : 1
                  }}
                  onClick={saveVatRegistrationAsDraft}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
                
              <button
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)'
                }}
                onClick={() => setCurrentStep(3)}
              >
                Continue →
              </button>
              </div>
            </div>
          </div>
        )}

      
        {currentStep === 3 && (
          <div style={{
            background: '#23234a',
            borderRadius: 16,
            padding: '32px',
            color: '#fff'
          }}>
            
            <div style={{
              background: '#18183a',
              borderRadius: 10,
              padding: '24px',
              marginBottom: 28,
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
            }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 17, marginBottom: 18 }}>
                VAT Registration Details
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Business Activity *</label>
                  <input type="text" value={companyData.businessActivity} style={{
                    width: '100%',
                   
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Start Date *</label>
                  <input  value={companyData.startDate} style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                  }} />
                </div>
              </div>
              <div>
                <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Special Activities</label>
                <input 
                  type="text" 
                  placeholder="Any special activities (optional)"
                  value={vatFormData.specialActivities}
                  onChange={(e) => updateVatFormData('specialActivities', e.target.value)}
                  style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #334155',
                  marginTop: 6,
                  marginBottom: 12,
                  fontSize: 15,
                  background: '#23234a',
                  color: '#fff'
                  }} 
                />
              </div>
            </div>
           
            <div style={{
              background: '#18183a',
              borderRadius: 10,
              padding: '24px',
              marginBottom: 28,
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
            }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 17, marginBottom: 18 }}>
                Contact Information
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Contact Person *</label>
                  <input 
                    type="text" 
                    value={vatFormData.contactPerson || companyData.contactPerson}
                    onChange={(e) => updateVatFormData('contactPerson', e.target.value)}
                    placeholder="Full name" 
                    style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                    }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Email *</label>
                  <input 
                    type="email" 
                    value={vatFormData.contactEmail || companyData.contactEmail}
                    onChange={(e) => updateVatFormData('contactEmail', e.target.value)}
                    placeholder="Email address" 
                    style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                    }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#bfc6e0', fontWeight: 600, fontSize: 15 }}>Phone *</label>
                  <input 
                    type="tel" 
                    value={vatFormData.contactPhone || companyData.contactPhone}
                    onChange={(e) => updateVatFormData('contactPhone', e.target.value)}
                    placeholder="Phone number" 
                    style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    marginTop: 6,
                    marginBottom: 12,
                    fontSize: 15,
                    background: '#23234a',
                    color: '#fff'
                    }} 
                  />
                </div>
              </div>
            </div>
            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button
                style={{
                  background: '#23234a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)'
                }}
                onClick={() => setCurrentStep(2)}
              >
                ← Back
              </button>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                    opacity: saving ? 0.6 : 1
                  }}
                  onClick={saveVatRegistrationAsDraft}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
                
              <button
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)'
                }}
                onClick={() => setCurrentStep(4)}
              >
                Continue →
              </button>
              </div>
            </div>
          </div>
        )}

      
        {currentStep === 4 && (
          <div style={{
            background: '#23234a',
            borderRadius: 16,
            padding: '32px',
            color: '#fff'
          }}>
            <div style={{
              background: '#2563eb',
              borderRadius: 8,
              padding: '16px 24px',
              marginBottom: 24,
              fontWeight: 600,
              fontSize: 16,
              color: '#fff'
            }}>
              Please review your information before submitting your VAT ID registration application.
            </div>
            <div style={{
              background: '#18183a',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
              padding: '24px 32px',
              marginBottom: 24
            }}>
              <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8, fontSize: 20 }}>📋</span>
                Review Information
              </div>
              
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Company Details</div>
                <div style={{ display: 'flex', gap: 32 }}>
                  <div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500 }}>Company Name</div>
                    <div style={{ color: '#fff' }}>{companyData.companyName || 'Not provided'}</div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500, marginTop: 8 }}>Address</div>
                    <div style={{ color: '#fff' }}>{companyData.registeredAddress || 'Not provided'}</div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500, marginTop: 8 }}>Business Type</div>
                    <div style={{ color: '#fff' }}>{companyData.companyType || 'Not provided'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500 }}>Country</div>
                    <div style={{ color: '#fff' }}>{companyData.baseLocation || 'Not provided'}</div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500, marginTop: 8 }}>Registration Number</div>
                    <div style={{ color: '#fff' }}>{companyData.regNumber || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>VAT Registration Details</div>
                <div>
                  <div style={{ color: '#bfc6e0', fontWeight: 500 }}>Business Activity</div>
                  <div style={{ color: '#fff' }}>{companyData.businessActivity || 'Not provided'}</div>
                  <div style={{ color: '#bfc6e0', fontWeight: 500, marginTop: 8 }}>Start Date</div>
                  <div style={{ color: '#fff' }}>{companyData.startDate || 'Not provided'}</div>
                  <div style={{ color: '#bfc6e0', fontWeight: 500, marginTop: 8 }}>Legal Form</div>
                  <div style={{ color: '#fff' }}>{companyData.legalForm || 'Not provided'}</div>
                </div>
              </div>
            
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Contact Information</div>
                <div style={{ display: 'flex', gap: 32 }}>
                  <div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500 }}>Contact Person</div>
                    <div style={{ color: '#fff' }}>{companyData.contactPerson || 'Not provided'}</div>
                   </div>
                  <div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500 }}>Email</div>
                    <div style={{ color: '#fff' }}>{companyData.contactEmail || 'Not provided'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#bfc6e0', fontWeight: 500 }}>Phone</div>
                    <div style={{ color: '#fff' }}>{companyData.contactPhone || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {companyData.directors && companyData.directors.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Directors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {companyData.directors.map((director, index) => (
                      <div key={index} style={{ 
                        background: '#23234a', 
                        padding: '12px 16px', 
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>
                          {director.fullName || director.name || 'Director ' + (index + 1)}
            </div>
                        {director.position && (
                          <div style={{ color: '#bfc6e0', fontSize: 14 }}>
                            Position: {director.position}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {companyData.shareholders && companyData.shareholders.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Shareholders</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {companyData.shareholders.map((shareholder, index) => (
                      <div key={index} style={{ 
                        background: '#23234a', 
                        padding: '12px 16px', 
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>
                          {shareholder.name || 'Shareholder ' + (index + 1)}
                        </div>
                        {shareholder.percentage && (
                          <div style={{ color: '#bfc6e0', fontSize: 14 }}>
                            Ownership: {shareholder.percentage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {companyData.targetCompanies && companyData.targetCompanies.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Target Companies</div>
                  <div style={{ color: '#bfc6e0', fontSize: 14, marginBottom: 8 }}>
                    The following companies are associated with your account and may be relevant for VAT registration:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {companyData.targetCompanies.map((company, index) => (
                      <div key={index} style={{ 
                        background: '#23234a', 
                        padding: '12px 16px', 
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>
                          {company.name}
                        </div>
                        <div style={{ color: '#bfc6e0', fontSize: 14 }}>
                          {company.country} • {company.company_type}
                        </div>
                        {company.reg_number && (
                          <div style={{ color: '#bfc6e0', fontSize: 12 }}>
                            Reg: {company.reg_number}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {companyData.vatNumber && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Existing VAT Information</div>
                  <div style={{ 
                    background: '#23234a', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ color: '#bfc6e0', fontSize: 14 }}>Current VAT Number</div>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{companyData.vatNumber}</div>
                  </div>
                </div>
              )}

              {vatFormData.hasVatIdOwnCountry === true && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>VAT ID in Own Country</div>
                  <div style={{ 
                    background: '#23234a', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ color: '#bfc6e0', fontSize: 14 }}>VAT Identification Number</div>
                    <div style={{ color: '#fff', fontWeight: 500 }}>
                      {vatFormData.vatIdOwnCountry || companyData.vatNumber || 'Not provided'}
                    </div>
                  </div>
                </div>
              )}

              {vatFormData.registrationReasons && vatFormData.registrationReasons.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Registration Reasons</div>
                  <div style={{ 
                    background: '#23234a', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ color: '#bfc6e0', fontSize: 14 }}>Selected Reasons</div>
                    <div style={{ color: '#fff', fontWeight: 500 }}>
                      {vatFormData.registrationReasons.map((reason, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8, 
                          marginBottom: 4 
                        }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{
              background: '#18183a',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
              padding: '18px 24px',
              marginBottom: 24
            }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: 15, color: '#bfc6e0' }}>
                <input type="checkbox" style={{ marginRight: 12 }} />
                I confirm that all information provided is accurate and complete. I authorize the submission of this VAT registration application.
              </label>
            </div>
           
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
              <button
                style={{
                  background: '#18183a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setCurrentStep(3)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#23234a';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#18183a';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ← Back
              </button>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                    opacity: saving ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={saveVatRegistrationAsDraft}
                  disabled={saving}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.target.style.background = '#059669';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.target.style.background = '#10b981';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                
              <button
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                    padding: '12px 28px',
                  fontSize: '1rem',
                  fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.10)',
                    opacity: saving ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={submitVatRegistration}
                  disabled={saving}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.target.style.background = '#1d4ed8';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.target.style.background = '#2563eb';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
            </div>
            
            {saveMessage && (
              <div style={{
                background: saveMessage.includes('successfully') ? '#10b981' : '#ef4444',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 8,
                marginTop: 16,
                textAlign: 'center',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {saveMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VatRequirement;