import React from 'react';
import { Link } from 'react-router-dom';
import './SubscriptionRequired.css';

const SubscriptionRequired = () => {
  return (
    <div className="subscription-required">
      <div className="subscription-content">
        <h1>Premium Feature</h1>
        <div className="lock-icon">🔒</div>
        <p>This feature requires a subscription to access.</p>
        <p>Please contact our sales team to upgrade your account.</p>
        
        <div className="subscription-actions">
          <Link to="/dashboard" className="back-button">Back to Dashboard</Link>
          <a href="mailto:support@houseofcomapnies.io" className="contact-button">Contact Sales</a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
