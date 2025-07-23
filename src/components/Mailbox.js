import React, { useState, useEffect } from 'react';
import './Mailbox.css'; 
import { FaShippingFast } from 'react-icons/fa';
import { FaDownload } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa';
import { FaRobot } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { supabase } from './SupabaseClient';
import { MdOutlineDownload, MdOutlineVisibility, MdOutlineAutoFixHigh, MdOutlineUpload } from 'react-icons/md'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import AnalysisModal from './AnalysisModal'; // Import the new modal component
import { useNavigate } from 'react-router-dom';

const initialIncomingMail = [
  {
    id: 1,
    sender: 'Letter',
    subject: 'Sample Subject',
    date: '12/04/2024',
    tags: [],
    filePath: 'path/to/sample.pdf'
  }
];

const Mailbox = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('incoming');
  // Prepare Shipment form state
  const [shipmentType, setShipmentType] = useState('Objection Letter'); // Default to first option
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [shipmentContents, setShipmentContents] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Standard');
  const [tracking, setTracking] = useState(false);
  const [deliveryConfirmation, setDeliveryConfirmation] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null); // Initialize as null for DatePicker
  const [shipments, setShipments] = useState([]); // Initialize shipments as empty array
  const [selectedFile, setSelectedFile] = useState(null); // State for the file selected for upload
  // Add this state for tracking upload status
  const [uploading, setUploading] = useState(false);

  // State for Incoming Mail
  const [incomingMail, setIncomingMail] = useState(initialIncomingMail);
  const [loadingMail, setLoadingMail] = useState(true);
  const [mailError, setMailError] = useState(null);

  // State for Outgoing Emails
  const [outgoingEmails, setOutgoingEmails] = useState([]);
  const [loadingOutgoingEmails, setLoadingOutgoingEmails] = useState(false);
  const [outgoingEmailsError, setOutgoingEmailsError] = useState(null);

  // State for the document associated with the selected shipment type
  const [selectedShipmentDocument, setSelectedShipmentDocument] = useState(null);

  // State for the popup and analyzed mail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzedMail, setAnalyzedMail] = useState(null);

  // Define a mapping of shipment types to their actual file paths in Supabase Storage
  // IMPORTANT: Replace these placeholder paths with the actual paths in your bucket
  const defaultShipmentDocumentPaths = {
    'objection letter': 'b29a7ae5-9c6e-4864-b021-d53b00b5ca1c/b29a7ae5-9c6e-4864-b021-d53b00b5ca1c/Objection Letter Template.pdf', 
    'extension letter': 'b29a7ae5-9c6e-4864-b021-d53b00b5ca1c/b29a7ae5-9c6e-4864-b021-d53b00b5ca1c/Extension Request Letter.pdf', 
    'payment plan': 'b29a7ae5-9c6e-4864-b021-d53b00b5ca1c/b29a7ae5-9c6e-4864-b021-d53b00b5ca1c/Payment Plan Request Letter.pdf',
  };

  // Effect to update the selected document when shipment type changes
  useEffect(() => {
    const filePath = defaultShipmentDocumentPaths[shipmentType];
    console.log('Shipment type changed:', shipmentType);
    if (filePath) {
      setSelectedShipmentDocument({
        type: shipmentType,
        filePath: filePath, // Use the actual file path
      });
      console.log('Selected shipment document updated:', { type: shipmentType, filePath: filePath });
    } else {
      setSelectedShipmentDocument(null);
      console.log('Selected shipment document set to null.');
    }
  }, [shipmentType]);

  // Fetch outgoing emails from Supabase Storage when tab is active
  useEffect(() => {
    if (activeTab === 'outgoing-email') {
      const fetchOutgoingEmails = async () => {
        setLoadingOutgoingEmails(true);
        setOutgoingEmailsError(null);
        // Fetch data from the document_uploads table
        const { data, error } = await supabase
          .from('document_uploads') // Fetch from document_uploads table
          .select('id, document_type, document_name, file_path, created_at') // Select relevant columns
          .order('created_at', { ascending: false });
          // Add filters if needed, e.g., .eq('user_id', userId)
        
        if (error) {
          console.error('Error listing outgoing emails:', error.message);
          setOutgoingEmailsError(error);
          setOutgoingEmails([]);
        } else {
          // Process the fetched data to match the desired display format
          const processedEmails = data.map(doc => ({
            id: doc.id, // Use id from the database record
            document_type: doc.document_type,
            document_name: doc.document_name,
            file_path: doc.file_path, // Keep file_path for download/view actions
            created_at: doc.created_at,
          }));
          setOutgoingEmails(processedEmails);
        }
        setLoadingOutgoingEmails(false);
      };

      fetchOutgoingEmails();
    }
  }, [activeTab]); // Rerun effect when activeTab changes

  // Add this useEffect for fetching incoming mail
  useEffect(() => {
    if (activeTab === 'incoming') {
      fetchIncomingMail();
    }
  }, [activeTab]);

  const fetchIncomingMail = async () => {
    try {
      setLoadingMail(true);
      setMailError(null);

      const { data, error } = await supabase
        .from('incoming_mails')
        .select(`
          id,
          document_name,
          document_type,
          issue_date,
          file_path,
          created_at,
          client_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the data to match the mail display structure
      const formattedMail = data.map(mail => ({
        id: mail.id,
        sender: mail.document_type, // Using document_type as sender
        subject: mail.document_name, // Using document_name as subject
        date: new Date(mail.created_at).toLocaleDateString(),
        tags: [], // Add tags if needed
        filePath: mail.file_path
      }));

      setIncomingMail(formattedMail);
    } catch (error) {
      setMailError(error.message);
    } finally {
      setLoadingMail(false);
    }
  };

  // Handlers for Incoming Mail Actions
  const handleDownloadMail = async (mail) => {
    if (!mail.filePath) {
      alert('No file available for this mail.');
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from('mails-storage')
        .download(mail.filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = mail.subject;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading mail:', error.message);
      alert('Failed to download document: ' + error.message);
    }
  };

  const handleViewMail = async (mail) => {
    if (!mail.filePath) {
      alert('No file available for this mail.');
      return;
    }
    try {
      // First try to get a signed URL which will work even for private buckets
      const { data: signedData, error: signedError } = await supabase.storage
        .from('mails-storage')
        .createSignedUrl(mail.filePath, 3600); // URL valid for 1 hour

      if (signedError) {
        // If signed URL fails, try to get public URL as fallback
        const { data: publicData } = await supabase.storage
          .from('mails-storage')
          .getPublicUrl(mail.filePath);

        if (publicData?.publicUrl) {
          window.open(publicData.publicUrl, '_blank', 'noopener,noreferrer');
        } else {
          throw new Error('Could not get URL for file');
        }
      } else {
        // Use the signed URL if available
        window.open(signedData.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error viewing mail:', error.message);
      alert('Failed to view document. Please ensure you have proper permissions.');
    }
  };

  const handleAnalyzeMail = async (mail) => {
    // Fetch detailed analysis data from Supabase
    const { data, error } = await supabase
      .from('incoming_mails')
      .select('document_type, summary, deadlines, recommendations')
      .eq('id', mail.id)
      .limit(1);

    if (error) {
      console.error('Error fetching analysis data from Supabase:', error); // More detailed log
      alert('Failed to fetch analysis data.');
    } else if (data && data.length > 0) {
      setAnalyzedMail(data[0]);
      setIsModalOpen(true);
    } else {
       console.log('No analysis data found for mail ID:', mail.id);
       alert('No analysis data found for this mail.');
    }
  };

  // Handlers for Outgoing Email Actions
  const handleViewOutgoingEmail = async (email) => {
    if (!email.file_path) {
      alert('No file available for this document.');
      return;
    }
    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('docs-storage')
        .createSignedUrl(email.file_path, 3600);

      if (signedError) {
        const { data: publicData } = await supabase.storage
          .from('docs-storage')
          .getPublicUrl(email.file_path);

        if (publicData?.publicUrl) {
          window.open(publicData.publicUrl, '_blank', 'noopener,noreferrer');
        } else {
          throw new Error('Could not get URL for file');
        }
      } else {
        window.open(signedData.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error viewing document:', error.message);
      alert('Failed to view document. Please ensure you have proper permissions.');
    }
  };

  const handleDownloadOutgoingEmail = async (email) => {
    if (!email.file_path) {
      alert('No file path available for this document.');
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from('docs-storage')
        .download(email.file_path);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = email.document_name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading document:', error.message);
      alert('Failed to download document: ' + error.message);
    }
  };

  const handleAnalyzeOutgoingEmail = async (email) => {
    try {
      // Fetch detailed analysis data from document_uploads table
      const { data, error } = await supabase
        .from('document_uploads')
        .select('document_type, summary, deadlines, recommendations')
        .eq('id', email.id)
        .limit(1);

      if (error) {
        console.error('Error fetching analysis data from document_uploads:', error);
        alert('Failed to fetch analysis data.');
      } else if (data && data.length > 0) {
        setAnalyzedMail(data[0]);
        setIsModalOpen(true);
      } else {
        console.log('No analysis data found for document ID:', email.id);
        alert('No analysis data found for this document.');
      }
    } catch (error) {
      console.error('Error analyzing outgoing email:', error);
      alert('Error analyzing document: ' + error.message);
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('Not authenticated');

      const documents = selectedFile?.files || [];
      
      const shipmentData = {
        client_id: sessionData.session.user.id,
        recipient_name: recipientName,
        recipient_address: recipientAddress,
        shipment_type: shipmentType,
        contents: shipmentContents,
        delivery_method: deliveryMethod,
        tracking,
        delivery_confirmation: deliveryConfirmation,
        insurance,
        scheduled_date: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : null,
        status: 'Pending',
        documents: documents // Save the documents array directly
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select();

      if (error) throw error;

      // Update the local shipments state with the new data
      setShipments(prevShipments => [{
        id: data[0].id,
        recipient: data[0].recipient_name,
        address: data[0].recipient_address,
        type: data[0].shipment_type,
        contents: data[0].contents,
        deliveryMethod: data[0].delivery_method,
        tracking: data[0].tracking,
        deliveryConfirmation: data[0].delivery_confirmation,
        insurance: data[0].insurance,
        scheduledDate: data[0].scheduled_date 
          ? new Date(data[0].scheduled_date).toLocaleDateString()
          : 'Not scheduled',
        status: data[0].status,
        documents: documents // Include documents in local state
      }, ...prevShipments]);

      // Clear form
      setShipmentType('Objection Letter');
      setRecipientName('');
      setRecipientAddress('');
      setShipmentContents('');
      setDeliveryMethod('Standard');
      setTracking(false);
      setDeliveryConfirmation(false);
      setInsurance(false);
      setScheduledDate(null);
      setSelectedFile(null);

      alert('Shipment created successfully!');
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert(error.message === 'Not authenticated' 
        ? 'Please log in to create a shipment' 
        : 'Error creating shipment: ' + error.message
      );
    }
  };

  // Handlers for the document actions in Prepare Shipment tab
  const handleViewShipmentDocument = () => {
    let docUrl = '';
    switch (shipmentType) {
      case 'Objection Letter':
        docUrl = '/src/Objection Letter Template.docx'; // Use local file path
        break;
      case 'Extension Letter':
        docUrl = 'https://docs.google.com/document/d/1kqJZ6J5iePgnx9QJlZ0XZE-zjScUROhFb2R1kriwvGs/edit?usp=sharing';
        break;
      case 'Payment Plan Request Letter':
        docUrl = 'https://docs.google.com/document/d/1Nhz-8mv3qyz-6TDizICNBPENgPPxF7lSoOk5A_pVQ_o/edit?usp=sharing';
        break;
      default:
        console.error('Unknown shipment type:', shipmentType);
        return;
    }
    window.open(docUrl, '_blank');
  };

  const handleDownloadShipmentDocument = () => {
    let docUrl = '';
    switch (shipmentType) {
      case 'Objection Letter':
        docUrl = '/src/Objection Letter Template.docx'; // Use local file path
        break;
      case 'Extension Letter':
        docUrl = '/src/Extension Request Letter1.docx'; // Use local file path for Extension Letter
        break;
      case 'Payment Plan Request Letter':
        docUrl = '/src/Payment Plan Request Letter.docx'; // Use local file path for Payment Plan Request Letter
        break;
      default:
        console.error('Unknown shipment type:', shipmentType);
        return;
    }
    // For local files, opening the path in a new tab might prompt download or open based on browser/environment.
    window.open(docUrl, '_blank');
  };

  // Update the handleUploadShipmentDocument function
  const handleUploadShipmentDocument = async (e) => {
    e.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.multiple = true;
    
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      try {
        setUploading(true);
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error('Authentication required');
        
        const userId = sessionData.session.user.id;
        
        // Upload all files
        const uploadedDocs = await Promise.all(files.map(async (file) => {
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${userId}/${fileName}`; // Simplified path structure

          const { error: uploadError } = await supabase.storage
            .from('shipment-docs')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          return {
            name: file.name,
            path: filePath, // This is important for retrieval
            type: file.type
          };
        }));

        // Store the uploaded documents info
        setSelectedFile({
          files: uploadedDocs
        });
        
        alert(`${files.length} document(s) uploaded successfully!`);
        
      } catch (error) {
        console.error('Error uploading documents:', error);
        alert('Error uploading documents: ' + error.message);
      } finally {
        setUploading(false);
      }
    };

    fileInput.click();
  };

  // Add this useEffect to fetch shipments when the tab changes
  useEffect(() => {
    if (activeTab === 'shipments') {
      fetchShipments();
    }
  }, [activeTab]);

  // Add the fetchShipments function
  const fetchShipments = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('client_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedShipments = data.map(shipment => ({
        id: shipment.id,
        recipient: shipment.recipient_name,
        address: shipment.recipient_address,
        type: shipment.shipment_type,
        contents: shipment.contents,
        deliveryMethod: shipment.delivery_method,
        tracking: shipment.tracking,
        deliveryConfirmation: shipment.delivery_confirmation,
        insurance: shipment.insurance,
        scheduledDate: shipment.scheduled_date 
          ? new Date(shipment.scheduled_date).toLocaleDateString()
          : 'Not scheduled',
        status: shipment.status,
        documents: shipment.documents || [] // Ensure documents are included
      }));

      setShipments(formattedShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      alert('Error loading shipments: ' + error.message);
    }
  };

  // Add this helper function for status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'In Transit':
        return '#FFB300';
      case 'Cancelled':
        return '#FF5252';
      case 'Pending':
      default:
        return '#6C5DD3';
    }
  };

  // Add these functions before the return statement
  const handleViewShipmentDoc = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('shipment-docs')
        .createSignedUrl(doc.path, 3600); // URL valid for 1 hour

      if (error) {
        const { data: publicData } = await supabase.storage
          .from('shipment-docs')
          .getPublicUrl(doc.path);

        if (publicData?.publicUrl) {
          window.open(publicData.publicUrl, '_blank', 'noopener,noreferrer');
        } else {
          throw new Error('Could not get URL for file');
        }
      } else {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to view document: ' + error.message);
    }
  };

  const handleDownloadShipmentDoc = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('shipment-docs')
        .download(doc.path);

      if (error) throw error;

      // Create and trigger download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document: ' + error.message);
    }
  };

  return (
    <div className="mailbox-container">
      <h1>Mailbox</h1>
      <p>Manage your physical and digital mail</p>
      <div className="mailbox-actions">
        <button className={activeTab === 'incoming' ? 'active' : ''} onClick={() => setActiveTab('incoming')}>Incoming Mail</button>
        <button className={activeTab === 'outgoing-email' ? 'active' : ''} onClick={() => setActiveTab('outgoing-email')}>Outgoing Email</button>
        <button className={activeTab === 'shipment' ? 'active' : ''} onClick={() => setActiveTab('shipment')}>Prepare Shipment</button>
        <button className={activeTab === 'shipments' ? 'active' : ''} onClick={() => setActiveTab('shipments')}>Shipments</button>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Mailbox Services</button>
      </div>
      {activeTab === 'incoming' && (
        <>
          <div className="mailbox-toolbar">
            <input placeholder="Search mail..." />
            <button>AI Analysis</button>
            <button>Filter</button>
            <button>Scan All</button>
            <button>Forward All</button>
          </div>
          <div className="mailbox-list">
            <div className="mailbox-list-header">
              <span>Mail Details</span>
              <span>Received</span>
              <span>Actions</span>
            </div>
            {incomingMail.map(mail => (
              <div className="mailbox-list-item" key={mail.id}>
                <span>
                  <strong>{mail.sender}</strong>
                  {mail.tags.map(tag => (
                    <span className={`mail-tag ${tag === "Important" ? "important" : ""}`} key={tag}>{tag}</span>
                  ))}
                  <div>{mail.subject}</div>
                  {mail.official && <div className="mail-official">Official Document</div>}
                </span>
                <span>{mail.date}</span>
                <span>
                  <button title="Download" onClick={() => handleDownloadMail(mail)}><FaDownload /></button>
                  <button title="AI Analysis" onClick={() => handleAnalyzeMail(mail)}><FaRobot /></button>
                  <button title="View" onClick={() => handleViewMail(mail)}><HiOutlineExternalLink /></button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {activeTab === 'outgoing-email' && (
        <div className="outgoing-email-tab" style={{ marginTop: '2rem' }}>
          <h2>Outgoing Emails</h2>
          {loadingOutgoingEmails && <p>Loading outgoing emails...</p>}
          {outgoingEmailsError && <p style={{ color: 'red' }}>Error loading outgoing emails: {outgoingEmailsError.message}</p>}
          {!loadingOutgoingEmails && outgoingEmails.length === 0 && <p>No outgoing emails found.</p>}
          {!loadingOutgoingEmails && outgoingEmails.length > 0 && (
            <div className="mailbox-list">
              <div className="mailbox-list-header">
                <span>Mail Details</span>
                <span>Issue Date</span>
                <span>Actions</span>
              </div>
              {outgoingEmails.map(email => (
                <div className="mailbox-list-item" key={email.id}>
                  <span>
                    <strong>{email.document_type}</strong>
                    <div>{email.document_name}</div>
                  </span>
                  <span>{new Date(email.created_at).toLocaleDateString()}</span>
                  <span>
                    <button title="Download" onClick={() => handleDownloadOutgoingEmail(email)}><FaDownload /></button>
                    <button title="AI Analysis" onClick={() => handleAnalyzeOutgoingEmail(email)}><FaRobot /></button>
                    <button title="View" onClick={() => handleViewOutgoingEmail(email)}><HiOutlineExternalLink /></button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'services' && (
        <div className="mailbox-services-cards" style={{ display: 'flex', gap: '2rem', marginTop: '2rem', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {/* Mail Forwarding Card */}
          <div className="mailbox-service-card" style={{ flex: '1 1 300px', background: 'rgba(30, 20, 60, 0.5)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <div className="service-icon" style={{ background: 'rgba(60, 40, 100, 0.7)', padding: '1rem', borderRadius: '12px', fontSize: '1.8rem' }}>📩</div>
            <h2 style={{marginTop: 0, marginBottom: 0, fontSize: '1.5rem', fontWeight: 600}}>Mail Forwarding</h2>
            <p style={{marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#ccc'}}>Have your mail automatically forwarded to your preferred address or digitally scanned and sent to your email.</p>
            <div style={{fontSize: '0.9rem', color: '#ccc'}}>Auto-forwarding: <span style={{ color: 'limegreen', fontWeight: 600 }}>Active</span></div>
            <div style={{fontSize: '0.9rem', color: '#ccc'}}>Next scheduled: <b>Daily at 4:00 PM</b></div>
            <button className="service-action" style={{marginTop: '1.5rem', background: 'rgba(60, 40, 100, 0.7)', color: 'white', fontWeight: 600, padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer'}}>Configure Forwarding</button>
          </div>
          {/* Mail Scanning Card */}
          <div className="mailbox-service-card" style={{ flex: '1 1 300px', background: 'rgba(30, 20, 60, 0.5)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <div className="service-icon" style={{ background: 'rgba(60, 40, 100, 0.7)', padding: '1rem', borderRadius: '12px', fontSize: '1.8rem' }}>📠</div>
            <h2 style={{marginTop: 0, marginBottom: 0, fontSize: '1.5rem', fontWeight: 600}}>Mail Scanning</h2>
            <p style={{marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#ccc'}}>We scan your mail and make it available in your digital mailbox, with secure storage and OCR text recognition.</p>
            <div style={{fontSize: '0.9rem', color: '#ccc'}}>Auto-scanning: <span style={{ color: 'limegreen', fontWeight: 600 }}>Active</span></div>
            <div style={{fontSize: '0.9rem', color: '#ccc'}}>Storage: <b>12 months</b></div>
            <button className="service-action" style={{marginTop: '1.5rem', background: 'rgba(60, 40, 100, 0.7)', color: 'white', fontWeight: 600, padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer'}}>Configure Scanning</button>
          </div>
          {/* AI Document Analysis Card */}
          <div className="mailbox-service-card" style={{ flex: '1 1 300px', background: 'rgba(30, 20, 60, 0.5)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <div className="service-icon" style={{ background: 'rgba(60, 40, 100, 0.7)', padding: '1rem', borderRadius: '12px', fontSize: '1.8rem' }}>🧬</div>
            <h2 style={{marginTop: 0, marginBottom: 0, fontSize: '1.5rem', fontWeight: 600}}>AI Document Analysis</h2>
            <p style={{marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#ccc'}}>Our AI system automatically identifies document types, extracts key information, and provides actionable insights.</p>
            <div style={{fontSize: '0.9rem', color: '#ccc'}}>Auto-analysis: <span style={{ color: 'limegreen', fontWeight: 600 }}>Active</span></div>
            <div style={{fontSize: '0.9rem', color: '#ccc'}}>Language support: <b>Dutch, English</b></div>
            <button 
              className="service-action" 
              onClick={() => navigate('/ai-analyzer')}
              style={{
                marginTop: '1.5rem',
                background: 'rgba(60, 40, 100, 0.7)',
                color: 'white',
                fontWeight: 600,
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Upload Document for Analysis
            </button>
          </div>
        </div>
      )}
      {activeTab === 'shipment' && (
        <form className="prepare-shipment-form" onSubmit={handleCreateShipment} style={{marginTop: '2rem'}}>
          <h2 style={{marginBottom: 0}}>Prepare Shipment</h2>
          <p style={{marginTop: 0}}>Create and manage outgoing shipments. We'll handle the packaging, postage, and delivery.</p>
          <div className="shipment-form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', background: 'rgba(30, 20, 60, 0.5)', padding: '2.5rem', borderRadius: '20px', marginTop: '2rem'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.8rem'}}>
              <div>
                <label style={{fontWeight: 500, marginBottom: '0.5rem', display: 'block'}}>Shipment Type</label>
                <select value={shipmentType} onChange={e => setShipmentType(e.target.value)} className="mailbox-input">
                  <option value="Objection Letter">Objection Letter</option>
                  <option value="Extension Letter">Extension Letter</option>
                  <option value="Payment Plan Request Letter">Payment Plan Request Letter</option>
                </select>
              </div>
              {shipmentType && (
                <div style={{marginTop: '0.5rem', padding: '1.2rem', background: 'rgba(60, 40, 100, 0.5)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{flexGrow: 1}}>
                    <h4 style={{marginTop: 0, marginBottom: 0, marginRight: '1rem', display: 'inline-block'}}>{shipmentType}</h4>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    {/* Download button for all letter types */}
                    <button 
                       onClick={handleDownloadShipmentDocument}
                       style={{padding: '0.5rem 0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer'}}
                    >
                      <MdOutlineDownload /> 
                    </button>
                    {/* Upload button for all letter types */}
                    <button 
                      onClick={handleUploadShipmentDocument}
                      disabled={uploading}
                      style={{
                        padding: '0.5rem 0.8rem', 
                        borderRadius: '8px', 
                        border: 'none', 
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner"></span> Uploading...
                        </>
                      ) : (
                        <>
                          <MdOutlineUpload /> 
                          {selectedFile ? 'Change File' : 'Upload'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label style={{fontWeight: 500, marginBottom: '0.5rem', display: 'block'}}>Recipient</label>
                <input
                  type="text"
                  placeholder="Recipient name"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="mailbox-input"
                  style={{width: '100%', marginBottom: '1rem'}}
                />
                <textarea
                  placeholder="Recipient address"
                  value={recipientAddress}
                  onChange={e => setRecipientAddress(e.target.value)}
                  rows={2}
                  className="mailbox-input"
                />
              </div>
              <div>
                <label style={{fontWeight: 500, marginBottom: '0.5rem', display: 'block'}}>Delivery Method</label>
                <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value)} className="mailbox-input">
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Priority">Priority</option>
                  <option value="Registered Mail">Registered Mail</option>
                </select>
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.8rem'}}>
              <div>
                <label style={{fontWeight: 500, marginBottom: '0.5rem', display: 'block'}}>Shipment Contents</label>
                <textarea
                  placeholder="Describe the contents of your shipment"
                  value={shipmentContents}
                  onChange={e => setShipmentContents(e.target.value)}
                  rows={4}
                  className="mailbox-input"
                />
              </div>
              <div>
                <label style={{fontWeight: 500, marginBottom: '0.5rem', display: 'block'}}>Tracking Options</label>
                <div className="checkbox-group" style={{display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem'}}>
                  <label style={{fontWeight: 600}}><input type="checkbox" checked={tracking} onChange={e => setTracking(e.target.checked)} /> Include tracking</label>
                  <label style={{fontWeight: 600}}><input type="checkbox" checked={deliveryConfirmation} onChange={e => setDeliveryConfirmation(e.target.checked)} /> Delivery confirmation</label>
                  <label style={{fontWeight: 600}}><input type="checkbox" checked={insurance} onChange={e => setInsurance(e.target.checked)} /> Insurance</label>
                </div>
              </div>
              <div>
                <label style={{fontWeight: 500, marginBottom: '0.5rem', display: 'block'}}>Scheduled Date</label>
                <DatePicker
                  selected={scheduledDate}
                  onChange={(date) => setScheduledDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="mailbox-input"
                  placeholderText="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="create-shipment-btn" style={{marginTop: '2rem', background: '#FF4B7E', color: 'white', fontWeight: 600, fontSize: '1.2rem', borderRadius: '16px', padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.7rem', border: 'none'}}>
            <FaShippingFast /> Create Shipment
          </button>
        </form>
      )}
      {activeTab === 'shipments' && (
        <div className="shipments-tab" style={{marginTop: '2rem'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Outgoing Shipments</h2>
            <button 
              onClick={() => fetchShipments()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'rgba(60, 40, 100, 0.7)',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
          {shipments.length === 0 && <p>No outgoing shipments found.</p>}
          {shipments.length > 0 && (
            <table className="shipments-table" style={{width: '100%', background: 'rgba(30, 20, 60, 0.5)', borderRadius: '16px', color: 'white', borderCollapse: 'collapse', marginTop: '1.5rem'}}>
              <thead>
                <tr style={{background: 'rgba(60, 40, 100, 0.7)'}}>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Recipient</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Address</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Type</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Contents</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Delivery Method</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Tracking</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Scheduled Date</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Documents</th>
                  <th style={{padding: '1rem', textAlign: 'center'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                  {shipments.map(shipment => (
                  <tr key={shipment.id}>
                    <td data-label="Recipient">{shipment.recipient}</td>
                    <td data-label="Address">{shipment.address}</td>
                    <td data-label="Type">{shipment.type}</td>
                    <td data-label="Contents">{shipment.contents}</td>
                    <td data-label="Delivery Method">{shipment.deliveryMethod}</td>
                    <td data-label="Tracking">
                      {[
                        shipment.tracking && 'Tracking',
                        shipment.deliveryConfirmation && 'Confirmation',
                        shipment.insurance && 'Insurance'
                      ].filter(Boolean).join(', ') || 'None'}
                    </td>
                    <td data-label="Scheduled Date">{shipment.scheduledDate}</td>
                    <td data-label="Documents">
                      {shipment.documents?.length > 0 ? (
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                          {shipment.documents.map((doc, index) => (
                            <div key={index} style={{display: 'flex', gap: '0.3rem'}}>
                              <button
                                onClick={() => handleViewShipmentDoc(doc)}
                                title={doc.name}
                                style={{
                                  padding: '0.4rem',
                                  background: '#29295a',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <FaEye color="white" size={14} />
                              </button>
                              <button
                                onClick={() => handleDownloadShipmentDoc(doc)}
                                title="Download"
                                style={{
                                  padding: '0.4rem',
                                  background: '#29295a',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <FaDownload color="white" size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{color: '#666'}}>No documents</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <span style={{
                        background: getStatusColor(shipment.status),
                        color: 'white',
                        borderRadius: '12px',
                        padding: '0.3rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                        {shipment.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Render the Analysis Modal */}
      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysisData={analyzedMail}
      />
    </div>
  );
};

export default Mailbox;
