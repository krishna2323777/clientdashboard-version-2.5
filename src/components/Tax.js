import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseClient';
import { FiDownload, FiPieChart, FiCpu, FiUpload, FiCheckCircle, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { FaCalculator, FaFilePdf, FaFileAlt, FaShippingFast } from 'react-icons/fa'; // Added FaFileAlt and FaShippingFast
import { BsFileEarmarkCheck } from 'react-icons/bs';
import './Tax.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Tax = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [companyDetails, setCompanyDetails] = useState({
    name: 'Tax Management',
    type: 'Private Limited Company',
    status: 'Active'
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('Fetching from company_info for user:', user.id);
        const { data, error } = await supabase
          .from('company_info')
          .select('company_name, company_type, status') // Select specific fields
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching from company_info:', error);
          // Optionally, set to default or handle error state
          setCompanyDetails({
            name: 'Tax Management',
            type: 'Private Limited Company',
            status: 'Active'
          });
        }

        if (data) {
          console.log('Data from company_info:', data);
          setCompanyDetails({
            name: data.company_name || 'Tax Management',
            type: data.company_type || 'Private Limited Company',
            status: data.status || 'Active'
          });
        } else {
          console.log('No data found in company_info for user:', user.id);
          // Optionally, set to default if no data found
          setCompanyDetails({
            name: 'Tax Management',
            type: 'Private Limited Company',
            status: 'Active'
          });
        }
      } else {
        console.log('No user found.');
        // Handle case where no user is found, e.g., redirect to login or show message
        setCompanyDetails({ // Set to default if no user
            name: 'Tax Management',
            type: 'Private Limited Company',
            status: 'Active'
          });
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      // Fallback to default details in case of any other error
      setCompanyDetails({
        name: 'Tax Management',
        type: 'Private Limited Company',
        status: 'Active'
      });
    }
  };

  const handleEditClick = () => {
    navigate('/generate-forms');
  };

  const handleStartPreparation = () => {
    navigate('/corporate-tax-analysis');
  };

  return (
    <div className="tax-container">
      {/* Header */}
      <div className="tax-header">
        <div className="tax-header-left">
          <div className="tax-header-icon">
            <BsFileEarmarkCheck size={24} />
          </div>
          <div className="tax-header-title">
            <h1>{companyDetails.name}</h1>
            <p>{companyDetails.type} • {companyDetails.status}</p>
          </div>
        </div>
        <button className="edit-company-button" onClick={handleEditClick}>
          <span>✏️ Edit Company Details</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="tax-tabs">
        <button 
          className={activeTab === 'Overview' ? 'active' : ''} 
          onClick={() => setActiveTab('Overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'Tax Returns' ? 'active' : ''} 
          onClick={() => setActiveTab('Tax Returns')}
        >
          Tax Returns
        </button>
        <button 
          className={activeTab === 'Objections' ? 'active' : ''} 
          onClick={() => setActiveTab('Objections')}
        >
          Objections
        </button>
        <button 
          className={activeTab === 'Calculations' ? 'active' : ''} 
          onClick={() => setActiveTab('Calculations')}
        >
          Calculations
        </button>
        <button 
          className={activeTab === 'VIIS Check' ? 'active' : ''} 
          onClick={() => setActiveTab('VIIS Check')}
        >
          VIES Check
        </button>
      </div>

      <div className="tax-content">
        {activeTab === 'Overview' && (
          <>
            <div className="tax-column left-column">
              <div className="quick-actions-panel">
                <h2>Quick Actions</h2>
                <div className="action-item">
                  <FiDownload className="action-icon" />
                  <span>Download Tax Certificates</span>
                  <span className="chevron">›</span>
                </div>
                <div className="action-item">
                  <FaCalculator className="action-icon" />
                  <span>Tax Calculator</span>
                  <span className="chevron">›</span>
                </div>
                <div className="action-item">
                  <FiPieChart className="action-icon" />
                  <span>Tax Optimization Report</span>
                  <span className="chevron">›</span>
                </div>
              </div>
            </div>

            <div className="tax-column right-column">
              <div className="tax-opportunities-panel">
                <h2>
                  <span className="info-icon">ℹ️</span>
                  Tax Optimization Opportunities
                </h2>
                
                <div className="opportunity-item">
                  <div className="opportunity-check">✓</div>
                  <div className="opportunity-content">
                    <h3>R&D Tax Credits</h3>
                    <p>Your software development activities may qualify for WBSO R&D tax credits.</p>
                    <div className="opportunity-savings">
                      <span>Potential savings:</span>
                      <span className="savings-amount">€12,500</span>
                    </div>
                  </div>
                </div>
                
                <div className="opportunity-item">
                  <div className="opportunity-check">✓</div>
                  <div className="opportunity-content">
                    <h3>VAT Reclaim</h3>
                    <p>You have unclaimed VAT on international business expenses.</p>
                    <div className="opportunity-savings">
                      <span>Potential savings:</span>
                      <span className="savings-amount">€3,750</span>
                    </div>
                  </div>
                </div>
                
                <button className="view-all-button">
                  View All Opportunities
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Objections' && (
          <div className="objections-tab-content">
            <div className="objections-main-header">
              <h2>Objection Letters</h2>
              <p>Our AI Tax Agent help you draft objection letters</p>
            </div>

            <div className="objections-stepper">
              <div className="step active">
                <span className="step-number">1</span>
                <span className="step-label">Upload</span>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-label">Analysis</span>
              </div>
              <div className="step-connector"></div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-label">Letter</span>
              </div>
            </div>

            <div className="objections-upload-section">
              <FiUpload size={40} className="upload-icon-main" />
              <h3>Upload Tax Assessment</h3>
              <p>Drag and drop your tax assessment PDF or click to browse</p>
              {/* This part will need state and logic for file handling */}
              <div className="uploaded-file-info">
                <FaFilePdf />
                <span>vat-form (2).pdf</span>
                <span className="remove-file">×</span>
              </div>
              <button className="continue-analysis-button">Continue to Analysis →</button>
            </div>

            <div className="objections-process-overview">
              <div className="process-card">
                <div className="process-card-icon-status">
                  <FiCheckCircle size={24} className="status-icon completed" />
                </div>
                <div className="process-card-content">
                  <h3>Analysis</h3>
                  <p>Our AI analyzes your assessment for potential objection grounds</p>
                </div>
              </div>
              <div className="process-card">
                <div className="process-card-icon-status">
                  <FiRefreshCw size={24} className="status-icon pending" />
                </div>
                <div className="process-card-content">
                  <h3>Draft</h3>
                  <p>Generate a professional objection letter based on findings</p>
                </div>
              </div>
              <div className="process-card">
                <div className="process-card-icon-status">
                  <FiSettings size={24} className="status-icon pending" />
                </div>
                <div className="process-card-content">
                  <h3>Delivery</h3>
                  <p>Download or send your objection letter to tax authorities</p>
                </div>
              </div>
            </div>

            <div className="recent-objections-section">
              <h3>Recent Objections</h3>
              <div className="recent-objection-item">
                <div className="objection-item-details">
                  <p className="objection-title">Corporate Tax Assessment 2023</p>
                  <p className="objection-date">Objection sent on Feb 15, 2024</p>
                </div>
                <span className="objection-status in-progress">In Progress</span>
              </div>
              <div className="recent-objection-item">
                <div className="objection-item-details">
                  <p className="objection-title">Corporate Tax Assessment 2023</p>
                  <p className="objection-date">Objection sent on Feb 15, 2024</p>
                </div>
                <span className="objection-status in-progress">In Progress</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Calculations' && (
          <div className="calculations-tab-content">
            <div className="calculations-header">
              <h2>Tax Calculations</h2>
              <p>Use our tax calculators to estimate your tax liabilities and plan accordingly.</p>
            </div>
            <div className="calculator-cards-container">
              <div className="calculator-card">
                <h3>Corporate Income Tax Calculator</h3>
                <p>Calculate your estimated corporate tax liability based on your projected profits.</p>
                <button className="open-calculator-button">
                  <FaFileAlt /> Open Calculator
                </button>
              </div>
              <div className="calculator-card">
                <h3>VAT Calculator</h3>
                <p>Calculate VAT amounts for different transaction types and jurisdictions.</p>
                <button className="open-calculator-button">
                  <FaFileAlt /> Open Calculator
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VIIS Check' && (
          <div className="vies-check-tab-content">
            <div className="vies-header">
              <h2>VIES VAT Number Validation</h2>
              <p>Validate EU VAT numbers using the VAT Information Exchange System (VIES).</p>
            </div>

            <div className="vies-input-section">
              <label htmlFor="vatNumber">VAT Number</label>
              <div className="vies-input-group">
                <input 
                  type="text" 
                  id="vatNumber" 
                  className="vies-input-field" 
                  placeholder="e.g. NL123456789B01" 
                />
                <button className="vies-validate-button">Validate</button>
              </div>
              <div className="vies-recent-checks">
                <span>Recent checks:</span>
                <span className="recent-check-item">NL123456789B01</span>
                <span className="recent-check-item">DE123456789</span>
                <span className="recent-check-item">FR12345678901</span>
              </div>
            </div>

            <div className="vies-why-validate-section">
              <h3>Why Validate VAT Numbers?</h3>
              <ul className="why-validate-list">
                <li className="why-validate-item">
                  <FiCheckCircle className="why-validate-icon" />
                  Ensure your customers' VAT numbers are valid for zero-rating intra-EU supplies
                </li>
                <li className="why-validate-item">
                  <FiCheckCircle className="why-validate-icon" />
                  Avoid potential VAT liabilities from transactions with invalid VAT numbers
                </li>
                <li className="why-validate-item">
                  <FiCheckCircle className="why-validate-icon" />
                  Keep records of VAT validations for tax authority audits
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'Tax Returns' && (
          <div className="tax-returns-tab-content">
            {!showAnalysis ? (
              <div className="tax-returns-grid">
                {/* VAT Return Card */}
                <div className="tax-return-card">
                  <div className="tax-return-header">
                    <h3>VAT Return</h3>
                    <span className="due-badge">Due in 5 days</span>
                  </div>
                  <div className="tax-return-details">
                    <div className="period-info">
                      <span>Period:</span>
                      <strong>Q1 2023 (Jan-Mar)</strong>
                    </div>
                    <div className="status-info">
                      <span>Status:</span>
                      <span className="status-badge in-progress">In Progress</span>
                    </div>
                    <div className="amount-info">
                      <span>Estimated VAT:</span>
                      <strong>€2,450.00</strong>
                    </div>
                  </div>
                  <button className="continue-preparation-button" onClick={() => navigate('/vat-analysis')}>
                    Continue Preparation →
                  </button>
                </div>

                {/* Corporate Tax Card */}
                <div className="tax-return-card">
                  <div className="tax-return-header">
                    <h3>Corporate Tax</h3>
                    <span className="due-badge early-prep">Early Preparation</span>
                  </div>
                  <div className="tax-return-details">
                    <div className="period-info">
                      <span>Period:</span>
                      <strong>FY 2023</strong>
                    </div>
                    <div className="status-info">
                      <span>Status:</span>
                      <span className="status-badge pending">Early Preparation</span>
                    </div>
                    <div className="amount-info">
                      <span>Estimated Tax:</span>
                      <strong>€16,750.00</strong>
                    </div>
                  </div>
                  <button className="start-preparation-button" onClick={handleStartPreparation}>
                    Start Preparation →
                  </button>
                </div>
              </div>
            ) : (
              <div className="corporate-tax-analysis">
                <div className="analysis-header">
                  <h2>Corporate Tax Analysis</h2>
                  <button className="show-transactions-btn">Show Transactions</button>
                </div>

                <div className="metric-cards">
                  <div className="metric-card revenue">
                    <h3>Revenue</h3>
                    <div className="amount">€1,650,000</div>
                    <div className="trend">↑ 10.57%</div>
                  </div>
                  <div className="metric-card profit">
                    <h3>Profit</h3>
                    <div className="amount">€500,000</div>
                    <div className="trend">↑ 8.7%</div>
                  </div>
                  <div className="metric-card liability">
                    <h3>Tax Liability</h3>
                    <div className="amount">€119,500</div>
                    <div className="trend">↑ 6.14%</div>
                  </div>
                </div>

                <div className="analysis-tabs">
                  <button className="tab-button active">Financial Overview</button>
                  <button className="tab-button">Expense Analysis</button>
                  <button className="tab-button">Tax Optimization</button>
                  <button className="tab-button">Tax Return Filing</button>
                </div>

                <div className="performance-chart">
                  <h3>Quarterly Financial Performance</h3>
                  <div className="chart">
                    {/* Add Chart.js implementation here */}
                  </div>
                </div>

                <div className="tax-liability-chart">
                  <h3>Tax Liability Trend</h3>
                  <div className="chart">
                    {/* Add Chart.js implementation here */}
                  </div>
                </div>

                <div className="key-metrics">
                  <h3>Key Financial Metrics</h3>
                  <div className="metrics-list">
                    <div className="metric-item">
                      <span className="label">Revenue</span>
                      <span className="value">€1,650,000</span>
                    </div>
                    <div className="metric-item">
                      <span className="label">Expenses</span>
                      <span className="value">€150,000</span>
                    </div>
                    <div className="metric-item">
                      <span className="label">Profit Before Tax</span>
                      <span className="value">€500,000</span>
                    </div>
                    <div className="metric-item">
                      <span className="label">Deductions</span>
                      <span className="value">€22,000</span>
                    </div>
                    <div className="metric-item">
                      <span className="label">Taxable Income</span>
                      <span className="value">€478,000</span>
                    </div>
                    <div className="metric-item">
                      <span className="label">Tax Rate</span>
                      <span className="value">23.90%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Add similar blocks for 'Tax Returns' when ready */}
      </div>
    </div>
  );
};

export default Tax;
