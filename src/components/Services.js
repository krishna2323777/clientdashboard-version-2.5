import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { supabase } from './SupabaseClient';
import './Services.css';
import { BiGlobe } from 'react-icons/bi';
import { MdSecurity } from 'react-icons/md';
import { BsLightningCharge } from 'react-icons/bs';
import { BsHeadset } from 'react-icons/bs';
import { BsBook } from 'react-icons/bs';
import { BsPerson } from 'react-icons/bs';

const Services = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('Netherlands');
  const [cart, setCart] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({
    payroll: false,
    eor: false,
    vat: false
  });
  const [selectedServices, setSelectedServices] = useState({
    Netherlands: {
      branchRegistration: false,
      vatRegistration: false,
      employerRegistration: false
    },
    Belgium: {
      branchRegistration: false,
      vatRegistration: false,
      employerRegistration: false
    },
    Germany: {
      branchRegistration: false,
      vatRegistration: false,
      employerRegistration: false
    },
    'Other EU Countries': {
      branchRegistration: false,
      vatRegistration: false,
      employerRegistration: false
    }
  });
  // Add after the other useState declarations
// Add this with your other state declarations at the top of the component
const [activeFaq, setActiveFaq] = useState(null);

// Add this function with your other functions
const toggleFaq = (faqId) => {
  setActiveFaq(activeFaq === faqId ? null : faqId);
};
  const [showQuoteConfirmation, setShowQuoteConfirmation] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState(null);
  const [authEmail, setAuthEmail] = useState(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showVatPopup, setShowVatPopup] = useState(false);
  const navigate = useNavigate();
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  
  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching auth user:', error);
          return;
        }
        
        if (data && data.session && data.session.user) {
          setAuthEmail(data.session.user.email);
          console.log('Auth email fetched:', data.session.user.email);
        }
      } catch (err) {
        console.error('Unexpected error fetching auth user:', err);
      }
    };
    
    getAuthUser();
  }, []);

  const addons = [
    { 
      id: 'payroll',
      name: 'Payroll Management', 
      price: 25,
      description: 'Per employee, includes full payroll administration',
      period: 'month'
    },
    { 
      id: 'eor',
      name: 'Employer of Record', 
      price: 175,
      description: 'Per employee, full employment compliance',
      period: 'month'
    },
    { 
      id: 'vat',
      name: 'VAT Administration', 
      price: 45,
      description: 'Monthly VAT returns and administration',
      period: 'month'
    }
  ];

  const servicesByCountry = {
    Netherlands: [
      {
        id: 'branchRegistration',
        name: 'Branch Registration',
        price: 295,
        description: 'Register your company branch in the EU',
        country: 'Netherlands'
      },
      {
        id: 'vatRegistration',
        name: 'VAT ID Registration',
        price: 75,
        description: 'Obtain VAT number for your business',
        country: 'Netherlands'
      },
      {
        id: 'employerRegistration',
        name: 'Employer Registration',
        price: 75,
        description: 'Register as an employer in the EU',
        country: 'Netherlands'
      }
    ],
    Belgium: [
      {
        id: 'branchRegistration',
        name: 'Branch Registration',
        price: 395,
        description: 'Register your company branch in the EU',
        country: 'Belgium'
      },
      {
        id: 'vatRegistration',
        name: 'VAT ID Registration',
        price: 195,
        description: 'Obtain VAT number for your business',
        country: 'Belgium'
      },
      {
        id: 'employerRegistration',
        name: 'Employer Registration',
        price: 195,
        description: 'Register as an employer in the EU',
        country: 'Belgium'
      }
    ],
    Germany: [
      {
        id: 'branchRegistration',
        name: 'Branch Registration',
        price: 995,
        description: 'Register your company branch in the EU',
        country: 'Germany'
      },
      {
        id: 'vatRegistration',
        name: 'VAT ID Registration',
        price: 350,
        description: 'Obtain VAT number for your business',
        country: 'Germany'
      },
      {
        id: 'employerRegistration',
        name: 'Employer Registration',
        price: 350,
        description: 'Register as an employer in the EU',
        country: 'Germany'
      }
    ],
    'Other EU Countries': [
      {
        id: 'branchRegistration',
        name: 'Branch Registration',
        price: 995,
        description: 'Register your company branch in the EU',
        country: 'Other EU'
      },
      {
        id: 'vatRegistration',
        name: 'VAT ID Registration',
        price: 550,
        description: 'Obtain VAT number for your business',
        country: 'Other EU'
      },
      {
        id: 'employerRegistration',
        name: 'Employer Registration',
        price: 550,
        description: 'Register as an employer in the EU',
        country: 'Other EU'
      }
    ]
  };

  const handleAddToCart = (service) => {
    if (service.name === 'eBranch Plan') {
      // Instead of resetting the entire cart, keep country services
      const existingCountryServices = cart.filter(item => 
        item.country && 
        item.name !== 'Payroll Management' && 
        item.name !== 'Employer of Record' && 
        item.name !== 'VAT Administration'
      );
      
      // Put eBranch at the beginning, followed by existingCountryServices
      setCart([service, ...existingCountryServices]);
      
      setSelectedAddons({
        payroll: false,
        eor: false,
        vat: false
      });
      
      // DON'T reset selected services, as we want to keep those selections
    } else {
      const currentCountryServices = servicesByCountry[activeTab] || [];
      const serviceMatch = currentCountryServices.find(s => 
        s.name === service.name || s.id === service.id
      );
      
      if (serviceMatch) {
        if (hasEBranchPlan) {
          const serviceId = serviceMatch.id;
          setSelectedServices(prev => {
            const newState = {
              ...prev,
              [activeTab]: {
                ...prev[activeTab],
                [serviceId]: !prev[activeTab][serviceId]
              }
            };
            
            setTimeout(() => {
              updateCartWithState(selectedAddons, newState);
            }, 0);
            
            return newState;
          });
        } else {
          const isAlreadyInCart = cart.some(item => 
            item.id === serviceMatch.id && 
            item.country === activeTab
          );
          
          if (!isAlreadyInCart) {
            const serviceWithCountry = {
              ...serviceMatch,
              country: activeTab
            };
            setCart(prevCart => [...prevCart, serviceWithCountry]);
          }
        }
      } else {
        const isAlreadyInCart = cart.some(item => 
          item.id === service.id
        );
        
        if (!isAlreadyInCart) {
          setCart(prevCart => [...prevCart, service]);
        }
      }
    }
  };
  
  const toggleAddon = (addonId) => {
    if (!hasEBranchPlan) return; // Only allow add-ons if eBranch is present
    setSelectedAddons(prevState => {
      const newState = {
        ...prevState,
        [addonId]: !prevState[addonId]
      };
      // Update cart with new add-on state
      updateCartWithState(newState, selectedServices);
      return newState;
    });
  };
  
  const toggleService = (serviceId, country) => {
    const countryToUse = country || activeTab;
    
    setSelectedServices(prevState => {
      const newState = {
        ...prevState,
        [countryToUse]: {
          ...prevState[countryToUse],
          [serviceId]: !prevState[countryToUse][serviceId]
        }
      };
      
      setTimeout(() => {
        updateCartWithState(selectedAddons, newState);
      }, 0);
      
      return newState;
    });
  };
  
  const updateCartWithState = (addonsState, servicesState) => {
    if (cart.length > 0 && cart[0].name === 'eBranch Plan') {
      const mainPlan = cart[0];
      let newCart = [mainPlan];
      // Add selected add-ons only
      addons.forEach(addon => {
        if (addonsState[addon.id]) {
          newCart.push(addon);
        }
      });
      setCart(newCart);
    }
  };

  const updateCart = () => {
    updateCartWithState(selectedAddons, selectedServices);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  // Fix the VAT calculation method
const calculateVAT = () => {
  // Remove the extra () after toFixed
  return calculateTotal() * 0.21;
};

  const handleRemoveFromCart = (index) => {
    // First check if we have an item at this index
    if (index >= 0 && index < cart.length) {
      const item = cart[index];

      // Special case: if it's eBranch Plan at index 0
      if (index === 0 && item.name === 'eBranch Plan') {
        setCart([]);
        setSelectedAddons({ payroll: false, eor: false, vat: false });
        setSelectedServices({
          Netherlands: {
            branchRegistration: false,
            vatRegistration: false,
            registrationOffice: false,
            annualStatements: false
          },
          Belgium: {
            branchRegistration: false,
            vatRegistration: false,
            registrationOffice: false,
            annualStatements: false
          },
          Germany: {
            branchRegistration: false,
            vatRegistration: false,
            registrationOffice: false,
            annualStatements: false
          },
          'Other EU Countries': {
            branchRegistration: false,
            vatRegistration: false,
            registrationOffice: false,
            annualStatements: false
          }
        });
        return;
      }
      
      // Handle add-ons
      const addonMatch = addons.find(addon => addon.name === item.name);
      if (addonMatch) {
        setSelectedAddons(prev => {
          const newState = {
            ...prev,
            [addonMatch.id]: false
          };
          
          setTimeout(() => {
            updateCartWithState(newState, selectedServices);
          }, 0);
          
          return newState;
        });
        return;
      }
      
      // Handle country services
      if (item.country) {
        const countryServices = servicesByCountry[item.country] || [];
        const serviceMatch = countryServices.find(service => service.name === item.name);
        
        if (serviceMatch) {
          setSelectedServices(prev => {
            const newState = {
              ...prev,
              [item.country]: {
                ...prev[item.country],
                [serviceMatch.id]: false
              }
            };
            
            setTimeout(() => {
              updateCartWithState(selectedAddons, newState);
            }, 0);
            
            return newState;
          });
          
          // Also remove the item directly from the cart
          const newCart = [...cart];
          newCart.splice(index, 1);
          setCart(newCart);
          return;
        }
      }
      
      // If we reach here, we need to directly update the cart
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };
  
  const hasEBranchPlan = cart.length > 0 && cart[0].name === 'eBranch Plan';

  const formatCartItemsForEmail = () => {
    return cart.map(item => {
      const period = item.period ? `/${item.period}` : '';
      const country = item.country ? ` (${item.country})` : '';
      return `${item.name}${country}: €${item.price.toFixed(2)}${period}`;
    }).join('<br />');
  };

  const handleRequestQuote = async () => {
    try {
      setQuoteStatus('sending');
      
      let emailToUse = null;
      let userId = null;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session && data.session.user) {
          userId = data.session.user.id;
          emailToUse = data.session.user.email;
          console.log('Using authenticated email:', emailToUse);
        } else {
          console.warn('No authenticated session found');
        }
      } catch (err) {
        console.error('Error getting auth session:', err);
      }
      
      if (!emailToUse) {
        emailToUse = authEmail;
        console.log('Falling back to stored auth email:', emailToUse);
      }
      
      if (userId) {
        try {
          const quoteData = {
            user_id: userId,
            email: emailToUse || "",
            quote_date: new Date().toISOString(),
            items: cart.map(item => ({
              name: item.name,
              price: item.price,
              period: item.period || 'one-time',
              country: item.country || 'Global'
            })),
            subtotal: calculateTotal(),
            vat: calculateVAT(),
            total: calculateTotal() + calculateVAT(),
            status: 'requested'
          };
          
          const { error: quoteError } = await supabase
            .from('service_quotes')
            .insert([quoteData]);
            
          if (quoteError) {
            console.error('Error saving quote to database:', quoteError);
          } else {
            console.log('Quote saved to database successfully');
          }
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
        }
      } else {
        console.warn('No user ID available - quote will not be saved to database');
      }
      
      const quoteDetails = {
        to_email: emailToUse || userEmail || "user@example.com",
        to_name: getNameFromEmail(emailToUse || userEmail),
        selected_items: formatCartItemsForEmail(),
        subtotal: calculateTotal().toFixed(2),
        vat: calculateVAT().toFixed(2),
        total: (calculateTotal() + calculateVAT()).toFixed(2)
      };
      
      const result = await emailjs.send(
        "service_dx1lmij",  
        "template_6iwpm0s", 
        quoteDetails,
        "DFvuzeXeMIa_5RoeE"
      );
      
      console.log('Email sent successfully:', result.text);
      setQuoteStatus('success');
      
      setTimeout(() => {
        setShowQuoteConfirmation(false);
        setQuoteStatus(null);
        
        setCart([]);
        setSelectedAddons({
          payroll: false,
          eor: false,
          vat: false
        });
        setSelectedServices({
          Netherlands: {
            branchRegistration: false,
            vatRegistration: false,
            employerRegistration: false
          },
          Belgium: {
            branchRegistration: false,
            vatRegistration: false,
            employerRegistration: false
          },
          Germany: {
            branchRegistration: false,
            vatRegistration: false,
            employerRegistration: false
          },
          'Other EU Countries': {
            branchRegistration: false,
            vatRegistration: false,
            employerRegistration: false
          }
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error sending quote email:', error);
      setQuoteStatus('error');
      
      setTimeout(() => {
        setQuoteStatus(null);
      }, 3000);
    }
  };

  const getNameFromEmail = (email) => {
    if (!email) return "Valued Customer";
    
    const nameFromEmail = email.split('@')[0]
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return nameFromEmail;
  };

  // Handle service selection from Other EU Countries
  const handleOtherEUService = (service) => {
    // Check if this service is already in the cart
    const isAlreadyInCart = cart.some(item => 
      item.id === service.id && 
      item.country === 'Other EU'
    );
    
    if (!isAlreadyInCart) {
      // Make sure country is included
      const serviceWithCountry = {
        ...service,
        country: 'Other EU'
      };
      setCart(prevCart => [...prevCart, serviceWithCountry]);
    }
  };

  // Track which services are in the cart (for button state management)
  const isServiceInCart = (serviceName, country) => {
    return cart.some(item => 
      item.name === serviceName && 
      (!country || item.country === country)
    );
  };

  const handleVatRegistrationClick = () => {
    setShowVatPopup(true);
  };

  // Add with other state declarations at the top
const [vatApplicationStep, setVatApplicationStep] = useState(1);
const [selectedCountry, setSelectedCountry] = useState('Spain');
const [businessActivity, setBusinessActivity] = useState('');
const [expectedTurnover, setExpectedTurnover] = useState('');

// Add this function to handle the country fees
const getCountryFees = (country) => {
  const fees = {
    'Netherlands': 0,
    'Spain': 500,
    'France': 900,
    'Germany': 450
  };
  return fees[country] || 0;
};

const [acceptedTerms, setAcceptedTerms] = useState(false);

// Add this function to mark VAT registration as selected when eBranch is added
const markVatRegistrationAsSelected = () => {
  setSelectedServices(prev => ({
    ...prev,
    [selectedCountry]: {
      ...prev[selectedCountry],
      vatRegistration: true
    }
  }));
};

// Add these state variables at the top with other states
const [showBranchPopup, setShowBranchPopup] = useState(false);
const [branchApplicationStep, setBranchApplicationStep] = useState(1);
const [branchSelectedCountry, setBranchSelectedCountry] = useState('Netherlands');
const [branchBusinessActivity, setBranchBusinessActivity] = useState('');
const [branchExpectedTurnover, setBranchExpectedTurnover] = useState('');
const [branchAcceptedTerms, setBranchAcceptedTerms] = useState(false);

// Add these state variables at the top with other states
const [showRegisteredOfficePopup, setShowRegisteredOfficePopup] = useState(false);
const [registeredOfficeStep, setRegisteredOfficeStep] = useState(1);
const [registeredOfficeCountry, setRegisteredOfficeCountry] = useState('Netherlands');
const [registeredOfficeActivity, setRegisteredOfficeActivity] = useState('');
const [registeredOfficeTurnover, setRegisteredOfficeTurnover] = useState('');
const [registeredOfficeTerms, setRegisteredOfficeTerms] = useState(false);

// Add these state variables at the top with other states
const [showFinancialStatementPopup, setShowFinancialStatementPopup] = useState(false);
const [financialStatementStep, setFinancialStatementStep] = useState(1);
const [financialStatementCountry, setFinancialStatementCountry] = useState('Netherlands');
const [financialStatementActivity, setFinancialStatementActivity] = useState('');
const [financialStatementTurnover, setFinancialStatementTurnover] = useState('');
const [financialStatementTerms, setFinancialStatementTerms] = useState(false);

// Helper to reset all selectedServices for core services
const resetAllCoreServices = () => ({
  Netherlands: {
    branchRegistration: false,
    vatRegistration: false,
    registrationOffice: false,
    annualStatements: false
  },
  Belgium: {
    branchRegistration: false,
    vatRegistration: false,
    registrationOffice: false,
    annualStatements: false
  },
  Germany: {
    branchRegistration: false,
    vatRegistration: false,
    registrationOffice: false,
    annualStatements: false
  },
  'Other EU Countries': {
    branchRegistration: false,
    vatRegistration: false,
    registrationOffice: false,
    annualStatements: false
  }
});

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (isCartVisible && !event.target.closest('.sliding-cart-panel') && 
        !event.target.closest('.floating-cart-button')) {
      setIsCartVisible(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isCartVisible]);

  return (
    <div className="app-container">
     
      <div className="main-content">
        <div className="services-container">
          {/* Pricing Plans with Cart Summary */}
          <div className="pricing-plans">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="current-plan-tag">Current Plan</div>
              <div className="plan-icon">⚡</div>
              <h2>Free Plan</h2>
              <p>Exploration</p>
              <div className="price">
                <span className="currency">€</span>
                <span className="amount">0</span>
                <span className="period">/month</span>
              </div>
              <ul className="features-list">
                <li> Virtual office address in the EU</li>
                <li> Dedicated phone number</li>
                <li> 25 credits for additional services</li>
                <li> Market Entry Roadmap/Strategy</li>
                <li> Access to basic AI-powered tools</li>
              </ul>
              <button className="current-plan">Current Plan</button>
            </div>

            {/* eBranch Plan */}
            <div className="pricing-card">
              <div className="most-popular-tag">Most Popular</div>
              <div className="plan-icon">🚀</div>
              <h2>eBranch</h2>
              <p>Most Popular</p>
              <div className="price">
                <span className="currency">€</span>
                <span className="amount">1,995</span>
                <span className="period">/year</span>
              </div>
              <ul className="features-list">
                <li> All Free plan features</li>
                <li> Core Bookkeeping Portal</li>
                <li> Branch Office Registration</li>
                <li> VAT and EORI Number Application</li>
                <li> Employer Registration</li>
                <li> Quarterly VAT Analysis</li>
                <li> Annual Corporate Analysis</li>
                <li> AI-powered Corporate Agent</li>
              </ul>
              <button className="launch-btn" onClick={() => {
  const alreadyHasEBranch = cart.length > 0 && cart[0].name === 'eBranch Plan';
  if (alreadyHasEBranch) {
    setCart([]);
    setSelectedAddons({ payroll: false, eor: false, vat: false });
    setSelectedServices({
      Netherlands: {
        branchRegistration: false,
        vatRegistration: false,
        registrationOffice: false,
        annualStatements: false
      },
      Belgium: {
        branchRegistration: false,
        vatRegistration: false,
        registrationOffice: false,
        annualStatements: false
      },
      Germany: {
        branchRegistration: false,
        vatRegistration: false,
        registrationOffice: false,
        annualStatements: false
      },
      'Other EU Countries': {
        branchRegistration: false,
        vatRegistration: false,
        registrationOffice: false,
        annualStatements: false
      }
    });
  } else {
    const eBranchPlan = { name: 'eBranch Plan', price: 1995, period: 'year' };
    setCart([eBranchPlan]);
    setSelectedAddons({ payroll: false, eor: false, vat: false });
    setSelectedServices(prev => {
      const newState = {};
      Object.keys(prev).forEach(country => {
        newState[country] = {
          branchRegistration: true,
          vatRegistration: true,
          registrationOffice: true,
          annualStatements: true
        };
      });
      return newState;
    });
  }
}}>
  {hasEBranchPlan ? 'Remove eBranch Plan' : 'Launch Your eBranch'}
</button>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card">
              <div className="plan-icon">🏢</div>
              <h2>Enterprise</h2>
              <p>Custom Solutions</p>
              <div className="price">
                <span className="amount">Custom</span>
              </div>
              <ul className="features-list">
                <li> All eBranch features</li>
                <li> Customizable AI solutions</li>
                <li> Dedicated account manager</li>
                <li> Priority support</li>
                <li> Flexible add-ons</li>
              </ul>
              <button className="contact-sales">Contact Sales</button>
            </div>

            {/* Cart Summary */}
            
          </div>

          {/* Quote Confirmation Modal */}
          {showQuoteConfirmation && (
            <div className="quote-confirmation-overlay">
              <div className="quote-confirmation-dialog">
                <div className="quote-confirmation-header">
                  <h3>Request Quote</h3>
                  <button 
                    className="close-button"
                    onClick={() => !quoteStatus && setShowQuoteConfirmation(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="quote-confirmation-content">
                  {quoteStatus === 'success' ? (
                    <div className="quote-success">
                      <div className="success-icon">✅</div>
                      <h4>Quote Sent Successfully!</h4>
                      <p>We've sent a detailed quote to your email address. Please check your inbox.</p>
                    </div>
                  ) : quoteStatus === 'error' ? (
                    <div className="quote-error">
                      <div className="error-icon">❌</div>
                      <h4>Something Went Wrong</h4>
                      <p>We couldn't send your quote. Please try again or contact our support team.</p>
                    </div>
                  ) : quoteStatus === 'sending' ? (
                    <div className="quote-sending">
                      <div className="loading-spinner"></div>
                      <p>Preparing your quote...</p>
                    </div>
                  ) : (
                    <>
                      <p>Would you like to receive a detailed quote for your selected services?</p>
                      <div className="quote-summary">
                        <h4>Your Selection:</h4>
                        <ul className="quote-items">
                          {cart.map((item, index) => (
                            <li key={index}>
                              <div className="quote-item-details">
                                <span>{item.name}</span>
                                {item.country && <span className="quote-item-country"> ({item.country})</span>}
                              </div>
                              <span>€{item.price.toFixed(2)}{item.period ? ` / ${item.period}` : ''}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="quote-total">
                          <span>Total: €{(calculateTotal() + calculateVAT()).toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="quote-note">A detailed quote will be sent to your email address. Our team may contact you for any additional information.</p>
                    </>
                  )}
                </div>
                
                {!quoteStatus && (
                  <div className="quote-confirmation-actions">
                    <button 
                      className="cancel-button"
                      onClick={() => setShowQuoteConfirmation(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="confirm-button"
                      onClick={handleRequestQuote}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add-ons section moved here */}
          {hasEBranchPlan && (
            <div className="addons-section">
              <h3>Available Add-ons</h3>
              <div className="addons-container">
                {/* Payroll Management */}
                <div className="addon-card">
                  <div className="addon-info">
                    <span className="addon-title">Payroll Management</span>
                    <span className="addon-description">Per employee, includes full payroll administration</span>
                    <span className="addon-price">€25 / month</span>
                  </div>
                  <div className="addon-controls">
                    <button 
                      className={`radio-btn ${selectedAddons.payroll ? 'selected' : ''} ${!hasEBranchPlan ? 'disabled' : ''}`}
                      onClick={() => toggleAddon('payroll')}
                      disabled={!hasEBranchPlan}
                    >
                      {selectedAddons.payroll ? '●' : '○'}
                    </button>
                  </div>
                </div>
                
                {/* Employer of Record */}
                <div className="addon-card">
                  <div className="addon-info">
                    <span className="addon-title">Employer of Record</span>
                    <span className="addon-description">Per employee, full employment compliance</span>
                    <span className="addon-price">€175 / month</span>
                  </div>
                  <div className="addon-controls">
                    <button 
                      className={`radio-btn ${selectedAddons.eor ? 'selected' : ''} ${!hasEBranchPlan ? 'disabled' : ''}`}
                      onClick={() => toggleAddon('eor')}
                      disabled={!hasEBranchPlan}
                    >
                      {selectedAddons.eor ? '●' : '○'}
                    </button>
                  </div>
                </div>
                
                {/* VAT Administration */}
                <div className="addon-card">
                  <div className="addon-info">
                    <span className="addon-title">VAT Administration</span>
                    <span className="addon-description">Monthly VAT returns and administration</span>
                    <span className="addon-price">€45 / month</span>
                  </div>
                  <div className="addon-controls">
                    <button 
                      className={`radio-btn ${selectedAddons.vat ? 'selected' : ''} ${!hasEBranchPlan ? 'disabled' : ''}`}
                      onClick={() => toggleAddon('vat')}
                      disabled={!hasEBranchPlan}
                    >
                      {selectedAddons.vat ? '●' : '○'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Core Business Services */}
          <div className="core-services">
  <h3>Core Business Services</h3>
  <div className="core-services-layout">
    {/* Cart Summary - Left Side */}
    <div className={`cart-summary ${showMobileCart ? 'show' : ''}`}>
      <div className="cart-header">
        <h3>Your Selection</h3>
        <button className="settings-btn">⚙️</button>
      </div>
      
      {cart.length > 0 ? (
        <>
          <div className="cart-items">
            {/* Main Plan or First Item */}
            {cart[0] && (
              <div className="main-plan">
                <div className="plan-info">
                  <span>{cart[0].name}</span>
                  {cart[0].country && <span className="item-country">{cart[0].country}</span>}
                  {cart[0].period && <span className="plan-period">/ {cart[0].period}</span>}
                </div>
                <div className="plan-price">
                  <span>€{cart[0].price.toFixed(2)}</span>
                  <button 
                    className="remove-item"
                    onClick={() => handleRemoveFromCart(0)}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            {/* Display all other cart items */}
            <div className="cart-items-scroll">
              {cart.slice(1).map((item, index) => (
                <div className="cart-item" key={index}>
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    {item.country && (
                      <span className="item-country">{item.country}</span>
                    )}
                    {item.period && (
                      <span className={`item-period ${item.period === 'included' ? 'included' : ''}`}>
                        {item.period === 'included' ? ' (Included)' : `/ ${item.period}`}
                      </span>
                    )}
                  </div>
                  <div className="item-price">
                    <span>{item.price > 0 ? `€${item.price.toFixed(2)}` : 'Included'}</span>
                    {item.period !== 'included' && (
                      <button 
                        className="remove-item"
                        onClick={() => handleRemoveFromCart(index + 1)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="cart-totals">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>€{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="tax">
              <span>VAT (21%)</span>
              <span>€{calculateVAT().toFixed(2)}</span>
            </div>
            <div className="cart-total">
              <span>Total</span>
              <span>€{(calculateTotal() + calculateVAT()).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Replace payment button with get quote button */}
          <button 
            className="get-quote-button"
            onClick={() => setShowQuoteConfirmation(true)}
          >
            <span>📝</span> Get Your Quote
          </button>
        </>
      ) : (
        <div className="no-items">No items in cart</div>
      )}
    </div>

    {/* Service Grid - Right Side */}
    <div className="core-services-grid">
      {/* Branch Registration Card */}
      <div className="service-box">
        <div className="service-icon">📋</div>
        <h4>Branch Registration</h4>
        <p>Register your company branch in the EU</p>
        <div className="service-price">
          <span className="amount">€895</span>
          <span className="period">/one-time</span>
        </div>
        <ul className="service-features">
          <li>Official registration</li>
          <li>Company number</li>
          <li>Legal compliance</li>
          <li>Document preparation</li>
        </ul>
        <button 
  className={`add-service-btn ${hasEBranchPlan ? 'included' : selectedServices[activeTab]?.branchRegistration ? 'selected' : ''}`}
  onClick={() => setShowBranchPopup(true)}
  disabled={hasEBranchPlan}
>
  {hasEBranchPlan ? 'Included' : selectedServices[activeTab]?.branchRegistration ? 'Added' : 'Add to Cart'}
</button>
      </div>

      {/* VAT ID Registration Card */}
      <div className="service-box">
        <div className="service-icon">€</div>
        <h4>VAT ID Registration</h4>
        <p>Obtain VAT number for your business</p>
        <div className="service-price">
          <span className="amount">€95</span>
          <span className="period">/one-time</span>
        </div>
        <ul className="service-features">
          <li>EU VAT number</li>
          <li>Tax authority setup</li>
          <li>Compliance check</li>
          <li>Document handling</li>
        </ul>
        <button 
  className={`add-service-btn ${hasEBranchPlan ? 'included' : selectedServices[activeTab]?.vatRegistration ? 'selected' : ''}`}
  onClick={handleVatRegistrationClick}
  disabled={hasEBranchPlan}
>
  {hasEBranchPlan ? 'Included' : selectedServices[activeTab]?.vatRegistration ? 'Added' : 'Add to Cart'}
</button>
      </div>

      {/* Registration Office Card */}
      <div className="service-box">
        <div className="service-icon">🏢</div>
        <h4>Registration Office</h4>
        <p>Official business address and mail handling</p>
        <div className="service-price">
          <span className="amount">€1200</span>
          <span className="period">/month</span>
        </div>
        <ul className="service-features">
          <li>Business address</li>
          <li>Mail handling</li>
          <li>Document scanning</li>
          <li>Mail forwarding</li>
        </ul>
        <button 
  className={`add-service-btn ${hasEBranchPlan ? 'included' : selectedServices[activeTab]?.registrationOffice ? 'selected' : ''}`}
  onClick={() => setShowRegisteredOfficePopup(true)}
  disabled={hasEBranchPlan}
>
  {hasEBranchPlan ? 'Included' : selectedServices[activeTab]?.registrationOffice ? 'Added' : 'Add to Cart'}
</button>
      </div>

      {/* Annual Financial Statements Card */}
      <div className="service-box">
        <div className="service-icon">📊</div>
        <h4>Annual Financial Statements</h4>
        <p>Complete financial reporting and analysis</p>
        <div className="service-price">
          <span className="amount">€650</span>
          <span className="period">/year</span>
        </div>
        <ul className="service-features">
          <li>Balance sheet</li>
          <li>Profit & Loss</li>
          <li>Financial analysis</li>
          <li>Compliance check</li>
        </ul>
        <button 
  className={`add-service-btn ${hasEBranchPlan ? 'included' : selectedServices[activeTab]?.annualStatements ? 'selected' : ''}`}
  onClick={() => setShowFinancialStatementPopup(true)}
  disabled={hasEBranchPlan}
>
  {hasEBranchPlan ? 'Included' : selectedServices[activeTab]?.annualStatements ? 'Added' : 'Add to Cart'}
</button>
      </div>
    </div>
  </div>
</div>

          <div className="why-choose-section">
            <h2>Why Choose House of Companies?</h2>
            <div className="features-grid">
              <div className="feature-box">
                <div className="feature-icon">
                  <BiGlobe className="icon" />
                </div>
                <h3>Global Expertise</h3>
                <p>Expert guidance on international expansion with local knowledge</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon">
                  <MdSecurity className="icon" />
                </div>
                <h3>Compliance Assured</h3>
                <p>Stay compliant with all local regulations and requirements</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon">
                  <BsLightningCharge className="icon" />
                </div>
                <h3>AI-Powered Solutions</h3>
                <p>Cutting-edge technology for efficient business operations</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon">
                  <BsHeadset className="icon" />
                </div>
                <h3>Dedicated Support</h3>
                <p>24/7 access to our expert support team</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon">
                  <BsBook className="icon" />
                </div>
                <h3>Resource Library</h3>
                <p>Access comprehensive guides and business resources</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon">
                  <BsPerson className="icon" />
                </div>
                <h3>Personalized Service</h3>
                <p>Tailored solutions for your specific business needs</p>
              </div>
            </div>
          </div>

          <div className="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div className="faq-container">
    {/* Credits FAQ */}
    <div className={`faq-item ${activeFaq === 'credits' ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => toggleFaq('credits')}>
        <span>How do credits work in the Free plan?</span>
        <span className={`faq-icon ${activeFaq === 'credits' ? 'active' : ''}`}>+</span>
      </button>
      <div className={`faq-answer ${activeFaq === 'credits' ? 'active' : ''}`}>
        Credits can be used for additional services like document processing or brief consultations. 
        Once exhausted, you can purchase more or upgrade to the eBranch plan.
      </div>
    </div>

    {/* Upgrade FAQ */}
    <div className={`faq-item ${activeFaq === 'upgrade' ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => toggleFaq('upgrade')}>
        <span>Can I upgrade from Free to eBranch at any time?</span>
        <span className={`faq-icon ${activeFaq === 'upgrade' ? 'active' : ''}`}>+</span>
      </button>
      <div className={`faq-answer ${activeFaq === 'upgrade' ? 'active' : ''}`}>
        Absolutely! Your journey to global expansion can start whenever you're ready.
      </div>
    </div>

    {/* Bookkeeping FAQ */}
    <div className={`faq-item ${activeFaq === 'bookkeeping' ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => toggleFaq('bookkeeping')}>
        <span>What's included in the Core Bookkeeping Portal?</span>
        <span className={`faq-icon ${activeFaq === 'bookkeeping' ? 'active' : ''}`}>+</span>
      </button>
      <div className={`faq-answer ${activeFaq === 'bookkeeping' ? 'active' : ''}`}>
        Our AI-powered accounting portal allows easy upload of invoices and financial documents, 
        providing real-time P&L and balance sheet tracking.
      </div>
    </div>

    {/* AI FAQ */}
    <div className={`faq-item ${activeFaq === 'ai' ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => toggleFaq('ai')}>
        <span>How does the AI-powered Corporate Agent work?</span>
        <span className={`faq-icon ${activeFaq === 'ai' ? 'active' : ''}`}>+</span>
      </button>
      <div className={`faq-answer ${activeFaq === 'ai' ? 'active' : ''}`}>
        It assists with legal document drafting, ensuring compliance with local regulations 
        across different jurisdictions.
      </div>
    </div>

    {/* Enterprise FAQ */}
    <div className={`faq-item ${activeFaq === 'enterprise' ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => toggleFaq('enterprise')}>
        <span>Is the Enterprise plan customizable?</span>
        <span className={`faq-icon ${activeFaq === 'enterprise' ? 'active' : ''}`}>+</span>
      </button>
      <div className={`faq-answer ${activeFaq === 'enterprise' ? 'active' : ''}`}>
        Yes, it's tailored to your specific needs. Our team will work with you to create 
        a bespoke solution for your global operations.
      </div>
    </div>
  </div>
</div>
    </div>
se
{showVatPopup && (
  <div className="service-activation-overlay">
    <div className="service-activation-dialog">
      <div className="activation-header">
        <h3>VAT ID Application Activation</h3>
        <span className="step-indicator">Step {vatApplicationStep} of 4</span>
        <button className="close-button" onClick={() => {
          setShowVatPopup(false);
          setVatApplicationStep(1);
        }}>×</button>
      </div>

      <div className="activation-content">
        {vatApplicationStep === 1 ? (
          // Step 1: Service Details
          <div className="service-details">
            <h4>Service Details & Confirmation</h4>
            <h5>VAT ID Application - Netherlands</h5>
            <div className="price">€95 one-time fee</div>

            <div className="included-section">
              <h6>What's included:</h6>
              <ul className="included-list">
                <li>✓ Application preparation</li>
                <li>✓ Submission to tax authorities</li>
                <li>✓ Basic follow-up on application status</li>
                <li>✓ Notification when VAT ID is issued</li>
              </ul>
            </div>

            <div className="not-included-section">
              <h6>What's NOT included (available with eBranch):</h6>
              <ul className="not-included-list">
                <li>✕ Ongoing compliance management</li>
                <li>✕ VAT return preparation tools</li>
                <li>✕ Registered Office address</li>
              </ul>
            </div>

            <div className="upgrade-section">
              <h6>WHY UPGRADE TO eBRANCH INSTEAD:</h6>
              <p>Full eBranch plan: <strong>€1,995/year</strong> includes:</p>
              <ul>
                <li>• VAT ID Application (€95 value)</li>
                <li>• Registered Office (€1,200 value)</li>
                <li>• Branch Registration (€895 value)</li>
                <li>• Plus all other core services</li>
              </ul>
              <p className="total-value">Total value: €2,900+ for just €1,995/year</p>
            </div>  

            <button className="continue-button" onClick={() => setVatApplicationStep(2)}>
              Continue <span>→</span>
            </button>
          </div>
        ) : vatApplicationStep === 2 ? (
          // Step 2: Country Selection
          <div className="country-selection">
            <h4>Country Selection</h4>
            
            <div className="selection-field">
              <label>Target Country:</label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="Spain">Spain</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Netherlands">Netherlands</option>
              </select>
              <p className="field-note">Pre-filled based on your qualification data. You can change if needed.</p>
            </div>

            <div className="country-info">
              <h6>Country-specific information:</h6>
              <ul>
                <li>Registration time: 15-20 business days</li>
                <li>Language: All documents must be in Spanish</li>
                <li>Additional fees: €500 in government and notary fees</li>
              </ul>
            </div>

            <div className="info-note">
              <span>ℹ️</span>
              <p>The Netherlands offers the most cost-effective and fastest option 
              for EU market entry with no additional government or notary fees.</p>
            </div> 

            <div className="step-buttons">
              <button className="back-button" onClick={() => setVatApplicationStep(1)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setVatApplicationStep(3)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        ) : vatApplicationStep === 3 ? (
          // Step 3: Service Configuration
          <div className="service-configuration">
            <h4>Service Configuration</h4>
            
            <div className="configuration-field">
              <label>Primary Business Activity:</label>
              <textarea 
                value={businessActivity}
                onChange={(e) => setBusinessActivity(e.target.value)}
                placeholder="Describe your main business activity in the target country"
                rows={3}
              />
              <p className="field-note">This information will be used for your vat id application.</p>
            </div>

            <div className="configuration-field">
              <label>Expected Annual Turnover:</label>
              <select 
                value={expectedTurnover}
                onChange={(e) => setExpectedTurnover(e.target.value)}
              >
                <option value="">Select expected turnover</option>
                <option value="0-100k">€0 - €100,000</option>
                <option value="100k-500k">€100,000 - €500,000</option>
                <option value="500k-1m">€500,000 - €1,000,000</option>
                <option value="1m+">€1,000,000+</option>
              </select>
            </div>

            <div className="service-summary">
              <h6>Service Summary:</h6>
              <div className="summary-item">
                <span>VAT ID Application - {selectedCountry}</span>
                <span>€95</span>
              </div>
              {getCountryFees(selectedCountry) > 0 && (
                <div className="summary-item">
                  <span>Additional country-specific fees</span>
                  <span>€{getCountryFees(selectedCountry)}</span>
                </div>
              )}
              <div className="summary-total">
                <span>Total:</span>
                <span>€{95 + getCountryFees(selectedCountry)}</span>
              </div>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setVatApplicationStep(2)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setVatApplicationStep(4)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        ) : null}
        {vatApplicationStep === 4 && (
  <div className="checkout">
    <h4>Checkout</h4>
    
    <div className="order-summary">
      <h6>Order Summary</h6>
      <div className="summary-item">
        <span>VAT ID Application - {selectedCountry}</span>
        <span>€95</span>
      </div>
      <div className="total-to-pay">
        <span>Total to pay:</span>
        <span>€{95 + getCountryFees(selectedCountry)}</span>
      </div>
    </div>

    <div className="upgrade-offer">
      <h6>UPGRADE TO eBRANCH AND SAVE</h6>
      <p>Get this service plus all core services for just €1,995/year - a better value than purchasing individually.</p>
      <button 
        className="upgrade-button"
        onClick={() => {
          // Add eBranch plan and preserve existing country services
          const existingCountryServices = cart.filter(item => 
            item.country && 
            item.name !== 'Payroll Management' && 
            item.name !== 'Employer of Record' && 
            item.name !== 'VAT Administration'
          );
          
          // Add eBranch plan at the beginning
          setCart([
            { 
              name: 'eBranch Plan', 
              price: 1995, 
              period: 'year' 
            }, 
            ...existingCountryServices
          ]);

          // Mark VAT registration as selected
          markVatRegistrationAsSelected();
          
          // Close popup and reset states
          setShowVatPopup(false);
          setVatApplicationStep(1);
          setAcceptedTerms(false);
        }}
      >
        Upgrade to eBranch Instead
      </button>
      <p className="save-note">Save over €900 compared to individual service purchases</p>
    </div>

    <div className="terms-section">
      <label className="terms-checkbox">
        <input 
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        <span>I accept the </span>
        <a href="#" className="terms-link">Terms of Service</a>
        <span> and </span>
        <a href="#" className="terms-link">Privacy Policy</a>
      </label>
    </div>

    <div className="secure-payment">
      <span>🔒</span> Secure Payment Processing
    </div>

    <div className="step-buttons">
      <button className="back-button" onClick={() => setVatApplicationStep(3)}>
        Back
      </button>
      <button 
        className="complete-purchase-button"
        disabled={!acceptedTerms || hasEBranchPlan}
        onClick={() => {
          if (acceptedTerms) {
            // Add VAT registration to cart with country-specific fees
            const vatService = {
              name: 'VAT ID Registration',
              price: 95 + getCountryFees(selectedCountry),
              country: selectedCountry,
              period: 'one-time',
              id: 'vatRegistration'
            };
            
            // Update cart
            setCart(prevCart => [...prevCart, vatService]);
            
            // Mark service as selected
            setSelectedServices(prev => ({
              ...prev,
              [selectedCountry]: {
                ...prev[selectedCountry],
                vatRegistration: true
              }
            }));

            // Close popup and reset states
            setShowVatPopup(false);
            setVatApplicationStep(1);
            setAcceptedTerms(false);
          }
        }}
      >
        {hasEBranchPlan ? 'Included in eBranch Plan' : 'Complete Purchase'}
      </button>
    </div>

    <div className="upgrade-offer">
      <h6>UPGRADE TO eBRANCH AND SAVE</h6>
      <p>Get this service plus all core services for just €1,995/year - a better value than purchasing individually.</p>
      <button 
        className="upgrade-button"
        onClick={() => {
          if (acceptedTerms) {
            // Create eBranch plan
            const eBranchPlan = {
              name: 'eBranch Plan',
              price: 1995,
              period: 'year'
            };

            // Filter existing country services
            const existingCountryServices = cart.filter(item => 
              item.country && 
              item.name !== 'Payroll Management' && 
              item.name !== 'Employer of Record' && 
              item.name !== 'VAT Administration'
            );
            
            // Set new cart with eBranch first
            setCart([eBranchPlan, ...existingCountryServices]);
            
            // Reset add-ons
            setSelectedAddons({
              payroll: false,
              eor: false,
              vat: false
            });

            // Mark VAT registration as included
            setSelectedServices(prev => ({
              ...prev,
              [selectedCountry]: {
                ...prev[selectedCountry],
                vatRegistration: true
              }
            }));

            // Close popup and reset
            setShowVatPopup(false);
            setVatApplicationStep(1);
            setAcceptedTerms(false);
          }
        }}
      >
        Upgrade to eBranch Instead
      </button>
      <p className="save-note">Save over €900 compared to individual service purchases</p>
    </div>
  </div>
)}
      </div>
    </div>
  </div>
)}

{showBranchPopup && (
  <div className="service-activation-overlay">
    <div className="service-activation-dialog">
      <div className="activation-header">
        <h3>Branch Registration Activation</h3>
        <span className="step-indicator">Step {branchApplicationStep} of 4</span>
        <button className="close-button" onClick={() => {
          setShowBranchPopup(false);
          setBranchApplicationStep(1);
        }}>×</button>
      </div>

      <div className="activation-content">
        {branchApplicationStep === 1 && (
          <div className="service-details">
            <h4>Service Details & Confirmation</h4>
            <h5>Branch Registration - Netherlands</h5>
            <div className="price">€895 one-time fee</div>

            <div className="included-section">
              <h6>What's included:</h6>
              <ul className="included-list">
                <li>✓ Application preparation</li>
                <li>✓ Submission to authorities</li>
                <li>✓ Basic follow-up on application status</li>
                <li>✓ Notification when registration is complete</li>
              </ul>
            </div>

            <div className="not-included-section">
              <h6>What's NOT included (available with eBranch):</h6>
              <ul className="not-included-list">
                <li>✕ Ongoing compliance management</li>
                <li>✕ Integration with other compliance tools</li>
                <li>✕ Registered Office address</li>
              </ul>
            </div>

            <div className="upgrade-section">
              <h6>WHY UPGRADE TO eBRANCH INSTEAD:</h6>
              <p>Full eBranch plan: <strong>€1,995/year</strong> includes:</p>
              <ul>
                <li>• Branch Registration (€895 value)</li>
                <li>• Registered Office (€1,200 value)</li>
                <li>• VAT ID Registration (€895 value)</li>
                <li>• Plus all other core services</li>
              </ul>
              <p className="total-value">Total value: €2,900+ for just €1,995/year</p>
            </div>

            <button className="continue-button" onClick={() => setBranchApplicationStep(2)}>
              Continue <span>→</span>
            </button>
          </div>
        )}

        {branchApplicationStep === 2 && (
          <div className="country-selection">
            <h4>Country Selection</h4>
            
            <div className="selection-field">
              <label>Target Country:</label>
              <select 
                value={branchSelectedCountry}
                onChange={(e) => setBranchSelectedCountry(e.target.value)}
              >
                <option value="Netherlands">Netherlands</option>
                <option value="Spain">Spain</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
              </select>
              <p className="field-note">Pre-filled based on your qualification data. You can change if needed.</p>
            </div>

            <div className="country-info">
              <h6>Country-specific information:</h6>
              <ul>
                <li>Registration time: 1-5 business days</li>
                <li>Language: Partial acceptance of English documentation</li>
                <li>Additional fees: None</li>
              </ul>
            </div>

            <div className="info-note">
              <span>ℹ️</span>
              <p>The Netherlands offers the most cost-effective and fastest option 
              for EU market entry with no additional government or notary fees.</p>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setBranchApplicationStep(1)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setBranchApplicationStep(3)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {branchApplicationStep === 3 && (
          <div className="service-configuration">
            <h4>Service Configuration</h4>
            
            <div className="configuration-field">
              <label>Primary Business Activity:</label>
              <textarea 
                value={branchBusinessActivity}
                onChange={(e) => setBranchBusinessActivity(e.target.value)}
                placeholder="Describe your main business activity in the target country"
                rows={3}
              />
              <p className="field-note">This information will be used for your branch registration.</p>
            </div>

            <div className="configuration-field">
              <label>Expected Annual Turnover:</label>
              <select 
                value={branchExpectedTurnover}
                onChange={(e) => setBranchExpectedTurnover(e.target.value)}
              >
                <option value="">Select expected turnover</option>
                <option value="0-100k">€0 - €100,000</option>
                <option value="100k-500k">€100,000 - €500,000</option>
                <option value="500k-1m">€500,000 - €1,000,000</option>
                <option value="1m+">€1,000,000+</option>
              </select>
            </div>

            <div className="service-summary">
              <h6>Service Summary:</h6>
              <div className="summary-item">
                <span>Branch Registration - {branchSelectedCountry}</span>
                <span>€895</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>€895</span>
              </div>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setBranchApplicationStep(2)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setBranchApplicationStep(4)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {branchApplicationStep === 4 && (
          <div className="checkout">
            <h4>Checkout</h4>
            
            <div className="order-summary">
              <h6>Order Summary</h6>
              <div className="summary-item">
                <span>Branch Registration - {branchSelectedCountry}</span>
                <span>€895</span>
              </div>
              <div className="total-to-pay">
                <span>Total to pay:</span>
                <span>€895</span>
              </div>
            </div>

            <div className="upgrade-offer">
              <h6>UPGRADE TO eBRANCH AND SAVE</h6>
              <p>Get this service plus all core services for just €1,995/year - a better value than purchasing individually.</p>
              <button 
                className="upgrade-button"
                onClick={() => {
                  if (branchAcceptedTerms) {
                    const eBranchPlan = {
                      name: 'eBranch Plan',
                      price: 1995,
                      period: 'year'
                    };
                    setCart([eBranchPlan]);
                    setShowBranchPopup(false);
                    setBranchApplicationStep(1);
                    setBranchAcceptedTerms(false);
                  }
                }}
              >
                Upgrade to eBranch Instead
              </button>
              <p className="save-note">Save over €900 compared to individual service purchases</p>
            </div>

            <div className="terms-section">
              <label className="terms-checkbox">
                <input 
                  type="checkbox"
                  checked={branchAcceptedTerms}
                  onChange={(e) => setBranchAcceptedTerms(e.target.checked)}
                />
                <span>I accept the </span>
                <a href="#" className="terms-link">Terms of Service</a>
                <span> and </span>
                <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>

            <div className="secure-payment">
              <span>🔒</span> Secure Payment Processing
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setBranchApplicationStep(3)}>
                Back
              </button>
              <button 
                className="complete-purchase-button"
                disabled={!branchAcceptedTerms || hasEBranchPlan}
                onClick={() => {
                  if (branchAcceptedTerms) {
                    const branchService = {
                      name: 'Branch Registration',
                      price: 895,
                      country: branchSelectedCountry,
                      period: 'one-time'
                    };
                    setCart(prevCart => [...prevCart, branchService]);
                    setShowBranchPopup(false);
                    setBranchApplicationStep(1);
                    setBranchAcceptedTerms(false);
                  }
                }}
              >
                {hasEBranchPlan ? 'Included in eBranch Plan' : 'Complete Purchase'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{showRegisteredOfficePopup && (
  <div className="service-activation-overlay">
    <div className="service-activation-dialog">
      <div className="activation-header">
        <h3>Registered Office Activation</h3>
        <span className="step-indicator">Step {registeredOfficeStep} of 4</span>
        <button className="close-button" onClick={() => {
          setShowRegisteredOfficePopup(false);
          setRegisteredOfficeStep(1);
        }}>×</button>
      </div>

      <div className="activation-content">
        {registeredOfficeStep === 1 && (
          <div className="service-details">
            <h4>Service Details & Confirmation</h4>
            <h5>Registered Office - Netherlands</h5>
            <div className="price">€1,200 /year</div>

            <div className="included-section">
              <h6>What's included:</h6>
              <ul className="included-list">
                <li>✓ Application preparation</li>
                <li>✓ Submission to tax authorities</li>
                <li>✓ Basic follow-up on application status</li>
                <li>✓ Notification when service is issued</li>
              </ul>
            </div>

            <div className="not-included-section">
              <h6>What's NOT included (available with eBranch):</h6>
              <ul className="not-included-list">
                <li>✕ Ongoing compliance management</li>
                <li>✕ Integration with other compliance tools</li>
                <li>✕ Registered Office address</li>
              </ul>
            </div>

            <div className="upgrade-section">
              <h6>WHY UPGRADE TO eBRANCH INSTEAD:</h6>
              <p>Full eBranch plan: <strong>€1,995/year</strong> includes:</p>
              <ul>
                <li>• Registered Office (€1,200 value)</li>
                <li>• Branch Registration (€895 value)</li>
                <li>• VAT ID Registration (€895 value)</li>
                <li>• Plus all other core services</li>
              </ul>
              <p className="total-value">Total value: €2,900+ for just €1,995/year</p>
            </div>

            <button className="continue-button" onClick={() => setRegisteredOfficeStep(2)}>
              Continue <span>→</span>
            </button>
          </div>
        )}

        {registeredOfficeStep === 2 && (
          <div className="country-selection">
            <h4>Country Selection</h4>
            
            <div className="selection-field">
              <label>Target Country:</label>
              <select 
                value={registeredOfficeCountry}
                onChange={(e) => setRegisteredOfficeCountry(e.target.value)}
              >
                <option value="Netherlands">Netherlands</option>
                <option value="Spain">Spain</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
              </select>
              <p className="field-note">Pre-filled based on your qualification data. You can change if needed.</p>
            </div>

            <div className="country-info">
              <h6>Country-specific information:</h6>
              <ul>
                <li>Registration time: 1-5 business days</li>
                <li>Language: Partial acceptance of English documentation</li>
                <li>Additional fees: None</li>
              </ul>
            </div>

            <div className="info-note">
              <span>ℹ️</span>
              <p>The Netherlands offers the most cost-effective and fastest option 
              for EU market entry with no additional government or notary fees.</p>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setRegisteredOfficeStep(1)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setRegisteredOfficeStep(3)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {registeredOfficeStep === 3 && (
          <div className="service-configuration">
            <h4>Service Configuration</h4>
            
            <div className="configuration-field">
              <label>Primary Business Activity:</label>
              <textarea 
                value={registeredOfficeActivity}
                onChange={(e) => setRegisteredOfficeActivity(e.target.value)}
                placeholder="Describe your main business activity in the target country"
                rows={3}
              />
              <p className="field-note">This information will be used for your registered office.</p>
            </div>

            <div className="configuration-field">
              <label>Expected Annual Turnover:</label>
              <select 
                value={registeredOfficeTurnover}
                onChange={(e) => setRegisteredOfficeTurnover(e.target.value)}
              >
                <option value="">Select expected turnover</option>
                <option value="0-100k">€0 - €100,000</option>
                <option value="100k-500k">€100,000 - €500,000</option>
                <option value="500k-1m">€500,000 - €1,000,000</option>
                <option value="1m+">€1,000,000+</option>
              </select>
            </div>

            <div className="service-summary">
              <h6>Service Summary:</h6>
              <div className="summary-item">
                <span>Registered Office - {registeredOfficeCountry}</span>
                <span>€1,200</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>€1,200</span>
              </div>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setRegisteredOfficeStep(2)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setRegisteredOfficeStep(4)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {registeredOfficeStep === 4 && (
          <div className="checkout">
            <h4>Checkout</h4>
            
            <div className="order-summary">
              <h6>Order Summary</h6>
              <div className="summary-item">
                <span>Registered Office - {registeredOfficeCountry}</span>
                <span>€1,200</span>
              </div>
              <div className="total-to-pay">
                <span>Total to pay:</span>
                <span>€1,200</span>
              </div>
            </div>

            <div className="upgrade-offer">
              <h6>UPGRADE TO eBRANCH AND SAVE</h6>
              <p>Get this service plus all core services for just €1,995/year - a better value than purchasing individually.</p>
              <button 
                className="upgrade-button"
                onClick={() => {
                  if (registeredOfficeTerms) {
                    const eBranchPlan = {
                      name: 'eBranch Plan',
                      price: 1995,
                      period: 'year'
                    };
                    setCart([eBranchPlan]);
                    setShowRegisteredOfficePopup(false);
                    setRegisteredOfficeStep(1);
                    setRegisteredOfficeTerms(false);
                  }
                }}
              >
                Upgrade to eBranch Instead
              </button>
              <p className="save-note">Save over €900 compared to individual service purchases</p>
            </div>

            <div className="terms-section">
              <label className="terms-checkbox">
                <input 
                  type="checkbox"
                  checked={registeredOfficeTerms}
                  onChange={(e) => setRegisteredOfficeTerms(e.target.checked)}
                />
                <span>I accept the </span>
                <a href="#" className="terms-link">Terms of Service</a>
                <span> and </span>
                <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>

            <div className="secure-payment">
              <span>🔒</span> Secure Payment Processing
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setRegisteredOfficeStep(3)}>
                Back
              </button>
              <button 
                className="complete-purchase-button"
                disabled={!registeredOfficeTerms || hasEBranchPlan}
                onClick={() => {
                  if (registeredOfficeTerms) {
                    const registeredOfficeService = {
                      name: 'Registered Office',
                      price: 1200,
                      country: registeredOfficeCountry,
                      period: 'year'
                    };
                    setCart(prevCart => [...prevCart, registeredOfficeService]);
                    setShowRegisteredOfficePopup(false);
                    setRegisteredOfficeStep(1);
                    setRegisteredOfficeTerms(false);
                  }
                }}
              >
                {hasEBranchPlan ? 'Included in eBranch Plan' : 'Complete Purchase'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
)}
{showFinancialStatementPopup && (
  <div className="service-activation-overlay">
    <div className="service-activation-dialog">
      <div className="activation-header">
        <h3>Annual Financial Statements Activation</h3>
        <span className="step-indicator">Step {financialStatementStep} of 4</span>
        <button className="close-button" onClick={() => {
          setShowFinancialStatementPopup(false);
          setFinancialStatementStep(1);
        }}>×</button>
      </div>

      <div className="activation-content">
        {financialStatementStep === 1 && (
          <div className="service-details">
            <h4>Service Details & Confirmation</h4>
            <h5>Annual Financial Statements - Netherlands</h5>
            <div className="price">€650 /year</div>

            <div className="included-section">
              <h6>What's included:</h6>
              <ul className="included-list">
                <li>✓ Application preparation</li>
                <li>✓ Submission to tax authorities</li>
                <li>✓ Basic follow-up on statements</li>
                <li>✓ Notification when statements are issued</li>
              </ul>
            </div>

            <div className="not-included-section">
              <h6>What's NOT included (available with eBranch):</h6>
              <ul className="not-included-list">
                <li>✕ Ongoing compliance management</li>
                <li>✕ Integration with other compliance tools</li>
                <li>✕ Real-time financial monitoring</li>
              </ul>
            </div>

            <div className="upgrade-section">
              <h6>WHY UPGRADE TO eBRANCH INSTEAD:</h6>
              <p>Full eBranch plan: <strong>€1,995/year</strong> includes:</p>
              <ul>
                <li>• Annual Financial Statements (€650 value)</li>
                <li>• Branch Registration (€895 value)</li>
                <li>• VAT ID Registration (€895 value)</li>
                <li>• Plus all other core services</li>
              </ul>
              <p className="total-value">Total value: €2,900+ for just €1,995/year</p>
            </div>

            <button className="continue-button" onClick={() => setFinancialStatementStep(2)}>
              Continue <span>→</span>
            </button>
          </div>
        )}

        {financialStatementStep === 2 && (
          <div className="country-selection">
            <h4>Country Selection</h4>
            
            <div className="selection-field">
              <label>Target Country:</label>
              <select 
                value={financialStatementCountry}
                onChange={(e) => setFinancialStatementCountry(e.target.value)}
              >
                <option value="Netherlands">Netherlands</option>
                <option value="Spain">Spain</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
              </select>
              <p className="field-note">Pre-filled based on your qualification data. You can change if needed.</p>
            </div>

            <div className="country-info">
              <h6>Country-specific information:</h6>
              <ul>
                <li>Processing time: 15-20 business days</li>
                <li>Language: Partial acceptance of English documentation</li>
                <li>Additional fees: None</li>
              </ul>
            </div>

            <div className="info-note">
              <span>ℹ️</span>
              <p>The Netherlands offers the most cost-effective and fastest option 
              for EU compliance with no additional fees.</p>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setFinancialStatementStep(1)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setFinancialStatementStep(3)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {financialStatementStep === 3 && (
          <div className="service-configuration">
            <h4>Service Configuration</h4>
            
            <div className="configuration-field">
              <label>Primary Business Activity:</label>
              <textarea 
                value={financialStatementActivity}
                onChange={(e) => setFinancialStatementActivity(e.target.value)}
                placeholder="Describe your main business activity in the target country"
                rows={3}
              />
              <p className="field-note">This information will be used for your annual financial statements.</p>
            </div>

            <div className="configuration-field">
              <label>Expected Annual Turnover:</label>
              <select 
                value={financialStatementTurnover}
                onChange={(e) => setFinancialStatementTurnover(e.target.value)}
              >
                <option value="">Select expected turnover</option>
                <option value="0-100k">€0 - €100,000</option>
                <option value="100k-500k">€100,000 - €500,000</option>
                <option value="500k-1m">€500,000 - €1,000,000</option>
                <option value="1m+">€1,000,000+</option>
              </select>
            </div>

            <div className="service-summary">
              <h6>Service Summary:</h6>
              <div className="summary-item">
                <span>Annual Financial Statements - {financialStatementCountry}</span>
                <span>€650</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>€650</span>
              </div>
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setFinancialStatementStep(2)}>
                Back
              </button>
              <button className="continue-button" onClick={() => setFinancialStatementStep(4)}>
                Continue <span>→</span>
              </button>
            </div>
          </div>
        )}

        {financialStatementStep === 4 && (
          <div className="checkout">
            <h4>Checkout</h4>
            
            <div className="order-summary">
              <h6>Order Summary</h6>
              <div className="summary-item">
                <span>Annual Financial Statements - {financialStatementCountry}</span>
                <span>€650</span>
              </div>
              <div className="total-to-pay">
                <span>Total to pay:</span>
                <span>€650</span>
              </div>
            </div>

            <div className="upgrade-offer">
              <h6>UPGRADE TO eBRANCH AND SAVE</h6>
              <p>Get this service plus all core services for just €1,995/year - a better value than purchasing individually.</p>
              <button 
                className="upgrade-button"
                onClick={() => {
                  if (financialStatementTerms) {
                    const eBranchPlan = {
                      name: 'eBranch Plan',
                      price: 1995,
                      period: 'year'
                    };
                    setCart([eBranchPlan]);
                    setShowFinancialStatementPopup(false);
                    setFinancialStatementStep(1);
                    setFinancialStatementTerms(false);
                  }
                }}
              >
                Upgrade to eBranch Instead
              </button>
              <p className="save-note">Save over €900 compared to individual service purchases</p>
            </div>

            <div className="terms-section">
              <label className="terms-checkbox">
                <input 
                  type="checkbox"
                  checked={financialStatementTerms}
                  onChange={(e) => setFinancialStatementTerms(e.target.checked)}
                />
                <span>I accept the </span>
                <a href="#" className="terms-link">Terms of Service</a>
                <span> and </span>
                <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>

            <div className="secure-payment">
              <span>🔒</span> Secure Payment Processing
            </div>

            <div className="step-buttons">
              <button className="back-button" onClick={() => setFinancialStatementStep(3)}>
                Back
              </button>
              <button 
                className="complete-purchase-button"
                disabled={!financialStatementTerms || hasEBranchPlan}
                onClick={() => {
                  if (financialStatementTerms) {
                    const financialStatementService = {
                      name: 'Annual Financial Statements',
                      price: 650,
                      country: financialStatementCountry,
                      period: 'year'
                    };
                    setCart(prevCart => [...prevCart, financialStatementService]);
                    setShowFinancialStatementPopup(false);
                    setFinancialStatementStep(1);
                    setFinancialStatementTerms(false);
                  }
                }}
              >
                {hasEBranchPlan ? 'Included in eBranch Plan' : 'Complete Purchase'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
{/* Floating Cart Button - Only show when cart has items */}
{cart.length > 0 && (
  <button 
    className="floating-cart-button"
    onClick={() => {
      // Find the cart summary element
      const cartSummary = document.querySelector('.cart-summary');
      if (cartSummary) {
        // Scroll to the cart summary with smooth behavior
        cartSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect
        cartSummary.classList.add('highlight');
        // Remove highlight after animation
        setTimeout(() => {
          cartSummary.classList.remove('highlight');
        }, 2000);
      }
    }}
  >
    <span className="cart-icon">🛒</span>
    <span className="cart-count">{cart.length}</span>
    <span className="cart-total">€{(calculateTotal() + calculateVAT()).toFixed(2)}</span>
  </button>
)}

</div>
    </div>
  );
};

export default Services;
