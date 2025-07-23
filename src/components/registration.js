import React from 'react';
import './registration.css';
import { BsCreditCard2Front } from 'react-icons/bs';
import { HiOutlineHome, HiOutlineClipboardCheck, HiOutlineClock } from 'react-icons/hi';
import { FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();

  const handleVatRegistration = () => {
    navigate('/vat');
  };

  const handleBranchRegistration = () => {
    navigate('/dutch-branch-registration');
  };

  return (
    <div className="registration-container">
      {/* VAT Registration Card */}
      <div className="registration-card">
        <div className="card-icon">
          <BsCreditCard2Front size={24} />
        </div>
        <h2>VAT ID Application</h2>
        <p className="subtitle">Register for VAT number in target market</p>
        
        <div className="estimated-time">
          <HiOutlineClock size={20} />
          <span>Estimated time: 5-7 business days</span>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <FiCheckCircle className="check-icon" size={18} />
            <span>Automated form filling</span>
          </div>
          <div className="feature-item">
            <FiCheckCircle className="check-icon" size={18} />
            <span>Document verification</span>
          </div>
          <div className="feature-item">
            <FiCheckCircle className="check-icon" size={18} />
            <span>Real-time status tracking</span>
          </div>
        </div>

        <button className="start-button" onClick={handleVatRegistration}>
          Start Application →
        </button>
      </div>

      {/* Branch Registration Card */}
      <div className="registration-card">
        <div className="card-icon">
          <HiOutlineHome size={24} />
        </div>
        <h2>Branch Registration</h2>
        <p className="subtitle">Establish your branch office</p>
        
        <div className="estimated-time">
          <HiOutlineClock size={20} />
          <span>Estimated time: 10-15 business days</span>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <FiCheckCircle className="check-icon" size={18} />
            <span>Document preparation</span>
          </div>
          <div className="feature-item">
            <FiCheckCircle className="check-icon" size={18} />
            <span>Compliance check</span>
          </div>
          <div className="feature-item">
            <FiCheckCircle className="check-icon" size={18} />
            <span>Automated notifications</span>
          </div>
        </div>

        <button className="start-button" onClick={handleBranchRegistration}>
          Start Application →
        </button>
      </div>
    </div>
  );
};

export default Registration;