import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agreements.css';

const Agreements = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data for agreement templates
  const templates = [
    {
      id: 1,
      title: 'Employment Agreement',
      description: 'Standard employment contract with customizable terms',
      tag: 'HR & Employment',
      estimatedTime: '5-10 minutes'
    },
    {
      id: 2,
      title: 'Non-Disclosure Agreement',
      description: 'Protect your company\'s confidential information',
      tag: 'Confidentiality',
      estimatedTime: '3-5 minutes'
    },
    {
      id: 3,
      title: 'Service Agreement',
      description: 'Define terms for service provision',
      tag: 'Commercial',
      estimatedTime: '5-7 minutes'
    },
    {
      id: 4,
      title: 'Shareholders Agreement',
      description: 'Regulate shareholder relationships and obligations',
      tag: 'Corporate',
      estimatedTime: '10-15 minutes'
    }
  ];
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleGenerateAgreement = (templateId) => {
    navigate(`/agreements/generate/${templateId}`);
  };
  
  const handleCustomAgreement = () => {
    navigate('/agreements/custom');
  };

  return (
    <div className="agreements-page">
      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button className="nav-tab" onClick={() => navigate('/generate-forms')}>Company Profile</button>
        <button className="nav-tab" onClick={() => navigate('/applications')}>Applications</button>
        <button className="nav-tab active">Agreements</button>
        <button className="nav-tab" onClick={() => navigate('/corporate-changes')}>Corporate Changes</button>
      </div>
      
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Legal Agreements</h1>
          <p className="subtitle">Generate legally-compliant documents with AI assistance</p>
        </div>
        <button className="custom-agreement-btn" onClick={handleCustomAgreement}>
          + Custom Agreement
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      {/* Agreement Templates */}
      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-icon">📄</div>
            <div className="template-content">
              <h3>{template.title}</h3>
              <p className="template-description">{template.description}</p>
              <div className="template-meta">
                <span className="template-tag">{template.tag}</span>
                <span className="template-time">Est. time: {template.estimatedTime}</span>
              </div>
              <button 
                className="generate-btn" 
                onClick={() => handleGenerateAgreement(template.id)}
              >
                Generate →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agreements; 