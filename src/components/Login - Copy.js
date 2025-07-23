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
  const navigate = useNavigate();
  const [avatarIdx, setAvatarIdx] = useState(0);

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
