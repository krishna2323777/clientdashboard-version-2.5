import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import { createOrUpdateUserProfile, getUserProfile } from '../utils/userDataService';
import './UserProfile.css';

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    phone: '',
  });
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userId, setUserId] = useState(null);

  // Fetch current user data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get the current authenticated user
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
          const currentUserId = data.session.user.id;
          setUserId(currentUserId);
          
          // Set email directly from session
          setUserEmail(data.session.user.email);
          
          // Get the user profile from database
          const response = await getUserProfile(currentUserId);
          if (response.success && response.data) {
            // Convert DB field names to form field names
            setFormData({
              name: response.data.name || '',
              companyName: response.data.company_name || '',
              address: response.data.address || '',
              phone: response.data.phone || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setMessage({
          text: 'Failed to load profile: ' + error.message,
          type: 'error'
        });
      }
    };

    loadUserProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (!userId) {
        throw new Error('No user is logged in');
      }

      // Save the profile data
      const result = await createOrUpdateUserProfile({
        id: userId,
        ...formData,
        email: userEmail
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update company_info table with new company name
      const { error: companyUpdateError } = await supabase
        .from('company_info')
        .update({ company_name: formData.companyName })
        .eq('user_id', userId);

      if (companyUpdateError) {
        throw companyUpdateError;
      }

      setMessage({
        text: 'Profile saved successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({
        text: 'Failed to save profile: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-form">
      <h2>Your Profile</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group1">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group1">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group1">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group1">
          <label htmlFor="email">Email <span className="hint">(cannot be changed)</span></label>
          <div className="readonly-field">
            <span className="non-editable">{userEmail}</span>
          </div>
        </div>
        
        <div className="form-group1">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;
