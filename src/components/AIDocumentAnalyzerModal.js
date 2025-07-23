import React, { useState, useEffect } from 'react';
import { supabase } from './SupabaseClient';
import axios from 'axios';
import './AIDocumentAnalyzer.css';

const AIDocumentAnalyzerModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserId();
    fetchSummaries();
  }, []);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
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
      fetchSummaries(); // Refresh the summaries list
      
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>AI Document Analyzer</h2>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="upload-section">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="analyze-button"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {result && (
          <div className="analysis-result">
            <h3>Analysis Results</h3>
            <div className="result-content">
              <div><b>Summary:</b> {result.summary}</div>
              <div className="key-info">
                <b>Key Information</b>
                <div>Document Type: {result.documentType}</div>
                <div>Reference Number: {result.referenceNumber}</div>
                <div>Total Due: {result.totalDue}</div>
                <div>Filing Status: {result.filingStatus}</div>
              </div>
              <div className="deadlines">
                <b>Important Deadlines</b>
                <ul>
                  {result.deadlines?.map((d, i) => (
                    <li key={i}>{d.type}: <span>{d.date}</span></li>
                  ))}
                </ul>
              </div>
              <div className="recommendations">
                <b>Recommendations</b>
                <ul>
                  {result.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
              <button 
                onClick={handleSave}
                disabled={submitting}
                className="save-button"
              >
                {submitting ? "Saving..." : "Save Analysis"}
              </button>
            </div>
          </div>
        )}

        <div className="previous-summaries">
          <h3>Previous Analyses</h3>
          <div className="summaries-grid">
            {summaries.map((s) => (
              <div key={s.id} className="summary-item">
                <div className="summary-filename">{s.filename}</div>
                <div className="summary-content">{s.summary}</div>
                <div className="timestamp">
                  {new Date(s.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentAnalyzerModal;