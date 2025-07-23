import React from 'react';
import { useNavigate } from 'react-router-dom';
import './KVKRegistrationSidebar.css';

function KVKRegistrationSidebar() {
  const navigate = useNavigate();

  const handleFormSelect = (formType) => {
    switch(formType) {
      case 'form-6':
        navigate('/kvk-registration');
        break;
      case 'form-9':
        navigate('/form-9');
        break;
      case 'form-11':
        navigate('/form-11');
        break;
      case 'form-13':
        navigate('/form-13');
        break;
      default:
        break;
    }
  };

  return (
    <div className="kvk-registration-sidebar">
      <div className="form-options">
        <div 
          className="form-option"
          onClick={() => handleFormSelect('form-6')}
        >
          <span className="form-icon">📄</span>
          <div className="form-info">
            <h4>Form 6</h4>
            <p>Registration of a Non-resident Company</p>
          </div>
        </div>
        <div 
          className="form-option"
          onClick={() => handleFormSelect('form-9')}
        >
          <span className="form-icon">🏢</span>
          <div className="form-info">
            <h4>Form 9</h4>
            <p>Registration of a Company Branch</p>
          </div>
        </div>
        <div 
          className="form-option"
          onClick={() => handleFormSelect('form-11')}
        >
          <span className="form-icon">👥</span>
          <div className="form-info">
            <h4>Form 11</h4>
            <p>Registration of a Legal Entity Official</p>
          </div>
        </div>
        <div 
          className="form-option"
          onClick={() => handleFormSelect('form-13')}
        >
          <span className="form-icon">✍️</span>
          <div className="form-info">
            <h4>Form 13</h4>
            <p>Registration of Authorized Persons</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KVKRegistrationSidebar; 