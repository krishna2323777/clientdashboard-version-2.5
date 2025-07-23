import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormSelection.css';
import { supabase } from './SupabaseClient';

function FormSelection() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Fetch all form submissions
      const [form6Data, form9Data, form11Data, form13Data] = await Promise.all([
        supabase
          .from('form_6_submissions')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('form_9_submissions')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('form_11_submissions')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('form_13_submissions')
          .select('*')
          .eq('user_id', user.id)
      ]);

      // Combine and format all submissions
      const allSubmissions = [
        ...(form6Data.data || []).map(s => ({ ...s, formType: 'form-6' })),
        ...(form9Data.data || []).map(s => ({ ...s, formType: 'form-9' })),
        ...(form11Data.data || []).map(s => ({ ...s, formType: 'form-11' })),
        ...(form13Data.data || []).map(s => ({ ...s, formType: 'form-13' }))
      ].sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));

      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSelect = (formPath) => {
    navigate(formPath);
  };

  const cleanFilePath = (filePath) => {
    // If the path already looks like a UUID/filename format, return it as is
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.*\.pdf$/i.test(filePath)) {
      console.log('Path already in correct format:', filePath);
      return filePath;
    }
    
    // Otherwise use the original cleaning logic
    const parts = filePath.split('/');
    const cleanPath = parts.slice(-2).join('/'); // Get last two parts: UUID/filename
    console.log('Original path:', filePath);
    console.log('Cleaned path:', cleanPath);
    return cleanPath;
  };

  const getBucketName = (filePath) => {
    console.log('Original file path:', filePath);
    
    // Extract form type from filename
    const formMatch = filePath.match(/form-(\d+)/i) || filePath.match(/form(\d+)/i);
    if (formMatch && formMatch[1]) {
      const formNumber = formMatch[1];
      return `form-${formNumber}`;
    }
    
    // Fallback to form-documents if no match
    return 'form-documents';
  };

  const handleDownload = async (bucketName, filePath) => {
    try {
      const cleanPath = cleanFilePath(filePath);
      
      // Extract form type directly from the path for more reliable bucket determination
      let targetBucket = '';
      if (filePath.toLowerCase().includes('form-9') || filePath.toLowerCase().includes('form9')) {
        targetBucket = 'form-9';
      } else if (filePath.toLowerCase().includes('form-13') || filePath.toLowerCase().includes('form13')) {
        targetBucket = 'form-13';
      } else if (filePath.toLowerCase().includes('form-6') || filePath.toLowerCase().includes('form6')) {
        targetBucket = 'form-6';
      } else if (filePath.toLowerCase().includes('form-11') || filePath.toLowerCase().includes('form11')) {
        targetBucket = 'form-11';
      } else {
        // Use provided bucket name or default to form-documents
        targetBucket = bucketName || 'form-documents';
      }
      
      console.log('Downloading from bucket:', targetBucket, 'path:', cleanPath);
      
      // Skip bucket existence check as it might be causing permission issues
      const { data, error } = await supabase.storage
        .from(targetBucket)
        .download(cleanPath);
        
      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanPath.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file: ' + error.message);
    }
  };

  const handleView = async (bucketName, filePath) => {
    try {
      const cleanPath = cleanFilePath(filePath);
      
      // Extract form type directly from the path for more reliable bucket determination
      let targetBucket = '';
      if (filePath.toLowerCase().includes('form-9') || filePath.toLowerCase().includes('form9')) {
        targetBucket = 'form-9';
      } else if (filePath.toLowerCase().includes('form-13') || filePath.toLowerCase().includes('form13')) {
        targetBucket = 'form-13';
      } else if (filePath.toLowerCase().includes('form-6') || filePath.toLowerCase().includes('form6')) {
        targetBucket = 'form-6';
      } else if (filePath.toLowerCase().includes('form-11') || filePath.toLowerCase().includes('form11')) {
        targetBucket = 'form-11';
      } else {
        // Use provided bucket name or default to form-documents
        targetBucket = bucketName || 'form-documents';
      }
      
      console.log('Viewing file from bucket:', targetBucket, 'path:', cleanPath);

      try {
        // First try to download the file to verify it exists
        const { data: fileData, error: fileError } = await supabase.storage
          .from(targetBucket)
          .download(cleanPath);
          
        if (fileError) {
          console.error('File not found in bucket:', fileError);
          throw fileError;
        }
        
        // If download succeeds, create a local blob URL instead of using Supabase public URL
        const url = URL.createObjectURL(fileData);
        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Clean up the URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 60000); // Clean up after 1 minute
        
      } catch (downloadError) {
        console.log('Download failed, trying public URL as fallback');
        
        // Fallback to public URL if download fails
        const { data, error } = await supabase.storage
          .from(targetBucket)
          .getPublicUrl(cleanPath);

        if (error) {
          console.error('Error getting public URL:', error);
          throw error;
        }

        if (data?.publicUrl) {
          // Force PDF to open in a new tab
          const pdfUrl = `${data.publicUrl}#view=FitH`;
          window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        } else {
          throw new Error('Unable to get public URL');
        }
      }
    } catch (error) {
      console.error('View error:', error);
      alert(`Error viewing file: ${error.message}. Please try downloading instead.`);
    }
  };

  return (
    <div className="form-selection-container">
      <header className="form-selection-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Dutch Chamber of Commerce</h1>
            <p className="subtitle">Registration Form Generator</p>
          </div>
          <div className="header-right">
            <div className="language-selector">
              <img src="/assets/nl-flag.svg" alt="Dutch flag" />
              <span>KVK Forms</span>
            </div>
          </div>
        </div>
      </header>

      <main className="form-selection-main">
        <h2 className="section-title">Select a form to generate</h2>
        
        <div className="forms-grid">
          {/* Form 6 Card */}
          <div className="form-card" onClick={() => handleFormSelect('/kvk-registration')}>
            <div className="form-details">
              <div className="form-header">
                <h3>Form 6</h3>
                <span className="kvk-badge">KVK</span>
              </div>
              <h4>Registration of a non-resident legal entity</h4>
              <p>This form registers your Swedish company as a non-resident legal entity with the Dutch Chamber of Commerce (KVK).</p>
            </div>
            <button className="generate-button">
              Generate Form
              <span className="arrow">→</span>
            </button>
          </div>

          {/* Form 9 Card */}
          <div className="form-card" onClick={() => handleFormSelect('/form-9')}>
            <div className="form-details">
              <div className="form-header">
                <h3>Form 9</h3>
                <span className="kvk-badge">KVK</span>
              </div>
              <h4>Registration of a branch office</h4>
              <p>This form specifically registers your branch office in the Netherlands under the Swedish company's registration.</p>
            </div>
            <button className="generate-button">
              Generate Form
              <span className="arrow">→</span>
            </button>
          </div>

          {/* Form 11 Card */}
          <div className="form-card" onClick={() => handleFormSelect('/form-11')}>
            <div className="form-details">
              <div className="form-header">
                <h3>Form 11</h3>
                <span className="kvk-badge">KVK</span>
              </div>
              <h4>Registration of an official of a legal entity</h4>
              <p>This form registers the official representatives or directors of the legal entity in the Netherlands.</p>
            </div>
            <button className="generate-button">
              Generate Form
              <span className="arrow">→</span>
            </button>
          </div>

          {/* Form 13 Card */}
          <div className="form-card" onClick={() => handleFormSelect('/form-13')}>
            <div className="form-details">
              <div className="form-header">
                <h3>Form 13</h3>
                <span className="kvk-badge">KVK</span>
              </div>
              <h4>Registration of an authorized business agent</h4>
              <p>This form registers any authorized business agents who will act on behalf of the company in the Netherlands.</p>
            </div>
            <button className="generate-button">
              Generate Form
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </main>

      <section className="generated-documents-section">
        <h2 className="section-title">Generated Documents</h2>
        {loading ? (
          <div className="loading">Loading your documents...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="no-documents">
            <p>No documents generated yet. Select a form above to get started.</p>
          </div>
        ) : (
          <div className="documents-table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Form Type</th>
                  <th>Date Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => {
                  // Get form type by checking file path
                  const bucketName = getBucketName(submission.file_path);
                  const formNumber = bucketName ? bucketName.split('-')[1] : '';

                  return (
                    <tr key={index}>
                      <td>Form {formNumber}</td>
                      <td>{new Date(submission.submission_date).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDownload(bucketName, submission.file_path)}
                          className="action-btn download-btn"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleView(bucketName, submission.file_path)}
                          className="action-btn view-btn"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default FormSelection;

export const cleanFilePath = (filePath) => {
  // If the path already looks like a UUID/filename format, return it as is
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.*\.pdf$/i.test(filePath)) {
    console.log('Path already in correct format:', filePath);
    return filePath;
  }
  
  // Otherwise use the original cleaning logic
  const parts = filePath.split('/');
  const cleanPath = parts.slice(-2).join('/'); // Get last two parts: UUID/filename
  console.log('Original path:', filePath);
  console.log('Cleaned path:', cleanPath);
  return cleanPath;
};

export const getBucketName = (filePath) => {
  console.log('Original file path:', filePath);
  
  // Extract form type from filename
  const formMatch = filePath.match(/form-(\d+)/i) || filePath.match(/form(\d+)/i);
  if (formMatch && formMatch[1]) {
    const formNumber = formMatch[1];
    return `form-${formNumber}`;
  }
  
  // Fallback to form-documents if no match
  return 'form-documents';
};