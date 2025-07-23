import React, { useState } from 'react';
import './dutch.css';

const DutchRegistration = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSectionContent = (section) => {
    if (section === expandedSection) {
      return (
        <div className="section-content">
          {section === 'banking' && (
            <>
              <h3>Setting up your Dutch business banking</h3>
              <h4 className="steps-title">Key steps</h4>
              <div className="content-steps">
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 1</div>
                  <p>Apply for a business bank account with a Dutch bank (ING, ABN AMRO, Rabobank)</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 2</div>
                  <p>Prepare KvK extract, UBO declaration, and identification documents</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 3</div>
                  <p>Schedule in-person appointment for account verification (some banks offer remote verification)</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 4</div>
                  <p>Submit IBAN and bank details to tax authorities</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 5</div>
                  <p>Set up online banking and payment methods</p>
                </div>
              </div>
            </>
          )}
          {section === 'tax' && (
            <>
              <h3>Meeting your tax obligations in the Netherlands</h3>
              <h4 className="steps-title">Key steps</h4>
              <div className="content-steps">
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 1</div>
                  <p>Receive tax registration number (automatically assigned after KvK registration)</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 2</div>
                  <p>Register for VAT if applicable (if turnover exceeds €20,000)</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 3</div>
                  <p>Set up tax calendar for filing deadlines</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 4</div>
                  <p>Appoint a tax representative if required</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 5</div>
                  <p>Implement bookkeeping system compliant with Dutch requirements</p>
                </div>
              </div>
            </>
          )}
          {section === 'accounting' && (
            <>
              <h3>Setting up proper financial record-keeping</h3>
              <h4 className="steps-title">Key steps</h4>
              <div className="content-steps">
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 1</div>
                  <p>Set up accounting system that meets Dutch reporting requirements</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 2</div>
                  <p>Implement invoice numbering system that complies with Dutch standards</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 3</div>
                  <p>Prepare for annual financial statements</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 4</div>
                  <p>Determine if your branch requires an audit</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 5</div>
                  <p>Set up processes for expense tracking and documentation</p>
                </div>
              </div>
            </>
          )}
          {section === 'employment' && (
            <>
              <h3>If you plan to hire employees in the Netherlands</h3>
              <h4 className="steps-title">Key steps</h4>
              <div className="content-steps">
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 1</div>
                  <p>Register as an employer with the Dutch tax authorities</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 2</div>
                  <p>Set up payroll administration</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 3</div>
                  <p>Understand Dutch employment laws and requirements</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 4</div>
                  <p>Arrange appropriate insurance (liability, employee)</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 5</div>
                  <p>Create employment contracts that comply with Dutch labor law</p>
                </div>
              </div>
            </>
          )}
          {section === 'compliance' && (
            <>
              <h3>Regular obligations to maintain good standing</h3>
              <h4 className="steps-title">Key steps</h4>
              <div className="content-steps">
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 1</div>
                  <p>Annual filing of financial statements with KvK (within 12 months of fiscal year end)</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 2</div>
                  <p>Quarterly or monthly VAT returns</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 3</div>
                  <p>Annual corporate income tax return</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 4</div>
                  <p>UBO register updates when ownership changes</p>
                </div>
                <div className="dutch-step">
                  <div className="dutch-step-box">Step 5</div>
                  <p>Maintain proper corporate records and minutes</p>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="post-registration">
     
  

      <h1 className="title">Post-Registration Steps</h1>
      <p className="description">
        After your branch registration is complete, there are several important steps to ensure your business is
        fully operational and compliant in the Netherlands. Below is a comprehensive guide to post-registration
        formalities.
      </p>

      <div className="sections">
        <div className={`section ${expandedSection === 'banking' ? 'active' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('banking')}>
            <span>Banking Setup</span>
            <span className="arrow">{expandedSection === 'banking' ? '▼' : '▶'}</span>
          </div>
          {renderSectionContent('banking')}
        </div>

        <div className={`section ${expandedSection === 'tax' ? 'active' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('tax')}>
            <span>Tax Registration & Compliance</span>
            <span className="arrow">{expandedSection === 'tax' ? '▼' : '▶'}</span>
          </div>
          {renderSectionContent('tax')}
        </div>

        <div className={`section ${expandedSection === 'accounting' ? 'active' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('accounting')}>
            <span>Accounting Requirements</span>
            <span className="arrow">{expandedSection === 'accounting' ? '▼' : '▶'}</span>
          </div>
          {renderSectionContent('accounting')}
        </div>

        <div className={`section ${expandedSection === 'employment' ? 'active' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('employment')}>
            <span>Employment & HR</span>
            <span className="arrow">{expandedSection === 'employment' ? '▼' : '▶'}</span>
          </div>
          {renderSectionContent('employment')}
        </div>

        <div className={`section ${expandedSection === 'compliance' ? 'active' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('compliance')}>
            <span>Ongoing Compliance</span>
            <span className="arrow">{expandedSection === 'compliance' ? '▼' : '▶'}</span>
          </div>
          {renderSectionContent('compliance')}
        </div>
      </div>

      <div className="dutch-deadlines">
        <h2 className="dutch-deadlines-title">Key Deadlines After Registration</h2>
        <div className="dutch-deadline-list">
          <div className="dutch-deadline-item">
            <div className="dutch-deadline-marker"></div>
            <div className="dutch-deadline-content">
              <h4>Within 1 month</h4>
              <p>Register for VAT (if applicable)</p>
            </div>
          </div>

          <div className="dutch-deadline-item">
            <div className="dutch-deadline-marker"></div>
            <div className="dutch-deadline-content">
              <h4>Within 3 months</h4>
              <p>Register as employer (if hiring staff)</p>
            </div>
          </div>

          <div className="dutch-deadline-item">
            <div className="dutch-deadline-marker"></div>
            <div className="dutch-deadline-content">
              <h4>Quarterly</h4>
              <p>VAT returns (if registered for VAT)</p>
            </div>
          </div>

          <div className="dutch-deadline-item">
            <div className="dutch-deadline-marker"></div>
            <div className="dutch-deadline-content">
              <h4>Within 12 months of fiscal year end</h4>
              <p>File annual accounts with KVK</p>
            </div>
          </div>

          <div className="dutch-deadline-item">
            <div className="dutch-deadline-marker"></div>
            <div className="dutch-deadline-content">
              <h4>Within 30 days of any change</h4>
              <p>Update KVK with changes to officials, address, or activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DutchRegistration;
 