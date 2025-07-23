import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './Signup.css';

import { supabase } from './SupabaseClient';
import signupInfoImage from '../assests/login.png';
import AuthSlider from './AuthSlider';

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const validatePassword = () => {
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(formData.password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(formData.password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(formData.password)) {
      return "Password must contain at least one special character";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate password
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!formData.companyName.trim()) {
      setError("Company name is required");
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      setLoading(false);
      return;
    }

          // Test webhook call immediately
      console.log('=== TESTING WEBHOOK IMMEDIATELY ===');
      try {
        const testWebhookData = {
          name: formData.name,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          test: true,
          timestamp: new Date().toISOString()
        };

      console.log('Sending immediate test webhook...');
      const testResponse = await fetch('https://houseofcompanies.app.n8n.cloud/webhook/f3f8d439-986b-43a5-a0b1-1949725d70c5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testWebhookData)
      });

      
    } catch (testError) {
      console.error('Test webhook error:', testError);
    }

    try {
      // Sign up the user with Supabase - using company name as display name
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.companyName, // Use company name as display name
          }
        }
      });

      if (authError) throw authError;

      // Insert user profile data into user_roles table (single insert with all data)
      const { error: profileError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          company_name: formData.companyName,
          phone: formData.phone,
          email: formData.email,
          role: 'lead'
        }]);

      if (profileError) throw profileError;

      // Trigger webhook with user data
    

      try {
        const webhookData = {
          name: formData.name,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          user_id: authData.user.id,
          signup_date: new Date().toISOString()
        };

        console.log('Sending webhook request to:', 'https://houseofcompanies.app.n8n.cloud/webhook-test/f3f8d439-986b-43a5-a0b1-1949725d70c5');
        console.log('Webhook payload:', JSON.stringify(webhookData, null, 2));

        const webhookResponse = await fetch('https://houseofcompanies.app.n8n.cloud/webhook-test/f3f8d439-986b-43a5-a0b1-1949725d70c5', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });

       

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.warn('Webhook call failed:', webhookResponse.status, webhookResponse.statusText, errorText);
        } else {
          const responseText = await webhookResponse.text();
          console.log('Webhook triggered successfully. Response:', responseText);
        }
      } catch (webhookError) {
        console.error('Error triggering webhook:', webhookError);
        console.error('Webhook error details:', {
          message: webhookError.message,
          stack: webhookError.stack
        });
        // Don't fail the signup process if webhook fails
      }

      setSuccessMessage('Signup successful! You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Error during signup:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="signup-outer-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Slider on the left */}
      <div className="signup-slider" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthSlider />
      </div>
      {/* Signup form on the right */}
      <div className="signup-content" style={{ flex: 1 }}>
        <div className="signup-form-section">
          <div className="signup-form-wrapper">
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-subtitle">Please fill out the form to sign up</p>
            <form onSubmit={handleSignup}>
              <div className="signup-form-group">
                <label className="signup-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="signup-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
                              <div className="signup-form-group">
                  <label className="signup-label" htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                  name="companyName"
                  className="signup-input"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              <div className="signup-form-group">
                <label className="signup-label" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="signup-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="signup-form-group">
                <label className="signup-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="signup-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="signup-form-group">
                <label className="signup-label" htmlFor="password">Password</label>
                <div className="signup-password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="signup-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button 
                    type="button" 
                    className="signup-password-toggle-btn"
                    onClick={() => togglePasswordVisibility('password')}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <i className="signup-password-eye-icon">👁️</i>
                    ) : (
                      <i className="signup-password-eye-icon">👁️‍🗨️</i>
                    )}
                  </button>
                </div>
              </div>
              <div className="signup-form-group">
                <label className="signup-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="signup-password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="signup-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button 
                    type="button" 
                    className="signup-password-toggle-btn"
                    onClick={() => togglePasswordVisibility('confirm')}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <i className="signup-password-eye-icon">👁️</i>
                    ) : (
                      <i className="signup-password-eye-icon">👁️‍🗨️</i>
                    )}
                  </button>
                </div>
              </div>
              <div className="signup-password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>
              <button 
                type="submit" 
                className="signup-button"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
              {error && <div className="signup-error-message">{error}</div>}
              {successMessage && <div className="signup-success-message">{successMessage}</div>}
            </form>
            <div className="signup-link">
              <p>Already have an account? <NavLink to="/login">Log In</NavLink></p>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}

export default Signup;
