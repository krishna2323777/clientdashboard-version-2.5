// src/components/KVKRegistrationForm.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDocument, rgb } from 'pdf-lib';
import './Form13.css'; // Import the CSS file
import { supabase } from './SupabaseClient';

function Form13() {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [pdfExists, setPdfExists] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  
  const isRegistered = watch("isRegistered");
  const pdfUrl = process.env.PUBLIC_URL + '/assets/kvk-form2.pdf';
  
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

      // Store form data for later use when downloading
      setFormData(data);
      
      // Load the PDF document
      const response = await fetch(pdfUrl);
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
      const fifthPage = pages[4];
      
      const firstPagePositions = {
        // Section 1 - Organisation details
        companyName: { x: 360, y: 280 },
        placeOfEstablishment: { x: 360, y: 245 },
        registeredNo: { x: 304, y: 217 },
        registeredYes: { x: 304, y: 194},
        registrationNumber: { x: 325, y: 178 },
        
        // Section 2 - Type of authorisation
        authorisedRepresentative: { x: 304, y: 73 },
        authorisedBusinessAgent: { x: 304, y: 61 }
      };

      const secondPagePositions = {
        // Section 3.1 - Person type
        naturalPerson: { x: 304, y: 745 },
        partnershipEntity: { x: 304, y: 720 },
        
        // Section 3.2 - Personal details
        surname: { x: 360, y: 570 },
        firstName: { x: 360, y: 538 },
        citizenServiceNumber: { x: 360, y: 500 },
        dateOfBirth: { x: 360, y: 468 },
        placeOfBirth: { x: 360, y: 431 },
        countryOfBirth: { x: 360, y: 392 },
        genderMan: { x: 304, y: 362 },
        genderWoman: { x: 304, y: 350 },
        privateAddress: { x: 360, y: 320 },
        
        // Section 3.3 - Signature
        signature: { x: 360, y: 280 }
      };

      const thirdPagePositions = {
        // Section 3.4 - Partnership/legal entity details
        companyName: { x: 350, y: 750 },
        companyAddress: { x: 340, y: 700 },
        
        // Section 3.5 - KVK registration
        registeredNo: { x: 304, y: 638 },
        registeredYes: { x: 304, y: 625 },
        kvkNumber: { x: 360, y: 610 },
        
        // Section 3.6 - Foreign registration
        foreignRegNumber: { x: 360, y: 492 },
        registerName: { x: 360, y: 452},
        registeringInstitution: { x: 360, y: 412 },
        
        // Section 4 - Contents of authorisation
        representativeTitle: { x: 360, y: 250 },
        authorizationDate: { x: 360, y: 230 }
      };

      const fourthPagePositions = {
        // Section 4.3 - Authorization limitations
        fullAuthorization: { x: 304, y: 745 },  // Full checkbox
        limitedNamely: { x: 304, y: 698},      // Limited namely checkbox
        
        // Limited amount section
        limitedAmount: { x: 321, y: 685 },      // Amount checkbox
        amountValue: { x: 400, y: 670 },        // Amount value field
        
        // Limitation by actions
        limitedByActions: { x: 321, y: 650 },    // Actions checkbox
        submitStatements: { x: 338, y: 637},    // Business Register statements
        preparePriceQuotes: { x: 338, y: 626 },  // Price quotations
        rdwServices: { x: 338, y: 614},         // RDW vehicle services
        rdwLicensePlates: { x: 338, y: 60 },    // RDW license plates
        
        // Contracts and agreements matrix
        // Unlimited column
        purchasingUnlimited: { x: 391, y: 528 },
        salesUnlimited: { x: 391, y: 506 },
        guaranteesUnlimited: { x: 391, y: 480 },
        leaseUnlimited: { x: 391, y: 455},      // Adjusted coordinates for lease
        financingUnlimited: { x: 391, y: 420 },
        softwareUnlimited: { x:391, y: 397},
        maintenanceUnlimited: { x: 391, y: 373},
        otherUnlimited: { x: 391, y: 350},
        
        // Limited column
        purchasingLimited: { x: 440, y: 528 },
        salesLimited: { x: 440, y: 506 },
        guaranteesLimited: { x: 440, y: 480 },
        leaseLimited: { x: 440, y: 455 },        // Adjusted coordinates for lease
        financingLimited: { x: 440, y: 420 },
        softwareLimited: { x: 440, y: 397 },
        maintenanceLimited: { x: 440, y: 373 },
        otherLimited: { x: 440, y: 350 },
        
        // Amount column
        purchasingAmount: { x: 485, y: 530 },
        salesAmount: { x: 485, y: 506 },
        guaranteesAmount: { x: 486, y: 480},
        leaseAmount: { x: 486, y: 455 },         // Adjusted coordinates for lease
        financingAmount: { x: 486, y: 422 },
        softwareAmount: { x: 486, y: 397 },
        maintenanceAmount: { x: 486, y: 373},
        otherAmount: { x: 486, y: 350 },
        
        // Other specification field
        otherSpecification: { x: 360, y: 315 },
        
        // Section 4.4 - Authorization scope
        entireCompany: { x: 304, y: 265 },
        specificBranches: { x: 304, y: 253},
        branchDetails: { x: 323, y: 220 },
        
        // Section 4.5 - Additional representative
        noAdditional: { x: 304, y: 145 },
        yesAdditional: { x: 304, y: 120 }
      };

      // Add fifth page positions
      const fifthPagePositions = {
        // Section 5 - Signature
        surname: { x: 323, y: 635 },
        emailAddress: { x: 323, y: 600 },
        phoneNumber: { x: 323, y: 560 },
        signatureDate: { x: 323, y: 520 },
        signature: { x: 423, y: 415 },
        
        // Section 6 - Other forms
        noCompany: { x: 305, y: 326},
        yesCompany: { x: 305, y:276 }
      };

      const checkboxFont = await pdfDoc.embedFont('Helvetica-Bold');
      
      // Section 1 - Organisation details
      if (data.companyName) {
        firstPage.drawText(data.companyName, {
          x: firstPagePositions.companyName.x,
          y: firstPagePositions.companyName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.placeOfEstablishment) {
        firstPage.drawText(data.placeOfEstablishment, {
          x: firstPagePositions.placeOfEstablishment.x,
          y: firstPagePositions.placeOfEstablishment.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Registration status
      if (data.isRegistered === "no") {
        firstPage.drawText("X", {
          x: firstPagePositions.registeredNo.x,
          y: firstPagePositions.registeredNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.isRegistered === "yes") {
        firstPage.drawText("X", {
          x: firstPagePositions.registeredYes.x,
          y: firstPagePositions.registeredYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.registrationNumber) {
          firstPage.drawText(data.registrationNumber, {
            x: firstPagePositions.registrationNumber.x,
            y: firstPagePositions.registrationNumber.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Section 2 - Type of authorisation
      if (data.authorisationType === "representative") {
        firstPage.drawText("X", {
          x: firstPagePositions.authorisedRepresentative.x,
          y: firstPagePositions.authorisedRepresentative.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.authorisationType === "agent") {  
        firstPage.drawText("X", {
          x: firstPagePositions.authorisedBusinessAgent.x,
          y: firstPagePositions.authorisedBusinessAgent.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }
 
      // Draw second page content
      // Section 3.1 - Person type
      if (data.personType === "natural") {
        secondPage.drawText("X", {
          x: secondPagePositions.naturalPerson.x,
          y: secondPagePositions.naturalPerson.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.personType === "partnership") {
        secondPage.drawText("X", {
          x: secondPagePositions.partnershipEntity.x,
          y: secondPagePositions.partnershipEntity.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Section 3.2 - Personal details
      if (data.surname) {
        secondPage.drawText(data.surname, {
          x: secondPagePositions.surname.x,
          y: secondPagePositions.surname.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.firstName) {
        secondPage.drawText(data.firstName, {
          x: secondPagePositions.firstName.x,
          y: secondPagePositions.firstName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.citizenServiceNumber) {
        secondPage.drawText(data.citizenServiceNumber, {
          x: secondPagePositions.citizenServiceNumber.x,
          y: secondPagePositions.citizenServiceNumber.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.dateOfBirth) {
        secondPage.drawText(data.dateOfBirth, {
          x: secondPagePositions.dateOfBirth.x,
          y: secondPagePositions.dateOfBirth.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.placeOfBirth) {
        secondPage.drawText(data.placeOfBirth, {
          x: secondPagePositions.placeOfBirth.x,
          y: secondPagePositions.placeOfBirth.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.countryOfBirth) {
        secondPage.drawText(data.countryOfBirth, {
          x: secondPagePositions.countryOfBirth.x,
          y: secondPagePositions.countryOfBirth.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.gender === "man") {
        secondPage.drawText("X", {
          x: secondPagePositions.genderMan.x,
          y: secondPagePositions.genderMan.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.gender === "woman") {
        secondPage.drawText("X", {
          x: secondPagePositions.genderWoman.x,
          y: secondPagePositions.genderWoman.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      if (data.privateAddress) {
        secondPage.drawText(data.privateAddress, {
          x: secondPagePositions.privateAddress.x,
          y: secondPagePositions.privateAddress.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 3.3 - Signature
      if (data.signature) {
        secondPage.drawText("X", {
          x: secondPagePositions.signature.x,
          y: secondPagePositions.signature.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Draw third page content
      // Section 3.4 - Partnership/Legal Entity Details
      if (data.companyName) {
        thirdPage.drawText(data.companyName, {
          x: thirdPagePositions.companyName.x,
          y: thirdPagePositions.companyName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.companyAddress) {
        thirdPage.drawText(data.companyAddress, {
          x: thirdPagePositions.companyAddress.x,
          y: thirdPagePositions.companyAddress.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 3.5 - KVK Registration - Independent of person type
      if (data.isCompanyRegistered === "no") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.registeredNo.x,
          y: thirdPagePositions.registeredNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.isCompanyRegistered === "yes") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.registeredYes.x,
          y: thirdPagePositions.registeredYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.kvkNumber) {
          thirdPage.drawText(data.kvkNumber, {
            x: thirdPagePositions.kvkNumber.x,
            y: thirdPagePositions.kvkNumber.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Section 3.6 - Foreign Registration - Independent of person type
      if (data.foreignRegNumber) {
        thirdPage.drawText(data.foreignRegNumber, {
          x: thirdPagePositions.foreignRegNumber.x,
          y: thirdPagePositions.foreignRegNumber.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.registerName) {
        thirdPage.drawText(data.registerName, {
          x: thirdPagePositions.registerName.x,
          y: thirdPagePositions.registerName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.registeringInstitution) {
        thirdPage.drawText(data.registeringInstitution, {
          x: thirdPagePositions.registeringInstitution.x,
          y: thirdPagePositions.registeringInstitution.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 4 - Contents of authorisation
      if (data.representativeTitle) {
        thirdPage.drawText(data.representativeTitle, {
          x: thirdPagePositions.representativeTitle.x,
          y: thirdPagePositions.representativeTitle.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.authorizationDate) {
        thirdPage.drawText(data.authorizationDate, {
          x: thirdPagePositions.authorizationDate.x,
          y: thirdPagePositions.authorizationDate.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Draw fourth page content
      // Section 4.3 - Authorization limitations
      if (data.authorizationType === "full") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.fullAuthorization.x,
          y: fourthPagePositions.fullAuthorization.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.authorizationType === "limited") {
        // Draw the "limited" checkbox
        fourthPage.drawText("X", {
          x: fourthPagePositions.limitedNamely.x,
          y: fourthPagePositions.limitedNamely.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        // Draw limitation type checkboxes
        if (data.limitationType === "partial") {
          fourthPage.drawText("X", {
            x: fourthPagePositions.limitedPartially.x,
            y: fourthPagePositions.limitedPartially.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        } else if (data.limitationType === "amount") {
          fourthPage.drawText("X", {
            x: fourthPagePositions.limitedAmount.x,
            y: fourthPagePositions.limitedAmount.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
          if (data.limitationAmount) {
            fourthPage.drawText(data.limitationAmount, {
              x: fourthPagePositions.amountValue.x,
              y: fourthPagePositions.amountValue.y,
              size: 10,
              color: rgb(0, 0, 0)
            });
          }
        } else if (data.limitationType === "actions") {
          fourthPage.drawText("X", {
            x: fourthPagePositions.limitedByActions.x,
            y: fourthPagePositions.limitedByActions.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
          
          // Draw all action checkboxes
          if (data.submitStatements) {
            fourthPage.drawText("X", {
              x: fourthPagePositions.submitStatements.x,
              y: fourthPagePositions.submitStatements.y,
              size: 12,
              font: checkboxFont,
              color: rgb(0, 0, 0)
            });
          }
          
          if (data.preparePriceQuotes) {
            fourthPage.drawText("X", {
              x: fourthPagePositions.preparePriceQuotes.x,
              y: fourthPagePositions.preparePriceQuotes.y,
              size: 12,
              font: checkboxFont,
              color: rgb(0, 0, 0)
            });
          }

          if (data.rdwSuspension) {
            fourthPage.drawText("X", {
              x: fourthPagePositions.rdwServices.x,
              y: fourthPagePositions.rdwServices.y,
              size: 12,
              font: checkboxFont,
              color: rgb(0, 0, 0)
            });
          }

          if (data.rdwLicensePlates) {
            fourthPage.drawText("X", {
              x: fourthPagePositions.rdwLicensePlates.x,
              y: fourthPagePositions.rdwLicensePlates.y,
              size: 12,
              font: checkboxFont,
              color: rgb(0, 0, 0)
            });
          }
        }
      }

      // Draw contracts matrix
      const contractTypes = ['purchasing', 'sales', 'guarantees', 'lease (rental)', 'financing', 'software', 'maintenance', 'other'];
      contractTypes.forEach(type => {
        // Convert the display name to the coordinate key
        const coordKey = type.replace(' (rental)', '');
        if (data[`${coordKey}Type`] === "unlimited") {
          fourthPage.drawText("X", {
            x: fourthPagePositions[`${coordKey}Unlimited`].x,
            y: fourthPagePositions[`${coordKey}Unlimited`].y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        } else if (data[`${coordKey}Type`] === "limited") {
          fourthPage.drawText("X", {
            x: fourthPagePositions[`${coordKey}Limited`].x,
            y: fourthPagePositions[`${coordKey}Limited`].y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
          
          if (data[`${coordKey}Amount`]) {
            fourthPage.drawText(data[`${coordKey}Amount`], {
              x: fourthPagePositions[`${coordKey}Amount`].x,
              y: fourthPagePositions[`${coordKey}Amount`].y,
              size: 10,
              color: rgb(0, 0, 0)
            });
          }
        }
      });

      // Draw other specification if provided
      if (data.otherSpecification) {
        fourthPage.drawText(data.otherSpecification, {
          x: fourthPagePositions.otherSpecification.x,
          y: fourthPagePositions.otherSpecification.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 4.4 - Authorization scope
      if (data.authorizationScope === "entire") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.entireCompany.x,
          y: fourthPagePositions.entireCompany.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.authorizationScope === "specific") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.specificBranches.x,
          y: fourthPagePositions.specificBranches.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
        
        if (data.branchDetails) {
          fourthPage.drawText(data.branchDetails, {
            x: fourthPagePositions.branchDetails.x,
            y: fourthPagePositions.branchDetails.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Section 4.5 - Additional representative
      if (data.additionalRepresentative === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.noAdditional.x,
          y: fourthPagePositions.noAdditional.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.additionalRepresentative === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.yesAdditional.x,
          y: fourthPagePositions.yesAdditional.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Draw fifth page content
      if (data.surname) {
        fifthPage.drawText(data.surname, {
          x: fifthPagePositions.surname.x,
          y: fifthPagePositions.surname.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.emailAddress) {
        fifthPage.drawText(data.emailAddress, {
          x: fifthPagePositions.emailAddress.x,
          y: fifthPagePositions.emailAddress.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.phoneNumber) {
        fifthPage.drawText(data.phoneNumber, {
          x: fifthPagePositions.phoneNumber.x,
          y: fifthPagePositions.phoneNumber.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.signatureDate) {
        fifthPage.drawText(data.signatureDate, {
          x: fifthPagePositions.signatureDate.x,
          y: fifthPagePositions.signatureDate.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 6 - Other forms checkboxes
      if (data.hasCompany === "no") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.noCompany.x,
          y: fifthPagePositions.noCompany.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.hasCompany === "yes") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.yesCompany.x,
          y: fifthPagePositions.yesCompany.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      const filledPdfBytes = await pdfDoc.save();

      // Create blob for preview only (not storing in Supabase yet)
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Error processing PDF: ' + error.message);
      setIsProcessing(false);
    }
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
      downloadLink.download = 'kvk-form-13.pdf';
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
      
      // Map form data to PDF fields - reusing the same code that was in onSubmit
      // We need to fill in the PDF data for storage
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const secondPage = pages[1];
      const thirdPage = pages[2];
      const fourthPage = pages[3];
      const fifthPage = pages[4];
      
      const firstPagePositions = {
        // Section 1 - Organisation details
        companyName: { x: 360, y: 280 },
        placeOfEstablishment: { x: 360, y: 245 },
        registeredNo: { x: 304, y: 217 },
        registeredYes: { x: 304, y: 194},
        registrationNumber: { x: 325, y: 178 },
        
        // Section 2 - Type of authorisation
        authorisedRepresentative: { x: 304, y: 73 },
        authorisedBusinessAgent: { x: 304, y: 61 }
      };
      
      // Fill in the PDF with formData
      // (This is a simplified example - in your actual code, reuse the PDF filling logic from onSubmit)
      const checkboxFont = await pdfDoc.embedFont('Helvetica-Bold');
      
      if (formData.companyName) {
        firstPage.drawText(formData.companyName, {
          x: firstPagePositions.companyName.x,
          y: firstPagePositions.companyName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }
      
      // Continue filling in all PDF fields from formData (same logic as in onSubmit)
      // ...
      
      const filledPdfBytes = await pdfDoc.save();
      
      // Create user-specific folder path using user ID
      const userFolder = user.id;
      // Generate unique filename
      const timestamp = Date.now();
      // Use user ID folder structure
      const filepath = `${userFolder}/form13_${timestamp}.pdf`;
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });

      console.log('Uploading PDF to storage path:', filepath);
      
      // Upload PDF to Supabase Storage in user-specific folder
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('form-13')
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
       
        form_type: 'form-13',
        file_path: filepath,
        submission_date: new Date().toISOString(),
        form_data: {
          organization: {
            company_name: formData.companyName,
            place_of_establishment: formData.placeOfEstablishment,
            is_registered: formData.isRegistered,
            registration_number: formData.registrationNumber
          },
          authorization: {
            type: formData.authorisationType
          },
          representative: {
            person_type: formData.personType,
            surname: formData.surname,
            first_name: formData.firstName,
            citizen_service_number: formData.citizenServiceNumber,
            date_of_birth: formData.dateOfBirth,
            place_of_birth: formData.placeOfBirth,
            country_of_birth: formData.countryOfBirth,
            gender: formData.gender,
            private_address: formData.privateAddress
          },
          // Include all other necessary form data here
        },
        status: 'completed'
      };
      
      console.log('Saving form metadata to database:', formDataRecord);

      // Save form metadata to database
      const { data: insertData, error: dbError } = await supabase
        .from('form_13_submissions')
        .insert(formDataRecord);

      if (dbError) {
        console.error('Database insertion error:', dbError);
        throw new Error(`Error saving form data: ${dbError.message}`);
      }
      
      console.log('Form metadata saved successfully:', insertData);
      
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(`Failed to process PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
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

  // Show confirmation popup when download is clicked
  const handleDownloadClick = () => {
    if (!downloadUrl || !formData) return;
    setShowConfirmPopup(true);
  };

  // Cancel download
  const cancelDownload = () => {
    console.log('Download cancelled by user');
    setShowConfirmPopup(false);
  };

  // Clean up the URL when component unmounts
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  // Add function to download blank form
  const downloadBlankForm = () => {
    if (pdfExists) {
      window.open(pdfUrl, '_blank');
    } else {
      setError(`Cannot download form. PDF template not found at: ${pdfUrl}`);
    }
  };

  return (
    <div className="registration-form">
      <h1>KVK Form-13 Registration of Authorised Person</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="kvk-form">
        {/* Section 1 - Organisation details */}
        <div className="form-section">
          <h2>1. Details of the organisation that has granted the authorisation</h2>
          
          <div className="note-box">
            <p>Notes 1.1 and 1.2</p>
            <p>KVK needs to know which company or legal entity grants the authorisation.</p>
            <p>The details we need are the name, place of establishment and, if the company or legal entity is already registered, the KVK number.</p>
          </div>

          <div className="form-field">
            <label>1.1 Which company or legal entity grants the authorisation?</label>
            <div className="sub-field">
              <label>the name of the company or legal entity is</label>
              <input {...register("companyName")} />
            </div>
            <div className="sub-field">
              <label>the place of establishment is</label>
              <input {...register("placeOfEstablishment")} />
            </div>
          </div>

          <div className="form-field">
            <label>1.2 Is the company or legal entity already registered with KVK?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("isRegistered")} 
                />
                <span>no</span>
              </label>
              {isRegistered === "no" && (
                <div className="note indent">
                  Add this form to the form you use to register the company.
                </div>
              )}
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("isRegistered")} 
                />
                <span>yes, the KVK number is</span>
              </label>
              {isRegistered === "yes" && (
                <input {...register("registrationNumber")} className="inline-input" />
              )}
            </div>
          </div>
        </div>

        {/* Section 2 - Type of authorisation */}
        <div className="form-section">
          <h2>2. Type of authorisation</h2>
          
          <div className="note-box">
            <p>Note 2.1</p>
            <p>An authorised representative is a person who has been authorised to perform legal acts on behalf of the party granting the authorisation.</p>
            <p>An authorised business agent is a self-employed person who mediates agreements on behalf of the legal entity granting the authorisation.</p>
          </div>

          <div className="form-field">
            <label>2.1 Does this registration concern an authorised representative or an authorised business agent?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="representative" 
                  {...register("authorisationType")} 
                />
                <span>an authorised representative</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="agent" 
                  {...register("authorisationType")} 
                />
                <span>an authorised business agent</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3 - Details of authorised representative / business agent */}
        <div className="form-section">
          <h2>3. Details of authorised representative / authorised business agent</h2>
          
          {/* Section 3.1 - Person type */}
          <div className="form-field">
            <label>3.1 Is the authorisation granted to a partnership/legal entity or a natural person?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="natural" 
                  {...register("personType")} 
                />
                <span>a natural person</span>
              </label>
              <small>→ Go to question 3.2</small>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="partnership" 
                  {...register("personType")} 
                />
                <span>a partnership/legal entity</span>
              </label>
              <small>→ Go to question 3.4</small>
            </div>
          </div>

          {/* Section 3.2 - Personal details */}
          {watch("personType") === "natural" && (
            <div className="form-field">
              <label>3.2 What are the authorised representative's details?</label>
              
              <div className="note-box">
                <p>Note 3.2</p>
                <p>You will find the Citizen Service Number (BSN) on your Dutch passport or driving licence, among others.</p>
                <p>The Business Register is linked to the municipal personal records database (BRP). If your address is not or incorrectly registered in the BRP, you must first have it corrected by your municipality.</p>
                <p>Note!</p>
                <p>If you live abroad and have a Citizen Service Number (BSN), you are registered in the BRP with your foreign residential address. Please provide your Citizen Service Number (BSN) in that case too.</p>
                <p>If you move to or within a foreign country, you do have to report the change of address to KVK.</p>
              </div>

              <div className="personal-details">
                <div className="sub-field">
                  <label>surname</label>
                  <input {...register("surname")} />
                </div>
                
                <div className="sub-field">
                  <label>First name(s) (in full)</label>
                  <input {...register("firstName")} />
                </div>
                
                <div className="sub-field">
                  <label>Citizen Service Number (mandatory)</label>
                  <input {...register("citizenServiceNumber")} />
                </div>
                
                <div className="sub-field">
                  <label>date of birth</label>
                  <input {...register("dateOfBirth")} />
                </div>
                
                <div className="sub-field">
                  <label>place of birth</label>
                  <input {...register("placeOfBirth")} />
                </div>
                
                <div className="sub-field">
                  <label>country of birth, if not the Netherlands</label>
                  <input {...register("countryOfBirth")} />
                </div>
                
                <div className="sub-field">
                  <label>gender</label>
                  <div className="radio-field">
                    <label>
                      <input 
                        type="radio" 
                        value="man" 
                        {...register("gender")} 
                      />
                      <span>man</span>
                    </label>
                  </div>
                  <div className="radio-field">
                    <label>
                      <input 
                        type="radio" 
                        value="woman" 
                        {...register("gender")} 
                      />
                      <span>woman</span>
                    </label>
                  </div>
                </div>
                
                <div className="sub-field">
                  <label>private address</label>
                  <textarea {...register("privateAddress")} rows="3" />
                </div>
              </div>
            </div>
          )}

          {/* Section 3.3 - Signature */}
          {watch("personType") === "natural" && (
            <div className="form-field">
              <label>3.3 Signature of authorised representative</label>
              <small>(by pen, not a copy)</small>
              <div className="signature-box">
                <span className="signature-x">x</span>
                <input type="hidden" {...register("signature")} />
              </div>
              <small>→ Go to question 4 Contents of authorisation.</small>
            </div>
          )}
        </div>
        
        {/* Partnership/Legal Entity Details - Only show if partnership/legal entity is selected */}
        {watch("personType") === "partnership" && (
          <>
            <div className="form-section">
              <div className="form-field">
                <label>3.4 To which partnership or legal entity is the authorisation granted?</label>
                <div className="sub-field">
                  <label>name of the company/legal entity</label>
                  <input {...register("companyName")} />
                </div>
                <div className="sub-field">
                  <label>address</label>
                  <textarea {...register("companyAddress")} rows="3" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Section 3.5 - KVK Registration - Independent of person type */}
        <div className="form-section">
          <div className="form-field">
            <label>3.5 Is the partnership or legal entity registered in the KVK Business Register?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("isCompanyRegistered")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("isCompanyRegistered")} 
                />
                <span>yes, the KVK number is</span>
              </label>
              {watch("isCompanyRegistered") === "yes" && (
                <input {...register("kvkNumber")} className="inline-input" />
              )}
            </div>
            <small>→ Proceed to question 4, Contents of authorisation.</small>
          </div>
        </div>

        {/* Section 3.6 - Foreign Registration - Independent of person type */}
        <div className="form-section">
          <div className="note-box">
            <p>Note 3.6</p>
            <p>If a foreign partnership or legal entity performs the duties of authorised representative, you must enclose the following documents with this registration: a certificate of registration of that partnership or legal entity stating the directors. This proof cannot be older than one month.</p>
          </div>

          <div className="form-field">
            <label>3.6 Foreign registration</label>
            <div className="sub-field">
              <label>foreign registration number</label>
              <input {...register("foreignRegNumber")} />
            </div>
            <div className="sub-field">
              <label>name of the register</label>
              <input {...register("registerName")} />
            </div>
            <div className="sub-field">
              <label>name, city and country of the registering institution</label>
              <textarea {...register("registeringInstitution")} rows="3" />
            </div>
          </div>
        </div>

        {/* Section 4 - Contents of authorisation */}
        <div className="form-section">
          <h2>4. Contents of authorisation</h2>
          
          <div className="note-box">
            <p>Note 4.1</p>
            <p>For example, a title is:</p>
            <ul>
              <li>proxy</li>
              <li>sales manager</li>
            </ul>
          </div>

          <div className="form-field">
            <label>4.1 The title, if any, of the authorised representative</label>
            <input {...register("representativeTitle")} />
          </div>

          <div className="form-field">
            <label>4.2 The date on which the authorisation took effect</label>
            <input {...register("authorizationDate")} placeholder="DD-MM-YYYY" />
          </div>
        </div>
        
        {/* Section 4.3 - Authorization limitations */}
        <div className="form-section">
          <div className="note-box">
            <p>Note 4.3</p>
            <p>If the authorisation is limited, indicate the limitations here. For example, a limitation may relate to the scope of work or an amount of money.</p>
          </div>

          <div className="form-field">
            <label>4.3 Is the authorisation granted full or limited?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="full" 
                  {...register("authorizationType")} 
                />
                <span>full</span>
              </label>
              <small>→ Proceed to question 4.4</small>
            </div>

            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="limited" 
                  {...register("authorizationType")} 
                />
                <span>limited, namely:</span>
              </label>

              {watch("authorizationType") === "limited" && (
                <div className="limitation-options indent">
                  <div className="radio-field">
                    <label>
                      <input 
                        type="radio" 
                        value="amount" 
                        {...register("limitationType")} 
                      />
                      <span>limitation up to an amount of €</span>
                      {watch("limitationType") === "amount" && (
                        <input 
                          {...register("limitationAmount")} 
                          className="inline-input" 
                        />
                      )}
                    </label>
                  </div>

                  <div className="radio-field">
                    <label>
                      <input 
                        type="radio" 
                        value="actions" 
                        {...register("limitationType")} 
                      />
                      <span>limitation by action, namely (several answers possible)</span>
                    </label>
                    
                    {watch("limitationType") === "actions" && (
                      <div className="checkbox-group indent">
                        <label>
                          <input type="checkbox" {...register("submitStatements")} />
                          <span>submitting statements to the Business Register</span>
                        </label>
                        <label>
                          <input type="checkbox" {...register("preparePriceQuotes")} />
                          <span>preparing price quotations</span>
                        </label>
                        <label>
                          <input type="checkbox" {...register("rdwSuspension")} />
                          <span>RDW services for suspension of vehicles</span>
                        </label>
                        <label>
                          <input type="checkbox" {...register("rdwLicensePlates")} />
                          <span>RDW services for license plates</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {watch("authorizationType") === "limited" && (
              <div className="contracts-matrix">
                <p>Entering into contracts or agreements in the field of:</p>
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>unlimited</th>
                      <th>limited to</th>
                      <th>amount in €</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['purchasing', 'sales', 'guarantees', 'lease (rental)', 'financing', 'software', 'maintenance'].map(type => {
                      // Convert display name to form field name
                      const fieldName = type.replace(' (rental)', '');
                      return (
                      <tr key={type}>
                        <td>{type}</td>
                        <td>
                          <input 
                            type="radio" 
                            value="unlimited" 
                            {...register(`${fieldName}Type`)} 
                          />
                        </td>
                        <td>
                          <input 
                            type="radio" 
                            value="limited" 
                            {...register(`${fieldName}Type`)} 
                          />
                        </td>
                        <td>
                          {watch(`${fieldName}Type`) === "limited" && (
                            <input {...register(`${fieldName}Amount`)} />
                          )}
                        </td>
                      </tr>
                    )})}
                    <tr>
                      <td>
                        other,
                        <br />
                        namely:
                        <input {...register("otherSpecification")} />
                      </td>
                      <td>
                        <input 
                          type="radio" 
                          value="unlimited" 
                          {...register("otherType")} 
                        />
                      </td>
                      <td>
                        <input 
                          type="radio" 
                          value="limited" 
                          {...register("otherType")} 
                        />
                      </td>
                      <td>
                        {watch("otherType") === "limited" && (
                          <input {...register("otherAmount")} />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <small>* Attach an attachment on which the authorisation is written out or complete form 18.</small>
              </div>
            )}
          </div>

          {/* Section 4.4 - Authorization scope */}
          <div className="form-field">
            <label>4.4 Does the authorization apply to the entire company or specific branch(es)?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="entire" 
                  {...register("authorizationScope")} 
                />
                <span>the entire company</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="specific" 
                  {...register("authorizationScope")} 
                />
                <span>one or more specific branch(es) (enter the address and branch number(s) of these branch(es) below)</span>
              </label>
              {watch("authorizationScope") === "specific" && (
                <textarea {...register("branchDetails")} rows="3" className="indent" />
              )}
            </div>
          </div>

          {/* Section 4.5 - Additional representative */}
          <div className="form-field">
            <label>4.5 Do you wish to register another authorised representative?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("additionalRepresentative")} 
                />
                <span>no</span>
              </label>
              <small>→ Proceed to question 5 Signature</small>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("additionalRepresentative")} 
                />
                <span>yes</span>
              </label>
              <small>→ Go first to question 5 Signature. Register the following authorised representative on a new form 'Registration of authorised representative'.</small>
            </div>
          </div>
        </div>
        
        {/* Section 5 - Signature */}
        <div className="form-section">
          <h2>5. Signature of this form</h2>
          <div className="note-box">
            <p>Note 5.1</p>
            <p>This form can only be signed by:</p>
            <ul>
              <li>the owner of an eenmanszaak (sole proprietorship)</li>
              <li>one of the partners of a vof (general partnership) or cv (limited partnership)</li>
              <li>one of the partners of a maatschap (professional partnership)</li>
              <li>a (managing) director of a legal entity</li>
              <li>a civil-law notary</li>
            </ul>
          </div>

          <div className="form-group1">
            <label>Surname and initial(s)</label>
            <input type="text" {...register("surname")} />
          </div>

          <div className="form-group1">
            <label>Email address</label>
            <input type="email" {...register("emailAddress")} />
          </div>

          <div className="form-group1">
            <label>Phone number</label>
            <input type="tel" {...register("phoneNumber")} />
          </div>

          <div className="form-group1">
            <label>Signature date</label>
            <input type="date" {...register("signatureDate")} />
          </div>

          <div className="form-group1">
            <label>Signature (in pen, not a copy)</label>
            <div className="signature-box">
              <span className="signature-x">x</span>
            </div>
          </div>
        </div>

        {/* Section 6 - Other forms */}
        <div className="form-section">
          <h2>6. Other forms to be completed</h2>
          <div className="note-box">
            <p>Note 6.1</p>
            <p>These questions allow you to check that all forms relevant to the company's registration have been completed.</p>
          </div>

          <div className="form-group1">
            <label>Does this registration concern an authorised representative for an association/foundation without a company?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="no"
                  {...register("hasCompany")}
                />
                No
              </label>
              <small>After this form is completed and signed, make an appointment to hand it in at one of the KVK offices.</small>

              <label>
                <input
                  type="radio"
                  value="yes"
                  {...register("hasCompany")}
                />
                Yes
              </label>
              <small>Once this form has been completed and signed, send it to KVK together with a copy of a valid identification document.</small>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexDirection: 'column' }}>
          {!downloadUrl && (
            <button 
              type="submit"
              disabled={isProcessing} 
              className="form13-primary-button" 
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
                  margin: '0 auto'
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

export default Form13;