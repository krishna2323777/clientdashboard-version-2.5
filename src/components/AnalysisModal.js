import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const AnalysisModal = ({ isOpen, onClose, analysisData }) => {
  const modalContentRef = useRef(null);

  if (!isOpen || !analysisData) {
    return null;
  }
// Helper to format the date for deadlines (e.g., 12/15/2023)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
       if (!isNaN(date.getTime())) {
           return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
       } else {
           // Fallback if date parsing fails
           return dateString;
       }
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
  };

  // Assuming deadlines are stored as an array of objects like [{ date: 'YYYY-MM-DD', description: '...' }]
  const renderDeadlines = (deadlines) => {
    if (!deadlines || deadlines.length === 0) {
      return <p style={{ color: '#ccc', fontSize: '0.9rem' }}>No deadlines found.</p>; // Adjusted font size
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {deadlines.map((deadline, index) => (
          <div key={index} style={deadlineItemStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}> {/* Adjusted font size */}
              <span style={{ fontSize: '1.2rem' }}>{(deadline.description && deadline.description.includes('Payment')) ? '⚠️' : '📅'}</span>
              {deadline.description || 'N/A'}
            </span>
            <span style={deadlineDateStyle((deadline.description && deadline.description.includes('Payment')))}>{formatDate(deadline.date)}</span> {/* Pass boolean for style */}
          </div>
        ))}
      </div>
    );
  };

  // Assuming recommendations are stored as an array of strings
  const renderRecommendations = (recommendations) => {
    if (!recommendations || recommendations.length === 0) {
      return <p style={{ color: '#ccc', fontSize: '0.9rem' }}>No recommendations found.</p>; // Adjusted font size
    }
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}> {/* Adjusted gap */}
        {recommendations.map((recommendation, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.95rem' }}> {/* Adjusted font size */}
            <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✔️</span>
            {recommendation}
          </li>
        ))}
      </ul>
    );
  };

  // Function to handle the download of analysis
  const handleDownloadAnalysis = () => {
    if (!modalContentRef.current) return;

    html2canvas(modalContentRef.current, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // Enable CORS if needed for images
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] // Set PDF size to canvas size
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('document_analysis.pdf');
    });
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle} ref={modalContentRef}>
        {/* Modal Header */}
        <div style={modalHeaderStyle}>
          <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🧠</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '600', margin: 0 }}>AI Document Analysis</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>

        {/* Uploaded Document Section */}
        <div style={sectionStyle}>
          {/* Header for Uploaded Document section with title and confidence badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', margin: 0 }}>Uploaded Document</h3>
             {/* Using static value from image - replace with analysisData.confidence if available */}
             {/* {analysisData.confidence && (<div style={confidenceBadgeStyle}>Confidence: {analysisData.confidence}%</div>)} */}
             <div style={confidenceBadgeStyle}>Confidence: 92%</div>
          </div>

          <p style={{ color: '#ccc', fontSize: '0.85rem', margin: '5px 0 15px 0' }}>From: Document Upload</p>
          <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: '0 0 5px 0' }}>Summary</p>
          <p style={{ color: '#ccc', fontSize: '0.95rem', margin: 0 }}>{analysisData.summary}</p>
        </div>

        {/* Key Information Section */}
        <div style={sectionStyle}>
           <h3 style={sectionTitleStyle}>Key Information</h3>
           {/* Placeholder data based on image - replace with actual data fetching if needed */}
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <div style={infoCardStyle}><p style={infoLabelStyle}>Tax Year</p><p style={infoValueStyle}>2023</p></div>
               <div style={infoCardStyle}><p style={infoLabelStyle}>Total Due</p><p style={infoValueStyle}>€1,245.00</p></div>
               <div style={infoCardStyle}><p style={infoLabelStyle}>Reference Number</p><p style={infoValueStyle}>TAX-2023-78901</p></div>
               <div style={infoCardStyle}><p style={infoLabelStyle}>Filing Status</p><p style={infoValueStyle}>Completed</p></div>
           </div>
        </div>

        {/* Important Deadlines Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Important Deadlines</h3>
          {renderDeadlines(analysisData.deadlines)}
        </div>

        {/* Recommendations Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Recommendations</h3>
          {renderRecommendations(analysisData.recommendations)}
        </div>

         {/* Action Buttons */}
         {/* Functionality for these buttons is not implemented */}
         <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '15px', marginTop: '30px' }}>
             <button style={buttonStyle('#6C5DD3', true)} onClick={handleDownloadAnalysis}><span style={{marginRight: '8px'}}>⬇️</span> Download Analysis</button>
             <button style={buttonStyle('#6C5DD3')}>Create Task</button>
             <button style={buttonStyle('#FF4B7E')}>Add to Calendar</button>
         </div>

      </div>
    </div>
  );
};

// --- Styles --- //

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalContentStyle = {
  backgroundColor: '#1a1a2e',
  padding: '30px',
  borderRadius: '10px',
  width: '95%',
  maxWidth: '600px', // Adjusted max width slightly based on image proportion
  color: 'white',
  position: 'relative',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  maxHeight: '90vh', // Adjusted max height slightly
  overflowY: 'auto',
};

const modalHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    // justifyContent: 'space-between', // Removed space-between to match image closer
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #3a2a5d',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#ccc',
  position: 'absolute',
  top: '15px',
  right: '15px',
  lineHeight: 1,
};

const sectionStyle = {
    backgroundColor: '#2a2a4a',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
};

const sectionTitleStyle = {
    fontSize: '1.1rem', // Adjusted font size
    fontWeight: '600',
    marginBottom: '15px',
    color: '#ffffff',
};

const deadlineItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #3a2a5d',
};

const deadlineDateStyle = (isPayment) => ({
  backgroundColor: isPayment ? '#FF4B7E' : '#6C5DD3', // Color based on boolean prop
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
});

const infoCardStyle = {
    backgroundColor: '#3a3a5a',
    padding: '15px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
};

const infoLabelStyle = {
    fontSize: '0.85rem', // Adjusted font size
    color: '#ccc',
    margin: 0,
};

const infoValueStyle = {
    fontSize: '0.95rem', // Adjusted font size
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
};

const confidenceBadgeStyle = {
    backgroundColor: '#6C5DD3',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
};

const buttonStyle = (bgColor, outline = false) => ({
    backgroundColor: outline ? 'transparent' : bgColor,
    color: outline ? bgColor : 'white',
    border: outline ? `1px solid ${bgColor}` : 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem', // Adjusted font size
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
     '&:hover': {
        opacity: 0.9,
     }
});

export default AnalysisModal; 