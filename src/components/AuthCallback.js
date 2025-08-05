import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash/fragment
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login');
          return;
        }

        if (session) {
          // Check if company info is complete
          const isCompanyInfoComplete = await checkCompanyInfoCompleteness(session.user.id);
          if (!isCompanyInfoComplete) {
            localStorage.setItem('showCompanyInfoPopup', 'true');
          }
          
          // Navigate to dashboard
          navigate('/dashboard');
        } else {
          // No session found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Function to check if company info is complete (same as in Login.js)
  const checkCompanyInfoCompleteness = async (userId) => {
    try {
      // Fetch company info from database
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('company_name, status, base_location, registered_address, directors, shareholders')
        .eq('user_id', userId)
        .single();

      // Fetch user profile for contact info
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('name, phone, email')
        .eq('user_id', userId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Error fetching company info:', companyError);
        return false;
      }

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', userError);
        return false;
      }

      // Check required basic fields
      const requiredFields = {
        company_name: companyData?.company_name,
        status: companyData?.status,
        base_location: companyData?.base_location,
        contact_name: userProfile?.name,
        contact_phone: userProfile?.phone,
        contact_email: userProfile?.email
      };

      // Check if any required field is missing
      const missingFields = Object.entries(requiredFields).filter(([key, value]) => {
        return !value || value.trim() === '' || value === 'Not set';
      });

      console.log('Missing company info fields:', missingFields);
      return missingFields.length === 0;
    } catch (error) {
      console.error('Error checking company info completeness:', error);
      return false;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #231942 0%, #18143a 100%)',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #FF4D80', 
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }}></div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we redirect you to your dashboard.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 