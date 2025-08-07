import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDocument, rgb } from 'pdf-lib';
import { supabase } from '../supabaseClient'; // Make sure this path is correct
import './vat.css';

function VAT() {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [vatRegistrationData, setVatRegistrationData] = useState(null);
  const [isLoadingVatData, setIsLoadingVatData] = useState(true);

  // Function to fetch VAT registration data
  const fetchVatRegistrationData = async () => {
    try {
      setIsLoadingVatData(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('vat_registrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching VAT registration data:', error);
        return;
      }

      if (data && data.length > 0) {
        setVatRegistrationData(data[0]);
        console.log('Found VAT registration data:', data[0]);
        
        // Pre-fill form with VAT registration data
        prefillFormWithVatData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching VAT registration data:', error);
    } finally {
      setIsLoadingVatData(false);
    }
  };

  // Function to pre-fill form with VAT registration data
  const prefillFormWithVatData = (vatData) => {
    if (!vatData) return;

    // Company Details
    if (vatData.company_name) setValue('legalName', vatData.company_name);
    if (vatData.trade_name) setValue('tradeName', vatData.trade_name);
    if (vatData.legal_form) setValue('legalForm', vatData.legal_form);
    if (vatData.registered_address) setValue('address', vatData.registered_address);
    if (vatData.base_location) setValue('country', vatData.base_location);
    
    // Contact Information
    if (vatData.contact_person) setValue('signerName', vatData.contact_person);
    if (vatData.contact_email) setValue('email', vatData.contact_email);
    if (vatData.contact_phone) setValue('telephone', vatData.contact_phone);
    
    // Business Activity
    if (vatData.business_activity) setValue('businessSector', vatData.business_activity);
    if (vatData.special_activities) setValue('activitiesNetherlands', vatData.special_activities);
    
    // VAT Information
    if (vatData.vat_number_existing) setValue('foreignVatNumber', vatData.vat_number_existing);
    if (vatData.vat_id_own_country) setValue('foreignVatNumber', vatData.vat_id_own_country);
    
    // Registration Reasons (map to form fields)
    if (vatData.registration_reasons && Array.isArray(vatData.registration_reasons)) {
      vatData.registration_reasons.forEach(reason => {
        switch (reason) {
          case 'VAT refund':
            setValue('sellToPrivateIndividuals', 'yes');
            break;
          case 'VAT return filing':
            setValue('chargeVATServices', 'yes');
            break;
          case 'One Stop Shop':
            setValue('sellToEUCustomers', 'yes');
            break;
          case 'Corporation tax':
            setValue('sellToEntrepreneurs', 'yes');
            break;
          case 'Payroll taxes':
            setValue('haveDeliveries', 'yes');
            break;
          case 'Transfer tax':
            setValue('bringGoodsToEU', 'yes');
            break;
          case 'Dividend tax refund':
            setValue('sellToCustomersOutsideEU', 'yes');
            break;
        }
      });
    }

    // Set default values for required fields
    setValue('correspondenceType', 'business');
    setValue('language', 'english');
    setValue('registeredBefore', 'no');
    setValue('hasIBAN', 'yes');
    setValue('servicesProvidedTo', 'both');
    setValue('oneManBusiness', 'no');
    setValue('hasAuthRep', 'no');

    // Set current date for signature
    const today = new Date();
    setValue('signatureDateDay', today.getDate());
    setValue('signatureDateMonth', today.getMonth() + 1);
    setValue('signatureDateYear', today.getFullYear());
  };

  // Add this useEffect to fetch submissions and VAT data when component mounts
  useEffect(() => {
    fetchVatSubmissions();
    fetchVatRegistrationData();
  }, []);

  const fetchVatSubmissions = async () => {
    try {
      setIsLoadingHistory(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('vat_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submission_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const downloadPreviousSubmission = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('vat-forms')
        .download(filePath);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading previous submission:', error);
      setError('Error downloading previous submission');
    }
  };

  const pdfUrl = process.env.PUBLIC_URL + '/assets/vat-form.pdf';
  console.log('PDF URL:', pdfUrl); // Add this line for debugging

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data); // Add this line for debugging
    setIsProcessing(true);
    setError(null);
    setFormData(data); // Store form data for later use

    try {
      const response = await fetch(pdfUrl, {
        mode: 'cors',  // Add CORS mode
        headers: {
          'Accept': 'application/pdf'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load PDF template');
      }

      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const secondPage = pages[1];
      const thirdPage = pages[2];
      const fourthPage = pages[3];

      const positions = {
        firstPage: {
          sellToPrivateIndividuals: { xYes: 456, xNo: 525, y: 336 },
          sellFromNetherlands: { xYes: 456, xNo: 525, y: 307 },
          sellToEUCustomers: { xYes: 456, xNo: 525, y: 265 },
          sellToEntrepreneurs: { xYes: 456, xNo: 525, y: 223 },
          bringGoodsToEU: { xYes: 456, xNo: 525, y: 180 },
          sellToCustomersOutsideEU: { xYes: 456, xNo: 525, y: 162 },
          haveIntraCommunityAcq: { xYes: 456, xNo: 525, y: 145},
          receiveServicesWithVAT: { xYes: 456, xNo: 525, y: 128 },
          haveDeliveries: { xYes: 456, xNo: 525, y: 110},
          chargeVATServices: { xYes: 456, xNo: 525, y: 80}
        },
        secondPage: {
          legalName: { x: 210, y: 740 },
          tradeName: { x: 210, y: 720 },
          legalFormOneMan: { xYes: 203, y: 669 },
          legalFormOther: { xYes: 203, y: 655 },
          otherLegalFormText: { x: 310, y: 660 },
          address: { x: 210, y: 635 },
          postcode: { x:210, y: 613},
          city: { x: 300, y: 613 },
          country: { x:210, y: 589 },
          telephone: { x:210, y: 565 },
          email: { x:210, y:540 },
          website: { x:210, y: 515 },
          oneManBusinessRadio: { 
            yes: { x: 203, y: 485 },
            no: { x: 203, y: 476 }
          },
          authorizedRep: { 
            yes: { x: 203, y: 343 },
            no: { x: 203, y: 332 }
          },
          homeStreet: { x: 203, y: 445 },
          homePostcode: { x:203, y: 420 },
          homeCity: { x: 300, y: 420},
          homeCountry: { x:203, y:397 },
          hasAuthRepYes: { x: 200, y: 190 },
          hasAuthRepNo: { x: 200, y: 175 },
          authRepName: { x: 200, y: 290 },
          authRepStreet: { x: 200, y: 260 },
          authRepPostcode: { x: 200, y: 240 },
          authRepCity: { x: 300, y: 240 },
          authRepCountry: { x: 200, y: 215 },
          authRepTelephone: { x: 200, y:190 },
        },
        thirdPage: {
          correspondenceType: {
            business: { x: 201, y: 738 },  // Business address
            home: { x: 201, y: 726 },      // Home address
            auth: { x: 201, y: 715 },      // Address of authorized representative
            other: { x: 201, y: 702 }      // Different address
          },
          correspondenceName: { x: 210, y: 683 },
          correspondenceStreet: { x: 210, y: 660 },
          correspondencePostcode: { x: 220, y: 635 },
          correspondenceCity: { x: 300, y: 635 },
          correspondenceCountry: { x: 210, y: 612 },
          languageDutch: { x: 202, y: 585 },
          languageGerman: { x: 202, y: 570 },
          languageEnglish: { x: 202, y: 560 },
          registeredBefore: { 
            xYes: 201, 
            xNo: 201, 
            yYes: 500, 
            yNo: 487 
          },
          vatNumber: { 
            nl: { x: 210, y: 441 },
            main: { x: 230, y: 441 },
            digits: { x: 250, y: 441 },
            b: { x: 330, y: 441 },
            suffix: { x: 371, y: 441 }
          },
          chamberOfCommerce: { 
            xYes: 200,
            xNo: 200,
            yYes: 417,
            yNo: 405
          },
          cocNumber: { x: 206, y: 370 },  // Updated y-coordinate for CoC number
          foreignVatNumber: { x: 210, y: 310 },
          businessSector: { x: 210, y: 240 },  // Updated y-coordinate to 240
          activitiesNetherlands: { x: 210, y: 215 },  // Updated y-coordinate
          servicesProvidedTo: { 
            business: { x: 201, y: 164 },  // Business only checkbox
            private: { x: 201, y: 150 },   // Private individuals checkbox
            both: { x: 201, y: 141 }       // Both checkbox
          },
        },
        fourthPage: {
          hasIBAN: { 
            xYes: 76,
            xNo: 76,
            yYes: 680,
            yNo: 630
          },
          ibanBox1: { x: 80, y: 660 },
          ibanBox2: { x: 120, y: 660 },
          ibanBox3: { x: 160, y: 660 },
          ibanBox4: { x: 240, y: 660 },
          bankAccountNumber: { x: 200, y: 635 },
          accountHolderName: { x: 210, y: 610 },
          accountStreet: { x: 210, y: 585 },
          accountPostcode: { x: 210, y: 565 },
          accountCity: { x: 310, y: 565 },
          accountCountry: { x: 210, y: 540 },
          bankName: { x: 210, y: 513 },
          bankLocation: { x: 210, y: 489 },
          bankCountry: { x: 210, y: 469 },
          bicCode: { x: 210, y: 444 },
          signerName: { x: 210, y: 395 },
          signerPhone: { x: 210, y: 370 },
          signature: { x: 210, y: 320 },  // Add signature coordinates
          numberOfEnclosures: { x: 210, y: 260 }
        }
      };

      const datePositions = {
        startDate: { day: { x: 210, y: 695 }, month: { x: 250, y: 695 }, year: { x: 295, y: 695 } },
        activityStartDate: { day: { x: 205, y:105 }, month: { x: 250, y: 105 }, year: { x: 290, y: 105} },
        signatureDate: { day: { x: 205, y: 349 }, month: { x: 250, y: 349 }, year: { x: 290, y: 349 } }
      };

      const font = await pdfDoc.embedFont('Helvetica');

      const firstPageCheckboxes = [
        'sellToPrivateIndividuals',
        'sellFromNetherlands',
        'sellToEUCustomers',
        'sellToEntrepreneurs',
        'bringGoodsToEU',
        'sellToCustomersOutsideEU',
        'haveIntraCommunityAcq',
        'receiveServicesWithVAT',
        'haveDeliveries',
        'chargeVATServices'
      ];

      firstPageCheckboxes.forEach(field => {
        const value = data[field];
        if (value) {  // Changed from checking 'yes' or 'no'
          firstPage.drawText('X', {
            x: value === 'yes' ? positions.firstPage[field].xYes - 2 : positions.firstPage[field].xNo - 2,
            y: positions.firstPage[field].y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      });

      if (data.legalForm) {  // Changed from checking specific values
        secondPage.drawText('X', {
          x: data.legalForm === 'one-man' ? 
             positions.secondPage.legalFormOneMan.xYes - 2 : 
             positions.secondPage.legalFormOther.xYes - 2,
          y: data.legalForm === 'one-man' ? 
             positions.secondPage.legalFormOneMan.y :
             positions.secondPage.legalFormOther.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
        
        if (data.otherLegalForm) {
          secondPage.drawText(data.otherLegalForm.toString(), {
            x: positions.secondPage.otherLegalFormText.x,
            y: positions.secondPage.otherLegalFormText.y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

      // Update all other radio button handlers similarly
      if (data.hasAuthRep) {
        secondPage.drawText('X', {
          x: data.hasAuthRep === 'yes' ? 
             positions.secondPage.authorizedRep.yes.x - 2 : 
             positions.secondPage.authorizedRep.no.x - 2,
          y: data.hasAuthRep === 'yes' ? 
             positions.secondPage.authorizedRep.yes.y :
             positions.secondPage.authorizedRep.no.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      // Replace the hasWebsite block with oneManBusiness
      if (data.oneManBusiness === 'yes') {
        secondPage.drawText('X', {
          x: positions.secondPage.oneManBusinessRadio.yes.x - 2,
          y: positions.secondPage.oneManBusinessRadio.yes.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      } else if (data.oneManBusiness === 'no') {
        secondPage.drawText('X', {
          x: positions.secondPage.oneManBusinessRadio.no.x - 2,
          y: positions.secondPage.oneManBusinessRadio.no.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      Object.keys(positions.secondPage).forEach(field => {
        if (data[field] && 
            !['oneManBusiness', 'homeAddress', 'authorizedRep', 'legalFormOneMan', 'legalFormOther', 'otherLegalFormText', 'oneManBusinessRadio', 'hasAuthRepYes', 'hasAuthRepNo'].includes(field) && 
            data[field].toString().trim() !== '') {
          secondPage.drawText(data[field].toString(), {
            x: positions.secondPage[field].x,
            y: positions.secondPage[field].y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      });

      const dateFields = [
        { prefix: 'startDate', page: secondPage },
        { prefix: 'activityStartDate', page: thirdPage },
        { prefix: 'signatureDate', page: fourthPage }
      ];

      dateFields.forEach(({ prefix, page }) => {
        const day = data[`${prefix}Day`];
        const month = data[`${prefix}Month`];
        const year = data[`${prefix}Year`];

        if (!day || !month || !year) return;

        const positions = datePositions[prefix];
        page.drawText(day.toString().padStart(2, '0'), {
          x: positions.day.x,
          y: positions.day.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });

        page.drawText(month.toString().padStart(2, '0'), {
          x: positions.month.x,
          y: positions.month.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });

        page.drawText(year.toString(), {
          x: positions.year.x,
          y: positions.year.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      });

      Object.keys(positions.thirdPage).forEach(field => {
        if (data[field] && 
            data[field].toString().trim() !== '') {
          thirdPage.drawText(data[field].toString(), {
            x: positions.thirdPage[field].x,
            y: positions.thirdPage[field].y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      });

      if (data.vatNumberMain && data.vatNumberSuffix) {
        thirdPage.drawText(data.vatNumberMain, {
          x: positions.thirdPage.vatNumber.main.x,
          y: positions.thirdPage.vatNumber.main.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
        
        thirdPage.drawText(data.vatNumberSuffix, {
          x: positions.thirdPage.vatNumber.suffix.x,
          y: positions.thirdPage.vatNumber.suffix.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      if (data.registeredBefore === 'yes') {
        thirdPage.drawText('X', {
          x: positions.thirdPage.registeredBefore.xYes,
          y: positions.thirdPage.registeredBefore.yYes,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      } else if (data.registeredBefore === 'no') {
        thirdPage.drawText('X', {
          x: positions.thirdPage.registeredBefore.xNo,
          y: positions.thirdPage.registeredBefore.yNo,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      // Add mapping for language radio buttons
      if (data.language) {
        const languageMapping = {
          dutch: positions.thirdPage.languageDutch,
          german: positions.thirdPage.languageGerman,
          english: positions.thirdPage.languageEnglish
        };
        
        if (languageMapping[data.language]) {
          thirdPage.drawText('X', {
            x: languageMapping[data.language].x,
            y: languageMapping[data.language].y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

      // Ensure correspondence type mapping
      if (data.correspondenceType) {
        const typeCoords = positions.thirdPage.correspondenceType[data.correspondenceType];
        if (typeCoords) {
          thirdPage.drawText('X', {
            x: typeCoords.x,
            y: typeCoords.y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

      // Ensure services provided mapping
      if (data.servicesProvidedTo) {
        const serviceCoords = positions.thirdPage.servicesProvidedTo[data.servicesProvidedTo];
        if (serviceCoords) {
          thirdPage.drawText('X', {
            x: serviceCoords.x,
            y: serviceCoords.y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

      // Update the Chamber of Commerce mapping logic
      if (data.chamberOfCommerce) {
        thirdPage.drawText('X', {
          x: data.chamberOfCommerce === 'yes' ? 
             positions.thirdPage.chamberOfCommerce.xYes :
             positions.thirdPage.chamberOfCommerce.xNo,
          y: data.chamberOfCommerce === 'yes' ?
             positions.thirdPage.chamberOfCommerce.yYes :
             positions.thirdPage.chamberOfCommerce.yNo,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });

        // Separate condition for CoC number
        if (data.cocNumber && data.chamberOfCommerce === 'yes') {
          thirdPage.drawText(data.cocNumber.toString(), {
            x: positions.thirdPage.cocNumber.x,
            y: positions.thirdPage.cocNumber.y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

      Object.keys(positions.fourthPage).forEach(field => {
        if (data[field] && 
            field !== 'hasIBAN' && 
            field !== 'bankCountry' &&  // Exclude bankCountry
            field !== 'accountCountry' &&  // Also exclude accountCountry
            data[field].toString().trim() !== '') {
          fourthPage.drawText(data[field].toString(), {
            x: positions.fourthPage[field].x,
            y: positions.fourthPage[field].y,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      });

      // Handle both country fields separately
      if (data.accountCountry && data.accountCountry.toString().trim() !== '') {
        fourthPage.drawText(data.accountCountry.toString(), {
          x: positions.fourthPage.accountCountry.x,
          y: positions.fourthPage.accountCountry.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      if (data.bankCountry && data.bankCountry.toString().trim() !== '') {
        fourthPage.drawText(data.bankCountry.toString(), {
          x: positions.fourthPage.bankCountry.x,
          y: positions.fourthPage.bankCountry.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      // Add this block before the numberOfEnclosures mapping
      if (data.signature) {
        fourthPage.drawText(data.signature.toString(), {
          x: positions.fourthPage.signature.x,
          y: positions.fourthPage.signature.y,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      if (data.hasIBAN === 'yes') {
        fourthPage.drawText('X', {
          x: positions.fourthPage.hasIBAN.xYes,
          y: positions.fourthPage.hasIBAN.yYes,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      } else if (data.hasIBAN === 'no') {
        fourthPage.drawText('X', {
          x: positions.fourthPage.hasIBAN.xNo,
          y: positions.fourthPage.hasIBAN.yNo,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }

      const filledPdfBytes = await pdfDoc.save();
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError("Error processing PDF: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add this new function for handling downloads
  const handleVatPdfDownload = async () => {
    try {
      setIsProcessing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get PDF blob
      const pdfBlob = await (await fetch(downloadUrl)).blob();
      
      // Create unique filename
      const timestamp = new Date().toISOString();
      const fileName = `${user.id}/vat-form-${Date.now()}.pdf`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vat-forms')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error uploading PDF: ${uploadError.message}`);
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('vat_submissions')
        .insert({
          user_id: user.id,
          form_type: 'vat',
          file_path: fileName,
          submission_date: timestamp,
          form_data: formData,
          status: 'completed'
        });

      if (dbError) {
        throw new Error(`Error saving form metadata: ${dbError.message}`);
      }

      // Trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'vat-form.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (error) {
      setError(`Error downloading PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="vat-form-container">
      <div className="form-header">
        <img src={process.env.PUBLIC_URL + '/assets/belastingdienst-logo.png'} alt="Belastingdienst" className="logo" />
        <div className="header-text">
          <h1>Application for VAT Registration</h1>
        </div>
      </div>



      {/* Add this new section */}
      <div className="previous-submissions">
        <h2>Recent VAT Form Submissions</h2>
        {isLoadingHistory ? (
          <p>Loading previous submissions...</p>
        ) : submissions.length > 0 ? (
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-item">
                <div className="submission-info">
                  <span className="submission-date">
                    {new Date(submission.submission_date).toLocaleDateString()}
                  </span>
                  <span className="submission-status">
                    Status: {submission.status}
                  </span>
                </div>
                <div className="submission-actions">
                  <button
                    onClick={() => downloadPreviousSubmission(submission.file_path)}
                    className="view-button"
                  >
                    View PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No previous submissions found</p>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h2>1. Application for a VAT identification number</h2>
          <p>Check the applicable box.</p>
          <div className="form-field">
            <label>
              In the Netherlands, do you sell goods to private individuals?
              <small>Example: You are a foreign entrepreneur and you sell CDs to private individuals at a music fair in Amsterdam.</small>
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("sellToPrivateIndividuals")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("sellToPrivateIndividuals")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              From the Netherlands, do you sell goods to private individuals from other EU countries?
              <small>Example: You are a foreign entrepreneur and you send, from a rented warehouse in Rotterdam, clothing to a private individual from Valencia.</small>
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("sellFromNetherlands")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("sellFromNetherlands")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              In the Netherlands, do you sell goods to other foreign entrepreneurs?
              <small>Example: As a foreign entrepreneur, you have a rented warehouse in Rotterdam where you sell cheese to an entrepreneur from Hamburg.</small>
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("sellToEUCustomers")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("sellToEUCustomers")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              From the Netherlands, do you sell goods to entrepreneurs from other EU countries (intra-Community supplies)?
              <small>Example: As a foreign entrepreneur, you rented a warehouse in Rotterdam, from where you sent a shipment of flower bulbs to an entrepreneur from Glasgow.</small>
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("sellToEntrepreneurs")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("sellToEntrepreneurs")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              Do you bring your own goods from the Netherlands to another EU country?
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("bringGoodsToEU")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("bringGoodsToEU")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              From the Netherlands, do you sell goods to customers outside the EU?
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("sellToCustomersOutsideEU")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("sellToCustomersOutsideEU")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              Do you have intra-Community acquisitions (ICA) in the Netherlands?
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("haveIntraCommunityAcq")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("haveIntraCommunityAcq")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              Did you receive any invoices with Dutch VAT that has been reverse-charged to you?
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("receiveServicesWithVAT")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("receiveServicesWithVAT")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              Do you have other deliveries in the Netherlands subject to VAT?
              <small>Also choose 'Yes' if these are deliveries subject to a VAT rate of 0%.</small>
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("haveDeliveries")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("haveDeliveries")}
                /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <label>
              Do you charge VAT for services provided in the Netherlands?
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("chargeVATServices")}
                /> Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("chargeVATServices")}
                /> No
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>2. Company Details</h2>
          <div className="form-field">
            <label>2a. Legal name</label>
            <input {...register("legalName")} />
          </div>

          <div className="form-field">
            <label>2b. Trade name</label>
            <input {...register("tradeName")} />
          </div>

          <div className="form-field">
            <label>2c. Start date of your company</label>
            <div className="date-group">
              <input type="number" min="1" max="31" placeholder="DD" {...register("startDateDay")} />
              <input type="number" min="1" max="12" placeholder="MM" {...register("startDateMonth")} />
              <input type="number" min="1900" max={new Date().getFullYear()} placeholder="YYYY" {...register("startDateYear")} />
            </div>
          </div>

          <div className="form-field">
            <label>2d. Legal form of the company</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="one-man"
                  {...register("legalForm")}
                />
                One-man business
              </label>
              <label>
                <input
                  type="radio"
                  value="other"
                  {...register("legalForm")}
                />
                Other, namely
                <input
                  {...register("otherLegalForm")}
                  className="inline-input"
                  disabled={watch("legalForm") !== "other"}
                />
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>2e. Business address</label>
            <input
              {...register("address")}
              placeholder="Street and house number"
            />
            <div className="address-group">
              <input {...register("postcode")} placeholder="Postcode" />
              <input {...register("city")} placeholder="Town/city" />
            </div>
            <input {...register("country")} placeholder="Country" />
          </div>

          <div className="form-field">
            <label>2f. Telephone number</label>
            <input type="tel" {...register("telephone")} />
          </div>

          <div className="form-field">
            <label>2g. E-mail address</label>
            <input type="email" {...register("email")} />
          </div>

          <div className="form-field">
            <label>Website</label>
            <input type="url" {...register("website")} />
          </div>

          <div className="form-field">
            <label>Do you have a one-man business?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("oneManBusiness")}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("oneManBusiness")}
                />
                No
              </label>
            </div>
          </div>

          {watch("oneManBusiness") === "yes" && (
            <div className="form-field">
              <label>Home address details</label>
              <input {...register("homeStreet")} placeholder="Street and house number" />
              <div className="address-group">
                <input {...register("homePostcode")} placeholder="Postcode" />
                <input {...register("homeCity")} placeholder="Town/city" />
              </div>
              <input {...register("homeCountry")} placeholder="Country" />
            </div>
          )}

          <div className="form-field">
            <label>Do you have an authorized representative?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("hasAuthRep")}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("hasAuthRep")}
                />
                No
              </label>
            </div>
          </div>
          {watch("hasAuthRep") === "yes" && (
            <div className="form-field">
              <label>Authorized representative details</label>
              <input {...register("authRepName")} placeholder="Name" />
              <input {...register("authRepStreet")} placeholder="Street and house number" />
              <div className="address-group">
                <input {...register("authRepPostcode")} placeholder="Postcode" />
                <input {...register("authRepCity")} placeholder="Town/city" />
              </div>
              <input {...register("authRepCountry")} placeholder="Country" />
              <input type="tel" {...register("authRepTelephone")} placeholder="Telephone number" />
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>4. Correspondence</h2>
          <div className="form-field">
            <label>4a. Address at which you want to receive correspondence</label>
            <div className="radio-group">
              <label><input type="radio" value="business" {...register("correspondenceType")} /> Business address</label>
              <label><input type="radio" value="home" {...register("correspondenceType")} /> Home address</label>
              <label><input type="radio" value="auth" {...register("correspondenceType")} /> Address of the authorised representative</label>
              <label>
                <input type="radio" value="other" {...register("correspondenceType")} /> A different address, namely:
                {watch("correspondenceType") === "other" && (
                  <div className="nested-address">
                    <input {...register("correspondenceName")} placeholder="Name" />
                    <input {...register("correspondenceStreet")} placeholder="Street and house number" />
                    <div className="address-group">
                      <input {...register("correspondencePostcode")} placeholder="Postcode" />
                      <input {...register("correspondenceCity")} placeholder="Town/city" />
                    </div>
                    <input {...register("correspondenceCountry")} placeholder="Country" />
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>4b. In what language do you want to receive the correspondence?</label>
            <div className="radio-group">
              <label><input type="radio" value="dutch" {...register("language")} /> Dutch</label>
              <label><input type="radio" value="german" {...register("language")} /> German</label>
              <label><input type="radio" value="english" {...register("language")} /> English</label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>5. Registration in the Netherlands</h2>
          <div className="form-field">
            <label>5a. Has your company ever been registered with the Dutch Tax and Customs Administration before?</label>
            <div className="radio-group">
              <label><input type="radio" value="yes" {...register("registeredBefore")} /> Yes</label>
              <label><input type="radio" value="no" {...register("registeredBefore")} /> No</label>
            </div>
          </div>

          {watch("registeredBefore") === "yes" && (
            <div className="form-field">
              <label>5b. VAT identification number or registration number</label>
              <div className="vat-number-group">
                <span className="static-prefix">NL</span>
                <input maxLength="9" className="digits-9" {...register("vatNumberMain")} placeholder="123456789" />
                <span className="static-prefix">B</span>
                <input maxLength="2" className="digits-2" {...register("vatNumberSuffix")} placeholder="01" />
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>6. Registration in your own country</h2>
          <div className="form-field">
            <label>6a. VAT identification number</label>
            <input {...register("foreignVatNumber")} />
            <small>Only complete this question if you are based in another EU country</small>
          </div>
        </div>

        <div className="form-section">
          <h2>7. Business activities</h2>
          <div className="form-field">
            <label>7a. Sector in which your company is active in your own country</label>
            <input {...register("businessSector")} />
          </div>
          <div className="form-field">
            <label>7b. Activities of your company in the Netherlands</label>
            <textarea {...register("activitiesNetherlands")} rows={3} />
          </div>

          <div className="form-field">
            <label>7c. If you provide services in the Netherlands, who are they provided to?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="business"
                  {...register("servicesProvidedTo")}
                /> Only to businesses
              </label>
              <label>
                <input
                  type="radio"
                  value="private"
                  {...register("servicesProvidedTo")}
                /> Only to private individuals
              </label>
              <label>
                <input
                  type="radio"
                  value="both"
                  {...register("servicesProvidedTo")}
                /> Both businesses and private individuals
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>7d. Start date of your activities in the Netherlands</label>
            <div className="date-group">
              <input type="number" min="1" max="31" placeholder="DD" {...register("activityStartDateDay")} />
              <input type="number" min="1" max="12" placeholder="MM" {...register("activityStartDateMonth")} />
              <input type="number" min="1900" max={new Date().getFullYear()} placeholder="YYYY" {...register("activityStartDateYear")} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>8. Bank details</h2>
          <div className="form-field">
            <label>8a. Account number / IBAN to which you want the refund to be transferred</label>
            <p className="note">Please note! Do not fill in a savings account here.</p>
            <div className="radio-group">
              <label><input type="radio" value="yes" {...register("hasIBAN")} /> Yes, IBAN</label>
              <label><input type="radio" value="no" {...register("hasIBAN")} /> No, Bank account number</label>
            </div>

            {watch("hasIBAN") === "yes" && (
              <div className="iban-group">
                <input
                  maxLength="2"
                  size="2"
                  {...register("ibanBox1")}
                  placeholder="XX"
                />
                <input
                  maxLength="2"
                  size="2"
                  {...register("ibanBox2")}
                  placeholder="XX"
                />
                <input
                  maxLength="4"
                  size="4"
                  {...register("ibanBox3")}
                  placeholder="XXXX"
                />
                <input
                  maxLength="24"
                  size="24"
                  {...register("ibanBox4")}
                  placeholder="XXXXXXXXXXXXXXXXXXXXXXXX"
                />
              </div>
            )}

            {watch("hasIBAN") === "no" && (
              <input {...register("bankAccountNumber")} placeholder="Bank account number" />
            )}
          </div>

          <div className="form-field">
            <label>Name of account holder</label>
            <input {...register("accountHolderName")} />
          </div>

          <div className="form-field">
            <label>Street and house number</label>
            <input {...register("accountStreet")} />
          </div>

          <div className="form-field">
            <label>Postcode</label>
            <input {...register("accountPostcode")} />
          </div>

          <div className="form-field">
            <label>Town/city</label>
            <input {...register("accountCity")} />
          </div>

          <div className="form-field">
            <label>Country</label>
            <input {...register("accountCountry")} placeholder="Account country" />
          </div>

          <div className="form-field">
            <label>8b. Name of the bank</label>
            <input {...register("bankName")} />
          </div>

          <div className="form-field">
            <label>8c. Location of the bank</label>
            <input {...register("bankLocation")} />
          </div>

          <div className="form-field">
            <label>8d. Country of the bank</label>
            <input {...register("bankCountry")} placeholder="Bank country" />
          </div>

          <div className="form-field">
            <label>8e. BIC of the bank</label>
            <input {...register("bicCode")} />
          </div>
        </div>

        <div className="form-section">
          <h2>9. Signature</h2>
          <div className="form-field">
            <label>Name</label>
            <input {...register("signerName")} />
          </div>
          <div className="form-field">
            <label>Telephone number</label>
            <input type="tel" {...register("signerPhone")} />
          </div>
          <div className="form-field">
            <label>Date</label>
            <div className="date-group">
              <input type="number" min="1" max="31" placeholder="DD" {...register("signatureDateDay")} />
              <input type="number" min="1" max="12" placeholder="MM" {...register("signatureDateMonth")} />
              <input type="number" min="1900" max={new Date().getFullYear()} placeholder="YYYY" {...register("signatureDateYear")} />
            </div>
          </div>

          <div className="form-field">
            <label>Signature</label>
            <div className="signature-box">
              <textarea 
                {...register("signature")} 
                rows={4} 
                placeholder="Sign here"
                className="signature-area"
              />
              <p className="note">Please write within the box.</p>
            </div>
          </div>

          <div className="form-field">
            <label>Number of enclosures</label>
            <input type="number" {...register("numberOfEnclosures")} min="0" />
          </div>
        </div>

        <div className="button-container">
          {!downloadUrl ? (
            // Show Generate button if no PDF exists
            <button type="submit" disabled={isProcessing} className="primary-button">
              {isProcessing ? 'Processing...' : 'Generate VAT Form PDF'}
            </button>
          ) : (
            // Show actions for existing PDF
            <div className="pdf-actions">
              <button 
                onClick={() => window.open(downloadUrl, '_blank')} 
                className="preview-button"
              >
                Preview PDF
              </button>
              <button 
                onClick={handleVatPdfDownload} 
                className="download-button"
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Download PDF'}
              </button>
              <button 
                onClick={() => {
                  setDownloadUrl(null);
                  handleSubmit(onSubmit)();
                }} 
                className="regenerate-button"
              >
                Regenerate PDF
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default VAT;




