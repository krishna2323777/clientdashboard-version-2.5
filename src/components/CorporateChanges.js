import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CorporateChanges.css';

const CorporateChanges = () => {
  const navigate = useNavigate();
  
  const [activeChanges, setActiveChanges] = useState([
     
  ]);
  
  const handleStartProcess = (processType) => {
    navigate(`/corporate-changes/${processType}`);
  };
  
  const handleContinueProcess = () => {
    navigate('/corporate-changes/share-capital-increase');
  };

  return (
    <div className="corporate-changes-page">
      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button className="nav-tab" onClick={() => navigate('/generate-forms')}>Company Profile</button>
        <button className="nav-tab" onClick={() => navigate('/applications')}>Applications</button>
        <button className="nav-tab" onClick={() => navigate('/agreements')}>Agreements</button>
        <button className="nav-tab active">Corporate Changes</button>
      </div>
      
      {/* Page Header */}
      <div className="page-header">
        <h1>Corporate Changes</h1>
        <p className="subtitle">Initiate and manage important changes to your company</p>
      </div>
      
      {/* Change Types Grid */}
      <div className="changes-grid">
        {/* Resign Director */}
        <div className="change-card">
          <div className="change-icon resign-icon">👤</div>
          <div className="change-content">
            <h3>Resign Director</h3>
            <p className="change-description">Process director resignation and update records</p>
            <div className="complexity-badge medium">Medium</div>
            <button className="start-process-btn" onClick={() => handleStartProcess('resign-director')}>
              Start Process →
            </button>
          </div>
        </div>

        {/* Increase Share Capital */}
        <div className="change-card">
          <div className="change-icon share-icon">📈</div>
          <div className="change-content">
            <h3>Increase Share Capital</h3>
            <p className="change-description">Modify company's share capital structure</p>
            <div className="complexity-badge complex">Complex</div>
            <button className="start-process-btn" onClick={() => handleStartProcess('increase-share-capital')}>
              Start Process →
            </button>
          </div>
        </div>

        {/* Change Registered Office */}
        <div className="change-card">
          <div className="change-icon office-icon">🏢</div>
          <div className="change-content">
            <h3>Change Registered Office</h3>
            <p className="change-description">Update company's registered address</p>
            <div className="complexity-badge simple">Simple</div>
            <button className="start-process-btn" onClick={() => handleStartProcess('change-registered-office')}>
              Start Process →
            </button>
          </div>
        </div>

        {/* Transfer Shares */}
        <div className="change-card">
          <div className="change-icon transfer-icon">👥</div>
          <div className="change-content">
            <h3>Transfer Shares</h3>
            <p className="change-description">Process share transfer between parties</p>
            <div className="complexity-badge complex">Complex</div>
            <button className="start-process-btn" onClick={() => handleStartProcess('transfer-shares')}>
              Start Process →
            </button>
          </div>
        </div>

        {/* Update CEO Salary */}
        <div className="change-card">
          <div className="change-icon salary-icon">💰</div>
          <div className="change-content">
            <h3>Update CEO Salary</h3>
            <p className="change-description">Modify executive compensation</p>
            <div className="complexity-badge medium">Medium</div>
            <button className="start-process-btn" onClick={() => handleStartProcess('update-ceo-salary')}>
              Start Process →
            </button>
          </div>
        </div>
      </div>
      
      {/* Active Changes Section */}
      {activeChanges.length > 0 && (
        <div className="active-changes-section">
          <h2>Active Changes</h2>
          <div className="active-changes-list">
            {activeChanges.map(change => (
              <div key={change.id} className="active-change-item">
                <div className="change-info">
                  <div className="change-type-icon">📈</div>
                  <div>
                    <h4>{change.type}</h4>
                    <p>Started {change.startedAt}</p>
                  </div>
                </div>
                <div className="change-actions">
                  <span className="progress-badge">In Progress</span>
                  <button 
                    className="continue-btn"
                    onClick={handleContinueProcess}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* About Section */}
      <div className="about-section">
        <h2>About Corporate Changes</h2>
        <p className="about-description">
          Corporate changes are modifications to your company's structure, management, or details that need to be legally processed and recorded. Our system helps you manage these changes efficiently, while ensuring compliance with Dutch regulations.
        </p>
        
        <div className="info-columns">
          <div className="info-column">
            <h3 className="info-title">
              <span className="info-icon">📋</span>
              Process Overview
            </h3>
            <ul className="info-list">
              <li>
                <span className="step-number">1</span>
                Select the type of corporate change you need to process
              </li>
              <li>
                <span className="step-number">2</span>
                Complete the guided workflow with required information
              </li>
              <li>
                <span className="step-number">3</span>
                Review and submit your changes for processing
              </li>
              <li>
                <span className="step-number">4</span>
                Track the status of your change request
              </li>
            </ul>
          </div>
          
          <div className="info-column">
            <h3 className="info-title">
              <span className="info-icon">✅</span>
              Benefits
            </h3>
            <ul className="benefits-list">
              <li>Guided step-by-step processes</li>
              <li>Automated form generation</li>
              <li>Compliant with Dutch regulations</li>
              <li>Digital record keeping</li>
            </ul>
            
            <h3 className="info-title">
              <span className="info-icon">ℹ️</span>
              Important Notes
            </h3>
            <ul className="notes-list">
              <li>Some changes require notarization</li>
              <li>Filing fees may apply</li>
              <li>Processing times vary by change type</li>
              <li>Some changes require shareholder approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateChanges; 