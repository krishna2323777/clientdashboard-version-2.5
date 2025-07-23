import React, { useState } from 'react';
import './ShippingChecklist.css';

const ShippingChecklist = () => {
  const [checkedItems, setCheckedItems] = useState({
    form6: false,
    form9: false,
    form11: false,
    form13: false,
    formationDeed: false,
    operatingAgreement: false,
    incumbencyCert: false,
    passport: false,
    addressProof: false,
    rentalAgreement: false
  });

  const [isLetterExpanded, setIsLetterExpanded] = useState(false);

  const calculateProgress = () => {
    const totalItems = Object.keys(checkedItems).length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / totalItems) * 100);
  };

  const handleCheckboxChange = (key) => {
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyTemplate = () => {
    const letterContent = document.querySelector('.letter-content');
    const textToCopy = letterContent.innerText;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Optional: Add visual feedback that copy was successful
        const copyButton = document.querySelector('.copy-template');
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<span>Copied!</span>';
        setTimeout(() => {
          copyButton.innerHTML = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  return (
    <div className="shipping-container">
      <h2>Shipping Checklist</h2>
      <div className="required-contents">
        <h3>Required Contents</h3>
        <div className="checklist">
        <label>
            <input
              type="checkbox"
              checked={checkedItems.form6}
              onChange={() => handleCheckboxChange('form6')}
            />
            Form 6 (completed and signed)
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.form9}
              onChange={() => handleCheckboxChange('form9')}
              />
              Form 9 (completed and signed)
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.form11}
              onChange={() => handleCheckboxChange('form11')}
              />
              Form 11 (completed and signed in two places)
          </label>                                    
          <label>
              <input
              type="checkbox"
              checked={checkedItems.form13}
              onChange={() => handleCheckboxChange('form13')}
              />
              Form 13 (if applicable, completed and signed)
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.formationDeed}
              onChange={() => handleCheckboxChange('formationDeed')}
              />
              Legalized Certificate of Formation/Formation Deed
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.operatingAgreement}
              onChange={() => handleCheckboxChange('operatingAgreement')}
              />
              Legalized Operating Agreement/Shareholders Register
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.incumbencyCert}
              onChange={() => handleCheckboxChange('incumbencyCert')}
              />
              Legalized Certificate of Incumbency
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.passport}
              onChange={() => handleCheckboxChange('passport')}
              />
              Legalized passport copy for each stakeholder
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.addressProof}
              onChange={() => handleCheckboxChange('addressProof')}
              />
              Legalized proof of address for each stakeholder (not older than 20 days)
          </label>
          <label>
              <input
              type="checkbox"
              checked={checkedItems.rentalAgreement}
              onChange={() => handleCheckboxChange('rentalAgreement')}
              />
              Rental agreement for virtual office (if applicable)
          </label>
        </div>
      </div>

      <div className="shipping-instructions">
        <h3>Shipping Instructions</h3>
        <ol>
          <li>Organize all documents in a logical order (forms first, followed by company documents, then personal documents)</li>
          <li>Use a reliable courier service with tracking capability (e.g., DHL, FedEx, UPS)</li>
          <li>Include a cover letter listing all enclosed documents</li>
          <li>Keep a complete copy of all submitted documents for your records</li>
          <li>Retain the tracking information for follow-up purposes</li>
        </ol>
      </div>

      <div className="shipping-address">
        <h3>Shipping Address</h3>
        <p>KvK Eindhoven</p>
        <p>Branch Registration Department</p>
        <p>JF Kennedylaan 2</p>
        <p>5612 AB Eindhoven</p>
        <p>The Netherlands</p>
        <p>+31 88 585 15 85</p>
      </div>

      <div className="cover-letter">
        <h3 onClick={() => setIsLetterExpanded(!isLetterExpanded)} style={{ cursor: 'pointer' }}>
          Cover Letter Template 
          <span className="expand-iconship">{isLetterExpanded ? '▲' : '▼'}</span>
        </h3>
        
        {isLetterExpanded && (
          <>
            <div className="letter-content">
              <div className="letter-header">
                <p>[Your Company Name]</p>
                <p>[Your Address]</p>
                <p>[City, Country]</p>
                <p>[Date]</p>
                <br/>
                <p>KvK Eindhoven</p>
                <p>Branch Registration Department</p>
                <p>J.F. Kennedylaan 2</p>
                <p>5612 AB, Eindhoven</p>
                <p>The Netherlands</p>
              </div>

              <p>Subject: Branch Registration Documents for [Your Company Name]</p>
              <p>Dear Sir/Madam,</p>

              <p>Please find enclosed the complete set of documents for the registration of our branch office in the Netherlands. We have included the following documents:</p>

              <ol>
                <li>Form 6: Registration of a Non-Resident Legal Entity (signed and legalized)</li>
                <li>Form 9: Registration of a Branch Office (signed and legalized)</li>
                <li>Form 11: Registration of an Official of a Legal Entity (signed and legalized)</li>
                <li>Form 13: Registration of an Authorized Representative (if applicable)</li>
                <li>Certificate of Formation/Articles of Incorporation (legalized with apostille)</li>
                <li>Operating Agreement/Shareholders Register (legalized with apostille)</li>
                <li>Certificate of Incumbency (legalized with apostille)</li>
                <li>Passport copies for all directors/officials (legalized with apostille)</li>
                <li>Proof of address for all directors/officials (legalized with apostille)</li>
                <li>Rental agreement for business address (if applicable)</li>
              </ol>

              <p>Please contact us if any additional information or documentation is required. We look forward to receiving our KvK number and extract.</p>

              <div className="letter-footer">
                <p>Sincerely,</p>
                <p>[Your Name]</p>
                <p>[Your Position]</p>
                <p>[Contact Information]</p>
              </div>
            </div>
            <button className="copy-template" onClick={handleCopyTemplate}>
              <span>Copy Template</span>
            </button>
          </>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${calculateProgress()}%` }}></div>
        <span>Checklist Progress: {calculateProgress()}% Complete</span>
      </div>

      <button 
        className="confirm-shipping"
        disabled={calculateProgress() !== 100}
      >
        Confirm Shipping
      </button>
    </div>
  );
};

export default ShippingChecklist;
