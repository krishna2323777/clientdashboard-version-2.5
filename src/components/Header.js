import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseClient';
import './Header.css';
import logo from '../assests/logo.png';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaPlay, FaRocket, FaBuilding, FaPercentage, FaChartLine, FaShieldAlt, FaEuroSign, FaCheckCircle, FaFileAlt, FaCalculator, FaChartBar, FaComments, FaClipboard } from 'react-icons/fa';
import { FaRegFileAlt } from 'react-icons/fa';

const Header = ({ userEmail, onMenuToggle, isMenuOpen }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const [isVoiceLoaded, setIsVoiceLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoiceLoading, setIsVoiceLoading] = useState(true);
  const chatIframeRef = useRef(null);
  const voiceIframeRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [showCompanyInfoForm, setShowCompanyInfoForm] = useState(false);
  const [showStartApplicationPopup, setShowStartApplicationPopup] = useState(false);
  const [showCorporateHubPopup, setShowCorporateHubPopup] = useState(false);
  const [showTaxHubPopup, setShowTaxHubPopup] = useState(false);
  const [showFinancialHubPopup, setShowFinancialHubPopup] = useState(false);
  const [activeCompanyInfoTab, setActiveCompanyInfoTab] = useState('basic');
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [targetCompaniesLoading, setTargetCompaniesLoading] = useState(false);
  const [targetCompaniesSaving, setTargetCompaniesSaving] = useState(false);
  const [targetCompaniesMsg, setTargetCompaniesMsg] = useState('');
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    company_name: '',
    address: '',
    phone: '',
    status: 'Incorporated',
    email: '',
    country: '',
  });
  const [basicInfoLoading, setBasicInfoLoading] = useState(false);
  const [basicInfoSaving, setBasicInfoSaving] = useState(false);
  const [basicInfoMsg, setBasicInfoMsg] = useState('');
  const [standardInfo, setStandardInfo] = useState({
    reg_number: '',
    incorporation_date: '',
    business_activity: '',
    phone: '',
  });
  const [standardInfoLoading, setStandardInfoLoading] = useState(false);
  const [standardInfoSaving, setStandardInfoSaving] = useState(false);
  const [standardInfoMsg, setStandardInfoMsg] = useState('');
  const [advancedInfo, setAdvancedInfo] = useState({
    registered_address: '',
    legal_form: '',
    vat_number: '',
    directors: [],
    shareholders: [],
  });
  const [advancedInfoLoading, setAdvancedInfoLoading] = useState(false);
  const [advancedInfoSaving, setAdvancedInfoSaving] = useState(false);
  const [advancedInfoMsg, setAdvancedInfoMsg] = useState('');
  const [showDataCenterPopup, setShowDataCenterPopup] = useState(false);

  const openOnboardingPopup = () => {
    setShowOnboardingPopup(true);
    setShowCompanyInfoForm(false);
  };
  const closeOnboardingPopup = () => {
    setShowOnboardingPopup(false);
    setShowCompanyInfoForm(false);
  };

  const openStartApplicationPopup = () => {
    setShowStartApplicationPopup(true);
  };
  const closeStartApplicationPopup = () => {
    setShowStartApplicationPopup(false);
  };
  
  const openCorporateHubPopup = () => {
    setShowCorporateHubPopup(true);
  };
  const closeCorporateHubPopup = () => {
    setShowCorporateHubPopup(false);
  };
  
  const openTaxHubPopup = () => {
    setShowTaxHubPopup(true);
  };
  const closeTaxHubPopup = () => {
    setShowTaxHubPopup(false);
  };

  const openFinancialHubPopup = () => {
    setShowFinancialHubPopup(true);
  };
  const closeFinancialHubPopup = () => {
    setShowFinancialHubPopup(false);
  };

  const openDataCenterPopup = () => {
    setShowDataCenterPopup(true);
  };
  const closeDataCenterPopup = () => {
    setShowDataCenterPopup(false);
  };

  const handlePopupOverlayClick = (e) => {
    // Only close if clicking on the overlay itself, not on the popup content
    if (e.target === e.currentTarget) {
      closeOnboardingPopup();
    }
  };

  const handleStartApplicationOverlayClick = (e) => {
    // Only close if clicking on the overlay itself, not on the popup content
    if (e.target === e.currentTarget) {
      closeStartApplicationPopup();
    }
  };
  
  const handleCorporateHubOverlayClick = (e) => {
    // Only close if clicking on the overlay itself, not on the popup content
    if (e.target === e.currentTarget) {
      closeCorporateHubPopup();
    }
  };
  
  const handleTaxHubOverlayClick = (e) => {
    // Only close if clicking on the overlay itself, not on the popup content
    if (e.target === e.currentTarget) {
      closeTaxHubPopup();
    }
  };
  const handleFinancialHubOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeFinancialHubPopup();
    }
  };
  const handleDataCenterOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeDataCenterPopup();
    }
  };
  const handleContinue = () => {
    setShowCompanyInfoForm(true);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleClickOutside = (event) => {
      // Close user menu if clicking outside
      if (showUserMenu && !event.target.closest('.user-profile')) {
        closeUserMenu();
      }
      
      // Close notifications if clicking outside
      if (showNotifications && !event.target.closest('.notifications-container')) {
        closeNotifications();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  // Check for company info popup flag after login
  useEffect(() => {
    const shouldShowPopup = localStorage.getItem('showCompanyInfoPopup');
    if (shouldShowPopup === 'true') {
      // Clear the flag
      localStorage.removeItem('showCompanyInfoPopup');
      // Show the popup after a short delay to ensure the dashboard is loaded
      setTimeout(() => {
        openOnboardingPopup();
      }, 1000);
    }
  }, []);

  useEffect(() => {
    // Preload the chat iframe after login
    if (userEmail && !isChatLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = "https://app.relevanceai.com/agents/f1db6c/40f9760672f4-47b5-89f9-e3cdb99d658d/3c8b5767-e8d6-44d9-a08a-d4b3c4993330/embed-chat?hide_tool_steps=true&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%2300002B&bubble_icon=pd%2Fchat&input_placeholder_text=Say+Hii+Here....&hide_logo=true";
      iframe.style.display = 'none';
      
      iframe.onload = () => {
        setIsChatLoaded(true);
        setIsLoading(false);
      };

      iframe.onerror = () => {
        console.error('Failed to load chat iframe');
        setIsLoading(false);
      };

      document.body.appendChild(iframe);
    }

    // Preload the voice assistant iframe after login
    if (userEmail && !isVoiceLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = "https://krishna2323777.github.io/agent/";
      iframe.style.display = 'none';
      
      iframe.onload = () => {
        setIsVoiceLoaded(true);
        setIsVoiceLoading(false);
      };
      iframe.onerror = () => {
        console.error('Failed to load voice assistant iframe');
        setIsVoiceLoading(false);
      };

      document.body.appendChild(iframe);
    }

    let kycChannel;
    let invoiceChannel;

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for subscriptions');
        return;
      }
      console.log('Setting up subscriptions for user:', user.id);

      // Subscribe to KYC document status changes
      kycChannel = supabase
        .channel('kyc-status-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'kyc_documents',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('KYC status change received:', payload);
            if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
              if (payload.new.status !== payload.old.status) {
                const message = getKycStatusMessage(payload.new.doc_type, payload.new.status);
                console.log('Adding KYC notification:', message);
                addNotification(message, 'kyc');
              }
            }
          }
        )
        .subscribe();

      // Subscribe to invoice visibility changes
      invoiceChannel = supabase
        .channel('invoice-visibility')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'private',  // Changed to private schema
            table: 'invoices',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Invoice change received:', payload);
            if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
              // Check if visible_to_client changed from false to true
              if (!payload.old.visible_to_client && payload.new.visible_to_client) {
                const message = `New invoice #${payload.new.invoice_number || 'N/A'} is available for viewing`;
                console.log('Adding invoice notification:', message);
                addNotification(message, 'invoice');
              }
            }
          }
        )
        .subscribe();

      return () => {
        if (kycChannel) kycChannel.unsubscribe();
        if (invoiceChannel) invoiceChannel.unsubscribe();
      };
    };

    // Function to format invoice notification message
    const getInvoiceMessage = (invoice) => {
      return `New invoice #${invoice.invoice_number || 'N/A'} is available for viewing`;
    };

    setupSubscriptions();
    fetchExistingNotifications();

    return () => {
      if (kycChannel) kycChannel.unsubscribe();
      if (invoiceChannel) invoiceChannel.unsubscribe();
    };
  }, [userEmail, isChatLoaded, isVoiceLoaded]);

  useEffect(() => {
    if (showCompanyInfoForm && activeCompanyInfoTab === 'basic') {
      const fetchProfile = async () => {
        setBasicInfoLoading(true);
        setBasicInfoMsg('');
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.user) throw new Error('No user session');
          const userId = sessionData.session.user.id;
          // Fetch user profile
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('name, company_name, address, phone, status, email, country')
            .eq('user_id', userId)
            .single();
          // Fetch base_location from company_info
          const { data: companyData, error: companyError } = await supabase
            .from('company_info')
            .select('base_location')
            .eq('user_id', userId)
            .single();
          if (userError && userError.code !== 'PGRST116') throw userError;
          if (companyError && companyError.code !== 'PGRST116') throw companyError;
          console.log('Fetched user data from user_profiles:', userData);
          console.log('Email from user_profiles:', userData?.email);
          
          setBasicInfo({
            name: userData?.name || '',
            company_name: userData?.company_name || '',
            address: userData?.address || '',
            phone: userData?.phone || '',
            status: userData?.status || 'Incorporated',
            email: userData?.email || '',
            country: companyData?.base_location || '',
          });
        } catch (err) {
          setBasicInfoMsg('Failed to load profile: ' + err.message);
        } finally {
          setBasicInfoLoading(false);
        }
      };
      fetchProfile();
    }
  }, [showCompanyInfoForm, activeCompanyInfoTab]);

  useEffect(() => {
    if (showCompanyInfoForm && activeCompanyInfoTab === 'standard') {
      const fetchStandardInfo = async () => {
        setStandardInfoLoading(true);
        setStandardInfoMsg('');
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.user) throw new Error('No user session');
          const userId = sessionData.session.user.id;
          // Fetch from company_info
          const { data: companyData, error: companyError } = await supabase
            .from('company_info')
            .select('reg_number, incorporation_date, business_activity')
            .eq('user_id', userId)
            .single();
          // Fetch phone from user_profiles
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('phone')
            .eq('user_id', userId)
            .single();
          if (companyError && companyError.code !== 'PGRST116') throw companyError;
          if (userError && userError.code !== 'PGRST116') throw userError;
          setStandardInfo({
            reg_number: companyData?.reg_number || '',
            incorporation_date: companyData?.incorporation_date || '',
            business_activity: companyData?.business_activity || '',
            phone: userData?.phone || '',
          });
        } catch (err) {
          setStandardInfoMsg('Failed to load: ' + err.message);
        } finally {
          setStandardInfoLoading(false);
        }
      };
      fetchStandardInfo();
    }
  }, [showCompanyInfoForm, activeCompanyInfoTab]);

  useEffect(() => {
    if (showCompanyInfoForm && activeCompanyInfoTab === 'advanced') {
      const fetchAdvancedInfo = async () => {
        setAdvancedInfoLoading(true);
        setAdvancedInfoMsg('');
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.user) throw new Error('No user session');
          const userId = sessionData.session.user.id;
          
          // Fetch registered address from user_profiles
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('address')
            .eq('user_id', userId)
            .single();
          
          // Fetch other advanced info from company_info
          const { data: companyData, error: companyError } = await supabase
            .from('company_info')
            .select('legal_form, vat_number, directors, shareholders')
            .eq('user_id', userId)
            .single();
          
          if (userError && userError.code !== 'PGRST116') throw userError;
          if (companyError && companyError.code !== 'PGRST116') throw companyError;
          
          // Parse directors and shareholders with proper error handling
          let directors = [];
          let shareholders = [];
          
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
          
          setAdvancedInfo({
            registered_address: userData?.address || '',
            legal_form: companyData?.legal_form || '',
            vat_number: companyData?.vat_number || '',
            directors: directors,
            shareholders: shareholders,
          });
        } catch (err) {
          setAdvancedInfoMsg('Failed to load advanced info: ' + err.message);
          console.error('Error fetching advanced info:', err);
        } finally {
          setAdvancedInfoLoading(false);
        }
      };
      fetchAdvancedInfo();
    }
  }, [showCompanyInfoForm, activeCompanyInfoTab]);

  useEffect(() => {
    if (showCompanyInfoForm && activeCompanyInfoTab === 'target-companies') {
      const fetchTargetCompanies = async () => {
        setTargetCompaniesLoading(true);
        setTargetCompaniesMsg('');
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.user) throw new Error('No user session');
          const userId = sessionData.session.user.id;
          
          // Fetch target companies from target_companies table
          const { data: targetCompaniesData, error: targetCompaniesError } = await supabase
            .from('target_companies')
            .select('company_name, reg_number, vat_number, incorporation_date, base_location, registered_address, directors, shareholders, company_type')
            .eq('user_id', userId);
          
          if (targetCompaniesError) {
            console.warn('Error fetching target companies:', targetCompaniesError);
            // If table doesn't exist or other error, just set empty array
            setTargetCompanies([]);
            return;
          }
          
          if (targetCompaniesData && targetCompaniesData.length > 0) {
            const formattedCompanies = targetCompaniesData.map(company => {
              // Safe JSON parsing for directors
              let directors = [];
              try {
                if (company.directors && company.directors !== 'null' && company.directors !== '') {
                  directors = typeof company.directors === 'string' 
                    ? JSON.parse(company.directors) 
                    : company.directors;
                }
              } catch (e) {
                console.warn('Error parsing directors:', e);
                directors = [];
              }

              // Safe JSON parsing for shareholders
              let shareholders = [];
              try {
                if (company.shareholders && company.shareholders !== 'null' && company.shareholders !== '') {
                  shareholders = typeof company.shareholders === 'string' 
                    ? JSON.parse(company.shareholders) 
                    : company.shareholders;
                }
              } catch (e) {
                console.warn('Error parsing shareholders:', e);
                shareholders = [];
              }

              return {
                name: company.company_name || '',
                reg_number: company.reg_number || '',
                vat_number: company.vat_number || '',
                incorporation_date: company.incorporation_date || '',
                country: company.base_location || '',
                address: company.registered_address || '',
                directors: directors,
                shareholders: shareholders,
                company_type: company.company_type || 'ebranch'
              };
            });
            setTargetCompanies(formattedCompanies);
          } else {
            setTargetCompanies([]);
          }
        } catch (err) {
          setTargetCompaniesMsg('Failed to load target companies: ' + err.message);
        } finally {
          setTargetCompaniesLoading(false);
        }
      };
      fetchTargetCompanies();
    }
  }, [showCompanyInfoForm, activeCompanyInfoTab]);

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setBasicInfoSaving(true);
    setBasicInfoMsg('');
    
    console.log('Submitting basic info:', basicInfo);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;
      
      console.log('User ID:', userId);
      
      // First, check if user_profiles record exists, if not create it
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        // Record doesn't exist, create it
        console.log('Creating new user profile');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            name: basicInfo.name,
            company_name: basicInfo.company_name,
            address: basicInfo.address,
            phone: basicInfo.phone,
            status: basicInfo.status,
            email: basicInfo.email
          });
        
        if (insertError) throw insertError;
      } else if (checkError) {
        throw checkError;
      } else {
        // Record exists, update it
        console.log('Updating existing user profile');
        const { error: userError } = await supabase
        .from('user_profiles')
        .update({
          name: basicInfo.name,
          company_name: basicInfo.company_name,
          address: basicInfo.address,
          phone: basicInfo.phone,
          status: basicInfo.status,
            email: basicInfo.email,
        })
        .eq('user_id', userId);
        
        if (userError) throw userError;
      }
      
      // Check if company_info record exists, if not create it
      const { data: existingCompany, error: companyCheckError } = await supabase
        .from('company_info')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (companyCheckError && companyCheckError.code === 'PGRST116') {
        // Record doesn't exist, create it
        console.log('Creating new company info');
        const { error: companyInsertError } = await supabase
          .from('company_info')
          .insert({
            user_id: userId,
            base_location: basicInfo.country,
            company_name: basicInfo.company_name
          });
        
        if (companyInsertError) throw companyInsertError;
      } else if (companyCheckError) {
        throw companyCheckError;
      } else {
        // Record exists, update it
        console.log('Updating existing company info');
        const { error: companyError } = await supabase
          .from('company_info')
          .update({
            base_location: basicInfo.country,
          })
          .eq('user_id', userId);
        
        if (companyError) throw companyError;
      }
      
      console.log('Basic info saved successfully');
      setBasicInfoMsg('Profile updated successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setBasicInfoMsg('');
      }, 3000);
      
    } catch (err) {
      console.error('Error saving basic info:', err);
      setBasicInfoMsg('Failed to save: ' + err.message);
    } finally {
      setBasicInfoSaving(false);
    }
  };

  const handleStandardInfoChange = (e) => {
    const { name, value } = e.target;
    setStandardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleStandardInfoSubmit = async (e) => {
    e.preventDefault();
    setStandardInfoSaving(true);
    setStandardInfoMsg('');
    
    console.log('Submitting standard info:', standardInfo);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;
      
      console.log('User ID:', userId);
      
      // Check if company_info record exists, if not create it
      const { data: existingCompany, error: companyCheckError } = await supabase
        .from('company_info')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (companyCheckError && companyCheckError.code === 'PGRST116') {
        // Record doesn't exist, create it
        console.log('Creating new company info for standard info');
        const { error: companyInsertError } = await supabase
          .from('company_info')
          .insert({
            user_id: userId,
            reg_number: standardInfo.reg_number,
            incorporation_date: standardInfo.incorporation_date,
            business_activity: standardInfo.business_activity,
          });
        
        if (companyInsertError) throw companyInsertError;
      } else if (companyCheckError) {
        throw companyCheckError;
      } else {
        // Record exists, update it
        console.log('Updating existing company info for standard info');
        const { error: companyError } = await supabase
        .from('company_info')
        .update({
          reg_number: standardInfo.reg_number,
          incorporation_date: standardInfo.incorporation_date,
          business_activity: standardInfo.business_activity,
        })
        .eq('user_id', userId);
        
        if (companyError) throw companyError;
      }
      
      // Also update phone in user_profiles if it exists
      if (standardInfo.phone) {
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', userId)
          .single();
        
        if (!profileCheckError) {
          // Profile exists, update phone
          const { error: phoneError } = await supabase
            .from('user_profiles')
            .update({
              phone: standardInfo.phone,
            })
            .eq('user_id', userId);
          
          if (phoneError) {
            console.warn('Failed to update phone in user_profiles:', phoneError);
          }
        }
      }
      
      console.log('Standard info saved successfully');
      setStandardInfoMsg('Standard info updated successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setStandardInfoMsg('');
      }, 3000);
      
    } catch (err) {
      console.error('Error saving standard info:', err);
      setStandardInfoMsg('Failed to save: ' + err.message);
    } finally {
      setStandardInfoSaving(false);
    }
  };

  const handleAdvancedInfoChange = (e) => {
    const { name, value } = e.target;
    setAdvancedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const updateDirector = (index, field, value) => {
    setAdvancedInfo(prev => ({
      ...prev,
      directors: prev.directors.map((director, i) =>
        i === index ? { ...director, [field]: value } : director
      )
    }));
  };

  const handleAddDirector = () => {
    setAdvancedInfo(prev => ({
      ...prev,
      directors: [...prev.directors, { name: '', email: '' }]
    }));
  };
  const handleRemoveDirector = (index) => {
    setAdvancedInfo(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }));
  };

  const updateShareholder = (index, field, value) => {
    setAdvancedInfo(prev => ({
      ...prev,
      shareholders: prev.shareholders.map((shareholder, i) =>
        i === index ? { ...shareholder, [field]: value } : shareholder
      )
    }));
  };

  const handleAddShareholder = () => {
    setAdvancedInfo(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, { name: '', percentage: '' }]
    }));
  };
  const handleRemoveShareholder = (index) => {
    setAdvancedInfo(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== index)
    }));
  };

    const handleAdvancedInfoSubmit = async (e) => {
    e.preventDefault();
    setAdvancedInfoSaving(true);
    setAdvancedInfoMsg('');
    
    console.log('Submitting advanced info:', advancedInfo);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;
      
      console.log('User ID:', userId);
      
      // Check if company_info record exists, if not create it
      const { data: existingCompany, error: companyCheckError } = await supabase
        .from('company_info')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (companyCheckError && companyCheckError.code === 'PGRST116') {
        // Record doesn't exist, create it
        console.log('Creating new company info for advanced info');
        const { error: companyInsertError } = await supabase
          .from('company_info')
          .insert({
            user_id: userId,
            legal_form: advancedInfo.legal_form,
            vat_number: advancedInfo.vat_number,
            directors: JSON.stringify(advancedInfo.directors),
            shareholders: JSON.stringify(advancedInfo.shareholders),
          });
        
        if (companyInsertError) throw companyInsertError;
      } else if (companyCheckError) {
        throw companyCheckError;
      } else {
        // Record exists, update it
        console.log('Updating existing company info for advanced info');
        const { error: companyError } = await supabase
          .from('company_info')
          .update({
            legal_form: advancedInfo.legal_form,
            vat_number: advancedInfo.vat_number,
            directors: JSON.stringify(advancedInfo.directors),
            shareholders: JSON.stringify(advancedInfo.shareholders),
          })
          .eq('user_id', userId);
        
        if (companyError) throw companyError;
      }
      
      // Also update registered_address in user_profiles if it exists
      if (advancedInfo.registered_address) {
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', userId)
          .single();
        
        if (!profileCheckError) {
          // Profile exists, update address
          const { error: addressError } = await supabase
            .from('user_profiles')
            .update({
              address: advancedInfo.registered_address,
            })
            .eq('user_id', userId);
          
          if (addressError) {
            console.warn('Failed to update address in user_profiles:', addressError);
          }
        }
      }
      
      console.log('Advanced info saved successfully');
      setAdvancedInfoMsg('Advanced info updated successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setAdvancedInfoMsg('');
      }, 3000);
      
    } catch (err) {
      console.error('Error saving advanced info:', err);
      setAdvancedInfoMsg('Failed to save: ' + err.message);
    } finally {
      setAdvancedInfoSaving(false);
    }
  };

  const handleRemoveTargetCompany = async (index) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;
      
      // Remove from UI first for immediate feedback
      const updatedCompanies = targetCompanies.filter((_, i) => i !== index);
      setTargetCompanies(updatedCompanies);
      
      // Delete all existing target companies for this user
      const { error: deleteError } = await supabase
        .from('target_companies')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.warn('Error deleting existing target companies:', deleteError);
      }
      
      // Insert the updated list (without the removed company)
      if (updatedCompanies.length > 0) {
        const targetCompaniesData = updatedCompanies.map(company => ({
          user_id: userId,
          company_name: company.name || '',
          reg_number: company.reg_number || '',
          vat_number: company.vat_number || '',
          incorporation_date: company.incorporation_date || '',
          base_location: company.country || '',
          registered_address: company.address || '',
          directors: company.directors ? JSON.stringify(company.directors) : '[]',
          shareholders: company.shareholders ? JSON.stringify(company.shareholders) : '[]',
          company_type: company.company_type || 'ebranch'
        }));
        
        const { error: insertError } = await supabase
          .from('target_companies')
          .insert(targetCompaniesData);
        
        if (insertError) {
          console.error('Error saving updated target companies:', insertError);
          // Revert UI change if database save failed
          setTargetCompanies(targetCompanies);
        }
      }
      
      console.log('Target company removed successfully');
      
    } catch (err) {
      console.error('Error removing target company:', err);
      // Revert UI change if there was an error
      setTargetCompanies(targetCompanies);
    }
  };

  const handleTargetCompaniesSubmit = async () => {
    setTargetCompaniesSaving(true);
    setTargetCompaniesMsg('');
    
    console.log('Submitting target companies:', targetCompanies);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;
      
      console.log('User ID:', userId);
      
      // Delete existing target companies for this user
      const { error: deleteError } = await supabase
        .from('target_companies')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.warn('Error deleting existing target companies:', deleteError);
      }
      
      // Insert new target companies
      if (targetCompanies.length > 0) {
        const targetCompaniesData = targetCompanies.map(company => ({
          user_id: userId,
          company_name: company.name || '',
          reg_number: company.reg_number || '',
          vat_number: company.vat_number || '',
          incorporation_date: company.incorporation_date || '',
          base_location: company.country || '',
          registered_address: company.address || '',
          directors: company.directors ? JSON.stringify(company.directors) : '[]',
          shareholders: company.shareholders ? JSON.stringify(company.shareholders) : '[]',
          company_type: company.company_type || 'ebranch'
        }));
        
        const { error: insertError } = await supabase
          .from('target_companies')
          .insert(targetCompaniesData);
        
        if (insertError) throw insertError;
      }
      
      console.log('Target companies saved successfully');
      setTargetCompaniesMsg('Target companies updated successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setTargetCompaniesMsg('');
      }, 3000);
      
    } catch (err) {
      console.error('Error saving target companies:', err);
      setTargetCompaniesMsg('Failed to save: ' + err.message);
    } finally {
      setTargetCompaniesSaving(false);
    }
  };

  const fetchExistingNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for fetching notifications');
      return;
    }
    console.log('Fetching notifications for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Fetched notifications:', data);
      if (data && data.length > 0) {
        setNotifications(data);
        const unreadCount = data.filter(n => !n.read).length;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error in fetchExistingNotifications:', error);
    }
  };

  const getKycStatusMessage = (docType, status) => {
    const docName = docType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    switch (status?.toLowerCase()) {
      case 'approved':
        return `Your ${docName} has been approved`;
      case 'rejected':
        return `Your ${docName} has been rejected. Please upload a new document`;
      case 'pending':
        return `Your ${docName} is under review`;
      default:
        return `Status update for ${docName}: ${status}`;
    }
  };

  const addNotification = async (message, type) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found for adding notification');
      return;
    }

    console.log('Adding notification:', {
      message,
      type,
      user_id: user.id,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          message,
          type,
          read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding notification:', error);
        throw error;
      }

      console.log('Notification added successfully:', data);
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('Error in addNotification:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = (notification) => {
    const isUnread = !notification.read;
    return (
      <div 
        key={notification.id} 
        className={`notification-item ${isUnread ? 'unread' : ''}`}
        onClick={() => markNotificationAsRead(notification.id)}
      >
        <div className="notification-icon">
          {notification.type === 'kyc' ? '📄' : '📋'}
        </div>
        <div className="notification-content">
          <p>{notification.message}</p>
          <span className="notification-time">
            {new Date(notification.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  const renderNotificationsDropdown = () => {
    return (
      <div className="notifications-dropdown">
        <div className="notifications-header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsAsRead}>
              Mark all as read
            </button>
          )}
        </div>
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map(notification => renderNotification(notification))
          ) : (
            <div className="no-notifications">
              No notifications
            </div>
          )}
        </div>
      </div>
    );
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeUserMenu = () => {
    setShowUserMenu(false);
  };

  const toggleSupportChat = () => {
    if (!showSupportChat && !isChatLoaded) {
      setIsLoading(true);
    }
    setShowSupportChat(!showSupportChat);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  const toggleVoiceAssistant = () => {
    if (!showVoiceAssistant && !isVoiceLoaded) {
      setIsVoiceLoading(true);
    }
    setShowVoiceAssistant(!showVoiceAssistant);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {isMobile && (
          <div className="menu-btn" onClick={onMenuToggle}>
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </div>
        )}
        <div className="header-logo">
          <img src={logo} alt="Company Logo" />
        </div>
      </div>
      <div className="header-actions custom-header-actions">
        <button className="start-btn" onClick={openStartApplicationPopup}>
          <FaPlay className="start-icon" />
          <span>Start</span>
        </button>
        <button className="onboarding-btn" onClick={openOnboardingPopup}>
          <FaRocket className="onboarding-icon" />
          <span className="onboarding-text">
            Onboarding<br />Profile
          </span>
        </button>
        <div className="notifications-container">
          <button 
            className="notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="bell-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notifications-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && renderNotificationsDropdown()}
        </div>
        <div className="user-profile">
          <div className="user-avatar custom-user-avatar" onClick={toggleUserMenu}>
            <span className="profile-icon">{userEmail ? userEmail.charAt(0).toUpperCase() : <span>👤</span>}</span>
          </div>
          {showUserMenu && (
            <div className="dropdown-menu user-dropdown">
              <div className="user-info">
                <div className="user-avatar-large">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{userEmail || 'User'}</span>
                  <span className="user-role">Client</span>
                </div>
              </div>
              <ul className="user-menu-list">
                <li onClick={() => navigate('/settings')}>
                  <span className="menu-icon">⚙️</span>
                  <span>Settings</span>
                </li>
                <li onClick={handleLogout}>
                  <span className="menu-icon">🚪</span>
                  <span>Logout</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {showOnboardingPopup && (
        <div className="onboarding-popup-overlay" onClick={handlePopupOverlayClick}>
          <div className="onboarding-popup business-hub-popup">
            <button className="onboarding-popup-close" onClick={closeOnboardingPopup}>&times;</button>
            {!showCompanyInfoForm ? (
              <>
                <div className="business-hub-header">
                  <div className="business-hub-icon">
                    <span role="img" aria-label="hub" className="business-hub-emoji">🗂️</span>
                  </div>
                  <div>
                    <h2>Welcome to Your Business Hub</h2>
                    <p className="business-hub-subtitle">
                      Complete your company profile to unlock all features and maximize your experience.
                    </p>
                  </div>
                </div>
                <div className="business-hub-steps single-step">
                  <div className="business-hub-step completed">
                    <div className="step-title">Company Info</div>
                    <div className="step-desc">Tap to complete this step</div>
                  </div>
                </div>
                <div className="business-hub-footer">
                  <button className="onboarding-popup-action" onClick={handleContinue}>Continue</button>
                </div>
              </>
            ) : (
              <div className="company-info-ui">
                <div className="company-info-header">
                  <span className="back-link">&lt; Back to overview</span>
                  <button className="onboarding-popup-close" onClick={closeOnboardingPopup}>&times;</button>
                </div>
                <h2 className="company-info-title">Company Info</h2>
                <p className="company-info-desc">Complete your company info to enhance your profile and enable advanced features.</p>
                <div className="company-info-progress-bar">
                  <div className="company-info-progress" style={{ width: '60%' }}></div>
                </div>
                <div className="company-info-tabs">
                  <div className={`tab${activeCompanyInfoTab === 'basic' ? ' active' : ''}`} onClick={() => setActiveCompanyInfoTab('basic')}>
                    Basic Info <span className="tab-badge required">Required</span>
                  </div>
                  <div className={`tab${activeCompanyInfoTab === 'standard' ? ' active' : ''}`} onClick={() => setActiveCompanyInfoTab('standard')}>
                    Standard Info <span className="tab-badge recommended">Recommended</span>
                  </div>
                  <div className={`tab${activeCompanyInfoTab === 'advanced' ? ' active' : ''}`} onClick={() => setActiveCompanyInfoTab('advanced')}>
                    Advanced Info <span className="tab-badge legal">For legal services</span>
                  </div>
                  <div className={`tab${activeCompanyInfoTab === 'target-companies' ? ' active' : ''}`} onClick={() => setActiveCompanyInfoTab('target-companies')}>
                   Ebranch <span className="tab-badge optional">Optional</span>
                  </div>
                </div>
                {activeCompanyInfoTab === 'basic' && (
                  <>
                    <div className="company-info-alert">Basic information is required for all users. This helps us personalize your experience and provide better service.</div>
                    <form className="company-info-form" onSubmit={handleBasicInfoSubmit}>
                      <label>Company Name
                        <div className="input-with-icon">
                          <span className="input-icon">🏢</span>
                          <input type="text" name="company_name" value={basicInfo.company_name} onChange={handleBasicInfoChange} required disabled={basicInfoLoading} />
                        </div>
                      </label>
                      <label>Current Company Status
                        <select name="status" value={basicInfo.status} onChange={handleBasicInfoChange} required disabled={basicInfoLoading}>
                          <option value="Incorporated">Incorporated</option>
                          <option value="Private Limited">Private Limited</option>
                          <option value="Public Limited">Public Limited</option>
                        </select>
                      </label>
                      <label>Country of Incorporation/Interest
                        <div className="input-with-icon">
                          <span className="input-icon">🌐</span>
                          <input type="text" name="country" value={basicInfo.country} onChange={handleBasicInfoChange} required disabled={basicInfoLoading} />
                        </div>
                      </label>
                      <label>Contact Person
                        <div className="input-with-icon">
                          <span className="input-icon">👤</span>
                          <input type="text" name="name" value={basicInfo.name} onChange={handleBasicInfoChange} required disabled={basicInfoLoading} />
                        </div>
                      </label>
                      <label>Contact Phone
                        <div className="input-with-icon">
                          <span className="input-icon">📞</span>
                          <input type="text" name="phone" value={basicInfo.phone} onChange={handleBasicInfoChange} required disabled={basicInfoLoading} />
                        </div>
                      </label>
                      <label>Contact Email
                        <div className="input-with-icon">
                          <span className="input-icon">✉️</span>
                          <input type="email" name="email" value={basicInfo.email} onChange={handleBasicInfoChange} disabled={basicInfoLoading} placeholder="Enter contact email" />
                        </div>
                      </label>
                      {basicInfoMsg && <div style={{ color: basicInfoMsg.includes('success') ? '#00D084' : '#FF4D80', marginTop: 8 }}>{basicInfoMsg}</div>}
                      <div className="company-info-form-actions">
                        <button type="button" className="company-info-cancel" disabled={basicInfoSaving || basicInfoLoading}>Cancel</button>
                        <button type="submit" className="company-info-save" disabled={basicInfoSaving || basicInfoLoading}>{basicInfoSaving ? 'Saving...' : 'Save Information'}</button>
                      </div>
                    </form>
                  </>
                )}
                {activeCompanyInfoTab === 'standard' && (
                  <>
                    <div className="company-info-alert company-info-alert-yellow">
                      <span className="alert-icon">⚠️</span>
                      Standard information helps us provide better AI-powered solutions and personalized recommendations. Recommended for all users.
                    </div>
                    <form className="company-info-form" onSubmit={handleStandardInfoSubmit}>
                      {standardInfoLoading ? (
                        <div style={{ color: '#FF4D80', marginBottom: 8 }}>Loading info...</div>
                      ) : !standardInfo.reg_number && !standardInfo.incorporation_date && !standardInfo.business_activity ? (
                        <div style={{ color: '#FF4D80', marginBottom: 8 }}>No company info found for your account.</div>
                      ) : null}
                      <label>Registration Number (if incorporated)
                        <div className="input-with-icon">
                          <span className="input-icon">#</span>
                          <input type="text" name="reg_number" value={standardInfo.reg_number} onChange={handleStandardInfoChange} disabled={standardInfoLoading} placeholder="Enter registration number" />
                        </div>
                      </label>
                      <label>Date of Incorporation
                        <div className="input-with-icon">
                          <span className="input-icon">📅</span>
                          <input type="text" name="incorporation_date" value={standardInfo.incorporation_date} onChange={handleStandardInfoChange} disabled={standardInfoLoading} placeholder="mm/dd/yyyy" />
                        </div>
                      </label>
                      <label>Business Activity
                        <div className="input-with-icon">
                          <span className="input-icon">💼</span>
                          <input type="text" name="business_activity" value={standardInfo.business_activity} onChange={handleStandardInfoChange} disabled={standardInfoLoading} placeholder="Describe your main business activities" />
                        </div>
                      </label>
                      <label>Contact Phone
                        <div className="input-with-icon">
                          <span className="input-icon">📞</span>
                          <input type="text" name="phone" value={standardInfo.phone} onChange={handleStandardInfoChange} disabled={standardInfoLoading} placeholder="Enter phone number" />
                        </div>
                      </label>
                      {standardInfoMsg && <div style={{ color: '#FF4D80', marginTop: 8 }}>{standardInfoMsg}</div>}
                      <div className="company-info-form-actions">
                        <button type="button" className="company-info-cancel" disabled={standardInfoLoading}>Cancel</button>
                        <button type="submit" className="company-info-save" disabled={standardInfoLoading}>Save Information</button>
                      </div>
                    </form>
                  </>
                )}
                {activeCompanyInfoTab === 'advanced' && (
                  <>
                    <div className="company-info-alert company-info-alert-blue">
                      <span className="alert-icon">ℹ️</span>
                      Advanced information is required for legal services such as branch registration, company formation, and tax services. This information helps us prepare legal documents and ensure compliance.
                    </div>
                    <form className="company-info-form" onSubmit={handleAdvancedInfoSubmit}>
                      <label>Registered Address
                        <div className="input-with-icon">
                          <span className="input-icon">📍</span>
                          <input type="text" name="registered_address" value={advancedInfo.registered_address} onChange={handleAdvancedInfoChange} disabled={advancedInfoLoading} placeholder="Enter full registered address" />
                        </div>
                        <div className="company-info-helper">Required for branch registration and legal entity formation</div>
                      </label>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <label style={{ flex: 1 }}>Legal Form
                          <select name="legal_form" value={advancedInfo.legal_form} onChange={handleAdvancedInfoChange} disabled={advancedInfoLoading}>
                            <option value="" disabled>Select legal form</option>
                            <option value="bv">BV</option>
                            <option value="nv">NV</option>
                            <option value="foundation">Foundation</option>
                            <option value="partnership">Partnership</option>
                          </select>
                        </label>
                        <label style={{ flex: 1 }}>VAT Number (if applicable)
                          <div className="input-with-icon">
                            <span className="input-icon">#</span>
                            <input
                              type="text"
                              name="vat_number"
                              value={advancedInfo.vat_number}
                              onChange={handleAdvancedInfoChange}
                              disabled={advancedInfoLoading}
                              placeholder="Enter VAT number"
                            />
                          </div>
                        </label>
                      </div>
                      <div style={{ border: '1.5px solid #2d2250', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', background: '#18143a' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.7rem', color: '#fff' }}>Directors</div>
                        <div className="company-info-helper">Required for legal services and official documents</div>
                        {advancedInfo.directors.map((director, idx) => (
                          <div key={idx} className="director-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input value={director.name} onChange={e => updateDirector(idx, 'name', e.target.value)} placeholder="Name" style={{ flex: 2 }} />
                            <input value={director.email} onChange={e => updateDirector(idx, 'email', e.target.value)} placeholder="Email" style={{ flex: 2 }} />
                            <button type="button" onClick={() => handleRemoveDirector(idx)} style={{ background: '#FF4D80', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer' }}>Remove</button>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddDirector} style={{ background: '#3366FF', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 1.2rem', marginTop: '0.5rem', cursor: 'pointer' }}>Add Director</button>
                      </div>
                      <div style={{ border: '1.5px solid #2d2250', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', background: '#18143a' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.7rem', color: '#fff' }}>Shareholders</div>
                        <div className="company-info-helper">Required for KYC/AML compliance</div>
                        {advancedInfo.shareholders.map((shareholder, idx) => (
                          <div key={idx} className="shareholder-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input value={shareholder.name} onChange={e => updateShareholder(idx, 'name', e.target.value)} placeholder="Name" style={{ flex: 2 }} />
                            <input type="text" value={shareholder.percentage} onChange={e => updateShareholder(idx, 'percentage', e.target.value)} placeholder="Percentage" style={{ flex: 1 }} />
                            <button type="button" onClick={() => handleRemoveShareholder(idx)} style={{ background: '#FF4D80', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer' }}>Remove</button>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddShareholder} style={{ background: '#3366FF', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 1.2rem', marginTop: '0.5rem', cursor: 'pointer' }}>Add Shareholder</button>
                      </div>
                      {advancedInfoMsg && <div style={{ color: advancedInfoMsg.includes('success') ? '#00D084' : '#FF4D80', marginTop: 8 }}>{advancedInfoMsg}</div>}
                      <div className="company-info-form-actions">
                        <button type="button" className="company-info-cancel" disabled={advancedInfoLoading}>Cancel</button>
                        <button type="submit" className="company-info-save" disabled={advancedInfoLoading}>Save Information</button>
                      </div>
                    </form>
                  </>
                )}
                {activeCompanyInfoTab === 'target-companies' && (
                  <>
                    <div className="company-info-alert company-info-alert-blue">
                      <span className="alert-icon">🎯</span>
                      Target companies help us understand your business interests and provide better recommendations for international expansion and partnerships.
                    </div>
                    <div className="target-companies-section">
                      <div className="target-companies-header">
                        <h3>Ebranch</h3>
                        <button 
                          type="button" 
                          className="add-target-company-btn"
                          onClick={() => setTargetCompanies([...targetCompanies, { 
                            name: '', 
                            reg_number: '', 
                            vat_number: '', 
                            incorporation_date: '', 
                            country: '', 
                            address: '',
                            directors: [],
                            shareholders: [],
                            company_type: 'ebranch'
                          }])}
                        >
                          + Add Company
                        </button>
                      </div>
                      {targetCompanies.length === 0 ? (
                        <div className="no-target-companies">
                          <p>No target companies added yet.</p>
                          <p>Click "Add Company" to start adding your target companies.</p>
                        </div>
                      ) : (
                        <div className="target-companies-list">
                          {targetCompanies.map((company, index) => (
                            <div key={index} className="target-company-item">
                              <div className="target-company-header">
                                <h4>Company {index + 1}</h4>
                                <button 
                                  type="button" 
                                  className="remove-company-btn"
                                  onClick={() => handleRemoveTargetCompany(index)}
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="target-company-fields">
                                <div className="field-group">
                                  <label>Company Name</label>
                                  <input 
                                    type="text" 
                                    value={company.name} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].name = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                    placeholder="Enter company name"
                                  />
                                </div>
                                <div className="field-group">
                                  <label>Registration Number</label>
                                  <input 
                                    type="text" 
                                    value={company.reg_number} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].reg_number = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                    placeholder="Enter registration number"
                                  />
                                </div>
                                <div className="field-group">
                                  <label>VAT Number</label>
                                  <input 
                                    type="text" 
                                    value={company.vat_number} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].vat_number = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                    placeholder="Enter VAT number"
                                  />
                                </div>
                                <div className="field-group">
                                  <label>Incorporation Date</label>
                                  <input 
                                    type="text" 
                                    value={company.incorporation_date} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].incorporation_date = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                    placeholder="Enter incorporation date"
                                  />
                                </div>
                                <div className="field-group">
                                  <label>Base Location</label>
                                  <input 
                                    type="text" 
                                    value={company.country} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].country = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                    placeholder="Enter base location"
                                  />
                                </div>
                                <div className="field-group">
                                  <label>Registered Address</label>
                                  <input 
                                    type="text" 
                                    value={company.address} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].address = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                    placeholder="Enter registered address"
                                  />
                                </div>
                                <div className="field-group">
                                  <label>Company Type</label>
                                  <select 
                                    value={company.company_type || 'ebranch'} 
                                    onChange={(e) => {
                                      const updated = [...targetCompanies];
                                      updated[index].company_type = e.target.value;
                                      setTargetCompanies(updated);
                                    }}
                                  >
                                    
                                    <option value="legal_entity">Legal Entity</option>
                                    <option value="virtual_office">Virtual Office</option>
                                    <option value="branch_office">Branch Office</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {targetCompaniesMsg && (
                        <div style={{ color: targetCompaniesMsg.includes('success') ? '#00D084' : '#FF4D80', marginTop: 8 }}>
                          {targetCompaniesMsg}
                        </div>
                      )}
                      <div className="company-info-form-actions">
                        <button type="button" className="company-info-cancel" disabled={targetCompaniesSaving}>
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="company-info-save" 
                          disabled={targetCompaniesSaving}
                          onClick={handleTargetCompaniesSubmit}
                        >
                          {targetCompaniesSaving ? 'Saving...' : 'Save Target Companies'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {showStartApplicationPopup && (
        <div className="onboarding-popup-overlay" onClick={handleStartApplicationOverlayClick}>
          <div className="start-application-popup">
            <button className="onboarding-popup-close" onClick={closeStartApplicationPopup}>&times;</button>
            <div className="start-application-header">
              <div className="start-application-icon">
                <FaPlay className="play-icon" />
              </div>
              <div>
                <h2>Start an Application</h2>
                <p className="start-application-subtitle">
                  Select a hub to view available applications and get started.
                </p>
              </div>
            </div>
            <div className="hub-grid">
              <div className="hub-card corporate-hub" onClick={() => { openCorporateHubPopup(); closeStartApplicationPopup(); }}>
                <div className="hub-icon">
                  <FaBuilding />
                </div>
                <div className="hub-card-content">
                  <h3>Corporate Hub</h3>
                  <p>Manage your business entities and compliance</p>
                  <div className="hub-applications">
                    <span>6 applications available</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card tax-hub" onClick={() => { openTaxHubPopup(); closeStartApplicationPopup(); }}>
                <div className="hub-icon">
                  <FaPercentage />
                </div>
                <div className="hub-card-content">
                  <h3>Tax Hub</h3>
                  <p>Manage tax compliance and filings</p>
                  <div className="hub-applications">
                    <span>5 applications available</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card financial-hub" onClick={() => { openFinancialHubPopup(); closeStartApplicationPopup(); }}>
                <div className="hub-icon">
                  <FaChartLine />
                </div>
                <div className="hub-card-content">
                  <h3>Financial Hub</h3>
                  <p>Manage financial reporting and analysis</p>
                  <div className="hub-applications">
                    <span>4 applications available</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card data-center-hub" onClick={() => { openDataCenterPopup(); closeStartApplicationPopup(); }}>
                <div className="hub-icon">
                  <FaShieldAlt />
                </div>
                <div className="hub-card-content">
                  <h3>Data Center</h3>
                  <p>Access and manage your documents</p>
                  <div className="hub-applications">
                    <span>2 applications available</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDataCenterPopup && (
        <div className="onboarding-popup-overlay" onClick={handleDataCenterOverlayClick}>
          <div className="start-application-popup">
            <button className="onboarding-popup-close" onClick={closeDataCenterPopup}>&times;</button>
            <div className="corporate-hub-header">
              <div className="back-to-hubs" onClick={() => { closeDataCenterPopup(); openStartApplicationPopup(); }}>
                <span className="back-arrow">←</span>
                <span>Back to hubs</span>
              </div>
              <div className="corporate-hub-title-section">
                <div className="corporate-hub-icon data-center-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <h2>Data Center</h2>
                  <p className="corporate-hub-subtitle">
                    Access and manage your documents
                  </p>
                </div>
              </div>
            </div>
            <div className="data-center-grid">
              <div className="hub-card data-center-service">
                <div className="hub-icon">
                  <FaFileAlt />
                </div>
                <div className="hub-card-content">
                  <h3>Financial Documents</h3>
                  <p>View and manage your financial documents</p>
                </div>
              </div>
              <div className="hub-card data-center-service">
                <div className="hub-icon">
                  <FaClipboard />
                </div>
                <div className="hub-card-content">
                  <h3>KYC Documents</h3>
                  <p>Upload and manage your KYC documents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCorporateHubPopup && (
        <div className="onboarding-popup-overlay" onClick={handleCorporateHubOverlayClick}>
          <div className="start-application-popup">
            <button className="onboarding-popup-close" onClick={closeCorporateHubPopup}>&times;</button>
            <div className="corporate-hub-header">
              <div className="back-to-hubs" onClick={() => { closeCorporateHubPopup(); openStartApplicationPopup(); }}>
                <span className="back-arrow">←</span>
                <span>Back to hubs</span>
              </div>
              <div className="corporate-hub-title-section">
                <div className="corporate-hub-icon">
                  <FaBuilding />
                </div>
                <div>
                  <h2>Corporate Hub</h2>
                  <p className="corporate-hub-subtitle">
                    Manage your business entities and compliance
                  </p>
                </div>
              </div>
            </div>
            <div className="corporate-hub-grid">
              <div className="hub-card corporate-service" onClick={() => { navigate('/vat'); closeCorporateHubPopup(); }}>
                <div className="hub-icon">
                  <FaEuroSign />
                </div>
                <div className="hub-card-content">
                  <h3>VAT ID Application</h3>
                  <p>Register for VAT number in target market</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card corporate-service" onClick={() => { navigate('/dutch-branch-registration'); closeCorporateHubPopup(); }}>
                <div className="hub-icon">
                  <FaBuilding />
                </div>
                <div className="hub-card-content">
                  <h3>Branch Registration</h3>
                  <p>Establish your branch office in target market</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card corporate-service" onClick={() => { navigate('/kvk-registration'); closeCorporateHubPopup(); }}>
                <div className="hub-icon">
                  <FaBuilding />
                </div>
                <div className="hub-card-content">
                  <h3>Dutch BV Registration</h3>
                  <p>Register a Dutch private limited company</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card corporate-service" onClick={() => { navigate('/employer-registration'); closeCorporateHubPopup(); }}>
                <div className="hub-icon">
                  <FaCheckCircle />
                </div>
                <div className="hub-card-content">
                  <h3>Employer Registration</h3>
                  <p>Register as an employer in target market</p>
                  <div className="hub-applications">
                    <span>Coming Soon</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card corporate-service" onClick={() => { navigate('/documents'); closeCorporateHubPopup(); }}>
                <div className="hub-icon">
                  <FaShieldAlt />
                </div>
                <div className="hub-card-content">
                  <h3>KYC Documentation</h3>
                  <p>Upload corporate and personal KYC documents</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card corporate-service" onClick={() => { navigate('/agreements'); closeCorporateHubPopup(); }}>
                <div className="hub-icon">
                  <FaFileAlt />
                </div>
                <div className="hub-card-content">
                  <h3>Custom Document Generator</h3>
                  <p>Create corporate documents with AI assistance</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTaxHubPopup && (
        <div className="onboarding-popup-overlay" onClick={handleTaxHubOverlayClick}>
          <div className="start-application-popup">
            <button className="onboarding-popup-close" onClick={closeTaxHubPopup}>&times;</button>
            <div className="corporate-hub-header">
              <div className="back-to-hubs" onClick={() => { closeTaxHubPopup(); openStartApplicationPopup(); }}>
                <span className="back-arrow">←</span>
                <span>Back to hubs</span>
              </div>
              <div className="corporate-hub-title-section">
                <div className="corporate-hub-icon tax-hub-icon">
                  <FaPercentage />
                </div>
                <div>
                  <h2>Tax Hub</h2>
                  <p className="corporate-hub-subtitle">
                    Manage tax compliance and filings
                  </p>
                </div>
              </div>
            </div>
            <div className="tax-hub-grid">
              <div className="hub-card tax-service" onClick={() => { navigate('/vat'); closeTaxHubPopup(); }}>
                <div className="hub-icon">
                  <FaEuroSign />
                </div>
                <div className="hub-card-content">
                  <h3>Prepare VAT Return</h3>
                  <p>Prepare and file your VAT return</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card tax-service" onClick={() => { navigate('/corporate-income-tax'); closeTaxHubPopup(); }}>
                <div className="hub-icon">
                  <FaCheckCircle />
                </div>
                <div className="hub-card-content">
                  <h3>Prepare Corporate Income Tax</h3>
                  <p>Prepare and file your corporate income tax return</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card tax-service" onClick={() => { navigate('/tax-calculators'); closeTaxHubPopup(); }}>
                <div className="hub-icon">
                  <FaCalculator />
                </div>
                <div className="hub-card-content">
                  <h3>Tax Calculators</h3>
                  <p>Access tax calculators for various tax types</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card tax-service" onClick={() => { navigate('/international-tax-planner'); closeTaxHubPopup(); }}>
                <div className="hub-icon">
                  <FaChartBar />
                </div>
                <div className="hub-card-content">
                  <h3>International Tax Planner</h3>
                  <p>Plan your international tax strategy</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
              <div className="hub-card tax-service" onClick={() => { navigate('/custom-flow'); closeTaxHubPopup(); }}>
                <div className="hub-icon">
                  <FaComments />
                </div>
                <div className="hub-card-content">
                  <h3>Custom Flow</h3>
                  <p>Create custom documents and requests with AI assistance</p>
                  <div className="hub-applications">
                    <span>Get Started</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFinancialHubPopup && (
        <div className="onboarding-popup-overlay" onClick={handleFinancialHubOverlayClick}>
          <div className="start-application-popup">
            <button className="onboarding-popup-close" onClick={closeFinancialHubPopup}>&times;</button>
            <div className="corporate-hub-header">
              <div className="back-to-hubs" onClick={() => { closeFinancialHubPopup(); openStartApplicationPopup(); }}>
                <span className="back-arrow">←</span>
                <span>Back to hubs</span>
              </div>
              <div className="corporate-hub-title-section">
                <div className="corporate-hub-icon financial-hub-icon">
                  <FaChartLine />
                </div>
                <div>
                  <h2>Financial Hub</h2>
                  <p className="corporate-hub-subtitle">
                    Manage financial reporting and analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="financial-hub-grid">
              <div className="hub-card financial-service">
                <div className="hub-icon">
                  <FaFileAlt />
                </div>
                <div className="hub-card-content">
                  <h3>Prepare Annual Report</h3>
                  <p>Create and file your annual financial report</p>
                </div>
              </div>
              <div className="hub-card financial-service">
                <div className="hub-icon">
                  <FaClipboard />
                </div>
                <div className="hub-card-content">
                  <h3>Financial Statements</h3>
                  <p>Generate financial statements</p>
                </div>
              </div>
              <div className="hub-card financial-service">
                <div className="hub-icon">
                  <FaChartBar />
                </div>
                <div className="hub-card-content">
                  <h3>Financial Analysis</h3>
                  <p>Analyze your financial performance</p>
                </div>
              </div>
              <div className="hub-card financial-service">
                <div className="hub-icon">
                  <FaRegFileAlt />
                </div>
                <div className="hub-card-content">
                  <h3>Financial Document Generator</h3>
                  <p>Create financial documents with AI assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
