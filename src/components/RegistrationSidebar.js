import React from 'react';
import './RegistrationSidebar.css';

const features = [
  {
    title: 'Effortless Company Setup',
    description:
      'AI-driven branch office registration, VAT & EORI applications, and employer registration.',
  },
  {
    title: 'Automated Compliance & Tax Filing',
    description:
      'AI-powered bookkeeping, real-time VAT analysis, and corporate tax return filings.',
  },
  {
    title: 'Virtual Office & Professional Presence',
    description:
      'Establish your business with a local address, phone number, and Google My Business verification.',
  },
  {
    title: 'Borderless Business Operations',
    description:
      'From payroll services to residency applications, we handle the bureaucracy so you can focus on growth.',
  },
];

const RegistrationSidebar = ({ highlightedFeature }) => (
  <div className="reg-sidebar-container">
    <div className="reg-sidebar-header">
      <div className="reg-sidebar-intl">
        <span className="reg-sidebar-intl-icon">
          {/* Globe SVG */}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#b3b3ff" strokeWidth="2"/>
            <ellipse cx="10" cy="10" rx="6" ry="9" stroke="#b3b3ff" strokeWidth="2"/>
            <line x1="1" y1="10" x2="19" y2="10" stroke="#b3b3ff" strokeWidth="2"/>
          </svg>
        </span>
        <span className="reg-sidebar-intl-label">INTERNATIONAL BUSINESS</span>
      </div>
      <div className="reg-sidebar-title">Global Entrepreneurship</div>
      <div className="reg-sidebar-subtitle">Simplified.</div>
      <div className="reg-sidebar-underline"></div>
    </div>
    <div className="reg-sidebar-features">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`reg-sidebar-feature ${highlightedFeature === index ? 'highlighted' : ''}`}
        >
          <span className="reg-sidebar-icon">
            {/* Yellow checkmark SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ffe066" opacity={highlightedFeature === index ? "1" : "0.7"} />
              <path d="M6 10.5L9 13.5L14 8.5" stroke="#7f1fa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div>
            <div className={`reg-sidebar-feature-title ${highlightedFeature === index ? 'highlighted-title' : ''}`}>
              {feature.title}
            </div>
            <div className="reg-sidebar-feature-desc">{feature.description}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="reg-sidebar-bottom-image">
      <img
        src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
        alt="Global business network"
      />
      <div className="reg-sidebar-bottom-caption">
        Expand your business globally with our comprehensive services
      </div>
    </div>
  </div>
);

export default RegistrationSidebar; 