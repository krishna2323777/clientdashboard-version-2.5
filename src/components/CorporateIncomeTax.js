import React, { useState, useRef, useEffect } from 'react';
import { FaFileAlt, FaCheckCircle, FaFileSignature, FaArrowRight, FaEye, FaFileUpload, FaSpinner, FaFilePdf, FaDownload, FaTrash } from 'react-icons/fa';
import './CorporateIncomeTax.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf'; 
import { supabase } from './SupabaseClient';

const requiredDocuments = [
  {
    icon: '📊',
    title: 'Financial Statement',
    description: 'Profit & Loss, Balance Sheet for current year',
    color: '#3a4374',
    bgColor: '#2d3561'
  },
  {
    icon: '📈',
    title: 'Trial Balance',
    description: 'Detailed account balances',
    color: '#3a4374',
    bgColor: '#2d3561'
  },
  {
    icon: '📋',
    title: 'Balance Sheet',
    description: 'Assets, liabilities and equity statement',
    color: '#3a4374',
    bgColor: '#2d3561'
  },
  {
    icon: '$',
    title: 'Cashflow Statement',
    description: 'Cash inflows and outflows analysis',
    color: '#3a4374',
    bgColor: '#2d3561'
  },
  {
    icon: '💰',
    title: 'Profit and Loss Statement',
    description: 'Revenue, expenses and net income analysis',
    color: '#3a4374',
    bgColor: '#2d3561'
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
  const navigate = useNavigate();
  const fileInputRef = useRef();

  // Check for existing analysis on component mount
  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
      setUserEmail(session.user.email);
      
      // Check if user has existing analysis
      await checkExistingAnalysis(session.user.id);
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
        console.error('Error checking existing analysis:', error);
        // If table doesn't exist, create it
        if (error.code === '42P01') {
          await createCorporateTaxTable();
        }
      } else if (data && data.length > 0) {
        // User has existing analysis
        setExistingAnalysis(data[0]);
        setStep(4); // Go to existing analysis view
      }
    } catch (error) {
      console.error('Error in checkExistingAnalysis:', error);
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

      const reportData = formatReportData(analysisData);
      
      // Prepare data for database
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
        console.error('Error saving analysis:', error);
        throw error;
      }

      console.log('Analysis saved successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error in saveCorporateTaxAnalysis:', error);
      throw error;
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

  const handleFileUpload = (event) => {
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

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toLocaleString(),
      documentType: '' // Add document type field
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadSuccess(`${validFiles.length} file(s) uploaded successfully`);
    setUploadError('');
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDocumentTypeChange = (fileId, documentType) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, documentType }
          : file
      )
    );
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

  const processDocuments = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please upload at least one document before proceeding');
      return;
    }

    // Check if all files have document types selected
    const filesWithoutTypes = uploadedFiles.filter(file => !file.documentType);
    if (filesWithoutTypes.length > 0) {
      setUploadError(`Please select document types for all uploaded files. ${filesWithoutTypes.length} file(s) missing document type.`);
      return;
    }

    setIsProcessing(true);
    setUploadError('');
    setUploadSuccess('');

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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: step >= index ? '#3b82f6' : '#374151',
                color: '#fff',
                fontSize: '1.2rem',
                marginRight: index < steps.length - 1 ? '1rem' : '0'
              }}>
                {stepItem.icon}
            </div>
              {index < steps.length - 1 && (
                <div style={{
                  width: '100px',
                  height: '2px',
                  background: step > index ? '#3b82f6' : '#374151',
                  marginRight: '1rem'
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
              marginBottom: '2.5rem'
            }}>
              {requiredDocuments.map((doc, index) => (
                <div key={index} style={{
                  background: 'rgba(45, 53, 97, 0.4)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                  e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: doc.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {doc.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#fff', 
                      marginBottom: '0.5rem', 
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      {doc.title}
                    </h3>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0, 
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}>
                      {doc.description}
                    </p>
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
            
            {/* Upload Area */}
            <div style={{
              border: '2px dashed #3b82f6',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '2rem',
              background: '#1e293b'
            }}>
              <FaFileUpload style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} />
              <p style={{ color: '#bfc9da', marginBottom: '1rem', fontSize: '1.1rem' }}>
                Drag and drop your documents here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Choose Files
              </button>
              <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Supported formats: PDF, Excel (.xlsx, .xls)
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
                        <FaFilePdf style={{ color: '#dc2626', fontSize: '1.2rem' }} />
    <div>
                          <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>{file.name}</p>
                          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded: {file.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select
                          value={file.documentType}
                          onChange={(e) => handleDocumentTypeChange(file.id, e.target.value)}
                          style={{
                            background: '#374151',
                            color: '#fff',
                            border: '1px solid #4b5563',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            minWidth: '180px'
                          }}
                        >
                          <option value="">Select Document Type</option>
                          <option value="balance_sheet">Balance Sheet</option>
                          <option value="financial_statement">Financial Statement</option>
                          <option value="profit_loss">Profit and Loss</option>
                          <option value="cashflow_statement">Cash Flow Statement</option>
                          <option value="trial_balance">Trial Balance</option>
                        </select>
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
                            justifyContent: 'center'
                          }}
                          title="View File"
                        >
                          <FaEye />
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
                            justifyContent: 'center'
                          }}
                          title="Download File"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer'
                          }}
                          title="Remove File"
                        >
                          <FaTrash />
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
                {isProcessing ? 'Processing Documents...' : 'Proceed to Analysis'}
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