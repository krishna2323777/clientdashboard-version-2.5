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
              <p>{u.description}</p>
              <span className="discover-update-date">{u.date}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="discover-tabs">
        <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>All Content</button>
        <button className={activeTab === 'blog' ? 'active' : ''} onClick={() => setActiveTab('blog')}>Blog Posts</button>
        <button className={activeTab === 'video' ? 'active' : ''} onClick={() => setActiveTab('video')}>Video Tutorials</button>
        <button className={activeTab === 'library' ? 'active' : ''} onClick={() => setActiveTab('library')}>Library</button>
      </div>

      <div className="discover-section-content">

      {(activeTab === 'all' || activeTab === 'blog') && (
  <section className="discover-articles">
    <h3 className="section-title">Blog Posts</h3>
    <div className="discover-articles-list">
      {blogPosts.map((post, i) => (
        <div
          className="discover-article-card"
          key={i}
          onClick={() => window.open(post.link, '_blank')}
        >
          <img src={post.image} alt={post.title} className="discover-article-img" />
          <div className="discover-article-content">
            <div className="discover-article-meta">
              {post.date} &nbsp;•&nbsp; {post.readTime}
            </div>
            <h3 className="discover-article-title">{post.title}</h3>
          </div>
        </div>
      ))}
    </div>
    <div className="see-more-container">
      <button
        className="see-more-btn"
        onClick={() => window.open(BLOGS_URL, '_blank')}
      >
        See More
      </button>
    </div>
  </section>
)}

        {(activeTab === 'all' || activeTab === 'video') && (
          <section className="discover-videos">
            <h3 className="section-title">Video Tutorials</h3>
            <div className="discover-videos-list">
              {videos.map((v, i) => (
                <div className="discover-video-card" key={i}>
                  <div className="discover-video-thumb">
                    <img src={v.image} alt={v.title} />
                    <span className="discover-video-play">▶</span>
                  </div>
                  <div className="discover-video-info">
                    <h3>{v.title}</h3>
                    <div className="discover-video-meta">
                      <span>{v.duration}</span>
                      <span>{v.views}</span>
                    </div>
                  </div>
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
    </div>
  );
}
