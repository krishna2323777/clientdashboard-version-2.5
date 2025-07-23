import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './kyc.css';

const TargetCompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDirectorModal, setShowAddDirectorModal] = useState(false);
  const [showAddShareholderModal, setShowAddShareholderModal] = useState(false);
  const [newDirector, setNewDirector] = useState({
    name: '',
    email: '',
    role: 'Director',
    phone: '',
    appointedDate: new Date().toLocaleDateString()
  });
  const [newShareholder, setNewShareholder] = useState({
    name: '',
    percentage: '',
    type: 'Individual',
    shares: '0'
  });
  const [savingDirector, setSavingDirector] = useState(false);
  const [savingShareholder, setSavingShareholder] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('target_companies')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setCompany(data);
      setLoading(false);
    };
    fetchCompany();
  }, [id]);

  const handleAddDirector = async () => {
    if (!newDirector.name || !newDirector.email) {
      alert('Please fill in all required fields');
      return;
    }
    setSavingDirector(true);
    try {
      const updatedDirectors = [...(company?.directors || []), newDirector];
      console.log('Directors to save:', updatedDirectors);
      console.log('Company ID:', company.id);
      const { data, error } = await supabase
        .from('target_companies')
        .update({ directors: updatedDirectors })
        .eq('id', company.id)
        .select();
      console.log('Supabase update result:', { data, error });
      if (error) throw error;
      if (data && data.length > 0) {
        setCompany(data[0]);
        setNewDirector({ name: '', email: '', role: 'Director', phone: '', appointedDate: new Date().toLocaleDateString() });
        setShowAddDirectorModal(false);
      }
    } catch (error) {
      alert('Error adding director: ' + error.message);
      console.error('Error adding director:', error);
    }
    setSavingDirector(false);
  };

  const handleAddShareholder = async () => {
    if (!newShareholder.name || !newShareholder.percentage) {
      alert('Please fill in all required fields');
      return;
    }
    setSavingShareholder(true);
    try {
      const updatedShareholders = [...(company?.shareholders || []), newShareholder];
      const { data, error } = await supabase
        .from('target_companies')
        .update({ shareholders: updatedShareholders })
        .eq('id', company.id)
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setCompany(data[0]);
        setNewShareholder({ name: '', percentage: '', type: 'Individual', shares: '0' });
        setShowAddShareholderModal(false);
      }
    } catch (error) {
      alert('Error adding shareholder: ' + error.message);
    }
    setSavingShareholder(false);
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!company) return <div className="p-8 text-white">Company not found.</div>;

  return (
    <div className="app-container" style={{ backgroundColor: 'rgb(10, 8, 38)', color: 'white', minHeight: '100vh' }}>
      <div className="p-6">
        <div className="base-company-header">
          <button className="back-btn" onClick={() => navigate('/documents?tab=company-profiles')}>
            <span style={{fontSize:'1.4rem',display:'flex',alignItems:'center'}}>&larr;</span>
          </button>
          <span className="company-title">{company.company_name || 'Untitled Company'}</span>
          <span className="base-company-badge">Target Company</span>
        </div>
        <div className="details-grid">
          {/* Left: Company Details */}
          <div className="company-details-card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="section-title">Company Details</h3>
            </div>
            <hr style={{ borderColor: '#fff', opacity: 0.2, margin: '12px 0 24px 0' }} />
            <div className="company-details-grid">
              <div>
                <div className="detail-label">Company Name</div>
                <div className={`detail-value ${!company.company_name ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                  {company.company_name || 'Not Set'}
                </div>
              </div>
              <div>
                <div className="detail-label">Registration Number</div>
                <div className={`detail-value ${!company.reg_number ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                  {company.reg_number || 'Not Set'}
                </div>
              </div>
              <div>
                <div className="detail-label">Tax ID</div>
                <div className={`detail-value ${!company.vat_number ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                  {company.vat_number || 'Not Set'}
                </div>
              </div>
              <div>
                <div className="detail-label">Incorporation Date</div>
                <div className={`detail-value ${!company.incorporation_date ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                  {company.incorporation_date || 'Not Set'}
                </div>
              </div>
              <div>
                <div className="detail-label">Country</div>
                <div className={`detail-value ${!company.base_location ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                  {company.base_location || 'Not Set'}
                </div>
              </div>
              <div>
                <div className="detail-label">Address</div>
                <div className={`detail-value ${!company.registered_address ? 'not-set' : ''}`} style={{ fontWeight: 700 }}>
                  {company.registered_address || 'Not Set'}
                </div>
              </div>
            </div>
          </div>
          {/* Right: Directors and Shareholders */}
          <div className="side-cards">
            {/* Directors Card */}
            <div className="side-card">
              <div className="side-card-title">Directors</div>
              {company.directors && company.directors.length > 0 ? (
                company.directors.map((d, i) => (
                  <div className="side-card-row" key={i}>
                    <span className="side-card-icon">👤</span>
                    <span className="side-card-name">{d.fullName || d.name}</span>
                  </div>
                ))
              ) : (
                <div className="empty-directors">
                  <p>No directors added yet</p>
                </div>
              )}
              <button className="add-director-btn" onClick={() => setShowAddDirectorModal(true)}>+ Add Director</button>
            </div>
            {/* Shareholders Card */}
            <div className="side-card">
              <div className="side-card-title">Shareholders</div>
              {company.shareholders && company.shareholders.length > 0 ? (
                company.shareholders.map((s, i) => (
                  <div className="side-card-row" key={i}>
                    <span className="side-card-icon">🧑‍💼</span>
                    <span className="side-card-name">{s.name}</span>
                    <span className="side-card-meta">{s.percentage || s.percent || '50%'} ownership</span>
                  </div>
                ))
              ) : (
                <div className="empty-shareholders">
                  <p>No shareholders added yet</p>
                </div>
              )}
              <button className="add-shareholder-btn" onClick={() => setShowAddShareholderModal(true)}>+ Add Shareholder</button>
            </div>
          </div>
        </div>
        {/* Add Director Modal */}
        {showAddDirectorModal && (
          <div className="modal-overlay">
            <div className="modal-content styled-modal">
              <h3 className="modal-title">Add Director</h3>
              <input
                className="modal-input"
                value={newDirector.name}
                onChange={e => setNewDirector({ ...newDirector, name: e.target.value })}
                placeholder="Director Name *"
              />
              <input
                className="modal-input"
                value={newDirector.email}
                onChange={e => setNewDirector({ ...newDirector, email: e.target.value })}
                placeholder="Email Address *"
              />
              <input
                className="modal-input"
                value={newDirector.role}
                onChange={e => setNewDirector({ ...newDirector, role: e.target.value })}
                placeholder="Role"
              />
              <input
                className="modal-input"
                value={newDirector.phone}
                onChange={e => setNewDirector({ ...newDirector, phone: e.target.value })}
                placeholder="Phone Number"
              />
              <input
                className="modal-input"
                value={newDirector.appointedDate}
                onChange={e => setNewDirector({ ...newDirector, appointedDate: e.target.value })}
                placeholder="Appointed Date"
              />
              <div className="modal-actions">
                <button className="modal-save-btn" onClick={handleAddDirector} disabled={savingDirector}>
                  {savingDirector ? 'Saving...' : 'Save'}
                </button>
                <button className="modal-cancel-btn" onClick={() => setShowAddDirectorModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {/* Add Shareholder Modal */}
        {showAddShareholderModal && (
          <div className="modal-overlay">
            <div className="modal-content styled-modal">
              <h3 className="modal-title">Add Shareholder</h3>
              <input
                className="modal-input"
                value={newShareholder.name}
                onChange={e => setNewShareholder({ ...newShareholder, name: e.target.value })}
                placeholder="Shareholder Name *"
              />
              <input
                className="modal-input"
                value={newShareholder.percentage}
                onChange={e => setNewShareholder({ ...newShareholder, percentage: e.target.value })}
                placeholder="Ownership Percentage *"
              />
              <select
                className="modal-input"
                value={newShareholder.type}
                onChange={e => setNewShareholder({ ...newShareholder, type: e.target.value })}
              >
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
              </select>
              <input
                className="modal-input"
                value={newShareholder.shares}
                onChange={e => setNewShareholder({ ...newShareholder, shares: e.target.value })}
                placeholder="Number of Shares"
              />
              <div className="modal-actions">
                <button className="modal-save-btn" onClick={handleAddShareholder} disabled={savingShareholder}>
                  {savingShareholder ? 'Saving...' : 'Save'}
                </button>
                <button className="modal-cancel-btn" onClick={() => setShowAddShareholderModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetCompanyDetails; 