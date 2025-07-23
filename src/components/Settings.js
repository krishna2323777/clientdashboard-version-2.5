import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './SupabaseClient';
import UserProfileView from './UserProfileView';
import UserProfileForm from './UserProfileForm';

import './Settings.css';
import { FaUserAlt, FaReceipt, FaBell, FaHome } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('profile');
  const [profileMode, setProfileMode] = useState('view'); // 'view' or 'edit'
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingInvoiceId, setProcessingInvoiceId] = useState(null);

  useEffect(() => {
    if (location.state?.section === 'profile' && location.state?.mode === 'edit') {
      setActiveSection('profile');
      setProfileMode('edit');
    }
  }, [location.state]);

  useEffect(() => {
    if (activeSection === 'billing') {
      fetchInvoices();
      
      // Set up a polling interval to refresh invoices every 10 seconds
      // This helps update the UI when a payment is completed in another tab
      const intervalId = setInterval(() => {
        fetchInvoices();
      }, 10000);
      
      // Clean up the interval when component unmounts or section changes
      return () => clearInterval(intervalId);
    }
  }, [activeSection]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('No user session found');
      }

      // Get the user ID from the session
      const userId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('auth_user_id', userId) // Match by user ID instead of email
        .eq('approved', true)
        .eq('visible_to_client', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get signed URLs for invoice PDFs and payment links
      const invoicesWithUrls = await Promise.all(
        data.map(async (invoice) => {
          let updatedInvoice = { ...invoice };
          
          // Get signed URL for PDF
          if (invoice.pdf_url) {
            const { data: urlData } = await supabase
              .storage
              .from('private-invoices')
              .createSignedUrl(invoice.pdf_url, 3600); // URL valid for 1 hour

            updatedInvoice.signed_pdf_url = urlData?.signedUrl;
          }
          
          // Get payment link if it exists
          if (invoice.stripe_payment_link) {
            updatedInvoice.payment_link = invoice.stripe_payment_link;
          }
          
          return updatedInvoice;
        })
      );

      setInvoices(invoicesWithUrls);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'eur'
    }).format(amount);
  };

  const createStripePaymentIntent = async (invoiceData) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          invoice_number: invoiceData.invoice_number,
          amount: invoiceData.total,
          currency: 'usd',
          description: `Payment for Invoice #${invoiceData.invoice_number}`,
          client_email: invoiceData.customer_email,
          metadata: {
            invoice_number: invoiceData.invoice_number,
            client_email: invoiceData.customer_email,
            user_id: invoiceData.user_id
          }
        }
      });

      if (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(error.message);
      }

      if (!data || !data.clientSecret) {
        throw new Error('No client secret received from payment intent creation');
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      console.error('Error in createStripePaymentIntent:', error);
      throw error;
    }
  };

  const createPaymentLink = async (invoice) => {
    try {
      setProcessingPayment(true);
      setProcessingInvoiceId(invoice.id);
      
      console.log("Creating payment intent for invoice:", invoice);
      
      const result = await createStripePaymentIntent({
        invoice_number: invoice.invoice_number,
        total: invoice.total,
        customer_email: invoice.client_email,
        user_id: invoice.auth_user_id
      });
      
      if (!result.clientSecret) {
        throw new Error('Failed to create payment intent');
      }
      
      // Generate the payment link URL
      const paymentLinkUrl = `/payment?payment_intent=${result.clientSecret}`;
      
      // Update the invoice with payment status and payment link
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ 
          payment_status: false
          
        })
        .eq('id', invoice.id);
        
      if (invoiceError) throw invoiceError;
      
      // Then create a payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_number: invoice.invoice_number,
          stripe_payment_id: result.paymentIntentId,
          amount: invoice.total,
          currency: 'eur',
          status: 'pending',
          client_email: invoice.client_email,
          user_id: invoice.auth_user_id,
          metadata: {
            invoice_id: invoice.id
          }
        });
        
      if (paymentError) throw paymentError;
      
      // Update the local state
      setInvoices(prevInvoices => prevInvoices.map(inv => 
        inv.id === invoice.id ? { 
          ...inv, 
          payment_status: false,
          payment_link: paymentLinkUrl, // Update the link in UI state
          stripe_payment_link: paymentLinkUrl // Ensure this matches the database field
        } : inv
      ));
      
      // Open payment in new tab
      navigate(paymentLinkUrl);
      
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.message);
    } finally {
      setProcessingPayment(false);
      setProcessingInvoiceId(null);
    }
  };

  const getPaymentStatus = async (invoice) => {
    try {
      // First check if the invoice is already marked as paid
      if (invoice.payment_status === true) {
        return true;
      }
      
      // If not, check if there's a successful payment record
      const { data, error } = await supabase
        .from('payments')
        .select('status')
        .eq('invoice_number', invoice.invoice_number)
        .eq('status', 'succeeded')
        .limit(1);
        
      if (error) throw error;
      
      // If we have at least one successful payment, consider it paid
      return data && data.length > 0;
    } catch (err) {
      console.error('Error checking payment status:', err);
      return false;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="profile-container">
            <div className="profile-tabs">
              <button 
                className={`profile-tab ${profileMode === 'view' ? 'active' : ''}`}
                onClick={() => setProfileMode('view')}
              >
                View Profile
              </button>
              <button 
                className={`profile-tab ${profileMode === 'edit' ? 'active' : ''}`}
                onClick={() => setProfileMode('edit')}
              >
                Edit Profile
              </button>
            </div>
            <div className="profile-content">
              {profileMode === 'view' ? (
                <UserProfileView onEdit={() => setProfileMode('edit')} />
              ) : (
                <UserProfileForm onCancel={() => setProfileMode('view')} />
              )}
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="billing-container">
            <h2>Your Invoices</h2>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading invoices...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="no-invoices">
                <p>No invoices available at the moment.</p>
              </div>
            ) : (
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Services</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Payment Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const isUnpaid = invoice.payment_status !== true;
                    
                    return (
                    <tr key={invoice.id}>
                      <td className="invoice-number">
                        {invoice.invoice_number}
                      </td>
                      <td className="date-cell">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="date-cell">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="services-cell">
                        {invoice.products && invoice.products.map((product, idx) => (
                          <div key={idx} className="service-item">
                            {product.description || product.name}
                          </div>
                        ))}
                      </td>
                      <td className="total-cell">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="payment-status-cell">
                        <span className={`payment-status ${isUnpaid ? 'unpaid' : 'paid'}`}>
                          {isUnpaid ? 'Unpaid' : 'Paid'}
                        </span>
                      </td>
                      <td className="payment-link-cell">
                        {isUnpaid ? (
                          invoice.payment_link ? (
                            <a
                              href={invoice.payment_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pay-button"
                            >
                              <span className="pay-icon">💳</span>
                              Pay Now
                            </a>
                          ) : (
                            <button
                              onClick={() => createPaymentLink(invoice)}
                              disabled={processingPayment && processingInvoiceId === invoice.id}
                              className="pay-button"
                            >
                              <span className="pay-icon">💳</span>
                              {processingPayment && processingInvoiceId === invoice.id ? 'Processing...' : 'Pay Now'}
                            </button>
                          )
                        ) : (
                          <span className="payment-complete">✓ Payment Complete</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        {invoice.signed_pdf_url && (
                          <a
                            href={invoice.signed_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-button"
                          >
                            <span className="download-icon">📄</span>
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div>
            <h2>Notification Settings</h2>
            <p>Notification preferences will be implemented in a future update.</p>
          </div>
        );
      case 'security':
        return (
          <div>
            <h2>Security Settings</h2>
            <p>Security settings will be implemented in a future update.</p>
          </div>
        );
      default:
        return (
          <div className="profile-container">
            <div className="profile-tabs">
              <button 
                className={`profile-tab ${profileMode === 'view' ? 'active' : ''}`}
                onClick={() => setProfileMode('view')}
              >
                View Profile
              </button>
              <button 
                className={`profile-tab ${profileMode === 'edit' ? 'active' : ''}`}
                onClick={() => setProfileMode('edit')}
              >
                Edit Profile
              </button>
            </div>
            <div className="profile-content">
              {profileMode === 'view' ? (
                <UserProfileView onEdit={() => setProfileMode('edit')} />
              ) : (
                <UserProfileForm onCancel={() => setProfileMode('view')} />
              )}
            </div>
          </div>
        );
    }
  };

  // Add this check in your component
  const isMobile = window.innerWidth <= 768;

  // Update the return statement to include mobile class
  return (
    <div className={`settings-container ${isMobile ? 'mobile' : ''}`}>
      <div className="settings-content">
        {renderContent()}
      </div>
      <div className="settings-sidebar">
        {!isMobile && <h2>Settings</h2>}
        <div className="settings-nav">
          <button 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <FaUserAlt />
            <span>Profile</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveSection('billing')}
          >
            <FaReceipt />
            <span>Billing</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <FaBell />
            <span>Alerts</span>
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <FaHome />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
