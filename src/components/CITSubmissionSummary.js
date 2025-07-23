import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assests/logo.png';
const CITSubmissionSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const summary = location.state?.summary || {};
  const user_id = summary.user_id || null; // Adjust if you have user context
  const [breakdown, setBreakdown] = React.useState(summary.tax_return_summary?.breakdown || {});
  const [sourceFiles, setSourceFiles] = React.useState(summary.source_files || []);
  const [auditFlags, setAuditFlags] = React.useState(summary.audit_flags || []);
  // Get uploaded files from navigation state if available
  const [uploadedFiles, setUploadedFiles] = React.useState(location.state?.files || []);
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  // Fetch processed data for user on mount
  React.useEffect(() => {
    async function fetchProcessedData() {
      if (!user_id) return;
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .eq('user_id', user_id)
        .order('id', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const doc = data[0];
        setBreakdown({
          'Revenue': doc.revenue,
          'Expenses': doc.expenses,
          'Depreciation': doc.depreciation,
          'Deductions': doc.deductions,
          'Taxable Income': doc.taxable_income,
          'Applied Tax Rate': doc.tax_rate,
          'Final Tax Owed': doc.final_tax_owed
        });
        setSourceFiles([doc.document_name]);
        // Optionally set auditFlags and uploadedFiles if you store them
        setSubmitted(true); // Show thank you message if already submitted
      }
    }
    fetchProcessedData();
  }, [user_id]);
  // Function to store processed data in Supabase
  const storeProcessedDocument = async () => {
    setLoading(true);
    const document_name = sourceFiles[0] || (uploadedFiles[0]?.name ?? '');
    const revenue = breakdown['Revenue'] ?? 0;
    const expenses = breakdown['Expenses'] ?? 0;
    const depreciation = breakdown['Depreciation'] ?? 0;
    const deductions = breakdown['Deductions'] ?? 0;
    const taxable_income = breakdown['Taxable Income'] ?? 0;
    let tax_rate_raw = breakdown['Applied Tax Rate'] ?? 0;
    let tax_rate = 0;
    if (typeof tax_rate_raw === 'string') {
      tax_rate = parseFloat(tax_rate_raw.replace('%', '').trim()) || 0;
    } else {
      tax_rate = Number(tax_rate_raw) || 0;
    }
    const final_tax_owed = breakdown['Final Tax Owed'] ?? 0;
    const { error } = await supabase
      .from('processed_documents')
      .insert([
        {
          user_id,
          document_name,
          revenue,
          expenses,
          depreciation,
          deductions,
          taxable_income,
          tax_rate,
          final_tax_owed
        }
      ]);
    setLoading(false);
    if (error) {
      alert('Error storing processed data: ' + error.message);
    } else {
      setSubmitted(true);
    }
  };
  const [viewingPdfIdx, setViewingPdfIdx] = React.useState(null);

  // Download summary as PDF
  const handleDownloadPDF = async () => {
    const input = document.getElementById('cit-summary-card');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    // Add logo
    const logoImg = new Image();
    logoImg.src = logo;
    await new Promise(resolve => { logoImg.onload = resolve; });
    pdf.addImage(logoImg, 'PNG', 24, 24, 60, 60);
    // Add title
    pdf.setFontSize(22);
    pdf.setTextColor('#222');
    pdf.text('Corporate Tax Analyzer Summary', 100, 60, { baseline: 'middle' });
    // Add summary image below title
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 48;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 24, 100, pdfWidth, pdfHeight);
    pdf.save('CIT_Submission_Summary.pdf');
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', background: '#f7f9fa', color: '#222', borderRadius: 12, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ color: 'rgb(234 58 112 / var(--tw-bg-opacity, 1))' }}>Thank you for your submission!</h2>
        <p>Your Corporate Income Tax return has been submitted successfully. Our team will review your documents and contact you if further information is needed.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#f7f9fa', color: '#222', borderRadius: 12, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h2 style={{color:'#000'}}>Submit Corporate Income Tax Return</h2>
      <div style={{ background: '#e6f0fa', borderRadius: 8, padding: 16, margin: '20px 0' }}>
        <span style={{ color: '#1976d2', fontWeight: 500 }}>
          &#x1F4C4; Your documents have been processed. Your CIT return is now ready for final review and submission.
        </span>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 24, marginBottom: 24, background: '#fcfcfc', color: '#222' }} id="cit-summary-card">
        <h3 style={{ fontWeight: 700, color: '#222', marginBottom: 18 }}>Submission Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 10, alignItems: 'center', marginTop: 12 }}>
          <div style={{ color: '#222' }}>Revenue:</div>
          <div style={{ color: '#222', fontWeight: 500 }}>€{(breakdown['Revenue'] ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div style={{ color: '#222' }}>Expenses:</div>
          <div style={{ color: '#222', fontWeight: 500 }}>€{(breakdown['Expenses'] ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div style={{ color: '#222' }}>Depreciation:</div>
          <div style={{ color: '#222', fontWeight: 500 }}>€{(breakdown['Depreciation'] ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div style={{ color: '#222' }}>Deductions:</div>
          <div style={{ color: '#222', fontWeight: 500 }}>€{(breakdown['Deductions'] ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div style={{ color: '#222' }}>Taxable Income:</div>
          <div style={{ color: '#222', fontWeight: 500 }}>€{(breakdown['Taxable Income'] ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <div style={{ color: '#222' }}>Applied Tax Rate:</div>
          <div style={{ color: '#222', fontWeight: 500 }}>{breakdown['Applied Tax Rate'] ?? 'N/A'}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginTop: 10 }}>Final Tax Owed:</div>
          <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 18, textAlign: 'right' }}>€{(breakdown['Final Tax Owed'] ?? 0).toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        {sourceFiles.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <b style={{ color: '#222' }}>Source Files:</b>
            <ul style={{ color: '#222', margin: '8px 0 0 18px' }}>{sourceFiles.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}
        {auditFlags.length > 0 && (
          <div style={{ marginTop: 16, color: '#b71c1c' }}>
            <b>Audit Flags:</b>
            <ul style={{ margin: '8px 0 0 18px' }}>{auditFlags.map((flag, i) => <li key={i}>{flag}</li>)}</ul>
          </div>
        )}
      </div>
      {/* Show uploaded PDFs as file name + View button */}
      {uploadedFiles.length > 0 && (
        <div style={{ margin: '24px 0' }}>
          <b style={{ color: '#222' }}>Uploaded PDF Document(s):</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {uploadedFiles.map((file, idx) => (
              <div key={idx} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#222' }}>{file.name}</span>
                <button style={{ background: 'rgb(234 58 112 / var(--tw-bg-opacity, 1))', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginLeft: 12 }} onClick={() => setViewingPdfIdx(idx)}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Modal for viewing PDF */}
      {viewingPdfIdx !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewingPdfIdx(null)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, maxWidth: '90vw', maxHeight: '90vh', boxShadow: '0 2px 24px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 10, right: 16, background: 'rgb(234 58 112 / var(--tw-bg-opacity, 1))', color: '#fff', border: 'none', borderRadius: 6, fontSize: 22, width: 36, height: 36, cursor: 'pointer' }} onClick={() => setViewingPdfIdx(null)}>&times;</button>
            <embed src={URL.createObjectURL(uploadedFiles[viewingPdfIdx])} type="application/pdf" width="800px" height="600px" style={{ borderRadius: 6, border: '1px solid #eee', maxWidth: '80vw', maxHeight: '70vh' }} />
          </div>
        </div>
      )}
      <button onClick={handleDownloadPDF} style={{ background: 'rgb(234 58 112 / var(--tw-bg-opacity, 1))', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 24 }}>
        Download Summary as PDF
      </button>
      <div style={{ marginBottom: 24 }}>
        <input type="checkbox" id="confirm" />
        <label htmlFor="confirm" style={{ marginLeft: 8, fontWeight: 500, color: '#000' }}>
          I confirm that all information provided is accurate and complete
        </label>
        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
          By checking this box, you acknowledge that you are authorizing the submission of your Corporate Income Tax return.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/documents')} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Back to Documents</button>
        <button
          style={{ background: 'rgb(234 58 112 / var(--tw-bg-opacity, 1))', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          onClick={storeProcessedDocument}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Tax Return'}
        </button>
      </div>
    </div>
  );
};

export default CITSubmissionSummary; 