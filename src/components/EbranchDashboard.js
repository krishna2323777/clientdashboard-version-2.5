import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";
import "./EbranchDashboard.css";
import { 
  FaRegCalendarAlt, 
  FaBuilding, 
  FaArrowRight, 
  FaCheckCircle, 
  FaPlay, 
  FaRegBell, 
  FaRegFileAlt, 
  FaChartLine, 
  FaPercent, 
  FaDatabase 
} from 'react-icons/fa';

export default function EbranchDashboard() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Task data organized by category
  const tasks = {
    All: [
      {
        id: 1,
        title: "VAT Return Q1",
        priority: "high",
        dueDate: "4/15/2024",
        status: "overdue",
        category: "Tax",
        icon: <FaPercent />
      },
      {
        id: 2,
        title: "Annual Corporate Filing",
        priority: "medium",
        dueDate: "5/30/2024",
        status: "overdue",
        category: "Corporate",
        icon: <FaRegFileAlt />
      },
      {
        id: 3,
        title: "Financial Statement Submission",
        priority: "high",
        dueDate: "6/15/2024",
        status: "overdue",
        category: "Financial",
        icon: <FaChartLine />
      },
      {
        id: 4,
        title: "Update Director Information",
        priority: "low",
        dueDate: "4/10/2024",
        status: "overdue",
        category: "Corporate",
        icon: <FaRegFileAlt />
      }
    ],
    Corporate: [
      {
        id: 2,
        title: "Annual Corporate Filing",
        priority: "medium",
        dueDate: "5/30/2024",
        status: "overdue",
        category: "Corporate",
        icon: <FaRegFileAlt />
      },
      {
        id: 4,
        title: "Update Director Information",
        priority: "low",
        dueDate: "4/10/2024",
        status: "overdue",
        category: "Corporate",
        icon: <FaRegFileAlt />
      }
    ],
    Financial: [
      {
        id: 3,
        title: "Financial Statement Submission",
        priority: "high",
        dueDate: "6/15/2024",
        status: "overdue",
        category: "Financial",
        icon: <FaChartLine />
      }
    ],
    Tax: [
      {
        id: 1,
        title: "VAT Return Q1",
        priority: "high",
        dueDate: "4/15/2024",
        status: "overdue",
        category: "Tax",
        icon: <FaPercent />
      }
    ],
    Data: []
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // Fetch company information from Supabase
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch company info from company_info table
          const { data, error } = await supabase
            .from('company_info')
            .select('company_name, company_type, reg_number, status, target_market')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching company info:', error);
          } else {
            setCompanyInfo(data);
          }
        }
      } catch (error) {
        console.error('Error in fetchCompanyInfo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleQuickAccessClick = (hub) => {
    switch(hub) {
      case 'corporate':
        navigate('/corporate-hub');
        break;
      case 'financial':
        navigate('/financial-hub');
        break;
      case 'tax':
        navigate('/comprehensive-tax-dashboard');
        break;
      case 'data':
        navigate('/dataroom');
        break;
      default:
        break;
    }
  };

  const renderTask = (task) => (
    <div key={task.id} className={`dashboard-task ${task.priority}`}>
      <div className="task-icon">{task.icon}</div>
      <div className="task-info">
        <div className="task-title">{task.title}</div>
        <div className={`task-meta ${task.priority}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority • Due {task.dueDate}
        </div>
      </div>
      <div className={`task-status ${task.status}`}>Overdue</div>
      <button className="task-action"><FaArrowRight /></button>
    </div>
  );

  return (
    <div className="ebranch-dashboard-container">
      <header className="ebranch-header">
        <div className="ebranch-header-content">
          <h1 className="ebranch-title">
            Welcome to your <span className="ebranch-title-accent">eBranch Services</span>
          </h1>
          <div className="ebranch-title-underline"></div>
          <div className="ebranch-subtitle">Tech Innovations Ltd • Virtual Office • Netherlands</div>
        </div>
        <div className="dashboard-status-cards">
          <div className="status-card profile">Profile<br/><span>65%</span></div>
          <div className="status-card compliance">Compliance<br/><span>87%</span></div>
          <div className="status-card trial">Trial<br/><span>10 days</span></div>
        </div>
      </header>
      <div className="dashboard-main">
        <div className="dashboard-left">
          <section className="dashboard-card calendar">
            <div className="dashboard-card-header">
              <FaRegCalendarAlt className="dashboard-icon" /> Unified Compliance Calendar
              <div className="dashboard-card-tabs">
                <button 
                  className={activeFilter === 'All' ? 'active' : ''} 
                  onClick={() => handleFilterClick('All')}
                >
                  All
                </button>
                <button 
                  className={activeFilter === 'Corporate' ? 'active' : ''} 
                  onClick={() => handleFilterClick('Corporate')}
                >
                  Corporate
                </button>
                <button 
                  className={activeFilter === 'Financial' ? 'active' : ''} 
                  onClick={() => handleFilterClick('Financial')}
                >
                  Financial
                </button>
                <button 
                  className={activeFilter === 'Tax' ? 'active' : ''} 
                  onClick={() => handleFilterClick('Tax')}
                >
                  Tax
                </button>
                <button 
                  className={activeFilter === 'Data' ? 'active' : ''} 
                  onClick={() => handleFilterClick('Data')}
                >
                  Data
                </button>
              </div>
            </div>
            <div className="dashboard-task-list">
              {tasks[activeFilter].length > 0 ? (
                tasks[activeFilter].map(renderTask)
              ) : (
                <div className="no-tasks-message">
                  No tasks found for {activeFilter} category
                </div>
              )}
            </div>
            <button className="dashboard-view-all">View All Tasks</button>
          </section>
          <section className="dashboard-card recommended">
            <div className="dashboard-card-header">
              <FaPlay className="dashboard-icon" /> Recommended Applications
              <button className="dashboard-refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            <div className="dashboard-app-list">
              <div className="dashboard-app">
                <div className="app-icon"><FaPercent /></div>
                <div className="app-info">
                  <div className="app-title">VAT Registration</div>
                  <div className="app-meta">Register for VAT in the Netherlands</div>
                  <div className="app-tags"><span>Tax</span> <span>Medium</span></div>
                </div>
                <button className="app-launch"><FaPlay /></button>
              </div>
              <div className="dashboard-app">
                <div className="app-icon"><FaBuilding /></div>
                <div className="app-info">
                  <div className="app-title">Branch Office Setup</div>
                  <div className="app-meta">Establish your Dutch branch office</div>
                  <div className="app-tags"><span>Corporate</span> <span>Complex</span></div>
                </div>
                <button className="app-launch"><FaPlay /></button>
              </div>
              <div className="dashboard-app">
                <div className="app-icon"><FaChartLine /></div>
                <div className="app-info">
                  <div className="app-title">Business Banking</div>
                  <div className="app-meta">Open a Dutch business bank account</div>
                  <div className="app-tags"><span>Financial</span> <span>Medium</span></div>
                </div>
                <button className="app-launch"><FaPlay /></button>
              </div>
            </div>
            <button className="dashboard-new-app">+ Start New Application</button>
            <button className="dashboard-view-all">View All Applications</button>
          </section>
        </div>
        <div className="dashboard-right">
          <section className="dashboard-card profile">
            <div className="dashboard-card-header"><FaBuilding className="dashboard-icon" /> Company Profile <button className="dashboard-view-profile">View Full Profile</button></div>
            <div className="profile-details">
              {loading ? (
                <div className="profile-loading">Loading company information...</div>
              ) : companyInfo ? (
                <>
                  <div className="profile-row">
                    <span>Company Name</span> 
                    <span>{companyInfo.company_name || 'Not specified'}</span>
                  </div>
                  <div className="profile-row">
                    <span>Company Type</span> 
                    <span>{companyInfo.company_type || 'Not specified'}</span>
                  </div>
                  <div className="profile-row">
                    <span>Registration</span> 
                    <span>{companyInfo.reg_number || 'Not specified'}</span>
                  </div>
                  <div className="profile-row">
                    <span>Target Market</span> 
                    <span>{companyInfo.target_market || 'Not specified'}</span>
                  </div>
                  <div className="profile-row">
                    <span>Status</span> 
                    <span className="profile-status">{companyInfo.status || 'Not specified'}</span>
                  </div>
                </>
              ) : (
                <div className="profile-error">No company information found</div>
              )}
            </div>
            <button className="dashboard-upgrade">Upgrade Market Presence →</button>
          </section>
          <section className="dashboard-card activity">
            <div className="dashboard-card-header"><FaRegBell className="dashboard-icon" /> Activity Feed</div>
            <div className="activity-list">
              <div className="activity-item"><FaRegFileAlt className="activity-icon" /> <span>Corporate Extract</span> <span className="activity-time">Received • 2 hours ago</span></div>
              <div className="activity-item"><FaCheckCircle className="activity-icon" style={{color:'#10B981'}} /> <span>VAT Registration</span> <span className="activity-time">Approved • 1 day ago</span></div>
              <div className="activity-item"><FaRegFileAlt className="activity-icon" /> <span>Official Correspondence</span> <span className="activity-time">Received • 3 days ago</span></div>
            </div>
            <button className="dashboard-view-all">View All Activity</button>
          </section>
          <section className="dashboard-card quick-access">
            <div className="dashboard-card-header"><FaArrowRight className="dashboard-icon" /> Quick Access</div>
            <div className="quick-access-grid">
              <button 
                className="quick-access-btn" 
                onClick={() => handleQuickAccessClick('corporate')}
              >
                <FaBuilding /> Corporate Hub
              </button>
              <button 
                className="quick-access-btn" 
                onClick={() => handleQuickAccessClick('financial')}
              >
                <FaChartLine /> Financial Hub
              </button>
              <button 
                className="quick-access-btn" 
                onClick={() => handleQuickAccessClick('tax')}
              >
                <FaPercent /> Tax Hub
              </button>
              <button 
                className="quick-access-btn" 
                onClick={() => handleQuickAccessClick('data')}
              >
                <FaDatabase /> Data Hub
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
