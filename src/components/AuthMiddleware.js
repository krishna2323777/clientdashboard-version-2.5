import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from './SupabaseClient';

const AuthMiddleware = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/login');
          return;
        }

        if (!session) {
          // No session, redirect to login
          navigate('/login');
          return;
        }

        // Check if user exists in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .limit(1);

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error checking user role:', roleError);
          // Handle database error
          navigate('/login');
          return;
        }

        if (!roleData || roleData.length === 0) {
          // User doesn't exist in user_roles table
          console.log('User not found in user_roles table:', session.user.email);
          
          // Sign out the user since they're not authorized
          await supabase.auth.signOut();
          
          // Show error message and redirect to login
          alert('Your account is not authorized. Please contact support to get access.');
          navigate('/login');
          return;
        }

        // User exists, store role
        const userRole = roleData[0].role;
        localStorage.setItem('userRole', userRole);
        console.log('User authenticated with role:', userRole);

        // Check if company info is complete
        const isCompanyInfoComplete = await checkCompanyInfoCompleteness(session.user.id);
        if (!isCompanyInfoComplete) {
          localStorage.setItem('showCompanyInfoPopup', 'true');
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Auth middleware error:', error);
        navigate('/login');
      }
    };

    checkAuthAndRole();
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

  // Show loading while checking authentication
  if (isChecking) {
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
          <h2>Checking authentication...</h2>
          <p>Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  // Render the child routes if authorized
  return <Outlet />;
};

export default AuthMiddleware; 