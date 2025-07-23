import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../src/components/SupabaseClient';
import axios from 'axios';
import { format } from 'date-fns';
import './AIDocumentAnalyzer.css';
import { FaArrowLeft, FaUpload, FaSave, FaDownload } from 'react-icons/fa';

const AIDocumentAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserId();
    fetchSummaries();
  }, []);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else {
      navigate('/login');
    }
  };

  const fetchSummaries = async () => {
    const { data } = await supabase
      .from('ai_document_summaries')
      .select('*')
      .order('created_at', { ascending: false });
    setSummaries(data || []);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(
        'https://doc-analyser-backend.onrender.com/api/analyze',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setResult(data.analysis);
    } catch (err) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !userId) {
      setError('Please analyze the document first and ensure you are logged in');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create file path
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('ai-analyzed-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get payment date from deadlines
      const paymentDeadline = result.deadlines?.find(d => 
        d.type.toLowerCase().includes('payment') || 
        d.type.toLowerCase().includes('due')
      );
      const paymentDate = paymentDeadline?.date || new Date().toISOString().split('T')[0];

      // Save to database
      const { error: dbError } = await supabase
        .from('ai_document_summaries')
        .insert([{
          user_id: userId,
          filename: file.name,
          document_type: result.documentType || 'Unknown',
          payment_date: paymentDate,
          created_at: new Date().toISOString(),
          summary: result.summary,
          deadlines: result.deadlines || [],
          recommendations: result.recommendations || [],
          file_path: filePath,
          reference_number: result.referenceNumber,
          total_due: result.totalDue,
          filing_status: result.filingStatus
        }]);

      if (dbError) throw dbError;

      setSuccess('Document saved successfully!');
      fetchSummaries();
      
      // Reset form after delay
      setTimeout(() => {
        setFile(null);
        setResult(null);
        setSuccess(null);
      }, 2000);

    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save document: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (summary) => {
    try {
      const { data, error } = await supabase.storage
        .from('ai-analyzed-docs')
        .download(summary.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = summary.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file: ' + error.message);
    }
  };

  return (
    <div className="ai-analyzer-container">
      <div className="ai-analyzer-header">
        <button onClick={() => navigate('/mailbox')} className="back-button">
          <FaArrowLeft /> Back to Mailbox
        </button>
        <h1>AI Document Analyzer</h1>
      </div>

      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.doc,.docx"
          />
          <span className="file-name">{file ? file.name : 'Choose a file'}</span>
        </div>
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="analyze-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span> Analyzing...
            </>
          ) : (
            <>
              <FaUpload /> Analyze Document
            </>
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {result && (
        <div className="analysis-result">
          <h2>Analysis Results</h2>
          <div className="result-content">
            <div className="result-summary">
              <h3>Document Summary</h3>
              <p>{result.summary}</p>
            </div>
            
            <div className="result-details">
              <div className="key-info">
                <h3>Key Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Document Type</label>
                    <span>{result.documentType}</span>
                  </div>
                  <div className="info-item">
                    <label>Reference Number</label>
                    <span>{result.referenceNumber}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Due</label>
                    <span>{result.totalDue}</span>
                  </div>
                  <div className="info-item">
                    <label>Filing Status</label>
                    <span>{result.filingStatus}</span>
                  </div>
                </div>
              </div>

              <div className="deadlines">
                <h3>Important Deadlines</h3>
                <ul>
                  {result.deadlines?.map((d, i) => (
                    <li key={i}>
                      <span className="deadline-type">{d.type}</span>
                      <span className="deadline-date">{d.date}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recommendations">
                <h3>Recommendations</h3>
                <ul>
                  {result.recommendations?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={submitting}
              className="save-button"
            >
              {submitting ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="previous-summaries">
        <h2>Previous Analyses</h2>
        <div className="summaries-grid">
          {summaries.map((s) => (
            <div key={s.id} className="summary-item">
              <div className="summary-header">
                <div className="summary-filename">{s.filename}</div>
                <button
                  onClick={() => handleDownload(s)}
                  className="download-button"
                  title="Download original document"
                >
                  <FaDownload />
                </button>
              </div>
              <div className="summary-type">{s.document_type}</div>
              <div className="summary-content">{s.summary}</div>
              <div className="summary-footer">
                <div className="timestamp">
                  {format(new Date(s.created_at), 'PPP')}
                </div>
                {s.total_due && (
                  <div className="total-due">
                    Total: {s.total_due}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIDocumentAnalyzer;