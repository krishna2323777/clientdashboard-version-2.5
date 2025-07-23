import React from 'react';
import './VatIdRegistration.css';

const VatIdRegistration = ({ onClose }) => {
  return (
    <div className="vat-registration-dropdown">
      <div className="vat-registration-header">
        <h2>VAT ID Registration</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Requirements Section */}
      <div className="registration-section">
        <div className="section-icon">ℹ️</div>
        <h3>VAT ID Registration Requirements</h3>
        <p className="section-description">
          Before proceeding with your VAT ID registration in the Netherlands, please ensure you have the following
          documents and information ready.
        </p>
      </div>

      {/* Simplified Process Section */}
      <div className="registration-section">
        <div className="section-icon">✨</div>
        <h3>Simplified Registration Process</h3>
        <div className="process-features">
          <div className="feature">
            <span className="checkmark">✓</span>
            Importing data from your base company information
          </div>
          <div className="feature">
            <span className="checkmark">✓</span>
            Scanning and extracting information from uploaded documents
          </div>
          <div className="feature">
            <span className="checkmark">✓</span>
            Automatically generating all required forms
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="registration-section">
        <div className="section-icon">🕒</div>
        <h3>Timeline Overview</h3>
        <p className="timeline-text">
          The VAT ID registration process typically takes 15-21 business days from submission of all required documents to
          receiving the VAT number.
        </p>
        <div className="timeline-status">
          <span className="status-icon">✓</span>
          <span className="status-text">eSignable Fast Active</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="registration-columns">
        {/* Required Documents Column */}
        <div className="registration-column">
          <h3>Required Documents</h3>
          <div className="document-list">
            <div className="document-item">
              <div className="document-icon">📄</div>
              <div className="document-details">
                <h4>Applicant company documents</h4>
                <p>Certificate of incorporation, articles of association</p>
              </div>
            </div>

            <div className="document-item">
              <div className="document-icon">📍</div>
              <div className="document-details">
                <h4>Proof of address</h4>
                <p>Business address verification</p>
              </div>
            </div>

            <div className="document-item">
              <div className="document-icon">👤</div>
              <div className="document-details">
                <h4>Director identification</h4>
                <p>Passport copies of directors and representatives</p>
              </div>
            </div>

            <div className="document-item">
              <div className="document-icon">💼</div>
              <div className="document-details">
                <h4>Business activities</h4>
                <p>Description of planned activities in the Netherlands</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Column */}
        <div className="registration-column">
          <h3>Forms We'll Generate</h3>
          <div className="form-item">
            <div className="form-icon">📝</div>
            <div className="form-details">
              <h4>Application VAT Number</h4>
              <p>Belastingdienst registration form</p>
            </div>
          </div>

          <div className="process-overview">
            <h4>Process Overview</h4>
            <div className="process-timeline">
              <div className="timeline-item">
                <span className="checkmark">✓</span>
                <div className="timeline-content">
                  <p>Information gathering and document preparation</p>
                  <span className="timeline-duration">(1-2 days)</span>
                </div>
              </div>
              <div className="timeline-item">
                <span className="checkmark">✓</span>
                <div className="timeline-content">
                  <p>Document verification</p>
                  <span className="timeline-duration">(1-2 days)</span>
                </div>
              </div>
              <div className="timeline-item">
                <span className="checkmark">✓</span>
                <div className="timeline-content">
                  <p>Tax authority registration</p>
                  <span className="timeline-duration">(15-21 days)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="registration-actions">
        <button className="continue-button">Continue to Registration</button>
      </div>
    </div>
  );
};

export default VatIdRegistration; 