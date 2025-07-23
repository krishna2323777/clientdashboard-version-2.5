import React from 'react';
import { useOutletContext } from 'react-router-dom';

import './Certificate.css';

const Certificate = () => {
  const context = useOutletContext();
  const userEmail = context?.userEmail;

  const handleGenerateCertificate = (certificateType) => {
    if (!userEmail) {
      console.warn('No user email available');
      return;
    }
    console.log(`Generating ${certificateType} for user: ${userEmail}`);
  };

  return (
    <div className="app-container">
    
      <div className="main-content">
        <div className="certificate-container">
          <h1>Certificate Generation</h1>
          <div className="certificate-content">
            <div className="certificate-section">
              <h2>Available Certificates</h2>
              <div className="certificate-grid">
                <div className="certificate-card">
                  <h3>Share Certificate</h3>
                  <p>Generate official share certificates for your company</p>
                  <button 
                    className="generate-btn"
                    onClick={() => handleGenerateCertificate('Share Certificate')}
                  >
                    Generate
                  </button>
                </div>
                <div className="certificate-card">
                  <h3>Declaration of UBO</h3>
                  <p>Generate declaration of Ultimate Beneficial Owner</p>
                  <button 
                    className="generate-btn"
                    onClick={() => handleGenerateCertificate('Declaration of UBO')}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
