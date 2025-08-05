import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './Login.css';
import loginImage from '../assests/login.png'; 
import logo from '../assests/logo.png';
import { supabase } from './SupabaseClient';
import API_BASE_URL from './config';
import AuthSlider from './AuthSlider';
import { slides as authSlides } from './AuthSlider';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [avatarIdx, setAvatarIdx] = useState(0);

  // Function to check if company info is complete
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

  // Handle Google OAuth sign-in
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google SSO Login Error:', error);
        setError('Google sign-in failed. Please try again.');
      }
      // If successful, the user will be redirected to the dashboard
      // The AuthMiddleware will handle the role checking after redirect
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle sign-in with Supabase and AWS
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (authError) throw authError;

      // Clean up any duplicate entries for this user (keep only the first one)
      try {
        const { data: allRoles, error: cleanupError } = await supabase
          .from('user_roles')
          .select('id, role')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: true });

        if (!cleanupError && allRoles && allRoles.length > 1) {
          // Keep the first entry, delete the rest
          const idsToDelete = allRoles.slice(1).map(role => role.id);
          await supabase
            .from('user_roles')
            .delete()
            .in('id', idsToDelete);
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up duplicate roles:', cleanupError);
      }

      // Check user role in Supabase - handle potential duplicates
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .limit(1);

      if (roleError) throw roleError;

      // Store user role (default to 'lead' if no role found)
      const userRole = roleData && roleData.length > 0 ? roleData[0].role : 'lead';
      localStorage.setItem('userRole', userRole);
      
      // If the user is a lead, proceed directly without AWS validation
      if (userRole === 'lead') {
        console.log('Lead user detected, proceeding to dashboard without AWS validation');
        // Check if company info is complete before setting popup flag
        const isCompanyInfoComplete = await checkCompanyInfoCompleteness(authData.user.id);
        if (!isCompanyInfoComplete) {
          localStorage.setItem('showCompanyInfoPopup', 'true');
        }
        navigate('/dashboard');
      } else {
        // For non-lead users, validate with AWS backend
        await validateWithAWS();
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // AWS validation for non-lead users
  const validateWithAWS = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        // Check if company info is complete before setting popup flag
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const isCompanyInfoComplete = await checkCompanyInfoCompleteness(user.id);
          if (!isCompanyInfoComplete) {
            localStorage.setItem('showCompanyInfoPopup', 'true');
          }
        }
        setMessage("");
        navigate("/dashboard");
      } else {
        setMessage(data.detail || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Please try again.");
    }
  };
 

  // Handle password reset request
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Send password reset email through Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(username, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setMessage('Password reset instructions sent to your email.');
    } catch (error) {
      console.error('Error requesting password reset:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and password reset views
  const toggleResetMode = () => {
    setIsResetMode(!isResetMode);
    setError(null);
    setMessage(null);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Add the logo at the top left */}
      <div className="company-logo">
        <img src={logo} alt="Company Logo" />
      </div>
      
      <div className="login-form-container" style={{ flex: 1 }}>
        <div className="login-form-wrapper">
          {/* Avatar above the form title */}
          <div className="login-avatar-circle">
            <img src={authSlides[avatarIdx].avatar} alt="Avatar" />
          </div>
          {!isResetMode ? (
            // Login Form
            <>
              <h1 className="login">Welcome Back</h1>
              <p className="login-subtitle">Please enter your credentials to log in</p>
              
              {/* Google Sign-in Button */}
              <button 
                type="button" 
                className="google-login-button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="divider">
                <span>or</span>
              </div>
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label1 htmlFor="username">Email</label1>
                  <input
                    type="email"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label1 htmlFor="password">Password</label1>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <i className="password-eye-icon">👁️</i>
                      ) : (
                        <i className="password-eye-icon">👁️‍🗨️</i>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="forgot-password">
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    toggleResetMode();
                  }}>Forgot Password?</a>
                </div>
                
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                
                {error && <div className="error-message">{error}</div>}
              </form>

              <div className="signup-link">
                <p>New here? <NavLink to="/signup">Sign Up </NavLink></p>
              </div>
            </>
          ) : (
            // Password Reset Form
            <>
              <h1>Reset Password</h1>
              <p className="login-subtitle">Enter your email to receive a password reset link</p>
              
              <form onSubmit={handlePasswordReset}>
                <div className="form-group">
                  <label1 htmlFor="reset-email">Email</label1>
                  <input
                    type="email"
                    id="reset-email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                
                <div className="back-to-login">
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    toggleResetMode();
                  }}>Back to Login</a>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
              </form>
            </>
          )}
        </div>
      </div>
      
      {/* Sidebar on the right */}
      <div className="login-sidebar" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthSlider onSlideChange={setAvatarIdx} />
      </div>
    </div>
  );
}

export default Login;
