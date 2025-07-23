import React, { useState } from 'react';
import './Discover.css';
import LibrarySection from './LibraryModal';


const updates = [
  {
    type: 'New Feature',
    title: 'AI-Powered Document Analysis',
    description: 'Automatically extract and validate information from your corporate documents',
    date: '2 days ago',
    icon: '🧠',
  },
  {
    type: 'Update',
    title: 'Enhanced Corporate Structure Visualization',
    description: 'New interactive diagram tools for complex corporate structures',
    date: '1 week ago',
    icon: '🏢',
  },
  {
    type: 'Feature',
    title: 'Multi-jurisdiction Compliance Tracking',
    description: 'Stay compliant across all your operating countries',
    date: '2 weeks ago',
    icon: '🌐',
  },
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState('all');

  // Example data
  const blogPosts = [
    {
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
      date: 'May 5',
      readTime: '12 min read',
      title: 'From Jugalbandi to Symphony: Harmonizing Indian...',
      link: 'https://www.houseofcompanies.io/post/from-jugalbandi-to-symphony-harmonizing-indian-and-eu-financial-practices',
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
      date: 'May 5',
      readTime: '12 min read',
      title: 'The Blockchain Ledger: Next-Gen Accounting Solution...',
      link: 'https://www.houseofcompanies.io/post/the-blockchain-ledger-next-gen-accounting-solutions-for-indian-eu-transactions',
    },
    {
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
      date: 'April 17',
      readTime: '6 min read',
      title: 'Unlock Global Opportunities: A Comprehensive Guide to...',
      link: 'https://www.houseofcompanies.io/post/unlock-global-opportunities-a-comprehensive-guide-to-branch-registration-for-legal-entities',
    },
    
  ];
  
  const BLOGS_URL = 'https://www.houseofcompanies.io/blogs';

  const videos = [
    {
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
      title: 'Getting Started with House of Companies',
      duration: '5:32',
      views: '2.4k views',
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
      title: 'Managing Corporate Changes',
      duration: '8:15',
      views: '1.8k views',
    },
  ];
  
  

  return (
    <div className="discover-page">
      {/* Intro Section */}
      <section className="discover-intro">
        <h1>Discover House of Companies</h1>
        <p>
          Explore our features, learn from experts, and connect with other international business owners.
        </p>
      </section>

      {/* Latest Updates */}
      <section className="discover-updates">
        <h2>Latest Updates</h2>
        <div className="discover-updates-list">
          {updates.map((u, i) => (
            <div className="discover-update-card" key={i}>
              <div className="discover-update-icon">{u.icon}</div>
              <span className={`discover-update-badge badge-${u.type.replace(/\s/g, '').toLowerCase()}`}>{u.type}</span>
              <h3>{u.title}</h3>
              <p>{u.description.split(' ')[0] + '...'} {/* Shorten description */}</p>
              <span className="discover-update-date">{u.date}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="discover-tabs">
        <button className={activeTab === 'blog' ? 'active' : ''} onClick={() => setActiveTab('blog')}>
          <span role="img" aria-label="view" style={{marginRight: '8px'}}>👁️</span> View Blog Posts
        </button>
        <button className={activeTab === 'video' ? 'active' : ''} onClick={() => setActiveTab('video')}>
          <span role="img" aria-label="view" style={{marginRight: '8px'}}>👁️</span> View Video Tutorials
        </button>
        <button className={activeTab === 'library' ? 'active' : ''} onClick={() => setActiveTab('library')}>
          <span role="img" aria-label="view" style={{marginRight: '8px'}}>👁️</span> View Library
        </button>
      </div>

      <div className="discover-section-content">

      {activeTab === 'blog' && (
        <section className="discover-articles" style={{ position: 'relative' }}>
          <h3 className="section-title">Blog</h3>
          <button className="carousel-arrow left" style={{display: 'none'}} onClick={() => {
            const el = document.querySelector('.discover-articles-list');
            if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
          }}>&lt;</button>
          <button className="carousel-arrow right" style={{display: 'none'}} onClick={() => {
            const el = document.querySelector('.discover-articles-list');
            if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
          }}>&gt;</button>
          <div className="discover-articles-list">
            {blogPosts.map((post, i) => (
              <div
                className="discover-article-card"
                key={i}
                onClick={() => window.open(post.link, '_blank')}
                style={{ position: 'relative' }}
              >
                <img src={post.image} alt={post.title} className="discover-article-img" />
                <div className="discover-article-content">
                  <div className="discover-article-meta">
                    {post.date}
                  </div>
                  <h3 className="discover-article-title"><span className="title-icon">📝</span>{post.title.split(':')[0]}</h3>
                </div>
                <button className="read-more-btn" onClick={e => { e.stopPropagation(); window.open(post.link, '_blank'); }}>Read</button>
              </div>
            ))}
          </div>
          <div className="see-more-container">
            <button
              className="see-more-btn"
              onClick={() => window.open(BLOGS_URL, '_blank')}
            >
              More
            </button>
          </div>
        </section>
      )}

      {activeTab === 'video' && (
        <section className="discover-videos" style={{ position: 'relative' }}>
          <h3 className="section-title">Videos</h3>
          <button className="carousel-arrow left" style={{display: 'none'}} onClick={() => {
            const el = document.querySelector('.discover-videos-list');
            if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
          }}>&lt;</button>
          <button className="carousel-arrow right" style={{display: 'none'}} onClick={() => {
            const el = document.querySelector('.discover-videos-list');
            if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
          }}>&gt;</button>
          <div className="discover-videos-list">
            {videos.map((v, i) => (
              <div className="discover-video-card" key={i} style={{ position: 'relative' }}>
                <div className="discover-video-thumb" style={{ position: 'relative' }}>
                  <img src={v.image} alt={v.title} />
                  <span className="discover-video-play">▶</span>
                </div>
                <div className="discover-video-info">
                  <h3><span className="title-icon">▶️</span>{v.title.split(' ')[0]}</h3>
                  <div className="discover-video-meta">
                    <span>{v.duration}</span>
                  </div>
                </div>
                <button className="watch-btn" onClick={() => window.open('#', '_blank')}>Watch</button>
              </div>
            ))}
          </div>
        </section>
      )}

        {activeTab === 'library' && (
          <section className="discover-library">
            <h3 className="section-title">Library</h3>
            <LibrarySection />
          </section>
        )}
      </div>

      {/* Enhanced Bottom Section */}
      <section className="discover-bottom-enhanced">
        <div className="discover-cta-banner">
          <h2>Ready to unlock your business potential?</h2>
          <p>Join our global community and access exclusive resources, expert insights, and more!</p>
          <a href="#" className="discover-cta-btn">Get Started</a>
        </div>
        <div className="discover-quick-tips">
          <div className="tip-card">
            <span className="tip-icon">🚀</span>
            <div>
              <div className="tip-title">Quick Start</div>
              <div className="tip-desc">See our onboarding guide for new users.</div>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">💡</span>
            <div>
              <div className="tip-title">Pro Tips</div>
              <div className="tip-desc">Discover advanced features to boost productivity.</div>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">📞</span>
            <div>
              <div className="tip-title">Support</div>
              <div className="tip-desc">Contact our team for personalized help.</div>
            </div>
          </div>
        </div>
        <div className="discover-testimonial">
          <div className="testimonial-quote">“This platform made our international expansion seamless and stress-free!”</div>
          <div className="testimonial-user">— Priya S., CFO, GlobalTech Ltd.</div>
        </div>
      </section>
    </div>
  );
}
