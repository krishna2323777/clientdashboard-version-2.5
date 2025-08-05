// src/components/KVKRegistrationForm.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDocument } from 'pdf-lib';
import { mapFormDataToPdf } from './pdfDataMapper';
import './Form11.css';
import { supabase } from './SupabaseClient';

function Form11() {
  // Set default values to match the field names in pdfDataMapper.js
  const defaultValues = {
    section1LegalEntityName: "",
    section1RegisteredOffice: "",
    section1IsRegistered: "",
    section1KvkNumber: "",
    
    section2NaturalPersonCheckbox: [],
    section2LegalEntityCheckbox: [],
    
    section3Surname: "",
    section3GivenNames: "",
    section3CitizenServiceNumber: "",
    section3DateOfBirth: "",
    section3PlaceOfBirth: "",
    section3CountryOfBirth: "",
    section3Gender: "",
    section3PrivateAddress: "",
    
    section4Position: "",
    section4DirectorWithBoard: "",
    section4DirectorType: "",
    section4IsShareholder: "",
    section4ShareholderDate: "",
    section4HasStatutoryTitle: "",
    section4StatutoryTitle: "",
    section4OfficialAuthority: "",
    section4positionStartDate: "",
    section4MoreOfficials: "",
    section4MoreOfficialsType: [],
    
    section5Surname: "",
    section5GivenNames: "",
    section5BSN: "",
    section5DateOfBirth: "",
    section5PlaceOfBirth: "",
    section5CountryOfBirth: "",
    section5Gender: "",
    section5PrivateAddress: "",
    
    section6Position: "",
    section6DirectorWithBoard: "",
    section6DirectorType: "",
    section6IsShareholder: "",
    section6ShareholderDate: "",
    section6HasStatutoryTitle: "",
    section6StatutoryTitle: "",
    section6OfficialAuthority: "",
    section6PositionStartDate: "",
    section6MoreOfficials: "",
    section6MoreOfficialsType: [],
    
    section7EntityName: "",
    section7EntityAddress: "",
    section7EntityKvkNumber: "",
    section7ForeignRegNumber: "",
    section7RegisterName: "",
    section7RegisteringAuthority: "",
    section7SignatureName: "",
    
    section11SignatureName: "",
    section11SignatureEmail: "",
    section11SignaturePhone: "",
    section11SignatureDate: "",
    
    section13SignatureName: "",
    section13SignatureDate: ""
  };

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [pdfExists, setPdfExists] = useState(true);
  const [publicUrl, setPublicUrl] = useState(null);
  
  // Use local PDF file path
  const pdfUrl = process.env.PUBLIC_URL + '/assets/form 11.pdf';
  

useEffect(() => {
  const checkPdfExists = async () => {
      try {
          console.log('Checking PDF at path:', pdfUrl);
          const response = await fetch(pdfUrl, { method: 'HEAD' });
          
          if (!response.ok) {
              console.error('PDF file not found:', response.status, response.statusText);
              setPdfExists(false);
              setError(`PDF template not found (${response.status}). Please check: ${pdfUrl}`);
          } else {
              const contentType = response.headers.get('content-type');
              if (!contentType?.includes('application/pdf')) {
                  console.warn('Resource is not a PDF:', contentType);
              }
              setPdfExists(true);
          }
      } catch (err) {
          console.error('Error checking PDF:', err);
          setPdfExists(false);
          setError(`Error accessing PDF template: ${err.message}`);
      }
  };
  
  checkPdfExists();
}, [pdfUrl]);
  
// Generate PDF only (no storage) when form is submitted
const onSubmit = async (data) => {
  console.log("Form submission data:", {
    section4MoreOfficials: data.section4MoreOfficials,
    section4MoreOfficialsType: data.section4MoreOfficialsType,
    section6Position: data.section6Position,
    section6DirectorWithBoard: data.section6DirectorWithBoard,
    section6DirectorType: data.section6DirectorType
  });
  setIsProcessing(true);
  setError(null);
  
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to generate forms');
    }

    if (!pdfExists) {
      throw new Error(`Cannot generate PDF. Template file not found at: ${pdfUrl}`);
    }

    // Load the PDF document
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to load PDF template: ${response.statusText}`);
    }

    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Map form data to PDF
    const modifiedPdfDoc = await mapFormDataToPdf(pdfDoc, data);
    
    // Generate PDF bytes and create blob for preview
    const pdfBytes = await modifiedPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    // Create local URL for preview only (not storing in Supabase yet)
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    setFormData(data); // Store form data for later use when downloading
    
    setIsProcessing(false);
  } catch (error) {
    console.error('Error generating PDF:', error);
    setError(error.message);
    setIsProcessing(false);
  }
};

// Add state for storing form data
  const [formData, setFormData] = useState(null);
  // Add state for custom confirmation popup
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  
  // Function to map data from BranchRegistrationRequirements to Form11
  const mapBranchDataToForm11 = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Fetch branch registration data
      const { data: branchData, error: branchError } = await supabase
        .from('branch_registration_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (branchError && branchError.code !== 'PGRST116') {
        console.error('Error fetching branch data:', branchError);
        return;
      }

      // Fetch company info data
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Error fetching company data:', companyError);
        return;
      }

      // Map company data to Form11 fields
      if (branchData) {
        // Section 1 - Legal Entity Details
        setValue('section1LegalEntityName', branchData.company_name || '');
        setValue('section1RegisteredOffice', branchData.registered_office || '');
        setValue('section1IsRegistered', branchData.reg_number ? 'yes' : 'no');
        setValue('section1KvkNumber', branchData.reg_number || '');
      }

      // Map officials data if available
      if (branchData?.officials_data && branchData.officials_data.length > 0) {
        const firstOfficial = branchData.officials_data[0];
        
        // Section 2 - Legal personality (assuming natural person)
        setValue('section2NaturalPersonCheckbox', ['natural']);
        
        // Section 3 - Natural person details
        if (firstOfficial.full_name) {
          const nameParts = firstOfficial.full_name.split(',');
          setValue('section3Surname', nameParts[0] || '');
          setValue('section3GivenNames', nameParts[1] || '');
        }
        setValue('section3CitizenServiceNumber', firstOfficial.passport_number || '');
        setValue('section3DateOfBirth', firstOfficial.date_of_birth || '');
        setValue('section3PlaceOfBirth', firstOfficial.place_of_birth || '');
        setValue('section3CountryOfBirth', firstOfficial.country_of_birth || '');
        setValue('section3PrivateAddress', firstOfficial.residential_address || '');
        
        // Section 4 - Position details
        setValue('section4Position', firstOfficial.role === 'Director' ? 'director' : 'supervisoryBoardMember');
        setValue('section4OfficialAuthority', firstOfficial.authorities || 'sole');
        setValue('section4positionStartDate', firstOfficial.appointment_date || '');
        
        // Section 11 - Signature
        setValue('section11SignatureName', firstOfficial.full_name || '');
        setValue('section11SignatureEmail', firstOfficial.email || '');
        setValue('section11SignaturePhone', firstOfficial.phone || '');
        setValue('section11SignatureDate', new Date().toISOString().split('T')[0]);
      }

      console.log('Data mapped from BranchRegistrationRequirements to Form11');
    } catch (error) {
      console.error('Error mapping data:', error);
    }
  };

// Show confirmation popup
const handleDownloadClick = () => {
  if (!downloadUrl || !formData) return;
  setShowConfirmPopup(true);
};

// Cancel download
const cancelDownload = () => {
  console.log('Download cancelled by user');
  setShowConfirmPopup(false);
};

// Handle PDF download and storage after confirmation
const handlePdfDownload = async () => {
  if (!downloadUrl || !formData) return;
  
  // Close the confirmation popup
  setShowConfirmPopup(false);
  
  try {
    setIsProcessing(true);
    setError(null); // Clear any previous errors
    
    console.log('Starting PDF download and storage process');
    
    // Get user information
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to save forms');
    }
    
    console.log('User authenticated:', user.id);
    
    // First trigger browser download to ensure user gets the file
    console.log('Triggering browser download');
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'kvk-form-11.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Now load the PDF again for server-side storage
    console.log('Loading PDF template for storage');
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to load PDF template: ${response.statusText}`);
    }

    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Map form data to PDF
    console.log('Mapping form data to PDF');
    const modifiedPdfDoc = await mapFormDataToPdf(pdfDoc, formData);
    
    // Generate PDF bytes and create blob for storage
    const pdfBytes = await modifiedPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    // Create user-specific folder path using user ID
    const userFolder = user.id;
    // Generate unique filename
    const timestamp = Date.now();
    // Use user ID folder structure
    const filepath = `${userFolder}/form11_${timestamp}.pdf`;

    console.log('Uploading PDF to storage path:', filepath);
    
    // Upload PDF to Supabase Storage in user-specific folder
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('form-11')
      .upload(filepath, blob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true // Use upsert in case the file already exists
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Error uploading PDF: ${uploadError.message}`);
    }
    
    console.log('PDF uploaded successfully:', uploadData);
    
    // Prepare form data for database insertion
    const formDataRecord = {
      user_id: user.id,
      form_type: 'form-11',
      file_path: filepath,
      submission_date: new Date().toISOString(),
      form_data: {
        legal_entity: {
          name: formData.section1LegalEntityName,
          registered_office: formData.section1RegisteredOffice,
          kvk_number: formData.section1KvkNumber
        },
        official_type: formData.section2NaturalPersonCheckbox?.length > 0 ? 'natural_person' : 'legal_entity',
        natural_person: formData.section2NaturalPersonCheckbox?.length > 0 ? {
          surname: formData.section3Surname,
          given_names: formData.section3GivenNames,
          bsn: formData.section3CitizenServiceNumber,
          date_of_birth: formData.section3DateOfBirth,
          place_of_birth: formData.section3PlaceOfBirth,
          gender: formData.section3Gender
        } : null,
        position_details: {
          position: formData.section4Position,
          director_type: formData.section4DirectorType,
          authority: formData.section4OfficialAuthority,
          start_date: formData.section4positionStartDate
        },
        signature: {
          name: formData.section11SignatureName,
          email: formData.section11SignatureEmail,
          phone: formData.section11SignaturePhone,
          date: formData.section11SignatureDate
        }
      }
    };
    
    console.log('Saving form metadata to database:', formDataRecord);

    // Save form metadata to database
    const { data: insertData, error: dbError } = await supabase
      .from('form_11_submissions')
      .insert(formDataRecord);

    if (dbError) {
      console.error('Database insertion error:', dbError);
      throw new Error(`Error saving form data: ${dbError.message}`);
    }
    
    console.log('Form metadata saved successfully:', insertData);
    // Show success message in UI instead of alert
    setError(null); // Clear any previous errors
    // Success is already shown by the PDF preview box

  } catch (err) {
    console.error('Error processing PDF:', err);
    setError(`Failed to process PDF: ${err.message}`);
  } finally {
    setIsProcessing(false);
  }
};

  // Clean up the URL when component unmounts
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  // Auto-map data from BranchRegistrationRequirements when component loads
  useEffect(() => {
    mapBranchDataToForm11();
  }, []);

  // Add function to download blank form
  const downloadBlankForm = () => {
    if (pdfExists) {
    window.open(pdfUrl, '_blank');
      } else {
      setError(`Cannot download form. PDF template not found at: ${pdfUrl}`);
    }
  };

  // Function to handle regenerating the PDF
  const handleRegeneratePdf = () => {
    // Clear the download URL to show the form again
    setDownloadUrl(null);
    // Keep the form data so user doesn't have to re-enter everything
    setIsProcessing(false);
    console.log('Regenerating PDF - form reset for editing');
  };

  return (
    <div className="registration-form">
      <h1>KVK Form 11 - Registration of a legal entity official</h1>
      
      {error && <div className="error-message">{error}</div>}
      

      
      {!pdfExists && (
        <div className="note-box error-note">
          <p><strong>Important:</strong> The PDF template file could not be found. Please make sure the file exists at: <code>{pdfUrl}</code></p>
          <p>You need to add the KVK Form 11 PDF template to your project in the assets folder.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1 - Details of the legal entity */}
        <div className="form-section legal-entity">
          <h2>1 Details of the legal entity</h2>
          
          <div className="form-note">
            <div className="form-note-heading">Notes on 1.1 and 1.2</div>
            <div className="form-note-content">
              KVK needs to know for which legal entity you are registering the official.
              The details we need are: the name, place of business, and if the legal entity
              is already registered, the KVK number.
            </div>
          </div>
          
          <div className="form-field">
            <label>1.1 For which legal entity is the official (or members) being registered?</label>
            <label>the name of the legal entity</label>
            <input {...register("section1LegalEntityName")} />
            <label>town/city of registered office 
            </label>
            <input {...register("section1RegisteredOffice")} />
          </div>
          
          <div className="form-field">
            <label>1.2 Is the legal entity already registered at KVK?</label>
            <div className="radio-field">
            <label>
                <input type="radio" value="no" {...register("section1IsRegistered")} />
                <span>no</span>
            </label>
              <div className="form-note-inline">Include this form with the form in which you register the legal entity.</div>
          </div>
          
            <div className="radio-field">
            <label>
                <input type="radio" value="yes" {...register("section1IsRegistered")} />
                <span>yes, the KVK number is</span>
            </label>
              {watch("section1IsRegistered") === "yes" && (
                <input {...register("section1KvkNumber")} />
              )}
            </div>
          </div>
        </div>
        
        {/* Section 2 - Legal personality of the official */}
        <div className="form-section legal-personality">
          <h2>2 Legal personality of the official</h2>
          
          <div className="form-note">
            <div className="form-note-heading">Notes on 2.1</div>
            <div className="form-note-content">
              The position of official can be held by a natural person, a commercial/
              limited partnership (vof/cv), or a legal entity. <br /> <br />
              By a legal entity, we mean, among others: a bv (private limited company),  
          nv (public limited company), coöperatie (cooperative), onderlinge waarborgmaatschappij (mutual insurance association), stichting (foundation), or vereniging (association).
          </div>
          </div>
        
            <div className="form-field">
            <label>2.1 Indicate who is taking up the position of official, and go to the relevant question.</label>
            <div>It is possible to tick both answers</div>
            
            <div className="checkbox-field">
              <label>
                <input type="checkbox" value="natural" {...register("section2NaturalPersonCheckbox", { valueAsArray: true })} />
                <span>a natural person</span>
              </label>
              <div className="form-note-inline">➞ Go to question 3.</div>
            </div>
            
            <div className="checkbox-field">
              <label>
                <input type="checkbox" value="entity" {...register("section2LegalEntityCheckbox", { valueAsArray: true })} />
                <span>a partnership or legal entity</span>
              </label>
              <div className="form-note-inline">➞ Go to question 7.</div>
            </div>
            </div>
       
            </div>
            
        {/* Section 3 - Details for a natural person */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && (
          <div className="form-section natural-person">
            <h2>3 Details for a natural person</h2>
            
            <div className="form-note">
              <div className="form-note-heading">Notes on 3.1</div>
              <div className="form-note-content">
                The Citizen Service Number (BSN) is a social security number. Your BSN can be
                found, for example, in a Dutch passport or on a Dutch driving license.
              </div>
              <div className="form-note-content">
              <br />The Business Register is linked to the municipal personal records database (BRP)
                in the Netherlands. If you are not registered (or are registered incorrectly) in the
                BRP, you must first ask your municipality to make the appropriate corrections. <br /> <br />
                When you live abroad and have a BSN, you are enrolled in the BRP with your
                foreign home address. In this case, also specify your BSN.
               
              </div>
              <div className="form-note-content please-note">
                <strong>Please note</strong><br />
        
                Persons moving abroad (or moving to a new address abroad) should inform
                KVK of this change of address.
              </div>
            </div>
            
            <div className="form-field">
              <label>3.1 What are the details of the official?</label>
              
              <div className="input-group">
                <label>surname</label>
                <input {...register("section3Surname")} />
            </div>
              
              <div className="input-group">
                <label>given name(s) (in full)</label>
                <input {...register("section3GivenNames")} />
          </div>
              
              <div className="input-group">
                <label>citizen service number</label>
                <input {...register("section3CitizenServiceNumber")} />
              </div>
              
              <div className="input-group">
                <label>date of birth</label>
                <input {...register("section3DateOfBirth")} placeholder="DD-MM-YYYY" />
            </div>
            
              <div className="input-group">
                <label>place of birth</label>
                <input {...register("section3PlaceOfBirth")} />
            </div>
              
              <div className="input-group">
                <label>country of birth (if not the Netherlands)</label>
                <input {...register("section3CountryOfBirth")} />
          </div>
          
              <div className="input-group">
                <label>gender</label>
                <div className="radio-inline">
              <label>
                    <input type="radio" value="male" {...register("section3Gender")} />
                    <span>male</span>
                  </label>
                  <label>
                    <input type="radio" value="female" {...register("section3Gender")} />
                    <span>female</span>
              </label>
            </div>
            </div>
            
              <div className="input-group">
                <label>private address</label>
                <textarea {...register("section3PrivateAddress")} rows="3" />
              </div>
            </div>
              </div>
            )}
            
        {/* Section 3.2 - Signature of the official */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && (
          <div className="form-section signature-of-official">
            <div className="form-note">
              <div className="form-note-heading">Notes on 3.2</div>
              <div className="form-note-content">
                An official with the function of <strong>director</strong> must personally visit a KVK office and 
                show valid proof of identity.
                <br /><br />
                The following documents will be accepted as proof of identity:
                <ul className="document-list">
                  <li>Dutch driving license</li>
                  <li>European identity card</li>
                  <li>Passport</li>
                  <li>Foreign Nationals Identity Card</li>
                </ul>
              </div>
            </div>
            
            <div className="form-field">
              <label>3.2 Signature of the official (by pen, not a copy)</label>
              <div className="signature-box">
                <p className="signature-note">Signature will be added when submitting the form in person</p>
              </div>
          </div>
        </div>
        )}
        
        {/* Section 4 - Position held by the official */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && (
          <div className="form-section position-details">
            <h2>4 Position held by the official</h2>
            
            <div className="form-note">
              <div className="form-note-heading">Notes on 4.1 and 4.2</div>
              <div className="form-note-content">
              In the case of a bv/nv, tasks within the board can be divided between executive 
              and non-executive directors. This is only possible if it is specified in the articles  
              of association.
                <br /><br />
                In the case of a bv, nv, or a company formally registered abroad, the 'position' of sole shareholder may be held in combination with other positions. <br /><br />
              </div>
              <div className="form-note-heading">Example</div>
              <div className="form-note-content">
              Ms Potts becomes director of a private limited company (bv), and comes  
              to own all of the company shares. At question 4.1 she ticks 'director', and at 
              question 4.2 she ticks 'yes', as she is also the 'sole shareholder'. 
              </div>
            </div>
          


            <div className="form-field position-field">
              <label>4.1 What position is held by the official?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="supervisoryBoardMember" {...register("section4Position")} />
                  <span>supervisory board member</span>
              </label>
            </div>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="liquidator" {...register("section4Position")} />
                  <span>liquidator</span>
              </label>
            </div>

              <div className="radio-field">
                  <label>
                  <input type="radio" value="soleShareholder" {...register("section4Position")} />
                  <span>sole shareholder (only)</span>
                  </label>
                <div className="sub-field">
                  <div className="form-note-inline">➞ Go to question 4.5, date on which the position was taken up</div>
                </div>
              </div>
              
              <div className="radio-field">
                  <label>
                  <input type="radio" value="director" {...register("section4Position")} />
                  <span>director</span>
                  </label>
              </div>
             
              
              
              {watch("section4Position") && watch("section4Position") === "director" && (
                <div className="sub-field">
                  <label>
                    does it concern a director of a bv/nv with a unitary board (one-tier board)?
                  </label>
                  <div className="radio-field">
                  <label>
                      <input type="radio" value="no" {...register("section4DirectorWithBoard")} />
                      <span>no</span>
                  </label>
                  </div>
                  <div className="radio-field">
                  <label>
                      <input type="radio" value="yes" {...register("section4DirectorWithBoard")} />
                      <span>yes</span>
                  </label>
                  </div>
                  
                  {watch("section4DirectorWithBoard") === "yes" && (
                    <div className="radio-field sub-field">
                      <div className="form-note-inline">If yes:</div>
                      <div className="radio-inline">
                  <label>
                          <input type="radio" value="executive" {...register("section4DirectorType")} />
                          <span>executive director</span>
                  </label>
                  <label>
                          <input type="radio" value="nonExecutive" {...register("section4DirectorType")} />
                          <span>non-executive director</span>
                  </label>
                </div>
                    </div>
                  )}
              </div>
            )}
            </div>
       

          <div className="form-field">
              <label>4.2 Is this official also the sole shareholder?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="no" {...register("section4IsShareholder")} />
                  <span>no</span>
              </label>
            </div>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="yes" {...register("section4IsShareholder")} />
                  <span>yes, also the sole shareholder as of</span>
              </label>
                {watch("section4IsShareholder") === "yes" && (
                  <input {...register("section4ShareholderDate")} />
                )}
              </div>
            </div>
          </div>        
        )}
        
        {/* Section 4.3 - Statutory title */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && (
          <div className="form-section statutory-title">
            <div className="form-note">
              <div className="form-note-heading">Notes on 4.3</div>
              <div className="form-note-content">
                You only need to specify a function title if it is different from the position.
                For example: the official's function title is 'director'. However, this person can
                also have a statutory title. For example: the articles of association state that the
                person has the title of 'managing director'. You enter this title below.
            </div>
          </div>

          <div className="form-field">
              <label>4.3 Does the official have a statutory title?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="no" {...register("section4HasStatutoryTitle")} />
                  <span>no</span>
              </label>
            </div>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="yes" {...register("section4HasStatutoryTitle")} />
                  <span>yes, namely</span>
              </label>
                {watch("section4HasStatutoryTitle") === "yes" && (
                  <input {...register("section4StatutoryTitle")} />
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Section 4.4-4.6 Authority details */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && (
          <div className="form-section authority">
            <div className="form-note">
              <div className="form-note-heading">Notes on 4.4</div>
              <div className="form-note-content">
                In the case of an official of a <strong>foreign</strong> legal entity, any additional restrictions in
                authority under the applicable foreign law must be submitted using form 18
                ('Additional information').
            </div>
          </div>

          <div className="form-field">
              <label>4.4 What authority does the official have?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="none" {...register("section4OfficialAuthority")} />
                  <span>no authority</span>
              </label>
            </div>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="sole" {...register("section4OfficialAuthority")} />
                  <span>sole authority</span>
              </label>
            </div>
              
              <div className="radio-field">
                <label>
                  <input type="radio" value="joint" {...register("section4OfficialAuthority")} />
                  <span>joint authority</span>
                </label>
          </div>
        </div>
          
          <div className="form-field">
              <label>4.5 Date on which the official took up the position</label>
              <input {...register("section4positionStartDate")} placeholder="DD-MM-YYYY" />
          </div>

          <div className="form-field">
              <label>4.6 Do you want to register more officials?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="no" {...register("section4MoreOfficials")} />
                  <span>no</span>
              </label>
                <div className="form-note-inline">➞ Go to section 11, Signature.</div>
            </div>
          
            <div className="radio-field">
              <label>
                  <input type="radio" value="yes" {...register("section4MoreOfficials")} />
                  <span>yes</span>
              </label>
          
                {watch("section4MoreOfficials") === "yes" && (
                  <div className="checkbox-group">
                    <div className="checkbox-field">
            <label>
                        <input type="checkbox" value="natural" {...register("section4MoreOfficialsType", { valueAsArray: true })} />
                        <span>a natural person</span>
            </label>
                      <div className="form-note-inline">➞ Go to question 5.</div>
          </div>
          
                    <div className="checkbox-field">
            <label>
                        <input type="checkbox" value="entity" {...register("section4MoreOfficialsType", { valueAsArray: true })} />
                        <span>a partnership/legal entity</span>
            </label>
                      <div className="form-note-inline">➞ Go to question 7.</div>
          </div>
        </div>
            )}
          </div>
            </div>
          </div>
        )}
        
        {/* Section 5 - Details for additional natural person */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && watch("section4MoreOfficials") === "yes" && watch("section4MoreOfficialsType")?.includes("natural") && (
          <div className="form-section additional-natural-person">
            <h2>5 Details for a natural person</h2>
            
            <div className="form-note">
              <div className="form-note-heading">Notes on 5.1</div>
              <div className="form-note-content">
                The Citizen Service Number (BSN) is a social security number. Your BSN can be
                found, for example, in a Dutch passport or on a Dutch driving license.
              </div>
              <div className="form-note-content">
                The Business Register is linked to the municipal personal records database (BRP)
                in the Netherlands. If you are not registered (or are registered incorrectly) in the
                BRP, you must first ask your municipality to make the appropriate corrections.<br /><br />
                When you live abroad and have a BSN, you are enrolled in the BRP with your
                foreign home address. In this case, also specify your BSN.
                <br /><br />
              </div>
              <div className="form-note-content please-note">
                <strong>Please note</strong><br />
                
                Persons moving abroad (or moving to a new address abroad) should inform
                KVK of this change of address.
              </div>
            </div>
            
            <div className="form-field">
              <label>5.1 What are the details of the official?</label>
              
              <div className="input-group">
                <label>surname</label>
                <input {...register("section5Surname")} />
            </div>
            
              <div className="input-group">
                <label>given name(s) (in full)</label>
                <input {...register("section5GivenNames")} />
            </div>
            
              <div className="input-group">
                <label>BSN number (required)</label>
                <input {...register("section5BSN")} />
            </div>
            
              <div className="input-group">
                <label>date of birth</label>
                <input {...register("section5DateOfBirth")} placeholder="DD-MM-YYYY" />
            </div>
            
              <div className="input-group">
                <label>place of birth</label>
                <input {...register("section5PlaceOfBirth")} />
            </div>
            
              <div className="input-group">
                <label>country of birth (if not the Netherlands)</label>
                <input {...register("section5CountryOfBirth")} />
          </div>
          
              <div className="input-group">
                <label>gender</label>
                <div className="radio-inline">
              <label>
                    <input type="radio" value="male" {...register("section5Gender")} />
                    <span>male</span>
                  </label>
                  <label>
                    <input type="radio" value="female" {...register("section5Gender")} />
                    <span>female</span>
              </label>
            </div>
            </div>
            
              <div className="input-group">
                <label>private address</label>
                <textarea {...register("section5PrivateAddress")} rows="3" />
              </div>
            </div>
              </div>
            )}
            
        {/* Section 5.2 - Signature of additional official */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && watch("section4MoreOfficials") === "yes" && watch("section4MoreOfficialsType")?.includes("natural") && (
          <div className="form-section additional-signature">
            <div className="form-note">
              <div className="form-note-heading">Notes on 5.2</div>
              <div className="form-note-content">
                An official with the function of <strong>director</strong> must personally visit a KVK office and 
                show valid proof of identity.
                <br /><br />
                The following documents will be accepted as proof of identity:
                <ul className="document-list">
                  <li>Dutch driving license</li>
                  <li>European identity card</li>
                  <li>Passport</li>
                  <li>Foreign Nationals Identity Card</li>
                </ul>
            </div>
            </div>
            
          <div className="form-field">
              <label>5.2 Signature of the official (by pen, not a copy)</label>
              <div className="signature-box">
                <p className="signature-note">Signature will be added when submitting the form in person</p>
              </div>
          </div>
        </div>
        )}
        
        {/* Section 6 - Position held by additional official */}
        {watch("section2NaturalPersonCheckbox")?.includes("natural") && watch("section4MoreOfficials") === "yes" && watch("section4MoreOfficialsType")?.includes("natural") && (
          <div className="form-section additional-position">
            <h2>6 Position held by the official</h2>
            
            <div className="form-note">
              <div className="form-note-heading">Notes on 6.1 and 6.2</div>
              <div className="form-note-content">
                In the case of a bv/nv, tasks within the board can be divided between executive
                and non-executive directors. This is only possible if it is specified in the articles
                of association. <br /><br />
             
                In the case of a bv,nv, or a company formally registered abroad, the 'position' of 
                sole shareholder may be held in combination with other positions.
              </div>
          </div>

            <div className="form-note form-note-right">
              <div className="form-note-heading">Example</div>
              <div className="form-note-content">
                Ms Potts becomes director of a private limited company (bv), and comes to
                own all of the company shares. At question 6.1 she ticks 'director', and at
                question 6.2 she ticks 'yes', as she is also the 'sole '.
          </div>
            </div>

            <div className="form-field position-field">
              <label>6.1 What position is held by the official?</label>
              
              <div className="radio-field">
              <label>
                  <input type="radio" value="supervisoryBoardMember" {...register("section6Position")} />
                  <span>supervisory board member</span>
              </label>
            </div>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="liquidator" {...register("section6Position")} />
                  <span>liquidator</span>
              </label>
            </div>

              <div className="radio-field">
                  <label>
                  <input type="radio" value="soleShareholder" {...register("section6Position")} />
                  <span>sole shareholder (only)</span>
                  </label>
                <div className="sub-field">
                  <div className="form-note-inline">➞ Go to question 6.5, date on which the position was taken up</div>
                </div>
              </div>
              
              <div className="radio-field">
                  <label>
                  <input type="radio" value="director" {...register("section6Position")} />
                  <span>director</span>
                  </label>
              </div>
              
              {watch("section6Position") && watch("section6Position") === "director" && (
                <div className="sub-field">
                  <label>
                    does it concern a director of a bv/nv with a unitary board (one-tier board)?
                  </label>
                  <div className="radio-field">
              <label>
                      <input type="radio" value="no" {...register("section6DirectorWithBoard")} />
                      <span>no</span>
              </label>
            </div>
                  <div className="radio-field">
              <label>
                      <input type="radio" value="yes" {...register("section6DirectorWithBoard")} />
                      <span>yes</span>
              </label>
          </div>

                  {watch("section6DirectorWithBoard") === "yes" && (
                    <div className="radio-field sub-field">
                      <div className="form-note-inline">If yes:</div>
                      <div className="radio-inline">
              <label>
                          <input type="radio" value="executive" {...register("section6DirectorType")} />
                          <span>executive director</span>
              </label>
              <label>
                          <input type="radio" value="nonExecutive" {...register("section6DirectorType")} />
                          <span>non-executive director</span>
              </label>
            </div>
          </div>
                  )}
                </div>
              )}
          </div>

          <div className="form-field">
              <label>6.2 Is this official also the sole shareholder?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="no" {...register("section6IsShareholder")} />
                  <span>no</span>
              </label>
            </div>

            <div className="radio-field">
              <label>
                  <input type="radio" value="yes" {...register("section6IsShareholder")} />
                  <span>yes, also the sole shareholder as of</span>
              </label>
                {watch("section6IsShareholder") === "yes" && (
                  <input {...register("section6ShareholderDate")} placeholder="DD-MM-YYYY" />
            )}
          </div>
          </div>

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 6.3</div>
              <div className="form-note-content">
                You only need to specify a function title if it is different from the position.
                For example: the official's function title is 'director'. However, this person can
                also have a statutory title. For example: the articles of association state that the
                person has the title of 'managing director'. You enter this title below.
            </div>
          </div>
              <label>6.3 Does the official have a statutory title?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="no" {...register("section6HasStatutoryTitle")} />
                  <span>no</span>
              </label>
            </div>

            <div className="radio-field">
              <label>
                  <input type="radio" value="yes" {...register("section6HasStatutoryTitle")} />
                  <span>yes, namely</span>
              </label>
                {watch("section6HasStatutoryTitle") === "yes" && (
                  <input {...register("section6StatutoryTitle")} />
                )}
            </div>
          </div>
          

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 6.4</div>
              <div className="form-note-content">
                In the case of an official of a <strong>foreign</strong> legal entity, any additional restrictions in
                authority under the applicable foreign law must be submitted using form 18
                ('Additional information').
            </div>
            </div>
                <label>6.4 What authority does the official have?</label>
        
            <div className="radio-field">
              <label>
                  <input type="radio" value="none" {...register("section6OfficialAuthority")} />
                  <span>no authority</span>
              </label>
            </div>

            <div className="radio-field">
              <label>
                  <input type="radio" value="sole" {...register("section6OfficialAuthority")} />
                  <span>sole authority</span>
              </label>
            </div>
              
              <div className="radio-field">
                <label>
                  <input type="radio" value="joint" {...register("section6OfficialAuthority")} />
                  <span>joint authority</span>
                </label>
          </div>
        </div>
          
          <div className="form-field">
              <label>6.5 Date on which the official took up the position</label>
              <input {...register("section6PositionStartDate")} placeholder="DD-MM-YYYY" />
          </div>
          <div className="form-field">
              <label>6.6 Do you want to register more officials?</label>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="no" {...register("section6MoreOfficials")} />
                  <span>no</span>
              </label>
                <div className="form-note-inline">➞ Go to section 11, Signature.</div>
            </div>
              
            <div className="radio-field">
              <label>
                  <input type="radio" value="yes" {...register("section6MoreOfficials")} />
                  <span>yes</span>
              </label>
                
                {watch("section6MoreOfficials") === "yes" && (
                  <div className="checkbox-group">
                    <div className="checkbox-field">
                <label>
                        <input type="checkbox" value="natural" {...register("section6MoreOfficialsType", { valueAsArray: true })} />
                        <span>a natural person</span>
                </label>
                      <div className="form-note-inline">➞ Go to section 11, Signature. The next official can be registered 
                      using a new copy of this form.</div>
          </div>

                    <div className="checkbox-field">
                <label>
                        <input type="checkbox" value="entity" {...register("section6MoreOfficialsType", { valueAsArray: true })} />
                        <span>a partnership/legal entity</span>
            </label>
                      <div className="form-note-inline">➞ Go to question 9.</div>
          </div>
                </div>
              )}
          </div>
            </div>
       </div>
        )}
            
        {/* Section 7 - Details for a partnership/legal entity */}
        {(watch("section2LegalEntityCheckbox")?.includes("entity") || 
          (watch("section4MoreOfficials") === "yes" && watch("section4MoreOfficialsType")?.includes("entity")) ||
          (watch("section6MoreOfficials") === "yes" && 
           watch("section6MoreOfficialsType")?.includes("entity"))) && (
          <div className="form-section partnership-entity">
            <h2>7 Details for a partnership/legal entity</h2>

              <div className="form-field">
              <label>7.1 What are the details of the official?</label>
              
              <div className="input-group">
                <label>name of the partnership/legal entity</label>
                <input {...register("section7EntityName")} />
              </div>
              
              <div className="input-group">
                <label>address</label>
                <textarea {...register("section7EntityAddress")} rows="3" />
              </div>
              </div>
              
              <div className="form-field">
              <label>7.2 What is the KVK number of the partnership or legal entity?</label>
              <input {...register("section7EntityKvkNumber")} />
              <div className="form-note-inline">➞ Go to question 7.4</div>
              </div>
              
            <div className="form-note">
              <div className="form-note-heading">Notes on 7.3</div>
              <div className="form-note-content">
                Does the partnership or legal entity hold the position of official? If so, 
                please include the following with the registration: a proof of registration of that 
                company or legal entity including the director(s). This proof should not be older 
                than one month.
            </div>
              </div>
              
              <div className="form-field">
              <label>7.3 Registration details abroad</label>
              
              <div className="input-group">
                <label>registration number abroad</label>
                <input {...register("section7ForeignRegNumber")} />
              </div>
              
              <div className="input-group">
                <label>name of the register</label>
                <input {...register("section7RegisterName")} />
        </div>

              <div className="input-group">
                <label>name, place and country of the registering authority</label>
                <textarea {...register("section7RegisteringAuthority")} rows="3" />
            </div>
          </div>
          <div className="form-note">
              <div className="form-note-heading">Notes on 7.4</div>
              <div className="form-note-content">
                If the function is fulfilled by:
                <ul className="document-list">
                  <li>a vof/cv, then one of the partners of that vof/cv must sign.</li>
                  <li>a legal entity, then one of the directors of that legal entity must sign.</li>
              </ul>
              <label> Attach a copy of a valid proof of identity of the signatory with this form</label>
            </div>
          </div>
              <div className="form-field">
              <label>7.4 Signature on behalf of the partnership/legal entity</label>
              
              <div className="input-group">
                <label>surname and initial(s)</label>
                <input {...register("section7SignatureName")} />
              </div>
              
              <div className="input-group">
                <label>signature (by pen, not a copy)</label>
                <div className="signature-box">
                  <p className="signature-note">Signature will be added when submitting the form in person</p>
            </div>
            

            </div>
          </div>


            </div>
      
           ) } 
       

        {/* Section 8 - Position held by the partnership/legal entity */}
        {(watch("section2LegalEntityCheckbox")?.includes("entity") || 
          (watch("section4MoreOfficials") === "yes" && watch("section4MoreOfficialsType")?.includes("entity")) ||
          (watch("section6MoreOfficials") === "yes" && 
           watch("section6MoreOfficialsType")?.includes("entity"))) && (
          <div className="form-section entity-position">
            <h2>8 Position held by the official</h2>
            
            <div className="form-note">
              <div className="form-note-heading">Notes on 8.1 and 8.2</div>
              <div className="form-note-content">
                In the case of a bv/nv, tasks within the board can be divided between executive
                and non-executive directors. This is only possible if it is specified in the articles
                of association.
                <br /><br />
                In the case of a bv, nv, or a company formally registered abroad, the 'position' of
                sole shareholder may be held in combination with other positions.
          </div>
        </div>
        
            <div className="form-note form-note-right">
              <div className="form-note-heading">Example</div>
              <div className="form-note-content">
                Ms Potts becomes director of a private limited company (bv), and comes to
                own all of the company shares. At question 8.1 she ticks 'director', and at
                question 8.2 she ticks 'yes', as she is also the 'sole shareholder'.
            </div>
          </div>
          
            <div className="form-field position-field">
              <label>8.1 What position is held by the official?</label>
              
              <div className="radio-field">
              <label>
                  <input type="radio" value="supervisoryBoardMember" {...register("section8Position")} />
                  <span>supervisory board member</span>
              </label>
            </div>
            
              <div className="radio-field">
              <label>
                  <input type="radio" value="liquidator" {...register("section8Position")} />
                  <span>liquidator</span>
              </label>
            </div>
            
              <div className="radio-field">
              <label>
                  <input type="radio" value="soleShareholder" {...register("section8Position")} />
                  <span>sole shareholder (only)</span>
              </label>
                <div className="sub-field">
                  <div className="form-note-inline">➞ Go to question 8.5, date on which the position was taken up</div>
            </div>
          </div>
          
              <div className="radio-field">
              <label>
                  <input type="radio" value="director" {...register("section8Position")} />
                  <span>director</span>
              </label>
              </div>
              
              {watch("section8Position") === "director" && (
                <div className="sub-field">
              <label>
                    does it concern a director of a bv/nv with a unitary board (one-tier board)?
              </label>
                  <div className="radio-field">
              <label>
                      <input type="radio" value="no" {...register("section8DirectorWithBoard")} />
                      <span>no</span>
              </label>
            </div>
                  <div className="radio-field">
              <label>
                      <input type="radio" value="yes" {...register("section8DirectorWithBoard")} />
                      <span>yes</span>
              </label>
          </div>

                  {watch("section8DirectorWithBoard") === "yes" && (
                    <div className="radio-field sub-field">
                      <div className="form-note-inline">If yes:</div>
                      <div className="radio-inline">
              <label>
                          <input type="radio" value="executive" {...register("section8DirectorType")} />
                          <span>executive director</span>
              </label>
              <label>
                          <input type="radio" value="nonExecutive" {...register("section8DirectorType")} />
                          <span>non-executive director</span>
              </label>
            </div>
          </div>
                  )}
                </div>
              )}
          </div>

          <div className="form-field">
              <label>8.2 Is this official also the sole shareholder?</label>
              
            <div className="radio-field">
              <label>
                    <input type="radio" value="no" {...register("section8IsShareholder")} />
                    <span>no</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="yes" {...register("section8IsShareholder")} />
                    <span>yes, also the sole shareholder as of</span>
              </label>
                  
                  {watch("section8IsShareholder") === "yes" && (
                  <input {...register("section8ShareholderDate")} placeholder="DD-MM-YYYY" />
            )}
            </div>
          </div>

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 8.3</div>
              <div className="form-note-content">
                You only need to specify a function title if it is different from the position.
                For example: the official's function title is 'director'. However, this person can
                also have a statutory title. For example: the articles of association state that the
                person has the title of 'managing director'. You enter this title below.
            </div>
          </div>
              <label>8.3 Does the official have a statutory title?</label>
              
              <div className="radio-field">
                <label>
                    <input type="radio" value="no" {...register("section8HasStatutoryTitle")} />
                    <span>no</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="yes" {...register("section8HasStatutoryTitle")} />
                    <span>yes, namely</span>
              </label>
                  
                  {watch("section8HasStatutoryTitle") === "yes" && (
                    <input {...register("section8StatutoryTitle")} />
                  )}
                </div>
          </div>

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 8.4</div>
              <div className="form-note-content">
                In the case of an official of a <strong>foreign</strong> legal entity, any additional restrictions in
                authority under the applicable foreign law must be submitted using form 18
                ('Additional information').
            </div>
            </div>
                <label>8.4 What authority does the official have?</label>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="none" {...register("section8OfficialAuthority")} />
                    <span>no authority</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="sole" {...register("section8OfficialAuthority")} />
                    <span>sole authority</span>
              </label>
          </div>

            <div className="radio-field">
              <label>
                    <input type="radio" value="joint" {...register("section8OfficialAuthority")} />
                    <span>joint authority</span>
              </label>
            </div>
            </div>
              
              <div className="form-field">
                <label>8.5 Date on which the official took up the position</label>
                <input {...register("section8PositionStartDate")} placeholder="DD-MM-YYYY" />
          </div>

          <div className="form-field">
                <label>8.6 Do you want to register more officials?</label>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="no" {...register("section8MoreOfficials")} />
                    <span>no</span>
              </label>
                  <div className="form-note-inline">➞ Go to section 11, Signature.</div>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="yes" {...register("section8MoreOfficials")} />
                    <span>yes</span>
              </label>
                  {watch("section8MoreOfficials") === "yes" && (
                  <div className="checkbox-group">
                 <div className="checkbox-field">
                      <label>
                        <input type="checkbox" value="natural" {...register("section8MoreOfficialsType", { valueAsArray: true })} />
                        <span>a natural person</span>
                      </label>
                      <div className="form-note-inline">➞ Go to section 11, Signature. The next official can be registered 
                      using a new copy of this form.</div>
          </div>
            </div>
            )}
              </div>
            </div>
            </div>
          )}

          {/* Section 9 - Details for a second partnership/legal entity */}
          {watch("section8MoreOfficials") === "yes" && watch("section8MoreOfficialsType")?.includes("entity") && (
            <div className="form-section entity-details">
              <h2>9 Details for a partnership/legal entity</h2>

          <div className="form-field">
                <label>9.1 What are the details of the partnership/legal entity</label>
                
                <div className="input-group">
                <label>name of the partnership/legal entity</label>
                <input {...register("section9EntityName")} />
          </div>
                
              <div className="input-group">
                <label>address</label>
                <textarea {...register("section9EntityAddress")} rows="3" />
              </div>
              </div>
                
       

          <div className="form-field">
              <label>9.2 What is the KVK number of the partnership or legal entity?</label>
              <input {...register("section9EntityKvkNumber")} />
              <div className="form-note-inline">➞ Go to question 9.4</div>
          </div>

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 9.3</div>
              <div className="form-note-content">
                Does the partnership or legal entity hold the position of official? If so, 
                please include the following with the registration: a proof of registration of that 
                company or legal entity including the director(s). This proof should not be older 
                than one month.
            </div>
              </div>
                <label>9.3 Registration details abroad</label>
                
              
                <div className="input-group">
                  <label>registration number abroad</label>
                  <input {...register("section9ForeignRegNumber")} />
          </div>

                <div className="input-group">
                  <label>name of the register</label>
                  <input {...register("section9RegisterName")} />
        </div>

                <div className="input-group">
                  <label>name, place and country of the registering authority</label>
                  <textarea {...register("section9RegisteringAuthority")} rows="3" />
          </div>
        </div>

              <div className="form-note">
                <div className="form-note-heading">Notes on 9.4</div>
                <div className="form-note-content">
                  If the function is fulfilled by:
                  <ul className="document-list">
                    <li>a vof/cv, then one of the partners of that vof/cv must sign.</li>
                    <li>a legal entity, then one of the directors of that legal entity must sign.</li>
              </ul>
              <label> Attach a copy of a valid proof of identity of the signatory with this form</label>
            </div>
          </div>
          
          <div className="form-field">
                <label>9.4 Signature on behalf of the partnership/legal entity</label>
                
                <div className="input-group">
                  <label>surname and initial(s)</label>
                  <input {...register("section9SignatureName")} />
              </div>
                
                <div className="input-group">
                  <label>signature (by pen, not a copy)</label>
                  <div className="signature-box">
                    <p className="signature-note">Signature will be added when submitting the form in person</p>
              </div>

             
        </div>
        </div>
        </div>
        )}

          {/* Section 10 - Position held by the second legal entity */}
          {watch("section8MoreOfficials") === "yes" && watch("section8MoreOfficialsType")?.includes("entity") && (
            <div className="form-section entity-position">
              <h2>10 Position held by the official</h2>
              
              <div className="form-note">
                <div className="form-note-heading">Notes on 10.1 and 10.2</div>
                <div className="form-note-content">
                  In the case of a bv/nv, tasks within the board can be divided between executive
                  and non-executive directors. This is only possible if it is specified in the articles
                  of association.
                  <br /><br />
                  In the case of a bv, nv, or a company formally registered abroad, the position of
                  sole shareholder may be held in combination with other positions.
            </div>
          </div>
          
              <div className="form-note form-note-right">
                <div className="form-note-heading">Example</div>
                <div className="form-note-content">
                  Ms Potts becomes director of a private limited company (bv), and comes to
                  own all of the company shares. At question 10.1 she ticks 'director', and at
                  question 10.2 she ticks 'yes', as she is also the 'sole shareholder'.
          </div>
        </div>

              <div className="form-field position-field">
                <label>10.1 What position is held by the official?</label>
                
                <div className="radio-field">
                  <label>
                    <input type="radio" value="supervisoryBoardMember" {...register("section10PositionType")} />
                    <span>supervisory board member</span>
                  </label>
                </div>
                
                <div className="radio-field">
                  <label>
                    <input type="radio" value="liquidator" {...register("section10PositionType")} />
                    <span>liquidator</span>
                  </label>
                </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="soleShareholder" {...register("section10PositionType")} />
                    <span>sole shareholder (only)</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="director" {...register("section10PositionType")} />
                    <span>director</span>
              </label>
            </div>
                
                {watch("section10PositionType") === "director" && (
                  <div className="sub-field">
                    <label>
                      does it concern a director of a bv/nv with a unitary board (one-tier board)?
                    </label>
                    <div className="radio-field">
                      <label>
                        <input type="radio" value="no" {...register("section10DirectorWithBoard")} />
                        <span>no</span>
                      </label>
          </div>
                    <div className="radio-field">
                    <label>
                      <input type="radio" value="yes" {...register("section10DirectorWithBoard")} />
                      <span>yes</span>
                    </label>
        </div>

                    
                    {watch("section10DirectorWithBoard") === "yes" && (
                      <div className="radio-field sub-field">
                        <div className="form-note-inline">If yes:</div>
                        <div className="radio-inline">
                          <label>
                            <input type="radio" value="executive" {...register("section10DirectorType")} />
                            <span>executive director</span>
                          </label>
                          
                          <label>
                            <input type="radio" value="nonExecutive" {...register("section10DirectorType")} />
                            <span>non-executive director</span>
                          </label>
            </div>
            </div>
                    )}
                  </div>
                )}
          </div>
          
          <div className="form-field">
                <label>10.2 Is this partnership/legal entity also a shareholder?</label>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="no" {...register("section10IsShareholder")} />
                    <span>no</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="yes" {...register("section10IsShareholder")} />
                    <span>yes,, also the sole shareholder as of</span>
              </label>
                  
                  {watch("section10IsShareholder") === "yes" && (
                  <input {...register("section10ShareholderDate")} placeholder="DD-MM-YYYY" />
            )}
            </div>
          </div>

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 10.3</div>
              <div className="form-note-content">
                You only need to specify a function title if it is different from the position.
                For example: the official's function title is 'director'. However, this person can
                also have a statutory title. For example: the articles of association state that the
                person has the title of 'managing director'. You enter this title below.
            </div>
          </div>
                <label>10.3 Does this official have a statutory title?</label>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="no" {...register("section10HasStatutoryTitle")} />
                    <span>no</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="yes" {...register("section10HasStatutoryTitle")} />
                    <span>yes, namely</span>
              </label>
                  
                  {watch("section10HasStatutoryTitle") === "yes" && (
                    <input {...register("section10StatutoryTitle")} />
                  )}
                </div>
          </div>

          <div className="form-field">
          <div className="form-note">
              <div className="form-note-heading">Notes on 10.4</div>
              <div className="form-note-content">
                In the case of an official of a <strong>foreign</strong> legal entity, any additional restrictions in
                authority under the applicable foreign law must be submitted using form 18
                ('Additional information').
            </div>
            </div>
                <label>10.4 What authority does the official have?</label>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="none" {...register("section10OfficialAuthority")} />
                    <span>no authority</span>
              </label>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="sole" {...register("section10OfficialAuthority")} />
                    <span>sole authority</span>
              </label>
          </div>

            <div className="radio-field">
              <label>
                    <input type="radio" value="joint" {...register("section10OfficialAuthority")} />
                    <span>joint authority</span>
              </label>
            </div>
            </div>
              
              <div className="form-field">
                <label>10.5 Date on which the official took up the position</label>
                <input type="date" {...register("section10positionStartDate")} />
          </div>

          <div className="form-field">
                <label>10.6 Do you want to register more officials?</label>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="no" {...register("section10MoreOfficials")} />
                    <span>no</span>
              </label>
                  <div className="form-note-inline">➞ Go to section 11, Signature.</div>
            </div>
                
            <div className="radio-field">
              <label>
                    <input type="radio" value="yes" {...register("section10MoreOfficials")} />
                    <span>yes</span>
              </label>
                  {watch("section10MoreOfficials") === "yes" && (
                  <div className="checkbox-group">
                 <div className="checkbox-field">
                      <label>
                        <input type="checkbox" value="entity" {...register("section10MoreOfficialsType", { valueAsArray: true })} />
                        <span>a partnership/legal entity</span>
                      </label>
                      <div className="form-note-inline">➞  Go first to section 11, Signature. The next official can be registered 
                      using a new copy of this form.</div>
          </div>
            </div>
            )}
              </div>
            </div>
            </div>
          )}
        
        {/* Signature Section */}
       {/* Signature Section */}
<div className="form-section signature">
  <h2>11 Signature</h2>
  
  <div className="form-note">
    <div className="form-note-heading">Notes on 11.1</div>
    <div className="form-note-content">
      This form may only be signed by:
      <ul>
        <li>one of the directors (of a new legal entity that has not yet been registered)</li>
        <li>one of the registered directors (of an existing legal entity)</li>
        <li>a civil-law notary</li>
      </ul>
    </div>
  </div>

  <div className="form-note">
    <div className="form-note-heading">Proof of identity of the signatory</div>
    <div className="form-note-content">
      The person signing this form must attach a copy of valid proof of identity.
      The following documents will be accepted as proof of identity:
      <ul>
        <li>passport</li>
        <li>Dutch driving licence</li>
        <li>European identity card</li>
        <li>Foreign Nationals Identity Card</li>
      </ul>
      <label>Enter your contact details so KVK can get in touch if there are any questions.</label>
    </div>
  </div>

  <div className="form-field">
    <label>11.1 The undersigned declares that this form has been completed truthfully</label>
   
    
    <div className="signature-fields">
      <div className="form-field">
        <label>surname and initial(s)</label>
        <input {...register("section11SignatureName")} />
      </div>
      
      <div className="form-field">
        <label>email address</label>
        <input {...register("section11SignatureEmail")} type="email" />
      </div>

      <div className="form-field">
        <label>telephone number</label>
        <input {...register("section11SignaturePhone")} />
      </div>
      
      <div className="form-field">
        <label>date</label>
        <input {...register("section11SignatureDate")} placeholder="DD-MM-YYYY" />
      </div>

      <div className="form-field">
        <label>signature (by pen, not a copy)</label>
        <div className="signature-box">
          <p className="signature-note">Sign the Dutch version of this form.</p>
        </div>
      </div>
    </div>
  </div>
</div>


{/* Section 12 - Other forms that are required */}
<div className="form-section other-forms">
  <h2>12 Other forms that are required</h2>
  
  <div className="form-note">
    <div className="form-note-heading">Notes on 12.1</div>
    <div className="form-note-content">
      It is required to register a new official who is also an ultimate beneficial owner (UBO). 
      UBOs must be registered immediately via KVK.
    </div>
  </div>

  <div className="form-field">
    <label>12.1 Does this registration involve one or more officials who are also ultimate beneficial owners (UBOs)?</label>
    
    <div className="radio-field">
      <label>
        <input type="radio" value="no" {...register("section12HasUBOs")} />
        <span>no</span>
      </label>
    </div>

    <div className="radio-field">
      <label>
        <input type="radio" value="yes" {...register("section12HasUBOs")} />
        <span>yes</span>
      </label>

      {watch("section12HasUBOs") === "yes" && (
        <div className="form-note-content indented">
          <p>Depending on the legal structure of the legal entity for which the official is a UBO, register each official using one of the following forms:</p>
          <ul>
            <li>bv, nv, European Public Limited Company, or European Cooperative Society: form 30</li>
            <li>foundation: form 31</li>
            <li>European Economic Interest Grouping: form 32</li>
            <li>cooperative, mutual insurance association, or association: form 33</li>
          </ul>
          <p>Download the required forms via <a href="https://kvk.nl/forms" target="_blank" rel="noopener noreferrer">KVK.nl/forms</a></p>
          <p className="note">You can only report UBOs digitally online in Dutch, provided you have a KVK number from the company's registration in the Business Register.</p>
        </div>
      )}
    </div>
  </div>

  <div className="checks-container">
  <div className="checks-header">
    <h2>Checks</h2>
    <p className="checks-intro">
      After completing and signing this form, make an appointment to return it to a KVK office. 
      To make this appointment visit <a href="https://KVK.nl" target="_blank" rel="noopener noreferrer">KVK.nl</a>
    </p>
  </div>

  <div className="checks-note">
    <strong>Please note:</strong> to register a liquidator, the documents can instead be sent to KVK by post. 
    For the postal address, visit KVK.nl/addresses.
  </div>

  <div className="checks-section">
    <h3>You must always bring:</h3>
    <ul className="checks-list">
      <li>
        If the official is a natural person and a director, every official must visit KVK in person. We require from each official:
        <ul className="checks-sublist">
          <li>A valid proof of identity</li>
        </ul>
      </li>
      <li>
        If the official is a foreign company or legal entity, KVK needs:
        <ul className="checks-sublist">
          <li>A certificate of registration no older than one month, and original documents for proof of private address</li>
          <li>A copy in A4 format of valid proof of identity (with an unrecognisable photo) of the person who signed the form</li>
        </ul>
      </li>
      <li>
        If you are declaring a new sole shareholder:
        <ul className="checks-sublist">
          <li>A copy of a share transfer deed signed by a notary (This is not required if a civil-law notary signs the form)</li>
        </ul>
      </li>
      <li>
        If the new sole shareholder is a foreign legal entity:
        <ul className="checks-sublist">
          <li>A recent certificate of registration. This proof may not be older than one month and must be in a readable language.</li>
        </ul>
      </li>
    </ul>
  </div>

  <div className="liquidator-section">
    <h3>In a registration by a liquidator, always send:</h3>
    <ul className="checks-sublist">
      <li>A signed resolution to dissolve with complete meeting minutes including all required details</li>
    </ul>
  </div>

  <div className="final-note">
    <p>In certain cases, KVK may request additional supporting documentation. When this form and the necessary attachments 
    have been received and approved by KVK, the official(s) will be listed in the Business Register. If any of the above 
    details change, you are legally required to inform KVK of the changes within one week.</p>
  </div>
</div>
</div>
        
        <div className="note-box">
          <p><strong>Note:</strong> This form will generate a PDF with your information that can be submitted to KVK. 
          After submission, please print, sign, and provide the form to the KVK along with any required identification.</p>
        </div>
 

        <div className="form-actions">
          {!downloadUrl && (
            <button 
              type="submit"
              disabled={isProcessing} 
              className="form11-primary-button" 
            >
              {isProcessing ? 'Processing...' : 'Generate PDF'}
            </button>
          )}

          {downloadUrl && (
            <>
              <div className="pdf-success-box">
                <div className="pdf-success-icon">&#x2713;</div>
                <div className="pdf-success-message">
                  <h3>Your PDF is ready!</h3>
                  <p>You can download or preview your completed form below.</p>
                  <p className="pdf-note">Note: The PDF will be saved to your account when you download it</p>
                </div>
                
                <div className="pdf-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button 
                    onClick={handleDownloadClick}
                    className="download-button"
                    disabled={isProcessing}
                    style={{ backgroundColor: '#4caf50', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none' }}
                  >
                    Download
                  </button>
                  
                  <button 
                    onClick={() => window.open(downloadUrl, '_blank')} 
                    className="preview-button"
                    style={{ backgroundColor: '#f57c00', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none' }}
                  >
                    Preview PDF
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleRegeneratePdf}
                className="regenerate-button"
                disabled={isProcessing}
                style={{ 
                  backgroundColor: '#2196f3', 
                  color: 'white', 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  border: 'none',
                  width: '200px',
                  margin: '10px auto',
                  display: 'block'
                }}
              >
                Regenerate PDF
              </button>
            </>
          )}
        </div>
      </form>
      {showConfirmPopup && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <div className="confirmation-popup-content">
              <h3>Confirm Download</h3>
              <p>Are you sure you want to download and save this form?</p>
              <p className="confirmation-warning">After downloading, you will not be able to make further changes to this submission.</p>
              <div className="confirmation-buttons">
                <button 
                  onClick={handlePdfDownload} 
                  className="confirm-button"
                  disabled={isProcessing}
                >
                  Yes, Download & Save
                </button>
                <button 
                  onClick={cancelDownload} 
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Form11;