import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import { getUserProfile } from '../utils/userDataService';
import { Link, useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      setProfile(null); // Reset profile state on fetch
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const userId = sessionData.session.user.id;
          // Store user's email directly from the session
          setUserEmail(sessionData.session.user.email);
          
          const response = await getUserProfile(userId);

          if (response.success) {
            setProfile(response.data);
          } else {
            // Check for specific "no row" error - treat as profile not set up
            if (response.error?.code === 'PGRST116') {
              console.log('Profile not found (PGRST116), prompting setup.');
              setProfile(null); // Ensure profile is null
            } else {
              // For other errors, set the error state
              console.error('Error fetching profile:', response.error);
              setError('Could not load profile data.'); 
            }
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (err) {
        console.error('Exception loading profile:', err);
        setError('An unexpected error occurred while loading the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  // If there was an *unexpected* error (not profile not found)
  if (error) {
    return (
      <div className="error">
        {/* Display generic error message, not the specific error details */}
        {/* Optionally, still allow retry or setup */}
         <button 
            className="button"
            onClick={() => navigate('/settings', { state: { section: 'profile', mode: 'edit' } })}
          >
            Set up your profile
          </button>
      </div>
    );
  }

  // If profile is null (either initial state, not found, or PGRST116 error)
  if (!profile) {
    return (
      <div className="no-profile">
        <p>You haven't set up your profile yet.</p>
        <button 
          className="button"
          onClick={() => navigate('/settings', { state: { section: 'profile', mode: 'edit' } })}
        >
          Set up your profile
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-view">
      <h2>Your Profile</h2>
      
      <div className="profile-card">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> <span className="non-editable">{userEmail}</span> <span className="hint">(cannot be changed)</span></p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>
        
        <div className="profile-section">
          <h3>Company Information</h3>
          <p><strong>Company Name:</strong> {profile.company_name}</p>
          <p><strong>Address:</strong> {profile.address}</p>
        </div>
        
        <div className="profile-actions">
          
        </div>
      </div>
    </div>
  );
};

export default UserProfileView; 
