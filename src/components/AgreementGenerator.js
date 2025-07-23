import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AgreementGenerator.css';

const AgreementGenerator = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    disclosingParty: {
      name: '',
      address: '',
      representative: ''
    },
    receivingParty: {
      name: '',
      address: '',
      representative: ''
    }
  });
  
  const [termsData, setTermsData] = useState({
    basicTerms: {
      purpose: '',
      effectiveDate: '',
      terminationPeriod: '2 years'
    },
    confidentialInformation: {
      tradeSecrets: true,
      financialInformation: true,
      productDesigns: true,
      businessPlans: true,
      customerLists: true,
      marketingStrategies: false,
      additionalInfo: ''
    },
    legalProvisions: {
      governingLaw: 'Netherlands',
      disputeResolution: 'Courts'
    },
    additionalProvisions: {
      nonSolicitation: true,
      nonSolicitationPeriod: '1 year',
      nonCompete: false
    }
  });
  
  // Add state for signature at the component level
  const [signatureDate, setSignatureDate] = useState(
    new Date().toISOString().substr(0, 10)
  );
  
  // Get agreement type details
  const agreementTypeInfo = getAgreementTypeInfo(type);
  
  const handleContinue = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to completed agreement
      navigate('/agreements/completed');
    }
  };
  
  const handleClose = () => {
    navigate('/agreements');
  };
  
  const handlePreviewTemplate = () => {
    // Logic to preview template would go here
    console.log('Previewing template');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (party, field, value) => {
    setFormData(prev => ({
      ...prev,
      [party]: {
        ...prev[party],
        [field]: value
      }
    }));
  };
  
  const handleTermsChange = (section, field, value) => {
    setTermsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (section, field) => {
    setTermsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };
  
  // Add signature handling functions at component level
  const handleDrawSignature = () => {
    console.log('Opening draw signature tool');
    // In a real implementation, this would open a canvas for signature drawing
  };
  
  const handleUploadSignature = () => {
    console.log('Opening upload signature dialog');
    // In a real implementation, this would open a file picker for signature upload
  };
  
  const handleSkipSignature = () => {
    console.log('Skipping signature, proceeding with text-only signature');
    // In a real implementation, this would complete the process with just the typed name
  };
  
  // Render specific step content based on current step
  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return renderOverviewStep();
      case 2:
        return renderCompanyStep();
      case 3:
        return renderPartiesStep();
      case 4:
        return renderTermsStep();
      case 5:
        return renderPreviewStep();
      case 6:
        return renderSignStep();
      default:
        return renderOverviewStep();
    }
  };

  // Step 1: Overview
  const renderOverviewStep = () => {
    return (
      <>
        <div className="agreement-info-box">
          <div className="info-icon-container">
            <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div className="info-content">
            <h3 className="info-title">Non-Disclosure Agreement (NDA)</h3>
            <p className="info-description">This document helps protect confidential information shared between parties. Follow the steps to create a customized NDA for your business needs.</p>
          </div>
        </div>
        
        <div className="features-container">
          <h3 className="section-title">Key Features</h3>
          
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon-container">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Legally Compliant</h4>
                <p>Template follows Dutch legal requirements and best practices.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-container">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Customizable Terms</h4>
                <p>Adapt confidentiality terms to your specific needs.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-container">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Data Protection</h4>
                <p>Includes GDPR compliant data handling provisions.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-container">
                <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Secure Signatures</h4>
                <p>Digital signing with legal validity.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="process-overview">
          <h3 className="section-title">Process Overview</h3>
          
          <ul className="process-list">
            <li>
              <svg className="process-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Select company profile to use for party information
            </li>
            <li>
              <svg className="process-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Enter information about both parties
            </li>
            <li>
              <svg className="process-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Customize agreement terms and conditions
            </li>
            <li>
              <svg className="process-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Preview the complete agreement
            </li>
            <li>
              <svg className="process-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Sign and download the final document
            </li>
          </ul>
        </div>
        
        <div className="preview-template-container">
          <button className="preview-template-btn" onClick={handlePreviewTemplate}>
            <svg className="preview-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Preview Template
          </button>
        </div>
      </>
    );
  };

  // Step 2: Company
  const renderCompanyStep = () => {
    return (
      <>
        <div className="company-selection-container">
          <div className="info-alert">
            <div className="info-icon-container">
              <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="info-text">
              <h4>Select Company Profile</h4>
              <p>Choose a company profile to pre-fill the Disclosing Party information in your NDA. This will save you time and ensure consistency across your legal documents.</p>
            </div>
          </div>

          <div className="company-options-grid">
            <div className="company-option">
              <div className="company-icon-container">
                <svg className="company-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className="company-content">
                <h4>Base Company</h4>
                <p>Use your home country company details</p>
                <div className="company-details">
                  <div className="company-detail-item">
                    <span className="detail-label">Tech Innovations Ltd</span>
                  </div>
                  <div className="company-detail-item">
                    <span className="detail-label">John Smith</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="company-option">
              <div className="company-icon-container">
                <svg className="company-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div className="company-content">
                <h4>Target Market</h4>
                <p>Use your Netherlands entity details</p>
                <div className="company-details">
                  <div className="company-detail-item">
                    <span className="detail-label">Tech Innovations Netherlands B.V.</span>
                  </div>
                  <div className="company-detail-item">
                    <span className="detail-label">Maria Rodriguez</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="company-option">
              <div className="company-icon-container">
                <svg className="company-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
              </div>
              <div className="company-content">
                <h4>Custom</h4>
                <p>Enter party information manually</p>
                <div className="custom-note">
                  <span>You'll enter all party details in the next step</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Step 3: Parties
  const renderPartiesStep = () => {
    return (
      <div className="parties-container">
        {/* Disclosing Party Section */}
        <div className="party-section">
          <div className="party-header">
            <div className="party-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className="party-title">Disclosing Party Information</h3>
          </div>
          <p className="party-description">This is the party that will be sharing confidential information.</p>
          
          <div className="form-group">
            <label htmlFor="disclosing-name">Full Legal Name *</label>
            <input 
              type="text" 
              id="disclosing-name" 
              placeholder="Company or individual name" 
              value={formData.disclosingParty.name}
              onChange={(e) => handleInputChange('disclosingParty', 'name', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="disclosing-address">Address *</label>
            <textarea 
              id="disclosing-address" 
              placeholder="Full legal address" 
              rows="3"
              value={formData.disclosingParty.address}
              onChange={(e) => handleInputChange('disclosingParty', 'address', e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="disclosing-rep">Authorized Representative *</label>
            <input 
              type="text" 
              id="disclosing-rep" 
              placeholder="Name of person authorized to sign" 
              value={formData.disclosingParty.representative}
              onChange={(e) => handleInputChange('disclosingParty', 'representative', e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* Receiving Party Section */}
        <div className="party-section">
          <div className="party-header">
            <div className="party-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="party-title">Receiving Party Information</h3>
          </div>
          <p className="party-description">This is the party that will be receiving and protecting confidential information.</p>
          
          <div className="form-group">
            <label htmlFor="receiving-name">Full Legal Name *</label>
            <input 
              type="text" 
              id="receiving-name" 
              placeholder="Company or individual name" 
              value={formData.receivingParty.name}
              onChange={(e) => handleInputChange('receivingParty', 'name', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="receiving-address">Address *</label>
            <textarea 
              id="receiving-address" 
              placeholder="Full legal address" 
              rows="3"
              value={formData.receivingParty.address}
              onChange={(e) => handleInputChange('receivingParty', 'address', e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="receiving-rep">Authorized Representative *</label>
            <input 
              type="text" 
              id="receiving-rep" 
              placeholder="Name of person authorized to sign" 
              value={formData.receivingParty.representative}
              onChange={(e) => handleInputChange('receivingParty', 'representative', e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Step 4: Terms
  const renderTermsStep = () => {
    return (
      <div className="terms-container">
        {/* Basic Terms Section */}
        <div className="terms-section">
          <div className="section-header">
            <div className="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 className="section-title">Basic Terms</h3>
          </div>
          
          <div className="form-group">
            <label htmlFor="purpose">Purpose of Disclosure *</label>
            <textarea 
              id="purpose" 
              placeholder="Describe the purpose for sharing confidential information"
              value={termsData.basicTerms.purpose}
              onChange={(e) => handleTermsChange('basicTerms', 'purpose', e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="effective-date">Effective Date *</label>
              <input 
                type="date" 
                id="effective-date"
                value={termsData.basicTerms.effectiveDate}
                onChange={(e) => handleTermsChange('basicTerms', 'effectiveDate', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group half-width">
              <label htmlFor="termination">Termination Period *</label>
              <select 
                id="termination"
                value={termsData.basicTerms.terminationPeriod}
                onChange={(e) => handleTermsChange('basicTerms', 'terminationPeriod', e.target.value)}
              >
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="3 years">3 years</option>
                <option value="5 years">5 years</option>
                <option value="Indefinite">Indefinite</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Confidential Information Section */}
        <div className="terms-section">
          <div className="section-header">
            <div className="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="section-title">Confidential Information</h3>
          </div>
          
          <p className="section-description">Select the types of confidential information that will be protected under this agreement.</p>
          
          <div className="checkbox-grid">
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="trade-secrets" 
                checked={termsData.confidentialInformation.tradeSecrets}
                onChange={() => handleCheckboxChange('confidentialInformation', 'tradeSecrets')}
              />
              <label htmlFor="trade-secrets">Trade secrets</label>
            </div>
            
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="business-plans" 
                checked={termsData.confidentialInformation.businessPlans}
                onChange={() => handleCheckboxChange('confidentialInformation', 'businessPlans')}
              />
              <label htmlFor="business-plans">Business plans</label>
            </div>
            
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="financial-info" 
                checked={termsData.confidentialInformation.financialInformation}
                onChange={() => handleCheckboxChange('confidentialInformation', 'financialInformation')}
              />
              <label htmlFor="financial-info">Financial information</label>
            </div>
            
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="customer-lists" 
                checked={termsData.confidentialInformation.customerLists}
                onChange={() => handleCheckboxChange('confidentialInformation', 'customerLists')}
              />
              <label htmlFor="customer-lists">Customer lists</label>
            </div>
            
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="product-designs" 
                checked={termsData.confidentialInformation.productDesigns}
                onChange={() => handleCheckboxChange('confidentialInformation', 'productDesigns')}
              />
              <label htmlFor="product-designs">Product designs</label>
            </div>
            
            <div className="checkbox-item">
              <input 
                type="checkbox" 
                id="marketing-strategies" 
                checked={termsData.confidentialInformation.marketingStrategies}
                onChange={() => handleCheckboxChange('confidentialInformation', 'marketingStrategies')}
              />
              <label htmlFor="marketing-strategies">Marketing strategies</label>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="additional-info">Additional Confidential Information</label>
            <textarea 
              id="additional-info" 
              placeholder="Specify any additional types of confidential information"
              value={termsData.confidentialInformation.additionalInfo}
              onChange={(e) => handleTermsChange('confidentialInformation', 'additionalInfo', e.target.value)}
            ></textarea>
          </div>
        </div>
        
        {/* Legal Provisions Section */}
        <div className="terms-section">
          <div className="section-header">
            <div className="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z"></path>
                <path d="M12 8l4 4-4 4"></path>
                <path d="M8 12h8"></path>
              </svg>
            </div>
            <h3 className="section-title">Legal Provisions</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="governing-law">Governing Law *</label>
              <select 
                id="governing-law"
                value={termsData.legalProvisions.governingLaw}
                onChange={(e) => handleTermsChange('legalProvisions', 'governingLaw', e.target.value)}
              >
                <option value="Netherlands">Netherlands</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>
            
            <div className="form-group half-width">
              <label htmlFor="dispute-resolution">Dispute Resolution *</label>
              <select 
                id="dispute-resolution"
                value={termsData.legalProvisions.disputeResolution}
                onChange={(e) => handleTermsChange('legalProvisions', 'disputeResolution', e.target.value)}
              >
                <option value="Courts">Courts</option>
                <option value="Arbitration">Arbitration</option>
                <option value="Mediation">Mediation</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Additional Provisions Section */}
        <div className="terms-section">
          <div className="section-header">
            <div className="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <h3 className="section-title">Additional Provisions</h3>
          </div>
          
          <div className="checkbox-item full-width">
            <input 
              type="checkbox" 
              id="non-solicitation" 
              checked={termsData.additionalProvisions.nonSolicitation}
              onChange={() => handleCheckboxChange('additionalProvisions', 'nonSolicitation')}
            />
            <label htmlFor="non-solicitation">Include non-solicitation clause (prevents parties from soliciting each other's employees or clients)</label>
          </div>
          
          {termsData.additionalProvisions.nonSolicitation && (
            <div className="conditional-field">
              <div className="form-group">
                <label htmlFor="non-solicitation-period">Non-solicitation Period *</label>
                <select 
                  id="non-solicitation-period"
                  value={termsData.additionalProvisions.nonSolicitationPeriod}
                  onChange={(e) => handleTermsChange('additionalProvisions', 'nonSolicitationPeriod', e.target.value)}
                >
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="checkbox-item full-width">
            <input 
              type="checkbox" 
              id="non-compete" 
              checked={termsData.additionalProvisions.nonCompete}
              onChange={() => handleCheckboxChange('additionalProvisions', 'nonCompete')}
            />
            <label htmlFor="non-compete">Include non-compete clause (restricts competitive activities)</label>
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Preview
  const renderPreviewStep = () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    return (
      <div className="preview-container">
        <div className="preview-header">
          <h3 className="preview-title">Preview Agreement</h3>
          <div className="preview-actions">
            <button className="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print
            </button>
            <button className="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
          </div>
        </div>
        
        <div className="document-preview">
          <div className="document-content">
            <h2 className="document-title">NON-DISCLOSURE AGREEMENT</h2>
            
            <div className="document-section">
              <p className="document-intro">
                <strong>THIS AGREEMENT</strong> is made on {termsData.basicTerms.effectiveDate || today}
              </p>
              
              <p className="document-intro">
                <strong>BETWEEN:</strong> {formData.disclosingParty.name || '[Disclosing Party Name]'}, with its registered office at {formData.disclosingParty.address || '[Address]'}, represented by {formData.disclosingParty.representative || '[Name]'} ("Disclosing Party");
              </p>
              
              <p className="document-intro">
                <strong>AND:</strong> {formData.receivingParty.name || '[Receiving Party Name]'}, with its registered office at {formData.receivingParty.address || '[Address]'}, represented by {formData.receivingParty.representative || '[Name]'} ("Receiving Party");
              </p>
              
              <p className="document-intro">
                The Disclosing Party and the Receiving Party are collectively referred to as the "Parties" and individually as a "Party".
              </p>
            </div>
            
            <div className="document-section">
              <h3 className="section-heading">WHEREAS:</h3>
              <p>The Parties wish to engage in discussions regarding {termsData.basicTerms.purpose || '[purpose]'} (the "Purpose"), and</p>
              <p>In connection with the Purpose, the Disclosing Party may disclose certain confidential and proprietary information to the Receiving Party.</p>
            </div>
            
            <div className="document-section">
              <h3 className="section-heading">NOW, THEREFORE, the Parties agree as follows:</h3>
              
              <div className="document-clause">
                <h4>1. DEFINITIONS</h4>
                <p>1.1 "Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, either directly or indirectly, in writing, orally or by inspection of tangible items, including but not limited to:</p>
                <ul className="clause-list">
                  {termsData.confidentialInformation.tradeSecrets && (
                    <li>Trade secrets</li>
                  )}
                  {termsData.confidentialInformation.financialInformation && (
                    <li>Financial information</li>
                  )}
                  {termsData.confidentialInformation.productDesigns && (
                    <li>Product designs</li>
                  )}
                  {termsData.confidentialInformation.businessPlans && (
                    <li>Business plans</li>
                  )}
                  {termsData.confidentialInformation.customerLists && (
                    <li>Customer lists</li>
                  )}
                  {termsData.confidentialInformation.marketingStrategies && (
                    <li>Marketing strategies</li>
                  )}
                </ul>
                {termsData.confidentialInformation.additionalInfo && (
                  <p>1.2 Additional Confidential Information that may be disclosed includes: {termsData.confidentialInformation.additionalInfo}</p>
                )}
                <p>1.3 Confidential Information does not include information that:</p>
                <ul className="clause-list">
                  <li>is or becomes publicly available through no fault of the Receiving Party;</li>
                  <li>was already known to the Receiving Party prior to disclosure by the Disclosing Party;</li>
                  <li>is lawfully obtained by the Receiving Party from a third party without restriction;</li>
                  <li>is independently developed by the Receiving Party without use of the Confidential Information.</li>
                </ul>
              </div>
              
              <div className="document-clause">
                <h4>2. OBLIGATIONS OF THE RECEIVING PARTY</h4>
                <p>2.1 The Receiving Party shall:</p>
                <ul className="clause-list">
                  <li>maintain all Confidential Information in strict confidence;</li>
                  <li>not disclose any Confidential Information to any person or entity without the prior written consent of the Disclosing Party;</li>
                  <li>use the Confidential Information solely for the Purpose;</li>
                  <li>protect the Disclosing Party's Confidential Information with at least the same degree of care as it protects its own confidential information;</li>
                  <li>limit internal disclosure of Confidential Information to only those employees or affiliates who need to know such information for the Purpose;</li>
                  <li>ensure that all persons to whom Confidential Information is disclosed are bound by confidentiality obligations similar to those contained in this Agreement.</li>
                </ul>
              </div>
              
              <div className="document-clause">
                <h4>3. TERM AND TERMINATION</h4>
                <p>3.1 This Agreement shall be effective as of the date first written above and shall continue for a period of {termsData.basicTerms.terminationPeriod || '2 years'} from the date of disclosure of the Confidential Information.</p>
                <p>3.2 The obligations of confidentiality, non-use, and non-disclosure set forth in this Agreement shall survive termination of this Agreement.</p>
              </div>
              
              <div className="document-clause">
                <h4>4. LEGAL PROVISIONS</h4>
                <p>4.1 This Agreement shall be governed by and construed in accordance with the laws of {termsData.legalProvisions.governingLaw || 'Netherlands'}.</p>
                <p>4.2 Any dispute arising out of or in connection with this Agreement shall be resolved through the {termsData.legalProvisions.disputeResolution || 'courts'} of {termsData.legalProvisions.governingLaw || 'Netherlands'}.</p>
              </div>
              
              {termsData.additionalProvisions.nonSolicitation && (
                <div className="document-clause">
                  <h4>5.1 NON-SOLICITATION</h4>
                  <p>This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior agreements and understandings, whether written or oral.</p>
                  <p>5.1 During the term of this Agreement and for a period of {termsData.additionalProvisions.nonSolicitationPeriod || '1 year'} thereafter, neither Party shall, directly or indirectly, solicit or attempt to solicit any employees, consultants, or clients of the other Party without the prior written consent of the other Party.</p>
                </div>
              )}
              
              {termsData.additionalProvisions.nonCompete && (
                <div className="document-clause">
                  <h4>5.2 NON-COMPETE</h4>
                  <p>During the term of this Agreement and for a period of 1 year thereafter, the Receiving Party agrees not to engage in any business or activity that directly competes with the Disclosing Party in relation to the subject matter of the Confidential Information.</p>
                </div>
              )}
              
              <div className="document-clause">
                <h4>{termsData.additionalProvisions.nonSolicitation || termsData.additionalProvisions.nonCompete ? '6' : '5'}. MISCELLANEOUS</h4>
                <p>6.1 If any provision of this Agreement is found to be unenforceable, the remainder shall be enforced as fully as possible and the unenforceable provision shall be deemed modified to the limited extent required to permit its enforcement in a manner most closely representing the intention of the Parties as expressed herein.</p>
                <p>6.2 Any failure by either Party to enforce the other Party's strict performance of any provision of this Agreement will not constitute a waiver of its right to subsequently enforce such provision or any other provision of this Agreement.</p>
              </div>
            </div>
            
            <div className="document-section signatures">
              <p className="signature-heading">IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first above written.</p>
              
              <div className="signature-block">
                <p><strong>For and on behalf of the Disclosing Party:</strong></p>
                <div className="signature-line">
                  <span>Name in print:</span>
                  <div className="signature-field">{formData.disclosingParty.representative || ''}</div>
                </div>
                <div className="signature-line">
                  <span>Title:</span>
                  <div className="signature-field"></div>
                </div>
                <div className="signature-line">
                  <span>Date:</span>
                  <div className="signature-field"></div>
                </div>
              </div>
              
              <div className="signature-block">
                <p><strong>For and on behalf of the Receiving Party:</strong></p>
                <div className="signature-line">
                  <span>Name in print:</span>
                  <div className="signature-field">{formData.receivingParty.representative || ''}</div>
                </div>
                <div className="signature-line">
                  <span>Title:</span>
                  <div className="signature-field"></div>
                </div>
                <div className="signature-line">
                  <span>Date:</span>
                  <div className="signature-field"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 6: Sign
  const renderSignStep = () => {
    return (
      <div className="sign-container">
        <h3 className="sign-title">Sign Agreement</h3>
        
        <div className="sign-form">
          <div className="form-group">
            <label htmlFor="signature-date">Signature Date *</label>
            <input
              type="date"
              id="signature-date"
              value={signatureDate}
              onChange={(e) => setSignatureDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="signature-method">Signature Method *</label>
            <div className="signature-options">
              <button className="signature-option" onClick={handleDrawSignature}>
                <svg className="signature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
                Draw Signature
              </button>
              
              <button className="signature-option" onClick={handleUploadSignature}>
                <svg className="signature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload Signature
              </button>
            </div>
          </div>
        </div>
        
        <div className="signature-preview">
          <p className="signature-preview-text">Signature will appear here</p>
        </div>
        
        <div className="skip-signature-container">
          <button className="skip-signature-btn" onClick={handleSkipSignature}>
            Skip Signature
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="agreement-generator-container">
      <div className="agreement-generator-header">
        <h2>Non-Disclosure Agreement</h2>
        <button className="close-button" onClick={handleClose}>×</button>
      </div>
      
      {/* Step Progress */}
      <div className="step-progress">
        <div className={`step-item ${currentStep === 1 ? 'active' : ''}`}>
          <div className="step-circle">1</div>
          <div className="step-label">Overview</div>
        </div>
        <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
          <div className="step-circle">2</div>
          <div className="step-label">Company</div>
        </div>
        <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <div className="step-label">Parties</div>
        </div>
        <div className={`step-item ${currentStep === 4 ? 'active' : ''}`}>
          <div className="step-circle">4</div>
          <div className="step-label">Terms</div>
        </div>
        <div className={`step-item ${currentStep === 5 ? 'active' : ''}`}>
          <div className="step-circle">5</div>
          <div className="step-label">Preview</div>
        </div>
        <div className={`step-item ${currentStep === 6 ? 'active' : ''}`}>
          <div className="step-circle">6</div>
          <div className="step-label">Sign</div>
        </div>
      </div>
      
      {/* Content */}
      <div className="step-content">
        {renderStepContent()}
      </div>
      
      {/* Footer with action buttons */}
      <div className="generator-footer">
        {currentStep > 1 && (
          <button className="back-btn" onClick={handleBack}>
            Back
          </button>
        )}
        <button className="continue-btn" onClick={handleContinue}>
          Continue
          <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Helper function to get agreement type information
function getAgreementTypeInfo(type) {
  const types = {
    nda: {
      title: 'Non-Disclosure Agreement',
      abbreviation: 'NDA',
      description: 'This document helps protect confidential information shared between parties. Follow the steps to create a customized NDA for your business needs.'
    },
    employment: {
      title: 'Employment Agreement',
      abbreviation: 'EA',
      description: 'Standard employment contract with customizable terms for hiring employees in compliance with local regulations.'
    },
    service: {
      title: 'Service Agreement',
      abbreviation: 'SA',
      description: 'Define terms for service provision between your company and service providers or clients.'
    },
    shareholders: {
      title: 'Shareholders Agreement',
      abbreviation: 'SHA',
      description: 'Regulate shareholder relationships and obligations within your company structure.'
    }
  };
  
  return types[type] || types.nda; // Default to NDA if type not found
}

export default AgreementGenerator; 