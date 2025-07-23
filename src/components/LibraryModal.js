import React, { useState } from 'react';
import './LibraryModal.css';

const categories = [
  'Business Formation & Registration',
  'Tax & Financial Compliance',
  'Banking & Finance',
  'Regulatory Compliance',
  'Industry-Specific Guides',
  'Human Resources',
  'Business Operations',
  'Immigration & Work Permits',
  'Business Expansion',
  'Accounting & Auditing',
  'Business Exit & Restructuring',
  'Digital Business',
];

const defaultImg = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80';

const categoryCards = {
  'Business Formation & Registration': [
    {
      image: defaultImg,
      title: 'Setting Up a BV: Step-by-Step Process',
      description: 'Everything you need to know about establishing a Dutch BV (private limited company), from initial registration to operational readiness.',
      link: '#',
      tags: ['Company Formation', 'BV', 'Registration'],
      readTime: '10 min read',
    },
    {
      image: defaultImg,
      title: 'Dutch BV vs. NV: Key Differences',
      description: 'Compare the Dutch BV and NV company types to choose the right structure for your business.',
      link: '#',
      tags: ['Company Formation', 'BV', 'NV'],
      readTime: '8 min read',
    },
  ],
  'Tax & Financial Compliance': [
    {
      image: defaultImg,
      title: 'Dutch Corporate Tax Essentials',
      description: 'Understand the basics of Dutch corporate tax and compliance requirements.',
      link: '#',
      tags: ['Tax', 'Corporate Tax'],
      readTime: '7 min read',
    },
    {
      image: defaultImg,
      title: 'VAT Registration in the Netherlands',
      description: 'Step-by-step guide to VAT registration for Dutch businesses.',
      link: '#',
      tags: ['VAT', 'Tax'],
      readTime: '6 min read',
    },
    {
      image: defaultImg,
      title: 'Annual Financial Statements',
      description: 'How to prepare and file annual financial statements in the Netherlands.',
      link: '#',
      tags: ['Financial Statements', 'Compliance'],
      readTime: '9 min read',
    },
  ],
  'Banking & Finance': [
    {
      image: defaultImg,
      title: 'Opening a Dutch Business Bank Account',
      description: 'A guide to opening and managing a business bank account in the Netherlands.',
      link: '#',
      tags: ['Banking', 'Finance'],
      readTime: '5 min read',
    },
    {
      image: defaultImg,
      title: 'Financing Options for Startups',
      description: 'Explore financing options for new businesses in the Netherlands.',
      link: '#',
      tags: ['Finance', 'Startup'],
      readTime: '7 min read',
    },
  ],
  'Regulatory Compliance': [
    {
      image: defaultImg,
      title: 'Dutch Regulatory Overview',
      description: 'Key regulations every Dutch business must know.',
      link: '#',
      tags: ['Regulation', 'Compliance'],
      readTime: '6 min read',
    },
    {
      image: defaultImg,
      title: 'GDPR for Dutch Companies',
      description: 'How GDPR affects your business in the Netherlands.',
      link: '#',
      tags: ['GDPR', 'Compliance'],
      readTime: '8 min read',
    },
  ],
  'Industry-Specific Guides': [
    {
      image: defaultImg,
      title: 'Tech Industry Compliance',
      description: 'Compliance essentials for tech companies in the Netherlands.',
      link: '#',
      tags: ['Tech', 'Compliance'],
      readTime: '7 min read',
    },
    {
      image: defaultImg,
      title: 'Healthcare Sector Regulations',
      description: 'A guide to regulations in the Dutch healthcare sector.',
      link: '#',
      tags: ['Healthcare', 'Regulation'],
      readTime: '9 min read',
    },
  ],
  'Human Resources': [
    {
      image: defaultImg,
      title: 'Dutch Employment Law Basics',
      description: 'What you need to know about employment law in the Netherlands.',
      link: '#',
      tags: ['HR', 'Employment Law'],
      readTime: '8 min read',
    },
    {
      image: defaultImg,
      title: 'Hiring International Talent',
      description: 'How to hire and onboard international employees.',
      link: '#',
      tags: ['HR', 'Hiring'],
      readTime: '7 min read',
    },
  ],
  'Business Operations': [
    {
      image: defaultImg,
      title: 'Optimizing Dutch Business Operations',
      description: 'Tips for streamlining your business operations in the Netherlands.',
      link: '#',
      tags: ['Operations', 'Optimization'],
      readTime: '6 min read',
    },
    {
      image: defaultImg,
      title: 'Supply Chain Management',
      description: 'Managing supply chains for Dutch businesses.',
      link: '#',
      tags: ['Supply Chain', 'Operations'],
      readTime: '8 min read',
    },
  ],
  'Immigration & Work Permits': [
    {
      image: defaultImg,
      title: 'Dutch Work Permits Explained',
      description: 'A guide to work permits for foreign employees in the Netherlands.',
      link: '#',
      tags: ['Immigration', 'Work Permit'],
      readTime: '7 min read',
    },
    {
      image: defaultImg,
      title: 'Residence Permits for Entrepreneurs',
      description: 'How to obtain a residence permit as a business owner.',
      link: '#',
      tags: ['Immigration', 'Entrepreneur'],
      readTime: '8 min read',
    },
  ],
  'Business Expansion': [
    {
      image: defaultImg,
      title: 'Expanding Your Business to the EU',
      description: 'Steps to expand your Dutch business into the European Union.',
      link: '#',
      tags: ['Expansion', 'EU'],
      readTime: '9 min read',
    },
    {
      image: defaultImg,
      title: 'Cross-Border Mergers',
      description: 'Legal and financial aspects of cross-border mergers.',
      link: '#',
      tags: ['Expansion', 'Mergers'],
      readTime: '10 min read',
    },
  ],
  'Accounting & Auditing': [
    {
      image: defaultImg,
      title: 'Dutch Accounting Standards',
      description: 'Overview of accounting standards in the Netherlands.',
      link: '#',
      tags: ['Accounting', 'Standards'],
      readTime: '7 min read',
    },
    {
      image: defaultImg,
      title: 'Audit Requirements for SMEs',
      description: 'When and how to audit your Dutch SME.',
      link: '#',
      tags: ['Audit', 'SME'],
      readTime: '6 min read',
    },
  ],
  'Business Exit & Restructuring': [
    {
      image: defaultImg,
      title: 'Exiting a Dutch Business',
      description: 'Legal and tax considerations for business exit.',
      link: '#',
      tags: ['Exit', 'Legal'],
      readTime: '8 min read',
    },
    {
      image: defaultImg,
      title: 'Restructuring Your Company',
      description: 'How to restructure your Dutch company efficiently.',
      link: '#',
      tags: ['Restructuring', 'Company'],
      readTime: '9 min read',
    },
  ],
  'Digital Business': [
    {
      image: defaultImg,
      title: 'E-Commerce Compliance',
      description: 'Compliance tips for running an e-commerce business in the Netherlands.',
      link: '#',
      tags: ['E-Commerce', 'Compliance'],
      readTime: '7 min read',
    },
    {
      image: defaultImg,
      title: 'Digital Transformation Strategies',
      description: 'How to digitally transform your Dutch business.',
      link: '#',
      tags: ['Digital', 'Strategy'],
      readTime: '8 min read',
    },
  ],
};

export default function LibrarySection() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const cards = categoryCards[selectedCategory] || [];
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  return (
    <div className="library-full-wrapper">
      <div className="library-header-area">
        <h1>Dutch Business Resource Library</h1>
        <p>Comprehensive guides, articles, and resources for businesses operating in the Netherlands</p>
        <div className="library-search-bar">
          <input type="text" placeholder="Search for topics, guides, or specific requirements..." />
          <button>Search</button>
        </div>
        <div className="library-popular">
          <span>Popular:</span>
          <span>Tax Filing</span>
          <span>Company Formation</span>
          <span>Banking</span>
          <span>VAT Registration</span>
          <span>Employment Law</span>
        </div>
      </div>
      <div className="library-section-flex">
        <aside className="library-sidebar">
          <h4>Resource Categories</h4>
          <ul>
            {categories.map((cat, i) => (
              <li
                key={i}
                className={cat === selectedCategory ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="cat-count">{(categoryCards[cat] || []).length}</span>
              </li>
            ))}
          </ul>
          {/* Assistance Card */}
          <div className="sidebar-assist-card">
            <div className="assist-title">Need Personalized Assistance?</div>
            <div className="assist-desc">
              Our experts can provide tailored guidance for your specific business situation.
            </div>
            <div className="assist-link">Schedule a <span>Consultation →</span></div>
          </div>
        </aside>
        <main className="library-main-content">
          <div className="library-main-header">
            <h2>{selectedCategory}</h2>
            <div className="library-controls">
              <button
                title="Grid View"
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
              >▦</button>
              <button
                title="List View"
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
              >☰</button>
              <button title="Filter">Filter</button>
              <button title="Sort">Sort</button>
            </div>
          </div>
          <div className={`library-cards-grid ${view}`}>
            {cards.map((card, idx) => (
              <div className={`library-card ${view}`} key={idx}>
                <img src={card.image} alt={card.title} className="library-card-img" />
                <div className="library-card-content">
                  <div className="library-card-meta">
                    <span>{selectedCategory}</span>
                    <span>• {card.readTime}</span>
                  </div>
                  <h4 className="library-card-title">{card.title}</h4>
                  <p className="library-card-desc">{card.description}</p>
                  <a href={card.link} target="_blank" rel="noopener noreferrer" className="library-card-link">
                    Read full article →
                  </a>
                  <div className="library-card-tags">
                    {card.tags.map((tag, i) => (
                      <span key={i} className="library-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <section className="library-newsletter">
            <div className="newsletter-content">
              <h3>Stay updated with Dutch business insights</h3>
              <p>
                Get the latest Dutch business regulations, compliance updates, and expert insights delivered to your inbox.
              </p>
            </div>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
            <div className="newsletter-privacy">
              We care about your data. Read our <a href="#">privacy policy</a>.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}