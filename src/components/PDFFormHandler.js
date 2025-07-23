import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import './PDFFormHandler.css';

const PDFFormHandler = ({ templateUrl, formFields, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Fetch company information
      const { data: companyData, error: companyError } = await supabase
        .from('company_information')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (companyError) throw companyError;

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;

      // Combine the data
      const combinedData = {
        ...companyData,
        ...userData,
        // Add any additional mappings needed for the form
      };

      setFormData(combinedData);
      await loadPDFTemplate();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPDFTemplate = async () => {
    try {
      // Fetch the PDF template
      const response = await fetch(templateUrl);
      const pdfBytes = await response.arrayBuffer();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      setPdfData(pdfDoc);
    } catch (err) {
      setError('Error loading PDF template');
      console.error('Error loading PDF:', err);
    }
  };

  const fillPDFForm = async () => {
    try {
      if (!pdfData || !formData) {
        throw new Error('PDF template or form data not loaded');
      }

      // Get the first page of the PDF
      const pages = pdfData.getPages();
      const firstPage = pages[0];

      // Get the form fields
      const form = pdfData.getForm();

      // Fill each form field with corresponding data
      Object.entries(formFields).forEach(([fieldName, dataKey]) => {
        const field = form.getTextField(fieldName);
        if (field && formData[dataKey]) {
          field.setText(formData[dataKey].toString());
        }
      });

      // Save the PDF
      const pdfBytes = await pdfData.save();
      
      // Create a download link
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'filled-form.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError('Error filling PDF form');
      console.error('Error filling PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="pdf-form-handler loading">
        <div className="loading-spinner"></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-form-handler error">
        <p className="error-message">{error}</p>
        <button onClick={fetchClientData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-form-handler">
      <div className="form-preview">
        <h3>Form Preview</h3>
        <div className="preview-content">
          {Object.entries(formFields).map(([fieldName, dataKey]) => (
            <div key={fieldName} className="preview-field">
              <span className="field-label">{fieldName}:</span>
              <span className="field-value">{formData[dataKey] || 'Not filled'}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          onClick={fillPDFForm}
          className="fill-button"
          disabled={!pdfData || !formData}
        >
          Fill and Download PDF
        </button>
      </div>
    </div>
  );
};

export default PDFFormHandler; 