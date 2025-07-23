import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import './CorporateTaxAnalysis.css';
import { supabase } from '../supabaseClient'; // adjust path as needed

const API_BASE_URL = "https://tax-analyserr.onrender.com/extract";

const CorporateTaxAnalysis = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState('Final Year');
  const [companyName, setCompanyName] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 10) {
      alert('You can only upload up to 10 PDFs at once.');
      return;
    }
    setFiles(selected);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      alert('Please select PDF files first.');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));

    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Processing failed');
      }

      const data = await res.json();
      const uploadedFileName = files[0]?.name || '';
      const { error } = await supabase
        .from('corporate_tax_analysis')
        .insert([{
          company_name: data.company_name,
          country: data.country,
          total_revenue: Number(data.total_revenue),
          total_expenses: Number(data.total_expenses),
          depreciation: Number(data.depreciation),
          deductions: Number(data.deductions),
          net_taxable_income: Number(data.net_taxable_income),
          final_tax_owed: Number(data.final_tax_owed),
          file_name: uploadedFileName
        }]);

      if (error) {
        console.error('Supabase insert error:', error);
        setMessage('❌ Failed ');
      } else {
        setMessage('✅ PDF processed!');
        await fetchLatestAnalysis(); // Fetch and display the latest data after upload
      }

      // Update state with all extracted data
      setExtractedData(data);
      setCompanyName(data.company_name || '');
      setSelectedYear(data.year?.toString() || new Date().getFullYear().toString());
      setTotalProfit(data.total_revenue || 0);
      setTotalTax(data.final_tax_owed || 0);

      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const defaultData = quarters.map((q) => ({ quarter: q, revenue: 0, expenses: 0, profit: 0, tax_liability: 0, taxable_income: 0 }));
      const merged = defaultData.map((qObj) => {
        const actual = data.quarters[qObj.quarter];
        // Add a small offset to tax_liability for visual clarity
        const taxableIncome = Number(actual?.net_taxable_income || 0);
        let taxLiability = Number(actual?.final_tax_owed || 0);
        // If taxLiability is the same as taxableIncome, offset it for visibility
        if (taxLiability === taxableIncome) {
          taxLiability = taxableIncome - 100; // or any small value
        }
        return actual ? {
          ...qObj,
          revenue: Number(actual.revenue),
          expenses: Number(actual.expenses),
          profit: Number(actual.revenue) - Number(actual.expenses),
          tax_liability: taxLiability,
          taxable_income: taxableIncome
        } : qObj;
      });

      setChartData(merged);
      setFiles([]);
    } catch (err) {
      console.error('Processing error:', err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get data for the selected quarter or all quarters
  const getBarChartData = () => {
    if (selectedQuarter === 'Final Year') {
      return chartData;
    }
    return chartData.filter((d) => d.quarter === selectedQuarter);
  };

  // Helper to get tax liability trend data for the selected quarter or all quarters
  const getTrendChartData = () => {
    if (chartData.length && chartData.some(d => d.tax_liability !== undefined && d.taxable_income !== undefined)) {
      if (selectedQuarter === 'Final Year') {
        return chartData;
      }
      return chartData.filter((d) => d.quarter === selectedQuarter);
    }
    // Fallback: use total_expenses and net_taxable_income for all quarters
    return [
      {
        quarter: 'Q1',
        tax_liability: Number(extractedData.total_expenses) || 0,
        taxable_income: Number(extractedData.net_taxable_income) || 0
      },
      {
        quarter: 'Q2',
        tax_liability: Number(extractedData.total_expenses) || 0,
        taxable_income: Number(extractedData.net_taxable_income) || 0
      },
      {
        quarter: 'Q3',
        tax_liability: Number(extractedData.total_expenses) || 0,
        taxable_income: Number(extractedData.net_taxable_income) || 0
      },
      {
        quarter: 'Q4',
        tax_liability: Number(extractedData.total_expenses) || 0,
        taxable_income: Number(extractedData.net_taxable_income) || 0
      }
    ];
  };

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="summary-cards">
        <SummaryCard title="Net Taxable Income" value={`€${extractedData.net_taxable_income || 0}`} />
        <SummaryCard title="Final Tax" value={`€${extractedData.final_tax_owed || 0}`} />
        <SummaryCard title="Total Expenses" value={`€${extractedData.total_expenses || 0}`} />
        <SummaryCard title="Total Revenue" value={`€${extractedData.total_revenue || 0}`} />
      </div>
      <h3>{companyName ? `${companyName} – ` : ''}Quarterly Financial Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={getBarChartData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="quarter" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" name="Revenue (€)" fill="#8884d8" />
          <Bar dataKey="expenses" name="Expenses (€)" fill="#82ca9d" />
          <Bar dataKey="profit" name="Profit (€)" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
      <div className="trend-metrics">
        <div className="trend-chart">
          <h4>Tax Liability Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={getTrendChartData()}>
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tax_liability" name="Tax Liability (€)" stroke="#8884d8" />
              <Line type="monotone" dataKey="taxable_income" name="Taxable Income (€)" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="key-metrics">
          <h4>Key Financial Metrics</h4>
          <ul>
            <li>Revenue: €{extractedData.total_revenue}</li>
            <li>Expenses: €{extractedData.total_expenses}</li>
            <li>Profit Before Tax: €{extractedData.profit_before_tax}</li>
            <li>Deductions: €{extractedData.deductions}</li>
            <li>Taxable Income: €{extractedData.net_taxable_income}</li>
            <li>Corporate Tax (25%): €{extractedData.corporate_tax}</li>
            <li>Effective Tax Rate: {extractedData.effective_tax_rate}%</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const optimizationTips = [
    {
      title: 'Utilize R&D Tax Credits',
      text: 'Apply for R&D credits to reduce taxable income.',
      impact: 'Potential savings: up to 5% of taxable profit'
    },
    {
      title: 'Optimize Depreciation',
      text: 'Switch to accelerated depreciation to defer taxes.',
      impact: 'Improves cash flow in early years'
    },
    {
      title: 'Review Transfer Pricing',
      text: 'Ensure intercompany pricing aligns with OECD guidelines.',
      impact: 'Reduces risk of penalties'
    }
  ];

  const renderOptimizationTab = () => (
    <div className="optimization-tab">
      <h3>Tax Optimization Opportunities</h3>
      <ul className="optimization-list">
        {optimizationTips.map((tip, idx) => (
          <li key={idx} className="optimization-item">
            <h4>{tip.title}</h4>
            <p>{tip.text}</p>
            <p className="impact">{tip.impact}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderFilingTab = () => (
    <div className="filing-tab">
      <h3>Corporate Tax Return Filing Assistant</h3>
      <p>After reviewing your analysis, proceed to file your return through the official tax portal.</p>
      <button
        className="cta-button"
        onClick={() => window.open('https://belastingdienst.nl', '_blank')}
      >
        Go to Tax Authority Portal
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverviewTab();
      case 'Optimization':
        return renderOptimizationTab();
      case 'Filing Assistant':
        return renderFilingTab();
      default:
        return null;
    }
  };

  // Fetch latest record from Supabase
  const fetchLatestAnalysis = async () => {
    const { data, error } = await supabase
      .from('corporate_tax_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const record = data[0];
      setExtractedData(record);
      setCompanyName(record.company_name || '');
      setSelectedYear(new Date().getFullYear().toString());
      setTotalProfit(record.total_revenue || 0);
      setTotalTax(record.final_tax_owed || 0);
      setFileName(record.file_name || '');
    }
  };

  useEffect(() => {
    fetchLatestAnalysis();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="cta-container">
      <div className="cta-header">
        <h1>Advanced Corporate Tax Dashboard</h1>
        <div className="cta-header-controls">
          <select
            className="cta-dropdown"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
          >
            {['Q1', 'Q2', 'Q3', 'Final Year'].map((qtr) => (
              <option key={qtr} value={qtr}>
                {qtr}
              </option>
            ))}
          </select>
          {isProcessing && <span className="processing-indicator">Processing...</span>}
        </div>
      </div>

      <div className="cta-tabs">
        {['Overview', 'Optimization', 'Filing Assistant'].map((tab) => (
          <button
            key={tab}
            className={`cta-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="upload-row">
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFileChange}
          className="cta-file-input"
        />
        <button
          className="cta-button cta-upload-button"
          onClick={uploadFiles}
          disabled={files.length === 0}
        >
          {files.length > 1 ? `Upload ${files.length} PDFs` : 'Upload PDF'}
        </button>
      </div>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}

      {fileName && (
        <div className="uploaded-file-info">
          <span>Last uploaded file: <strong>{fileName}</strong></span>
        </div>
      )}

      <div className="cta-content">{renderTabContent()}</div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="summary-card">
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

export default CorporateTaxAnalysis;
