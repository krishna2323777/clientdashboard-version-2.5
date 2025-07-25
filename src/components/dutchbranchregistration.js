import React, { useState, useEffect } from 'react';
import './dutchbranchregistration.css';
import ShippingChecklist from './ShippingChecklist';
import DutchRegistration from './dutch';
import { useNavigate } from 'react-router-dom';
import { supabase } from './SupabaseClient';
import { cleanFilePath, getBucketName } from './FormSelection';

const fetchGeneratedDocuments = async (setGeneratedDocuments, setLoading, setError) => {
  try {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');

    const [form6Data, form9Data, form11Data, form13Data] = await Promise.all([
      supabase.from('form_6_submissions').select('*').eq('user_id', user.id),
      supabase.from('form_9_submissions').select('*').eq('user_id', user.id),
      supabase.from('form_11_submissions').select('*').eq('user_id', user.id),
      supabase.from('form_13_submissions').select('*').eq('user_id', user.id)
    ]);

    const allSubmissions = [
      ...(form6Data.data || []).map(s => ({ ...s, formType: 'form-6' })),
      ...(form9Data.data || []).map(s => ({ ...s, formType: 'form-9' })),
      ...(form11Data.data || []).map(s => ({ ...s, formType: 'form-11' })),
      ...(form13Data.data || []).map(s => ({ ...s, formType: 'form-13' }))
    ].sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));

    setGeneratedDocuments(allSubmissions);
  } catch (error) {
    console.error('Error fetching generated documents:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const fetchUploadedDocuments = async (setUploadedDocuments, setLoading, setError) => {
  try {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase.from('kvk_signed_forms').select('*').eq('user_id', user.id);
    if (error) throw error;

    setUploadedDocuments(data);
  } catch (error) {
    console.error('Error fetching uploaded documents:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const handleViewDocument = async (bucketName, filePath) => {
  try {
    const cleanPath = cleanFilePath(filePath);
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucketName)
      .download(cleanPath);

    if (fileError) {
      console.error('File not found in bucket:', fileError);
      throw fileError;
    }

    const url = URL.createObjectURL(fileData);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    console.error('Error viewing file:', error);
    alert(`Error viewing file: ${error.message}. Please try downloading instead.`);
  }
};

const handleDownloadDocument = async (bucketName, filePath) => {
  try {
    const cleanPath = cleanFilePath(filePath);
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucketName)
      .download(cleanPath);

    if (fileError) {
      console.error('Download error:', fileError);
      throw fileError;
    }

    const url = URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanPath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Error downloading file: ' + error.message);
  }
};

const ViewDocuments = () => {
  const [generatedDocuments, setGeneratedDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('none'); // Change default to 'none'
 
  useEffect(() => {
    // Only fetch when tab is selected
    if (activeTab === 'generated') {
      fetchGeneratedDocuments(setGeneratedDocuments, setLoading, setError);
    } else if (activeTab === 'uploaded') {
      fetchUploadedDocuments(setUploadedDocuments, setLoading, setError);
    }
  }, [activeTab]); // Add activeTab as dependency

  return (
    <div className="view-documents-container">
      <div className="view-documents-header">
        <h2>Document Repository</h2>
        <div className="document-tabs">
          <button 
            className={`tab-button ${activeTab === 'generated' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'generated' ? 'none' : 'generated')}
          >
            Generated Documents
          </button>
          <button 
            className={`tab-button ${activeTab === 'uploaded' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'uploaded' ? 'none' : 'uploaded')}
          >
            Uploaded Documents
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading documents...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => {
            if (activeTab === 'generated') {
              fetchGeneratedDocuments(setGeneratedDocuments, setLoading, setError);
            } else if (activeTab === 'uploaded') {
              fetchUploadedDocuments(setUploadedDocuments, setLoading, setError);
            }
          }}>
            Try Again
          </button>
        </div>
      ) : (
        <div className="documents-content">
          {activeTab === 'generated' && (
            <div className="documents-panel">
              <h3>Generated Forms</h3>
              {generatedDocuments.length === 0 ? (
                <p className="no-documents">No generated documents found</p>
              ) : (
                <div className="documents-grid">
                  {generatedDocuments.map((doc, index) => (
                    <div key={index} className="document-card">
                      <div className="document-icon">📄</div>
                      <div className="document-info">
                        <h4>{doc.formType}</h4>
                        <p className="document-date">
                          {new Date(doc.submission_date).toLocaleDateString()}
                        </p>
                        <div className="document-actions">
                          <button className="action-button view" onClick={() => handleViewDocument('kvk-forms', doc.file_path)}>
                            <span className="icon">👁️</span> View
                          </button>
                          <button className="action-button download" onClick={() => handleDownloadDocument('kvk-forms', doc.file_path)}>
                            <span className="icon">⬇️</span> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'uploaded' && (
            <div className="documents-panel">
              <h3>Uploaded Documents</h3>
              {uploadedDocuments.length === 0 ? (
                <p className="no-documents">No uploaded documents found</p>
              ) : (
                <div className="documents-grid">
                  {uploadedDocuments.map((doc, index) => (
                    <div key={index} className="document-card">
                      <div className="document-icon">📎</div>
                      <div className="document-info">
                        <h4>{doc.form_type}</h4>
                        <p className="document-date">{doc.file_path.split('/').pop()}</p>
                        <div className="document-actions">
                          <button className="action-button view" onClick={() => handleViewDocument('kvk-forms', doc.file_path)}>
                            <span className="icon">👁️</span> View
                          </button>
                          <button className="action-button download" onClick={() => handleDownloadDocument('kvk-forms', doc.file_path)}>
                            <span className="icon">⬇️</span> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DutchBranchRegistration = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [expandedForm, setExpandedForm] = useState(null);
  const [activeStep, setActiveStep] = useState('documents');
  const [selectedTab, setSelectedTab] = useState('kvk');
  const navigate = useNavigate();
  const [uploading, setUploading] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadError, setUploadError] = useState(null);

  const toggleForm = (formId) => {
    setExpandedForm(expandedForm === formId ? null : formId);
  };

  const handleGenerateForm = (formKey) => {
    switch (formKey) {
      case 'form6':
        navigate('/kvk-registration');
        break;
      case 'form9':
        navigate('/form-9');
        break;
      case 'form11':
        navigate('/form-11');
        break;
      case 'form13':
        navigate('/form-13');
        break;
      default:
        break;
    }
  };

  const handleFileUpload = async (formKey, file) => {
    setUploading(prev => ({ ...prev, [formKey]: true }));
    setUploadError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to upload files');
      const userId = user.id;
      const filePath = `${userId}/${formKey}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('kvk-forms').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
      setUploadedFiles(prev => ({ ...prev, [formKey]: file.name }));

      const { error: dbError } = await supabase
        .from('kvk_signed_forms')
        .insert({
          user_id: userId,
          form_type: formKey,
          file_path: filePath,
          status: 'uploaded',
        });
      if (dbError) throw dbError;
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [formKey]: false }));
    }
  };

  const handleSupportingDocUpload = async (docType, file) => {
    setUploading(prev => ({ ...prev, [docType]: true }));
    setUploadError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to upload files');
      const userId = user.id;
      const filePath = `${userId}/supporting-docs/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('supporting-docs').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
      setUploadedFiles(prev => ({ ...prev, [docType]: file.name }));

      const { error: dbError } = await supabase
        .from('supporting_docs_uploads')
        .insert({
          user_id: userId,
          doc_type: docType,
          file_path: filePath,
          status: 'uploaded',
        });
      if (dbError) throw dbError;
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleDownloadTemplate = async (formType) => {
    const formTemplates = {
      'form6': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/06-non-resident-legal-entity-company.pdf',
      'form9': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/09-company-branch.pdf',
      'form11': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/11-official-of-a-legal-entity-company.pdf',
      'form13': 'https://production-site-en.kvk.bloomreach.cloud/binaries/content/assets/kvkwebsite-en/categorie/registration/13-form---authorised-representative-business-agent.pdf'
    };

    const url = formTemplates[formType];
    if (!url) {
      console.error('Template URL not found for form type:', formType);
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `KVK-${formType.toUpperCase()}-template.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const renderSupportingDocs = () => {
    return (
      <div className="supporting-docs">
        <div className="form-itemdu345">
          <div 
            className={`form-itemdu ${expandedForm === 'formationDeed' ? 'expanded' : ''}`}
            onClick={() => toggleForm('formationDeed')}
          >
            <div className="form-itemdu-header">
              <div className="form-title">
                <input 
                  type="radio" 
                  checked={expandedForm === 'formationDeed'} 
                  readOnly 
                />
                {expandedForm !== 'formationDeed' && (
                  <h3>Certificate of Formation/Formation Deed</h3>
                )}
              </div>
              <span className="expand-icon">
                {expandedForm === 'formationDeed' ? '▲' : '▼'}
              </span>
            </div>
            
            {expandedForm === 'formationDeed' && (
              <div className="form-itemdu-content">
                <h3 className="form-title-main">Certificate of Formation/Formation Deed</h3>
                <p className="document-description">
                  Official document proving the legal formation of your company
                </p>
                
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Official date of company formation</li>
                    <li>Legal entity type</li>
                    <li>Registration details</li>
                    <li>Authorized share capital (if applicable)</li>
                  </ul>
                </div>

                <div className="variations-section">
                  <h4>Country-Specific Variations</h4>
                  <p>
                    US: Certificate of Formation/Articles of Organization/Incorporation, UK: Certificate of Incorporation, Germany: Handelsregisterauszug, France: Extrait Kbis
                  </p>
                </div>

                <div className="form-actions">
                  <button className="view-sample">
                    👁 View Sample
                  </button>
                  <label htmlFor="file-upload-formationDeed" className="upload-btn" onClick={e => e.stopPropagation()}>
                    {uploading['formationDeed'] ? 'Uploading...' : 'Select File'}
                    <input
                      id="file-upload-formationDeed"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploading['formationDeed']}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.files && e.target.files[0]) {
                          handleSupportingDocUpload('formationDeed', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploadedFiles['formationDeed'] && <span className="upload-success">Uploaded: {uploadedFiles['formationDeed']}</span>}
                  {uploadError && <span className="upload-error">{uploadError}</span>}
                </div>
              </div>
            )}
          </div>
          
          <div 
            className={`form-itemdu ${expandedForm === 'shareholdersPartners' ? 'expanded' : ''}`}
            onClick={() => toggleForm('shareholdersPartners')}
          >
            <div className="form-itemdu-header">
              <div className="form-title">
                <input 
                  type="radio" 
                  checked={expandedForm === 'shareholdersPartners'} 
                  readOnly 
                />
                {expandedForm !== 'shareholdersPartners' && (
                  <h3>Shareholders/Partners Documentation</h3>
                )}
              </div>
              <span className="expand-icon">
                {expandedForm === 'shareholdersPartners' ? '▲' : '▼'}
              </span>
            </div>
            {expandedForm === 'shareholdersPartners' && (
              <div className="form-itemdu-content">
                <h3 className="form-title-main">Shareholders/Partners Documentation</h3>
                <p className="document-description">
                  Document identifying the ownership structure of your company
                </p>
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul>
                    <li>For corporations: Shareholders Register showing ownership percentages</li>
                    <li>For partnerships: Partnership Agreement identifying all partners</li>
                    <li>For LLCs: Operating Agreement or Members Agreement</li>
                  </ul>
                </div>
                <div className="form-actions">
                  <button className="view-sample">👁 View Sample</button>
                  <label htmlFor="file-upload-shareholdersPartners" className="upload-btn" onClick={e => e.stopPropagation()}>
                    {uploading['shareholdersPartners'] ? 'Uploading...' : 'Select File'}
                    <input
                      id="file-upload-shareholdersPartners"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploading['shareholdersPartners']}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.files && e.target.files[0]) {
                          handleSupportingDocUpload('shareholdersPartners', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploadedFiles['shareholdersPartners'] && <span className="upload-success">Uploaded: {uploadedFiles['shareholdersPartners']}</span>}
                  {uploadError && <span className="upload-error">{uploadError}</span>}
                </div>
              </div>
            )}
          </div>

          <div 
            className={`form-itemdu ${expandedForm === 'corporateStructure' ? 'expanded' : ''}`}
            onClick={() => toggleForm('corporateStructure')}
          >
            <div className="form-itemdu-header">
              <div className="form-title">
                <input 
                  type="radio" 
                  checked={expandedForm === 'corporateStructure'} 
                  readOnly 
                />
                {expandedForm !== 'corporateStructure' && (
                  <h3>Corporate Structure Extract</h3>
                )}
              </div>
              <span className="expand-icon">
                {expandedForm === 'corporateStructure' ? '▲' : '▼'}
              </span>
            </div>
            {expandedForm === 'corporateStructure' && (
              <div className="form-itemdu-content">
                <h3 className="form-title-main">Corporate Structure Extract</h3>
                <p className="document-description">
                  Recent extract (not older than 30 days) from the official Company Registrar
                </p>
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Current company status (active/in good standing)</li>
                    <li>Current directors/officials</li>
                    <li>Registered address</li>
                    <li>Registration number</li>
                  </ul>
                </div>
                <div className="form-actions">
                  <button className="view-sample">👁 View Sample</button>
                  <label htmlFor="file-upload-corporateStructure" className="upload-btn" onClick={e => e.stopPropagation()}>
                    {uploading['corporateStructure'] ? 'Uploading...' : 'Select File'}
                    <input
                      id="file-upload-corporateStructure"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploading['corporateStructure']}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.files && e.target.files[0]) {
                          handleSupportingDocUpload('corporateStructure', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploadedFiles['corporateStructure'] && <span className="upload-success">Uploaded: {uploadedFiles['corporateStructure']}</span>}
                  {uploadError && <span className="upload-error">{uploadError}</span>}
                </div>
              </div>
            )}
          </div>

          <div 
            className={`form-itemdu ${expandedForm === 'incumbency' ? 'expanded' : ''}`}
            onClick={() => toggleForm('incumbency')}
          >
            <div className="form-itemdu-header">
              <div className="form-title">
                <input 
                  type="radio" 
                  checked={expandedForm === 'incumbency'} 
                  readOnly 
                />
                {expandedForm !== 'incumbency' && (
                  <h3>Certificate of Incumbency</h3>
                )}
              </div>
              <span className="expand-icon">
                {expandedForm === 'incumbency' ? '▲' : '▼'}
              </span>
            </div>
            {expandedForm === 'incumbency' && (
              <div className="form-itemdu-content">
                <h3 className="form-title-main">Certificate of Incumbency</h3>
                <p className="document-description">
                  Document signed by the registered agent or company secretary
                </p>
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Current directors/officers</li>
                    <li>Shareholders/members</li>
                    <li>Date of incorporation</li>
                    <li>Authorized share capital</li>
                  </ul>
                </div>
                <div className="form-actions">
                  <button className="view-sample">👁 View Sample</button>
                  <label htmlFor="file-upload-incumbency" className="upload-btn" onClick={e => e.stopPropagation()}>
                    {uploading['incumbency'] ? 'Uploading...' : 'Select File'}
                    <input
                      id="file-upload-incumbency"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploading['incumbency']}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.files && e.target.files[0]) {
                          handleSupportingDocUpload('incumbency', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploadedFiles['incumbency'] && <span className="upload-success">Uploaded: {uploadedFiles['incumbency']}</span>}
                  {uploadError && <span className="upload-error">{uploadError}</span>}
                </div>
              </div>
            )}
          </div>

          <div 
            className={`form-itemdu ${expandedForm === 'passport' ? 'expanded' : ''}`}
            onClick={() => toggleForm('passport')}
          >
            <div className="form-itemdu-header">
              <div className="form-title">
                <input 
                  type="radio" 
                  checked={expandedForm === 'passport'} 
                  readOnly 
                />
                {expandedForm !== 'passport' && (
                  <h3>Passport Copy</h3>
                )}
              </div>
              <span className="expand-icon">
                {expandedForm === 'passport' ? '▲' : '▼'}
              </span>
            </div>
            {expandedForm === 'passport' && (
              <div className="form-itemdu-content">
                <h3 className="form-title-main">Passport Copy</h3>
                <p className="document-description">
                  For each director, shareholder, and authorized representative
                </p>
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Must be valid (not expired)</li>
                    <li>Must include all relevant pages with personal information</li>
                    <li>Must be legalized with apostille for remote registrations</li>
                    <li>Color copy preferred</li>
                  </ul>
                </div>
                <div className="form-actions">
                  <button className="view-sample">👁 View Sample</button>
                  <label htmlFor="file-upload-passport" className="upload-btn" onClick={e => e.stopPropagation()}>
                    {uploading['passport'] ? 'Uploading...' : 'Select File'}
                    <input
                      id="file-upload-passport"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploading['passport']}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.files && e.target.files[0]) {
                          handleSupportingDocUpload('passport', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploadedFiles['passport'] && <span className="upload-success">Uploaded: {uploadedFiles['passport']}</span>}
                  {uploadError && <span className="upload-error">{uploadError}</span>}
                </div>
              </div>
            )}
          </div>

          <div 
            className={`form-itemdu ${expandedForm === 'residentialAddress' ? 'expanded' : ''}`}
            onClick={() => toggleForm('residentialAddress')}
          >
            <div className="form-itemdu-header">
              <div className="form-title">
                <input 
                  type="radio" 
                  checked={expandedForm === 'residentialAddress'} 
                  readOnly 
                />
                {expandedForm !== 'residentialAddress' && (
                  <h3>Proof of Residential Address</h3>
                )}
              </div>
              <span className="expand-icon">
                {expandedForm === 'residentialAddress' ? '▲' : '▼'}
              </span>
            </div>
            {expandedForm === 'residentialAddress' && (
              <div className="form-itemdu-content">
                <h3 className="form-title-main">Proof of Residential Address</h3>
                <p className="document-description">
                  For each director, shareholder, and authorized representative
                </p>
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul>
                    <li>Must not be older than 20 days from date of submission</li>
                    <li>Can be bank statement, utility bill, property tax statement, or official government correspondence</li>
                    <li>Must show full name and address</li>
                  </ul>
                </div>
                <div className="form-actions">
                  <button className="view-sample">👁 View Sample</button>
                  <label htmlFor="file-upload-residentialAddress" className="upload-btn" onClick={e => e.stopPropagation()}>
                    {uploading['residentialAddress'] ? 'Uploading...' : 'Select File'}
                    <input
                      id="file-upload-residentialAddress"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploading['residentialAddress']}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.files && e.target.files[0]) {
                          handleSupportingDocUpload('residentialAddress', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {uploadedFiles['residentialAddress'] && <span className="upload-success">Uploaded: {uploadedFiles['residentialAddress']}</span>}
                  {uploadError && <span className="upload-error">{uploadError}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeStep) {
      case 'shipping':
        return <ShippingChecklist />;
      case 'documents':
        return (
          <div className="forms-section">
            <div className="documents-header">
              <h2>Upload Your Documents</h2>
              <div className="document-type-tabs">
                <button 
                  className={`tab-button1 ${selectedTab === 'kvk' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('kvk')}
                >
                  KvK Forms
                </button>
                <button 
                  className={`tab-button1 ${selectedTab === 'supporting' ? 'active' : ''}`}
                  onClick={() => setSelectedTab('supporting')}
                >
                  Supporting Docs
                </button>
              </div>
            </div>
            
            <p className="section-desc">
              {selectedTab === 'kvk' 
                ? 'Upload your completed and signed KvK forms. All forms must be properly signed and legalized with apostille.'
                : 'Upload your supporting documents. All documents must be properly legalized with apostille or consular legalization.'
              }
            </p>

            {selectedTab === 'kvk' ? (
              <div className="form-itemdu345">
                <div 
                  className={`form-itemdu ${expandedForm === 'form6' ? 'expanded' : ''}`}
                  onClick={() => toggleForm('form6')}
                >
                  <div className="form-itemdu-header">
                    <div className="form-title">
                      {expandedForm !== 'form6' && (
                        <h3>Form 6: Registration of a Non-Resident Legal Entity</h3>
                      )}
                    </div>
                    <span className="expand-icon">
                      {expandedForm === 'form6' ? '▲' : '▼'}
                    </span>
                  </div>
                  {expandedForm === 'form6' && (
                    <div className="form-itemdu-expanded-horizontal">
                      <h3 className="form-title-main">Form 6: Registration of a Non-Resident Legal Entity</h3>
                      <div className="form-itemdu-content">
                        <p>Primary registration document for your foreign entity in the Netherlands. Captures essential information about your company structure, activities, and identity.</p>
                        
                        <div className="key-sections">
                          <h4>Key Sections</h4>
                          <ul>
                            <li>Company identification (sections 1.1-1.3)</li>
                            <li>Business activities (sections 2.1-2.5)</li>
                            <li>Address information (sections 2.8-2.9)</li>
                            <li>Contact details (section 2.10)</li>
                            <li>Employee information (section 2.11)</li>
                            <li>Legal form and structure (sections 3.1-3.14)</li>
                            <li>Non-mailing preferences (section 5.1)</li>
                            <li>Temporary workforce provision (section 6.1)</li>
                          </ul>
                        </div>

                        <div className="signature-requirements">
                          <h4>Signature Requirements</h4>
                          <ul>
                            <li>Must be signed at the bottom of the last page by an authorized representative</li>
                            <li>Signature must be legalized by a Notary</li>
                            <li>If Form 13 is relevant, confirm this on page 4 before signing</li>
                          </ul>
                        </div>

                        <div className="form-actions">
                          <button className="download-btn" onClick={() => handleDownloadTemplate('form6')}>
                            ⬇ Download Form Template
                          </button>
                          <button className="generate-btn" onClick={() => handleGenerateForm('form6')}>
                            ⚡ Generate Form 6
                          </button>
                          <label htmlFor={`file-upload-form6`} className="upload-btn" onClick={e => e.stopPropagation()}>
                            {uploading['form6'] ? 'Uploading...' : 'Select File'}
                            <input
                              id={`file-upload-form6`}
                              type="file"
                              accept="application/pdf"
                              style={{ display: 'none' }}
                              disabled={uploading['form6']}
                              onChange={e => {
                                e.stopPropagation();
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload('form6', e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          {uploadedFiles['form6'] && <span className="upload-success">Uploaded: {uploadedFiles['form6']}</span>}
                          {uploadError && <span className="upload-error">{uploadError}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="form-itemdu"
                  onClick={() => toggleForm('form9')}
                >
                  <div className="form-itemdu-header">
                    <div className="form-title">
                      {expandedForm !== 'form9' && (
                        <h3>Form 9: Registration of a Branch Office</h3>
                      )}
                    </div>
                    <span className="expand-icon">
                      {expandedForm === 'form9' ? '▲' : '▼'}
                    </span>
                  </div>
                  {expandedForm === 'form9' && (
                    <div className="form-itemdu-content">
                      <h3 className="form-title-main">Form 9: Registration of a Branch Office</h3>
                      <p>Documents the details of your branch operation in the Netherlands. Establishes the local presence that will conduct business activities.</p>
                      
                      <div className="key-sections">
                        <h4>Key Sections</h4>
                        <ul>
                          <li>Company identification (sections 1.1-1.2)</li>
                          <li>Branch details (section 2.1)</li>
                          <li>Previous branch information (if continuation of existing branch)</li>
                        </ul>
                      </div>

                      <div className="signature-requirements">
                        <h4>Signature Requirements</h4>
                        <ul>
                          <li>Sign at the designated signature field at the bottom of the form</li>
                          <li>Ensure the signature matches the authorized representative identified in Form 11</li>
                        </ul>
                      </div>

                      <div className="form-actions">
                        <button className="download-btn" onClick={() => handleDownloadTemplate('form9')}>
                          ⬇ Download Form Template
                        </button>
                        <button className="generate-btn" onClick={() => handleGenerateForm('form9')}>
                          ⚡ Generate Form 9
                        </button>
                        <label htmlFor={`file-upload-form9`} className="upload-btn" onClick={e => e.stopPropagation()}>
                          {uploading['form9'] ? 'Uploading...' : 'Select File'}
                          <input
                            id={`file-upload-form9`}
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            disabled={uploading['form9']}
                            onChange={e => {
                              e.stopPropagation();
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('form9', e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {uploadedFiles['form9'] && <span className="upload-success">Uploaded: {uploadedFiles['form9']}</span>}
                        {uploadError && <span className="upload-error">{uploadError}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="form-itemdu"
                  onClick={() => toggleForm('form11')}
                >
                  <div className="form-itemdu-header">
                    <div className="form-title">
                      {expandedForm !== 'form11' && (
                        <h3>Form 11: Registration of an Official of a Legal Entity</h3>
                      )}
                    </div>
                    <span className="expand-icon">
                      {expandedForm === 'form11' ? '▲' : '▼'}
                    </span>
                  </div>
                  {expandedForm === 'form11' && (
                    <div className="form-itemdu-content">
                      <h3 className="form-title-main">Form 11: Registration of an Official of a Legal Entity</h3>
                      <p>Registers the directors, board members, or other officials who have authority to represent your company in the Netherlands.</p>
                      
                      <div className="key-sections">
                        <h4>Key Sections</h4>
                        <ul>
                          <li>Company identification (sections 1.1-1.2)</li>
                          <li>Official's personal details (sections 2.1-2.8)</li>
                          <li>Official's role and authorities (sections 3.1-3.5)</li>
                          <li>Date of appointment (section 4.1)</li>
                        </ul>
                      </div>

                      <div className="signature-requirements">
                        <h4>Signature Requirements</h4>
                        <ul>
                          <li>The form must be signed twice:</li>
                          <li>At section 12 to confirm their authorities</li>
                          <li>In section 11 to validate the entire form</li>
                          <li>Ensure consistency in signature across all forms</li>
                        </ul>
                      </div>

                      <div className="form-actions">
                        <button className="download-btn" onClick={() => handleDownloadTemplate('form11')}>
                          ⬇ Download Form Template
                        </button>
                        <button className="generate-btn" onClick={() => handleGenerateForm('form11')}>
                          ⚡ Generate Form 11
                        </button>
                        <label htmlFor={`file-upload-form11`} className="upload-btn" onClick={e => e.stopPropagation()}>
                          {uploading['form11'] ? 'Uploading...' : 'Select File'}
                          <input
                            id={`file-upload-form11`}
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            disabled={uploading['form11']}
                            onChange={e => {
                              e.stopPropagation();
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('form11', e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {uploadedFiles['form11'] && <span className="upload-success">Uploaded: {uploadedFiles['form11']}</span>}
                        {uploadError && <span className="upload-error">{uploadError}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="form-itemdu"
                  onClick={() => toggleForm('form13')}
                >
                  <div className="form-itemdu-header">
                    <div className="form-title">
                      {expandedForm !== 'form13' && (
                        <h3>Form 13: Registration of an Authorized Representative (Optional)</h3>
                      )}
                    </div>
                    <span className="expand-icon">
                      {expandedForm === 'form13' ? '▲' : '▼'}
                    </span>
                  </div>
                  {expandedForm === 'form13' && (
                    <div className="form-itemdu-content">
                      <h3 className="form-title-main">Form 13: Registration of an Authorized Representative (Optional)</h3>
                      <p>Used when appointing an authorized representative who is not an official of your company but needs legal authority to act on behalf of your branch.</p>
                      
                      <div className="key-sections">
                        <h4>Key Sections</h4>
                        <ul>
                          <li>Company identification (sections 1.1-1.2)</li>
                          <li>Representative's details (sections 2.1-2.7)</li>
                          <li>Authorization details (sections 3.1-3.4)</li>
                        </ul>
                      </div>

                      <div className="signature-requirements">
                        <h4>Signature Requirements</h4>
                        <ul>
                          <li>Sign at the designated signature field</li>
                          <li>Clearly specify the scope of authority being granted</li>
                          <li>If using Form 13, remember to indicate this on page 4 of Form 6</li>
                        </ul>
                      </div>

                      <div className="form-actions">
                        <button className="download-btn" onClick={() => handleDownloadTemplate('form13')}>
                          ⬇ Download Form Template
                        </button>
                        <button className="generate-btn" onClick={() => handleGenerateForm('form13')}>
                          ⚡ Generate Form 13
                        </button>
                        <label htmlFor={`file-upload-form13`} className="upload-btn" onClick={e => e.stopPropagation()}>
                          {uploading['form13'] ? 'Uploading...' : 'Select File'}
                          <input
                            id={`file-upload-form13`}
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            disabled={uploading['form13']}
                            onChange={e => {
                              e.stopPropagation();
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('form13', e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {uploadedFiles['form13'] && <span className="upload-success">Uploaded: {uploadedFiles['form13']}</span>}
                        {uploadError && <span className="upload-error">{uploadError}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              renderSupportingDocs()
            )}
          </div>
        );
      case 'post-registration':
        return <DutchRegistration />;
      case 'view-documents':
        return <ViewDocuments />;
      default:
        return <div>Select a step to continue</div>;
    }
  };

  return (
    <div className="registration-container">
      <div className="content-wrapper">
        <div className="registration-header">
          <h1>Complete Your Dutch Branch Registration</h1>
          <p className="subtitle">
            To finalize your Dutch branch registration, you'll need to upload signed KvK forms and legalized supporting documents. Follow the steps below to ensure your submission is complete and compliant with Dutch requirements.
          </p>
        </div>

        <div className="stepper-nav">
          <div 
            className={`stepper-step ${activeStep === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveStep('documents')}
          >
            Document Upload
          </div>
          <div 
            className={`stepper-step ${activeStep === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveStep('shipping')}
          >
            Shipping Checklist
          </div>
          <div 
            className={`stepper-step ${activeStep === 'post-registration' ? 'active' : ''}`}
            onClick={() => setActiveStep('post-registration')}
          >
            Post-Registration Steps
          </div>
          <div 
            className={`stepper-step ${activeStep === 'view-documents' ? 'active' : ''}`}
            onClick={() => setActiveStep('view-documents')}
          >
            View Documents
          </div>
        </div>

        <div className="main-contentdutch">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DutchBranchRegistration;