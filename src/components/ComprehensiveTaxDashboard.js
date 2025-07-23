import React from 'react';
import { FaFileInvoice, FaCalculator, FaGlobe, FaComments, FaArrowRight, FaStar, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    icon: <FaFileInvoice size={32} color="#16a34a" />,
    badge: 'Premium',
    title: 'Prepare VAT Return',
    description: 'Prepare and file your VAT return with automated calculations and real-time compliance checking',
    grade: 'Professional Grade',
    onClick: navigate => navigate('/vat-analysis'),
    badgeColor: '#e0e7ff',
    badgeTextColor: '#7c3aed',
    featured: false,
  },
  {
    icon: <FaFileInvoice size={32} color="#2563eb" />,
    badge: 'Featured',
    title: 'Prepare Corporate Income Tax',
    description: 'Prepare and file your corporate income tax return with guided workflow and expert CPA analysis',
    grade: 'Professional Grade',
    onClick: navigate => navigate('/corporate-income-tax'),
    badgeColor: '#dbeafe',
    badgeTextColor: '#2563eb',
    featured: true,
  },
  {
    icon: <FaCalculator size={32} color="#a21caf" />,
    badge: 'Premium',
    title: 'Tax Calculators',
    description: 'Access tax calculators for various tax types with professional-grade computation tools',
    grade: 'Professional Grade',
    onClick: navigate => {},
    badgeColor: '#f3e8ff',
    badgeTextColor: '#a21caf',
    featured: false,
    comingSoon: true,
  },
  {
    icon: <FaGlobe size={32} color="#0284c7" />,
    badge: 'Premium',
    title: 'International Tax Planner',
    description: 'Plan your international tax strategy with cross-border optimization solutions',
    grade: 'Professional Grade',
    onClick: navigate => {},
    badgeColor: '#bae6fd',
    badgeTextColor: '#0284c7',
    featured: false,
    comingSoon: true,
  },
  {
    icon: <FaComments size={32} color="#f43f5e" />,
    badge: 'Premium',
    title: 'Custom Flow',
    description: 'Create custom documents and requests with AI assistance for specialized tax needs',
    grade: 'Professional Grade',
    onClick: navigate => {},
    badgeColor: '#fee2e2',
    badgeTextColor: '#f43f5e',
    featured: false,
    comingSoon: true,
  },
];

const ComprehensiveTaxDashboard = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      background: '#220938',
      color: '#fff',
      padding: '0 0 48px 0',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 16px 0 16px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#220938', color: '#3b82f6', borderRadius: 999, padding: '6px 22px', fontWeight: 700, fontSize: 16, marginBottom: 18, letterSpacing: 0.5, border: '2px solid #3b82f6' }}>
          <FaStar style={{ marginRight: 8, color: '#3b82f6', verticalAlign: 'middle' }} /> PROFESSIONAL TAX SERVICES
        </div>
        <div style={{ fontWeight: 900, fontSize: 44, color: '#fff', margin: '0 0 12px 0', lineHeight: 1.1 }}>
          Comprehensive Tax Management
        </div>
        <div style={{ color: '#e0e7ff', fontSize: 20, margin: '0 0 38px 0', fontWeight: 500, lineHeight: 1.5 }}>
          Access our full suite of professional tax services designed for businesses and tax professionals
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 32,
          justifyContent: 'center',
          margin: '0 auto',
          maxWidth: 950,
        }}>
          {cards.map((card, idx) => (
            <div key={card.title} style={{
              background: '#220938',
              borderRadius: 18,
              boxShadow: '0 2px 16px rgba(30, 34, 90, 0.18)',
              padding: '32px 28px 28px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              position: 'relative',
              border: '2px solid #60a5fa',
              minHeight: 320,
              color: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                {card.icon}
                <span style={{
                  background: '#23244d',
                  color: '#3b82f6',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '2px 12px',
                  marginLeft: 14,
                  letterSpacing: 0.2,
                  border: '1px solid #3b82f6',
                }}>{card.badge}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 6 }}>{card.title}</div>
              <div style={{ color: '#e0e7ff', fontSize: 16, marginBottom: 18, minHeight: 48 }}>{card.description}</div>
              <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>{card.grade}</div>
              {card.comingSoon ? (
                <div style={{
                  color: '#f43f5e',
                  fontWeight: 600,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                }}>
                  <FaLock style={{ fontSize: 36, marginBottom: 8 }} />
                  Coming Soon
                </div>
              ) : (
                <button
                  style={{
                    marginTop: 'auto',
                    background: 'rgb(234 58 112 / var(--tw-bg-opacity, 1))',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 17,
                    border: '2px solid rgb(234 58 112 / var(--tw-bg-opacity, 1))',
                    borderRadius: 8,
                    padding: '12px 28px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 16px rgba(234,58,112,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'background 0.2s',
                    borderBottom: '3px solid #e23a70',
                  }}
                  onClick={() => card.onClick(navigate)}
                >
                  Get Started <FaArrowRight style={{ fontSize: 18 }} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTaxDashboard; 