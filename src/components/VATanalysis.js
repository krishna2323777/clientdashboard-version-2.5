import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie
} from 'recharts';
import API_BASE_URL from './config';

import './Vatanalysis.css';

import step1 from '../assests/step1.png';
import step2 from '../assests/step2.png';
import step3 from '../assests/step3.png';
import step4 from '../assests/step4.png';
import step5 from '../assests/step5.png';
import step6 from '../assests/step6.png';
import step7 from '../assests/step7.png';
import step8 from '../assests/step8.png';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';


const tutorialImages = [step1, step2, step3, step4, step5, step6, step7, step8];

const VAT = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedStrategy, setSelectedStrategy] = useState('Centralize EU VAT Registrations');
  const [showReport, setShowReport] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [totalVAT, setTotalVAT] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingYear, setPendingYear] = useState('');
  const summaryRef = useRef();
  const reportRef = useRef();



  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 20) {
      alert("You can only select up to 20 files at a time.");
      return;
    }
    setFiles(selectedFiles);
  };

  const uploadFile = async () => {
    if (!files || files.length === 0) {
      alert("Please select PDF files to upload.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // ❌ Backend sent error (e.g., too many files)
        setMessage(`❌ Error: ${data.detail}`);
      } else {
        // ✅ Normal success
        let formattedList = '';
        if (data.files_uploaded && data.files_uploaded.length > 0) {
          formattedList = data.files_uploaded.map((file, idx) => `${idx + 1}. ${file}`).join(',\n');
        }
        setMessage(`${data.message}\nUploaded files:\n${formattedList}`);

      }
    } catch (err) {
      setMessage("❌ Upload failed. Please try again.");
      console.error("Upload error:", err);
    }
  };



  const triggerVAT = async () => {
    setIsProcessing(true);  // ✅ Start loader
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/trigger`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessage(data.message);
      fetchChartData();  // ✅ Refresh data after processing
    } catch (err) {
      console.error("Error triggering VAT:", err);
      setMessage("❌ VAT processing failed. Please try again.");
    } finally {
      setIsProcessing(false);  // ✅ Stop loader
    }
  };


  const fetchChartData = async (year = selectedYear || new Date().getFullYear().toString()) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/vat-summary?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      console.log("VAT Summary Response:", data);

      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const defaultChart = monthOrder.map(month => ({
        month,
        'Domestic VAT': 0,
        'Intra-EU VAT': 0,
        'Import VAT': 0
      }));

      const mergedChart = defaultChart.map(monthObj => {
        const actual = data.monthly_data.find(item => item.month === monthObj.month);
        return actual ? { ...monthObj, ...actual } : monthObj;
      });

      setChartData(mergedChart);
      setTotalVAT(data.total_vat);
      setTotalTransactions(data.total_amount);
    } catch (error) {
      console.error("Error loading chart data:", error);
      setChartData([]);
      setTotalVAT(0);
      setTotalTransactions(0);
    }
  };


  const fetchTransactions = async (show = true, year = selectedYear || new Date().getFullYear().toString()) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/transactions?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setTransactions(data.transactions || []);

      if (show) setShowInvoices(true);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    }
  };


  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Logout logging failed:", error); // Optional: Handle gracefully
    }

    localStorage.removeItem("token");
    navigate("/");
  };


  const getVatCategoryLabel = (code) => {
    const labels = {
      "1a": "Domestic sales (21%)",
      "1b": "Domestic sales (9%)",
      "1c": "Sales with 0% VAT to EU",
      "2a": "Reverse-charge",
      "3a": "Goods supplied",
      "3b": "Services supplied",
      "4a": "Goods purchased",
      "4b": "Services purchased"
    };
    return labels[code] || code || "N/A";
  };


  useEffect(() => {
    fetchChartData();
    console.log("Total VAT:", totalVAT);
    console.log("Total Transactions:", totalTransactions);
  }, []);

  const sumAmounts = (categories) => {
    let net = 0;
    let vat = 0;
    transactions.forEach(txn => {
      if (categories.includes(txn.vat_category)) {
        try {
          const netVal = parseFloat(txn.amount_pre_vat?.replace(/[^0-9.-]+/g, '') || '0');
          const vatRate = parseFloat(txn.vat_percentage?.replace('%', '') || '0');
          net += netVal;
          vat += netVal * vatRate / 100;
        } catch (e) { }
      }
    });
    return { net: Math.round(net), vat: Math.round(vat) };
  };

  const calculateNetVAT = () => {
    const collected = sumAmounts(['1a', '1b', '1c', '3a', '3b']);
    const deductible = sumAmounts(['2a', '4a', '4b']);
    const net = collected.vat - deductible.vat;
    const formatted = (net >= 0 ? '' : '(') + `€${Math.abs(net).toLocaleString()}` + (net >= 0 ? '' : ')');
    return formatted;
  };

  const downloadPDF = async () => {
    const reportElement = reportRef.current;
    const summaryElement = summaryRef.current;

    if (!reportElement || !summaryElement) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;

    // --- Capture first section (excluding summary) ---
    await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, pageWidth, imgHeight);
    });

    // --- Add a new page for the summary ---
    pdf.addPage();

    await html2canvas(summaryElement, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, pageWidth, imgHeight);
    });

    pdf.save('VAT_Report.pdf');
  };


  const optimizationDetails = {
    "Centralize EU VAT Registrations": {
      bg: "#e7f0ff",
      title: "Centralize EU VAT Registrations",
      text: "Consolidate your VAT registrations across EU member states to simplify compliance and reduce administrative costs.",
      savings: "Potential savings: €12,500/year"
    },
    "Optimize Supply Chain": {
      bg: "#d4edda",
      title: "Optimize Supply Chain",
      text: "Restructure your supply chain to leverage reverse charge mechanisms and reduce VAT pre-financing costs.",
      savings: "Potential savings: €8,200/year"
    },
    "VAT Grouping Options": {
      bg: "#f8f9fa",
      title: "VAT Grouping Options",
      text: "Explore VAT grouping opportunities in countries where you have multiple entities to eliminate intra-group VAT charges.",
      savings: "Potential savings: €15,700/year"
    },
    "Pricing Strategy Review": {
      bg: "#fff3cd",
      title: "Pricing Strategy Review",
      text: "Adjust your pricing strategy across different EU member states to account for VAT rate differences and maximize margins.",
      savings: "Potential improvement: 3.2% margin increase"
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div style={styles.chartContainer}>
            <h4 className='h41'>Monthly VAT Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Domestic VAT" fill="#8884d8" />
                <Bar dataKey="Intra-EU VAT" fill="#82ca9d" />
                <Bar dataKey="Import VAT" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'Complex Scenarios':
        return (
          <div style={styles.chartRow}>
            <div style={styles.chartHalf}>
              <h4 className='h41'>Complex VAT Scenarios</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Triangulation" fill="#8884d8" />
                  <Bar dataKey="Reverse Charge" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.chartHalf}>
              <h4 className='h41'>VAT Distribution for Jan</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[{ name: 'Domestic VAT', value: totalVAT }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: 100%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'VAT Optimization':
        const selected = optimizationDetails[selectedStrategy];
        return (
          <div style={styles.chartContainer}>
            <h4 className='h41'>VAT Optimization Opportunities</h4>
            <p>Based on your current VAT position, we've identified the following optimization opportunities:</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {Object.keys(optimizationDetails).map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStrategy(opt)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    backgroundColor: selectedStrategy === opt ? '#d4edda' : '#fff',
                    fontWeight: selectedStrategy === opt ? 'bold' : 'normal'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div style={{ backgroundColor: selected.bg, padding: 20, marginTop: 20, borderRadius: 10 }}>
              <h5 style={{ fontSize: 18, fontWeight: 'bold' }}>{selected.title}</h5>
              <p style={{ color: '#333' }}>{selected.text}</p>
              <p style={{ fontWeight: 'bold' }}>{selected.savings}</p>
            </div>
          </div>
        );

      case 'VAT Return Filing':
        return (
          <div style={styles.chartContainer}>
            <h4 className='h41'>VAT Return Filing Assistant</h4>
            <p>Use our VAT Return Filing Assistant to prepare and submit your VAT return without an accountant.</p>
            <div style={{ display: 'flex', gap: 30, marginTop: 20 }}>
              <div style={{ flex: 1, backgroundColor: '#e7f0ff', padding: 20, borderRadius: 10 }}>
                <h5 style={{ color: '#004085' }}>Tax Return Format Report</h5>
                <p>View your VAT data organized according to the official tax return boxes, making it easy to fill in your return.</p>
                <button
                  onClick={() => {
                    const nextState = !showReport;
                    setShowReport(nextState);
                    setShowTutorial(false);
                    setShowInvoices(false);
                    if (nextState) fetchTransactions(false); // Only load if showing
                  }}
                  style={{ backgroundColor: '#0056b3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}
                >
                  {showReport ? 'Hide Report' : 'Show Report'}
                </button>
                <button
                  onClick={downloadPDF}
                  style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, marginLeft: 10 }}
                >
                  Download PDF
                </button>


              </div>
              <div style={{ flex: 1, backgroundColor: '#d4edda', padding: 20, borderRadius: 10 }}>
                <h5 style={{ color: '#155724' }}>Step-by-Step Tutorial</h5>
                <p>Follow our detailed guide to navigate the tax authority portal and successfully submit your VAT return.</p>
                <button
                  onClick={() => {
                    const nextState = !showTutorial;
                    setShowTutorial(nextState);
                    setShowInvoices(false);
                    setShowReport(false);
                    if (nextState) fetchTransactions(false); // Optional: preload if needed
                  }}
                  style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}
                >
                  {showTutorial ? 'Hide Tutorial' : 'Show Tutorial'}
                </button>



              </div>
            </div>

            {showReport && (
              <>
                {/* Main VAT Boxes Section (Page 1 of PDF) */}
                <div style={{ marginTop: 40 }} ref={reportRef}>
                  < h3 className='h31' style={{ marginBottom: 10 }}>VAT Analysis in Tax Return Format</h3>

                  {renderVATBoxSection('1a. Sales Taxed at the Standard Rate (21%)', transactions.filter(txn => txn.vat_category === '1a'))}
                  {renderVATBoxSection('1b. Sales Taxed at the Reduced Rate (9%)', transactions.filter(txn => txn.vat_category === '1b'))}
                  {renderVATBoxSection('1c. Sales Taxed at 0% (EU and Export)', transactions.filter(txn => txn.vat_category === '1c'))}
                  {renderVATBoxSection('2a. Reverse-Charge Supplies', transactions.filter(txn => txn.vat_category === '2a'))}
                  {renderVATBoxSection('3a. Supplies of Goods to EU Countries', transactions.filter(txn => txn.vat_category === '3a'))}
                  {renderVATBoxSection('3b. Supplies of Services to EU Countries', transactions.filter(txn => txn.vat_category === '3b'))}
                  {renderVATBoxSection('4a. Purchases of Goods from EU Countries', transactions.filter(txn => txn.vat_category === '4a'))}
                  {renderVATBoxSection('4b. Purchases of Services from EU Countries', transactions.filter(txn => txn.vat_category === '4b'))}
                </div>

                {/* Summary Section (Page 2 of PDF) */}
                <div ref={summaryRef} style={{ marginTop: 40 }}>
                  <h3 className='h31'>Summary</h3>
                  <table style={{ ...styles.table, fontWeight: 'bold' }}>
                    <tbody>
                      <tr>
                        <td>Total sales subject to the standard 21% VAT rate:</td>
                        <td>€{sumAmounts(['1a']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['1a']).vat.toLocaleString()}</td>
                        <td>Total sales subject to the reduced 9% VAT rate:</td>
                        <td>€{sumAmounts(['1b']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['1b']).vat.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Total zero-rated sales (EU and exports):</td>
                        <td>€{sumAmounts(['1c']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['1c']).vat.toLocaleString()}</td>
                        <td>Total reverse-charge supplies:</td>
                        <td>€{sumAmounts(['2a']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['2a']).vat.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Total intra-EU supplies of goods:</td>
                        <td>€{sumAmounts(['3a']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['3a']).vat.toLocaleString()}</td>
                        <td>Total intra-EU supplies of services:</td>
                        <td>€{sumAmounts(['3b']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['3b']).vat.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Total intra-EU acquisitions of goods:</td>
                        <td>€{sumAmounts(['4a']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['4a']).vat.toLocaleString()}</td>
                        <td>Total purchases of services from other EU countries:</td>
                        <td>€{sumAmounts(['4b']).net.toLocaleString()}</td>
                        <td>€{sumAmounts(['4b']).vat.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 className='h41' style={{ marginTop: 20, color: 'green' }}>
                    VAT Payable (VAT Collected - VAT Deductible): {calculateNetVAT()}
                  </h4>

                  <p style={{ fontStyle: 'italic', marginTop: 10, color: '#555' }}>
                    This VAT analysis ensures that all relevant transactions are properly identified, categorized, and reported
                    in the appropriate boxes of the Dutch VAT return. This will help the business comply with its VAT obligations and
                    minimize the risk of errors or non-compliance.
                  </p>
                </div>
              </>
            )}


            {showTutorial && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{
                  marginBottom: 30,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '28px',
                  color: '#212529'
                }}>
                  📘 Step-by-Step VAT Filing Tutorial
                </h2>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',                  // allows responsive resizing
                  maxWidth: '1200px',             // reduce this to limit width
                  margin: '0 auto',               // center it
                  padding: '0 20px 50px 20px',
                  backgroundColor: '#fff'
                }}>

                  {tutorialImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Step ${index + 1}`}
                      style={{
                        width: '100vw',
                        maxWidth: '100%',       // allow scaling
                        height: 'auto',
                        borderRadius: '0px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}



          </div >
        );

      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    const year = txnDate.getFullYear().toString();
    const month = txnDate.toLocaleString('default', { month: 'long' });

    const quarterMap = {
      'Q1': ['January', 'February', 'March'],
      'Q2': ['April', 'May', 'June'],
      'Q3': ['July', 'August', 'September'],
      'Q4': ['October', 'November', 'December']
    };

    return (
      (!selectedYear || year === selectedYear) &&
      (!selectedQuarter || quarterMap[selectedQuarter].includes(month)) &&
      (!selectedMonth || month === selectedMonth)
    );
  });


  return (

    <div style={styles.container}>
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>

      <h2 style={styles.heading}>Advanced VAT Analysis Dashboard</h2>

      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>📅 Select Year:</label>
        <select
          style={styles.select}
          value={pendingYear}
          onChange={(e) => setPendingYear(e.target.value)}
        >
          <option value="">Current Year</option>
          {[2023, 2024, 2025].map((yr) => (
            <option key={yr} value={yr.toString()}>{yr}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedYear(pendingYear);
            fetchChartData(pendingYear);
            fetchTransactions(false, pendingYear);
          }}
          style={{ marginLeft: 10, padding: '8px 12px', borderRadius: 6, backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Update
        </button>
      </div>



      <div style={styles.summaryRow}>
        <SummaryCard title="Total Transactions" value={`€${totalTransactions.toLocaleString()}`} />
        <SummaryCard title="Total VAT" value={`€${totalVAT.toLocaleString()}`} />
        <SummaryCard title="Domestic VAT" value={`€${totalVAT.toLocaleString()}`} />
      </div>

      <div style={styles.tabNav}>
        {['Overview', 'Complex Scenarios', 'VAT Optimization', 'VAT Return Filing'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowReport(false);
            }}
            style={{ ...styles.tab, borderBottom: activeTab === tab ? '2px solid blue' : 'none' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginBottom: 10 }}>
        <input type="file" multiple accept=".pdf" onChange={handleFileChange} />
        <button onClick={uploadFile} style={styles.uploadBtn}>Upload PDF</button>

        {/* START: Corrected Button and Spinner Group */}
        <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
          <button
            onClick={triggerVAT}
            style={{
              ...styles.processBtn,
              ...(isProcessing && styles.processingActiveBtn)
            }}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "VAT Processing"}
          </button>

          {/* The spinner is now inside the span, ensuring it stays with the button */}
          {isProcessing && <div style={styles.inlineSpinner}></div>}
        </span>
        {/* END: Corrected Button and Spinner Group */}

        <button
          onClick={() => {
            if (showInvoices) setShowInvoices(false);
            else {
              fetchTransactions();
              setShowInvoices(true);
              setShowReport(false);     // ✅ Already here
              setShowTutorial(false);   // ✅ 🔧 Add this line
            }
          }}
          style={styles.processBtn}
        >
          {showInvoices ? 'Hide Invoices' : 'Show Invoices'}
        </button>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {message && (
        <pre style={{
          color: '#28a745',
          fontWeight: 'bold',
          whiteSpace: 'pre-wrap',
          fontSize: '16px',          // 🔼 Adjust as needed
          lineHeight: '1.6',         // 🔼 Improves readability
          marginTop: '15px'
        }}>
          ✅ {message}
        </pre>
      )}


      {renderTabContent()}

      {showInvoices && (
        <div style={styles.tableContainer}>
          <h4 className='h41'>Extracted Transactions</h4>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <select style={styles.select} onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
              <option value="">All Years</option>
              {[...new Set(transactions.map(txn => new Date(txn.date).getFullYear().toString()))].map((year, idx) => (
                <option key={idx} value={year}>{year}</option>
              ))}
            </select>

            <select style={styles.select} onChange={(e) => setSelectedQuarter(e.target.value)} value={selectedQuarter}>
              <option value="">All Quarters</option>
              <option value="Q1">Q1 (Jan–Mar)</option>
              <option value="Q2">Q2 (Apr–Jun)</option>
              <option value="Q3">Q3 (Jul–Sep)</option>
              <option value="Q4">Q4 (Oct–Dec)</option>
            </select>

            <select style={styles.select} onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth}>
              <option value="">All Months</option>
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((month, idx) => (
                <option key={idx} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Invoice ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Amount (€)</th>
                <th style={styles.th}>VAT (€)</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Country</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{txn.invoice_no}</td>
                  <td style={styles.td}>{txn.date}</td>
                  <td style={styles.td}>{txn.description}</td>
                  <td style={styles.td}>{txn.amount_pre_vat}</td>
                  <td style={styles.td}>
                    {
                      (() => {
                        try {
                          const net = parseFloat(txn.amount_pre_vat.replace(',', '').replace('€', ''));
                          const rate = parseFloat(txn.vat_percentage?.replace('%', '') || '0');
                          return `€${(net * rate / 100).toFixed(2)}`;
                        } catch {
                          return '€0.00';
                        }
                      })()
                    }
                  </td>
                  <td style={styles.td}>{getVatCategoryLabel(txn.vat_category)}</td>
                  <td style={styles.td}>{txn.country || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}





    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div style={styles.card}>
    <h5 style={{ marginBottom: 5 }}>{title}</h5>
    <h3 className='h31' style={{color:'#000'}}>{value}</h3>
  </div>
);

const styles = {
  container: { padding: '30px', fontFamily: 'Segoe UI', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  heading: { textAlign: 'center', fontSize: 28, marginBottom: 20,color:'#000' },
  summaryRow: { display: 'flex', justifyContent: 'space-around', marginBottom: 30 },
  tabNav: { display: 'flex', gap: 20, borderBottom: '1px solid #ccc', paddingBottom: 10, marginBottom: 20 },
  tab: { background: 'none', border: 'none', fontSize: 16, padding: '8px 16px', cursor: 'pointer' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: 280, textAlign: 'center' },
  uploadBtn: { marginLeft: 10, padding: '8px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  processBtn: { marginLeft: 10, padding: '8px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  logoutBtn: { marginLeft: 10, padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  chartContainer: { marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  tableContainer: { marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  select: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    fontSize: '14px',
    color: '#333',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border 0.3s ease',
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 20 },
  th: { borderBottom: '1px solid #ccc', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
  td: { borderBottom: '1px solid #ddd', padding: '8px',color:"#000" },
  chartRow: { display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  chartHalf: { flex: 1 },
  inlineSpinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginLeft: '15px' // Adds space between the button and the spinner
  },

  // ADD THIS STYLE for the red, disabled button state
  processingActiveBtn: {
    backgroundColor: '#dc3545', // Red color
    cursor: 'not-allowed'     // Shows a "disabled" cursor on hover
  }
};

const renderVATBoxSection = (title, boxTransactions = []) => (
  <div style={{ marginBottom: 30 }}>
    <h4 className='h41' style={{ marginBottom: 10 }}>{title}</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Description</th>
          <th style={styles.th}>Net Amount (€)</th>
          <th style={styles.th}>VAT (%)</th>
          <th style={styles.th}>VAT (€)</th>
        </tr>
      </thead>
      <tbody>
        {boxTransactions.length > 0 ? (
          boxTransactions.map((txn, idx) => (
            <tr key={idx}>
              <td style={styles.td}>{txn.date}</td>
              <td style={styles.td}>{txn.description}</td>
              <td style={styles.td}>{txn.amount_pre_vat}</td>
              <td style={styles.td}>{txn.vat_percentage}</td>
              <td style={styles.td}>
                {
                  (() => {
                    try {
                      const net = parseFloat(txn.amount_pre_vat.replace(',', '').replace('€', ''));
                      const rate = parseFloat(txn.vat_percentage.replace('%', ''));
                      return `€${(net * rate / 100).toFixed(2)}`;
                    } catch {
                      return '€0.00';
                    }
                  })()
                }
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td style={styles.td} colSpan="5" align="center">🔸 No transactions available</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);


export default VAT;
