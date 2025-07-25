import React, { useEffect, useState } from 'react';
import { supabase } from './SupabaseClient';
import './Settings.css';

const Invoices = () => {
  const [invoiceTab, setInvoiceTab] = useState('Incoming');
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);

  useEffect(() => {
    if (invoiceTab === 'Incoming') {
      fetchInvoices();
    }
    // eslint-disable-next-line
  }, [invoiceTab]);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      setInvoiceError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('No user session found');
      const userId = sessionData.session.user.id;
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('approved', true)
        .eq('visible_to_client', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Get signed URLs for invoice PDFs and payment links
      const invoicesWithUrls = await Promise.all(
        data.map(async (invoice) => {
          let updatedInvoice = { ...invoice };
          if (invoice.pdf_url) {
            const { data: urlData } = await supabase
              .storage
              .from('private-invoices')
              .createSignedUrl(invoice.pdf_url, 3600);
            updatedInvoice.signed_pdf_url = urlData?.signedUrl;
          }
          if (invoice.stripe_payment_link) {
            updatedInvoice.payment_link = invoice.stripe_payment_link;
          }
          return updatedInvoice;
        })
      );
      setInvoices(invoicesWithUrls);
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setLoadingInvoices(false);
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

  return (
    <div style={{ minHeight: '100vh', background: '#220938', color: '#fff', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 24px 0', color: '#fff' }}>Invoices</h1>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['Incoming', 'Outgoing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setInvoiceTab(tab)}
              style={{
                background: invoiceTab === tab ? '#3B82F6' : 'transparent',
                color: invoiceTab === tab ? '#fff' : '#9CA3AF',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {invoiceTab === 'Incoming' ? (
          <div className="billing-container">
            <h2 style={{ color: '#fff' }}>Your Invoices</h2>
            {loadingInvoices ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading invoices...</p>
              </div>
            ) : invoiceError ? (
              <div className="error-container">
                <p className="error-message">{invoiceError}</p>
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
                        <td className="invoice-number">{invoice.invoice_number}</td>
                        <td className="date-cell">{formatDate(invoice.date)}</td>
                        <td className="date-cell">{formatDate(invoice.due_date)}</td>
                        <td className="services-cell">
                          {invoice.products && invoice.products.map((product, idx) => (
                            <div key={idx} className="service-item">
                              {product.description || product.name}
                            </div>
                          ))}
                        </td>
                        <td className="total-cell">{formatCurrency(invoice.total)}</td>
                        <td className="payment-status-cell">
                          <span className={`payment-status ${isUnpaid ? 'unpaid' : 'paid'}`}>{isUnpaid ? 'Unpaid' : 'Paid'}</span>
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
                              <span style={{ color: '#9CA3AF' }}>No Link</span>
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="no-invoices">
            <p>Outgoing invoices feature is <b>Coming Soon</b>!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices; 