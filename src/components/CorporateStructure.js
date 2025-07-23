import React from 'react';
import './CorporateStructure.css';

const CorporateStructure = ({ baseCompany, targetCompanies }) => {
  if (!baseCompany) return <div>Loading...</div>;

  return (
    <div className="corporate-structure-container">
      <h2 style={{ margin: 0, fontSize: '1.25rem', marginBottom: 12 }}>Corporate Structure</h2>
      <div className="org-chart">
        {/* Base Company Node */}
        <div className="org-node base-company compact-node">
          <div className="org-node-content compact-content">
            <div style={{ fontWeight: 700, color: '#ea3a70', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 18 }}>
              <span role="img" aria-label="building" style={{ fontSize: 20 }}>🏢</span>
              <span>{baseCompany.company_name}</span>
            </div>
            <div style={{ color: '#fff', opacity: 0.85, fontSize: 13 }}>{baseCompany.base_location || baseCompany.country} (Base Company)</div>
          </div>
        </div>
        {/* Target Companies */}
        <div className="org-children">
          {targetCompanies && targetCompanies.length > 0 && (
            <div className="org-children-row">
              {targetCompanies.map((tc, idx) => (
                <div className="org-node target-company compact-node" key={tc.id || idx}>
                  <div className="org-node-content compact-content">
                    <div style={{ fontWeight: 700, color: '#ffe066', display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
                      <span role="img" aria-label="globe" style={{ fontSize: 16 }}>🌐</span>
                      <span>{tc.company_name}</span>
                    </div>
                    <div style={{ color: '#fff', opacity: 0.85, fontSize: 12 }}>{tc.base_location || tc.country}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateStructure; 