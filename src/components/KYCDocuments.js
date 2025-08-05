import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Upload, Clock, AlertTriangle, FileText, Users, CheckCircle, Info, X, Circle, Home, Zap, CreditCard } from 'lucide-react';

import { supabase } from '../supabaseClient';
import './kyc.css';
import CorporateStructure from './CorporateStructure';
import DocumentUploadModal from './DocumentUploadModal';

const KYC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] = useState(null);
  const navigate = useNavigate();
  const [documentUploads, setDocumentUploads] = useState({
    passport: null,
    addressProof: null,
    utilityBill: null,
    drivingLicense: null
  });
  const [documentStatuses, setDocumentStatuses] = useState({
    passport: 'Not Uploaded',
    addressProof: 'Not Uploaded',
    utilityBill: 'Not Uploaded',
    drivingLicense: 'Not Uploaded'
  });
  const [allDocumentStatuses, setAllDocumentStatuses] = useState({});
  const [allDocumentUploads, setAllDocumentUploads] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [complianceStats, setComplianceStats] = useState({
    verified: 0,
    pending: 0,
    incomplete: 0
  });
  const [kycRecords, setKycRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [documentStatus, setDocumentStatus] = useState('not uploaded');
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionUser, setSessionUser] = useState(null);
  const [baseCompany, setBaseCompany] = useState(null);
  const [showBaseCompanyDetails, setShowBaseCompanyDetails] = useState(false);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    reg_number: '',
    vat_number: '',
    incorporation_date: '',
    base_location: '',
    registered_address: ''
  });
  const [selectedTargetCompany, setSelectedTargetCompany] = useState(null);
  const [showTargetCompanyDetails, setShowTargetCompanyDetails] = useState(false);
  const [newDirector, setNewDirector] = useState({ name: '', email: '', role: 'Director' });
  const [newShareholder, setNewShareholder] = useState({ name: '', percentage: '' });
  const [editingCompany, setEditingCompany] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDirectorModal, setShowAddDirectorModal] = useState(false);
  const [showAddShareholderModal, setShowAddShareholderModal] = useState(false);
  const [newBaseDirector, setNewBaseDirector] = useState({ 
    name: '', 
    email: '', 
    role: 'Director',
    phone: '',
    appointedDate: new Date().toLocaleDateString()
  });
  const [newBaseShareholder, setNewBaseShareholder] = useState({ 
    name: '', 
    percentage: '',
    type: 'Individual',
    shares: '0'
  });
  const [showEditTargetCompanyModal, setShowEditTargetCompanyModal] = useState(false);
  const [showAddTargetDirectorModal, setShowAddTargetDirectorModal] = useState(false);
  const [showAddTargetShareholderModal, setShowAddTargetShareholderModal] = useState(false);
  const [editingTargetCompany, setEditingTargetCompany] = useState(null);
  const [newTargetDirector, setNewTargetDirector] = useState({ 
    name: '', 
    email: '', 
    role: 'Director',
    phone: '',
    appointedDate: new Date().toLocaleDateString()
  });
  const [newTargetShareholder, setNewTargetShareholder] = useState({ 
    name: '', 
    percentage: '',
    type: 'Individual',
    shares: '0'
  });
  const [showDocumentUploadModal, setShowDocumentUploadModal] = useState(false);
  const [targetCompanyDetails, setTargetCompanyDetails] = useState(null);
  const [loadingTargetCompanyDetails, setLoadingTargetCompanyDetails] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getDocumentTitle = (type) => {
    const titles = {
      passport: 'Passport',
      addressProof: 'Address Proof',
      utilityBill: 'Utility Bill',
      drivingLicense: 'Driving License'
    };
    return titles[type] || type;
  };

  const handleCancelUpload = () => {
    setShowConfirmation(false);
    setFileToUpload(null);
    setUploadType(null);
  };

  useEffect(() => {
    const subscription = supabase
      .channel('kyc-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kyc_documents'
        },
        (payload) => {
          console.log('Received real-time update from Supabase:', payload);
          const { new: newRecord } = payload;
          if (!newRecord) return;

          const { doc_type, status, representative_id,comments } = newRecord;
          
          let docType = doc_type;
          if (doc_type === 'passport') docType = 'passport';
          if (doc_type === 'address_proof') docType = 'addressProof';
          if (doc_type === 'utility_bill') docType = 'utilityBill';
          if (doc_type === 'driving_license') docType = 'drivingLicense';

          console.log(`Updating document status: ${docType} -> ${status}`);
          const normalizedStatus = status.toLowerCase();

          setAllDocumentStatuses((prev) => ({
          ...prev,
          [representative_id]: {
            ...(prev[representative_id] || {}),
            [docType]: normalizedStatus
          },
        }));

          if (selectedRepresentative && 
              (selectedRepresentative.email === representative_id || 
               selectedRepresentative.name === representative_id)) {
            console.log('Updating current view for selected representative');
            setDocumentStatuses(prev => {
              const updated = {
                ...prev,
                [docType]: normalizedStatus
              };
              console.log('Updated documentStatuses:', updated);
              return updated;
            });
          }
          if (
  selectedRepresentative &&
  (selectedRepresentative.email === representative_id ||
    selectedRepresentative.name === representative_id)
) {
  fetchRepresentativeDocuments(selectedRepresentative);
}

          if (normalizedStatus === 'approved') {
            setSuccessMessage(`${getDocumentTitle(docType)} has been approved!`);
          }
          if (normalizedStatus === 'rejected') {
          const message = comments 
            ? `${getDocumentTitle(docType)} was rejected. Reason: ${comments}. Please upload a new document within 24 hours.`
            : `${getDocumentTitle(docType)} was rejected. Please upload a new document within 24 hours.`;
          setError(message);
        }
        }
      )
      .subscribe();

    console.log('Real-time subscription set up for kyc_documents table');
    
    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRepresentative]);

  useEffect(() => {
    const fetchDirectors = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) throw new Error('No user session');
        const userId = sessionData.session.user.id;
        const { data: companyData, error } = await supabase
            .from('company_info')
          .select('directors')
          .eq('user_id', userId)
            .single();
        if (error) throw error;
        let directorsArr = [];
          if (companyData?.directors) {
          directorsArr = typeof companyData.directors === 'string'
            ? JSON.parse(companyData.directors)
            : companyData.directors;
        }
        setDirectors(directorsArr);
          setError(null);
      } catch (err) {
        console.error('Error fetching directors:', err);
        setDirectors([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectors();
  }, []);

  // Fetch document statuses for a representative
const fetchRepresentativeDocuments = async (representative) => {
    // This function is now replaced by fetchExistingDocuments
    // Documents are fetched once and organized by representative
    console.log('fetchRepresentativeDocuments called for:', representative);
};

// Add real-time subscription for document updates
useEffect(() => {
  if (!selectedRepresentative) return;

  const representativeId = selectedRepresentative.email || selectedRepresentative.name;
  
  const subscription = supabase
    .channel('kyc-document-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'kyc_documents',
        filter: `representative_id=eq.${representativeId}`
      },
      (payload) => {
        console.log('Document change received:', payload);
        // Refresh documents when changes occur
        fetchRepresentativeDocuments(selectedRepresentative);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [selectedRepresentative]);

  const DocumentCard = ({ type, title, description, status, document, onUpload, onView }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassportInfo, setShowPassportInfo] = useState(false);
    const [showAddressInfo, setShowAddressInfo] = useState(false);
    const [showUtilityInfo, setShowUtilityInfo] = useState(false);
    const [showLicenseInfo, setShowLicenseInfo] = useState(false);
    
    const handleFileSelection = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setIsProcessing(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', type === 'addressProof' ? 'address_proof' : 
                                       type === 'utilityBill' ? 'utility_bill' :
                                       type === 'drivingLicense' ? 'driving_license' : type);

        const API_URL = 'https://document-extractorbackend-2.onrender.com';
        const response = await fetch(`${API_URL}/`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        console.log('Raw API Response:', result);

        if (result.status === 'Error') {
          throw new Error(result.message || 'Document extraction failed');
        }

        // For address proof
        if (type === 'addressProof') {
          const validation = validateAddressProof(result.data.document_date);
          
          const formattedData = {
            address: result.data.address,
            document_date: result.data.document_date,
            issuing_authority: result.data.issuing_authority,
            resident_name: result.data.name,
            validation_status: validation.status,
            validation_message: validation.message,
            months_since_issue: validation.monthsDiff
          };

          setDocumentStatus(validation.status);
          setStatusMessage(validation.message);
          setExtractedData({
            ...result.data,
            ...formattedData
          });

          setFileToUpload(file);
          setUploadType('addressProof');
          setShowConfirmation(true);
          return;
        }

        // For utility bill
        if (type === 'utilityBill') {
          const validation = validateUtilityBill(result.data.bill_date);
          
          // Keep the original data from the API response
          const formattedData = {
            ...result.data,  // Keep all original fields
            verification_status: validation.status,
            validation_message: validation.message,
            months_since_issue: validation.monthsDiff
          };

          setDocumentStatus(validation.status);
          setStatusMessage(validation.message);
          setExtractedData(formattedData);

          setFileToUpload(file);
          setUploadType('utilityBill');
          setShowConfirmation(true);
          return;
        }

        // For driving license
        if (type === 'drivingLicense') {
          console.log('Processing driving license document');
          console.log('Raw API data:', result.data);
          
          const validation = validateDrivingLicense(result.data.date_of_expiry);
          console.log('Validation result:', validation);
          
          const formattedData = {
            ...result.data,
            verification_status: validation.status,
            validation_message: validation.message
          };
          
          console.log('Formatted data:', formattedData);
          
          setDocumentStatus(validation.status);
          setStatusMessage(validation.message);
          setExtractedData(formattedData);
          
          console.log('Updated document status:', validation.status);
          console.log('Updated status message:', validation.message);

          setFileToUpload(file);
          setUploadType('drivingLicense');
          setShowConfirmation(true);
          return;
        }

        // Parse expiry date properly for passport
        const expiryDateStr = result.data.date_of_expiry;
        let expiryDate;
        
        // Handle different date formats
        if (expiryDateStr.includes('-')) {
          const [day, month, year] = expiryDateStr.split('-');
          expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (expiryDateStr.includes(' ')) {
          const [day, month, year] = expiryDateStr.split(' ');
          const monthMap = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
          };
          const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
          expiryDate = new Date(fullYear, monthMap[month.toUpperCase()], parseInt(day));
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        
        let documentStatus;
        let statusMessage;
        
        console.log('Expiry Date:', expiryDate.toISOString());
        console.log('Current Date:', currentDate.toISOString());
        
        if (!expiryDate || isNaN(expiryDate.getTime())) {
          documentStatus = 'rejected';
          statusMessage = 'Document rejected - invalid expiry date format';
        } else if (expiryDate <= currentDate) {
          documentStatus = 'rejected';
          statusMessage = 'Document rejected - passport expired';
        } else {
          documentStatus = 'approved';
          statusMessage = 'Document approved - valid passport';
        }

        console.log('Status:', documentStatus);
        console.log('Message:', statusMessage);

        setDocumentStatus(documentStatus);
        setStatusMessage(statusMessage);
        setExtractedData(result.data);
        setFileToUpload(file);
        setUploadType('passport');
        setShowConfirmation(true);

      } catch (err) {
        console.error('Document processing error:', err);
        setError(`Document processing failed: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    };

    const normalizedStatus = (status || 'not uploaded').toLowerCase();
    const rejectionReason = documentStatuses[`${type}RejectReason`];

    return (
      <div className="document-card-container">
        <div className="document-card-header">
          <h3 className="document-card-title">{title.toUpperCase()}</h3>
          <div className={`status-badge ${normalizedStatus}`}>
            {normalizedStatus === 'approved' && (
              <><CheckCircle size={14} /> Approved</>
            )}
            {normalizedStatus === 'pending' && (
              <><Clock size={14} /> Pending</>
            )}
            {normalizedStatus === 'rejected' && (
              <><X size={14} /> Rejected</>
            )}
            {normalizedStatus === 'not uploaded' && (
              <><Circle size={14} /> Required</>
            )}
          </div>
        </div>

        {document ? (
          <div className="document-content">
            <div className="document-info">
              <div className="file-details1">
                <FileText size={16} className="file-icon" />
                <span className="file-name">{document.name}</span>
              </div>
              <div className="upload-meta">
                <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
                <span>Size: {formatFileSize(document.size)}</span>
              </div>
            </div>

            

            {type === 'passport' && document.extractedData && (
              <div className="passport-section">
                <button1
                  onClick={() => setShowPassportInfo(!showPassportInfo)}
                  className="button1 passport"
                >
                  <div className="button1-content">
                    <FileText className="button1-icon" />
                    <span>Passport Information</span>
                  </div>
                  <svg
                    className={`button1-arrow ${showPassportInfo ? 'rotated' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button1>
                {showPassportInfo && (
                  <div className="mt-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Full Name</label>
                        <value>{document.extractedData.surname}, {document.extractedData.given_names}</value>
                      </div>
                      <div className="detail-item">
                        <label>Date of Birth</label>
                        <value>{document.extractedData.date_of_birth}</value>
                      </div>
                      <div className="detail-item">
                        <label>Nationality</label>
                        <value>{document.extractedData.nationality}</value>
                      </div>
                      <div className="detail-item">
                        <label>Passport Number</label>
                        <value>{document.extractedData.passport_number}</value>
                      </div>
                      <div className="detail-item">
                        <label>Date of Issue</label>
                        <value>{document.extractedData.date_of_issue}</value>
                      </div>
                      <div className="detail-item">
                        <label>Date of Expiry</label>
                        <value>{document.extractedData.date_of_expiry}</value>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {type === 'addressProof' && document.extractedData && (
              <div className="address-section mt-4">
                <button1
                  onClick={() => setShowAddressInfo(!showAddressInfo)}
                  className="button1 address"
                >
                  <div className="button1-content">
                    <Home className="button1-icon" />
                    <span>Address Information</span>
                  </div>
                  <svg
                    className={`button1-arrow ${showAddressInfo ? 'rotated' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button1>
                {showAddressInfo && (
                  <div className="mt-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Full Address</label>
                        <value>{document.extractedData.address}</value>
                      </div>
                      <div className="detail-item">
                        <label>Document Date</label>
                        <value>{document.extractedData.document_date}</value>
                      </div>
                      <div className="detail-item">
                        <label>Document Type</label>
                        <value>{document.extractedData.document_type || 'Address Proof'}</value>
                      </div>
                      <div className="detail-item">
                        <label>Issuer</label>
                        <value>{document.extractedData.issuer || 'Not Specified'}</value>
                      </div>
                      <div className="detail-item">
                        <label>Verification Status</label>
                        <value>{document.extractedData.validation_status}</value>
                      </div>
                      <div className="detail-item">
                        <label>Upload Date</label>
                        <value>{new Date(document.uploadDate).toLocaleDateString()}</value>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {type === 'utilityBill' && document.extractedData && (
              <div className="utility-section mt-4">
                <button1
                  onClick={() => setShowUtilityInfo(!showUtilityInfo)}
                  className="button1 utility"
                >
                  <div className="button1-content">
                    <Zap className="button1-icon" />
                    <span>Utility Bill Information</span>
                  </div>
                  <svg
                    className={`button1-arrow ${showUtilityInfo ? 'rotated' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button1>
                {showUtilityInfo && (
                  <div className="mt-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Provider</label>
                        <value>{document.extractedData.service_provider}</value>
                      </div>
                      <div className="detail-item">
                        <label>Bill Date</label>
                        <value>{document.extractedData.bill_date}</value>
                      </div>
                      <div className="detail-item">
                        <label>Bill Amount</label>
                        <value>{document.extractedData.total_amount_due || 'Not Available'}</value>
                      </div>
                      <div className="detail-item">
                        <label>Service Address</label>
                        <value>{document.extractedData.address}</value>
                      </div>
                      <div className="detail-item">
                        <label>Account Number</label>
                        <value>{document.extractedData.account_number || 'Not Available'}</value>
                      </div>
                      <div className="detail-item">
                        <label>Status</label>
                        <value>{document.extractedData.verification_status}</value>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {type === 'drivingLicense' && document.extractedData && (
              <div className="license-section mt-4">
                <button1
                  onClick={() => setShowLicenseInfo(!showLicenseInfo)}
                  className="button1 license"
                >
                  <div className="button1-content">
                    <CreditCard className="button1-icon" />
                    <span>Driving License Information</span>
                  </div>
                  <svg
                    className={`button1-arrow ${showLicenseInfo ? 'rotated' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button1>
                {showLicenseInfo && (
                  <div className="mt-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Full Name</label>
                        <value>{document.extractedData.name}</value>
                      </div>
                      <div className="detail-item">
                        <label>License Number</label>
                        <value>{document.extractedData.license_number}</value>
                      </div>
                      <div className="detail-item">
                        <label>Date of Birth</label>
                        <value>{document.extractedData.date_of_birth}</value>
                      </div>
                      <div className="detail-item">
                        <label>Issue Date</label>
                        <value>{document.extractedData.date_of_issue}</value>
                      </div>
                      <div className="detail-item">
                        <label>Expiry Date</label>
                        <value>{document.extractedData.date_of_expiry}</value>
                      </div>
                      <div className="detail-item">
                        <label>Address</label>
                        <value>{document.extractedData.address}</value>
                      </div>
                      
                      
                      
                    
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="document-actions">
              <button onClick={() => onView(type)} className="view-document-btn">
                <Eye size={16} />
                View Document
              </button>
              {document.extractedData && (
                <button 
                  onClick={() => handleViewDetails(document)} 
                  className="view-details-btn"
                  style={{
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: '8px'
                  }}
                >
                  <FileText size={14} />
                  View Details
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="upload-section">
            <p className="upload-description">{description}</p>
            <label className="upload-label">
              <input
                type="file"
                onChange={handleFileSelection}
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={isProcessing}
                className="hidden-input"
              />
              <div className="upload-button-content">
                <Upload size={24} />
                <span>{isProcessing ? 'Processing...' : 'Choose File'}</span>
                <p className="file-types">PDF</p>
              </div>
            </label>
          </div>
        )}
      </div>
    );
  };
  useEffect(() => {
  console.log('Updated documentStatuses:', documentStatuses);
}, [documentStatuses]);

useEffect(() => {
  console.log('Updated allDocumentStatuses:', allDocumentStatuses);
}, [allDocumentStatuses]);

  // Handle representative selection
  const handleSelectRepresentative = (representative) => {
    setSelectedRepresentative(representative);
    
    // Get documents for this representative from the already fetched data
    const repId = representative.email || representative.name;
    const repDocuments = allDocumentUploads[repId] || {};
    const repStatuses = allDocumentStatuses[repId] || {};
    
    // Set document uploads and statuses for this representative
    setDocumentUploads({
      passport: repDocuments.passport || null,
      addressProof: repDocuments.addressProof || null
    });
    
    setDocumentStatuses({
      passport: repStatuses.passport || 'Not Uploaded',
      addressProof: repStatuses.addressProof || 'Not Uploaded'
    });
  };

  // Add this new function for document extraction
  const extractDocumentData = async (file, documentType) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const API_URL = 'https://document-extractorbackend-2.onrender.com';
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      console.log('Extraction Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (err) {
      console.error('Document extraction error:', err);
      throw err;
    } finally {
      setIsExtracting(false);
    }
  };

  // Update the handleFileChange function
  const handleFileChange = async (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (documentType === 'passport') {
          // Only extract data for passport documents
          const extractionResult = await extractDocumentData(file, 'passport');
          setExtractedData(extractionResult.data);
        }
        
        setDocumentUploads(prev => ({
          ...prev,
          [documentType]: file
        }));
        
        setFileToUpload(file);
        setUploadType(documentType);
        setShowConfirmation(true);
      } catch (err) {
        setError(`Document extraction failed: ${err.message}`);
      }
    }
  };

  // Handle viewing a document
  const handleViewDocument = async (documentType) => {
    if (!selectedRepresentative || !documentUploads[documentType]) return;
    
    try {
      const repId = selectedRepresentative.email || selectedRepresentative.name;
      const repDocuments = allDocumentUploads[repId] || {};
      const document = repDocuments[documentType];
      
      if (!document) {
        setError('Document not found');
        return;
      }
      
      // Get the signed URL for the file
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(document.file_path, 3600); // URL valid for 1 hour
      
      if (error) {
        throw error;
      }
      
      if (data?.signedUrl) {
        // Open the document in a new tab
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error(`Error viewing ${documentType}:`, err);
      setError(`Could not retrieve document: ${err.message}`);
    }
  };

  const updateCachedDocumentData = (representativeId, documentType, data) => {
    // Update document statuses cache
    setAllDocumentStatuses(prev => ({
      ...prev,
      [representativeId]: {
        ...(prev[representativeId] || {}),
        [documentType]: data.status
      }
    }));

    // Update document uploads cache
    setAllDocumentUploads(prev => ({
      ...prev,
      [representativeId]: {
        ...(prev[representativeId] || {}),
        [documentType]: data.document
      }
    }));
  };

  const calculateCompliancePercentage = (stats) => {
    const total = stats.verified + stats.pending + stats.incomplete;
    if (total === 0) return 0;
    return Math.round((stats.verified / total) * 100);
  };

  // Update handleUploadDocument function
const handleUploadDocument = async (documentType) => {
  if (!selectedRepresentative || !fileToUpload) return;
  
  try {
    setUploadingDocuments(true);
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('No user session found');
    
    const user_id = sessionData.session.user.id;
    const representativeId = selectedRepresentative.email || selectedRepresentative.name;

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${user_id}/${representativeId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, fileToUpload);
    
    if (uploadError) throw uploadError;

    // Save document data
    const documentData = {
      user_id,
      representative_id: representativeId,
      doc_type: documentType === 'addressProof' ? 'address_proof' : documentType,
      file_path: filePath,
      file_name: fileToUpload.name,
      file_size: fileToUpload.size,
      content_type: fileToUpload.type,
      status: documentStatus,
      message: statusMessage,
      extracted_data: extractedData,
      upload_date: new Date().toISOString(),
      metadata: {
        uploaded_via: 'web_interface',
        extraction_version: '1.0'
      }
    };

    const { error: dbError } = await supabase
      .from('kyc_documents')
      .upsert([documentData]);

    if (dbError) throw dbError;

    // Update UI
    setSuccessMessage(`${getDocumentTitle(documentType)} uploaded successfully`);
    fetchRepresentativeDocuments(selectedRepresentative);

  } catch (err) {
    console.error('Upload error:', err);
    setError(err.message);
  } finally {
    setUploadingDocuments(false);
    setShowConfirmation(false);
  }
};

    const getStatusClass = (status) => {
    // Convert status to lowercase for consistent comparison
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-required';
    }
  };

  // Add this useEffect to fetch compliance stats and KYC records
  useEffect(() => {
    const fetchComplianceAndRecords = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;

        const user_id = sessionData.session.user.id;

        // Fetch all documents for current user
        const { data: documents, error: docsError } = await supabase
          .from('kyc_documents')
          .select('*')
          .eq('user_id', user_id);

        if (docsError) throw docsError;

        // Get unique representative IDs
        const representativeIds = [...new Set(documents?.map(doc => doc.representative_id) || [])];

        // Calculate document counts by status
        const stats = {
          verified: 0,
          pending: 0,
          incomplete: 0
        };

        // Create a map to track document status for each representative
        const repStatusMap = {};

        // Initialize status for each representative
        representativeIds.forEach(repId => {
          repStatusMap[repId] = {
            approved: 0,
            pending: 0,
            rejected: 0,
            total: 0
          };
        });

        // Count documents by status for each representative
        documents?.forEach(doc => {
          const status = doc.status.toLowerCase();
          const repId = doc.representative_id;

          repStatusMap[repId].total++;
          
          if (status === 'approved') {
            stats.verified++;
            repStatusMap[repId].approved++;
          } else if (status === 'pending') {
            stats.pending++;
            repStatusMap[repId].pending++;
          } else if (status === 'rejected') {
            stats.incomplete++;
            repStatusMap[repId].rejected++;
          }
        });

        // Fetch representatives from company_info
        const { data: companyData, error: companyError } = await supabase
          .from('company_info')
          .select('directors')
          .eq('user_id', user_id)
          .single();

        if (companyError) throw companyError;

        let directors = [];
        if (companyData?.directors) {
          if (Array.isArray(companyData.directors)) {
            directors = companyData.directors;
          } else if (typeof companyData.directors === 'object') {
            directors = [companyData.directors];
          } else if (typeof companyData.directors === 'string') {
            try {
              directors = JSON.parse(companyData.directors);
            } catch (e) {
              console.error('Error parsing directors:', e);
            }
          }
        }

        // Calculate status for each representative
        const records = directors.map(director => {
          const repId = director.email || director.name;
          const repStats = repStatusMap[repId] || { approved: 0, pending: 0, rejected: 0, total: 0 };
          const requiredDocs = 4; // Total required documents per representative
          
          let status = 'Incomplete';
          if (repStats.total === requiredDocs) {
            if (repStats.approved === requiredDocs) {
              status = 'Verified';
            } else if (repStats.pending > 0) {
              status = 'Pending';
            }
          }

          // Calculate risk score based on document status
          

          return {
            name: director.fullName || director.name,
            type: "Individual",
            role: director.role || "Director",
            status: status,
            dateAdded: new Date().toLocaleDateString()
          };
        });

        // Update missing documents count
        const totalRequired = directors.length * 4; // 4 documents per representative
        const totalSubmitted = stats.verified + stats.pending + stats.incomplete;
        stats.incomplete += totalRequired - totalSubmitted;

        setComplianceStats(stats);
        setKycRecords(records);

      } catch (error) {
        console.error('Error fetching compliance stats and records:', error);
        setError(error.message);
      }
    };

    fetchComplianceAndRecords();
  }, []);

  // Add this function before the return statement
  const filteredRecords = kycRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || record.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const fetchBaseCompany = async () => {
        try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;
        const user_id = sessionData.session.user.id;
        const { data, error } = await supabase
          .from('company_info')
        .select('*')
          .eq('user_id', user_id)
          .single();
            
            if (error) {
                // If no company info exists, set baseCompany to null
                if (error.message.includes('JSON object requested') || 
                    error.message.includes('multiple (or no) rows returned')) {
                    setBaseCompany(null);
                    return;
                }
                throw error;
            }
        setBaseCompany(data);
        } catch (error) {
            console.error('Error fetching base company:', error);
            setBaseCompany(null);
        }
    };
    fetchBaseCompany();
  }, []);

  // Fetch documents for this company
  useEffect(() => {
    if (!baseCompany?.id) return;
    const fetchDocs = async () => {
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', baseCompany.id);
      if (!error) setCompanyDocs(data);
    };
    fetchDocs();
  }, [baseCompany]);

  // Upload handler
  const handleCompanyDocUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file || !baseCompany?.id || !sessionUser?.id) {
      alert('Missing file, company, or user info');
      return;
    }
    setUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${docType}_${timestamp}.${fileExt}`;
      const filePath = `${baseCompany.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('company-documents')
        .upload(filePath, file);

      if (uploadError) {
        alert('Storage upload error: ' + uploadError.message);
        setUploading(false);
        return;
      }

      // 2. Insert into company_documents table
      const { data: insertData, error: dbError } = await supabase
        .from('company_documents')
        .insert([{
          user_id: sessionUser.id,
          company_id: baseCompany.id,
          doc_type: `${docType}_${timestamp}`, // Make it unique with timestamp
          file_name: file.name,
          file_path: filePath,
          status: 'pending',
          uploaded_at: new Date().toISOString()
        }])
        .select(); // get the inserted row back

      if (dbError) {
        alert('DB insert error: ' + dbError.message);
        setUploading(false);
        return;
      }

      // 3. Update local state to show the new document
      setCompanyDocs(prev => [...prev, insertData[0]]);
      alert('Document uploaded and record created!');
      } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  // View handler (already in your code)
  async function getCompanyDocumentUrl(filePath) {
    const { data, error } = await supabase
      .storage
      .from('company-documents')
      .createSignedUrl(filePath, 60 * 60); // 1 hour
    if (error) throw error;
    return data.signedUrl;
  }

  // Handle editing director information


  // Handle viewing KYC for a specific director
  const handleViewKYC = (director) => {
    // Set the selected representative and switch to documents tab
    setSelectedRepresentative(director);
    setActiveTab('documents');
    fetchRepresentativeDocuments(director);
  };

  // Handle viewing document details
  const handleViewDetails = (document) => {
    console.log('View Details clicked for document:', document);
    console.log('Extracted data:', document.extracted_data);
    setSelectedDocumentData(document);
    setDetailsModalOpen(true);
  };

  // Handle viewing target company details
  const handleViewTargetCompanyDetails = async (companyName) => {
    setLoadingTargetCompanyDetails(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;
      
      // Fetch target company details from the target_companies table
      const { data: targetCompanyData, error } = await supabase
        .from('target_companies')
        .select('*')
        .eq('user_id', userId)
        .eq('company_name', companyName)
        .single();
      
      if (error) {
        console.error('Error fetching target company details:', error);
        // If no data found, create a placeholder object
        setSelectedTargetCompany({
          company_name: companyName,
          reg_number: 'Not Set',
          vat_number: 'Not Set',
          incorporation_date: 'Not Set',
          base_location: 'Not Set',
          registered_address: 'Not Set',
          directors: [],
          shareholders: []
        });
      } else {
        console.log('Fetched target company details:', targetCompanyData);
        setSelectedTargetCompany(targetCompanyData);
      }
    } catch (err) {
      console.error('Error in handleViewTargetCompanyDetails:', err);
      // If error, create a placeholder object
      setSelectedTargetCompany({
        company_name: companyName,
        reg_number: 'Not Set',
        vat_number: 'Not Set',
        incorporation_date: 'Not Set',
        base_location: 'Not Set',
        registered_address: 'Not Set',
        directors: [],
        shareholders: []
      });
    } finally {
      setLoadingTargetCompanyDetails(false);
      setShowTargetCompanyDetails(true);
    }
  };

  // Function to render extracted data in a structured format
  const renderExtractedData = (extractedData, documentType) => {
    if (!extractedData) return null;

    const renderField = (label, value, isStatus = false) => {
      if (!value) return null;
      
      let statusColor = '#fff';
      if (isStatus) {
        if (value.toLowerCase().includes('approved') || value.toLowerCase().includes('verified')) {
          statusColor = '#10B981';
        } else if (value.toLowerCase().includes('rejected')) {
          statusColor = '#EF4444';
        } else if (value.toLowerCase().includes('pending')) {
          statusColor = '#F59E0B';
        }
      }

      return (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            color: '#9CA3AF', 
            fontSize: '12px', 
            fontWeight: '500',
            display: 'block',
            marginBottom: '4px'
          }}>
            {label}
          </label>
          <div style={{ 
            color: statusColor, 
            fontSize: '14px',
            background: isStatus ? `${statusColor}15` : 'transparent',
            padding: isStatus ? '4px 8px' : '0',
            borderRadius: isStatus ? '4px' : '0',
            display: 'inline-block'
          }}>
            {value}
          </div>
        </div>
      );
    };

    // Map database field names to UI field names
    const getDocumentTypeForUI = (dbType) => {
      switch (dbType) {
        case 'address_proof': return 'addressProof';
        case 'utility_bill': return 'utilityBill';
        case 'driving_license': return 'drivingLicense';
        default: return dbType;
      }
    };

    const uiDocumentType = getDocumentTypeForUI(documentType);

    // Render based on document type
    switch (uiDocumentType) {
      case 'passport':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {renderField('Full Name', `${extractedData.surname || ''} ${extractedData.given_names || ''}`.trim())}
            {renderField('Date of Birth', extractedData.date_of_birth)}
            {renderField('Nationality', extractedData.nationality)}
            {renderField('Passport Number', extractedData.passport_number)}
            {renderField('Date of Issue', extractedData.date_of_issue)}
            {renderField('Date of Expiry', extractedData.date_of_expiry)}
            {renderField('Issuing Authority', extractedData.issuing_authority)}
            {renderField('Verification Status', extractedData.verification_status || extractedData.validation_status, true)}
            {renderField('Validation Message', extractedData.validation_message)}
            {extractedData.verification_details && (
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '12px', background: '#1a1b36', borderRadius: '6px' }}>
                <h4 style={{ color: '#D1D5DB', marginBottom: '8px', fontSize: '14px' }}>Verification Details</h4>
                {renderField('Status', extractedData.verification_details.status, true)}
                {renderField('Message', extractedData.verification_details.message)}
                {renderField('Verification Date', new Date(extractedData.verification_details.verification_date).toLocaleDateString())}
              </div>
            )}
          </div>
        );

      case 'addressProof':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {renderField('Full Address', extractedData.address)}
            {renderField('Document Date', extractedData.document_date)}
            {renderField('Issuing Authority', extractedData.issuing_authority)}
            {renderField('Resident Name', extractedData.resident_name || extractedData.name)}
            {renderField('Validation Status', extractedData.validation_status, true)}
            {renderField('Validation Message', extractedData.validation_message)}
            {renderField('Months Since Issue', extractedData.months_since_issue ? `${extractedData.months_since_issue} months` : null)}
            {extractedData.verification_details && (
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '12px', background: '#1a1b36', borderRadius: '6px' }}>
                <h4 style={{ color: '#D1D5DB', marginBottom: '8px', fontSize: '14px' }}>Verification Details</h4>
                {renderField('Status', extractedData.verification_details.status, true)}
                {renderField('Message', extractedData.verification_details.message)}
                {renderField('Verification Date', new Date(extractedData.verification_details.verification_date).toLocaleDateString())}
              </div>
            )}
          </div>
        );

      case 'utilityBill':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {renderField('Service Provider', extractedData.service_provider)}
            {renderField('Bill Date', extractedData.bill_date)}
            {renderField('Total Amount Due', extractedData.total_amount_due)}
            {renderField('Service Address', extractedData.address)}
            {renderField('Account Number', extractedData.account_number)}
            {renderField('Verification Status', extractedData.verification_status, true)}
            {renderField('Validation Message', extractedData.validation_message)}
            {renderField('Months Since Issue', extractedData.months_since_issue ? `${extractedData.months_since_issue} months` : null)}
            {extractedData.verification_details && (
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '12px', background: '#1a1b36', borderRadius: '6px' }}>
                <h4 style={{ color: '#D1D5DB', marginBottom: '8px', fontSize: '14px' }}>Verification Details</h4>
                {renderField('Status', extractedData.verification_details.status, true)}
                {renderField('Message', extractedData.verification_details.message)}
                {renderField('Verification Date', new Date(extractedData.verification_details.verification_date).toLocaleDateString())}
              </div>
            )}
          </div>
        );

      case 'drivingLicense':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {renderField('Full Name', extractedData.name)}
            {renderField('License Number', extractedData.license_number)}
            {renderField('Date of Birth', extractedData.date_of_birth)}
            {renderField('Issue Date', extractedData.date_of_issue)}
            {renderField('Expiry Date', extractedData.date_of_expiry)}
            {renderField('Address', extractedData.address)}
            {renderField('Verification Status', extractedData.verification_status, true)}
            {renderField('Validation Message', extractedData.validation_message)}
            {extractedData.verification_details && (
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '12px', background: '#1a1b36', borderRadius: '6px' }}>
                <h4 style={{ color: '#D1D5DB', marginBottom: '8px', fontSize: '14px' }}>Verification Details</h4>
                {renderField('Status', extractedData.verification_details.status, true)}
                {renderField('Message', extractedData.verification_details.message)}
                {renderField('Verification Date', new Date(extractedData.verification_details.verification_date).toLocaleDateString())}
              </div>
            )}
          </div>
        );

      default:
        // For other document types, show a structured view of the data
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {Object.entries(extractedData).map(([key, value]) => {
              if (key === 'verification_details' || key === 'processing_metadata') return null;
              if (typeof value === 'object' && value !== null) return null;
              return renderField(
                key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                String(value),
                key.includes('status') || key.includes('verification')
              );
            })}
            {extractedData.verification_details && (
              <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '12px', background: '#1a1b36', borderRadius: '6px' }}>
                <h4 style={{ color: '#D1D5DB', marginBottom: '8px', fontSize: '14px' }}>Verification Details</h4>
                {renderField('Status', extractedData.verification_details.status, true)}
                {renderField('Message', extractedData.verification_details.message)}
                {renderField('Verification Date', new Date(extractedData.verification_details.verification_date).toLocaleDateString())}
              </div>
            )}
          </div>
        );
    }
  };

  // Handle adding a new director
  const handleAddDirector = () => {
    // Navigate to the forms page to add a new director
    navigate('/generate-forms', { 
      state: { 
        addMode: true 
      } 
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user);
    };
    getUser();
  }, []);

  const handleAddCompanyClick = () => {
    setShowAddCompany(true);
    setNewCompany({
      company_name: baseCompany?.company_name || '',
      reg_number: baseCompany?.reg_number || '',
      vat_number: baseCompany?.vat_number || '',
      incorporation_date: baseCompany?.incorporation_date || '',
      base_location: baseCompany?.base_location || '',
      registered_address: baseCompany?.registered_address || ''
    });
  };

  const handleSaveNewCompany = async () => {
    // Save to Supabase
    const { data, error } = await supabase
      .from('target_companies')
      .insert([{
        ...newCompany,
        user_id: sessionUser.id
      }])
      .select();
    if (!error) {
      setTargetCompanies(prev => [...prev, data[0]]);
      setShowAddCompany(false);
    } else {
      alert('Error adding company: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchTargetCompanies = async () => {
      const { data, error } = await supabase
        .from('target_companies')
        .select('*')
        .eq('user_id', sessionUser.id);
      if (!error) setTargetCompanies(data);
    };
    if (sessionUser) fetchTargetCompanies();
  }, [sessionUser]);

  const handleEditTargetDirector = (index) => {
    // TODO: Implement edit logic for director at index
  };

  const handleEditTargetShareholder = (index) => {
    // TODO: Implement edit logic for shareholder at index
  };

  const handleEditBaseCompany = () => {
    // If no base company exists, create a new one with empty fields
    if (!baseCompany) {
      setEditingCompany({
        company_name: '',
        reg_number: '',
        vat_number: '',
        incorporation_date: '',
        base_location: '',
        registered_address: ''
      });
    } else {
    // Make a shallow copy to avoid mutating state directly
      setEditingCompany({ ...baseCompany });
    }
    setShowEditModal(true);
  };

  const handleSaveEditBaseCompany = async () => {
    if (!editingCompany) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        alert('No user session found');
        return;
      }
      
      const user_id = sessionData.session.user.id;
      
      if (baseCompany?.id) {
        // Update existing company
    const { data, error } = await supabase
      .from('company_info')
      .update({
        company_name: editingCompany.company_name,
        reg_number: editingCompany.reg_number,
        vat_number: editingCompany.vat_number,
        incorporation_date: editingCompany.incorporation_date,
        base_location: editingCompany.base_location,
        registered_address: editingCompany.registered_address
      })
          .eq('id', baseCompany.id)
      .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
      setBaseCompany(data[0]);
      setShowEditModal(false);
        }
    } else {
        // Create new company
        const { data, error } = await supabase
          .from('company_info')
          .insert([{
            user_id: user_id,
            company_name: editingCompany.company_name,
            reg_number: editingCompany.reg_number,
            vat_number: editingCompany.vat_number,
            incorporation_date: editingCompany.incorporation_date,
            base_location: editingCompany.base_location,
            registered_address: editingCompany.registered_address
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBaseCompany(data[0]);
          setShowEditModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving company details:', error);
      alert('Error saving company details: ' + error.message);
    }
  };

  const handleAddBaseDirector = async () => {
    if (!newBaseDirector.name || !newBaseDirector.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (!baseCompany?.id) {
      alert('Please set up your company details first before adding directors');
      return;
    }

    try {
      const updatedDirectors = [...(baseCompany?.directors || []), newBaseDirector];
      const { data, error } = await supabase
        .from('company_info')
        .update({ directors: updatedDirectors })
        .eq('id', baseCompany.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setBaseCompany(data[0]);
        setNewBaseDirector({ 
          name: '', 
          email: '', 
          role: 'Director',
          phone: '',
          appointedDate: new Date().toLocaleDateString()
        });
        setShowAddDirectorModal(false);
      }
    } catch (error) {
      console.error('Error adding director:', error);
      alert('Error adding director: ' + error.message);
    }
  };

  const handleAddBaseShareholder = async () => {
    if (!newBaseShareholder.name || !newBaseShareholder.percentage) {
      alert('Please fill in all required fields');
      return;
    }

    if (!baseCompany?.id) {
      alert('Please set up your company details first before adding shareholders');
      return;
    }

    try {
      const updatedShareholders = [...(baseCompany?.shareholders || []), newBaseShareholder];
      const { data, error } = await supabase
        .from('company_info')
        .update({ shareholders: updatedShareholders })
        .eq('id', baseCompany.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setBaseCompany(data[0]);
        setNewBaseShareholder({ 
          name: '', 
          percentage: '',
          type: 'Individual',
          shares: '0'
        });
        setShowAddShareholderModal(false);
      }
    } catch (error) {
      console.error('Error adding shareholder:', error);
      alert('Error adding shareholder: ' + error.message);
    }
  };

  const handleEditTargetCompany = () => {
    if (!selectedTargetCompany) return;
    setEditingTargetCompany({ ...selectedTargetCompany });
    setShowEditTargetCompanyModal(true);
  };

  const handleSaveEditTargetCompany = async () => {
    if (!editingTargetCompany) return;
    
    try {
      const { data, error } = await supabase
        .from('target_companies')
        .update({
          company_name: editingTargetCompany.company_name,
          reg_number: editingTargetCompany.reg_number,
          vat_number: editingTargetCompany.vat_number,
          incorporation_date: editingTargetCompany.incorporation_date,
          base_location: editingTargetCompany.base_location,
          registered_address: editingTargetCompany.registered_address
        })
        .eq('id', editingTargetCompany.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSelectedTargetCompany(data[0]);
        setTargetCompanies(prev => 
          prev.map(tc => tc.id === editingTargetCompany.id ? data[0] : tc)
        );
        setShowEditTargetCompanyModal(false);
      }
    } catch (error) {
      console.error('Error updating target company:', error);
      alert('Error updating target company: ' + error.message);
    }
  };

  const handleAddTargetDirector = async () => {
    if (!newTargetDirector.name || !newTargetDirector.email) {
      alert('Please fill in all required fields');
      return;
    }
    if (!selectedTargetCompany?.id) {
      alert('No target company selected');
      return;
    }
    try {
      const updatedDirectors = [...(selectedTargetCompany?.directors || []), newTargetDirector];
      const { data, error } = await supabase
        .from('target_companies')
        .update({ directors: updatedDirectors })
        .eq('id', selectedTargetCompany.id)
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setSelectedTargetCompany(data[0]);
        setTargetCompanies(prev => 
          prev.map(tc => tc.id === selectedTargetCompany.id ? data[0] : tc)
        );
        setNewTargetDirector({ name: '', email: '', role: 'Director', phone: '', appointedDate: new Date().toLocaleDateString() });
        setShowAddTargetDirectorModal(false);
      }
    } catch (error) {
      console.error('Error adding target director:', error);
      alert('Error adding target director: ' + error.message);
    }
  };

  const handleAddTargetShareholder = async () => {
    if (!newTargetShareholder.name || !newTargetShareholder.percentage) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedTargetCompany?.id) {
      alert('No target company selected');
      return;
    }

    try {
      const updatedShareholders = [...(selectedTargetCompany?.shareholders || []), newTargetShareholder];
      const { data, error } = await supabase
        .from('target_companies')
        .update({ shareholders: updatedShareholders })
        .eq('id', selectedTargetCompany.id)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSelectedTargetCompany(data[0]);
        setTargetCompanies(prev => 
          prev.map(tc => tc.id === selectedTargetCompany.id ? data[0] : tc)
        );
        setNewTargetShareholder({ 
          name: '', 
          percentage: '',
          type: 'Individual',
          shares: '0'
        });
        setShowAddTargetShareholderModal(false);
      }
    } catch (error) {
      console.error('Error adding target shareholder:', error);
      alert('Error adding target shareholder: ' + error.message);
    }
  };

  // Fetch existing KYC documents
  const fetchExistingDocuments = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error('No user session');
      const userId = sessionData.session.user.id;

      // Fetch all KYC documents for this user
      const { data: documents, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Organize documents by representative and type
      const docsByRepresentative = {};
      if (documents) {
      documents.forEach(doc => {
        let docType = doc.doc_type;
          // Map database doc_type to UI doc_type
          if (doc.doc_type === 'address_proof') docType = 'addressProof';
          if (doc.doc_type === 'utility_bill') docType = 'utilityBill';
          if (doc.doc_type === 'driving_license') docType = 'drivingLicense';
          
          const representativeId = doc.representative_id;
          if (!docsByRepresentative[representativeId]) {
            docsByRepresentative[representativeId] = {};
          }
          
          docsByRepresentative[representativeId][docType] = {
            id: doc.id,
            file_name: doc.file_name,
            file_size: doc.file_size,
            file_path: doc.file_path,
            status: doc.status,
            message: doc.message,
            extracted_data: doc.extracted_data,
            upload_date: doc.upload_date,
            representative_id: doc.representative_id
          };
        });
      }

      setAllDocumentUploads(docsByRepresentative);
      
      // Build status map for representatives section
      const statusMap = {};
      Object.keys(docsByRepresentative).forEach(repId => {
        statusMap[repId] = {};
        Object.keys(docsByRepresentative[repId]).forEach(docType => {
          statusMap[repId][docType] = docsByRepresentative[repId][docType].status.toLowerCase();
      });
      });
      setAllDocumentStatuses(statusMap);
      
    } catch (err) {
      console.error('Error fetching existing documents:', err);
      setAllDocumentUploads({});
      setAllDocumentStatuses({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents when component mounts
  useEffect(() => {
    fetchExistingDocuments();
  }, []);

  // Get all representatives (directors from company_info)
  const getAllRepresentatives = () => {
    return directors || [];
  };

  // Get all representatives for the representatives section
  const getAllRepresentativesForSection = () => {
    return directors || [];
  };

  return (
    <div className="app-container" style={{ backgroundColor: 'rgb(10, 8, 38)', color: 'white' }}>
      <div className="p-6">
        {/* Upload Button - Right Corner */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowDocumentUploadModal(true)}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              minWidth: '160px',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Upload size={18} />
            Upload Documents
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                <Shield className="text-indigo-400" size={24} /> KYC Overview
              </h1>
              <p className="text-gray-400">Manage and monitor your Know Your Customer compliance status</p>
            </div>
          </div>
        </div>
        {/* KYC User Guide - now below heading */}
        <div className="kyc-user-guide">
          <strong>What is KYC?</strong> <br/>
          <span>
            KYC (Know Your Customer) is a regulatory process that helps verify the identity of clients to prevent fraud, money laundering, and financial crime. Completing your KYC ensures your business remains compliant with global standards and enables secure, trusted transactions.<br/><br/>
            <strong>How to use this page:</strong> <br/>
            - Add and manage your company and representatives.<br/>
            - Upload and track required documents for each representative.<br/>
            - Monitor the status of your KYC verification and compliance.<br/>
            - View your corporate structure and manage related information.<br/>
          </span>
        </div>

        <div className="kyc-nav-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
         
          <button
            className={activeTab === 'representatives' ? 'active' : ''}
            onClick={() => setActiveTab('representatives')}
          >
            Representatives
          </button>
          <button
            className={activeTab === 'corporate-structure' ? 'active' : ''}
            onClick={() => setActiveTab('corporate-structure')}
          >
            Corporate Structure
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'documents' && (
            <div className="bg-indigo-800/50 p-6 rounded-lg shadow border border-indigo-700">
              <h2 className="">Upload Documents</h2>
              
              <div className="bg-blue-500/20 p-4 rounded-lg mb-6 flex items-start gap-3">
                <div>
                  <h3 className="font-semibold text-blue-400">Select a Representative</h3>
                  <p className="text-gray-300 mt-1">Please select a representative to upload or view their documents.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <select 
                  className="w-full bg-indigo-900/50 border border-indigo-700 text-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRepresentative ? (selectedRepresentative.email || selectedRepresentative.name) : ''}
                  onChange={(e) => {
                    const allReps = getAllRepresentatives();
                    const selected = allReps.find(d => (d.email || d.name) === e.target.value);
                    if (selected) {
                      handleSelectRepresentative(selected);
                    }
                  }}
                >
                  <option value="">Select a Representative</option>
                  {getAllRepresentatives().map((director, idx) => (
                    <option key={idx} value={director.email || director.name}>
                      {director.fullName || director.name} ({director.email})
                    </option>
                  ))}
                </select>
              </div>

              {loading || uploadingDocuments ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : selectedRepresentative ? (
                <div className="document-grid">
                  <DocumentCard 
                    type="passport"
                    title="Passport"
                    description="Upload a clear copy of your passport. All details must be visible."
                    status={documentStatuses.passport}
                    document={documentUploads.passport}
                    onUpload={handleFileChange}
                    onView={handleViewDocument}
                  />
                  <DocumentCard 
                    type="addressProof"
                    title="Address Proof"
                    description="Upload a document proving your current residential address."
                    status={documentStatuses.addressProof}
                    document={documentUploads.addressProof}
                    onUpload={handleFileChange}
                    onView={handleViewDocument}
                  />
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'company-profiles' && (
            <div className="company-profiles-section">
              {showTargetCompanyDetails && selectedTargetCompany && (
                <div className="base-company-details-view">
                  <div className="base-company-header">
                    <button className="back-btn" onClick={() => {
                      setShowTargetCompanyDetails(false);
                      setSelectedTargetCompany(null);
                    }}>
                      <span style={{fontSize:'1.4rem',display:'flex',alignItems:'center'}}>&larr;</span>
                    </button>
                    <span className="company-title">{selectedTargetCompany.company_name || 'Untitled Company'}</span>
                    <span className="base-company-badge">Target Company</span>
                  </div>
                  <div className="details-grid">
                    {/* Left: Company Details */}
                    <div className="company-details-card">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="section-title">Company Details</h3>
                        <button className="edit-btn" onClick={handleEditTargetCompany}>✏️ Edit Details</button>
                      </div>
                      <hr style={{ borderColor: '#fff', opacity: 0.2, margin: '12px 0 24px 0' }} />
                      <div className="company-details-grid">
                        <div>
                          <div className="detail-label">Company Name</div>
                          <div className={`detail-value ${!selectedTargetCompany.company_name ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                            {selectedTargetCompany.company_name || 'Not Set'}
                          </div>
                        </div>
                        <div>
                          <div className="detail-label">Registration Number</div>
                          <div className={`detail-value ${!selectedTargetCompany.reg_number ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                            {selectedTargetCompany.reg_number || 'Not Set'}
                          </div>
                      </div>
                        <div>
                          <div className="detail-label">Tax ID</div>
                          <div className={`detail-value ${!selectedTargetCompany.vat_number ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                            {selectedTargetCompany.vat_number || 'Not Set'}
                          </div>
                      </div>
                        <div>
                          <div className="detail-label">Incorporation Date</div>
                          <div className={`detail-value ${!selectedTargetCompany.incorporation_date ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                            {selectedTargetCompany.incorporation_date || 'Not Set'}
                          </div>
                    </div>
                        <div>
                          <div className="detail-label">Country</div>
                          <div className={`detail-value ${!selectedTargetCompany.base_location ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                            {selectedTargetCompany.base_location || 'Not Set'}
                          </div>
                  </div>
                          <div>
                          <div className="detail-label">Address</div>
                          <div className={`detail-value ${!selectedTargetCompany.registered_address ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                            {selectedTargetCompany.registered_address || 'Not Set'}
                          </div>
                        </div>
                        </div>
                    </div>
                    {/* Right: Directors and Shareholders */}
                    <div className="side-cards">
                      {/* Directors Card */}
                      <div className="side-card">
                        <div className="side-card-title">Directors</div>
                        {selectedTargetCompany.directors && selectedTargetCompany.directors.length > 0 ? (
                          selectedTargetCompany.directors.map((d, i) => (
                            <div className="side-card-row" key={i}>
                              <span className="side-card-icon">👤</span>
                              <span className="side-card-name">{d.fullName || d.name}</span>
                              <div className="side-card-actions">
                                <button className="edit-btn" onClick={() => handleEditTargetDirector(i)}>Edit</button>
                      </div>
                          </div>
                          ))
                        ) : (
                          <div className="empty-directors">
                            <p>No directors added yet</p>
                        </div>
                        )}
                        <button className="add-director-btn" onClick={() => setShowAddTargetDirectorModal(true)}>+ Add Director</button>
                      </div>
                      {/* Shareholders Card */}
                      <div className="side-card">
                        <div className="side-card-title">Shareholders</div>
                        {selectedTargetCompany.shareholders && selectedTargetCompany.shareholders.length > 0 ? (
                          selectedTargetCompany.shareholders.map((s, i) => (
                            <div className="side-card-row" key={i}>
                              <span className="side-card-icon">🧑‍💼</span>
                              <span className="side-card-name">{s.name}</span>
                              <span className="side-card-meta">{s.percentage || s.percent || '50%'} ownership</span>
                              <button className="edit-btn" onClick={() => handleEditTargetShareholder(i)}>Edit</button>
                          </div>
                          ))
                        ) : (
                          <div className="empty-shareholders">
                            <p>No shareholders added yet</p>
                        </div>
                        )}
                        <button className="add-shareholder-btn" onClick={() => setShowAddTargetShareholderModal(true)}>+ Add Shareholder</button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
              {showBaseCompanyDetails && !showTargetCompanyDetails ? (
                // Base company details view only
                <div className="base-company-details-view">
                  <div className="base-company-header">
                    <button className="back-btn" onClick={() => setShowBaseCompanyDetails(false)}>
                      <span style={{fontSize:'1.4rem',display:'flex',alignItems:'center'}}>&larr;</span>
                    </button>
                    <span className="company-title">{baseCompany?.company_name || 'Tech Innovations Ltd'}</span>
                    <span className="base-company-badge">Base Company</span>
                  </div>
                  
                  {/* Company Details Section */}
                  <div className="details-grid">
                    <div className="company-details-card">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="section-title">Company Details</h3>
                      <button className="edit-btn" onClick={handleEditBaseCompany} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>✏️</span>
                        <span>{baseCompany?.id ? 'Edit Details' : 'Set Up Company'}</span>
                      </button>
                      </div>
                    {!baseCompany?.id && (
                      <div className="bg-blue-500/20 p-4 rounded-lg mb-4 border border-blue-500/30">
                        <p className="text-blue-300 text-sm">
                          <strong>No company details found.</strong> Click "Set Up Company" to add your company information.
                        </p>
                      </div>
                    )}
                      <div className="company-details-grid">
                        <div>
                          <div className="detail-label">Company Name</div>
                          <div className={`detail-value ${!baseCompany?.company_name ? 'not-set' : ''}`}>
                            {baseCompany?.company_name || 'Not Set'}
                          </div>
                        </div>
                        <div>
                          <div className="detail-label">Registration Number</div>
                          <div className={`detail-value ${!baseCompany?.reg_number ? 'not-set' : ''}`}>
                            {baseCompany?.reg_number || 'Not Set'}
                          </div>
                        </div>
                        <div>
                          <div className="detail-label">Tax ID</div>
                          <div className={`detail-value ${!baseCompany?.vat_number ? 'not-set' : ''}`}>
                            {baseCompany?.vat_number || 'Not Set'}
                          </div>
                        </div>
                        <div>
                          <div className="detail-label">Incorporation Date</div>
                          <div className={`detail-value ${!baseCompany?.incorporation_date ? 'not-set' : ''}`}>
                            {baseCompany?.incorporation_date || 'Not Set'}
                          </div>
                        </div>
                        <div>
                          <div className="detail-label">Country</div>
                          <div className={`detail-value ${!baseCompany?.base_location ? 'not-set' : ''}`}>
                            {baseCompany?.base_location || 'Not Set'}
                          </div>
                      </div>
                        <div>
                          <div className="detail-label">Address</div>
                          <div className={`detail-value ${!(baseCompany?.registered_address || baseCompany?.address) ? 'not-set' : ''}`}>
                            {baseCompany?.registered_address || baseCompany?.address || 'Not Set'}
                          </div>
                    </div>
                      </div>
                    </div>
                    
                    {/* Side Cards */}
                    <div className="side-cards">
                      {/* Directors Card */}
                      <div className="side-card">
                        <div className="side-card-title">Directors</div>
                        {baseCompany?.directors && Array.isArray(baseCompany.directors) && baseCompany.directors.length > 0 ? (
                          baseCompany.directors.map((d, i) => (
                          <div className="side-card-row" key={i}>
                            <span className="side-card-icon">👤</span>
                            <span className="side-card-name">{d.fullName || d.name}</span>
                              <div className="side-card-actions">
                                <button className="edit-btn" onClick={() => {/* TODO: Edit base company director logic */}}>Edit</button>
                          </div>
                      </div>
                          ))
                        ) : (
                          <div className="empty-directors">
                            <p>No directors added yet</p>
                          </div>
                        )}
                        <button className="add-director-btn" onClick={() => setShowAddDirectorModal(true)}>+ Add Director</button>
                      </div>
                      
                      {/* Shareholders Card */}
                      <div className="side-card">
                        <div className="side-card-title">Shareholders</div>
                        {baseCompany?.shareholders && Array.isArray(baseCompany.shareholders) && baseCompany.shareholders.length > 0 ? (
                          baseCompany.shareholders.map((s, i) => (
                          <div className="side-card-row" key={i}>
                            <span className="side-card-icon">🧑‍💼</span>
                            <span className="side-card-name">{s.name}</span>
                              <span className="side-card-meta">{s.percentage || s.percent || '50%'} ownership</span>
                            <button className="view-kyc-btn">View KYC</button>
                          </div>
                          ))
                        ) : (
                          <div className="empty-shareholders">
                            <p>No shareholders added yet</p>
                      </div>
                        )}
                        <button className="add-shareholder-btn" onClick={() => setShowAddShareholderModal(true)}>+ Add Shareholder</button>
                    </div>
                  </div>
                  </div>
                  
                  {/* Financial Information */}
                 
                  {/* Company Documents */}
                  <div className="company-documents-card">
                    <div className="company-documents-header mb-2">
                      <h3 className="section-title">Company Documents</h3>
                      <label className="upload-doc-btn" style={{cursor: uploading ? 'not-allowed' : 'pointer'}}>
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          onChange={e => handleCompanyDocUpload(e, 'general')}
                          disabled={uploading}
                        />
                        {uploading ? 'Uploading...' : '⬆️ Upload Document'}
                      </label>
                    </div>
                    <div className="company-documents-list">
                      {companyDocs.length === 0 && (
                        <div className="empty-shareholders">
                          <p>No documents uploaded yet</p>
                      </div>
                      )}
                      {companyDocs.map(doc => (
                        <div className="company-document-row" key={doc.id}>
                        <span className="doc-icon">🗂️</span>
                          <span className="doc-title">{doc.doc_type.split('_')[0]}</span>
                          <span className="doc-filename">{doc.file_name}</span>
                          <span className={`doc-status ${doc.status}`}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                          <button
                            className="doc-action-btn"
                            onClick={async () => {
                              const url = await getCompanyDocumentUrl(doc.file_path);
                              window.open(url, '_blank');
                            }}
                          >👁️</button>
                      </div>
                      ))}
                      </div>
                    </div>
                  </div>
              ) : (
                // List of companies and add company button
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Company Profiles</h2>
                    <button className="add-company-btn" onClick={handleAddCompanyClick}>+ Add Company</button>
                </div>
                  {/* Base Company Card */}
                  <div className="company-card-group">
                    <div className="company-card base-company">
                      <div className="company-card-header">
                        <span className="company-icon" style={{color:'#ea3a70', marginRight:8}}>
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#ea3a70"/><rect x="7" y="7" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="11" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="15" width="6" height="2" rx="1" fill="#fff"/></svg>
                        </span>
                        <div>
                          <div className={`company-title ${!baseCompany?.company_name ? 'not-set' : ''}`}>
                            {baseCompany?.company_name || 'Not Set'}
                          </div>
                          <div className={`company-meta ${!(baseCompany?.base_location || baseCompany?.reg_number) ? 'not-set' : ''}`}>
                            {baseCompany?.base_location || 'Not Set'} • {baseCompany?.reg_number || 'Not Set'}
                          </div>
                        </div>
                      </div>
                      <div className="company-card-actions">
                        <button className="view-details-btn" onClick={() => setShowBaseCompanyDetails(true)}>👁️ View Details</button>
                        <button className="edit-btn">✏️ Edit</button>
                      </div>
                    </div>
                  </div>
                  {/* Target Companies */}
                  <div className="target-companies-section">
                    <h3 className="target-title">Target Companies</h3>
                    <div className="company-card-group">
                      {targetCompanies.length === 0 ? (
                        <div className="empty-shareholders">
                          <p>No target companies added yet</p>
                        </div>
                      ) : (
                        targetCompanies.map((company, idx) => (
                          <div className="company-card target-company" key={company.id || idx}>
                            <div className="company-card-header">
                              <span className="company-icon" style={{color:'#ffe066', marginRight:8}}>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffe066"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="#232448">🌐</text></svg>
                              </span>
                              <div>
                                <div className={`company-title ${!company.company_name ? 'not-set' : ''}`}>
                                  {company.company_name || 'Not Set'}
                                </div>
                                <div className={`company-meta ${!(company.base_location || company.reg_number) ? 'not-set' : ''}`}>
                                  {company.base_location || 'Not Set'} • {company.reg_number || 'Not Set'}
                                </div>
                              </div>
                            </div>
                            <div className="company-card-actions">
                              <button className="view-details-btn" onClick={() => navigate(`/target-company/${company.id}`)}>
                                👁️ View Details
                              </button>
                              <button className="edit-btn" /* onClick={() => {}} */>
                                ✏️ Edit
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
              {showAddCompany && (
                <div className="modal-overlay">
                  <div className="modal-content styled-modal">
                    <h3 className="modal-title">Add Target Company</h3>
                    <input className="modal-input" value={newCompany.company_name} onChange={e => setNewCompany({...newCompany, company_name: e.target.value})} placeholder="Company Name" />
                    <input className="modal-input" value={newCompany.reg_number} onChange={e => setNewCompany({...newCompany, reg_number: e.target.value})} placeholder="Registration Number" />
                    <input className="modal-input" value={newCompany.vat_number} onChange={e => setNewCompany({...newCompany, vat_number: e.target.value})} placeholder="VAT Number" />
                    <input className="modal-input" value={newCompany.incorporation_date} onChange={e => setNewCompany({...newCompany, incorporation_date: e.target.value})} placeholder="Incorporation Date" />
                    <input className="modal-input" value={newCompany.base_location} onChange={e => setNewCompany({...newCompany, base_location: e.target.value})} placeholder="Country" />
                    <input className="modal-input" value={newCompany.registered_address} onChange={e => setNewCompany({...newCompany, registered_address: e.target.value})} placeholder="Address" />
                    <div className="modal-actions">
                      <button className="modal-save-btn" onClick={handleSaveNewCompany}>Save</button>
                      <button className="modal-cancel-btn" onClick={() => setShowAddCompany(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

             

          {activeTab === 'verification' && (
            <div className="verification-container">
              <h2 className="verification-title">Verification Process</h2>
              
              <div className="verification-steps">
                {/* Document Collection Step */}
                <div className="verification-step pending">
                  <div className="step-icon">
                    <div className="icon-circle">
                      <Circle size={16} />
                    </div>
                  </div>
                  <div className="step-content">
                    <h3>Document Collection</h3>
                    <p className="step-description">Submit all required KYC documents</p>
                    <p className="step-date">Pending</p>
                  </div>
                </div>

                {/* Initial Review Step */}
                <div className="verification-step pending">
                  <div className="step-icon">
                    <div className="icon-circle">
                      <Circle size={16} />
                    </div>
                  </div>
                  <div className="step-content">
                    <h3>Initial Review</h3>
                    <p className="step-description">First review of submitted documents</p>
                    <p className="step-date">Pending</p>
                  </div>
                </div>

                {/* Enhanced Due Diligence Step */}
                <div className="verification-step pending">
                  <div className="step-icon">
                    <div className="icon-circle">
                      <Circle size={16} />
                    </div>
                  </div>
                  <div className="step-content">
                    <h3>Enhanced Due Diligence</h3>
                    <p className="step-description">Additional checks for high-risk cases</p>
                    <p className="step-date">Pending</p>
                  </div>
                </div>

                {/* Final Approval Step */}
                <div className="verification-step pending">
                  <div className="step-icon">
                    <div className="icon-circle">
                      <Circle size={16} />
                    </div>
                  </div>
                  <div className="step-content">
                    <h3>Final Approval</h3>
                    <p className="step-description">Final verification and approval</p>
                    <p className="step-date">Pending</p>
                  </div>
                </div>
              </div>

              <div className="verification-info">
                <div className="circle-button">
                <Info size={24} />  
                </div>   
                <div>
                  <h4>Verification in Progress</h4>
                  <p>Your documents are currently under review. This process typically takes 3-5 business days.</p>
                </div>
              </div>
            </div>
          )}
{activeTab === 'overview' && (
  <>
    <div className="kyc-welcome-card">
      <div className="kyc-welcome-header">
        <div className="kyc-welcome-title">Welcome to Your KYC Hub</div>
      </div>
      <div className="kyc-welcome-desc">
        Your Know Your Customer (KYC) Hub helps you manage identity verification for your companies and representatives in one place. Maintain compliance and streamline your business operations globally.
      </div>
      <div className="kyc-feature-cards">
        <div className="kyc-feature-card">
          <span className="kyc-feature-icon" role="img" aria-label="shield">🛡️</span>
          <div>
            <div className="kyc-feature-title">Simplified Compliance</div>
            <div className="kyc-feature-desc">
              Manage all your verification requirements in one dashboard, reducing complexity and saving time.
            </div>
          </div>
        </div>
        <div className="kyc-feature-card">
          <span className="kyc-feature-icon" role="img" aria-label="share">🔗</span>
          <div>
            <div className="kyc-feature-title">Share Securely</div>
            <div className="kyc-feature-desc">
              Share your verified KYC profile with banks and partners for faster onboarding and approvals.
            </div>
          </div>
        </div>
        <div className="kyc-feature-card">
          <span className="kyc-feature-icon" role="img" aria-label="global">🌐</span>
          <div>
            <div className="kyc-feature-title">Global Operations</div>
            <div className="kyc-feature-desc">
              Manage verification for multiple entities across different jurisdictions from one central location.
            </div>
          </div >
        </div>
      </div>
    </div>

    {/* Corporate Structure Section - dynamic */}
    <div className="kyc-section">
      <div className="kyc-section-header">
        <span>Corporate Structure</span>
        <button
  className="view-full-structure-btn"
  style={{
    background: 'none',
    border: '2px solid #ea3a70',
    color: '#ea3a70',
    borderRadius: '12px',
    padding: '8px 22px',
    fontSize: '1.1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    marginLeft: 16,
    marginBottom: 16
  }}
  onClick={() => setActiveTab('corporate-structure')}
>
View Full Structure
</button>
      </div>
      <div className="kyc-org-chart">
        <div className="kyc-org-root">
          <div className="kyc-org-root-node" style={{ border: '1.5px solid #ea3a70', color: '#ea3a70' }}>
            <span style={{ display: 'block', fontWeight: 600 }}>
              🏢 {baseCompany?.company_name || 'Base Company'}
            </span>
            <span style={{ 
              fontSize: '0.98rem', 
              color: baseCompany?.base_location ? '#b9b9d6' : '#94a3b8', 
              fontWeight: 400,
              fontStyle: baseCompany?.base_location ? 'normal' : 'italic'
            }}>
              {baseCompany?.base_location || 'Not Set'} (Base Company)
            </span>
          </div>
          <div className="kyc-org-children">
            {targetCompanies && targetCompanies.length > 0 ? (
              targetCompanies.map((tc, idx) => (
                <div className="kyc-org-child-node" style={{ border: '1.5px solid #ffe066', color: '#ffe066' }} key={tc.id || idx}>
                  <span style={{ display: 'block', fontWeight: 600 }}>
                    🌐 {tc.company_name || 'Not Set'}
                  </span>
                  <span className="kyc-org-node-desc" style={{ 
                    color: tc.base_location ? '#fffde4' : '#94a3b8',
                    fontStyle: tc.base_location ? 'normal' : 'italic'
                  }}>
                    {tc.base_location || 'Not Set'}
                  </span>
            </div>
              ))
            ) : (
            <div className="kyc-org-child-node" style={{ border: '1.5px solid #ffe066', color: '#ffe066' }}>
                <span style={{ display: 'block', fontWeight: 600 }}>
                  No Target Companies
                </span>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
)}
          {activeTab === 'corporate-structure' && (
            <CorporateStructure
              baseCompany={baseCompany}
              targetCompanies={targetCompanies}
              onViewDetails={company => {
                if (baseCompany && company.id === baseCompany.id) {
                  setShowBaseCompanyDetails(true);
                } else {
                  navigate(`/target-company/${company.id}`);
                }
              }}
            />
          )}
          
        </div>
      </div>

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-header">
              <h3>Confirm Upload</h3>
            </div>
            <div className="confirmation-content">
              <p>Are you sure you want to upload this file?</p>
              <div className="file-details1">
                <span className="doc-icon">📄</span>
                <span className="file-name">{fileToUpload?.name}</span>
                <span className="file-size">({formatFileSize(fileToUpload?.size)})</span>
              </div>
              <p className="doc-type">Document type: <strong>{getDocumentTitle(uploadType)}</strong></p>
              
              {isExtracting && (
                <div className="extracting-message">
                  <p>Extracting document information...</p>
                </div>
              )}
              
              {uploadType === 'passport' && extractedData && (
                <div className="bg-[#1a1b36] rounded-xl border border-[#2e2f50] p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-white">Passport Information</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      extractedData.verification_status === 'rejected' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-green-500/10 text-green-400'
                    }`}>
                      {extractedData.verification_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Full Name</label>
                      <span className="text-white text-lg font-semibold">{extractedData.surname}, {extractedData.given_names}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Passport Number</label>
                      <span className="text-white text-lg font-semibold">{extractedData.passport_number}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Date of Birth</label>
                      <span className="text-white text-lg font-semibold">{extractedData.date_of_birth}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Date of Expiry</label>
                      <span className="text-white text-lg font-semibold">{extractedData.date_of_expiry}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {uploadType === 'addressProof' && extractedData && (
                <div className="bg-[#1a1b36] rounded-xl border border-[#2e2f50] p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-white">Address Proof Information</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      extractedData.verification_status === 'rejected' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-green-500/10 text-green-400'
                    }`}>
                      {extractedData.verification_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Resident Name</label>
                      <span className="text-white text-lg font-semibold">{extractedData.resident_name}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Document Date</label>
                      <span className="text-white text-lg font-semibold">{extractedData.document_date}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors col-span-2">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Address</label>
                      <span className="text-white text-lg font-semibold">{extractedData.address}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Issuing Authority</label>
                      <span className="text-white text-lg font-semibold">{extractedData.issuing_authority}</span>
                    </div>
                  </div>
                </div>
              )}

              {uploadType === 'utilityBill' && extractedData && (
                <div className="bg-[#1a1b36] rounded-xl border border-[#2e2f50] p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-white">Utility Bill Information</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      extractedData.verification_status === 'rejected' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-green-500/10 text-green-400'
                    }`}>
                      {extractedData.verification_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Service Provider</label>
                      <span className="text-white text-lg font-semibold">{extractedData.service_provider}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Bill Date</label>
                      <span className="text-white text-lg font-semibold">{extractedData.bill_date}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Due Date</label>
                      <span className="text-white text-lg font-semibold">{extractedData.due_date}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Amount Due</label>
                      <span className="text-white text-lg font-semibold">${extractedData.total_amount_due}</span>
                    </div>
                  </div>
                </div>
              )}

              {uploadType === 'drivingLicense' && extractedData && (
                <div className="bg-[#1a1b36] rounded-xl border border-[#2e2f50] p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-white">Driving License Information</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      extractedData.verification_status === 'rejected' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-green-500/10 text-green-400'
                    }`}>
                      {extractedData.verification_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">License Number</label>
                      <span className="text-white text-lg font-semibold">{extractedData.license_number}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Date of Birth</label>
                      <span className="text-white text-lg font-semibold">{extractedData.date_of_birth}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Issue Date</label>
                      <span className="text-white text-lg font-semibold">{extractedData.date_of_issue}</span>
                    </div>
                    <div className="bg-[#232448] rounded-lg p-4 border border-[#2e2f50] hover:bg-[#2a2b54] transition-colors">
                      <label className="block text-gray-400 text-sm font-medium mb-1">Expiry Date</label>
                      <span className="text-white text-lg font-semibold">{extractedData.date_of_expiry}</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="confirmation-note">Note: This file will be submitted for verification and cannot be changed while under review.</p>
            </div>
            <div className="confirmation-actions">
              <button className="cancel-button" onClick={handleCancelUpload}>Cancel</button>
              <button 
                className="confirm-button" 
                onClick={() => {
                  handleUploadDocument(uploadType);
                  setShowConfirmation(false);
                }}
                disabled={isExtracting}
              >
                {isExtracting ? 'Extracting...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingCompany && (
        <div className="modal-overlay">
          <div className="modal-content styled-modal">
            <h3 className="modal-title">{baseCompany?.id ? 'Edit Base Company Details' : 'Set Up Base Company Details'}</h3>
            <input
              className="modal-input"
              value={editingCompany.company_name}
              onChange={e => setEditingCompany({ ...editingCompany, company_name: e.target.value })}
              placeholder="Company Name"
            />
            <input
              className="modal-input"
              value={editingCompany.reg_number}
              onChange={e => setEditingCompany({ ...editingCompany, reg_number: e.target.value })}
              placeholder="Registration Number"
            />
            <input
              className="modal-input"
              value={editingCompany.vat_number}
              onChange={e => setEditingCompany({ ...editingCompany, vat_number: e.target.value })}
              placeholder="VAT Number"
            />
            <input
              className="modal-input"
              value={editingCompany.incorporation_date}
              onChange={e => setEditingCompany({ ...editingCompany, incorporation_date: e.target.value })}
              placeholder="Incorporation Date"
            />
            <input
              className="modal-input"
              value={editingCompany.base_location}
              onChange={e => setEditingCompany({ ...editingCompany, base_location: e.target.value })}
              placeholder="Country"
            />
            <input
              className="modal-input"
              value={editingCompany.registered_address}
              onChange={e => setEditingCompany({ ...editingCompany, registered_address: e.target.value })}
              placeholder="Address"
            />
            <div className="modal-actions">
              <button className="modal-save-btn" onClick={handleSaveEditBaseCompany}>
                {baseCompany?.id ? 'Save Changes' : 'Create Company'}
              </button>
              <button className="modal-cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Director Modal */}
      {showAddDirectorModal && (
        <div className="modal-overlay">
          <div className="modal-content styled-modal">
            <h3 className="modal-title">Add Director</h3>
            <input
              className="modal-input"
              value={newBaseDirector.name}
              onChange={e => setNewBaseDirector({ ...newBaseDirector, name: e.target.value })}
              placeholder="Director Name *"
            />
            <input
              className="modal-input"
              value={newBaseDirector.email}
              onChange={e => setNewBaseDirector({ ...newBaseDirector, email: e.target.value })}
              placeholder="Email Address *"
            />
            <input
              className="modal-input"
              value={newBaseDirector.role}
              onChange={e => setNewBaseDirector({ ...newBaseDirector, role: e.target.value })}
              placeholder="Role"
            />
            <input
              className="modal-input"
              value={newBaseDirector.phone}
              onChange={e => setNewBaseDirector({ ...newBaseDirector, phone: e.target.value })}
              placeholder="Phone Number"
            />
            <input
              className="modal-input"
              value={newBaseDirector.appointedDate}
              onChange={e => setNewBaseDirector({ ...newBaseDirector, appointedDate: e.target.value })}
              placeholder="Appointed Date"
            />
            <div className="modal-actions">
              <button className="modal-save-btn" onClick={handleAddBaseDirector}>Add Director</button>
              <button className="modal-cancel-btn" onClick={() => setShowAddDirectorModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shareholder Modal */}
      {showAddShareholderModal && (
        <div className="modal-overlay">
          <div className="modal-content styled-modal">
            <h3 className="modal-title">Add Shareholder</h3>
            <input
              className="modal-input"
              value={newBaseShareholder.name}
              onChange={e => setNewBaseShareholder({ ...newBaseShareholder, name: e.target.value })}
              placeholder="Shareholder Name *"
            />
            <input
              className="modal-input"
              value={newBaseShareholder.percentage}
              onChange={e => setNewBaseShareholder({ ...newBaseShareholder, percentage: e.target.value })}
              placeholder="Ownership Percentage *"
            />
            <select
              className="modal-input"
              value={newBaseShareholder.type}
              onChange={e => setNewBaseShareholder({ ...newBaseShareholder, type: e.target.value })}
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
            </select>
            <input
              className="modal-input"
              value={newBaseShareholder.shares}
              onChange={e => setNewBaseShareholder({ ...newBaseShareholder, shares: e.target.value })}
              placeholder="Number of Shares"
            />
            <div className="modal-actions">
              <button className="modal-save-btn" onClick={handleAddBaseShareholder}>Add Shareholder</button>
              <button className="modal-cancel-btn" onClick={() => setShowAddShareholderModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEditTargetCompanyModal && editingTargetCompany && (
        <div className="modal-overlay">
          <div className="modal-content styled-modal">
            <h3 className="modal-title">Edit Target Company</h3>
            <input
              className="modal-input"
              value={editingTargetCompany.company_name}
              onChange={e => setEditingTargetCompany({ ...editingTargetCompany, company_name: e.target.value })}
              placeholder="Company Name"
            />
            <input
              className="modal-input"
              value={editingTargetCompany.reg_number}
              onChange={e => setEditingTargetCompany({ ...editingTargetCompany, reg_number: e.target.value })}
              placeholder="Registration Number"
            />
            <input
              className="modal-input"
              value={editingTargetCompany.vat_number}
              onChange={e => setEditingTargetCompany({ ...editingTargetCompany, vat_number: e.target.value })}
              placeholder="VAT Number"
            />
            <input
              className="modal-input"
              value={editingTargetCompany.incorporation_date}
              onChange={e => setEditingTargetCompany({ ...editingTargetCompany, incorporation_date: e.target.value })}
              placeholder="Incorporation Date"
            />
            <input
              className="modal-input"
              value={editingTargetCompany.base_location}
              onChange={e => setEditingTargetCompany({ ...editingTargetCompany, base_location: e.target.value })}
              placeholder="Country"
            />
            <input
              className="modal-input"
              value={editingTargetCompany.registered_address}
              onChange={e => setEditingTargetCompany({ ...editingTargetCompany, registered_address: e.target.value })}
              placeholder="Address"
            />
            <div className="modal-actions">
              <button className="modal-save-btn" onClick={handleSaveEditTargetCompany}>Save Changes</button>
              <button className="modal-cancel-btn" onClick={() => setShowEditTargetCompanyModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddTargetDirectorModal && (
        <div className="modal-overlay">
          <div className="modal-content styled-modal">
            <h3 className="modal-title">Add Target Director</h3>
            <input
              className="modal-input"
              value={newTargetDirector.name}
              onChange={e => setNewTargetDirector({ ...newTargetDirector, name: e.target.value })}
              placeholder="Director Name *"
            />
            <input
              className="modal-input"
              value={newTargetDirector.email}
              onChange={e => setNewTargetDirector({ ...newTargetDirector, email: e.target.value })}
              placeholder="Email Address *"
            />
            <input
              className="modal-input"
              value={newTargetDirector.role}
              onChange={e => setNewTargetDirector({ ...newTargetDirector, role: e.target.value })}
              placeholder="Role"
            />
            <input
              className="modal-input"
              value={newTargetDirector.phone}
              onChange={e => setNewTargetDirector({ ...newTargetDirector, phone: e.target.value })}
              placeholder="Phone Number"
            />
            <input
              className="modal-input"
              value={newTargetDirector.appointedDate}
              onChange={e => setNewTargetDirector({ ...newTargetDirector, appointedDate: e.target.value })}
              placeholder="Appointed Date"
            />
            <div className="modal-actions">
              <button className="modal-save-btn" onClick={handleAddTargetDirector}>Add Director</button>
              <button className="modal-cancel-btn" onClick={() => setShowAddTargetDirectorModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddTargetShareholderModal && (
        <div className="modal-overlay">
          <div className="modal-content styled-modal">
            <h3 className="modal-title">Add Target Shareholder</h3>
            <input
              className="modal-input"
              value={newTargetShareholder.name}
              onChange={e => setNewTargetShareholder({ ...newTargetShareholder, name: e.target.value })}
              placeholder="Shareholder Name *"
            />
            <input
              className="modal-input"
              value={newTargetShareholder.percentage}
              onChange={e => setNewTargetShareholder({ ...newTargetShareholder, percentage: e.target.value })}
              placeholder="Ownership Percentage *"
            />
            <select
              className="modal-input"
              value={newTargetShareholder.type}
              onChange={e => setNewTargetShareholder({ ...newTargetShareholder, type: e.target.value })}
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
            </select>
            <input
              className="modal-input"
              value={newTargetShareholder.shares}
              onChange={e => setNewTargetShareholder({ ...newTargetShareholder, shares: e.target.value })}
              placeholder="Number of Shares"
            />
            <div className="modal-actions">
              <button className="modal-save-btn" onClick={handleAddTargetShareholder}>Add Shareholder</button>
              <button className="modal-cancel-btn" onClick={() => setShowAddTargetShareholderModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'representatives' && (
        <div className="representatives-section">
          <div className="representatives-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>Representatives</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                className="search-input"
                style={{ background: '#232448', color: '#fff', border: '1px solid #2e2f50', borderRadius: 8, padding: '8px 16px', marginRight: 12 }}
                placeholder="Search representatives..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="representative-cards" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {getAllRepresentativesForSection()
              .filter(rep => {
                const matchesSearch = (rep.fullName || rep.name).toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
              })
              .map((rep, idx) => {
                // Get document statuses for this representative
                const repId = rep.email || rep.name;
                const docStatuses = allDocumentStatuses[repId] || {};
                const docList = [
                  { key: 'passport', label: 'Passport' },
                  { key: 'addressProof', label: 'Address Proof' }
                ];
                
                return (
                  <div key={idx} className="representative-card" style={{
                    background: '#18163a',
                    borderRadius: 16,
                    padding: 24,
                    minWidth: 320,
                    maxWidth: 340,
                    flex: 1,
                    boxShadow: '0 2px 8px 0 rgba(75,0,130,0.08)',
                    border: '1.5px solid #232448',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: 16 }}>{rep.fullName || rep.name}</div>
                        <div style={{ color: '#b9b9d6', fontSize: 13 }}>{rep.role || 'Director'}</div>
                        <div style={{ color: '#9CA3AF', fontSize: 12 }}>{rep.email}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ color: '#b9b9d6', fontSize: 13, marginBottom: 4 }}>Documents</div>
                      <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
                        {docList.map(doc => {
                          const status = (docStatuses[doc.key] || 'missing').toLowerCase();
                          let badgeColor, badgeText;
                          if (status === 'approved' || status === 'verified') {
                            badgeColor = '#4ade80'; badgeText = 'Verified';
                          } else if (status === 'pending') {
                            badgeColor = '#facc15'; badgeText = 'Pending';
                          } else if (status === 'rejected') {
                            badgeColor = '#f87171'; badgeText = 'Rejected';
                          } else {
                            badgeColor = '#64748b'; badgeText = 'Missing';
                          }
                          return (
                            <li key={doc.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ color: '#fff', fontSize: 14, flex: 1 }}>{doc.label}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  borderRadius: 10,
                                  padding: '2px 12px',
                                  background: badgeColor + '22',
                                  color: badgeColor
                                }}>{badgeText}</span>
                                {status !== 'missing' && (
                                  <button 
                                    onClick={() => {
                                      // Find the document data for this representative and document type
                                      const repId = rep.email || rep.name;
                                      const repDocuments = allDocumentUploads[repId] || {};
                                      const document = repDocuments[doc.key];
                                      if (document) {
                                        handleViewDetails(document);
                                      }
                                    }}
                                    style={{
                                      background: '#3B82F6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '2px 6px',
                                      fontSize: '10px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '2px'
                                    }}
                                  >
                                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Details
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={showDocumentUploadModal}
        onClose={() => setShowDocumentUploadModal(false)}
        selectedType="kyc"
        onDocumentUploaded={() => {
          // Refresh the documents when documents are uploaded
          fetchExistingDocuments();
          
          // If a representative is selected, update their documents
          if (selectedRepresentative) {
            const repId = selectedRepresentative.email || selectedRepresentative.name;
            const repDocuments = allDocumentUploads[repId] || {};
            const repStatuses = allDocumentStatuses[repId] || {};
            
            setDocumentUploads({
              passport: repDocuments.passport || null,
              addressProof: repDocuments.addressProof || null
            });
            
            setDocumentStatuses({
              passport: repStatuses.passport || 'Not Uploaded',
              addressProof: repStatuses.addressProof || 'Not Uploaded'
            });
          }
        }}
      />

      {/* Details Modal */}
      {detailsModalOpen && selectedDocumentData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1b36',
            border: '1px solid #2e2f50',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #2e2f50',
              paddingBottom: '16px'
            }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
                Document Details - {selectedDocumentData.file_name || selectedDocumentData.name}
              </h2>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#D1D5DB', marginBottom: '12px', fontSize: '16px' }}>Document Information</h3>
              <div style={{
                background: '#232448',
                border: '1px solid #2e2f50',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '12px' }}>File Name</label>
                    <div style={{ color: '#fff', fontSize: '14px' }}>{selectedDocumentData.file_name || selectedDocumentData.name}</div>
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '12px' }}>Document Type</label>
                    <div style={{ color: '#fff', fontSize: '14px' }}>{selectedDocumentData.doc_type || selectedDocumentData.type}</div>
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '12px' }}>Upload Date</label>
                    <div style={{ color: '#fff', fontSize: '14px' }}>
                      {new Date(selectedDocumentData.upload_date || selectedDocumentData.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '12px' }}>File Size</label>
                    <div style={{ color: '#fff', fontSize: '14px' }}>{formatFileSize(selectedDocumentData.file_size || selectedDocumentData.size)}</div>
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '12px' }}>Status</label>
                    <div style={{ color: '#fff', fontSize: '14px' }}>{selectedDocumentData.status}</div>
                  </div>
                  {selectedDocumentData.representative_id && (
                    <div>
                      <label style={{ color: '#9CA3AF', fontSize: '12px' }}>Representative</label>
                      <div style={{ color: '#fff', fontSize: '14px' }}>{selectedDocumentData.representative_id}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedDocumentData.extracted_data ? (
              <div>
                <h3 style={{ color: '#D1D5DB', marginBottom: '12px', fontSize: '16px' }}>Extracted Data</h3>
                <div style={{
                  background: '#232448',
                  border: '1px solid #2e2f50',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {renderExtractedData(selectedDocumentData.extracted_data, selectedDocumentData.doc_type)}
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ color: '#D1D5DB', marginBottom: '12px', fontSize: '16px' }}>Extracted Data</h3>
                <div style={{
                  background: '#232448',
                  border: '1px solid #2e2f50',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>
                    No extracted data available for this document.
                  </div>
                  <details style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    <summary style={{ cursor: 'pointer', color: '#6B7280' }}>Debug: Show document data structure</summary>
                    <pre style={{ 
                      background: '#1a1b36', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      marginTop: '8px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}>
                      {JSON.stringify(selectedDocumentData, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              borderTop: '1px solid #2e2f50',
              paddingTop: '16px'
            }}>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                style={{
                  background: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="profile-section">
          <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>Company Profiles</h2>
            <button 
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span>
              Add Company
            </button>
          </div>
          
          <div className="company-profiles-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Company Profile Card */}
            <div className="company-card" style={{
              background: '#18163a',
              borderRadius: 12,
              padding: 20,
              border: '2px solid #FF4D80',
              boxShadow: '0 2px 8px 0 rgba(75,0,130,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  background: '#FF4D80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>hoc.ai</div>
                  <div style={{ color: '#9CA3AF', fontSize: '14px' }}>hyd • 21</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleViewTargetCompanyDetails('hoc.ai')}
                  style={{
                    background: '#3B82F6',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={14} />
                  View Details
                </button>
                <button 
                  style={{
                    background: '#FF4D80',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileText size={14} />
                  Edit
                </button>
              </div>
            </div>

            {/* Target Companies Section */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', marginBottom: 16 }}>Target Companies</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Target Company Card 1 */}
                <div className="target-company-card" style={{
                  background: '#18163a',
                  borderRadius: 12,
                  padding: 20,
                  border: '2px solid #F59E0B',
                  boxShadow: '0 2px 8px 0 rgba(75,0,130,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#F59E0B'
                    }}></div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>houseofcompanies</div>
                      <div style={{ color: '#9CA3AF', fontSize: '14px' }}>hyderabad • 345</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleViewTargetCompanyDetails('houseofcompanies')}
                      style={{
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    <button 
                      style={{
                        background: '#FF4D80',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Target Company Card 2 */}
                <div className="target-company-card" style={{
                  background: '#18163a',
                  borderRadius: 12,
                  padding: 20,
                  border: '2px solid #F59E0B',
                  boxShadow: '0 2px 8px 0 rgba(75,0,130,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#F59E0B'
                    }}></div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>hocebranch.ai</div>
                      <div style={{ color: '#9CA3AF', fontSize: '14px' }}>netherland • 345</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleViewTargetCompanyDetails('hocebranch.ai')}
                      style={{
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    <button 
                      style={{
                        background: '#FF4D80',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Target Company Card 3 */}
                <div className="target-company-card" style={{
                  background: '#18163a',
                  borderRadius: 12,
                  padding: 20,
                  border: '2px solid #F59E0B',
                  boxShadow: '0 2px 8px 0 rgba(75,0,130,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#F59E0B'
                    }}></div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>house</div>
                      <div style={{ color: '#9CA3AF', fontSize: '14px' }}>hyderabad • 21bgj</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleViewTargetCompanyDetails('house')}
                      style={{
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    <button 
                      style={{
                        background: '#FF4D80',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Company Details Modal for Profile Tab */}
      {activeTab === 'profile' && showTargetCompanyDetails && selectedTargetCompany && (
        <div className="base-company-details-view" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0f0f23',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="base-company-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '16px'
            }}>
              <button 
                className="back-btn" 
                onClick={() => {
                  setShowTargetCompanyDetails(false);
                  setSelectedTargetCompany(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{fontSize:'1.4rem',display:'flex',alignItems:'center'}}>&larr;</span>
              </button>
              <span className="company-title" style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                {selectedTargetCompany.company_name || 'Untitled Company'}
              </span>
              <span className="base-company-badge" style={{
                background: '#F59E0B',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Target Company
              </span>
            </div>
            
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
              {/* Left: Company Details */}
              <div className="company-details-card" style={{
                background: '#18163a',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="section-title" style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    Company Details
                  </h3>
                  <button 
                    className="edit-btn" 
                    onClick={handleEditTargetCompany}
                    style={{
                      background: '#FF4D80',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>✏️</span>
                    <span>Edit Details</span>
                  </button>
                </div>
                <hr style={{ borderColor: '#fff', opacity: 0.2, margin: '12px 0 24px 0' }} />
                <div className="company-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div className="detail-label" style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                      Company Name
                    </div>
                    <div className="detail-value" style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {selectedTargetCompany.company_name || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label" style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                      Registration Number
                    </div>
                    <div className="detail-value" style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {selectedTargetCompany.reg_number || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label" style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                      Tax ID
                    </div>
                    <div className="detail-value" style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {selectedTargetCompany.vat_number || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label" style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                      Incorporation Date
                    </div>
                    <div className="detail-value" style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {selectedTargetCompany.incorporation_date || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label" style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                      Country
                    </div>
                    <div className="detail-value" style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {selectedTargetCompany.base_location || 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label" style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                      Address
                    </div>
                    <div className="detail-value" style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {selectedTargetCompany.registered_address || 'Not Set'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right: Directors and Shareholders */}
              <div className="side-cards" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Directors Card */}
                <div className="side-card" style={{
                  background: '#18163a',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="side-card-title" style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                    Directors
                  </div>
                  {selectedTargetCompany.directors && selectedTargetCompany.directors.length > 0 ? (
                    selectedTargetCompany.directors.map((d, i) => (
                      <div className="side-card-row" key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <span className="side-card-icon" style={{ fontSize: '16px' }}>👤</span>
                        <span className="side-card-name" style={{ color: '#fff', fontSize: '14px', flex: 1 }}>
                          {d.fullName || d.name}
                        </span>
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEditTargetDirector(i)}
                          style={{
                            background: 'transparent',
                            color: '#3B82F6',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                      No directors added yet
                    </div>
                  )}
                  <button 
                    className="add-director-btn" 
                    onClick={() => setShowAddTargetDirectorModal(true)}
                    style={{
                      background: '#10B981',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <span>+</span>
                    <span>Add Director</span>
                  </button>
                </div>
                
                {/* Shareholders Card */}
                <div className="side-card" style={{
                  background: '#18163a',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="side-card-title" style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                    Shareholders
                  </div>
                  {selectedTargetCompany.shareholders && selectedTargetCompany.shareholders.length > 0 ? (
                    selectedTargetCompany.shareholders.map((s, i) => (
                      <div className="side-card-row" key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <span className="side-card-icon" style={{ fontSize: '16px' }}>🧑‍💼</span>
                        <span className="side-card-name" style={{ color: '#fff', fontSize: '14px', flex: 1 }}>
                          {s.name}
                        </span>
                        <span className="side-card-meta" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                          {s.percentage || s.percent || '50%'} ownership
                        </span>
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEditTargetShareholder(i)}
                          style={{
                            background: 'transparent',
                            color: '#3B82F6',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                      No shareholders added yet
                    </div>
                  )}
                  <button 
                    className="add-shareholder-btn" 
                    onClick={() => setShowAddTargetShareholderModal(true)}
                    style={{
                      background: '#3B82F6',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <span>+</span>
                    <span>Add Shareholder</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add after the other utility functions like formatFileSize and getDocumentTitle
const validateAddressProof = (documentDateStr) => {
  try {
    // Parse the date string (format: "DD MM YYYY")
    const [day, month, year] = documentDateStr.split(' ').map(num => parseInt(num));
    const documentDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    // Calculate difference in months
    const monthsDiff = (currentDate.getFullYear() - documentDate.getFullYear()) * 12 + 
                      (currentDate.getMonth() - documentDate.getMonth());
    
    // Validate the date is not more than 6 months old
    const isValid = monthsDiff <= 6;
    
    return {
      isValid,
      status: isValid ? 'approved' : 'rejected',
      monthsDiff,
      message: isValid 
        ? 'Address proof document is valid' 
        : 'Document rejected - Address proof must be less than 6 months old',
      formattedDate: documentDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Date validation error:', error);
    return {
      isValid: false,
      status: 'rejected',
      monthsDiff: null,
      message: 'Document rejected - Invalid date format',
      formattedDate: null
    };
  }
};

// Add utility bill validation function
const validateUtilityBill = (billDateStr) => {
  try {
    // Parse the date string (format: "MM/DD/YYYY")
    const [month, day, year] = billDateStr.split('/').map(num => parseInt(num));
    const billDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    // Calculate difference in months
    const monthsDiff = (currentDate.getFullYear() - billDate.getFullYear()) * 12 + 
                      (currentDate.getMonth() - billDate.getMonth());
    
    // Validate the date is not more than 6 months old
    const isValid = monthsDiff <= 6;
    
    return {
      isValid,
      status: isValid ? 'approved' : 'rejected',
      monthsDiff,
      message: isValid 
        ? 'Utility bill is valid - within 6 months' 
        : 'Document rejected - Utility bill must be less than 6 months old',
      formattedDate: billDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Date validation error:', error);
    return {
      isValid: false,
      status: 'rejected',
      monthsDiff: null,
      message: 'Document rejected - Invalid date format',
      formattedDate: null
    };
  }
};

// Add driving license validation function
const validateDrivingLicense = (expiryDateStr) => {
  try {
    console.log('Validating driving license with expiry date:', expiryDateStr);
    
    // Handle both formats: "DD-MM-YY" and "DD MM YY"
    let day, month, year;
    if (expiryDateStr.includes('-')) {
      [day, month, year] = expiryDateStr.split('-').map(num => parseInt(num));
    } else {
      [day, month, year] = expiryDateStr.split(' ').map(num => parseInt(num));
    }

    // Convert 2-digit year to 4-digit year (assuming 20XX for years 00-99)
    const fullYear = year < 100 ? 2000 + year : year;
    const expiryDate = new Date(fullYear, month - 1, day);
    const currentDate = new Date();
    
    // Reset time part for accurate date comparison
    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    console.log('Parsed date components:', { day, month, fullYear });
    console.log('Parsed expiry date:', expiryDate.toISOString());
    console.log('Current date:', currentDate.toISOString());
    
    // Check if the license has expired
    const isValid = expiryDate > currentDate;
    
    console.log('Is license valid?', isValid);
    
    const validationResult = {
      isValid,
      status: isValid ? 'approved' : 'rejected',
      message: isValid 
        ? 'Document approved - valid driving license' 
        : 'Document rejected - driving license has expired',
      formattedDate: expiryDate.toISOString().split('T')[0]
    };
    
    console.log('Validation result:', validationResult);
    return validationResult;
  } catch (error) {
    console.error('Date validation error:', error);
    console.error('Invalid date string format:', expiryDateStr);
    return {
      isValid: false,
      status: 'rejected',
      message: 'Document rejected - invalid expiry date format',
      formattedDate: null
    };
  }
};

export default KYC;
