import React, { useState } from 'react';
import { FaRobot, FaUpload, FaFileAlt, FaChartBar, FaEye, FaDownload, FaCalendarAlt, FaFileInvoice } from 'react-icons/fa';
import './FinancialOverview.css';

const FinancialOverview = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const tabs = ['Overview', 'Transactions', 'Reports', 'Documents'];

  const recentActivities = [
    {
      id: 1,
      icon: <FaDownload />,
      title: 'Bank Statement Imported',
      time: '2 hours ago',
      color: '#3b82f6'
    },
    {
      id: 2,
      icon: <FaFileAlt />,
      title: 'Q3 Report Generated',
      time: '1 day ago',
      color: '#10b981'
    }
  ];

  const favoriteReports = [
    {
      id: 1,
      icon: <FaChartBar />,
      title: 'Monthly P&L Statement',
      lastAccessed: 'Yesterday',
      color: '#8b5cf6'
    },
    {
      id: 2,
      icon: <FaCalendarAlt />,
      title: 'Expense Breakdown',
      lastAccessed: '2 days ago',
      color: '#f59e0b'
    },
    {
      id: 3,
      icon: <FaFileInvoice />,
      title: 'Cash Flow Analysis',
      lastAccessed: '3 days ago',
      color: '#10b981'
    }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        file: file
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
      
      // Clear the input
      event.target.value = '';
    }, 1000);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="financial-overview-container">
      {/* Header */}
      <div className="financial-overview-header">
        <div className="header-left">
          <FaChartBar className="header-icon" />
          <h1>Financial Overview</h1>
        </div>
        <div className="header-actions">
          <button className="upload-btn">
            <FaUpload /> Upload Financial Documents
          </button>
          <button className="generate-report-btn">
            Generate Report →
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="financial-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="financial-content">
        <div className="main-section">
          {/* AI Assistant Card */}
          <div className="ai-assistant-card">
            <div className="ai-header">
              <FaRobot className="ai-icon" />
              <h2>AI Accounting Assistant</h2>
            </div>
            <p>Let our AI help you categorize transactions, reconcile accounts, and generate insights from your financial data.</p>
            <button className="ai-btn">Start AI Analysis</button>
          </div>

          {/* Action Cards */}
          <div className="action-cards">
            <div className="action-card upload-card">
              <FaUpload className="action-icon" />
              <h3>Upload Financial Data</h3>
              <p>Import transactions, receipts, and statements</p>
              
              {/* File Upload Area */}
              <div className="upload-area">
                <input
                  type="file"
                  id="financial-file-upload"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="financial-file-upload" className="upload-label">
                  {isUploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <span>Upload Files →</span>
                  )}
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="files-list">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="file-item">
                        <div className="file-info">
                          <FaFileAlt className="file-icon" />
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button 
                          className="remove-file-btn"
                          onClick={() => removeFile(file.id)}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="action-card">
              <FaFileAlt className="action-icon" />
              <h3>Financial Reports</h3>
              <p>Generate custom reports and analysis</p>
              <button className="action-btn">Create Report →</button>
        </div>
          </div>

          {/* Financial Overview Summary */}
          <div className="financial-summary">
            <h3>Financial Overview</h3>
            <div className="summary-table">
              <div className="summary-row">
                <span className="summary-label">Revenue (YTD)</span>
                <span className="summary-value">€125,000</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Expenses (YTD)</span>
                <span className="summary-value">€82,000</span>
        </div>
              <div className="summary-row">
                <span className="summary-label">Net Profit</span>
                <span className="summary-value profit">€43,000</span>
      </div>
    </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Recent Activity */}
          <div className="sidebar-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" style={{ color: activity.color }}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
        </div>
      </div>

          {/* Favorite Reports */}
          <div className="sidebar-section">
            <h3>Favorite Reports</h3>
            <div className="reports-list">
              {favoriteReports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-icon" style={{ color: report.color }}>
                    {report.icon}
        </div>
                  <div className="report-content">
                    <div className="report-title">{report.title}</div>
                    <div className="report-time">Last accessed: {report.lastAccessed}</div>
        </div>
                  <div className="report-actions">
                    <FaEye className="report-action-icon" />
                    <FaDownload className="report-action-icon" />
                    </div>
                    </div>
              ))}
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview; 
