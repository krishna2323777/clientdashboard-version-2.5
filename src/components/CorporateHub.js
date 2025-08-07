import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEuroSign, FaBuilding, FaCheckCircle, FaShieldAlt, FaFileAlt, FaStar, FaLock } from 'react-icons/fa';
import './CorporateHub.css';

const CorporateHub = () => {
  const navigate = useNavigate();
  const [expandedVatInfo, setExpandedVatInfo] = useState(false);

  const corporateServices = [
    {
      id: 'vat-id-application',
      title: 'VAT ID Application',
      description: 'Register for VAT number in target market',
      icon: <FaEuroSign size={24} />,
      iconColor: '#22c55e',
      badge: 'Featured',
      badgeColor: '#3b82f6',
      grade: 'Professional Grade',
      onClick: () => navigate('/vat-requirement'), // <-- updated route
      available: true,
      comingSoon: false
    },
    {
      id: 'branch-registration',
      title: 'Branch Registration',
      description: 'Establish your branch office in target market',
      icon: <FaBuilding size={24} />,
      iconColor: '#3b82f6',
      badge: 'Premium',
      badgeColor: '#3b82f6',
      grade: 'Professional Grade',
      onClick: () => navigate('/branch-registration'),
      available: true,
      comingSoon: false
    },
    {
      id: 'dutch-bv-registration',
      title: 'Dutch BV Registration',
      description: 'Register a Dutch private limited company',
      icon: <FaBuilding size={24} />,
      iconColor: '#a855f7',
      badge: 'Premium',
      badgeColor: '#3b82f6',
      grade: 'Professional Grade',
      onClick: () => alert('Coming Soon! This feature is under development.'),
      available: false,
      comingSoon: true
    },
    {
      id: 'employer-registration',
      title: 'Employer Registration',
      description: 'Register as an employer in target market',
      icon: <FaCheckCircle size={24} />,
      iconColor: '#f59e0b',
      badge: 'Premium',
      badgeColor: '#3b82f6',
      grade: 'Professional Grade',
      onClick: () => alert('Coming Soon! This feature is under development.'),
      available: false,
      comingSoon: true
    },
    {
      id: 'kyc-documentation',
      title: 'KYC Documentation',
      description: 'Upload corporate and personal KYC documents',
      icon: <FaShieldAlt size={24} />,
      iconColor: '#ef4444',
      badge: 'Featured',
      badgeColor: '#3b82f6',
      grade: 'Professional Grade',
      onClick: () => navigate('/documents'),
      available: true,
      comingSoon: false
    },
    {
      id: 'custom-document-generator',
      title: 'Custom Document Generator',
      description: 'Create corporate documents with AI assistance',
      icon: <FaFileAlt size={24} />,
      iconColor: '#10b981',
      badge: 'Premium',
      badgeColor: '#3b82f6',
      grade: 'Professional Grade',
      onClick: () => alert('Coming Soon! This feature is under development.'),
      available: false,
      comingSoon: true
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#220938',
      color: '#fff',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      padding: '48px 16px',
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        {/* Header Badge */}
        <div style={{ 
          display: 'inline-block', 
          background: 'transparent', 
          color: '#3b82f6', 
          borderRadius: 999, 
          padding: '6px 22px', 
          fontWeight: 700, 
          fontSize: 16, 
          marginBottom: 18, 
          letterSpacing: 0.5, 
          border: '2px solid #3b82f6' 
        }}>
          <FaStar style={{ marginRight: 8, color: '#3b82f6', verticalAlign: 'middle' }} /> 
          PROFESSIONAL CORPORATE SERVICES
        </div>

        {/* Main Title */}
        <div style={{ 
          fontWeight: 900, 
          fontSize: 44, 
          color: '#fff', 
          margin: '0 0 12px 0', 
          lineHeight: 1.1 
        }}>
          Comprehensive Corporate Management
        </div>

        {/* Subtitle */}
        <div style={{ 
          color: '#e0e7ff', 
          fontSize: 20, 
          margin: '0 0 48px 0', 
          fontWeight: 500, 
          lineHeight: 1.5 
        }}>
          Access our full suite of professional corporate services designed for businesses and legal professionals
        </div>

        {/* Service Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '32px', 
          marginTop: '48px',
          maxWidth: '1200px',
          margin: '48px auto 0 auto'
        }}>
          {corporateServices.map((service) => (
            <div
              key={service.id}
              style={{
                background: 'rgba(45, 53, 97, 0.6)',
                borderRadius: '20px',
                padding: '32px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                position: 'relative',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: service.available && !service.comingSoon ? 'pointer' : 'default',
                opacity: service.comingSoon ? 0.7 : 1
              }}
              onClick={service.available && !service.comingSoon ? service.onClick : undefined}
              onMouseEnter={(e) => {
                if (service.available && !service.comingSoon) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (service.available && !service.comingSoon) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Icon and Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ 
                  color: service.iconColor, 
                  fontSize: '1.5rem' 
                }}>
                  {service.icon}
                </div>
                <div style={{
                  background: service.badgeColor,
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {service.badge}
                </div>
              </div>

              {/* Title */}
              <h3 style={{
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 0 16px 0',
                lineHeight: 1.2
              }}>
                {service.title}
              </h3>

              {/* Description */}
              <p style={{
                color: '#e0e7ff',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 20px 0',
                flex: 1
              }}>
                {service.description}
              </p>

              {/* Who Needs to Register Section */}
              {service.id === 'vat-id-application' && (
                <div style={{
                  background: '#1a1b36',
                  border: '1px solid #2e2f50',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedVatInfo(!expandedVatInfo);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#232448';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2e2f50';
                  e.currentTarget.style.background = '#1a1b36';
                }}
                >
                  <div style={{
                    color: '#3b82f6',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: expandedVatInfo ? '12px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📋</span>
                      Who Needs to Register?
                    </div>
                    <div style={{
                      transform: expandedVatInfo ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      fontSize: '1.2rem',
                      color: '#3b82f6'
                    }}>
                      ▼
                    </div>
                  </div>
                  {expandedVatInfo && (
                    <div style={{
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      animation: 'fadeIn 0.3s ease',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #2e2f50'
                    }}>
                      <div style={{
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: '#3b82f6'
                      }}>
                        You must register for VAT if:
                      </div>
                      <ul style={{
                        margin: '8px 0 0 16px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        listStyle: 'none'
                      }}>
                        <li style={{ 
                          marginBottom: '6px',
                          paddingLeft: '16px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: '#22c55e',
                            fontWeight: 'bold'
                          }}>•</span>
                          You provide goods/services as a business within the Netherlands
                        </li>
                        <li style={{ 
                          marginBottom: '6px',
                          paddingLeft: '16px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: '#22c55e',
                            fontWeight: 'bold'
                          }}>•</span>
                          You are a foreign entrepreneur with taxable activities in NL
                        </li>
                        <li style={{ 
                          marginBottom: '6px',
                          paddingLeft: '16px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: '#22c55e',
                            fontWeight: 'bold'
                          }}>•</span>
                          You open a Dutch branch, subsidiary, or representative office
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Grade for other services */}
              {service.id !== 'vat-id-application' && (
                <div style={{
                  color: '#3b82f6',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '24px'
                }}>
                  {service.grade}
                </div>
              )}

              {/* Action Button or Coming Soon */}
              {service.comingSoon ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '2rem', 
                    marginBottom: '8px' 
                  }}>
                    <FaLock />
                  </div>
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '1.1rem', 
                    fontWeight: 600 
                  }}>
                    Coming Soon
                  </div>
                </div>
              ) : (
                <button 
                  style={{
                    background: '#ef4a7b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(239, 74, 123, 0.10)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    service.onClick();
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(239, 74, 123, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(239, 74, 123, 0.10)';
                  }}
                >
                  Get Started →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CorporateHub;