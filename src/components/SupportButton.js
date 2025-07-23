import React, { useState } from 'react';
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import { FiHelpCircle } from 'react-icons/fi';
import './SupportButton.css';

const SupportButton = ({ collapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('newTicket'); // 'newTicket' or 'ticketList'

  const toggleSupport = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="nav-like-button" onClick={toggleSupport}>
        <span className="icon"><FiHelpCircle /></span>
        {!collapsed && <span className="label">Support</span>}
      </div>

      {isOpen && (
        <div className="support-dialog-overlay" onClick={handleClose}>
          <div className="support-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="support-dialog-header">
              <div className="support-tabs">
                <button 
                  className={`tab-button ${activeTab === 'newTicket' ? 'active' : ''}`}
                  onClick={() => switchTab('newTicket')}
                >
                  New Ticket
                </button>
                <button 
                  className={`tab-button ${activeTab === 'ticketList' ? 'active' : ''}`}
                  onClick={() => switchTab('ticketList')}
                >
                  My Tickets
                </button>
              </div>
              <button className="close-button" onClick={handleClose}>&times;</button>
            </div>
            
            <div className="support-dialog-content">
              {activeTab === 'newTicket' ? (
                <TicketForm onClose={handleClose} />
              ) : (
                <TicketList />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportButton;