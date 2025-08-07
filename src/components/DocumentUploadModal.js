import React, { useState, useEffect } from "react";
import "./DocumentUploadModal.css";
import { supabase } from "./SupabaseClient";

// Add CSS for spinning animation
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS
const style = document.createElement('style');
style.textContent = spinAnimation;
document.head.appendChild(style);

const kycDocs = [
  {
    title: "Passport/ID Documents",
    required: true,
    description: "Valid passport or ID card for all directors and UBOs",
    formats: "PDF, JPG, PNG",
    key: "passport_id",
  },
  {
    title: "Proof of Address",
    required: true,
    description: "Recent utility bill or bank statement showing address",
    formats: "PDF, JPG, PNG",
    key: "address",
  },
  {
    title: "UBO Declaration",
    required: true,
    description: "Declaration of Ultimate Beneficial Owners",
    formats: "PDF, DOC",
    key: "ubo",
  },
  {
    title: "Company Structure Chart",
    required: false,
    description: "Organizational chart showing company structure",
    formats: "PDF, PNG, XLSX",
    key: "structure_chart",
  },
];

const financialCategories = [
  "Invoices",
  "Financial Statements",
  "Tax & Compliance",
  "Banking & Investment",
  "Accounts Payable & Receivable",
  "Company Valuation & Shareholding",
  "Debt & Loan Documentation",
  "Other Documents",
];

// Document validation functions
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
    
    // Check if the parsed date is valid
    if (isNaN(expiryDate.getTime())) {
      throw new Error('Invalid date format');
    }
    
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

export default function DocumentUploadModal({ open, onClose, selectedType, onDocumentUploaded }) {
  const [step, setStep] = useState(1);
  const [directors, setDirectors] = useState([]);
  const [loadingDirectors, setLoadingDirectors] = useState(false);
  const [selectedFinancialCategory, setSelectedFinancialCategory] = useState(null);
  const [localSelectedType, setLocalSelectedType] = useState(selectedType);
  const [selectedYear, setSelectedYear] = useState('');
  const years = ['2023', '2024', '2025'];
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [documentStatus, setDocumentStatus] = useState('not uploaded');
  const [statusMessage, setStatusMessage] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [kycFileUploads, setKycFileUploads] = useState({});
  const [processingFiles, setProcessingFiles] = useState({});
  const [existingDocuments, setExistingDocuments] = useState({});
  const [loadingExistingDocs, setLoadingExistingDocs] = useState(false);
  const [financialFileTypes, setFinancialFileTypes] = useState({});

  // New state for KYC upload flow
  const [selectedKycDocumentType, setSelectedKycDocumentType] = useState('');
  const [selectedKycFile, setSelectedKycFile] = useState(null);
  const [selectedKycRepresentative, setSelectedKycRepresentative] = useState('');

  // Add state for user flow
  const [userFlowType, setUserFlowType] = useState(null);

  useEffect(() => {
    setSelectedFinancialCategory(null); // Reset category on open/type change
  }, [open, selectedType]);

  useEffect(() => {
    const fetchDirectors = async () => {
      if (open && (selectedType === 'customKYC' || localSelectedType === 'kyc')) {
        setLoadingDirectors(true);
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.user) throw new Error('No user session');
          const userId = sessionData.session.user.id;
          
          console.log('Fetching directors for user:', userId);
          
          // Try to fetch from company_info first
          let { data: companyData, error } = await supabase
            .from('company_info')
            .select('directors')
            .eq('user_id', userId)
            .single();
          
          let directorsArr = [];
          
          if (error) {
            console.log('No company_info found, trying user_profiles...');
            // If company_info doesn't exist, try user_profiles
            const { data: userProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('directors')
              .eq('user_id', userId)
              .single();
            
            if (profileError) {
              console.log('No user_profiles found, trying target_companies...');
              // If user_profiles doesn't exist, try target_companies
              const { data: targetCompanies, error: targetError } = await supabase
                .from('target_companies')
                .select('directors')
                .eq('user_id', userId);
              
              if (targetError) {
                console.error('Error fetching from target_companies:', targetError);
                throw targetError;
              }
              
              console.log('Target companies data received:', targetCompanies);
              
              if (targetCompanies && targetCompanies.length > 0) {
                // Use the first company's directors
                const firstCompany = targetCompanies[0];
                if (firstCompany?.directors) {
                  directorsArr = typeof firstCompany.directors === 'string'
                    ? JSON.parse(firstCompany.directors)
                    : firstCompany.directors;
                }
              }
            } else {
              console.log('User profile data received:', userProfile);
              
              if (userProfile?.directors) {
                directorsArr = typeof userProfile.directors === 'string'
                  ? JSON.parse(userProfile.directors)
                  : userProfile.directors;
              }
            }
          } else {
            console.log('Company data received:', companyData);
            
            if (companyData?.directors) {
              directorsArr = typeof companyData.directors === 'string'
                ? JSON.parse(companyData.directors)
                : companyData.directors;
            }
          }
          
          console.log('Parsed directors:', directorsArr);
          setDirectors(directorsArr);
        } catch (err) {
          console.error('Error in fetchDirectors:', err);
          setDirectors([]);
        } finally {
          setLoadingDirectors(false);
        }
      }
    };
    fetchDirectors();
  }, [open, selectedType, localSelectedType]);

  // Fetch existing documents when modal opens
  useEffect(() => {
    if (open && selectedType === 'customKYC') {
      fetchExistingDocuments();
    }
  }, [open, selectedType]);

  // Fetch existing KYC documents
  const fetchExistingDocuments = async () => {
    if (!open || selectedType !== 'customKYC') return;
    
    setLoadingExistingDocs(true);
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

      // Organize documents by type
      const docsByType = {};
      if (documents) {
        documents.forEach(doc => {
          let docType = doc.doc_type;
          // Map database doc_type to UI doc_type
          if (doc.doc_type === 'address_proof') docType = 'addressProof';
          if (doc.doc_type === 'utility_bill') docType = 'utilityBill';
          if (doc.doc_type === 'driving_license') docType = 'drivingLicense';
          
          const key = doc.representative_id === 'general' ? docType : `${doc.representative_id}_${docType}`;
          docsByType[key] = {
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

      setExistingDocuments(docsByType);
    } catch (err) {
      console.error('Error fetching existing documents:', err);
      setExistingDocuments({});
    } finally {
      setLoadingExistingDocs(false);
    }
  };

  // Document extraction function
  const extractDocumentData = async (file, documentType) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType === 'addressProof' ? 'address_proof' : 
                                     documentType === 'utilityBill' ? 'utility_bill' :
                                     documentType === 'drivingLicense' ? 'driving_license' : documentType);

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

  // Handle KYC file selection with validation
  const handleKycFileSelection = async (e, documentType, director = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const processingKey = director ? `${director.email || director.name}_${documentType}` : documentType;
    
    // For Company Structure Chart and UBO Declaration, skip API call and validation
    if (documentType === 'structure_chart' || documentType === 'ubo') {
      setProcessingFiles(prev => ({ ...prev, [processingKey]: true }));
      
      // Simple file processing without API call
      const formattedData = {
        file_name: file.name,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        document_type: documentType
      };

      setDocumentStatus('pending');
      setStatusMessage('Document uploaded successfully');
      setExtractedData(formattedData);
      setFilesToUpload(prev => [...prev, file]);
      
      // Store file for specific director if provided
      if (director) {
        setKycFileUploads(prev => ({
          ...prev,
          [`${director.email || director.name}_${documentType}`]: {
            file,
            extractedData: formattedData,
            status: 'pending',
            message: 'Document uploaded successfully'
          }
        }));
      } else {
        setKycFileUploads(prev => ({
          ...prev,
          [documentType]: {
            file,
            extractedData: formattedData,
            status: 'pending',
            message: 'Document uploaded successfully'
          }
        }));
      }
      
      setProcessingFiles(prev => ({ ...prev, [processingKey]: false }));
      return;
    }
    
    try {
      // Set processing state for this specific file
      setProcessingFiles(prev => ({ ...prev, [processingKey]: true }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType === 'addressProof' ? 'address_proof' : 
                                     documentType === 'utilityBill' ? 'utility_bill' :
                                     documentType === 'drivingLicense' ? 'driving_license' : documentType);

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

      let validation = null;
      let formattedData = {};

      // For address proof
      if (documentType === 'addressProof') {
        if (!result.data.document_date) {
          throw new Error('No document date found in extracted data');
        }
        try {
          validation = validateAddressProof(result.data.document_date);
          
          formattedData = {
            address: result.data.address,
            document_date: result.data.document_date,
            issuing_authority: result.data.issuing_authority,
            resident_name: result.data.name,
            validation_status: validation.status,
            validation_message: validation.message,
            months_since_issue: validation.monthsDiff
          };
        } catch (error) {
          console.error('Address proof validation error:', error);
          formattedData = {
            ...result.data,
            verification_status: 'rejected',
            validation_message: 'Document rejected - validation error'
          };
        }
      }

      // For utility bill
      if (documentType === 'utilityBill') {
        if (!result.data.bill_date) {
          throw new Error('No bill date found in extracted data');
        }
        try {
          validation = validateUtilityBill(result.data.bill_date);
          
          formattedData = {
            ...result.data,
            verification_status: validation.status,
            validation_message: validation.message,
            months_since_issue: validation.monthsDiff
          };
        } catch (error) {
          console.error('Utility bill validation error:', error);
          formattedData = {
            ...result.data,
            verification_status: 'rejected',
            validation_message: 'Document rejected - validation error'
          };
        }
      }

      // For driving license
      if (documentType === 'drivingLicense') {
        console.log('Processing driving license document');
        console.log('Raw API data:', result.data);
        
        if (!result.data.date_of_expiry) {
          throw new Error('No expiry date found in extracted data');
        }
        
        try {
          validation = validateDrivingLicense(result.data.date_of_expiry);
          console.log('Validation result:', validation);
          
          formattedData = {
            ...result.data,
            verification_status: validation.status,
            validation_message: validation.message
          };
        } catch (error) {
          console.error('Driving license validation error:', error);
          formattedData = {
            ...result.data,
            verification_status: 'rejected',
            validation_message: 'Document rejected - validation error'
          };
        }
      }

      // For passport
      if (documentType === 'passport') {
        const expiryDateStr = result.data.date_of_expiry;
        let expiryDate;
        
        // Handle different date formats
        if (expiryDateStr && expiryDateStr.includes('-')) {
          const [day, month, year] = expiryDateStr.split('-');
          expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (expiryDateStr && expiryDateStr.includes('/')) {
          // Handle DD/MM/YYYY format
          const [day, month, year] = expiryDateStr.split('/');
          expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (expiryDateStr && expiryDateStr.includes(' ')) {
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
        
        let documentStatus;
        let statusMessage;
        
        if (!expiryDate || isNaN(expiryDate.getTime())) {
          documentStatus = 'rejected';
          statusMessage = 'Document rejected - invalid expiry date format';
        } else {
          // Only call setHours if expiryDate is valid
          expiryDate.setHours(0, 0, 0, 0);
          
          if (expiryDate <= currentDate) {
            documentStatus = 'rejected';
            statusMessage = 'Document rejected - passport expired';
          } else {
            documentStatus = 'approved';
            statusMessage = 'Document approved - valid passport';
          }
        }

        formattedData = {
          ...result.data,
          verification_status: documentStatus,
          validation_message: statusMessage
        };
      }

      setDocumentStatus(formattedData.verification_status || validation?.status || 'pending');
      setStatusMessage(formattedData.validation_message || validation?.message || 'Document processed');
      setExtractedData(formattedData);
      setFilesToUpload(prev => [...prev, file]);
      
      // Store file for specific director if provided
      if (director) {
        setKycFileUploads(prev => ({
          ...prev,
          [`${director.email || director.name}_${documentType}`]: {
            file,
            extractedData: formattedData,
            status: formattedData.verification_status || validation?.status || 'pending',
            message: formattedData.validation_message || validation?.message || 'Document processed'
          }
        }));
      } else {
        setKycFileUploads(prev => ({
          ...prev,
          [documentType]: {
            file,
            extractedData: formattedData,
            status: formattedData.verification_status || validation?.status || 'pending',
            message: formattedData.validation_message || validation?.message || 'Document processed'
          }
        }));
      }

    } catch (err) {
      console.error('Document processing error:', err);
      setUploadError(`Document processing failed: ${err.message}`);
    } finally {
      // Clear processing state for this file
      setProcessingFiles(prev => ({ ...prev, [processingKey]: false }));
    }
  };

  // New function to handle KYC file upload with new flow
  const handleKycFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedKycFile(file);
  };

  // New function to process KYC document with selected type and representative
  const processKycDocument = async () => {
    if (!selectedKycFile || !selectedKycDocumentType) return;
    
    const director = (selectedKycDocumentType === 'passport' || selectedKycDocumentType === 'addressProof') && selectedKycRepresentative 
      ? directors.find(d => (d.email || d.name) === selectedKycRepresentative)
      : null;
    
    // Create a synthetic event object
    const syntheticEvent = { target: { files: [selectedKycFile] } };
    
    // Use the correct processing key that matches the upload key
    const processingKey = director ? `${director.email || director.name}_${selectedKycDocumentType}` : selectedKycDocumentType;
    
    await handleKycFileSelection(syntheticEvent, selectedKycDocumentType, director);
  };

  // New function to handle KYC upload with new flow
  const handleKycUploadWithFlow = async () => {
    if (!selectedKycFile || !selectedKycDocumentType) {
      setUploadError('Please select a file and document type');
      return;
    }
    
    if ((selectedKycDocumentType === 'passport' || selectedKycDocumentType === 'addressProof') && !selectedKycRepresentative) {
      setUploadError(`Please select a representative for ${selectedKycDocumentType} document`);
      return;
    }
    
    const director = (selectedKycDocumentType === 'passport' || selectedKycDocumentType === 'addressProof') && selectedKycRepresentative 
      ? directors.find(d => (d.email || d.name) === selectedKycRepresentative)
      : null;
    
    const documentType = selectedKycDocumentType;
    const uploadKey = director ? `${director.email || director.name}_${documentType}` : documentType;
    const uploadData = kycFileUploads[uploadKey];
    
    if (!uploadData?.file) {
      setUploadError('No file processed for upload');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setSuccessMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('No user session found');
      const userId = sessionData.session.user.id;
      const representativeId = director ? (director.email || director.name) : 'general';

      const fileExt = uploadData.file.name.split('.').pop();
      const sanitizedFileName = sanitizeFileName(uploadData.file.name);
      const fileName = `${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${representativeId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, uploadData.file);
      
      if (uploadError) throw uploadError;

      // Save document data to kyc_documents table
      const documentData = {
        user_id: userId,
        representative_id: representativeId,
        doc_type: documentType === 'addressProof' ? 'address_proof' : 
                  documentType === 'utilityBill' ? 'utility_bill' :
                  documentType === 'drivingLicense' ? 'driving_license' : documentType,
        file_path: filePath,
        file_name: uploadData.file.name,
        file_size: uploadData.file.size,
        content_type: uploadData.file.type,
        status: uploadData.status,
        message: uploadData.message,
        extracted_data: uploadData.extractedData,
        upload_date: new Date().toISOString(),
        metadata: {
          uploaded_via: 'document_upload_modal',
          extraction_version: '1.0'
        }
      };

      const { error: dbError } = await supabase
        .from('kyc_documents')
        .upsert([documentData]);

      if (dbError) throw dbError;

      setSuccessMessage(`${documentType} uploaded successfully!`);
      
      // Clear the uploaded file and reset form
      setKycFileUploads(prev => {
        const newState = { ...prev };
        delete newState[uploadKey];
        return newState;
      });
      
      // Reset form
      setSelectedKycFile(null);
      setSelectedKycDocumentType('');
      setSelectedKycRepresentative('');

      // Notify parent component to refresh documents
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }

      // Refresh existing documents list
      fetchExistingDocuments();

    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Helper function to remove a file from selection
  const removeFile = (index) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  // Helper function to render existing document
  const renderExistingDocument = (docKey, documentType, director = null) => {
    const existingDoc = existingDocuments[docKey];
    if (!existingDoc) return null;

    return (
      <div style={{ 
        background: '#1a1b36', 
        border: '1px solid #2e2f50', 
        borderRadius: '8px', 
        padding: '12px', 
        marginBottom: '8px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📄</span>
            <span style={{ color: '#fff', fontWeight: '500' }}>{existingDoc.file_name}</span>
          </div>
          <div style={{ 
            background: existingDoc.status === 'approved' ? '#10B981' : 
                       existingDoc.status === 'rejected' ? '#EF4444' : '#3B82F6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {existingDoc.status}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>
          Size: {formatFileSize(existingDoc.file_size)} • Uploaded: {new Date(existingDoc.upload_date).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleViewExistingDocument(existingDoc)}
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            View
          </button>
          <button 
            onClick={() => {
              // Remove from existing documents and allow new upload
              setExistingDocuments(prev => {
                const newState = { ...prev };
                delete newState[docKey];
                return newState;
              });
            }}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Replace
          </button>
        </div>
      </div>
    );
  };

  // Handle viewing existing document
  const handleViewExistingDocument = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(doc.file_path, 3600); // 1 hour expiry
      
      if (error) throw error;
      
      // Open document in new tab
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Error viewing document:', err);
      alert('Error viewing document. Please try again.');
    }
  };

  // Handle KYC document upload
  const handleKycUpload = async (documentType, director = null) => {
    const uploadKey = director ? `${director.email || director.name}_${documentType}` : documentType;
    const uploadData = kycFileUploads[uploadKey];
    
    if (!uploadData?.file) {
      setUploadError('No file selected for upload');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setSuccessMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('No user session found');
      const userId = sessionData.session.user.id;
      const representativeId = director ? (director.email || director.name) : 'general';

      const fileExt = uploadData.file.name.split('.').pop();
      const sanitizedFileName = sanitizeFileName(uploadData.file.name);
      const fileName = `${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${representativeId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, uploadData.file);
      
      if (uploadError) throw uploadError;

      // Save document data to kyc_documents table
      const documentData = {
        user_id: userId,
        representative_id: representativeId,
        doc_type: documentType === 'addressProof' ? 'address_proof' : 
                  documentType === 'utilityBill' ? 'utility_bill' :
                  documentType === 'drivingLicense' ? 'driving_license' : documentType,
        file_path: filePath,
        file_name: uploadData.file.name,
        file_size: uploadData.file.size,
        content_type: uploadData.file.type,
        status: uploadData.status,
        message: uploadData.message,
        extracted_data: uploadData.extractedData,
        upload_date: new Date().toISOString(),
        metadata: {
          uploaded_via: 'document_upload_modal',
          extraction_version: '1.0'
        }
      };

      const { error: dbError } = await supabase
        .from('kyc_documents')
        .upsert([documentData]);

      if (dbError) throw dbError;

      setSuccessMessage(`${documentType} uploaded successfully!`);
      
      // Clear the uploaded file
      setKycFileUploads(prev => {
        const newState = { ...prev };
        delete newState[uploadKey];
        return newState;
      });

      // Notify parent component to refresh documents
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }

      // Refresh existing documents list
      fetchExistingDocuments();

    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to sanitize file names for storage
  const sanitizeFileName = (fileName) => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric characters (except dots and hyphens) with underscores
      .replace(/_{2,}/g, '_') // Replace multiple consecutive underscores with single underscore
      .replace(/^_+|_+$/g, ''); // Remove leading and trailing underscores
  };

  // --- Move the upload handler here so it can access state ---
  const handleFinancialUpload = async () => {
    if (!selectedYear || filesToUpload.length === 0) return;
    try {
      setUploading(true);
      setUploadError(null);
      setSuccessMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('No user session found');
      const userId = sessionData.session.user.id;

      let uploadedCount = 0;
      const totalFiles = filesToUpload.length;

      // Upload each file
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const documentType = financialFileTypes[i];
        
        if (!documentType) {
          console.warn(`Skipping file ${file.name} - no document type selected`);
          continue;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedFileName = sanitizeFileName(file.name);
        const fileName = `${timestamp}_${sanitizedFileName}`;
        const filePath = `${userId}/${selectedYear}/${documentType}/${fileName}`;

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('financial-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        // Insert document record into database
        const documentData = {
          user_id: userId,
          doc_type: documentType,
          category: documentType,
          year: selectedYear,
          file_path: filePath,
          file_name: sanitizedFileName,
          file_size: file.size,
          content_type: file.type
        };

        const { error: dbError } = await supabase
          .from('financial_documents')
          .insert(documentData);

        if (dbError) throw dbError;

        uploadedCount++;
      }

      setSuccessMessage(`${uploadedCount} of ${totalFiles} documents uploaded successfully!`);
      setFilesToUpload([]);
      setFinancialFileTypes({});
      setSelectedYear('');
      setStep(1);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // CurvedTimeline component for reference-style snake/curved user flow
  function CurvedTimeline({ steps, colors }) {
    // Layout constants
    const stepGap = 75; // more vertical space between steps
    const markerRadius = 9;
    const pathWidth = 320;
    const markerOffset = 60;
    const textBoxWidth = 105; // more compact text boxes
    const svgHeight = (steps.length - 1) * stepGap + 2 * markerRadius;
    const svgWidth = pathWidth;
    // Calculate marker positions and path
    const markerPositions = steps.map((_, idx) => {
      const isRight = idx % 2 === 1;
      return {
        cx: isRight ? svgWidth - markerOffset : markerOffset,
        cy: markerRadius + idx * stepGap,
        isRight,
      };
    });
    // Build the snake path
    let path = '';
    for (let i = 0; i < markerPositions.length - 1; i++) {
      const start = markerPositions[i];
      const end = markerPositions[i + 1];
      const curveY = start.cy + stepGap * 1.2;
      path += `M${start.cx},${start.cy} `;
      path += `C${start.cx},${curveY} ${end.cx},${curveY} ${end.cx},${end.cy} `;
    }
    const pathGradientId = 'timeline-gradient';
    return (
      <div style={{ position: 'relative', width: svgWidth, minHeight: svgHeight, margin: '32px auto 0 auto' }}>
        <svg width={svgWidth} height={svgHeight} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
          <defs>
            <linearGradient id={pathGradientId} x1="0" y1="0" x2={svgWidth} y2={svgHeight} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00BFFF" />
              <stop offset="40%" stopColor="#8B5CF6" />
              <stop offset="70%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke={`url(#${pathGradientId})`} strokeWidth="4" strokeDasharray="6 6" />
        </svg>
        {markerPositions.map((pos, idx) => (
          <svg key={idx} style={{ position: 'absolute', left: pos.cx - markerRadius, top: pos.cy - markerRadius, zIndex: 2, transition: 'transform 0.2s, filter 0.2s', cursor: 'pointer' }} width={markerRadius * 2} height={markerRadius * 2}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.18)'; e.currentTarget.style.filter = 'drop-shadow(0 0 8px ' + colors[idx % colors.length] + '55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
          >
            <g>
              <path d={`M${markerRadius},${markerRadius * 0.3} C${markerRadius * 1.6},${markerRadius * 0.3} ${markerRadius * 1.6},${markerRadius * 1.5} ${markerRadius},${markerRadius * 1.9} C${markerRadius * 0.4},${markerRadius * 1.5} ${markerRadius * 0.4},${markerRadius * 0.3} ${markerRadius},${markerRadius * 0.3} Z`} fill={colors[idx % colors.length]} stroke="#fff" strokeWidth="1.5" filter="url(#marker-shadow)" />
              <circle cx={markerRadius} cy={markerRadius * 0.95} r={markerRadius * 0.38} fill="#fff" />
            </g>
          </svg>
        ))}
        {steps.map((step, idx) => {
          const pos = markerPositions[idx];
          return (
            <div key={idx + '-text'} style={{
              position: 'absolute',
              top: pos.cy - markerRadius - (pos.isRight ? 0 : 18),
              left: pos.isRight ? pos.cx + markerRadius + 14 : pos.cx - markerRadius - textBoxWidth - 14,
              width: textBoxWidth,
              textAlign: pos.isRight ? 'left' : 'right',
              color: '#D1D5DB',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              zIndex: 3,
              fontWeight: 400,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: '1rem', marginBottom: 2, textShadow: '0 2px 8px #0008, 0 0 8px ' + colors[idx % colors.length] + '55' }}>Step {idx + 1}</div>
              <div>{step}</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (!open) return null;

  // Standard user flows
  const kycUserFlowSteps = [
    'Select and upload required KYC documents (Passport/ID, Proof of Address, UBO Declaration)',
    'Assign document to the correct representative (if needed)',
    'System validates and extracts data from documents',
    'Review extracted data and document status',
    'Submit for verification',
    'Await approval or feedback',
  ];
  const financialUserFlowSteps = [
    'Select year and upload financial documents (Invoices, Statements, etc.)',
    'Assign document type for each file',
    'System processes and stores documents securely',
    'Review uploaded documents and their status',
    'Use documents for reporting and analysis',
  ];
  const timelineColors = ["#00BFFF", "#8B5CF6", "#EF4444", "#22C55E"];

  // Always show header, stepper, and card selection
  return (
    <div className="doc-modal-overlay">
      <div className="doc-modal">
        <div className="doc-modal-header">
          <div className="doc-modal-title">Upload Documents</div>
          <button className="doc-modal-close" onClick={onClose}>×</button>
        </div>
        
        {/* Flow Steps at the Top */}
        {userFlowType && (
          <div style={{
            background: '#1a1b36',
            borderBottom: '1px solid #2e2f50',
            padding: '20px 24px',
            marginBottom: '24px'
          }}>
            <div style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#FF4D80',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {userFlowType === 'kyc' ? 'KYB Verification Flow' : 'Financial Documents Flow'}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {userFlowType === 'kyc' ? kycUserFlowSteps.slice(0, 4).map((step, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#232448',
                  border: '1px solid #2e2f50',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: '#D1D5DB',
                  minWidth: '120px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FF4D80',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem' }}>{step.split(' ').slice(0, 3).join(' ')}...</span>
                </div>
              )) : financialUserFlowSteps.slice(0, 4).map((step, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#232448',
                  border: '1px solid #2e2f50',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: '#D1D5DB',
                  minWidth: '120px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#3366FF',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem' }}>{step.split(' ').slice(0, 3).join(' ')}...</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="doc-modal-content">
          {/* Card selection */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="doc-modal-question">
              What are you uploading documents for?
            </div>
            <div className="doc-modal-cards-row">
              <div
                className={`doc-modal-card ${localSelectedType === 'kyc' ? 'selected' : ''}`}
                onClick={() => { setLocalSelectedType('kyc'); setStep(1); setUserFlowType('kyc'); }}
              >
                <div className="doc-modal-card-title">KYB Verification</div>
                <div className="doc-modal-card-desc">Documents for Know Your Customer verification</div>
              </div>
              <div
                className={`doc-modal-card ${localSelectedType === 'financial' ? 'selected' : ''}`}
                onClick={() => { setLocalSelectedType('financial'); setStep(1); setUserFlowType('financial'); }}
              >
                <div className="doc-modal-card-title">Financial Documents</div>
                <div className="doc-modal-card-desc">Documents for financial reporting and analysis</div>
              </div>
            </div>
          </div>
          {/* Content below cards (upload forms, etc.) remains unchanged */}

          {localSelectedType === 'kyc' && step === 1 && (
            <div className="doc-modal-req-list">
              <div className="doc-modal-req-title">Upload KYC Documents</div>
              
              {/* New KYC Upload Flow */}
              <div style={{ 
                background: '#1a1b36', 
                border: '1px solid #2e2f50', 
                borderRadius: '8px', 
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 16, color: '#fff' }}>
                  Upload New KYC Document
                </div>
                
                {/* Step 1: File Upload */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8, color: '#D1D5DB' }}>
                    1. Select File:
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png,.doc" 
                      onChange={handleKycFileUpload}
                      style={{ marginBottom: 8 }}
                    />
                  </div>
                  {selectedKycFile && (
                    <div style={{ 
                      background: '#232448', 
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#D1D5DB'
                    }}>
                      Selected: {selectedKycFile.name} ({formatFileSize(selectedKycFile.size)})
                    </div>
                  )}
                </div>

                {/* Step 2: Document Type Selection */}
                {selectedKycFile && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#D1D5DB' }}>
                      2. Select Document Type:
                    </div>
                    <select
                      value={selectedKycDocumentType}
                      onChange={(e) => {
                        setSelectedKycDocumentType(e.target.value);
                        setSelectedKycRepresentative(''); // Reset representative when type changes
                      }}
                      style={{
                        background: '#232448',
                        color: '#fff',
                        border: '1px solid #2e2f50',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        width: '100%'
                      }}
                    >
                      <option value="">Select document type...</option>
                      <option value="passport">Passport/ID Documents</option>
                      <option value="addressProof">Proof of Address</option>
                      <option value="utilityBill">Utility Bill</option>
                      <option value="drivingLicense">Driving License</option>
                      <option value="ubo">UBO Declaration</option>
                      <option value="structure_chart">Company Structure Chart</option>
                    </select>
                  </div>
                )}

                {/* Step 3: Representative Selection (for passport and address proof) */}
                {selectedKycFile && (selectedKycDocumentType === 'passport' || selectedKycDocumentType === 'addressProof') && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#D1D5DB' }}>
                      3. Select Representative:
                    </div>
                    {loadingDirectors ? (
                      <div style={{ color: '#F59E0B' }}>Loading directors...</div>
                    ) : directors.length === 0 ? (
                      <div style={{ color: '#EF4444' }}>
                        No directors found. 
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#9CA3AF' }}>
                          Please add directors in your company profile first.
                        </div>
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedKycRepresentative}
                          onChange={(e) => setSelectedKycRepresentative(e.target.value)}
                          style={{
                            background: '#232448',
                            color: '#fff',
                            border: '1px solid #2e2f50',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            width: '100%'
                          }}
                        >
                          <option value="">Select representative...</option>
                          {directors.map((director, idx) => (
                            <option key={idx} value={director.email || director.name}>
                              {director.name} ({director.email})
                            </option>
                          ))}
                        </select>
                        
                        {/* Debug info */}
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#9CA3AF', 
                          marginTop: '4px',
                          background: '#232448',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          Found {directors.length} director(s)
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 4: Process and Upload */}
                {selectedKycFile && selectedKycDocumentType && 
                 ((selectedKycDocumentType !== 'passport' && selectedKycDocumentType !== 'addressProof') || selectedKycRepresentative) && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#D1D5DB' }}>
                      4. Process and Upload:
                    </div>
                    {(() => {
                      const director = (selectedKycDocumentType === 'passport' || selectedKycDocumentType === 'addressProof') && selectedKycRepresentative 
                        ? directors.find(d => (d.email || d.name) === selectedKycRepresentative)
                        : null;
                      const processingKey = director ? `${director.email || director.name}_${selectedKycDocumentType}` : selectedKycDocumentType;
                      const uploadKey = processingKey;
                      const isProcessing = processingFiles[processingKey];
                      const uploadData = kycFileUploads[uploadKey];
                      
                      return (
                        <>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="doc-modal-continue"
                              onClick={processKycDocument}
                              disabled={isProcessing}
                              style={{ flex: 1 }}
                            >
                              {isProcessing ? 'Processing...' : 'Process Document'}
                            </button>
                            {uploadData && !isProcessing && (
                              <button 
                                className="doc-modal-continue"
                                onClick={handleKycUploadWithFlow}
                                disabled={uploading}
                                style={{ flex: 1 }}
                              >
                                {uploading ? 'Uploading...' : 'Upload Document'}
                              </button>
                            )}
                          </div>

                          {/* Show processing status */}
                          {isProcessing && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              color: '#F59E0B',
                              fontSize: '14px',
                              marginTop: '8px'
                            }}>
                              <div className="animate-spin" style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #F59E0B',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></div>
                              Processing document...
                            </div>
                          )}
                          
                          {/* Show upload status */}
                          {uploadData && !isProcessing && (
                            <div style={{ 
                              background: uploadData.status === 'approved' ? '#10B981' : 
                                         uploadData.status === 'rejected' ? '#EF4444' : '#3B82F6',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              marginTop: '8px'
                            }}>
                              Status: {uploadData.status}
                              {uploadData.message && (
                                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                  {uploadData.message}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Existing Documents Section */}

            </div>
          )}
          {localSelectedType === 'financial' && step === 1 && (
            <>
              <div className="doc-modal-req-list">
                <div className="doc-modal-req-title">Upload Financial Documents</div>
                
                {/* Year Selection */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                    Select Year:
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    {years.map((year) => (
                      <button
                        key={year}
                        className={`doc-modal-continue${selectedYear === year ? ' selected' : ''}`}
                        style={{ 
                          minWidth: 80, 
                          background: selectedYear === year ? '#FF4D80' : undefined,
                          border: selectedYear === year ? 'none' : '1px solid #2e2f50'
                        }}
                        onClick={() => setSelectedYear(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Section */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                    Select Files and Document Types:
                  </div>
                  <div className="doc-file-upload-row">
                    <input
                      type="file"
                      multiple
                      onChange={e => {
                        const newFiles = Array.from(e.target.files);
                        setFilesToUpload(newFiles);
                        // Initialize document types for new files
                        const newFileTypes = {};
                        newFiles.forEach((file, index) => {
                          newFileTypes[index] = '';
                        });
                        setFinancialFileTypes(prev => ({ ...prev, ...newFileTypes }));
                      }}
                      style={{ marginBottom: 16 }}
                    />
                  </div>
                  {filesToUpload.length > 0 && (
                    <div style={{ 
                      background: '#1a1b36', 
                      border: '1px solid #2e2f50', 
                      borderRadius: '8px', 
                      padding: '12px',
                      marginTop: '12px'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                        Selected Files ({filesToUpload.length}):
                      </div>
                      {filesToUpload.map((file, index) => (
                        <div key={index} style={{ 
                          padding: '12px 0',
                          borderBottom: index < filesToUpload.length - 1 ? '1px solid #2e2f50' : 'none'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>📄</span>
                              <span style={{ color: '#fff', fontSize: '14px' }}>{file.name}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                              {formatFileSize(file.size)}
                            </div>
                            <button 
                              onClick={() => {
                                removeFile(index);
                                setFinancialFileTypes(prev => {
                                  const newTypes = { ...prev };
                                  delete newTypes[index];
                                  return newTypes;
                                });
                              }}
                              style={{
                                background: '#EF4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                marginLeft: '10px'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <label style={{ 
                              color: '#D1D5DB', 
                              fontSize: '12px', 
                              marginBottom: '4px',
                              display: 'block'
                            }}>
                              Document Type:
                            </label>
                            <select
                              value={financialFileTypes[index] || ''}
                              onChange={(e) => setFinancialFileTypes(prev => ({
                                ...prev,
                                [index]: e.target.value
                              }))}
                              style={{
                                background: '#232448',
                                color: '#fff',
                                border: '1px solid #2e2f50',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                fontSize: '12px',
                                width: '100%'
                              }}
                            >
                              <option value="">Select document type...</option>
                              {financialCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Summary */}
                {filesToUpload.length > 0 && selectedYear && (
                  <div style={{ 
                    background: '#1a1b36', 
                    border: '1px solid #2e2f50', 
                    borderRadius: '8px', 
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                      Upload Summary:
                    </div>
                    <div style={{ color: '#D1D5DB', marginBottom: '4px' }}>
                      • Year: {selectedYear}
                    </div>
                    <div style={{ color: '#D1D5DB', marginBottom: '4px' }}>
                      • Files: {filesToUpload.length} document(s)
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, color: '#fff', fontSize: '14px' }}>
                        File Details:
                      </div>
                      {filesToUpload.map((file, index) => (
                        <div key={index} style={{ 
                          padding: '8px 0',
                          borderBottom: index < filesToUpload.length - 1 ? '1px solid #2e2f50' : 'none'
                        }}>
                          <div style={{ color: '#D1D5DB', fontSize: '12px' }}>
                            • {file.name} → {financialFileTypes[index] || 'No type selected'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button 
                  className="doc-modal-continue" 
                  onClick={handleFinancialUpload}
                  disabled={
                    filesToUpload.length === 0 || 
                    !selectedYear || 
                    Object.values(financialFileTypes).some(type => !type) ||
                    uploading
                  }
                >
                  {uploading ? 'Uploading...' : `Upload ${filesToUpload.length} File${filesToUpload.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          )}
          
          
          {/* Success and Error Messages */}
          {successMessage && (
            <div style={{
              background: '#10B981',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '16px',
              fontSize: '14px'
            }}>
              {successMessage}
            </div>
          )}
          {uploadError && (
            <div style={{
              background: '#EF4444',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '16px',
              fontSize: '14px'
            }}>
              {uploadError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}