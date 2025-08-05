import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaTimes, FaInfoCircle, FaCog, FaClock, FaCheck, FaMapMarkerAlt, FaUsers, FaFileAlt, FaGlobe, FaShieldAlt, FaUpload, FaArrowRight, FaCalendar } from 'react-icons/fa';
import { supabase } from './SupabaseClient';
import './BranchRegistrationRequirements.css';

const BranchRegistrationRequirements = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;
  const [companyData, setCompanyData] = useState({
    company_name: '',
    legal_form: '',
    reg_number: '',
    vat_number: '',
    foreign_register_name: '',
    foreign_registering_institution: '',
    formally_registered_since: '',
    registered_office: '',
    principal_place_of_business: '',
    issued_capital: '',
    trade_names: '',
    activities_description: '',
    main_activity: '',
    country_of_incorporation: '',
    foreign_registration_location: '',
    is_eea: true
  });

  const [branchData, setBranchData] = useState({
    branch_starting_date: '',
    is_continuation_of_existing_branch: false,
    branch_address: '',
    branch_city: '',
    branch_postal_code: '',
    separate_postal_address: false,
    branch_phone: '',
    branch_website: '',
    branch_email: '',
    message_box_name: '',
    full_time_employees: 0,
    part_time_employees: 0
  });

  const [officialsData, setOfficialsData] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedFormSection, setExpandedFormSection] = useState(null);
  const [uploading, setUploading] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(false);

  const steps = [
    { id: 1, name: 'Requirements', active: currentStep >= 1 },
    { id: 2, name: 'Import Data', active: currentStep >= 2 },
    { id: 3, name: 'Company Info', active: currentStep >= 3 },
    { id: 4, name: 'Branch Info', active: currentStep >= 4 },
    { id: 5, name: 'Officials', active: currentStep >= 5 },
    { id: 6, name: 'Overview', active: currentStep >= 6 },
    { id: 7, name: 'Analysis', active: currentStep >= 7 },
    { id: 8, name: 'Forms', active: currentStep >= 8 },
    { id: 9, name: 'Shipping', active: currentStep >= 9 }
  ];

  const handleClose = () => {
    navigate('/corporate-hub');
  };

  const handleBack = () => {
    navigate('/corporate-hub');
  };

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Fetch company data when reaching step 3
  useEffect(() => {
    if (currentStep === 3) {
      fetchCompanyData();
    }
  }, [currentStep]);

  // Fetch branch data when reaching step 4
  useEffect(() => {
    if (currentStep === 4) {
      fetchBranchData();
    }
  }, [currentStep]);

  // Fetch officials data when reaching step 5
  useEffect(() => {
    if (currentStep === 5) {
      fetchOfficialsData();
      fetchDirectors();
    }
  }, [currentStep]);

  // Start analysis when reaching step 7
  useEffect(() => {
    if (currentStep === 7) {
      startAnalysis();
    }
  }, [currentStep]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Fetch from branch_registration_data table
      const { data: branchData, error: branchError } = await supabase
        .from('branch_registration_data')
        .select('company_name, legal_form, reg_number, vat_number, foreign_register_name, foreign_registering_institution, formally_registered_since, registered_office, principal_place_of_business, issued_capital, trade_names, activities_description, main_activity, country_of_incorporation, foreign_registration_location, is_eea')
        .eq('user_id', userId)
        .single();

      // Fetch from user_profiles for fallback data
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('name, company_name, address, phone, status, email, country')
        .eq('user_id', userId)
        .single();

      // Fetch from company_info for fallback data
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('reg_number, incorporation_date, business_activity, legal_form, vat_number, directors, shareholders, base_location')
        .eq('user_id', userId)
        .single();

      if (branchError && branchError.code !== 'PGRST116') throw branchError;
      if (userError && userError.code !== 'PGRST116') throw userError;
      if (companyError && companyError.code !== 'PGRST116') throw companyError;

      // Map the data to form fields, using branch data if available, otherwise fallback data
      setCompanyData({
        company_name: branchData?.company_name || userData?.company_name || 'Not set',
        legal_form: branchData?.legal_form || companyData?.legal_form || 'Not set',
        reg_number: branchData?.reg_number || companyData?.reg_number || 'Not set',
        vat_number: branchData?.vat_number || companyData?.vat_number || 'Not set',
        foreign_register_name: branchData?.foreign_register_name || 'Not set',
        foreign_registering_institution: branchData?.foreign_registering_institution || 'Not set',
        formally_registered_since: branchData?.formally_registered_since || companyData?.incorporation_date || 'Not set',
        registered_office: branchData?.registered_office || userData?.address || 'Not set',
        principal_place_of_business: branchData?.principal_place_of_business || userData?.address || 'Not set',
        issued_capital: branchData?.issued_capital || 'Not set',
        trade_names: branchData?.trade_names || userData?.company_name || 'Not set',
        activities_description: branchData?.activities_description || companyData?.business_activity || 'Not set',
        main_activity: branchData?.main_activity || companyData?.business_activity || 'Not set',
        country_of_incorporation: branchData?.country_of_incorporation || companyData?.base_location || userData?.country || 'Not set',
        foreign_registration_location: branchData?.foreign_registration_location || 'Not set',
        is_eea: branchData?.is_eea !== undefined ? branchData.is_eea : true
      });

    } catch (err) {
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchData = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Fetch from branch_registration_data
      const { data: branchData, error: branchError } = await supabase
        .from('branch_registration_data')
        .select('branch_starting_date, is_continuation_of_existing_branch, branch_address, branch_city, branch_postal_code, separate_postal_address, branch_phone, branch_website, branch_email, message_box_name, full_time_employees, part_time_employees')
        .eq('user_id', userId)
        .single();

      // Fetch from user_profiles for fallback contact info
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('phone, email, address')
        .eq('user_id', userId)
        .single();

      if (branchError && branchError.code !== 'PGRST116') throw branchError;
      if (userError && userError.code !== 'PGRST116') throw userError;

      // Map the data to form fields, using branch data if available, otherwise user data
      setBranchData({
        branch_starting_date: branchData?.branch_starting_date || '',
        is_continuation_of_existing_branch: branchData?.is_continuation_of_existing_branch || false,
        branch_address: branchData?.branch_address || userData?.address || '',
        branch_city: branchData?.branch_city || '',
        branch_postal_code: branchData?.branch_postal_code || '',
        separate_postal_address: branchData?.separate_postal_address || false,
        branch_phone: branchData?.branch_phone || userData?.phone || '',
        branch_website: branchData?.branch_website || '',
        branch_email: branchData?.branch_email || userData?.email || '',
        message_box_name: branchData?.message_box_name || '',
        full_time_employees: branchData?.full_time_employees || 0,
        part_time_employees: branchData?.part_time_employees || 0
      });

    } catch (err) {
      console.error('Error fetching branch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectors = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      const { data: companyData, error } = await supabase
        .from('company_info')
        .select('directors')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      let directorsArr = [];
      if (companyData?.directors) {
        directorsArr = typeof companyData.directors === 'string'
          ? JSON.parse(companyData.directors)
          : companyData.directors;
      }
      setDirectors(directorsArr);
    } catch (err) {
      console.error('Error fetching directors:', err);
      setDirectors([]);
    }
  };

  const fetchOfficialsData = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Fetch directors from company_info to get the current number of directors
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('directors')
        .eq('user_id', userId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') throw companyError;

      let directorsArr = [];
      if (companyData?.directors) {
        directorsArr = typeof companyData.directors === 'string'
          ? JSON.parse(companyData.directors)
          : companyData.directors;
      }

      // First, try to fetch existing officials data from branch_registration_data
      const { data: branchData, error: branchError } = await supabase
        .from('branch_registration_data')
        .select('officials_data')
        .eq('user_id', userId)
        .single();

      // Check if we have saved officials data and if the number of directors matches
      if (branchData?.officials_data && branchData.officials_data.length > 0) {
        // If the number of officials matches the number of directors, use saved data
        if (branchData.officials_data.length === directorsArr.length) {
          console.log('Using saved officials data from branch_registration_data');
          console.log('Officials data:', branchData.officials_data);
          setOfficialsData(branchData.officials_data);
          return;
        } else {
          console.log('Number of directors changed, regenerating officials data');
        }
      }

      // If no saved data or number of directors changed, fetch from other sources (KYC and company_info)
      console.log('Fetching officials data from KYC and company_info');

      // Initialize officials data array based on number of directors
      const officialsArray = [];
      
      for (let i = 0; i < directorsArr.length; i++) {
        const director = directorsArr[i];
        const directorId = director.email || director.name;
        
        // Fetch KYC documents for this specific director
        const { data: kycDocuments, error: kycError } = await supabase
          .from('kyc_documents')
          .select('*')
          .eq('user_id', userId)
          .eq('doc_type', 'passport')
          .eq('representative_id', directorId);

        const { data: addressDocuments, error: addressError } = await supabase
          .from('kyc_documents')
          .select('*')
          .eq('user_id', userId)
          .eq('doc_type', 'address_proof')
          .eq('representative_id', directorId);

        if (kycError) console.error('Error fetching KYC documents for director:', directorId, kycError);
        if (addressError) console.error('Error fetching address documents for director:', directorId, addressError);

        // Get passport data for this director
        let passportData = null;
        if (kycDocuments && kycDocuments.length > 0) {
          const approvedPassport = kycDocuments.find(doc => 
            doc.status === 'approved' && doc.extracted_data
          );
          if (approvedPassport) {
            passportData = approvedPassport.extracted_data;
          }
        }

        // Get address data for this director
        let addressData = null;
        if (addressDocuments && addressDocuments.length > 0) {
          const addressDoc = addressDocuments.find(doc => 
            doc.extracted_data && doc.extracted_data.address
          );
          if (addressDoc) {
            addressData = addressDoc.extracted_data;
          }
        }

        // Create official data object for this director
        const officialData = {
          id: i,
          director_id: directorId,
          full_name: passportData?.surname && passportData?.given_names 
            ? `${passportData.surname}, ${passportData.given_names}` 
            : director.fullName || director.name || '',
          role: director.role || 'Director',
          date_of_birth: passportData?.date_of_birth || '',
          place_of_birth: passportData?.place_of_birth || '',
          country_of_birth: passportData?.country_code || '',
          nationality: passportData?.nationality || '',
          passport_number: passportData?.passport_number || '',
          residential_address: addressData?.address || '',
          email: director.email || '',
          phone: director.phone || '',
          appointment_date: director.appointedDate || '',
          authorities: 'Full authority to represent the company',
          restrictions: 'None'
        };

        officialsArray.push(officialData);
      }

      setOfficialsData(officialsArray);
      console.log('Officials data array (from KYC/company_info):', officialsArray);

    } catch (err) {
      console.error('Error fetching officials data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBranchInputChange = (field, value) => {
    setBranchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOfficialsInputChange = (index, field, value) => {
    setOfficialsData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleSaveFormData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Check if branch_registration_data record exists
      const { data: existingBranchData, error: checkError } = await supabase
        .from('branch_registration_data')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let branchError;
      if (checkError && checkError.code === 'PGRST116') {
        // Record doesn't exist, insert new
        const { error: insertError } = await supabase
          .from('branch_registration_data')
          .insert({
            user_id: userId,
            company_name: companyData.company_name,
            legal_form: companyData.legal_form,
            reg_number: companyData.reg_number,
            vat_number: companyData.vat_number,
            foreign_register_name: companyData.foreign_register_name,
            foreign_registering_institution: companyData.foreign_registering_institution,
            formally_registered_since: companyData.formally_registered_since,
            registered_office: companyData.registered_office,
            principal_place_of_business: companyData.principal_place_of_business,
            issued_capital: companyData.issued_capital,
            trade_names: companyData.trade_names,
            activities_description: companyData.activities_description,
            main_activity: companyData.main_activity,
            country_of_incorporation: companyData.country_of_incorporation,
            foreign_registration_location: companyData.foreign_registration_location,
            is_eea: companyData.is_eea,
            updated_at: new Date().toISOString()
          });
        branchError = insertError;
      } else if (checkError) {
        throw checkError;
      } else {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('branch_registration_data')
          .update({
            company_name: companyData.company_name,
            legal_form: companyData.legal_form,
            reg_number: companyData.reg_number,
            vat_number: companyData.vat_number,
            foreign_register_name: companyData.foreign_register_name,
            foreign_registering_institution: companyData.foreign_registering_institution,
            formally_registered_since: companyData.formally_registered_since,
            registered_office: companyData.registered_office,
            principal_place_of_business: companyData.principal_place_of_business,
            issued_capital: companyData.issued_capital,
            trade_names: companyData.trade_names,
            activities_description: companyData.activities_description,
            main_activity: companyData.main_activity,
            country_of_incorporation: companyData.country_of_incorporation,
            foreign_registration_location: companyData.foreign_registration_location,
            is_eea: companyData.is_eea,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        branchError = updateError;
      }

      if (branchError) throw branchError;

      // Also update existing tables with relevant data
      const { data: existingCompanyData, error: companyCheckError } = await supabase
        .from('company_info')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let companyError;
      if (companyCheckError && companyCheckError.code === 'PGRST116') {
        // Record doesn't exist, insert new
        const { error: companyInsertError } = await supabase
          .from('company_info')
          .insert({
            user_id: userId,
            company_name: companyData.company_name,
            legal_form: companyData.legal_form,
            reg_number: companyData.reg_number,
            vat_number: companyData.vat_number,
            business_activity: companyData.activities_description,
            base_location: companyData.country_of_incorporation,
            foreign_register_name: companyData.foreign_register_name,
            foreign_registering_institution: companyData.foreign_registering_institution,
            formally_registered_since: companyData.formally_registered_since,
            principal_place_of_business: companyData.principal_place_of_business,
            issued_capital: companyData.issued_capital,
            trade_names: companyData.trade_names,
            activities_description: companyData.activities_description,
            main_activity: companyData.main_activity,
            foreign_registration_location: companyData.foreign_registration_location,
            is_eea: companyData.is_eea
          });
        companyError = companyInsertError;
      } else if (companyCheckError) {
        throw companyCheckError;
      } else {
        // Record exists, update it
        const { error: companyUpdateError } = await supabase
          .from('company_info')
          .update({
            company_name: companyData.company_name,
            legal_form: companyData.legal_form,
            reg_number: companyData.reg_number,
            vat_number: companyData.vat_number,
            business_activity: companyData.activities_description,
            base_location: companyData.country_of_incorporation,
            foreign_register_name: companyData.foreign_register_name,
            foreign_registering_institution: companyData.foreign_registering_institution,
            formally_registered_since: companyData.formally_registered_since,
            principal_place_of_business: companyData.principal_place_of_business,
            issued_capital: companyData.issued_capital,
            trade_names: companyData.trade_names,
            activities_description: companyData.activities_description,
            main_activity: companyData.main_activity,
            foreign_registration_location: companyData.foreign_registration_location,
            is_eea: companyData.is_eea
          })
          .eq('user_id', userId);
        companyError = companyUpdateError;
      }

      if (companyError) throw companyError;

      // Update user_profiles with address and company name
      const { data: existingUserData, error: userCheckError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let userError;
      if (userCheckError && userCheckError.code === 'PGRST116') {
        // Record doesn't exist, insert new
        const { error: userInsertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            company_name: companyData.company_name,
            address: companyData.registered_office
          });
        userError = userInsertError;
      } else if (userCheckError) {
        throw userCheckError;
      } else {
        // Record exists, update it
        const { error: userUpdateError } = await supabase
          .from('user_profiles')
          .update({
            company_name: companyData.company_name,
            address: companyData.registered_office
          })
          .eq('user_id', userId);
        userError = userUpdateError;
      }

      if (userError) throw userError;

      console.log('Branch registration data saved successfully');
      alert('Form data saved successfully!');
      
    } catch (err) {
      console.error('Error saving branch registration data:', err);
      alert('Error saving data: ' + err.message);
    }
  };

  const handleSaveBranchData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Check if branch_registration_data record exists
      const { data: existingBranchData, error: checkError } = await supabase
        .from('branch_registration_data')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let branchError;
      if (checkError && checkError.code === 'PGRST116') {
        // Record doesn't exist, insert new
        const { error: insertError } = await supabase
          .from('branch_registration_data')
          .insert({
            user_id: userId,
            branch_starting_date: branchData.branch_starting_date,
            is_continuation_of_existing_branch: branchData.is_continuation_of_existing_branch,
            branch_address: branchData.branch_address,
            branch_city: branchData.branch_city,
            branch_postal_code: branchData.branch_postal_code,
            separate_postal_address: branchData.separate_postal_address,
            branch_phone: branchData.branch_phone,
            branch_website: branchData.branch_website,
            branch_email: branchData.branch_email,
            message_box_name: branchData.message_box_name,
            full_time_employees: branchData.full_time_employees,
            part_time_employees: branchData.part_time_employees,
            updated_at: new Date().toISOString()
          });
        branchError = insertError;
      } else if (checkError) {
        throw checkError;
      } else {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('branch_registration_data')
          .update({
            branch_starting_date: branchData.branch_starting_date,
            is_continuation_of_existing_branch: branchData.is_continuation_of_existing_branch,
            branch_address: branchData.branch_address,
            branch_city: branchData.branch_city,
            branch_postal_code: branchData.branch_postal_code,
            separate_postal_address: branchData.separate_postal_address,
            branch_phone: branchData.branch_phone,
            branch_website: branchData.branch_website,
            branch_email: branchData.branch_email,
            message_box_name: branchData.message_box_name,
            full_time_employees: branchData.full_time_employees,
            part_time_employees: branchData.part_time_employees,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        branchError = updateError;
      }

      if (branchError) throw branchError;

      console.log('Branch data saved successfully');
      alert('Branch data saved successfully!');
      
    } catch (err) {
      console.error('Error saving branch data:', err);
      alert('Error saving branch data: ' + err.message);
    }
  };

  const handleSaveOfficialsData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Check if branch_registration_data record exists
      const { data: existingBranchData, error: checkError } = await supabase
        .from('branch_registration_data')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let branchError;
      if (checkError && checkError.code === 'PGRST116') {
        // Record doesn't exist, insert new
        const { error: insertError } = await supabase
          .from('branch_registration_data')
          .insert({
            user_id: userId,
            officials_data: officialsData,
            updated_at: new Date().toISOString()
          });
        branchError = insertError;
      } else if (checkError) {
        throw checkError;
      } else {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('branch_registration_data')
          .update({
            officials_data: officialsData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        branchError = updateError;
      }

      if (branchError) throw branchError;

      console.log('Officials data saved successfully');
      alert('Officials data saved successfully!');
      
    } catch (err) {
      console.error('Error saving officials data:', err);
      alert('Error saving officials data: ' + err.message);
    }
  };

  const startAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisComplete(false);
    
    // Simulate analysis process for 2-3 seconds
    setTimeout(() => {
      setAnalysisLoading(false);
      setAnalysisComplete(true);
    }, 2500);
  };

  const getMissingFields = () => {
    const missingFields = [];
    
    // Check branch information
    if (!branchData.branch_address) missingFields.push('Branch address');
    if (!branchData.branch_city) missingFields.push('Branch city');
    if (!branchData.branch_postal_code) missingFields.push('Branch postal code');
    if (!branchData.branch_starting_date) missingFields.push('Branch starting date');
    if (!branchData.branch_email) missingFields.push('Contact email');
    if (!branchData.branch_phone) missingFields.push('Contact phone');
    
    return missingFields;
  };

  const toggleFormSection = (formId) => {
    setExpandedFormSection(expandedFormSection === formId ? null : formId);
  };

  const handleGenerateForm = (formKey) => {
    switch (formKey) {
      case 'form6':
        navigate('/kvk-registration');
        break;
      case 'form9':
        navigate('/form-9');
        break;
      case 'form11':
        navigate('/form-11');
        break;
      case 'form13':
        navigate('/form-13');
        break;
      default:
        break;
    }
  };

  const handleFileUpload = async (formKey, file) => {
    setUploading(prev => ({ ...prev, [formKey]: true }));
    setUploadError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to upload files');
      const userId = user.id;
      const filePath = `${userId}/${formKey}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('kvk-forms').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
      setUploadedFiles(prev => ({ ...prev, [formKey]: file.name }));

      const { error: dbError } = await supabase
        .from('kvk_signed_forms')
        .insert({
          user_id: userId,
          form_type: formKey,
          file_path: filePath,
          status: 'uploaded',
        });
      if (dbError) throw dbError;
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [formKey]: false }));
    }
  };

  const handleDownloadTemplate = async (formType) => {
    const formTemplates = {
      'form6': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/06-non-resident-legal-entity-company.pdf',
      'form9': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/09-company-branch.pdf',
      'form11': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/11-official-of-a-legal-entity-company.pdf',
      'form13': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/13-form---authorised-representative-business-agent.pdf'
    };

    const url = formTemplates[formType];
    if (!url) {
      console.error('Template URL not found for form type:', formType);
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `KVK-${formType.toUpperCase()}-template.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const getCompletionPercentage = () => {
    const totalForms = 3;
    const uploadedCount = getUploadedCount();
    return Math.round((uploadedCount / totalForms) * 100);
  };

  const getUploadedCount = () => {
    return Object.keys(uploadedFiles).length;
  };

  const toggleCoverLetter = () => {
    setCoverLetterExpanded(!coverLetterExpanded);
  };

  const getShippingProgress = () => {
    // This would be calculated based on actual checklist completion
    // For now, returning 0 as all items are unchecked
    return 0;
  };

  return (
    <div className="branch-reg-page-container">
      {/* Header */}
      <div className="branch-reg-header">
        <div className="branch-reg-header-left">
          <div className="branch-reg-header-icon">
            <FaBuilding />
          </div>
          <div className="branch-reg-header-content">
            <h1 className="branch-reg-header-title">Branch Registration - Netherlands</h1>
            <p className="branch-reg-header-subtitle">{steps[currentStep - 1]?.name || 'Requirements'} - Step {currentStep} of {totalSteps}</p>
          </div>
        </div>
        <button className="branch-reg-close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="branch-reg-progress-container">
        <div className="branch-reg-progress-bar">
          {steps.map((step, index) => (
            <div key={step.id} className={`branch-reg-step ${step.active ? 'branch-reg-step-active' : ''}`}>
              <div className="branch-reg-step-number">{step.id}</div>
              <div className="branch-reg-step-name">{step.name}</div>
            </div>
          ))}
        </div>
      </div>


      {/* Main Content */}
      <div className="branch-reg-content">
        {currentStep === 1 && (
          <>
            <div className="branch-reg-grid">
              {/* Left Column - Required Documents */}
              <div className="branch-reg-column">
                <h2 className="branch-reg-section-title">Required Documents</h2>
                <div className="branch-reg-documents-list">
                  <div className="branch-reg-document-card">
                    <div className="branch-reg-document-icon">
                      <FaBuilding />
                    </div>
                    <div className="branch-reg-document-content">
                      <h3 className="branch-reg-document-title">Parent company documents</h3>
                      <p className="branch-reg-document-desc">Certificate of incorporation, articles of association</p>
                    </div>
                  </div>
                  
                  <div className="branch-reg-document-card">
                    <div className="branch-reg-document-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="branch-reg-document-content">
                      <h3 className="branch-reg-document-title">Proof of address</h3>
                      <p className="branch-reg-document-desc">Business address in the Netherlands</p>
                    </div>
                  </div>
                  
                  <div className="branch-reg-document-card">
                    <div className="branch-reg-document-icon">
                      <FaUsers />
                    </div>
                    <div className="branch-reg-document-content">
                      <h3 className="branch-reg-document-title">Director identification</h3>
                      <p className="branch-reg-document-desc">Passport copies of directors and representatives</p>
                    </div>
                  </div>

                  <div className="branch-reg-document-card">
                    <div className="branch-reg-document-icon">
                      <FaGlobe />
                    </div>
                    <div className="branch-reg-document-content">
                      <h3 className="branch-reg-document-title">Business activities</h3>
                      <p className="branch-reg-document-desc">Description of planned activities in the Netherlands</p>
                    </div>
                  </div>

                  <div className="branch-reg-document-card">
                    <div className="branch-reg-document-icon">
                      <FaShieldAlt />
                    </div>
                    <div className="branch-reg-document-content">
                      <h3 className="branch-reg-document-title">UBO information</h3>
                      <p className="branch-reg-document-desc">Details of Ultimate Beneficial Owners</p>
                    </div>
                  </div>

                  
                </div>
              </div>

              {/* Right Column - Forms We'll Generate */}
              <div className="branch-reg-column">
                <h2 className="branch-reg-section-title">Forms We'll Generate</h2>
                <div className="branch-reg-forms-list">
                  <div className="branch-reg-form-card">
                    <div className="branch-reg-form-icon">
                      <FaFileAlt />
                    </div>
                    <div className="branch-reg-form-content">
                      <h3 className="branch-reg-form-title">Form 6</h3>
                      <p className="branch-reg-form-desc">Registration of a non-resident legal entity</p>
                    </div>
                  </div>
                  
                  <div className="branch-reg-form-card">
                    <div className="branch-reg-form-icon">
                      <FaFileAlt />
                    </div>
                    <div className="branch-reg-form-content">
                      <h3 className="branch-reg-form-title">Form 9</h3>
                      <p className="branch-reg-form-desc">Registration of a branch office</p>
                    </div>
                  </div>
                  
                  <div className="branch-reg-form-card">
                    <div className="branch-reg-form-icon">
                      <FaFileAlt />
                    </div>
                    <div className="branch-reg-form-content">
                      <h3 className="branch-reg-form-title">Form 11</h3>
                      <p className="branch-reg-form-desc">Registration of an official of a legal entity</p>
                    </div>
                  </div>
                </div>
                <div className="branch-reg-form-card">
                    <div className="branch-reg-form-icon">
                       <FaFileAlt />
                     </div>
                    <div className="branch-reg-form-content">
                      <h3 className="branch-reg-form-title">Form 13</h3>
                      <p className="branch-reg-form-desc">Registration of an official of a legal entity</p>
                      </div>
                    </div>

                 <div className="branch-reg-document-card">
                     <div className="branch-reg-document-icon">
                       <FaClock />
                     </div>
                     <div className="branch-reg-document-content">
                       <h3 className="branch-reg-document-title">Process Overview</h3>
                       <ul className="branch-reg-process-list">
                         <li>
                           <FaCheck className="branch-reg-check-icon" />
                           <span>Information gathering and document preparation (1-2 days)</span>
                         </li>
                         <li>
                           <FaCheck className="branch-reg-check-icon" />
                           <span>Document verification (1-2 days)</span>
                         </li>
                         <li>
                           <FaCheck className="branch-reg-check-icon" />
                           <span>Chamber of Commerce registration (3-4 days)</span>
                         </li>
                         <li>
                           <FaCheck className="branch-reg-check-icon" />
                           <span>Tax authority registration (1-2 days)</span>
                         </li>
                       </ul>
                      </div>
                    </div>
              </div>
            </div>

            {/* Additional Information Cards */}
           
          </>
        )}

        {currentStep === 2 && (
          <div className="branch-reg-import-data">
            <div className="branch-reg-import-banner">
              <p>Let's make the registration process easier by importing your data. Choose one of the options below to get started.</p>
            </div>
            
            <div className="branch-reg-import-grid">
              {/* Left Card: Import from Base Company */}
              <div className="branch-reg-import-card">
                <div className="branch-reg-import-icon">
                  <FaBuilding />
                </div>
                <h3 className="branch-reg-import-title">Import from Base Company</h3>
                <p className="branch-reg-import-desc">
                  We'll use information from your existing company profile to pre-fill the registration forms.
                </p>
                <div className="branch-reg-import-benefits">
                  <div className="branch-reg-benefit-item">
                    <FaFileAlt className="branch-reg-benefit-icon" />
                    <span>Company details automatically imported</span>
                  </div>
                  <div className="branch-reg-benefit-item">
                    <FaUsers className="branch-reg-benefit-icon" />
                    <span>Directors and shareholders information pre-filled</span>
                  </div>
                  <div className="branch-reg-benefit-item">
                    <FaCheck className="branch-reg-benefit-icon" />
                    <span>Faster registration process</span>
                  </div>
                </div>
                <button className="branch-reg-import-btn" onClick={() => setCurrentStep(3)}>
                  Import from Base Company
                  <FaArrowRight />
                </button>
              </div>

              {/* Right Card: Upload Documents */}
              <div className="branch-reg-import-card">
                <div className="branch-reg-import-icon">
                  <FaUpload />
                </div>
                <h3 className="branch-reg-import-title">Upload Documents</h3>
                <p className="branch-reg-import-desc">
                  Upload key documents and we'll extract the information to help pre-fill your registration forms.
                </p>
                <div className="branch-reg-import-benefits">
                  <div className="branch-reg-benefit-item">
                    <FaFileAlt className="branch-reg-benefit-icon" />
                    <span>Upload passport copies</span>
                  </div>
                  <div className="branch-reg-benefit-item">
                    <FaFileAlt className="branch-reg-benefit-icon" />
                    <span>Upload company extract</span>
                  </div>
                  <div className="branch-reg-benefit-item">
                    <FaCheck className="branch-reg-benefit-icon" />
                    <span>AI-powered data extraction</span>
                  </div>
                </div>
                <button className="branch-reg-import-btn">
                  Upload Documents
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="branch-reg-company-info">
            <div className="branch-reg-form-container">
              <h2 className="branch-reg-form-title">Legal Entity Information</h2>
              <p className="branch-reg-form-subtitle">Form 6: Registration of a non-resident legal entity</p>
              
              {loading ? (
                <div className="branch-reg-loading">Loading company data...</div>
              ) : (
                <>
                  <div className="branch-reg-form-grid">
                    {/* Left Column */}
                    <div className="branch-reg-form-column">
                      <div className="branch-reg-form-field">
                        <label className="branch-reg-form-label">
                          Company Name <span className="branch-reg-required">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="branch-reg-form-input" 
                          value={companyData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                        />
                      </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Legal Form <span className="branch-reg-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.legal_form}
                      onChange={(e) => handleInputChange('legal_form', e.target.value)}
                    />
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Foreign Registration Number <span className="branch-reg-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.reg_number}
                      onChange={(e) => handleInputChange('reg_number', e.target.value)}
                    />
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Foreign Register Name <span className="branch-reg-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.foreign_register_name}
                      onChange={(e) => handleInputChange('foreign_register_name', e.target.value)}
                    />
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Foreign Registration Location <span className="branch-reg-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.foreign_registration_location}
                      onChange={(e) => handleInputChange('foreign_registration_location', e.target.value)}
                    />
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Country of Incorporation <span className="branch-reg-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.country_of_incorporation}
                      onChange={(e) => handleInputChange('country_of_incorporation', e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="branch-reg-form-column">
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Tax/VAT Number
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.vat_number}
                      onChange={(e) => handleInputChange('vat_number', e.target.value)}
                    />
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Foreign Registering Institution <span className="branch-reg-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="branch-reg-form-input" 
                      value={companyData.foreign_registering_institution}
                      onChange={(e) => handleInputChange('foreign_registering_institution', e.target.value)}
                    />
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Formally Registered Since <span className="branch-reg-required">*</span>
                    </label>
                    <div className="branch-reg-date-input">
                      <input 
                        type="text" 
                        className="branch-reg-form-input" 
                        value={companyData.formally_registered_since}
                        onChange={(e) => handleInputChange('formally_registered_since', e.target.value)}
                        placeholder="mm/dd/yyyy"
                      />
                      <FaCalendar className="branch-reg-calendar-icon" />
                    </div>
                  </div>
                  
                  <div className="branch-reg-form-field">
                    <label className="branch-reg-form-label">
                      Registered Office <span className="branch-reg-required">*</span>
                    </label>
                    <textarea 
                      className="branch-reg-form-textarea" 
                      value={companyData.registered_office}
                      onChange={(e) => handleInputChange('registered_office', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* EEA Checkbox */}
              <div className="branch-reg-checkbox-field">
                <label className="branch-reg-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="branch-reg-checkbox" 
                    checked={companyData.is_eea}
                    onChange={(e) => handleInputChange('is_eea', e.target.checked)}
                  />
                  <span>This company is established within the European Economic Area (EEA)</span>
                </label>
              </div>

              {/* Business Activities Section */}
              <div className="branch-reg-business-section">
                <div className="branch-reg-section-header">
                  <FaGlobe className="branch-reg-section-icon" />
                  <h3 className="branch-reg-section-title">Business Activities</h3>
                </div>
                
                <div className="branch-reg-form-grid">
                  <div className="branch-reg-form-column">
                    <div className="branch-reg-form-field">
                      <label className="branch-reg-form-label">
                        Principal Place of Business <span className="branch-reg-required">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="branch-reg-form-input" 
                        value={companyData.principal_place_of_business}
                        onChange={(e) => handleInputChange('principal_place_of_business', e.target.value)}
                      />
                    </div>
                    
                    <div className="branch-reg-form-field">
                      <label className="branch-reg-form-label">
                        Issued Capital <span className="branch-reg-required">*</span>
                      </label>
                      <div className="branch-reg-currency-input">
                        <select className="branch-reg-currency-select">
                          <option value="EUR">EUR</option>
                        </select>
                        <input 
                          type="text" 
                          className="branch-reg-form-input" 
                          value={companyData.issued_capital}
                          onChange={(e) => handleInputChange('issued_capital', e.target.value)}
                          placeholder="Amount"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="branch-reg-form-column">
                    <div className="branch-reg-form-field">
                      <label className="branch-reg-form-label">
                        Trade Name(s) <span className="branch-reg-required">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="branch-reg-form-input" 
                        value={companyData.trade_names}
                        onChange={(e) => handleInputChange('trade_names', e.target.value)}
                      />
                      <button className="branch-reg-add-btn">+ Add Another Trade Name</button>
                    </div>
                    
                    <div className="branch-reg-form-field">
                      <label className="branch-reg-form-label">
                        Activities Description <span className="branch-reg-required">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="branch-reg-form-input" 
                        value={companyData.activities_description}
                        onChange={(e) => handleInputChange('activities_description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Activity */}
                <div className="branch-reg-form-field">
                  <label className="branch-reg-form-label">
                    Main Activity <span className="branch-reg-required">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="branch-reg-form-input" 
                    value={companyData.main_activity}
                    onChange={(e) => handleInputChange('main_activity', e.target.value)}
                  />
                </div>

                {/* Activity Checkboxes */}
                <div className="branch-reg-activity-checkboxes">
                  <div className="branch-reg-checkbox-column">
                    <label className="branch-reg-checkbox-label">
                      <input type="checkbox" className="branch-reg-checkbox" />
                      <span>Retail Sales to Consumers</span>
                    </label>
                    <label className="branch-reg-checkbox-label">
                      <input type="checkbox" className="branch-reg-checkbox" />
                      <span>Import Activities</span>
                    </label>
                    <label className="branch-reg-checkbox-label">
                      <input type="checkbox" className="branch-reg-checkbox" />
                      <span>Do not send unsolicited mail</span>
                    </label>
                  </div>
                  <div className="branch-reg-checkbox-column">
                    <label className="branch-reg-checkbox-label">
                      <input type="checkbox" className="branch-reg-checkbox" />
                      <span>Wholesale to Other Companies</span>
                    </label>
                    <label className="branch-reg-checkbox-label">
                      <input type="checkbox" className="branch-reg-checkbox" />
                      <span>Export Activities</span>
                    </label>
                    <label className="branch-reg-checkbox-label">
                      <input type="checkbox" className="branch-reg-checkbox" />
                      <span>Company provides temporary workforce</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="branch-reg-form-actions">
                <button 
                  type="button" 
                  className="branch-reg-save-btn"
                  onClick={handleSaveFormData}
                >
                  Save Form Data
                </button>
              </div>
            </>
          )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="branch-reg-branch-info">
            <div className="branch-reg-form-container">
              <div className="branch-reg-info-banner">
                <FaInfoCircle className="branch-reg-info-icon" />
                <p>This section collects information for Form 9: Registration of a branch office. All fields are optional - you can continue without filling them.</p>
              </div>
              
              {loading ? (
                <div className="branch-reg-loading">Loading branch data...</div>
              ) : (
                <>
                  {/* Branch Information Section */}
                  <div className="branch-reg-section-card">
                    <div className="branch-reg-section-header">
                      <FaBuilding className="branch-reg-section-icon" />
                      <h3 className="branch-reg-section-title">Branch Information</h3>
                    </div>
                    
                    <div className="branch-reg-form-grid">
                      <div className="branch-reg-form-column">
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Branch Starting Date
                          </label>
                          <div className="branch-reg-date-input">
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={branchData.branch_starting_date}
                              onChange={(e) => handleBranchInputChange('branch_starting_date', e.target.value)}
                              placeholder="mm/dd/yyyy"
                            />
                            <FaCalendar className="branch-reg-calendar-icon" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="branch-reg-form-column">
                        <div className="branch-reg-checkbox-field">
                          <label className="branch-reg-checkbox-label">
                            <input 
                              type="checkbox" 
                              className="branch-reg-checkbox" 
                              checked={branchData.is_continuation_of_existing_branch}
                              onChange={(e) => handleBranchInputChange('is_continuation_of_existing_branch', e.target.checked)}
                            />
                            <span>This is a continuation of an existing branch</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information Section */}
                  <div className="branch-reg-section-card">
                    <div className="branch-reg-section-header">
                      <FaMapMarkerAlt className="branch-reg-section-icon" />
                      <h3 className="branch-reg-section-title">Address Information</h3>
                    </div>
                    
                    <div className="branch-reg-form-grid">
                      <div className="branch-reg-form-column">
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Branch Address
                          </label>
                          <input 
                            type="text" 
                            className="branch-reg-form-input" 
                            value={branchData.branch_address}
                            onChange={(e) => handleBranchInputChange('branch_address', e.target.value)}
                            placeholder="Street address in the Netherlands"
                          />
                        </div>
                        
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            City
                          </label>
                          <input 
                            type="text" 
                            className="branch-reg-form-input" 
                            value={branchData.branch_city}
                            onChange={(e) => handleBranchInputChange('branch_city', e.target.value)}
                          />
                        </div>
                        
                        <div className="branch-reg-checkbox-field">
                          <label className="branch-reg-checkbox-label">
                            <input 
                              type="checkbox" 
                              className="branch-reg-checkbox" 
                              checked={branchData.separate_postal_address}
                              onChange={(e) => handleBranchInputChange('separate_postal_address', e.target.checked)}
                            />
                            <span>Separate Postal Address</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="branch-reg-form-column">
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Postal Code
                          </label>
                          <input 
                            type="text" 
                            className="branch-reg-form-input" 
                            value={branchData.branch_postal_code}
                            onChange={(e) => handleBranchInputChange('branch_postal_code', e.target.value)}
                            placeholder="e.g., 1000 AA"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="branch-reg-section-card">
                    <div className="branch-reg-section-header">
                      <FaUsers className="branch-reg-section-icon" />
                      <h3 className="branch-reg-section-title">Contact Information</h3>
                    </div>
                    
                    <div className="branch-reg-form-grid">
                      <div className="branch-reg-form-column">
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Phone Number
                          </label>
                          <input 
                            type="text" 
                            className="branch-reg-form-input" 
                            value={branchData.branch_phone}
                            onChange={(e) => handleBranchInputChange('branch_phone', e.target.value)}
                            placeholder="+31 XX XXX XXXX"
                          />
                        </div>
                        
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Website
                          </label>
                          <input 
                            type="text" 
                            className="branch-reg-form-input" 
                            value={branchData.branch_website}
                            onChange={(e) => handleBranchInputChange('branch_website', e.target.value)}
                            placeholder="www.example.com"
                          />
                        </div>
                        
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Number of Full-time Employees
                          </label>
                          <input 
                            type="number" 
                            className="branch-reg-form-input" 
                            value={branchData.full_time_employees}
                            onChange={(e) => handleBranchInputChange('full_time_employees', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      
                      <div className="branch-reg-form-column">
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Email
                          </label>
                          <input 
                            type="email" 
                            className="branch-reg-form-input" 
                            value={branchData.branch_email}
                            onChange={(e) => handleBranchInputChange('branch_email', e.target.value)}
                            placeholder="contact@example.com"
                          />
                        </div>
                        
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Message Box Name
                          </label>
                          <input 
                            type="text" 
                            className="branch-reg-form-input" 
                            value={branchData.message_box_name}
                            onChange={(e) => handleBranchInputChange('message_box_name', e.target.value)}
                            placeholder="For government communications"
                          />
                        </div>
                        
                        <div className="branch-reg-form-field">
                          <label className="branch-reg-form-label">
                            Number of Part-time Employees
                          </label>
                          <input 
                            type="number" 
                            className="branch-reg-form-input" 
                            value={branchData.part_time_employees}
                            onChange={(e) => handleBranchInputChange('part_time_employees', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Button */}
                  <div className="branch-reg-form-actions">
                    <button 
                      type="button" 
                      className="branch-reg-save-btn"
                      onClick={handleSaveBranchData}
                    >
                      Save Branch Data
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="branch-reg-officials">
            <div className="branch-reg-form-container">
              <h2 className="branch-reg-form-title">Officials Information</h2>
              <p className="branch-reg-form-subtitle">Form 13: Registration of an authorized representative</p>
              
              {/* Directors Count Info */}
              <div className="branch-reg-info-banner" style={{ marginBottom: '24px' }}>
                <FaInfoCircle className="branch-reg-info-icon" />
                <p>Number of Directors: {directors?.length || 0} (from company profile)</p>
              </div>
              
              {loading ? (
                <div className="branch-reg-loading">Loading officials data...</div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#D1D5DB' }}>
                      <strong>Debug Info:</strong> Officials Data Length: {officialsData.length} | 
                      Directors Count: {directors?.length || 0}
                    </p>
                  </div>
                  {officialsData.map((official, index) => (
                    <div key={official.id} className="branch-reg-business-section" style={{ marginBottom: '32px' }}>
                      <div className="branch-reg-section-header">
                        <FaUsers className="branch-reg-section-icon" />
                        <h3 className="branch-reg-section-title">Official {index + 1}: {official.full_name || `Director ${index + 1}`}</h3>
                      </div>
                      
                      <div className="branch-reg-form-grid">
                        <div className="branch-reg-form-column">
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Full Name <span className="branch-reg-required">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.full_name}
                              onChange={(e) => handleOfficialsInputChange(index, 'full_name', e.target.value)}
                              placeholder="Enter full name"
                            />
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Role <span className="branch-reg-required">*</span>
                            </label>
                            <select 
                              className="branch-reg-form-input" 
                              value={official.role}
                              onChange={(e) => handleOfficialsInputChange(index, 'role', e.target.value)}
                            >
                              <option value="Director">Director</option>
                              <option value="Manager">Manager</option>
                              <option value="Representative">Representative</option>
                              <option value="Officer">Officer</option>
                            </select>
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Date of Birth <span className="branch-reg-required">*</span>
                            </label>
                            <div className="branch-reg-date-input">
                              <input 
                                type="text" 
                                className="branch-reg-form-input" 
                                value={official.date_of_birth}
                                onChange={(e) => handleOfficialsInputChange(index, 'date_of_birth', e.target.value)}
                                placeholder="mm/dd/yyyy"
                              />
                              <FaCalendar className="branch-reg-calendar-icon" />
                            </div>
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Place of Birth <span className="branch-reg-required">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.place_of_birth}
                              onChange={(e) => handleOfficialsInputChange(index, 'place_of_birth', e.target.value)}
                              placeholder="Enter place of birth"
                            />
                          </div>
                        </div>
                        
                        <div className="branch-reg-form-column">
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Country of Birth <span className="branch-reg-required">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.country_of_birth}
                              onChange={(e) => handleOfficialsInputChange(index, 'country_of_birth', e.target.value)}
                              placeholder="Enter country of birth"
                            />
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Nationality <span className="branch-reg-required">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.nationality}
                              onChange={(e) => handleOfficialsInputChange(index, 'nationality', e.target.value)}
                              placeholder="Enter nationality"
                            />
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Passport Number <span className="branch-reg-required">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.passport_number}
                              onChange={(e) => handleOfficialsInputChange(index, 'passport_number', e.target.value)}
                              placeholder="Enter passport number"
                            />
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Residential Address <span className="branch-reg-required">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.residential_address}
                              onChange={(e) => handleOfficialsInputChange(index, 'residential_address', e.target.value)}
                              placeholder="Enter residential address"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}



                  {/* Authorities Information Section for each official */}
                  {officialsData.map((official, index) => (
                    <div key={`authorities-${official.id}`} className="branch-reg-business-section" style={{ marginBottom: '32px' }}>
                      <div className="branch-reg-section-header">
                        <FaShieldAlt className="branch-reg-section-icon" />
                        <h3 className="branch-reg-section-title">Authorities Information - {official.full_name || `Official ${index + 1}`}</h3>
                      </div>
                      
                      <div className="branch-reg-form-grid">
                        <div className="branch-reg-form-column">
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Appointment Date <span className="branch-reg-required">*</span>
                            </label>
                            <div className="branch-reg-date-input">
                              <input 
                                type="text" 
                                className="branch-reg-form-input" 
                                value={official.appointment_date}
                                onChange={(e) => handleOfficialsInputChange(index, 'appointment_date', e.target.value)}
                                placeholder="mm/dd/yyyy"
                              />
                              <FaCalendar className="branch-reg-calendar-icon" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="branch-reg-form-column">
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Authorities <span className="branch-reg-required">*</span>
                            </label>
                            <select 
                              className="branch-reg-form-input" 
                              value={official.authorities}
                              onChange={(e) => handleOfficialsInputChange(index, 'authorities', e.target.value)}
                            >
                              <option value="Full authority to represent the company">Full authority to represent the company</option>
                              <option value="Limited authority to represent the company">Limited authority to represent the company</option>
                              <option value="No authority to represent the company">No authority to represent the company</option>
                            </select>
                          </div>
                          
                          <div className="branch-reg-form-field">
                            <label className="branch-reg-form-label">
                              Restrictions
                            </label>
                            <input 
                              type="text" 
                              className="branch-reg-form-input" 
                              value={official.restrictions}
                              onChange={(e) => handleOfficialsInputChange(index, 'restrictions', e.target.value)}
                              placeholder="Enter any restrictions"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                   
                  {/* Save Button */}
                  <div className="branch-reg-form-actions">
                    <button 
                      type="button" 
                      className="branch-reg-save-btn"
                      onClick={handleSaveOfficialsData}
                    >
                      Save Officials Data
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="branch-reg-overview">
            <div className="branch-reg-form-container">
              <h2 className="branch-reg-form-title">Data Overview</h2>
              <p className="branch-reg-form-subtitle">We've processed your information. Please review the data before proceeding to analysis and form generation.</p>
              
              {/* Status Overview */}
              <div className="branch-reg-overview-status">
                <div className="branch-reg-status-item">
                  <FaCheck className="branch-reg-status-icon" />
                  <span>Company information collected</span>
                </div>
                <div className="branch-reg-status-item">
                  <FaCheck className="branch-reg-status-icon" />
                  <span>Branch details processed</span>
                </div>
                <div className="branch-reg-status-item">
                  <FaCheck className="branch-reg-status-icon" />
                  <span>{officialsData.length} officials registered</span>
                </div>
                <div className="branch-reg-status-item">
                  <FaCheck className="branch-reg-status-icon" />
                  <span>0 representatives registered</span>
                </div>
              </div>

              {/* Company Information */}
              <div className="branch-reg-overview-section">
                <div className="branch-reg-section-header">
                  <FaBuilding className="branch-reg-section-icon" />
                  <h3 className="branch-reg-section-title">Company Information</h3>
                </div>
                <div className="branch-reg-overview-grid">
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Company Name</label>
                    <div className="branch-reg-overview-value">{companyData.company_name || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Legal Form</label>
                    <div className="branch-reg-overview-value">{companyData.legal_form || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Registration Number</label>
                    <div className="branch-reg-overview-value">{companyData.reg_number || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Country of Incorporation</label>
                    <div className="branch-reg-overview-value">{companyData.country_of_incorporation || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Main Activity</label>
                    <div className="branch-reg-overview-value">{companyData.main_activity || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Registered Since</label>
                    <div className="branch-reg-overview-value">{companyData.formally_registered_since || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Branch Information */}
              <div className="branch-reg-overview-section">
                <div className="branch-reg-section-header">
                  <FaMapMarkerAlt className="branch-reg-section-icon" />
                  <h3 className="branch-reg-section-title">Branch Information</h3>
                </div>
                <div className="branch-reg-overview-grid">
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Branch Address</label>
                    <div className="branch-reg-overview-value">{branchData.branch_address || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">City</label>
                    <div className="branch-reg-overview-value">{branchData.branch_city || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Postal Code</label>
                    <div className="branch-reg-overview-value">{branchData.branch_postal_code || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Starting Date</label>
                    <div className="branch-reg-overview-value">{branchData.branch_starting_date || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Contact Phone</label>
                    <div className="branch-reg-overview-value">{branchData.branch_phone || 'Not provided'}</div>
                  </div>
                  <div className="branch-reg-overview-card">
                    <label className="branch-reg-overview-label">Contact Email</label>
                    <div className="branch-reg-overview-value">{branchData.branch_email || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Officials Information */}
              <div className="branch-reg-overview-section">
                <div className="branch-reg-section-header">
                  <FaUsers className="branch-reg-section-icon" />
                  <h3 className="branch-reg-section-title">Officials ({officialsData.length})</h3>
                </div>
                <div className="branch-reg-officials-overview">
                  {officialsData.map((official, index) => (
                    <div key={official.id} className="branch-reg-official-card">
                      <div className="branch-reg-official-header">
                        <div className="branch-reg-official-avatar">
                          <FaUsers />
                        </div>
                        <div className="branch-reg-official-info">
                          <div className="branch-reg-official-name">{official.full_name || `Official ${index + 1}`}</div>
                          <div className="branch-reg-official-role">{official.role || 'Director'}</div>
                        </div>
                      </div>
                      <div className="branch-reg-official-details">
                        <div className="branch-reg-official-detail">
                          <span className="branch-reg-detail-label">Nationality:</span>
                          <span className="branch-reg-detail-value">{official.nationality || 'Not provided'}</span>
                        </div>
                        <div className="branch-reg-official-detail">
                          <span className="branch-reg-detail-label">Appointed:</span>
                          <span className="branch-reg-detail-value">{official.appointment_date || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="branch-reg-analysis">
            <div className="branch-reg-form-container">
              {analysisLoading ? (
                <div className="branch-reg-analysis-loading">
                  <div className="branch-reg-analysis-icon">
                    <FaFileAlt />
                  </div>
                  <h2 className="branch-reg-analysis-title">Analyzing your data...</h2>
                  <p className="branch-reg-analysis-subtitle">We're checking your information for completeness and compliance with KvK requirements.</p>
                  <div className="branch-reg-progress-bar-analysis">
                    <div className="branch-reg-progress-fill"></div>
                  </div>
                </div>
              ) : analysisComplete ? (
                <>
                  <div className="branch-reg-section-header">
                    <FaFileAlt className="branch-reg-section-icon" />
                    <h2 className="branch-reg-form-title">Data Analysis Results</h2>
                  </div>
                  <p className="branch-reg-form-subtitle">We've analyzed your information for completeness and compliance with KvK requirements.</p>
                  
                  {getMissingFields().length > 0 && (
                    <div className="branch-reg-missing-info">
                      <div className="branch-reg-missing-header">
                        <FaInfoCircle className="branch-reg-missing-icon" />
                        <h3 className="branch-reg-missing-title">Missing information detected.</h3>
                      </div>
                      <p className="branch-reg-missing-subtitle">The following information is recommended but not required to proceed:</p>
                      <ul className="branch-reg-missing-list">
                        {getMissingFields().map((field, index) => (
                          <li key={index} className="branch-reg-missing-item">{field}</li>
                        ))}
                      </ul>
                      <p className="branch-reg-missing-note">You can continue to the next step, but completing these fields will ensure a smoother registration process.</p>
                    </div>
                  )}

                  {/* Required Forms Overview */}
                  <div className="branch-reg-forms-overview">
                    <div className="branch-reg-section-header">
                      <FaFileAlt className="branch-reg-section-icon" />
                      <h3 className="branch-reg-section-title">Required Forms Overview</h3>
                    </div>
                    <p className="branch-reg-forms-subtitle">Based on your data, the following forms will be generated in the next step:</p>
                    
                    <div className="branch-reg-forms-list">
                      <div className="branch-reg-form-item">
                        <div className="branch-reg-form-item-icon">
                          <FaFileAlt />
                        </div>
                        <div className="branch-reg-form-item-content">
                          <h4 className="branch-reg-form-item-title">Form 6: Registration of a Non-Resident Legal Entity</h4>
                          <p className="branch-reg-form-item-desc">Primary registration document for your foreign entity in the Netherlands</p>
                        </div>
                      </div>
                      
                      <div className="branch-reg-form-item">
                        <div className="branch-reg-form-item-icon">
                          <FaFileAlt />
                        </div>
                        <div className="branch-reg-form-item-content">
                          <h4 className="branch-reg-form-item-title">Form 9: Registration of a Branch Office</h4>
                          <p className="branch-reg-form-item-desc">Establishes your branch presence in the Netherlands</p>
                        </div>
                      </div>
                      
                      <div className="branch-reg-form-item">
                        <div className="branch-reg-form-item-icon">
                          <FaFileAlt />
                        </div>
                        <div className="branch-reg-form-item-content">
                          <h4 className="branch-reg-form-item-title">Form 11: Registration of an Official of a Legal Entity</h4>
                          <p className="branch-reg-form-item-desc">Registers {officialsData.length} official(s) with their authorities and responsibilities</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="branch-reg-forms">
            <div className="branch-reg-form-container">
              <div className="branch-reg-section-header">
                <FaFileAlt className="branch-reg-section-icon" />
                <h2 className="branch-reg-form-title">Form Generation & Submission</h2>
              </div>
              <p className="branch-reg-form-subtitle">Generate the required KvK forms, sign them, and upload the completed versions below. You can continue without uploading any forms if you prefer to do this later.</p>
              
              {/* Form 6 Section */}
              <div className="branch-reg-form-section">
                <div className="branch-reg-form-section-header" onClick={() => toggleFormSection('form6')}>
                  <div className="branch-reg-form-section-title">
                    <FaFileAlt className="branch-reg-form-section-icon" />
                    <h3>Form 6: Registration of a Non-Resident Legal Entity</h3>
                  </div>
                  <span className="branch-reg-expand-icon">
                    {expandedFormSection === 'form6' ? '▲' : '▼'}
                  </span>
                </div>
                
                {expandedFormSection === 'form6' && (
                  <div className="branch-reg-form-section-content">
                    <p className="branch-reg-form-description">Primary registration document for your foreign entity in the Netherlands. Captures essential information about your company structure, activities, and identity.</p>
                    
                    <div className="branch-reg-key-sections">
                      <h4>Key Sections</h4>
                      <ul>
                        <li>Company identification (sections 1.1-1.3)</li>
                        <li>Business activities (sections 2.1-2.5)</li>
                        <li>Address information (sections 2.8-2.9)</li>
                        <li>Contact details (section 2.10)</li>
                        <li>Employee information (section 2.11)</li>
                      </ul>
                    </div>

                    <div className="branch-reg-signature-requirements">
                      <h4>Signature Requirements</h4>
                      <ul>
                        <li>Must be signed at the bottom of the last page by an authorized representative</li>
                        <li>Signature must be legalized by a Notary</li>
                        <li>If Form 13 is relevant, confirm this on page 4 before signing</li>
                      </ul>
                    </div>

                    <div className="branch-reg-form-actions">
                      <button className="branch-reg-download-btn" onClick={() => handleDownloadTemplate('form6')}>
                        ⬇ Download Form Template
                      </button>
                      <button className="branch-reg-generate-btn" onClick={() => handleGenerateForm('form6')}>
                        ⚡ Generate Form 6
                      </button>
                      <label htmlFor="file-upload-form6" className="branch-reg-upload-btn">
                        {uploading['form6'] ? 'Uploading...' : 'Upload Signed Form'}
                        <input
                          id="file-upload-form6"
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          disabled={uploading['form6']}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload('form6', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {uploadedFiles['form6'] && <span className="branch-reg-upload-success">Uploaded: {uploadedFiles['form6']}</span>}
                      {uploadError && <span className="branch-reg-upload-error">{uploadError}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Form 9 Section */}
              <div className="branch-reg-form-section">
                <div className="branch-reg-form-section-header" onClick={() => toggleFormSection('form9')}>
                  <div className="branch-reg-form-section-title">
                    <FaFileAlt className="branch-reg-form-section-icon" />
                    <h3>Form 9: Registration of a Branch Office</h3>
                  </div>
                  <span className="branch-reg-expand-icon">
                    {expandedFormSection === 'form9' ? '▲' : '▼'}
                  </span>
                </div>
                
                {expandedFormSection === 'form9' && (
                  <div className="branch-reg-form-section-content">
                    <p className="branch-reg-form-description">Establishes your branch presence in the Netherlands and captures specific information about your branch operations.</p>
                    
                    <div className="branch-reg-form-actions">
                      <button className="branch-reg-download-btn" onClick={() => handleDownloadTemplate('form9')}>
                        ⬇ Download Form Template
                      </button>
                      <button className="branch-reg-generate-btn" onClick={() => handleGenerateForm('form9')}>
                        ⚡ Generate Form 9
                      </button>
                      <label htmlFor="file-upload-form9" className="branch-reg-upload-btn">
                        {uploading['form9'] ? 'Uploading...' : 'Upload Signed Form'}
                        <input
                          id="file-upload-form9"
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          disabled={uploading['form9']}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload('form9', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {uploadedFiles['form9'] && <span className="branch-reg-upload-success">Uploaded: {uploadedFiles['form9']}</span>}
                      {uploadError && <span className="branch-reg-upload-error">{uploadError}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Form 11 Section */}
              <div className="branch-reg-form-section">
                <div className="branch-reg-form-section-header" onClick={() => toggleFormSection('form11')}>
                  <div className="branch-reg-form-section-title">
                    <FaFileAlt className="branch-reg-form-section-icon" />
                    <h3>Form 11: Registration of an Official of a Legal Entity</h3>
                  </div>
                  <span className="branch-reg-expand-icon">
                    {expandedFormSection === 'form11' ? '▲' : '▼'}
                  </span>
                </div>
                
                {expandedFormSection === 'form11' && (
                  <div className="branch-reg-form-section-content">
                    <p className="branch-reg-form-description">Registers {officialsData.length} official(s) with their authorities and responsibilities.</p>
                    
                    <div className="branch-reg-form-actions">
                      <button className="branch-reg-download-btn" onClick={() => handleDownloadTemplate('form11')}>
                        ⬇ Download Form Template
                      </button>
                      <button className="branch-reg-generate-btn" onClick={() => handleGenerateForm('form11')}>
                        ⚡ Generate Form 11
                      </button>
                      <label htmlFor="file-upload-form11" className="branch-reg-upload-btn">
                        {uploading['form11'] ? 'Uploading...' : 'Upload Signed Form'}
                        <input
                          id="file-upload-form11"
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          disabled={uploading['form11']}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload('form11', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {uploadedFiles['form11'] && <span className="branch-reg-upload-success">Uploaded: {uploadedFiles['form11']}</span>}
                      {uploadError && <span className="branch-reg-upload-error">{uploadError}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Completion Progress */}
              <div className="branch-reg-completion-progress">
                <h4>Completion Progress</h4>
                <div className="branch-reg-progress-bar-forms">
                  <div className="branch-reg-progress-fill-forms" style={{ width: `${getCompletionPercentage()}%` }}></div>
                </div>
                <p className="branch-reg-progress-text">{getCompletionPercentage()}% Complete - {getUploadedCount()} of 3 forms uploaded</p>
                <p className="branch-reg-progress-note">You can continue without uploading all forms. You'll have the option to complete this step later.</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 9 && (
          <div className="branch-reg-shipping">
            <div className="branch-reg-form-container">
              <div className="branch-reg-section-header">
                <FaShieldAlt className="branch-reg-section-icon" />
                <h2 className="branch-reg-form-title">Post-Registration Steps</h2>
              </div>
              <p className="branch-reg-form-subtitle">Follow these steps to properly prepare and ship your documents to the KvK. All steps are optional and can be completed later if needed.</p>
              
              {/* Shipping Checklist */}
              <div className="branch-reg-shipping-checklist">
                <h3 className="branch-reg-shipping-section-title">Shipping Checklist</h3>
                <h4 className="branch-reg-shipping-subtitle">Recommended Contents</h4>
                
                <div className="branch-reg-checklist-items">
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Form 6 (completed and signed)</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Form 9 (completed and signed)</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Form 11 (completed and signed in two places)</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Form 13 (if applicable completed and signed)</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Legalized Certificate of Formation/Formation Deed</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Legalized Operating Agreement/Shareholders Register</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Legalized Certificate of Incumbency</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Legalized passport copy for each stakeholder</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Legalized proof of address for each stakeholder (not older than 20 days)</span>
                  </div>
                  <div className="branch-reg-checklist-item">
                    <span className="branch-reg-checklist-icon">×</span>
                    <span className="branch-reg-checklist-text">Rental agreement for virtual office (if applicable)</span>
                  </div>
                </div>
              </div>

              {/* Shipping Instructions */}
              <div className="branch-reg-shipping-instructions">
                <h3 className="branch-reg-shipping-section-title">Shipping Instructions</h3>
                <ul className="branch-reg-instructions-list">
                  <li>Organize all documents in a logical order (forms first, followed by company documents, then personal documents)</li>
                  <li>Use a reliable courier service with tracking capability (e.g., DHL, FedEx, UPS)</li>
                  <li>Include a cover letter listing all enclosed documents</li>
                  <li>Keep a complete copy of all submitted documents for your records</li>
                  <li>Retain the tracking information for follow-up purposes</li>
                </ul>
              </div>

              {/* Shipping Address */}
              <div className="branch-reg-shipping-address">
                <h3 className="branch-reg-shipping-section-title">Shipping Address</h3>
                <div className="branch-reg-address-card">
                  <div className="branch-reg-address-line">KvK Eindhoven</div>
                  <div className="branch-reg-address-line">Branch Registration Department</div>
                  <div className="branch-reg-address-line">JF Kennedylaan 2</div>
                  <div className="branch-reg-address-line">5612 AB Eindhoven</div>
                  <div className="branch-reg-address-line">The Netherlands</div>
                </div>
              </div>

              {/* Cover Letter Template */}
              <div className="branch-reg-cover-letter">
                <div className="branch-reg-cover-letter-header" onClick={() => toggleCoverLetter()}>
                  <span className="branch-reg-cover-letter-title">Cover Letter Template</span>
                  <span className="branch-reg-expand-icon">
                    {coverLetterExpanded ? '▲' : '▼'}
                  </span>
                </div>
                
                {coverLetterExpanded && (
                  <div className="branch-reg-cover-letter-content">
                    <p>Dear KvK Eindhoven,</p>
                    <p>Please find enclosed the required documents for branch registration of [Company Name] in the Netherlands.</p>
                    <p><strong>Enclosed Documents:</strong></p>
                    <ul>
                      <li>Form 6: Registration of a Non-Resident Legal Entity</li>
                      <li>Form 9: Registration of a Branch Office</li>
                      <li>Form 11: Registration of an Official of a Legal Entity</li>
                      <li>Supporting company documents</li>
                      <li>Personal identification documents</li>
                    </ul>
                    <p>All documents have been properly legalized and are ready for processing.</p>
                    <p>Thank you for your attention to this matter.</p>
                    <p>Sincerely,<br/>[Your Name]<br/>[Your Position]<br/>[Company Name]</p>
                  </div>
                )}
              </div>

              {/* Checklist Progress */}
              <div className="branch-reg-checklist-progress">
                <h3 className="branch-reg-shipping-section-title">Checklist Progress</h3>
                <div className="branch-reg-progress-bar-shipping">
                  <div className="branch-reg-progress-fill-shipping" style={{ width: `${getShippingProgress()}%` }}></div>
                </div>
                <p className="branch-reg-progress-text-shipping">{getShippingProgress()}% Complete</p>
                <p className="branch-reg-progress-note-shipping">You can complete the checklist later. All steps are optional at this stage.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="branch-reg-footer">
        <button className="branch-reg-back-btn" onClick={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : handleBack}>
          {currentStep > 1 ? 'Previous' : 'Back'}
        </button>
        <button className="branch-reg-continue-btn" onClick={handleContinue}>
          {currentStep === totalSteps ? 'Finish' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default BranchRegistrationRequirements; 