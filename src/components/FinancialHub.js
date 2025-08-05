import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  FaChartLine, 
  FaFileInvoice, 
  FaCalculator, 
  FaFileAlt, 
  FaStar, 
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrophy,
  FaSearch,
  FaFilter,
  FaBook,
  FaCreditCard,
  FaMoneyBillWave,
  FaReceipt,
  FaBan,
  FaArrowRight,
  FaEye,
  FaDownload,
  FaChartBar
} from 'react-icons/fa';
import './FinancialHub.css';

const FinancialHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Services');
  const [reportDocuments, setReportDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  
  // Force component refresh


  const financialServices = [
    {
      id: 'annual-reporting',
      title: 'Annual Financial Reporting',
      description: 'Prepare and file your annual financial statements',
      category: 'Reporting',
      badges: ['Required', 'Compliance'],
      badgeColors: ['#EF4444', '#F59E0B'],
      type: 'start',
      onClick: () => navigate('/financial-overview')
    },
    {
      id: 'business-bank',
      title: 'Business Bank Account',
      description: 'Open a business bank account in the Netherlands',
      category: 'Banking',
      badges: ['Banking'],
      badgeColors: ['#3B82F6'],
      type: 'start',
      onClick: () => navigate('/banking')
    },
    {
      id: 'bookkeeping',
      title: 'Bookkeeping Services',
      description: 'Ongoing bookkeeping and financial administration',
      category: 'Accounting',
      badges: ['Premium', 'eBranch Plan'],
      badgeColors: ['#3B82F6', '#6366F1'],
      type: 'upgrade',
      premium: true,
      onClick: () => navigate('/bookkeeping')
    },
    {
      id: 'financial-analysis',
      title: 'Financial Analysis',
      description: 'Get insights and analysis of your financial performance',
      category: 'Reporting',
      badges: ['Premium', 'eBranch Plan'],
      badgeColors: ['#3B82F6', '#6366F1'],
      type: 'upgrade',
      premium: true,
      onClick: () => navigate('/financial-analysis')
    },
    {
      id: 'invoice-management',
      title: 'Invoice Management',
      description: 'Create, send and track invoices for your business',
      category: 'Accounting',
      badges: ['Premium', 'eBranch Plan'],
      badgeColors: ['#3B82F6', '#6366F1'],
      type: 'upgrade',
      premium: true,
      onClick: () => navigate('/invoices')
    },
    {
      id: 'expense-tracking',
      title: 'Expense Tracking',
      description: 'Track and categorize business expenses',
      category: 'Accounting',
      badges: ['Basic'],
      badgeColors: ['#10B981'],
      type: 'start',
      onClick: () => navigate('/expenses')
    },
    {
      id: 'financial-statements',
      title: 'Financial Statements',
      description: 'Generate balance sheets and income statements',
      category: 'Reporting',
      badges: ['Basic'],
      badgeColors: ['#10B981'],
      type: 'start',
      onClick: () => navigate('/financial-overview')
    },
    {
      id: 'payment-processing',
      title: 'Payment Processing',
      description: 'Process payments from customers in multiple currencies',
      category: 'Banking',
      badges: ['Premium', 'eBranch Plan'],
      badgeColors: ['#3B82F6', '#6366F1'],
      type: 'upgrade',
      premium: true,
      onClick: () => navigate('/payments')
    }
  ];

  // Get current user session
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Error getting user session:', error);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch documents when user is available and tab is Report
  useEffect(() => {
    if (userId && activeTab === 'Report') {
      fetchFinancialDocuments();
    }
  }, [userId, activeTab, selectedYear]); // Re-fetch when year filter changes

  // Function to fetch financial documents from Supabase
  const fetchFinancialDocuments = async () => {
    setLoadingDocuments(true);
    try {
      console.log(`Fetching all financial documents for user: ${userId}`);
      
      // Define all expected document types
      const expectedDocTypes = [
        'Financial Statement',
        'Trial Balance', 
        'Balance Sheet',
        'Profit & Loss Statement',
        'Cash Flow'
      ];
      
      // Fetch ALL financial documents for this user
      const { data: financialData, error } = await supabase
        .from('table_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('All financial documents fetched:', { 
        count: financialData?.length || 0, 
        data: financialData, 
        error 
      });

      if (error) throw error;

      // Extract available years from the data and include predefined years
      const predefinedYears = ['2025', '2024', '2023', '2022', '2021', '2020'];
      const years = new Set(predefinedYears);
      
      // Add any additional years from the database data
      if (financialData && financialData.length > 0) {
        financialData.forEach(doc => {
          if (doc.year) {
            years.add(doc.year.toString());
          }
        });
      }
      setAvailableYears([...years].sort((a, b) => b - a)); // Sort descending

      // Filter data by selected year
      let filteredData = financialData;
      if (selectedYear !== 'all' && financialData) {
        filteredData = financialData.filter(doc => doc.year && doc.year.toString() === selectedYear);
        console.log(`Filtered documents for year ${selectedYear}:`, filteredData.length);
      }

      // Group documents by doc_type and create the display structure
      const documentGroups = {};
      
      if (filteredData && filteredData.length > 0) {
        filteredData.forEach(doc => {
          const docType = doc.doc_type;
          console.log(`Processing document: ${doc.file_name} with doc_type: ${docType}, year: ${doc.year}`);
          if (!documentGroups[docType]) {
            documentGroups[docType] = [];
          }
          documentGroups[docType].push(doc);
        });
      }

      console.log('Document groups:', documentGroups);

      // Create the display documents with icons
      const getIcon = (docType) => {
        switch (docType) {
          case 'Financial Statement': return '📊';
          case 'Trial Balance': return '📋';
          case 'Balance Sheet': return '📈';
          case 'Profit & Loss Statement': return '💰';
          case 'Cash Flow': return '💸';
          default: return '📄';
        }
      };

      const fetchedDocuments = [];
      
      // First, add all document types that have actual documents
      Object.keys(documentGroups).forEach(docType => {
        const docs = documentGroups[docType];
        fetchedDocuments.push({
          name: docType,
          icon: getIcon(docType),
          status: 'Available',
          data: docs[0], // Most recent document
          count: docs.length,
          allDocuments: docs // Store all documents of this type
        });
        console.log(`Added available document type: ${docType} (${docs.length} files)`);
      });

      // Then, add any missing expected document types as "Not Available"
      expectedDocTypes.forEach(docType => {
        if (!documentGroups[docType]) {
          fetchedDocuments.push({
            name: docType,
            icon: getIcon(docType),
            status: 'Not Available',
            data: null,
            count: 0,
            allDocuments: []
          });
          console.log(`Added unavailable document type: ${docType}`);
        }
      });

      console.log('Final processed documents:', fetchedDocuments);
      setReportDocuments(fetchedDocuments);
    } catch (error) {
      console.error('Error fetching financial documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Function to analyze document
  const analyzeDocument = async (documentData) => {
    try {
      console.log('Analyzing document:', documentData);
      
      // You can customize this based on your analysis requirements
      // Option 1: Navigate to analysis page
      // navigate(`/document-analysis/${documentData.id}`);
      
      // Option 2: Show analysis modal or redirect to analysis service
      // For now, let's show an alert and potentially navigate to an analysis page
      
      const analysisData = {
        documentId: documentData.id,
        fileName: documentData.file_name,
        docType: documentData.doc_type,
        year: documentData.year
      };
      
      // Store analysis data in localStorage for the analysis page to use
      localStorage.setItem('documentToAnalyze', JSON.stringify(analysisData));
      
      // Navigate to analysis page (you can customize this route)
      navigate('/document-analysis');
      
      // Alternative: Show alert for now
      // alert(`Analyzing ${documentData.file_name} (${documentData.doc_type}) for year ${documentData.year}`);
      
    } catch (error) {
      console.error('Error analyzing document:', error);
      alert('Unable to analyze document. Please try again later.');
    }
  };

  // Function to view document file
  const viewDocumentFile = async (documentData) => {
    try {
      let filePath = documentData.file_path;
      let bucket = 'financial-documents';
      
      // Determine the correct bucket
      if (documentData.storage_bucket) {
        bucket = documentData.storage_bucket;
      } else if (documentData.file_path && documentData.file_path.includes('corporate-tax')) {
        bucket = 'corporate-tax-documents';
      }

      const { data: signedUrlData, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      if (signedUrlData?.signedUrl) {
        window.open(signedUrlData.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Unable to view document. Please try again later.');
    }
  };

  // Function to download document file
  const downloadDocumentFile = async (documentData) => {
    try {
      let filePath = documentData.file_path;
      let bucket = 'financial-documents';
      
      // Determine the correct bucket
      if (documentData.storage_bucket) {
        bucket = documentData.storage_bucket;
      } else if (documentData.file_path && documentData.file_path.includes('corporate-tax')) {
        bucket = 'corporate-tax-documents';
      }

      const { data: signedUrlData, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 300); // 5 minutes expiry

      if (error) throw error;

      if (signedUrlData?.signedUrl) {
        const link = document.createElement('a');
        link.href = signedUrlData.signedUrl;
        link.download = documentData.file_name || documentData.document_type;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Unable to download document. Please try again later.');
    }
  };

  const filteredServices = activeTab === 'All Services' 
    ? financialServices 
    : financialServices.filter(service => service.category === (activeTab === 'Report' ? 'Reporting' : activeTab));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#220938',
      color: '#fff',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0',
              color: '#fff'
            }}>
              📈 Financial Hub
            </h1>
            <p style={{ 
              color: '#9CA3AF', 
              margin: 0, 
              fontSize: '16px' 
            }}>
              Manage your financial reporting and compliance requirements
            </p>
          </div>
          <button style={{
            background: '#3B82F6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            → Application Hub
          </button>
        </div>

                {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px', alignItems: 'start' }}>
          {/* Left Column - Financial Compliance + Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Financial Compliance */}
            <div style={{
              background: 'rgba(45, 53, 97, 0.6)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    📈 Financial Compliance
                  </h2>
                  <p style={{ color: '#9CA3AF', margin: 0, fontSize: '12px', lineHeight: '1.3' }}>
                    Manage your financial reporting obligations in the Netherlands with ease.<br/>
                    Stay compliant with local regulations and gain insights into your business<br/>
                    performance.
                  </p>
                </div>
                <button style={{
                  background: '#3B82F6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => navigate('/financial-overview')}
                >
                  Start Annual Report → 
                </button>
              </div>

              {/* Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#9CA3AF', fontSize: '10px', marginBottom: '4px' }}>Annual Report</div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    📅 30 Jun
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#9CA3AF', fontSize: '10px', marginBottom: '4px' }}>Services Active</div>
                  <div style={{ color: '#10B981', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    ✓ 4 / 8
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#9CA3AF', fontSize: '10px', marginBottom: '4px' }}>Compliance</div>
                  <div style={{ color: '#3B82F6', fontSize: '14px', fontWeight: '700' }}>
                    100%
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Services Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Financial Services
                </h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {activeTab === 'Report' && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'rgba(45, 53, 97, 0.6)', 
                      borderRadius: '8px',
                      padding: '8px 16px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <FaFilter style={{ color: '#9CA3AF', marginRight: '8px' }} />
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="all" style={{ background: '#2D3561', color: '#fff' }}>All Years</option>
                        {availableYears.map(year => (
                          <option key={year} value={year} style={{ background: '#2D3561', color: '#fff' }}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {activeTab !== 'Report' && (
                    <>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'rgba(45, 53, 97, 0.6)', 
                        borderRadius: '8px',
                        padding: '8px 16px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <FaSearch style={{ color: '#9CA3AF', marginRight: '8px' }} />
                        <input 
                          type="text" 
                          placeholder="Search services..." 
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            width: '200px'
                          }}
                        />
                      </div>
                      <button style={{
                        background: 'transparent',
                        color: '#9CA3AF',
                        border: '1px solid rgba(156, 163, 175, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaFilter />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Service Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {['All Services', 'Report', 'Accounting', 'Banking'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? '#3B82F6' : 'transparent',
                      color: activeTab === tab ? '#fff' : '#9CA3AF',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Services Content */}
              {activeTab === 'Report' ? (
                // All Financial Documents List
                <div style={{ width: '100%' }}>
                  {loadingDocuments ? (
                    // Loading state
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#9CA3AF'
                    }}>
                      <div>Loading financial documents...</div>
                    </div>
                  ) : reportDocuments.length === 0 ? (
                    // No documents state
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#9CA3AF'
                    }}>
                      <div>No financial documents found. Upload documents to view them here.</div>
                    </div>
                  ) : (
                    // All Documents List
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {reportDocuments.map((docType, typeIndex) => (
                        docType.allDocuments && docType.allDocuments.length > 0 && (
                          <div key={typeIndex}>
                            {/* Document Type Header */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '12px',
                              paddingLeft: '4px'
                            }}>
                              <span style={{ fontSize: '20px' }}>{docType.icon}</span>
                              <h3 style={{ 
                                color: '#fff', 
                                fontSize: '18px', 
                                fontWeight: '600', 
                                margin: 0 
                              }}>
                                {docType.name}
                              </h3>
                              <span style={{
                                background: '#3B82F6',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {docType.count} file{docType.count > 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Documents in this category */}
                            <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
                              {docType.allDocuments.map((doc, docIndex) => (
                                <div key={docIndex} style={{
                                  background: 'rgba(45, 53, 97, 0.6)',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <h5 style={{ 
                                      color: '#fff', 
                                      fontSize: '16px', 
                                      fontWeight: '600', 
                                      margin: '0 0 8px 0' 
                                    }}>
                                      {doc.file_name}
                                    </h5>
                                    <div style={{ 
                                      display: 'flex', 
                                      gap: '16px', 
                                      fontSize: '14px', 
                                      color: '#9CA3AF' 
                                    }}>
                                      <span>📅 Year: {doc.year}</span>
                                      <span>📁 Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                      <span>⏰ Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                                      <span>📋 Type: {doc.doc_type}</span>
                                    </div>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    marginLeft: '16px' 
                                  }}>
                                    <button
                                      onClick={() => viewDocumentFile(doc)}
                                      style={{
                                        background: '#10B981',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <FaEye /> View
                                    </button>
                                    <button
                                      onClick={() => downloadDocumentFile(doc)}
                                      style={{
                                        background: '#3B82F6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <FaDownload /> Download
                                    </button>
                                    <button
                                      onClick={() => analyzeDocument(doc)}
                                      style={{
                                        background: '#F59E0B',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <FaChartBar /> Analyze
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular Services Grid
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '12px',
                  width: '100%'
                }}>
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      style={{
                        background: 'rgba(45, 53, 97, 0.6)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        height: 'fit-content',
                        minHeight: '100px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={service.onClick}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Premium Badge */}
                      {service.premium && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#6366F1',
                          color: '#fff',
                          padding: '2px 4px',
                          borderRadius: '8px',
                          fontSize: '8px',
                          fontWeight: '600'
                        }}>
                          PREMIUM
                        </div>
                      )}

                      {/* Service Icon */}
                      <div style={{ marginBottom: '8px' }}>
                        {service.id === 'annual-reporting' && <FaFileAlt style={{ fontSize: '16px', color: '#3B82F6' }} />}
                        {service.id === 'business-bank' && <FaCreditCard style={{ fontSize: '16px', color: '#10B981' }} />}
                        {service.id === 'bookkeeping' && <FaBook style={{ fontSize: '16px', color: '#8B5CF6' }} />}
                        {service.id === 'financial-analysis' && <FaChartLine style={{ fontSize: '16px', color: '#F59E0B' }} />}
                        {service.id === 'invoice-management' && <FaFileInvoice style={{ fontSize: '16px', color: '#EF4444' }} />}
                        {service.id === 'expense-tracking' && <FaReceipt style={{ fontSize: '16px', color: '#06B6D4' }} />}
                        {service.id === 'financial-statements' && <FaCalculator style={{ fontSize: '16px', color: '#10B981' }} />}
                        {service.id === 'payment-processing' && <FaMoneyBillWave style={{ fontSize: '16px', color: '#8B5CF6' }} />}
                      </div>
                      
                      <h3 style={{
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        margin: '0 0 4px 0'
                      }}>
                        {service.title}
                      </h3>

                      <p style={{
                        color: '#9CA3AF',
                        fontSize: '11px',
                        margin: '0 0 8px 0',
                        lineHeight: '1.2',
                        flex: 1
                      }}>
                        {service.description}
                      </p>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        {service.badges.map((badge, index) => (
                          <span
                            key={badge}
                            style={{
                              background: service.badgeColors[index],
                              color: '#fff',
                              padding: '2px 4px',
                              borderRadius: '8px',
                              fontSize: '8px',
                              fontWeight: '600'
                            }}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        {service.type === 'start' ? (
                          <button style={{
                            background: '#3B82F6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            Start →
                          </button>
                        ) : (
                          <button style={{
                            background: 'transparent',
                            color: '#3B82F6',
                            border: '1px solid #3B82F6',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            Upgrade to Access →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Financial Health */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: 'fit-content' }}>
            {/* Financial Health */}
            <div style={{
              background: 'rgba(45, 53, 97, 0.6)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              height: 'fit-content'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                Financial Health
              </h3>
              
              {/* Compliance Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Compliance Status</span>
                <span style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>Compliant</span>
              </div>
              <div style={{
                width: '100%',
                height: '3px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#10B981',
                  borderRadius: '2px'
                }}></div>
              </div>

              {/* Status Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>📋</span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>Annual Report Status</span>
                  </div>
                  <span style={{ 
                    background: '#F59E0B', 
                    color: '#fff', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontSize: '9px', 
                    fontWeight: '600' 
                  }}>
                    Pending
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '13px' }}>Bank Account</span>
                  <span style={{ 
                    background: '#10B981', 
                    color: '#fff', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontSize: '9px', 
                    fontWeight: '600' 
                  }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>📊</span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>Financial Statements</span>
                  </div>
                  <span style={{ 
                    background: '#3B82F6', 
                    color: '#fff', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontSize: '9px', 
                    fontWeight: '600' 
                  }}>
                    Up to date
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrade Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
              borderRadius: '16px',
              padding: '16px',
              color: '#fff',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <FaTrophy style={{ color: '#FCD34D', fontSize: '14px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  🚀 Upgrade to eBranch
                </h3>
              </div>
              <p style={{ fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                Unlock premium financial services and tools with our eBranch<br/>
                plan. Perfect for businesses expanding to new markets.
              </p>
              <div style={{ fontSize: '11px', marginBottom: '12px' }}>
                ✓ Advanced bookkeeping services<br/>
                ✓ Financial analysis and insights<br/>
                ✓ Invoice management system
              </div>
              <button style={{
                background: '#fff',
                color: '#3B82F6',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}>
                Upgrade Now →
              </button>
            </div>

            {/* Compliance Alert */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              color: '#fff',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <FaExclamationTriangle style={{ color: '#F59E0B', fontSize: '14px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  Compliance Alert
                </h3>
              </div>
              <p style={{ fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4', color: '#fff' }}>
                Your annual financial report is due on June 30, 2024. Start<br/>
                preparation now to ensure timely submission.
              </p>
              <button style={{
                background: '#F59E0B',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => navigate('/financial-overview')}
              >
                Start Annual Report →
              </button>
            </div>
          </div>
        </div>

        

        {/* Financial Calendar */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Financial Calendar
            </h2>
            <button style={{
              background: 'transparent',
              color: '#3B82F6',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              View Full Calendar →
            </button>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {/* Calendar Items */}
            <div style={{
              background: 'rgba(45, 53, 97, 0.6)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#EF4444'
                }}></div>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                    📋 Annual Report 2023
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    Due: Jun 30, 2024
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  background: '#EF4444',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  High Priority
                </span>
                <button style={{
                  background: '#3B82F6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/financial-overview')}
                >
                  Start Preparation →
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(45, 53, 97, 0.6)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#F59E0B'
                }}></div>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                    📊 Q2 Financial Statements
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    Due: Jul 15, 2024
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  background: '#F59E0B',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  Medium Priority
                </span>
                <button style={{
                  background: '#3B82F6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/financial-overview')}
                >
                  Start Preparation →
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(45, 53, 97, 0.6)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#F59E0B'
                }}></div>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                    📋 Audit Preparation
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    Due: Aug 1, 2024
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  background: '#F59E0B',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  Medium Priority
                </span>
                <button style={{
                  background: '#3B82F6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/financial-overview')}
                >
                  Start Preparation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>





      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FinancialHub;
