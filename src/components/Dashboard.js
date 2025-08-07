import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // adjust path if needed
import { FaPlay, FaBuilding, FaChartLine, FaPercent, FaDatabase } from 'react-icons/fa';

const getDisplayValue = (value, defaultText = "Not set") => {
  if (value === null || value === undefined || value === "") {
    return defaultText;
  }
  
  // Handle numbers
  if (typeof value === 'number') {
    return value;
  }
  
  // Handle strings
  if (typeof value === 'string') {
    return value.trim() || defaultText;
  }
  
  // Return the value as is for other types
  return value;
};

const globalOffices = [
  {
    city: "Bengaluru",
    country: "India",
    companyName: "Tech Innovations Ltd",
    address: "123 Tech Park, Electronic City",
    phone: "+91 80 1234 5678",
    email: "info@techinnovations.in",
    image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=600&auto=format&fit=crop",
    badge: { text: "Headquarters", type: "headquarters" }
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    companyName: "Dutch Ventures BV",
    address: "456 Herengracht, 1017 CB",
    phone: "+31 20 123 4567",
    email: "contact@dutchventures.nl",
    image: "https://images.unsplash.com/photo-1576924542622-772281b13aa8?q=80&w=600&auto=format&fit=crop",
    badge: { text: "Branch Office", type: "branch" }
  },
  {
    city: "Berlin",
    country: "Germany",
    companyName: "Deutsche Solutions GmbH",
    address: "789 Unter den Linden, 10117",
    phone: "+49 30 1234 5678",
    email: "info@deutschesolutions.de",
    image: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=600&auto=format&fit=crop",
    badge: { text: "Tax ID", type: "tax" }
  },
  {
    city: "Paris",
    country: "France",
    companyName: "Paris Innovations SAS",
    address: "321 Champs-Élysées, 75008",
    phone: "+33 1 42 12 34 56",
    email: "contact@parisinnovations.fr",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop",
    badge: { text: "Virtual Office", type: "virtual" }
  },
  {
    city: "Madrid",
    country: "Spain",
    companyName: "Madrid Enterprises SL",
    address: "654 Gran Vía, 28013",
    phone: "+34 91 123 45 67",
    email: "info@madridenterprises.es",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=600&auto=format&fit=crop",
    badge: { text: "Legal Entity", type: "legal" }
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showAlert, setShowAlert] = useState(true);
  const [userName, setUserName] = useState('');
  const [showDataNotification, setShowDataNotification] = useState(false);
  const [showComplianceNotification, setShowComplianceNotification] = useState(true);
  const [calendarBanner, setCalendarBanner] = useState(null);

  // --- Add these states for rotating banners ---
  const [calendarBanners, setCalendarBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCompany({
            company_name: "Not set",
            company_type: "Not set",
            base_location: "Not set",
            status: "Inactive",
            subsidiaries_count: 0,
            reg_number: "Not set",
            vat_number: "Not set",
            registered_address: "Not set",
            incorporation_date: "Not set"
          });
          return;
        }

        // Fetch user profile to get the name
        const { data: userProfile, error: userError } = await supabase
          .from("user_profiles")
          .select("name")
          .eq("user_id", user.id)
          .single();

        if (!userError && userProfile?.name) {
          setUserName(userProfile.name);
        }

        const { data, error } = await supabase
          .from("company_info")
          .select(`
            *,
            reg_number,
            incorporation_date,
            vat_number,
            registered_address
          `)
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching company data:", error);
          setCompany({
            company_name: "Not set",
            company_type: "Not set",
            base_location: "Not set",
            status: "Inactive",
            subsidiaries_count: 0,
            reg_number: "Not set",
            vat_number: "Not set",
            registered_address: "Not set",
            incorporation_date: "Not set"
          });
          return;
        }

        setCompany(data || {
          company_name: "Not set",
          company_type: "Not set",
          base_location: "Not set",
          status: "Inactive",
          subsidiaries_count: 0,
          reg_number: "Not set",
          vat_number: "Not set",
          registered_address: "Not set",
          incorporation_date: "Not set"
        });
      } catch (err) {
        console.error("Error:", err);
      }
    };

    // --- Fetch all banners instead of just one ---
    const fetchCalendarBanners = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;

        const { data, error } = await supabase
          .from("calendar")
          .select("title, description, due_date")
          .eq("user_id", sessionData.session.user.id)
          .order("due_date", { ascending: true });

        if (!error && data && data.length > 0) {
          setCalendarBanners(data);
          setCalendarBanner(data[0]); // Show the first one initially
        }
      } catch (err) {
        // Optionally handle error
      }
    };

    fetchCompany();
    fetchCalendarBanners();
  }, []);

  // --- Animation: rotate banners every 4 seconds ---
  useEffect(() => {
    if (calendarBanners.length <= 1) return;
    setCalendarBanner(calendarBanners[currentBannerIndex]);
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % calendarBanners.length);
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [calendarBanners, currentBannerIndex]);

  if (!company) return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Calendar Alert Banner (from Supabase) */}
      <div className="dashboard-header">
        <div className="welcome-section" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
          <h1 className="welcome-title">Welcome back{userName ? `, ${userName}` : ''}</h1>
        </div>
        <button className="ai-assistant-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2"/>
            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2"/>
            <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 2 2 2 2-1 2-2"/>
            <path d="M12 21c0-1 1-2 2-2s2-1 2-2-1-2-2-2-2 1-2 2"/>
          </svg>
          AI Assistant
        </button>
      </div>
      {calendarBanner && (
        <div className="compliance-notification-banner">
          <div className="compliance-notification-content">
            <div className="compliance-notification-left">
              <div className="compliance-notification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div className="compliance-notification-text">
                <div className="compliance-notification-title">{calendarBanner.title}</div>
                <div className="compliance-notification-subtitle">{calendarBanner.description}</div>
              </div>
            </div>
            <div className="compliance-notification-right">
              <button
                className="compliance-notification-action"
                onClick={() => navigate('/calendar')}
                title="Go to Calendar"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <polyline
                    points="10 7 18 14 10 21"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      

     
     
     
      <div className="global-presence-section">
        <div className="section-header">
          <div className="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
                  </svg>
            Global Presence
              </div>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              Map View
            </button>
          </div>
          </div>
          
        <div className="office-cards-grid">
          {globalOffices.map((office, index) => (
            <div className="office-card" key={index}>
              <div className="card-image-container">
                <img src={office.image} alt={office.city} className="card-image" />
                <div className={`office-badge ${office.badge.type}`}>
                  {office.badge.text}
                </div>
              </div>
              <div className="card-content">
                <div className="office-header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="building-icon">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                    <path d="M9 22v-4h6v4"/>
                    <path d="M8 6h.01"/>
                    <path d="M16 6h.01"/>
                    <path d="M12 6h.01"/>
                    <path d="M12 10h.01"/>
                    <path d="M12 14h.01"/>
                    <path d="M16 10h.01"/>
                    <path d="M16 14h.01"/>
                    <path d="M8 10h.01"/>
                    <path d="M8 14h.01"/>
                  </svg>
                  <div className="office-location">
                    <h3 className="city-name">{office.city}</h3>
                    <p className="country-name">{office.country}</p>
                  </div>
                </div>
                <div className="company-info">
                  <p className="company-name">{office.companyName}</p>
                </div>
                <div className="contact-info">
                  <div className="contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{office.address}</span>
                  </div>
                  <div className="contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{office.phone}</span>
                </div>
                  <div className="contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{office.email}</span>
                  </div>
                </div>
                <button className="view-details-btn">
                  View more details
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Hubs Section */}
      <div className="navigation-hubs-section">
        <h2 className="navigation-hubs-title">Navigation Hubs</h2>
        <div className="navigation-hubs-container">
          <button className="navigation-hub-btn application" onClick={() => navigate('/ebranch')}>
            <div className="hub-icon">
              <FaPlay />
            </div>
            <span className="hub-label">eBranch</span>
          </button>
          <button className="navigation-hub-btn corporate" onClick={() => navigate('/corporate-hub')}>
            <div className="hub-icon">
              <FaBuilding />
            </div>
            <span className="hub-label">Corporate</span>
          </button>
          <button className="navigation-hub-btn financial" onClick={() => navigate('/financial-hub')}>
            <div className="hub-icon">
              <FaChartLine />
            </div>
            <span className="hub-label">Financial</span>
          </button>
          <button className="navigation-hub-btn tax" onClick={() => navigate('/comprehensive-tax-dashboard')}>
            <div className="hub-icon">
              <FaPercent />
            </div>
            <span className="hub-label">Tax</span>
          </button>
          <button className="navigation-hub-btn data" onClick={() => {
            setShowDataNotification(true);
            navigate('/dataroom');
          }}>
            <div className="hub-icon">
              <FaDatabase />
              {showDataNotification && (
                <div className="notification-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              )}
            </div>
            <span className="hub-label">Data</span>
          </button>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="background-decoration">
        <div className="wave-pattern"></div>
        <div className="birds-decoration">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 7h.01"/>
            <path d="M4 21l3.5-3.5"/>
            <path d="M21 16v-6h2l-2-4-2 4h2z"/>
            <path d="M4 16l4-4 4 4"/>
            <path d="M12 7l4-4 4 4"/>
            <path d="M12 7v10"/>
          </svg>
          </div>
      </div>
    </div>
  );
}