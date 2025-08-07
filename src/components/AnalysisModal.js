import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';


const AnalysisModal = ({ isOpen, onClose, analysisData }) => {
  const modalContentRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen || !analysisData) {
    return null;
  }
// Helper to format the date for deadlines (e.g., "June 1, 2021" or "12/15/2023")
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // If the date is already in a readable format like "June 1, 2021", return it as is
      if (dateString.includes(',') && dateString.match(/[A-Za-z]+ \d+, \d{4}/)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      } else {
        // Fallback if date parsing fails
        return dateString;
      }
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Render deadlines in the format [{"date": "June 1, 2021", "type": "Tax Return Submission"}]
  const renderDeadlines = (deadlines) => {
    if (!deadlines || deadlines.length === 0) {
      return <p style={{ color: '#ccc', fontSize: '0.9rem' }}>No deadlines found.</p>;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {deadlines.map((deadline, index) => (
          <div key={index} style={deadlineItemStyle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{(deadline.type && deadline.type.includes('Payment')) ? '⚠️' : '📅'}</span>
              {deadline.type || deadline.description || 'N/A'}
            </span>
            <span style={deadlineDateStyle((deadline.type && deadline.type.includes('Payment')))}>
              {deadline.date ? formatDate(deadline.date) : 'N/A'}
            </span>
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



  // Function to handle creating a task
  const handleCreateTask = () => {
    // Prepare the task data from analysis
    const taskData = {
      title: analysisData.document_type || 'Document Analysis Task',
      description: analysisData.summary || 'Document analysis task created from mailbox',
      type: getTaskTypeFromDocument(analysisData.document_type),
      due_date: getEarliestDeadline(analysisData.deadlines),
      priority: getPriorityFromDeadlines(analysisData.deadlines),
      status: 'Pending',
      assigned_to: '',
      deadlines: analysisData.deadlines,
      recommendations: analysisData.recommendations
    };

    // Store the task data in sessionStorage for the calendar component to access
    sessionStorage.setItem('pendingTaskData', JSON.stringify(taskData));
    
    // Close the modal
    onClose();
    
    // Navigate to calendar route
    navigate('/calendar');
  };

  // Helper function to determine task type from document type
  const getTaskTypeFromDocument = (documentType) => {
    if (!documentType) return 'Company';
    
    const lowerType = documentType.toLowerCase();
    if (lowerType.includes('tax') || lowerType.includes('vat')) return 'Tax';
    if (lowerType.includes('finance') || lowerType.includes('invoice')) return 'Finance';
    if (lowerType.includes('legal') || lowerType.includes('agreement')) return 'Legal Agreements';
    if (lowerType.includes('shipment') || lowerType.includes('mail')) return 'Shipments';
    if (lowerType.includes('kyc') || lowerType.includes('verification')) return 'KYC';
    
    return 'Company';
  };

  // Helper function to get the earliest deadline
  const getEarliestDeadline = (deadlines) => {
    if (!deadlines || deadlines.length === 0) {
      // Default to 7 days from now if no deadlines
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return defaultDate.toISOString().split('T')[0];
    }

    // Find the earliest deadline
    const validDeadlines = deadlines.filter(d => d.date);
    if (validDeadlines.length === 0) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return defaultDate.toISOString().split('T')[0];
    }

    const earliest = validDeadlines.reduce((earliest, current) => {
      const earliestDate = new Date(earliest.date);
      const currentDate = new Date(current.date);
      return earliestDate < currentDate ? earliest : current;
    });

    return new Date(earliest.date).toISOString().split('T')[0];
  };

  // Helper function to determine priority based on deadlines
  const getPriorityFromDeadlines = (deadlines) => {
    if (!deadlines || deadlines.length === 0) return 'Medium';

    const now = new Date();
    const urgentDeadlines = deadlines.filter(d => {
      if (!d.date) return false;
      const deadlineDate = new Date(d.date);
      const daysUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilDeadline <= 7; // High priority if deadline is within 7 days
    });

    return urgentDeadlines.length > 0 ? 'High' : 'Medium';
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
             <button style={buttonStyle('#FF4B7E')} onClick={handleCreateTask}>Create Task</button>
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