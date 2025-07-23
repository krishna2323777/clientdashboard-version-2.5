import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Applications.css';
import VatIdRegistration from './VatIdRegistration';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './SupabaseClient';


// Initialize Supabase client
const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);


const Applications = () => {
  const navigate = useNavigate();
  const [showVatRegistration, setShowVatRegistration] = useState(false);
  const [showVatForm, setShowVatForm] = useState(false);
  const [showFormSelection, setShowFormSelection] = useState(false);
  const [showBranchRegistration, setShowBranchRegistration] = useState(false);
  const [branchLocation, setBranchLocation] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('company_information')
          .select('target_market')
          .single();

        if (error) throw error;
        if (data) {
          setBranchLocation(data.target_market);
        }
      } catch (error) {
        console.error('Error fetching company information:', error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleStartApplication = (type) => {
    if (type === 'vat') {
      setShowVatRegistration(true);
      setShowVatForm(false);
    } else if (type === 'branch') {
      setShowFormSelection(true);
      setShowVatRegistration(false);
      setShowVatForm(false);
    } else {
      navigate(`/applications/${type}/start`);
    }
  };

  const handleFormSelect = (formType) => {
    switch(formType) {
      case 'form-6':
        navigate('/kvk-registration');
        break;
      case 'form-9':
        navigate('/form-9');
        break;
      case 'form-11':
        navigate('/form-11');
        break;
      case 'form-13':
        navigate('/form-13');
        break;
      default:
        break;
    }
    setShowFormSelection(false);
  };

  const handleContinueToRegistration = () => {
    setShowVatForm(true);
  };

  return (
    <div className="applications-page">
      {/* Top Navigation */}
      <nav className="nav-container">
        <div className="nav-tabs">
          <button className="nav-tab" onClick={() => navigate('/generate-forms')}>Company Profile</button>
          <button className="nav-tab active">Applications</button>
          <button className="nav-tab" onClick={() => navigate('/agreements')}>Agreements</button>
          <button className="nav-tab" onClick={() => navigate('/corporate-changes')}>Corporate Changes</button>
        </div>
      </nav>

      <div className="applications-container">
        {/* AI Assistant Header */}
        <div className="ai-assistant-card">
          <div className="ai-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V8.21C15.58 7.76 16 7.02 16 6.17V6C16 4.34 14.66 3 13 3C12.3 3 11.63 3.27 11.14 3.69C11.07 3.76 10.99 3.84 10.93 3.91C10.67 3.64 10.34 3.41 10 3.24V3.23C10 2.55 9.45 2 8.77 2H5.23C4.55 2 4 2.55 4 3.23V3.24C2.8 3.8 2 5.03 2 6.46V22H21.5C22.33 22 23 21.33 23 20.5V11C23 9.9 22.1 9 21 9ZM21 20H4V10H6V18.5C6 19.33 6.67 20 7.5 20H14V10.5C14 10.22 14.22 10 14.5 10H21V20ZM8 7.5C8 8.33 7.33 9 6.5 9C5.67 9 5 8.33 5 7.5C5 6.67 5.67 6 6.5 6C7.33 6 8 6.67 8 7.5Z" fill="white"/>
            </svg>
          </div>
          <div className="ai-content">
            <h2>AI Application Assistant</h2>
            <p>Let our AI help you prepare and submit applications with higher accuracy and efficiency. We'll guide you through every step of the process.</p>
            <button className="ai-button">Get Started with AI</button>
          </div>
        </div>

        {/* Application Cards Grid */}
        <div className="application-cards-grid">
          {/* VAT ID Application */}
          <div className="application-card">
            <div className="card-icon vat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="white"/>
              </svg>
            </div>
            <h3>VAT ID Application</h3>
            <p>Register for VAT number in target market</p>
            
            <div className="estimate-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#A3A3A3"/>
              </svg>
              <span>Estimated time: 5-7 business days</span>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Automated form filling</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Document verification</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Real-time status tracking</span>
              </div>
            </div>
            
            <button className="start-application-btn" onClick={() => handleStartApplication('vat')}>
              Start Application
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="white"/>
              </svg>
            </button>
          </div>

          {/* Branch Registration */}
          <div className="application-card">
            <div className="card-icon branch-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="white"/>
              </svg>
            </div>
            <h3>Branch Registration</h3>
            <p>Establish your branch office</p>
            
            <div className="estimate-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#A3A3A3"/>
              </svg>
              <span>Estimated time: 10-15 business days</span>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Document preparation</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Compliance check</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Automated notifications</span>
              </div>
            </div>
            
            <button className="start-application-btn" onClick={() => handleStartApplication('branch')}>
              Start Application
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="white"/>
              </svg>
            </button>
          </div>

          {/* Employer Registration */}
          <div className="application-card">
            <div className="card-icon employer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="white"/>
              </svg>
            </div>
            <h3>Employer Registration</h3>
            <p>Register as an employer in target market</p>
            
            <div className="estimate-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#A3A3A3"/>
              </svg>
              <span>Estimated time: 3-5 business days</span>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Payroll setup</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Employment compliance</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Tax registration</span>
              </div>
            </div>
            
            <button className="start-application-btn" onClick={() => handleStartApplication('employer')}>
              Start Application
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="white"/>
              </svg>
            </button>
          </div>

          {/* Bank Account Opening */}
          <div className="application-card">
            <div className="card-icon bank-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="white"/>
              </svg>
            </div>
            <h3>Bank Account Opening</h3>
            <p>Setup corporate banking in target market</p>
            
            <div className="estimate-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#A3A3A3"/>
              </svg>
              <span>Estimated time: 5-10 business days</span>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>KYC document preparation</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Application pre-check</span>
              </div>
              <div className="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34A853"/>
                </svg>
                <span>Status monitoring</span>
              </div>
            </div>
            
            <button className="start-application-btn" onClick={() => handleStartApplication('bank')}>
              Start Application
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Add Form Selection Popup */}
        {showFormSelection && (
          <div className="form-selection-overlay">
            <div className="form-selection-popup">
              <h2>Select Registration Form</h2>
              <div className="form-options">
                <div className="form-option" onClick={() => handleFormSelect('form-6')}>
                  <div className="form-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
                    </svg>
                  </div>
                  <div className="form-details">
                    <h3>Form 6</h3>
                    <p>KVK Registration Form</p>
                  </div>
                </div>

                <div className="form-option" onClick={() => handleFormSelect('form-9')}>
                  <div className="form-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#34A853"/>
                    </svg>
                  </div>
                  <div className="form-details">
                    <h3>Form 9</h3>
                    <p>Branch Registration Form</p>
                  </div>
                </div>

                <div className="form-option" onClick={() => handleFormSelect('form-11')}>
                  <div className="form-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#FBBC05"/>
                    </svg>
                  </div>
                  <div className="form-details">
                    <h3>Form 11</h3>
                    <p>Additional Information Form</p>
                  </div>
                </div>

                <div className="form-option" onClick={() => handleFormSelect('form-13')}>
                  <div className="form-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div className="form-details">
                    <h3>Form 13</h3>
                    <p>Declaration Form</p>
                  </div>
                </div>
              </div>
              <button className="close-button" onClick={() => setShowFormSelection(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* VAT Registration Information */}
        {showVatRegistration && !showVatForm && (
          <div className="vat-info-section">
            <div className="vat-info-content">
              <h2>VAT Registration Process</h2>
              
              <div className="info-grid">
                <div className="info-column">
                  <h3>Requirements</h3>
                  <ul>
                    <li>Valid company registration</li>
                    <li>Business address in target market</li>
                    <li>Director's identification</li>
                    <li>Bank account details</li>
                  </ul>
                </div>
                
                <div className="info-column">
                  <h3>Timeline</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <span className="step">1</span>
                      <div>
                        <h4>Document Collection</h4>
                        <p>1-2 days</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <span className="step">2</span>
                      <div>
                        <h4>Application Review</h4>
                        <p>1-2 days</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <span className="step">3</span>
                      <div>
                        <h4>Authority Processing</h4>
                        <p>3-5 days</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="info-column">
                  <h3>What You'll Get</h3>
                  <ul>
                    <li>VAT registration number</li>
                    <li>Digital certificate</li>
                    <li>Access to tax portal</li>
                    <li>Compliance calendar</li>
                  </ul>
                </div>
              </div>

              <div className="action-buttons">
                <button className="continue-btn" onClick={handleContinueToRegistration}>
                  Continue to Registration
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="white"/>
                  </svg>
                </button>
                <button className="cancel-btn" onClick={() => setShowVatRegistration(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VAT Registration Form */}
        {showVatForm && (
          <div className="vat-registration-section">
            <VatIdRegistration onClose={() => {
              setShowVatRegistration(false);
              setShowVatForm(false);
            }} />
          </div>
        )}

       
      </div>
    </div>
  );
};

export default Applications; 