import React, { useState, useEffect } from 'react';
import './AuthSlider.css';
import avatarSetup from '../assests/istockphoto-1419541665-612x612.jpg';
import avatarTax from '../assests/istockphoto-1489003364-612x612.jpg';
import avatarOffice from '../assests/f1.jpg';
import avatarGlobe from '../assests/download.jpg';

const slides = [
  {
    avatar: avatarSetup, // 1st: setup (city icons)
    title: 'Effortless Company Setup',
    description: 'AI-driven branch office registration, VAT & EORI applications, and employer registration.',
    label: 'GLOBAL BUSINESS SOLUTIONS',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    avatar: avatarTax, // 2nd: tax (tax/laptop)
    title: 'Automated Compliance & Tax Filing',
    description: 'AI-powered bookkeeping, real-time VAT analysis, and corporate tax return filings.',
    label: 'GLOBAL BUSINESS SOLUTIONS',
    image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/4UZHfHiNzVozJ2dJYDZJqp/image.png',
  },
  {
    avatar: avatarOffice, // 3rd: office (office room)
    title: 'Virtual Office & Professional Presence',
    description: 'Establish your business with a local address, phone number, and Google My Business verification.',
    label: 'GLOBAL BUSINESS SOLUTIONS',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    avatar: avatarGlobe, // 4th: globe (glowing globe)
    title: 'Borderless Business Operations',
    description: 'From payroll services to residency applications, we handle the bureaucracy so you can focus on growth.',
    label: 'GLOBAL BUSINESS SOLUTIONS',
    image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/n9GwXn6KSkN3yF7tYkBCZh/image.png',
  },
];

const AuthSlider = ({ onSlideChange }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (onSlideChange) onSlideChange(current);
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, onSlideChange]);

  return (
    <div className="auth-slider-container">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`auth-slide${idx === current ? ' active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="auth-slide-overlay">
            <div className="auth-slide-label">{slide.label}</div>
            <div className="auth-slide-content">
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <div className="auth-slide-trusted">Trusted by 500+ companies</div>
              <button className="auth-slide-learn-btn">Learn more →</button>
            </div>
          </div>
        </div>
      ))}
      <div className="auth-slider-controls">
        <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} aria-label="Previous slide">&#8592;</button>
        <div className="auth-slider-dots">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`auth-slider-dot${idx === current ? ' active' : ''}`}
              onClick={() => setCurrent(idx)}
            />
          ))}
        </div>
        <button onClick={() => setCurrent((current + 1) % slides.length)} aria-label="Next slide">&#8594;</button>
      </div>
    </div>
  );
};

export { slides };
export default AuthSlider; 