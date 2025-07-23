import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './GenerateForms.css';
import { 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaUserTie, 
  FaUsers, 
  FaTimes,
  FaPlus
} from 'react-icons/fa';
import { 
  MdBusinessCenter,
  MdEdit,
  MdSave,
  MdCancel,
  MdDashboard,  // for overview
  MdGavel,      // for legal
  MdAttachMoney, // for financial
  MdPeople,     // for management
  MdHistory    // for history
} from 'react-icons/md';

const GenerateForms = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  
  // Get navigation state
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const state = location.state || {};
  
  // Check if we should start in edit mode or specific tab
  const shouldStartEditing = state.editMode || state.addMode || state.addShareholder;
  const targetTab = state.activeTab || 'overview';
  const [formData, setFormData] = useState({
    name: '',
    type: 'Private Limited Company • Active',
    regNumber: '',
    vatNumber: '',
    incorporationDate: '',
    fiscalYearEnd: '',
    shareCapital: '',
    firstBookYear: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    address: '',
    vatFilingFreq: 'Quarterly',
    vatFilingMonths: '',
    corporateTaxNumber: '',
    employerRegistration: 'Yes',
    employerNumber: '',
    annualFilingDeadline: '',
    taxReturnDeadline: '',
    bankName: '',
    iban: '',
    bic: '',
    authorizedCapital: '',
    issuedCapital: '',
    paidUpCapital: '',
    numberOfShares: '',
    nominalValuePerShare: '',
    shareholders: [],
    directors: [],
    corporateHistory: []
  });
  const [corporateHistory, setCorporateHistory] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch initial data
  useEffect(() => {
    getInitialData();
    
    // Set initial state based on navigation
    if (shouldStartEditing) {
      setIsEditing(true);
    }
    if (targetTab !== 'overview') {
      setActiveTab(targetTab);
    }
    
    // Handle adding director
    if (state.addMode) {
      handleAddDirectorFromKYC();
    }
    
    // Handle director editing
    if (state.directorToEdit) {
      // Pre-populate director data for editing
      console.log('Editing director:', state.directorToEdit);
      setActiveTab('management');
      setIsEditing(true);
      // Add a small delay to ensure the component is fully loaded
      setTimeout(() => {
        handleEditDirectorFromKYC();
      }, 100);
    }
    
    // Handle adding shareholder
    if (state.addShareholder) {
      setActiveTab('management');
      setIsEditing(true);
      // Add a small delay to ensure the component is fully loaded
      setTimeout(() => {
        handleAddShareholderFromKYC();
      }, 100);
    }
  }, []);

  const getInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchCompanyData(user.id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const fetchCompanyData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          name: data.company_name || '',
          type: `${data.company_type || 'Private Limited Company'} • ${data.status || 'Active'}`,
          regNumber: data.reg_number || '',
          incorporationDate: data.incorporation_date || '',
          fiscalYearEnd: data.fiscal_year_end || '',
          shareCapital: data.share_capital || '',
          firstBookYear: data.first_book_year || '',
          vatNumber: data.vat_number || '',
          vatFilingFreq: data.vat_filing_freq || 'Quarterly',
          vatFilingMonths: data.vat_filing_months || '',
          corporateTaxNumber: data.corporate_tax_number || '',
          employerRegistration: data.employer_registration || 'Yes',
          employerNumber: data.employer_number || '',
          annualFilingDeadline: data.annual_filing_deadline || '',
          taxReturnDeadline: data.tax_return_deadline || '',
          bankName: data.bank_name || '',
          iban: data.iban || '',
          bic: data.bic || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          address: data.registered_address || '',
          authorizedCapital: data.authorized_capital || '',
          issuedCapital: data.issued_capital || '',
          paidUpCapital: data.paid_up_capital || '',
          numberOfShares: data.number_of_shares || '',
          nominalValuePerShare: data.nominal_value_per_share || '',
          shareholders: data.shareholders || [],
          directors: data.directors || [],
          corporateHistory: data.corporate_history || []
        }));
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  // Your existing handler functions
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Prepare data for company_info update
      const updateData = {
        company_name: formData.name,
        company_type: formData.type.split(' • ')[0],
        status: formData.type.split(' • ')[1],
        reg_number: formData.regNumber,
        incorporation_date: formData.incorporationDate,
        fiscal_year_end: formData.fiscalYearEnd,
        share_capital: formData.shareCapital,
        first_book_year: formData.firstBookYear,
        vat_number: formData.vatNumber,
        vat_filing_freq: formData.vatFilingFreq,
        vat_filing_months: formData.vatFilingMonths,
        corporate_tax_number: formData.corporateTaxNumber,
        employer_registration: formData.employerRegistration,
        employer_number: formData.employerNumber,
        annual_filing_deadline: formData.annualFilingDeadline,
        tax_return_deadline: formData.taxReturnDeadline,
        bank_name: formData.bankName,
        iban: formData.iban,
        bic: formData.bic,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        linkedin: formData.linkedin,
        registered_address: formData.address,
        business_address: formData.address,
        authorized_capital: formData.authorizedCapital,
        issued_capital: formData.issuedCapital,
        paid_up_capital: formData.paidUpCapital,
        number_of_shares: formData.numberOfShares,
        nominal_value_per_share: formData.nominalValuePerShare,
        shareholders: formData.shareholders.map(shareholder => ({
          name: shareholder.name,
          type: shareholder.type,
          shares: shareholder.shares,
          percentage: shareholder.percentage,
          registration: shareholder.registration,
          country: shareholder.country
        })),
        directors: formData.directors.map(director => ({
          name: director.name,
          role: director.role,
          email: director.email,
          phone: director.phone,
          appointedDate: director.appointedDate
        })),
        corporate_history: formData.corporateHistory.map(event => ({
          title: event.title,
          date: event.date,
          description: event.description,
          created_at: event.created_at
        })),
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      // Update company_info table
      const { data: existing } = await supabase
        .from('company_info')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from('company_info')
          .update(updateData)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('company_info')
          .insert([{ ...updateData, user_id: userId }]);

        if (insertError) throw insertError;
      }

      // Update user_profiles table with new company name
      // Changed from .eq('id', userId) to .eq('user_id', userId)
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ company_name: formData.name })
        .eq('user_id', userId);  // Use user_id instead of id

      if (profileUpdateError) throw profileUpdateError;

      setIsEditing(false);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(prev => ({ ...prev })); // Reset to original data
  };

  const handleShareholderChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      shareholders: prev.shareholders.map((shareholder, i) => 
        i === index ? { ...shareholder, [field]: value } : shareholder
      )
    }));
  };

  const handleDirectorChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.map((director, i) => 
        i === index ? { ...director, [field]: value } : director
      )
    }));
  };

  const handleAddDirector = () => {
    setFormData(prev => ({
      ...prev,
      directors: [...prev.directors, {
        name: '',
        role: '',
        email: '',
        phone: '',
        appointedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }]
    }));
  };

  const handleRemoveDirector = (index) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }));
  };

  const handleAddShareholder = () => {
    setFormData(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, {
        name: '',
        type: 'Corporate',
        shares: '0',
        percentage: '0',
        registration: '', // Added registration field
        country: '' // Added country field
      }]
    }));
  };

  // Handle adding shareholder from KYC navigation
  const handleAddShareholderFromKYC = () => {
    if (state.addShareholder) {
      handleAddShareholder();
    }
  };

  // Handle editing director from KYC navigation
  const handleEditDirectorFromKYC = () => {
    if (state.directorToEdit) {
      // Find the director in the current list and update it
      const directorIndex = formData.directors.findIndex(d => 
        d.name === state.directorToEdit.name || 
        d.fullName === state.directorToEdit.fullName
      );
      
      if (directorIndex !== -1) {
        // Update the director data
        setFormData(prev => ({
          ...prev,
          directors: prev.directors.map((director, index) => 
            index === directorIndex ? { ...director, ...state.directorToEdit } : director
          )
        }));
      } else {
        // Add the director if not found
        setFormData(prev => ({
          ...prev,
          directors: [...prev.directors, {
            name: state.directorToEdit.fullName || state.directorToEdit.name,
            role: state.directorToEdit.role || 'Director',
            email: state.directorToEdit.email || '',
            phone: state.directorToEdit.phone || '',
            appointedDate: state.directorToEdit.appointedDate || new Date().toLocaleDateString()
          }]
        }));
      }
    }
  };

  // Handle adding director from KYC navigation
  const handleAddDirectorFromKYC = () => {
    if (state.addMode) {
      setActiveTab('management');
      setIsEditing(true);
      // Add a small delay to ensure the component is fully loaded
      setTimeout(() => {
        handleAddDirector();
      }, 100);
    }
  };

  const handleRemoveShareholder = (index) => {
    setFormData(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalShares = () => {
    return formData.shareholders.reduce((sum, shareholder) => 
      sum + parseInt(shareholder.shares.replace(/,/g, '') || 0), 0
    );
  };

  const updateShareholderPercentages = () => {
    const totalShares = calculateTotalShares();
    setFormData(prev => ({
      ...prev,
      shareholders: prev.shareholders.map(shareholder => ({
        ...shareholder,
        percentage: totalShares > 0 
          ? ((parseInt(shareholder.shares.replace(/,/g, '') || 0) / totalShares) * 100).toFixed(0)
          : '0'
      }))
    }));
  };

  const handleCompanyTypeChange = (companyType) => {
    const currentStatus = formData.type.split(' • ')[1];
    setFormData(prev => ({
      ...prev,
      type: `${companyType} • ${currentStatus}`
    }));
  };

  const handleStatusChange = (status) => {
    const currentType = formData.type.split(' • ')[0];
    setFormData(prev => ({
      ...prev,
      type: `${currentType} • ${status}`
    }));
  };

  const handleAddHistoryEvent = () => {
    setShowEventModal(true);
    setNewEvent({
      title: '',
      date: '',
      description: ''
    });
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      alert('Please fill in required fields');
      return;
    }
  
    const eventToAdd = {
      ...newEvent,
      created_at: new Date().toISOString()
    };
  
    setFormData(prev => ({
      ...prev,
      corporateHistory: [...(prev.corporateHistory || []), eventToAdd]
    }));
  
    setShowEventModal(false);
    setNewEvent({
      title: '',
      date: '',
      description: ''
    });
  };
  
  const handleCancelEvent = () => {
    setShowEventModal(false);
    setNewEvent({
      title: '',
      date: '',
      description: ''
    });
  };

  const handleRemoveHistoryEvent = (index) => {
    if (window.confirm('Are you sure you want to remove this event?')) {
      setFormData(prev => ({
        ...prev,
        corporateHistory: prev.corporateHistory.filter((_, i) => i !== index)
      }));
    }
  };

  const renderLegalAndCompliance = () => {
    return (
      <div className="legal-compliance-section">
        <h2 className="section-title">Legal & Compliance Information</h2>
        
        <div className="legal-grid">
          {/* Tax Registration Card */}
          <div className="legal-card-dark">
            <h3>Tax Registration</h3>
            <div className="form-group1">
              <label>VAT Number</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                />
              ) : (
                <p>{formData.vatNumber || 'NL123456789B01'}</p>
              )}
            </div>
            <div className="form-group1">
              <label>VAT Filing Frequency</label>
              {isEditing ? (
                <select
                  className="form-control"
                  value={formData.vatFilingFreq}
                  onChange={(e) => handleInputChange('vatFilingFreq', e.target.value)}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              ) : (
                <p>{formData.vatFilingFreq || 'Quarterly'}</p>
              )}
            </div>
            <div className="form-group1">
              <label>VAT Filing Months</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.vatFilingMonths}
                  onChange={(e) => handleInputChange('vatFilingMonths', e.target.value)}
                />
              ) : (
                <p>{formData.vatFilingMonths}</p>
              )}
            </div>
            <div className="form-group1">
              <label>Corporate Tax Number</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.corporateTaxNumber}
                  onChange={(e) => handleInputChange('corporateTaxNumber', e.target.value)}
                />
              ) : (
                <p>{formData.corporateTaxNumber}</p>
              )}
            </div>
            <div className="form-group1">
              <label>Employer Registration</label>
              {isEditing ? (
                <select
                  className="form-control"
                  value={formData.employerRegistration}
                  onChange={(e) => handleInputChange('employerRegistration', e.target.value)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <p>{formData.employerRegistration}</p>
              )}
            </div>
            <div className="form-group1">
              <label>Employer Number</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.employerNumber}
                  onChange={(e) => handleInputChange('employerNumber', e.target.value)}
                />
              ) : (
                <p>{formData.employerNumber}</p>
              )}
            </div>
          </div>
  
          <div className="legal-grid-right">
            {/* Fiscal Information Card */}
            <div className="legal-card-dark">
              <h3>Fiscal Information</h3>
              <div className="form-group1">
                <label>Fiscal Year End</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fiscalYearEnd}
                    onChange={(e) => handleInputChange('fiscalYearEnd', e.target.value)}
                  />
                ) : (
                  <p>{formData.fiscalYearEnd}</p>
                )}
              </div>
              <div className="form-group1">
                <label>First Book Year End</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstBookYear}
                    onChange={(e) => handleInputChange('firstBookYear', e.target.value)}
                  />
                ) : (
                  <p>{formData.firstBookYear}</p>
                )}
              </div>
              <div className="form-group1">
                <label>Annual Accounts Filing Deadline</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.annualFilingDeadline}
                    onChange={(e) => handleInputChange('annualFilingDeadline', e.target.value)}
                  />
                ) : (
                  <p>{formData.annualFilingDeadline}</p>
                )}
              </div>
              <div className="form-group1">
                <label>Corporate Tax Return Deadline</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.taxReturnDeadline}
                    onChange={(e) => handleInputChange('taxReturnDeadline', e.target.value)}
                  />
                ) : (
                  <p>{formData.taxReturnDeadline}</p>
                )}
              </div>
            </div>
  
            {/* Bank Details Card */}
            <div className="legal-card-dark">
              <h3>Bank Details</h3>
              <div className="form-group1">
                <label>Bank Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                ) : (
                  <p>{formData.bankName}</p>
                )}
              </div>
              <div className="form-group1">
                <label>Account Number (IBAN)</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                  />
                ) : (
                  <p>{formData.iban}</p>
                )}
              </div>
              <div className="form-group1">
                <label>BIC/SWIFT</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.bic}
                    onChange={(e) => handleInputChange('bic', e.target.value)}
                  />
                ) : (
                  <p>{formData.bic}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialDetails = () => {
    return (
      <div className="financial-details-section">
        <h2 className="section-title">Financial Details</h2>
        
        {/* Capital Structure Section */}
        <div className="capital-section">
          <h3>Capital Structure</h3>
          <div className="capital-grid">
            <div className="capital-card">
              <label>Authorized Capital</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.authorizedCapital}
                  onChange={(e) => handleInputChange('authorizedCapital', e.target.value)}
                />
              ) : (
                <p className="amount">{formData.authorizedCapital}</p>
              )}
            </div>
            <div className="capital-card">
              <label>Issued Capital</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.issuedCapital}
                  onChange={(e) => handleInputChange('issuedCapital', e.target.value)}
                />
              ) : (
                <p className="amount">{formData.issuedCapital}</p>
              )}
            </div>
            <div className="capital-card">
              <label>Paid-Up Capital</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.paidUpCapital}
                  onChange={(e) => handleInputChange('paidUpCapital', e.target.value)}
                />
              ) : (
                <p className="amount">{formData.paidUpCapital}</p>
              )}
            </div>
            <div className="capital-card">
              <label>Number of Shares</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.numberOfShares}
                  onChange={(e) => handleInputChange('numberOfShares', e.target.value)}
                />
              ) : (
                <p className="amount">{formData.numberOfShares}</p>
              )}
            </div>
            <div className="capital-card">
              <label>Nominal Value per Share</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={formData.nominalValuePerShare}
                  onChange={(e) => handleInputChange('nominalValuePerShare', e.target.value)}
                />
              ) : (
                <p className="amount">{formData.nominalValuePerShare}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shareholding Structure Section */}
        {renderShareholdingStructure()}
      </div>
    );
  };

  const renderShareholdingStructure = () => {
    return (
      <div className="shareholding-section">
        <div className="section-header">
          <h3>Shareholding Structure</h3>
          {isEditing && (
            <button className="btn-add-shareholder" onClick={handleAddShareholder}>
              <FaPlus /> Add Shareholder
            </button>
          )}
        </div>
        <div className="shareholding-table">
          <div className="table-header">
            <span>Shareholder</span>
            <span>Type</span>
            <span>Shares</span>
            <span>Percentage</span>
            {isEditing && <span>Actions</span>}
          </div>
          {formData.shareholders.map((shareholder, index) => (
            <div key={index} className="table-row">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Shareholder Name"
                    value={shareholder.name}
                    onChange={(e) => handleShareholderChange(index, 'name', e.target.value)}
                  />
                  <select
                    className="form-control"
                    value={shareholder.type}
                    onChange={(e) => handleShareholderChange(index, 'type', e.target.value)}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Number of Shares"
                    value={shareholder.shares}
                    onChange={(e) => {
                      handleShareholderChange(index, 'shares', e.target.value);
                      updateShareholderPercentages();
                    }}
                  />
                  <span className="percentage">{shareholder.percentage}%</span>
                  <button 
                    className="btn-remove-shareholder"
                    onClick={() => handleRemoveShareholder(index)}
                  >
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <span>{shareholder.name}</span>
                  <span>{shareholder.type}</span>
                  <span>{shareholder.shares}</span>
                  <span>{shareholder.percentage}%</span>
                </>
              )}
            </div>
          ))}
          <div className="table-footer">
            <span>Total</span>
            <span></span>
            <span>{calculateTotalShares().toLocaleString()}</span>
            <span>100%</span>
            {isEditing && <span></span>}
          </div>
        </div>
      </div>
    );
  };

  const renderManagementAndOwnership = () => {
    return (
      <div className="management-section">
        <div className="management-header">
          <h2 className="section-title">Management & Ownership</h2>
          {isEditing && (
            <button className="btn-add-person" onClick={handleAddDirector}>
              <FaPlus /> Add Person
            </button>
          )}
        </div>

        {/* Directors Section */}
        <h3 className="subsection-title">Directors</h3>
        <div className="directors-grid">
          {formData.directors.length === 0 && !isEditing ? (
            <div className="empty-state">
              <p>No directors added yet</p>
            </div>
          ) : (
            formData.directors.map((director, index) => (
              <div key={index} className="person-card">
                {isEditing && (
                  <button className="btn-remove" onClick={() => handleRemoveDirector(index)}>
                    <FaTimes />
                  </button>
                )}
                <div className="person-icon">
                  <FaUserTie className="text-2xl text-gray-600" />
                </div>
                <div className="person-info">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="form-control name-input"
                        placeholder="Name"
                        value={director.name}
                        onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control role-input"
                        placeholder="Role"
                        value={director.role}
                        onChange={(e) => handleDirectorChange(index, 'role', e.target.value)}
                      />
                      <div className="contact-info">
                        <div className="info-item">
                          <FaEnvelope className="text-gray-500" />
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={director.email}
                            onChange={(e) => handleDirectorChange(index, 'email', e.target.value)}
                          />
                        </div>
                        <div className="info-item">
                          <FaPhone className="text-gray-500" />
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Phone"
                            value={director.phone}
                            onChange={(e) => handleDirectorChange(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div className="info-item">
                          <FaCalendarAlt className="text-gray-500" />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Appointed Date"
                            value={director.appointedDate}
                            onChange={(e) => handleDirectorChange(index, 'appointedDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>{director.name}</h4>
                      <p className="role">{director.role}</p>
                      <div className="contact-info">
                        <div className="info-item">
                          <FaEnvelope className="text-gray-500" />
                          <p>{director.email}</p>
                        </div>
                        <div className="info-item">
                          <FaPhone className="text-gray-500" />
                          <p>{director.phone}</p>
                        </div>
                        <div className="info-item">
                          <FaCalendarAlt className="text-gray-500" />
                          <p>Appointed: {director.appointedDate}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Shareholders Section */}
        <h3 className="subsection-title">Shareholders</h3>
        <div className="shareholders-grid">
          {formData.shareholders.length === 0 && !isEditing ? (
            <div className="empty-state">
              <p>No shareholders added yet</p>
            </div>
          ) : (
            formData.shareholders.map((shareholder, index) => (
              <div key={index} className="shareholder-card">
                {isEditing && (
                  <button className="btn-remove" onClick={() => handleRemoveShareholder(index)}>
                    <FaTimes />
                  </button>
                )}
                <div className="shareholder-icon">
                  <FaUsers className="text-2xl text-gray-600" />
                </div>
                <div className="shareholder-info">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="form-control name-input"
                        placeholder="Name"
                        value={shareholder.name}
                        onChange={(e) => handleShareholderChange(index, 'name', e.target.value)}
                      />
                      <select
                        className="form-control type-input"
                        value={shareholder.type}
                        onChange={(e) => handleShareholderChange(index, 'type', e.target.value)}
                      >
                        <option value="Individual">Individual</option>
                        <option value="Corporate">Corporate</option>
                      </select>
                      <div className="shares-info">
                        <div className="info-item">
                          <FaBuilding className="text-gray-500" />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Number of Shares"
                            value={shareholder.shares}
                            onChange={(e) => {
                              handleShareholderChange(index, 'shares', e.target.value);
                              updateShareholderPercentages();
                            }}
                          />
                        </div>
                        <div className="info-item">
                          <span className="percentage">{shareholder.percentage}%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>{shareholder.name}</h4>
                      <p className="type">{shareholder.type}</p>
                      <div className="shares-info">
                        <div className="info-item">
                          <FaBuilding className="text-gray-500" />
                          <p>{shareholder.shares} shares</p>
                        </div>
                        <div className="info-item">
                          <p>{shareholder.percentage}% ownership</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderCorporateHistory = () => {
    return (
      <div className="corporate-history-section">
        <div className="section-header">
          <h2 className="section-title">Corporate History</h2>
          {isEditing && (
            <button className="btn-add-event" onClick={handleAddHistoryEvent}>
              <FaPlus /> Add Event
            </button>
          )}
        </div>

        <div className="timeline">
          {formData.corporateHistory?.map((event, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content1">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  {isEditing && (
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveHistoryEvent(index)}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <p className="event-date">{event.date}</p>
                <p className="event-description">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Event Modal */}
        {showEventModal && (
          <div className="add-event-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add Corporate Event</h2>
                <button className="close-button" onClick={handleCancelEvent}>×</button>
              </div>
              <div className="form-row">
                <label>Event Title*</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Company Formation"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <label>Date*</label>
                <input
                  type="date"
                  className="form-control"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Event description..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCancelEvent}>Cancel</button>
                <button className="btn-save" onClick={handleSaveEvent}>Save Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompanyProfile = () => {
    return (
      <div className="company-profile">
            <h3>Address Information</h3>
            <div className="form-field1">
              <label>Registered Address</label>
              {isEditing ? (
                <input
                  type="text"
                  className="editable-field1"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <p>{formData.address}</p>
              )}
            </div>
            <div className="form-field1">
              <label>Business Address</label>
              {isEditing ? (
                <input
                  type="text"
                  className="editable-field1"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <p>{formData.address}</p>
              )}
            </div>
          </div>
        
     
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-white ${isEditing ? 'editing' : ''}`}>
      <div className="company-header">
        <div className="flex items-center gap-4">
      <div className="icon1" style={{ marginTop: '2px' }}>

  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building h-8 w-8 text-[#EA3A70]" data-id="element-269"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
</div>
          <div>
            {isEditing ? (
              <div className="edit-company-info">
                <input
                  type="text"
                  className="editable-field text-xl font-semibold text-gray-900"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <div className="company-type-selector">
                  <select
                    className="editable-field text-sm text-gray-500"
                    value={formData.type.split(' • ')[0]}
                    onChange={(e) => handleCompanyTypeChange(e.target.value)}
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Representative Office">Representative Office</option>
                  </select>
                  <select
                    className="editable-field text-sm text-gray-500 ml-2"
                    value={formData.type.split(' • ')[1]}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="In Liquidation">In Liquidation</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                <h1 className="h1font">{formData.name}</h1>
                <p className="h1p">{formData.type}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button className="btn-primary btn-save" onClick={handleSave}>
                <MdSave /> Save Changes
              </button>
              <button className="btn-primary btn-cancel" onClick={handleCancel}>
                <MdCancel /> Cancel
              </button>
            </>
          ) : (
            <button className="btn-primary" style={{ backgroundColor: '#ec4884' }} onClick={() => setIsEditing(true)}>
              <MdEdit /> Edit Company Details
            </button>
          )}
        </div>
      </div>

      <nav className="horizontal-nav">
  <div className="nav-links">
    <button 
      className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
      onClick={() => setActiveTab('overview')}
    >
      <MdDashboard className="nav-icon" />
      Company Overview
    </button>
    <button 
      className={`nav-tab ${activeTab === 'legal' ? 'active' : ''}`}
      onClick={() => setActiveTab('legal')}
    >
      <MdGavel className="nav-icon" />
      Legal & Compliance
    </button>
    <button 
      className={`nav-tab ${activeTab === 'financial' ? 'active' : ''}`}
      onClick={() => setActiveTab('financial')}
    >
      <MdAttachMoney className="nav-icon" />
      Financial Details
    </button>
    <button 
      className={`nav-tab ${activeTab === 'management' ? 'active' : ''}`}
      onClick={() => setActiveTab('management')}
    >
      <MdPeople className="nav-icon" />
      Management & Ownership
    </button>
    <button 
      className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
      onClick={() => setActiveTab('history')}
    >
      <MdHistory className="nav-icon" />
      Corporate History
    </button>
  </div>
</nav>

      <div className="grid">
        {activeTab === 'overview' && (
          <>
            <div className="registration-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              {/* Company Details Card */}
              <div className="company-card">
                <h3 >Company Details</h3>
                <div className="form-field1">
                  <label>Registration Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="editable-field1"
                      value={formData.regNumber}
                      onChange={(e) => handleInputChange('regNumber', e.target.value)}
                    />
                  ) : (
                    <p>{formData.regNumber}</p>
                  )}
                </div>
                <div className="form-field1">
                  <label>Date of Incorporation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="editable-field1"
                      value={formData.incorporationDate}
                      onChange={(e) => handleInputChange('incorporationDate', e.target.value)}
                    />
                  ) : (
                    <p>{formData.incorporationDate}</p>
                  )}
                </div>
                <div className="form-field1">
                  <label>Fiscal Year End</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="editable-field1"
                      value={formData.fiscalYearEnd}
                      onChange={(e) => handleInputChange('fiscalYearEnd', e.target.value)}
                    />
                  ) : (
                    <p>{formData.fiscalYearEnd}</p>
                  )}
                </div>
              </div>

              {/* Financial Status Card */}
              <div className="company-card">
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Financial Status</h3>
                <div className="form-field1">
                  <label>VAT Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="editable-field1"
                      value={formData.vatNumber}
                      onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                    />
                  ) : (
                    <p>{formData.vatNumber}</p>
                  )}
                </div>
                <div className="form-field1">
                  <label>Share Capital</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="editable-field1"
                      value={formData.shareCapital}
                      onChange={(e) => handleInputChange('shareCapital', e.target.value)}
                    />
                  ) : (
                    <p>{formData.shareCapital}</p>
                  )}
                </div>
                <div className="form-field1">
                  <label>First Book Year End</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="editable-field1"
                      value={formData.firstBookYear}
                      onChange={(e) => handleInputChange('firstBookYear', e.target.value)}
                    />
                  ) : (
                    <p>{formData.firstBookYear}</p>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines Card */}
              <div className="company-card">
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Upcoming Deadlines</h3>
                <div className="deadline-list">
                  {isEditing ? (
                    <div className="empty-state">
                      <p>Click edit to add deadlines</p>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No upcoming deadlines</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Profile Section */}
            <div className="company-card" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Contact Information</h3>
                  <div className="form-field1">
                    <label>Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="editable-field1"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p>{formData.email}</p>
                    )}
                  </div>
                  <div className="form-field1">
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="editable-field1"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p>{formData.phone}</p>
                    )}
                  </div>
                  <div className="form-field1">
                    <label>Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        className="editable-field1"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    ) : (
                      <p>{formData.website}</p>
                    )}
                  </div>
                  <div className="form-field1">
                    <label>LinkedIn</label>
                    {isEditing ? (
                      <input
                        type="url"
                        className="editable-field1"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                    ) : (
                      <p>{formData.linkedin}</p>
                    )}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Address Information</h3>
                  <div className="form-field1">
                    <label>Registered Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="editable-field1"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p>{formData.address}</p>
                    )}
                  </div>
                  <div className="form-field1">
                    <label>Business Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="editable-field1"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p>{formData.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'legal' && renderLegalAndCompliance()}
        {activeTab === 'financial' && renderFinancialDetails()}
        {activeTab === 'management' && renderManagementAndOwnership()}
        {activeTab === 'history' && renderCorporateHistory()}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-header">
              <h3>Confirm Changes</h3>
            </div>
            <div className="confirmation-content">
              <p>Are you sure you want to save these changes?</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-button" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-button" 
                onClick={handleConfirmSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateForms;
