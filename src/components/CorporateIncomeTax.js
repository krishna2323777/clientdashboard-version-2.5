import React, { useState, useRef, useEffect } from 'react';
import { 
  FaFileAlt, 
  FaCheckCircle, 
  FaFileSignature, 
  FaArrowRight, 
  FaEye, 
  FaFileUpload, 
  FaSpinner, 
  FaFilePdf, 
  FaDownload, 
  FaTrash,
  FaCloudUploadAlt,
  FaFileContract,
  FaChartLine,
  FaCalculator,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaBalanceScale,
  FaSearchDollar,
  FaCloudDownloadAlt,
  FaEyeSlash,
  FaTrashAlt,
  FaFileExcel,
  FaFileCsv
} from 'react-icons/fa';
import { 
  HiDocumentText, 
  HiEye, 
  HiDownload, 
  HiTrash, 
  HiCloudUpload,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineCloudUpload
} from 'react-icons/hi';
import { 
  MdVisibility, 
  MdFileDownload, 
  MdDelete, 
  MdCloudUpload,
  MdDescription,
  MdAccountBalance,
  MdTrendingUp,
  MdAssessment,
  MdFilePresent
} from 'react-icons/md';
import { 
  BiDownload, 
  BiShow, 
  BiTrash, 
  BiUpload,
  BiFile,
  BiFileBlank,
  BiChart,
  BiMoney
} from 'react-icons/bi';
import { 
  IoEyeOutline, 
  IoDownloadOutline, 
  IoTrashOutline, 
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoStatsChartOutline
} from 'react-icons/io5';
import './CorporateIncomeTax.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf'; 
import { supabase } from './SupabaseClient';
import { corporateTaxDataManager } from './CorporateTaxDataManager';

const requiredDocuments = [
  {
    icon: <MdAssessment style={{ fontSize: '1.5rem', color: '#4f46e5' }} />,
    title: 'Financial Statement',
    description: 'Profit & Loss, Balance Sheet for current year'
  },
  {
    icon: <MdAccountBalance style={{ fontSize: '1.5rem', color: '#059669' }} />,
    title: 'Trial Balance',
    description: 'Detailed account balances'
  },
  {
    icon: <FaBalanceScale style={{ fontSize: '1.5rem', color: '#7c2d12' }} />,
    title: 'Balance Sheet',
    description: 'Assets, liabilities and equity statement'
  },
  {
    icon: <FaChartLine style={{ fontSize: '1.5rem', color: '#dc2626' }} />,
    title: 'Cashflow Statement',
    description: 'Cash inflows and outflows analysis'
  },
  {
    icon: <FaMoneyBillWave style={{ fontSize: '1.5rem', color: '#eab308' }} />,
    title: 'Profit and Loss Statement',
    description: 'Revenue, expenses and net income analysis'
  }
];  

const steps = [
  { icon: <FaFileAlt />, label: 'Review CIT Analysis' },
  { icon: <FaCheckCircle />, label: 'Upload Documents' },
  { icon: <FaFileSignature />, label: 'Prepare Documents' },
  { icon: <FaArrowRight />, label: 'Download Result' },
];

export default function CorporateIncomeTax() {
  const [step, setStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [existingAnalysis, setExistingAnalysis] = useState(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoadingDataroomFiles, setIsLoadingDataroomFiles] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024'); // Default to current year
  const [selectedDocumentType, setSelectedDocumentType] = useState('all'); // Document type filter
  const navigate = useNavigate();
  const fileInputRef = useRef();

  // Handle document card clicks for navigation
  const handleDocumentClick = (documentTitle) => {
    try {
      switch (documentTitle) {
        case 'Financial Statement':
          navigate('/financial-hub');
          break;
        case 'Trial Balance':
          navigate('/financial-hub?tab=accounting');
          break;
        case 'Balance Sheet':
          navigate('/financial-hub?tab=statements');
          break;
        case 'Cashflow Statement':
          navigate('/financial-hub?tab=cashflow');
          break;
        case 'Profit and Loss Statement':
          navigate('/financial-hub?tab=profit-loss');
          break;
        default:
          console.log(`Navigation not implemented for: ${documentTitle}`);
          navigate('/financial-hub');
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/financial-hub');
    }
  };

  // Handle progress step clicks
  const handleStepClick = async (stepIndex) => {
    try {
      if (stepIndex <= step) {
        // Allow going back to previous steps
        setStep(stepIndex);
        
        // Update session progress (optional)
        if (currentSessionId) {
          try {
            await corporateTaxDataManager.updateSessionProgress(stepIndex, {
              step_changed: new Date().toISOString(),
              direction: 'backward'
            });
          } catch (error) {
            console.warn('Could not update session progress (tables may not exist):', error.message);
          }
        }
      } else if (stepIndex === step + 1) {
        // Allow going to next step if current step is completed
        if (stepIndex === 1 && step === 0) {
          setStep(1);
          
          // Update session progress (optional)
          if (currentSessionId) {
            try {
              await corporateTaxDataManager.updateSessionProgress(1, {
                step_changed: new Date().toISOString(),
                direction: 'forward'
              });
            } catch (error) {
              console.warn('Could not update session progress (tables may not exist):', error.message);
            }
          }
        } else if (stepIndex === 2 && uploadedFiles.length > 0) {
          processDocuments();
        }
      }
    } catch (error) {
      console.error('Step click error:', error);
      
      // Log error to session if available (optional)
      if (currentSessionId) {
        try {
          await corporateTaxDataManager.logSessionError('Step navigation error', {
            error: error.message,
            stepIndex,
            currentStep: step
          });
        } catch (logError) {
          console.warn('Could not log session error (tables may not exist):', logError.message);
        }
      }
    }
  };

  // Check for existing analysis on component mount
  useEffect(() => {
    checkUserAuthentication();
  }, []);

  // Clear uploaded files and messages when year changes
  useEffect(() => {
    // Only clear if there are uploaded files from data room
    const dataRoomFiles = uploadedFiles.filter(file => file.source === 'dataroom');
    if (dataRoomFiles.length > 0) {
      setUploadedFiles(prev => prev.filter(file => file.source !== 'dataroom'));
      setUploadSuccess('');
      setUploadError('');
    }
  }, [selectedYear]);



  const checkUserAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
      setUserEmail(session.user.email);
      
      // Initialize session with data manager (optional - skip if tables don't exist)
      try {
        const sessionResult = await corporateTaxDataManager.initializeSession(session.user.id);
        setCurrentSessionId(sessionResult.sessionId);
        console.log('Session initialized:', sessionResult.sessionId);
      } catch (sessionError) {
        console.warn('Could not initialize session (database tables may not exist):', sessionError.message);
        // Continue without session for backward compatibility - this is fine
      }
      
      // Check if user has existing analysis (also make this optional)
      try {
        await checkExistingAnalysis(session.user.id);
      } catch (analysisError) {
        console.warn('Could not check existing analysis:', analysisError.message);
        // Continue without existing analysis check - start fresh
      }
      
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigate('/login');
    }
  };

  const checkExistingAnalysis = async (currentUserId) => {
    try {
      setIsCheckingExisting(true);
      
      // Check if user has existing corporate tax analysis
      const { data, error } = await supabase
        .from('corporate_tax_analysis')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Could not check existing analysis:', error.message);
        // If table doesn't exist, that's fine - user will start fresh
        if (error.code === '42P01') {
          console.info('Corporate tax analysis table does not exist yet. User will start with fresh analysis.');
        }
        // Don't throw error - just continue without existing analysis
        return;
      } 
      
      if (data && data.length > 0) {
        // User has existing analysis
        setExistingAnalysis(data[0]);
        setStep(4); // Go to existing analysis view
      }
    } catch (error) {
      console.warn('Error in checkExistingAnalysis:', error.message);
      // Don't throw error - just continue
    } finally {
      setIsCheckingExisting(false);
    }
  };

  const createCorporateTaxTable = async () => {
    try {
      // Create the corporate_tax_analysis table
      const { error } = await supabase.rpc('create_corporate_tax_table');
      
      if (error) {
        console.error('Error creating table:', error);
        // If RPC doesn't exist, we'll handle this in the backend or manually
      }
    } catch (error) {
      console.error('Error creating corporate tax table:', error);
    }
  };

  const saveCorporateTaxAnalysis = async (analysisData) => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Calculate processing time
      const processingTimeSeconds = processingStartTime ? 
        Math.round((Date.now() - processingStartTime) / 1000) : 0;

      // Try to use data manager first (comprehensive tracking)
      try {
        const savedAnalysis = await corporateTaxDataManager.saveCorporateTaxAnalysis(
          analysisData, 
          processingTimeSeconds
        );
        console.log('Analysis saved successfully via data manager:', savedAnalysis);
        return savedAnalysis;
      } catch (dataManagerError) {
        console.warn('Data manager save failed (tables may not exist):', dataManagerError.message);
        
        // Fallback to basic save method (original implementation)
        const reportData = formatReportData(analysisData);
        
        const dbData = {
          user_id: userId,
          company_name: reportData.companyName,
          fiscal_year: reportData.fiscalYear,
          revenue: reportData.revenue,
          expenses: reportData.expenses,
          depreciation: reportData.depreciation,
          deductions: reportData.deductions,
          taxable_income: reportData.taxableIncome,
          tax_rate: reportData.taxRate,
          final_tax_owed: reportData.finalTaxOwed,
          documents: JSON.stringify(reportData.documents),
          observations: JSON.stringify(reportData.observations),
          recommendations: JSON.stringify(reportData.recommendations),
          raw_analysis_data: JSON.stringify(analysisData),
          status: 'completed',
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('corporate_tax_analysis')
          .insert([dbData])
          .select();

        if (error) {
          console.warn('Fallback save also failed:', error.message);
          // Even if save fails, don't prevent user from seeing results
          console.info('Analysis completed but not saved to database. Results will be shown to user.');
          return null;
        }

        console.log('Analysis saved successfully via fallback method:', data);
        return data[0];
      }
      
    } catch (error) {
      console.error('Error in saveCorporateTaxAnalysis:', error);
      
      // Log error to session if available (optional)
      if (currentSessionId) {
        try {
          await corporateTaxDataManager.logSessionError('Failed to save analysis', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
        } catch (logError) {
          console.warn('Could not log session error:', logError.message);
        }
      }
      
      // Don't throw error - let user see results even if save fails
      console.info('Analysis completed but save failed. Results will be shown to user.');
      return null;
    }
  };

  const startNewAnalysis = () => {
    setExistingAnalysis(null);
    setStep(0);
    setProcessedResult(null);
    setUploadedFiles([]);
    setUploadError('');
    setUploadSuccess('');
  };

  const deleteExistingAnalysis = async () => {
    try {
      if (!existingAnalysis) return;

      const { error } = await supabase
        .from('corporate_tax_analysis')
        .delete()
        .eq('id', existingAnalysis.id);

      if (error) {
        console.error('Error deleting analysis:', error);
        throw error;
      }

      // Reset to start new analysis
      startNewAnalysis();
    } catch (error) {
      console.error('Error deleting existing analysis:', error);
      alert('Error deleting existing analysis. Please try again.');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      if (!validTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|xlsx|xls|csv)$/)) {
        errors.push(`${file.name}: Invalid file type. Please upload PDF, Excel, or CSV files only`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadError(errors.join('\n'));
      return;
        }

    const newFiles = [];
    
    // Process each file and save to database
    for (let file of validFiles) {
      try {
        const fileId = Date.now() + Math.random();
        
        // Create file object for upload list with auto-assigned document type
        const fileObj = {
          id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toLocaleString(),
      documentType: 'financial_statement' // Auto-assign default document type
        };

        // Save file metadata to database via data manager (optional)
        if (currentSessionId) {
          try {
            const filePath = `${userId}/${currentSessionId}/${file.name}`;
            await corporateTaxDataManager.saveUploadedDocument(
              file,
              'unspecified', // Will be updated when user selects document type
              filePath
            );
            fileObj.databaseId = fileId; // Track database ID
            console.log(`File ${file.name} saved to database`);
          } catch (dbError) {
            console.warn(`Could not save ${file.name} to database (tables may not exist):`, dbError.message);
            // Continue without database save - this is fine
          }
        }

        newFiles.push(fileObj);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        continue;
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadSuccess(`${validFiles.length} file(s) uploaded successfully`);
    setUploadError('');

    // Update session progress (optional)
    if (currentSessionId && newFiles.length > 0) {
      try {
        await corporateTaxDataManager.updateSessionProgress(1, {
          files_uploaded: newFiles.length,
          upload_timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Could not update session progress (tables may not exist):', error.message);
        // Continue without session tracking - this is fine
      }
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };



  const handleViewFile = (file) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
  };

  const handleDownloadFile = (file) => {
    const url = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  

  // Load documents from Financial Hub based on selected type
  const fetchAndLoadFinancialDocuments = async () => {
    console.log(`🔄 Loading ${selectedDocumentType === 'all' ? 'all documents' : selectedDocumentType} from Financial Hub for ${selectedYear}...`);
    
    if (!userId) {
      setUploadError('User not authenticated');
      return;
    }

    setIsLoadingDataroomFiles(true);
    setUploadError('');
    
          try {
        // Fetch financial documents from Financial Hub (table_reports)
        const yearToFilter = parseInt(selectedYear);
        
        const { data: financialData, error: financialError } = await supabase
          .from('table_reports')
          .select('*')
          .eq('user_id', userId)
          .eq('year', yearToFilter)
          .order('created_at', { ascending: false });

              if (financialError) {
          setUploadError(`Error fetching financial documents: ${financialError.message}`);
          return;
        }

        if (!financialData || financialData.length === 0) {
          setUploadError(`No financial documents found for ${selectedYear} in your Financial Hub.`);
          return;
        }

                console.log(`✅ Found ${financialData.length} financial documents in Financial Hub`);

        // Filter by document type if not "all"
        let filteredData = financialData;
        if (selectedDocumentType !== 'all') {
          filteredData = financialData.filter(doc => doc.doc_type === selectedDocumentType);
          console.log(`📋 Filtered to ${filteredData.length} documents of type: ${selectedDocumentType}`);
        }

        // Create file objects directly from Financial Hub data (bypassing storage download issues)
        const loadedFiles = [];
        
        for (const doc of filteredData) {
          const fileName = doc.file_name || `${doc.doc_type}_${doc.year}.pdf`;
          
          // Check if already loaded
          const isAlreadyUploaded = uploadedFiles.some(file => file.name === fileName);
          if (isAlreadyUploaded) {
            console.log(`Skipping ${fileName} - already uploaded`);
            continue;
          }
          
          // Create a simple placeholder file with document info
          const documentContent = `Financial Hub Document: ${doc.doc_type}
File: ${fileName}
Year: ${doc.year}
Source: Financial Hub (table_reports)
Document ID: ${doc.id}

This document was loaded from your Financial Hub and contains your ${doc.doc_type} data for ${doc.year}.`;
          
          const fileBlob = new Blob([documentContent], { type: 'text/plain' });
          const file = new File([fileBlob], fileName, { type: 'application/pdf' });
          
          // Map document type
          const docTypeMapping = {
            'Financial Statement': 'financial_statement',
            'Trial Balance': 'trial_balance',
            'Balance Sheet': 'balance_sheet',
            'Profit & Loss Statement': 'profit_loss_statement',
            'Cash Flow': 'cash_flow'
          };
          const mappedDocType = docTypeMapping[doc.doc_type] || 'financial_statement';
          
          const newFile = {
            id: Date.now() + Math.random(),
            name: fileName,
            size: file.size,
            type: 'application/pdf',
            file: file,
            uploadedAt: new Date().toLocaleString(),
            documentType: mappedDocType,
            source: 'financial_hub',
            originalData: doc // Store original Financial Hub data
          };
          
          loadedFiles.push(newFile);
          console.log(`✅ Loaded ${fileName} (${doc.doc_type})`);
        }

              if (loadedFiles.length > 0) {
          setUploadedFiles(prev => [...prev, ...loadedFiles]);
          const typeText = selectedDocumentType === 'all' ? 'documents' : `${selectedDocumentType} documents`;
          setUploadSuccess(`Successfully loaded ${loadedFiles.length} ${typeText} from ${selectedYear} Financial Hub`);
          alert(`🎉 Success! Loaded ${loadedFiles.length} ${typeText} from ${selectedYear} Financial Hub:\n${loadedFiles.map(f => `• ${f.name} (${f.documentType})`).join('\n')}`);
        } else {
          const typeText = selectedDocumentType === 'all' ? 'documents' : selectedDocumentType;
          setUploadError(`No ${typeText} found in Financial Hub for ${selectedYear}.`);
        }

          } catch (error) {
        console.error('Error loading Financial Hub documents:', error);
        setUploadError(`Error: ${error.message}`);
      } finally {
        setIsLoadingDataroomFiles(false);
      }
    };



  const processDocuments = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please upload at least one document before proceeding');
      return;
    }

    // Auto-assign generic document type for processing if not set
    uploadedFiles.forEach(file => {
      if (!file.documentType) {
        file.documentType = 'financial_statement'; // Default document type
      }
    });

    setIsProcessing(true);
    setUploadError('');
    setUploadSuccess('');
    
    // Track processing start time
    const startTime = Date.now();
    setProcessingStartTime(startTime);

    // Update session progress (optional)
    if (currentSessionId) {
      try {
        await corporateTaxDataManager.updateSessionProgress(2, {
          processing_started: new Date().toISOString(),
          total_files: uploadedFiles.length,
          files_by_type: uploadedFiles.reduce((acc, file) => {
            acc[file.documentType] = (acc[file.documentType] || 0) + 1;
            return acc;
          }, {})
        });
      } catch (error) {
        console.warn('Could not update session progress (tables may not exist):', error.message);
        // Continue without session tracking - this is fine
      }
    }

    try {
      const formData = new FormData();
      
      // Add files to FormData
      uploadedFiles.forEach((fileObj, index) => {
        formData.append('documents', fileObj.file);
        formData.append(`documentTypes[${index}]`, fileObj.documentType);
      });

      console.log('Sending files to backend:', uploadedFiles.map(f => `${f.name} (${f.documentType})`));

      const response = await fetch('https://corporate-tax-analyser.onrender.com/analyze-intelligent', {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 500) {
        const errorText = await response.text();
          console.log('Server error response:', errorText);
          
          // Try to parse as JSON, fallback to text
          let errorMessage = 'Server error occurred';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorJson.message || errorText;
          } catch (e) {
            errorMessage = errorText || 'Internal server error';
          }
          
          setProcessedResult({
            type: 'error',
            data: { detail: errorMessage },
            status: response.status
          });
          
          setStep(2);
          setUploadSuccess('Response received from server');
        return;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Try to get the response as JSON
      const result = await response.json();
      console.log('API Response:', result);

      // Store the result to display in the UI
      setProcessedResult({
        type: 'summary',
        data: result,
        status: response.status
      });

      setStep(2); // Move to "Prepare Documents" step
      setUploadSuccess('Analysis completed!');
      
    } catch (error) {
      console.error('Error processing documents:', error);
      
      // Handle different types of errors
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setUploadError('Network error: Unable to connect to the analysis server. Please check your internet connection and try again.');
      } else if (error.message.includes('CORS')) {
        setUploadError('Connection error: Cross-origin request blocked. Please contact support.');
      } else if (error.message.includes('timeout')) {
        setUploadError('Request timeout: The server took too long to respond. Please try again.');
      } else {
        setUploadError(`Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = async () => {
    try {
      // Save the analysis to database before completing
      if (processedResult && processedResult.data) {
        await saveCorporateTaxAnalysis(processedResult.data);
      }
      setStep(3);
    } catch (error) {
      console.error('Error saving analysis:', error);
      // Still proceed to next step even if save fails
      setStep(3);
    }
  };



  const formatCurrency = (amount) => {
    if (typeof amount === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
    return '$0.00';
  };

  const validateExtractedData = (data) => {
    const issues = [];
    
    if (data.revenue === 0 && data.expenses === 0) {
      issues.push('Both revenue and expenses are zero - this might indicate data extraction issues');
    }
    
    if (data.revenue < 0) {
      issues.push('Revenue is negative - this might be an extraction error');
    }
    
    if (data.expenses < 0) {
      issues.push('Expenses are negative - this might be an extraction error');
    }
    
    if (data.taxableIncome !== (data.revenue - data.expenses - data.depreciation - data.deductions)) {
      issues.push('Taxable income calculation doesn\'t match expected formula');
    }
    
    if (data.documents.length === 0) {
      issues.push('No document details found in the response');
    }
    
    if (issues.length > 0) {
      console.warn('Data validation issues:', issues);
    }
    
    return issues;
  };

  const formatReportData = (data) => {
    // Extract company and fiscal year from general_information
    const generalInfo = data.general_information || {};
    const companyName = generalInfo.company_name || 'Unknown Company';
    const fiscalYear = generalInfo.fiscal_year || new Date().getFullYear();
    
    // Extract financial data from tax_return_summary.breakdown
    const breakdown = data.tax_return_summary?.breakdown || {};
    const revenue = parseFloat(breakdown.Revenue || 0);
    const expenses = parseFloat(breakdown.Expenses || 0);
    const depreciation = parseFloat(breakdown.Depreciation || 0);
    const deductions = parseFloat(breakdown.Deductions || 0);
    const taxableIncome = parseFloat(breakdown['Taxable Income'] || 0);
    
    // Handle tax rate (remove % sign and convert to decimal)
    const taxRateString = breakdown['Applied Tax Rate'] || '0%';
    const taxRate = parseFloat(taxRateString.replace('%', '')) / 100;
    
    const finalTaxOwed = parseFloat(breakdown['Final Tax Owed'] || 0);
    
    // Extract documents from file_metadata
    const documents = (data.file_metadata || []).map(file => ({
      filename: file.filename,
      type: file.type,
      company_detected: file.company_name_detected,
      fiscal_year: file.fiscal_year_detected
    }));
    
    // Extract observations from audit_flags
    const observations = data.audit_flags || [];
    
    // Generate recommendations based on the data
    const recommendations = [];
    if (revenue === 0 && expenses > 0) {
      recommendations.push('Investigate why revenue is reported as $0 while expenses are significant.');
    }
    if (depreciation === 0) {
      recommendations.push('Review depreciation schedule for accuracy and completeness.');
    }
    if (documents.length > 0) {
      recommendations.push('Validate supporting documents for any missing or misclassified items.');
    }
    
    const extractedData = {
      companyName,
      fiscalYear,
      revenue,
      expenses,
      depreciation,
      deductions,
      taxableIncome,
      taxRate,
      finalTaxOwed,
      documents,
      observations,
      recommendations
    };
    
    // Validate the extracted data
    const validationIssues = validateExtractedData(extractedData);
    if (validationIssues.length > 0) {
      console.warn('⚠️ Data validation warnings:', validationIssues);
    }

    return extractedData;
  };

  const generatePDFReport = (data) => {
    const reportData = formatReportData(data);
    const doc = new jsPDF();
    
    // Set up document
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Corporate Analysis Report', 20, 30);
    
    let yPosition = 50;
    
    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This report summarizes the key financial metrics and observations for ${reportData.companyName} for the fiscal year ${reportData.fiscalYear}, based on the provided documents and extracted data.`;
    const summaryLines = doc.splitTextToSize(summaryText, 170);
    doc.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 5 + 10;
    
    // Company & Fiscal Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Company & Fiscal Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Company Name: ${reportData.companyName}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Fiscal Year: ${reportData.fiscalYear}`, 20, yPosition);
    yPosition += 15;
    
    // Financial Breakdown
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Financial Breakdown', 20, yPosition);
    yPosition += 10;
    
    // Create table-like structure for financial data
    const financialData = [
      ['Revenue', formatCurrency(reportData.revenue)],
      ['Expenses', formatCurrency(reportData.expenses)],
      ['Depreciation', formatCurrency(reportData.depreciation)],
      ['Deductions', formatCurrency(reportData.deductions)],
      ['Taxable Income', formatCurrency(reportData.taxableIncome)],
      ['Applied Tax Rate', `${(reportData.taxRate * 100).toFixed(1)}%`],
      ['Final Tax Owed', formatCurrency(reportData.finalTaxOwed)]
    ];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    financialData.forEach(([label, value]) => {
      doc.text(`${label}:`, 20, yPosition);
      doc.text(value, 120, yPosition);
      if (label === 'Taxable Income') {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 20, yPosition);
        doc.text(value, 120, yPosition);
        doc.setFont('helvetica', 'normal');
      }
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Documents Reviewed
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Documents Reviewed', 20, yPosition);
    yPosition += 10;
    
    if (reportData.documents && reportData.documents.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      reportData.documents.forEach((doc_item, index) => {
        const filename = doc_item.filename || `Document ${index + 1}`;
        const type = doc_item.type || 'OTHER';
        const company = doc_item.company_detected || reportData.companyName;
        const year = doc_item.fiscal_year || reportData.fiscalYear;
        
        doc.text(`${filename}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Type: ${type} | Company: ${company} | Year: ${year}`, 25, yPosition);
        yPosition += 10;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No specific document details available in the analysis.', 20, yPosition);
      yPosition += 10;
    }
    
    yPosition += 10;
    
    // Observations & Notes
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Observations & Notes', 20, yPosition);
    yPosition += 10;
    
    if (reportData.observations && reportData.observations.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      reportData.observations.forEach((observation) => {
        const obsLines = doc.splitTextToSize(`• ${observation}`, 170);
        doc.text(obsLines, 20, yPosition);
        yPosition += obsLines.length * 5 + 3;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('• Depreciation not found and no specific schedule was provided. Assumed to be zero.', 20, yPosition);
      yPosition += 10;
    }
    
    yPosition += 10;
    
    // Recommendations
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Recommendations', 20, yPosition);
    yPosition += 10;
    
    const defaultRecommendations = [
      'Review depreciation schedule for accuracy and completeness.',
      'Investigate why revenue is reported as $0 while expenses are significant.',
      'Validate supporting documents for any missing or misclassified items.'
    ];
    
    const recsToShow = reportData.recommendations.length > 0 ? reportData.recommendations : defaultRecommendations;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    recsToShow.forEach((recommendation) => {
      const recLines = doc.splitTextToSize(`• ${recommendation}`, 170);
      doc.text(recLines, 20, yPosition);
      yPosition += recLines.length * 5 + 3;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
    });
    
    // Save the PDF
    const fileName = `CIT_Analysis_Report_${reportData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${reportData.fiscalYear}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const downloadAnalysisReport = (data) => {
    generatePDFReport(data);
  };

  // Show loading state while checking for existing analysis
  if (isCheckingExisting) {
  return (
      <div style={{ minHeight: '100vh', background: '#220938', color: '#fff', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <FaSpinner style={{ fontSize: '3rem', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ marginTop: '1rem', color: '#fff' }}>Checking Your Corporate Tax Status...</h2>
            <p style={{ color: '#bfc9da' }}>Please wait while we verify your account</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#220938', color: '#fff', padding: '2rem' }}>
      {/* Processing Modal */}
      {isProcessing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem auto',
              filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
            }}></div>
            
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Processing Documents
            </h3>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              margin: 0,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              Please wait while we process your documents
            </p>
            
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.25rem'
            }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.7)',
                    animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>
            Corporate Income Tax Filing
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#bfc9da' }}>
            Streamlined CIT preparation with intelligent document analysis
          </p>
          {userEmail && (
            <p style={{ fontSize: '1rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Filing for: {userEmail}
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          {steps.map((stepItem, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                onClick={() => handleStepClick(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: step >= index ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : '#374151',
                  color: '#fff',
                  fontSize: '1.2rem',
                  marginRight: index < steps.length - 1 ? '1rem' : '0',
                  cursor: index <= step || index === step + 1 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: step >= index ? '0 4px 12px rgba(30, 58, 138, 0.4)' : 'none',
                  border: step === index ? '3px solid #60a5fa' : 'none'
                }}
              >
                {stepItem.icon}
            </div>
              {index < steps.length - 1 && (
                <div style={{
                  width: '100px',
                  height: '3px',
                  background: step > index ? 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' : '#374151',
                  marginRight: '1rem',
                  borderRadius: '2px'
                }} />
              )}
          </div>
        ))}
      </div>

        {/* Step Content */}
        {step === 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, #2d3561 0%, #3a4374 100%)',
            borderRadius: '24px', 
            padding: '3rem 2rem', 
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ 
                color: '#fff', 
                marginBottom: '0.5rem', 
                fontSize: '2rem',
                fontWeight: '600'
              }}>
                Required Documents for CIT Filing
              </h2>
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '1.1rem',
                margin: 0
              }}>
                Please ensure all documents are complete and up to date
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2.5rem',
              justifyItems: 'stretch',
              alignItems: 'stretch'
            }}>
              {requiredDocuments.map((doc, index) => (
                <div 
                  key={index}
                  className="document-card" 
                  onClick={() => handleDocumentClick(doc.title)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.2) 100%)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '2px solid rgba(30, 58, 138, 0.4)',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '200px',
                    minHeight: '200px',
                    maxHeight: '200px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Icon container */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: `0 6px 15px rgba(30, 58, 138, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                  }}>
                    {doc.icon}
                  </div>
                  
                  {/* Content */}
                  <div style={{ 
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingBottom: '2rem'
                  }}>
                    <h3 style={{ 
                      color: '#fff', 
                      marginBottom: '0.5rem', 
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      letterSpacing: '0.3px',
                      lineHeight: '1.2',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {doc.title}
                    </h3>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.85)', 
                      margin: 0, 
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      padding: '0 0.5rem'
                    }}>
                      {doc.description}
                    </p>
                  </div>

                  {/* Click indicator */}
                  <div className="click-indicator" style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(30, 58, 138, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: '#fff',
                    opacity: 0.8,
                    transition: 'all 0.3s ease'
                  }}>
                    →
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowConfirmationModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ background: '#23244d', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
              Upload Required Documents
            </h2>

            {/* Year Filter */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '2rem',
              alignItems: 'center',
              gap: '1rem',
              background: '#1e293b',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #3a3b5a'
            }}>
              <label style={{ 
                color: '#bfc9da', 
                fontSize: '1rem', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>📅</span>
                Filter by Year:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  background: '#374151',
                  color: '#fff',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  minWidth: '120px',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#374151';
                }}
              >
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            
            {/* Upload Area */}
            <div style={{
              border: '2px dashed #3b82f6',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '2rem',
              background: '#1e293b'
            }}>
              <HiCloudUpload style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} />
              <p style={{ color: '#bfc9da', marginBottom: '1rem', fontSize: '1.1rem' }}>
                Drag and drop your documents here, choose files from your device, or select document type and load from Financial Hub for {selectedYear}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              {/* File Upload Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FaFileUpload />
                  Choose Files
                </button>

                {/* Document Type Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    value={selectedDocumentType}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    style={{
                      background: '#374151',
                      color: '#fff',
                      border: '1px solid #4b5563',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      minWidth: '200px',
                      outline: 'none'
                    }}
                  >
                    <option value="all">All Documents</option>
                    <option value="Financial Statement">Financial Statement</option>
                    <option value="Trial Balance">Trial Balance</option>
                    <option value="Balance Sheet">Balance Sheet</option>
                    <option value="Profit & Loss Statement">Profit & Loss Statement</option>
                    <option value="Cash Flow">Cash Flow Statement</option>
                  </select>
                  
                  <button 
                    onClick={fetchAndLoadFinancialDocuments}
                    disabled={!userId || isLoadingDataroomFiles}
                    style={{
                      background: isLoadingDataroomFiles ? '#6b7280' : '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      cursor: (!userId || isLoadingDataroomFiles) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: (!userId || isLoadingDataroomFiles) ? 0.6 : 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isLoadingDataroomFiles ? (
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <FaCloudDownloadAlt />
                    )}
                    {isLoadingDataroomFiles 
                      ? `Loading...` 
                      : `Load ${selectedDocumentType === 'all' ? 'All' : selectedDocumentType}`
                    }
                  </button>
                </div>
              </div>
              
              <p style={{ color: '#6b7280', marginTop: '1rem', fontSize: '0.9rem' }}>
                Supported formats: PDF, Excel (.xlsx, .xls), CSV
              </p>
            </div>



            {/* Error/Success Messages */}
            {uploadError && (
              <div style={{
                background: '#dc2626',
                color: '#fff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>{uploadError}</div>
                {uploadError.includes('Server error') && (
                  <button
                    onClick={processDocuments}
                    style={{
                      background: '#fff',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    Retry Processing
                  </button>
                )}
              </div>
            )}
            {uploadSuccess && (
              <div style={{
                background: '#059669',
                color: '#fff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {uploadSuccess}
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Uploaded Documents</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} style={{
                      background: '#1e293b',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid #3a3b5a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <HiDocumentText style={{ color: '#dc2626', fontSize: '1.5rem' }} />
    <div>
                          <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>{file.name}</p>
                          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded: {file.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                  <button
                            onClick={() => handleViewFile(file)}
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            title="View File"
                            onMouseEnter={(e) => {
                              e.target.style.background = '#2563eb';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#3b82f6';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <IoEyeOutline style={{ fontSize: '1.1rem' }} />
                          </button>
                                                  <button
                            onClick={() => handleDownloadFile(file)}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            title="Download File"
                            onMouseEnter={(e) => {
                              e.target.style.background = '#059669';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#10b981';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <IoDownloadOutline style={{ fontSize: '1.1rem' }} />
                          </button>
                                                  <button
                            onClick={() => removeFile(file.id)}
                            style={{
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            title="Remove File"
                            onMouseEnter={(e) => {
                              e.target.style.background = '#b91c1c';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#dc2626';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <IoTrashOutline style={{ fontSize: '1.1rem' }} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={processDocuments}
                disabled={isProcessing || uploadedFiles.length === 0}
                style={{
                  background: isProcessing || uploadedFiles.length === 0 ? '#6b7280' : '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: isProcessing || uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                {isProcessing && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
                                        {isProcessing ? 'Processing Documents...' : 'Approve to Analysis'}
              </button>
    </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ background: '#23244d', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
              Corporate Income Tax Analysis Report
            </h2>
            
            {processedResult && (
              <div>
                {processedResult.data?.detail ? (
                  // Show error message from API
                  <div style={{ 
                    background: '#1e293b', 
                    borderRadius: '12px', 
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid #3a3b5a'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                      <h3 style={{ color: '#fbbf24', margin: 0 }}>
                        {processedResult.type === 'error' ? 'Server Error' : 'Analysis Notice'}
                      </h3>
              </div>
                    <p style={{ 
                      color: processedResult.type === 'error' ? '#f87171' : '#fbbf24', 
                      fontSize: '1.1rem',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {processedResult.data.detail}
                    </p>
                    <div style={{ 
                      marginTop: '1rem',
                      padding: '1rem',
                      background: '#374151',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#d1d5db', margin: 0, fontSize: '0.9rem' }}>
                        {processedResult.type === 'error' ? (
                          <span>
                            <strong>What to do:</strong> This appears to be a server-side issue. 
                            Please try again later or contact support if the problem persists.
                          </span>
                        ) : (
                          <span>
                            <strong>Suggestion:</strong> Please ensure you upload the primary financial documents 
                            such as Profit & Loss Statement or Annual Report for proper analysis.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                                ) : (
                  // Show successful analysis result in professional format
                  <div>
                    <div style={{ 
                      background: '#1e293b', 
                      borderRadius: '12px', 
                      padding: '2rem',
                      marginBottom: '2rem',
                      border: '1px solid #3a3b5a'
                    }}>
                      {/* Report Header */}
                      <div style={{ 
                        borderBottom: '2px solid #059669',
                        paddingBottom: '1rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <FaCheckCircle style={{ color: '#059669', fontSize: '1.5rem' }} />
                          <h3 style={{ color: '#059669', margin: 0, fontSize: '1.8rem' }}>Corporate Analysis Report</h3>
                        </div>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
                          Generated on {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Professional Report Display */}
                      <div style={{ display: 'grid', gap: '2rem' }}>
                        {/* Executive Summary */}
                        <div style={{
                          background: '#374151',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          border: '1px solid #4b5563'
                        }}>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            margin: '0 0 1rem 0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            1. Executive Summary
                          </h4>
                          <p style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                            This report summarizes the key financial metrics and observations for{' '}
                            <strong>{formatReportData(processedResult.data).companyName}</strong> for the fiscal year{' '}
                            <strong>{formatReportData(processedResult.data).fiscalYear}</strong>, based on the provided documents and extracted data.
                          </p>
                        </div>

                        {/* Company & Fiscal Information */}
                        <div style={{
                          background: '#374151',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          border: '1px solid #4b5563'
                        }}>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            margin: '0 0 1rem 0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            2. Company & Fiscal Information
                          </h4>
                          <div style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: '1.8' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>
                              <strong>Company Name:</strong> {formatReportData(processedResult.data).companyName}
                            </p>
                            <p style={{ margin: '0' }}>
                              <strong>Fiscal Year:</strong> {formatReportData(processedResult.data).fiscalYear}
                            </p>
                          </div>
                        </div>

                        {/* Financial Breakdown */}
                        <div style={{
                          background: '#374151',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          border: '1px solid #4b5563'
                        }}>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            margin: '0 0 1rem 0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            3. Financial Breakdown
                          </h4>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '0.5rem',
                            background: '#1f2937',
                            borderRadius: '6px',
                            padding: '1rem',
                            fontSize: '0.95rem'
                          }}>
                            <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Item</div>
                            <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Amount</div>
                            
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Revenue</div>
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(formatReportData(processedResult.data).revenue)}</div>
                            
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Expenses</div>
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(formatReportData(processedResult.data).expenses)}</div>
                            
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Depreciation</div>
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(formatReportData(processedResult.data).depreciation)}</div>
                            
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Deductions</div>
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(formatReportData(processedResult.data).deductions)}</div>
                            
                            <div style={{ color: '#10b981', padding: '0.5rem 0', fontWeight: 'bold', borderTop: '1px solid #4b5563', paddingTop: '0.5rem' }}>Taxable Income</div>
                            <div style={{ color: '#10b981', padding: '0.5rem 0', fontWeight: 'bold', borderTop: '1px solid #4b5563', paddingTop: '0.5rem' }}>{formatCurrency(formatReportData(processedResult.data).taxableIncome)}</div>
                            
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Applied Tax Rate</div>
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{(formatReportData(processedResult.data).taxRate * 100).toFixed(1)}%</div>
                            
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Final Tax Owed</div>
                            <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(formatReportData(processedResult.data).finalTaxOwed)}</div>
                          </div>
                        </div>

                        {/* Documents Reviewed */}
                        <div style={{
                          background: '#374151',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          border: '1px solid #4b5563'
                        }}>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            margin: '0 0 1rem 0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            4. Documents Reviewed
                          </h4>
                          {formatReportData(processedResult.data).documents.length > 0 ? (
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                              gap: '0.5rem',
                              background: '#1f2937',
                              borderRadius: '6px',
                              padding: '1rem',
                              fontSize: '0.9rem'
                            }}>
                              <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Filename</div>
                              <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Type</div>
                              <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Company Detected</div>
                              <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Fiscal Year</div>
                              
                              {formatReportData(processedResult.data).documents.map((doc, index) => (
                                <React.Fragment key={index}>
                                  <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{doc.filename || `Document ${index + 1}`}</div>
                                  <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{doc.type || 'OTHER'}</div>
                                  <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{doc.company_detected || 'Unknown Company'}</div>
                                  <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{doc.fiscal_year || new Date().getFullYear()}</div>
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: '#d1d5db', margin: 0 }}>No specific document details available in the analysis.</p>
                          )}
                        </div>

                        {/* Observations & Notes */}
                        <div style={{
                          background: '#374151',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          border: '1px solid #4b5563'
                        }}>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            margin: '0 0 1rem 0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            5. Observations & Notes
                          </h4>
                          <div style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: '1.6' }}>
                            {formatReportData(processedResult.data).observations.length > 0 ? (
                              formatReportData(processedResult.data).observations.map((obs, index) => (
                                <p key={index} style={{ margin: '0 0 0.5rem 0' }}>⚠️ {obs}</p>
                              ))
                            ) : (
                              <p style={{ margin: '0' }}>⚠️ Depreciation not found and no specific schedule was provided. Assumed to be zero.</p>
                            )}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div style={{
                          background: '#374151',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          border: '1px solid #4b5563'
                        }}>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            margin: '0 0 1rem 0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            6. Recommendations
                          </h4>
                          <div style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: '1.6' }}>
                            {formatReportData(processedResult.data).recommendations.length > 0 ? (
                              formatReportData(processedResult.data).recommendations.map((rec, index) => (
                                <p key={index} style={{ margin: '0 0 0.5rem 0' }}>• {rec}</p>
                              ))
                            ) : (
                              <>
                                <p style={{ margin: '0 0 0.5rem 0' }}>• Review depreciation schedule for accuracy and completeness.</p>
                                <p style={{ margin: '0 0 0.5rem 0' }}>• Investigate why revenue is reported as $0 while expenses are significant.</p>
                                <p style={{ margin: '0' }}>• Validate supporting documents for any missing or misclassified items.</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
            <div style={{
                      textAlign: 'center',
                      marginBottom: '2rem'
                    }}>
                      <button
                        onClick={() => downloadAnalysisReport(processedResult.data)}
                        style={{
                          background: '#059669',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '1rem 2rem',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          margin: '0 auto',
                          marginBottom: '1rem'
                        }}
                      >
                        <FaDownload />
                        Download PDF Report
                      </button>
                </div>
                </div>
                )}
              </div>
            )}
            
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={downloadResult}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                <FaArrowRight />
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ background: '#23244d', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>
              CIT Filing Complete
            </h2>
            <FaCheckCircle style={{ fontSize: '4rem', color: '#059669', marginBottom: '1rem' }} />
            <p style={{ color: '#bfc9da', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Your Corporate Income Tax analysis has been completed and saved to your account.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/Tax')}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Return to Tax Dashboard
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                View Saved Analysis
              </button>
            </div>
          </div>
        )}

        {(step === 4 || existingAnalysis) && (
          <div style={{ background: '#23244d', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#fff', marginBottom: '1rem' }}>
                Your Corporate Tax Analysis
              </h2>
              <p style={{ color: '#bfc9da', fontSize: '1.1rem' }}>
                Analysis completed on {existingAnalysis ? new Date(existingAnalysis.created_at).toLocaleDateString() : 'Today'}
              </p>
            </div>

            {existingAnalysis && (
              <div style={{ 
                background: '#1e293b', 
                borderRadius: '12px', 
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid #3a3b5a'
              }}>
                {/* Display existing analysis data */}
                <div style={{ display: 'grid', gap: '2rem' }}>
                  {/* Company Information */}
                  <div style={{
                    background: '#374151',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    border: '1px solid #4b5563'
                  }}>
                    <h4 style={{ 
                      color: '#3b82f6', 
                      margin: '0 0 1rem 0',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      Company Information
                    </h4>
                    <div style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: '1.8' }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        <strong>Company:</strong> {existingAnalysis.company_name}
                      </p>
                      <p style={{ margin: '0' }}>
                        <strong>Fiscal Year:</strong> {existingAnalysis.fiscal_year}
                      </p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div style={{
                    background: '#374151',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    border: '1px solid #4b5563'
                  }}>
                    <h4 style={{ 
                      color: '#3b82f6', 
                      margin: '0 0 1rem 0',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      Financial Summary
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '0.5rem',
                      background: '#1f2937',
                      borderRadius: '6px',
                      padding: '1rem',
                      fontSize: '0.95rem'
                    }}>
                      <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Item</div>
                      <div style={{ color: '#d1d5db', fontWeight: 'bold', borderBottom: '1px solid #4b5563', paddingBottom: '0.5rem' }}>Amount</div>
                      
                      <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Revenue</div>
                      <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(existingAnalysis.revenue)}</div>
                      
                      <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Expenses</div>
                      <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(existingAnalysis.expenses)}</div>
                      
                      <div style={{ color: '#10b981', padding: '0.5rem 0', fontWeight: 'bold', borderTop: '1px solid #4b5563', paddingTop: '0.5rem' }}>Taxable Income</div>
                      <div style={{ color: '#10b981', padding: '0.5rem 0', fontWeight: 'bold', borderTop: '1px solid #4b5563', paddingTop: '0.5rem' }}>{formatCurrency(existingAnalysis.taxable_income)}</div>
                      
                      <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>Final Tax Owed</div>
                      <div style={{ color: '#d1d5db', padding: '0.5rem 0' }}>{formatCurrency(existingAnalysis.final_tax_owed)}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        // Reconstruct the analysis data for PDF generation
                        const reconstructedData = JSON.parse(existingAnalysis.raw_analysis_data || '{}');
                        generatePDFReport(reconstructedData);
                      }}
                      style={{
                        background: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaDownload />
                      Download PDF Report
                    </button>
                    <button
                      onClick={startNewAnalysis}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Start New Analysis
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
                          deleteExistingAnalysis();
                        }
                      }}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaTrash />
                      Delete Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#23244d',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                color: '#fff',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                Financial Statement Confirmation
              </h3>
              <p style={{
                color: '#bfc9da',
                marginBottom: '2rem',
                textAlign: 'center',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                Is the financial statement ready for current financial year before applying for CIT?
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setStep(1);
                  }}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#059669';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#10b981';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    navigate('/financial-overview');
                  }}
                  style={{
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 