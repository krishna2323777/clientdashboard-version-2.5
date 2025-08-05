// src/components/KVKRegistrationForm.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDocument, rgb } from 'pdf-lib';
import axios from 'axios';
import { supabase } from './SupabaseClient';
import './Form9.css';

function KVKRegistrationForm() {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: {
      companyType: "new"
    }
  });
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch data from branch_registration_data table
          const { data: branchData, error: branchError } = await supabase
            .from('branch_registration_data')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (branchError && branchError.code !== 'PGRST116') {
            console.error('Error fetching branch registration data:', branchError);
          }

          if (branchData) {
            console.log('Fetched branch registration data:', branchData);
            
            // Auto-fill form fields from branch_registration_data
            if (branchData.company_name) {
              setValue('companyName', branchData.company_name);
            }
            
            if (branchData.legal_form) {
              setValue('legalForm', branchData.legal_form);
            }
            
            if (branchData.reg_number) {
              setValue('foreignRegistrationNumber', branchData.reg_number);
              setValue('chamberNumber', branchData.reg_number); // Map to chamber number field
            }
            
            if (branchData.foreign_register_name) {
              setValue('registerName', branchData.foreign_register_name);
            }
            
            if (branchData.foreign_registering_institution) {
              setValue('registeringInstitution', branchData.foreign_registering_institution);
            }
            
            if (branchData.foreign_registration_location) {
              setValue('registrationLocation', branchData.foreign_registration_location);
            }
            
            if (branchData.formally_registered_since) {
              setValue('startingDate', branchData.formally_registered_since);
              setValue('registrationDate', branchData.formally_registered_since);
              setValue('originalRegistrationDate', branchData.formally_registered_since);
            }
            
            if (branchData.registered_office) {
              setValue('registeredOffice', branchData.registered_office);
            }
            
            if (branchData.principal_place_of_business) {
              setValue('companyAddress', branchData.principal_place_of_business);
            }
            
            if (branchData.activities_description) {
              setValue('companyActivities', branchData.activities_description);
            }
            
            if (branchData.main_activity) {
              setValue('mostImportantActivity', branchData.main_activity);
            }
            
            if (branchData.trade_names) {
              setValue('singleTradeName', branchData.trade_names);
              setValue('tradeNameType', 'one');
            }
            
            if (branchData.issued_capital) {
              setValue('issuedCapital', branchData.issued_capital);
            }
            
            if (branchData.country_of_incorporation) {
              setValue('countryOfIncorporation', branchData.country_of_incorporation);
            }
            
            if (branchData.is_eea !== undefined) {
              setValue('eeaCompany', branchData.is_eea ? 'yes' : 'no');
            }
            
            if (branchData.vat_number) {
              setValue('taxNumber', branchData.vat_number);
              setValue('knownToTax', 'yes');
            }
            
            // Branch-specific data
            if (branchData.branch_starting_date) {
              setValue('startingDate', branchData.branch_starting_date);
            }
            
            if (branchData.branch_address) {
              setValue('companyAddress', branchData.branch_address);
            }
            
            // Contact details from branch_registration_data
            if (branchData.branch_phone) {
              setValue('telephone1', branchData.branch_phone);
            }
            
            if (branchData.branch_email) {
              setValue('email', branchData.branch_email);
            }
            
            if (branchData.branch_website) {
              setValue('website', branchData.branch_website);
            }
            
            if (branchData.message_box_name) {
              setValue('messageBox', branchData.message_box_name);
            }
            
            // Employee information from branch_registration_data
            if (branchData.full_time_employees !== undefined && branchData.full_time_employees !== null) {
              setValue('fullTimeEmployees', branchData.full_time_employees);
            }
            
            if (branchData.part_time_employees !== undefined && branchData.part_time_employees !== null) {
              setValue('partTimeEmployees', branchData.part_time_employees);
            }
            
            // Set company type based on data
            if (branchData.company_name && branchData.reg_number) {
              setValue('companyType', 'continuation');
            } else {
              setValue('companyType', 'new');
            }
            
            setDataLoaded(true);
          }

          // Fallback: Fetch from other tables if branch_registration_data is empty
          if (!branchData) {
            console.log('No branch registration data found, fetching from other tables...');
            
            // Fetch company information
            const { data: companyData, error: companyError } = await supabase
              .from('company_information')
              .select('incorporation_date')
              .eq('user_id', user.id)
              .single();

            if (companyError && companyError.code !== 'PGRST116') {
              console.error('Error fetching company data:', companyError);
            }

            if (companyData && companyData.incorporation_date) {
              setValue('startingDate', companyData.incorporation_date);
            }

            // Fetch user email from user_profiles
            const { data: userData, error: userError } = await supabase
              .from('user_profiles')
              .select('email')
              .eq('user_id', user.id)
              .single();

            if (userError) {
              console.error('Error fetching user email:', userError);
            }

            if (userData && userData.email) {
              setValue('email', userData.email);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [setValue]);

  const companyType = watch("companyType");
  
 

  // Use local PDF file path instead of Google Drive
  const pdfUrl = process.env.PUBLIC_URL + '/assets/kvk-form.pdf';
  
  // Get PDF directly
  const getDirectPdf = async () => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to load PDF template');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error getting direct PDF:", error);
      setError("Error loading PDF template. Please try again.");
      return null;
    }
  };
  
  const onSubmit = async (data) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Starting PDF generation with data:', data);
      
      // Download the PDF template
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to load PDF template');
      }
      const pdfBytes = await response.arrayBuffer();
      
      // Load and modify the PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Get all pages from the PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const secondPage = pages[1];
      const thirdPage = pages[2];
      const fourthPage = pages[3]; // Get the fourth page
      
      // Define the positions for text (x,y coordinates)
      const firstPagePositions = {
        // New company fields
        newCompanyCheckbox: { x: 150, y: 464 },
        startingDate: { x: 363, y: 464 },
        continuationCheckbox: { x: 150, y: 418 },
        companyName: { x: 360, y: 415 },
        registeredOffice: { x: 363, y: 370 },
        chamberNumber: { x: 363, y: 347 },
        continuationDate: { x: 363, y: 290 },
        originalStartingDate: { x: 363, y: 315 },
        tradeNameOneCheckbox: { x: 150, y: 195},
        tradeNameSeveralCheckbox: {x: 150, y: 150},
        singleTradeName: { x: 363, y: 190},
        multipleTradeName: { x: 363, y: 150}
      };

      const secondPagePositions = {
        // Company details positions for page 2
        companyActivities: { x: 160, y: 740 },
        mostImportantActivity: { x: 360, y: 640 },
        
        // Retail trade positions
        retailTradeNo: { x: 150, y: 590 },
        retailTradeYes: { x: 160, y: 580 },
        shopKiosk: { x: 345, y: 573 },
        market: { x: 345, y: 565 },
        streetTrading: { x: 345, y: 556 },
        online: { x: 345, y: 547 },
        fromHome: { x: 345, y: 540 },
        mailOrder: { x: 345, y: 530},
        otherRetail: { x: 345, y: 520 },
        otherRetailText: { x: 345, y: 510 },
        
        // Wholesale, import, export positions
        wholesaleNo: { x: 345, y: 483},
        wholesaleYes: { x: 345, y: 473},
        importNo: { x: 345, y: 455 },
        importYes: {x: 345, y: 445 },
        exportNo: { x: 345, y: 427},
        exportYes: { x: 345, y: 417},

        // New positions for address and contact details
        companyAddress: { x: 360, y: 380 },
        postalAddressNo: { x: 150, y: 347 },
        postalAddressYes: { x: 158, y: 337 },
        poBoxAddress: { x: 360, y: 320 },
        
        // Contact details
        telephone1: { x: 345, y: 255 },
        telephone2: { x: 345, y: 225 },
        faxNumber: { x: 350, y: 197 },
        website: { x: 350, y: 169 },
        email: { x: 350, y: 143 },
        messageBox: { x: 350, y: 120},
        
        // Employee counts
        fullTimeEmployees: { x: 360, y: 75},
        partTimeEmployees: { x: 360, y: 43}
      };

      const thirdPagePositions = {
        // Legal form checkboxes
        britishLtdCheckbox: { x: 345, y: 780 },
        germanGmbhCheckbox: { x: 345, y: 770 },
        belgianBvbaCheckbox: { x: 345, y: 760 },
        frenchSarlCheckbox: { x: 345, y: 752 },
        antilleanNvCheckbox: { x: 345, y: 742 },
        otherCompanyCheckbox: { x: 345, y: 734 },
        otherCompanyText: { x: 345, y: 722 },

        // Company details
        companyName: { x: 347, y: 680 },
        
        // Tax authority details
        taxAuthorityNo: { x: 150, y: 645 },
        taxAuthorityYes: { x: 159, y: 635 },
        taxNumber: { x: 360, y: 633 },
        
        // Registration details
        foreignRegistrationNumber: { x: 360, y: 605 },
        registerName: { x: 360, y: 560 },
        registeringInstitution: { x: 360, y: 520 },
        registrationLocation: { x: 360, y: 480 },
        
        // Foreign registration
        foreignRegNo: { x: 150, y: 420 },
        foreignRegYes: { x: 160, y: 410 },
        registrationDate: { x: 360, y: 405 },
        originalRegistrationDate: { x: 360, y: 380 },
        
        // EEA company details
        eeaCompanyYes: { x: 150, y: 350 },
        eeaCompanyNo: { x: 160, y: 340 },
        
        // Business location
        foreignBusinessNo: { x: 180, y: 320 },
        foreignBusinessYes: { x: 188, y: 312 },
        foreignAddress: { x: 360, y: 280 },
        
        // Additional details
        countryOfIncorporation: { x: 360, y: 235 },
        registeredOffice: { x: 360, y: 210 },
        issuedCapital: { x: 360, y: 180 },

        // Section 4 - Signature
        signatureName: { x: 360, y: 105 },
        signatureDate: { x: 360, y: 80 },
        signatureField: { x: 360, y: 65 }
      };

      const fourthPagePositions = {
        // Section 5 - Non-Mailing-Indicator
        nonMailingCheckbox: { x: 150, y: 760 },

        // Section 6 - Information under the Act Waadi
        waadiNo: { x: 420, y: 663 },
        waadiYes: { x: 420, y: 653 },

        // Section 7 - Other forms
        // 7.1 Registration of partners/directors
        partnersRegisteredNo: { x: 160, y: 580 },
        partnersRegisteredYes: { x: 150, y: 592},

        // 7.2 Supervisory board members
        supervisoryBoardNo: { x: 150, y: 547 },
        supervisoryBoardYes: { x: 160, y: 537 },

        // 7.3 Multiple branches
        multipleBranchesNo: { x: 150, y: 493 },
        multipleBranchesYes: { x: 160, y: 483 },

        // 7.4 Administrator
        administratorNo: { x: 150, y: 439},
        administratorYes: { x: 160, y: 429 },

        // 7.5 Power of attorney
        powerOfAttorneyNo: { x: 150, y: 373},
        powerOfAttorneyYes: { x: 160, y: 363 }
      };
      
      // Draw text directly on the first page
      // Draw an "X" mark for the selected checkbox
      const checkboxFont = await pdfDoc.embedFont('Helvetica-Bold');
      
      if (data.companyType === "new") {
        // Mark "new company" checkbox
        firstPage.drawText("X", {
          x: firstPagePositions.newCompanyCheckbox.x,
          y: firstPagePositions.newCompanyCheckbox.y,
          size: 8,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
        
        // Add starting date
        if (data.startingDate) {
          firstPage.drawText(data.startingDate, {
            x: firstPagePositions.startingDate.x,
            y: firstPagePositions.startingDate.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      } else {
        // Mark "continuation" checkbox
        firstPage.drawText("X", {
          x: firstPagePositions.continuationCheckbox.x,
          y: firstPagePositions.continuationCheckbox.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
        
        // Add company name
        if (data.companyName) {
          firstPage.drawText(data.companyName, {
            x: firstPagePositions.companyName.x,
            y: firstPagePositions.companyName.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
        
        // Add registered office
        if (data.registeredOffice) {
          firstPage.drawText(data.registeredOffice, {
            x: firstPagePositions.registeredOffice.x,
            y: firstPagePositions.registeredOffice.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
        
        // Add chamber number
        if (data.chamberNumber) {
          firstPage.drawText(data.chamberNumber, {
            x: firstPagePositions.chamberNumber.x,
            y: firstPagePositions.chamberNumber.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
        
        // Add continuation date
        if (data.continuationDate) {
          firstPage.drawText(data.continuationDate, {
            x: firstPagePositions.continuationDate.x,
            y: firstPagePositions.continuationDate.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
        
        // Add original starting date
        if (data.originalStartingDate) {
          firstPage.drawText(data.originalStartingDate, {
            x: firstPagePositions.originalStartingDate.x,
            y: firstPagePositions.originalStartingDate.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // After handling company type fields, add trade name handling
      if (data.tradeNameType === "one") {
        // Mark "one name" checkbox
        firstPage.drawText("X", {
          x: firstPagePositions.tradeNameOneCheckbox.x,
          y: firstPagePositions.tradeNameOneCheckbox.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
        
        // Add single trade name
        if (data.singleTradeName) {
          firstPage.drawText(data.singleTradeName, {
            x: firstPagePositions.singleTradeName.x,
            y: firstPagePositions.singleTradeName.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      } else if (data.tradeNameType === "several") {
        // Mark "several names" checkbox
        firstPage.drawText("X", {
          x: firstPagePositions.tradeNameSeveralCheckbox.x,
          y: firstPagePositions.tradeNameSeveralCheckbox.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
        
        // Add multiple trade names
        if (data.multipleTradeName) {
          firstPage.drawText(data.multipleTradeName, {
            x: firstPagePositions.multipleTradeName.x,
            y: firstPagePositions.multipleTradeName.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // Fill company activities on second page
      if (data.companyActivities) {
        secondPage.drawText(data.companyActivities, {
          x: secondPagePositions.companyActivities.x,
          y: secondPagePositions.companyActivities.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.mostImportantActivity) {
        secondPage.drawText(data.mostImportantActivity, {
          x: secondPagePositions.mostImportantActivity.x,
          y: secondPagePositions.mostImportantActivity.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Handle retail trade on second page
      if (data.retailTrade === "no") {
        secondPage.drawText("X", {
          x: secondPagePositions.retailTradeNo.x,
          y: secondPagePositions.retailTradeNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.retailTrade === "yes") {
        secondPage.drawText("X", {
          x: secondPagePositions.retailTradeYes.x,
          y: secondPagePositions.retailTradeYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        // Draw retail checkboxes
        if (data.retailShopKiosk) {
          secondPage.drawText("X", {
            x: secondPagePositions.shopKiosk.x,
            y: secondPagePositions.shopKiosk.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        }
        // Add similar blocks for other retail options
        if (data.retailMarket) {
          secondPage.drawText("X", {
            x: secondPagePositions.market.x,
            y: secondPagePositions.market.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        }
        if (data.retailStreetTrading) {
          secondPage.drawText("X", {
            x: secondPagePositions.streetTrading.x,
            y: secondPagePositions.streetTrading.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        }
        if (data.retailOnline) {
          secondPage.drawText("X", {
            x: secondPagePositions.online.x,
            y: secondPagePositions.online.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        }
        if (data.retailFromHome) {
          secondPage.drawText("X", {
            x: secondPagePositions.fromHome.x,
            y: secondPagePositions.fromHome.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        }
        if (data.retailMailOrder) {
          secondPage.drawText("X", {
            x: secondPagePositions.mailOrder.x,
            y: secondPagePositions.mailOrder.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        }
        if (data.retailOther && data.retailOtherText) {
          secondPage.drawText("X", {
            x: secondPagePositions.otherRetail.x,
            y: secondPagePositions.otherRetail.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
          secondPage.drawText(data.retailOtherText, {
            x: secondPagePositions.otherRetailText.x,
            y: secondPagePositions.otherRetailText.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Handle wholesale on second page
      if (data.wholesale === "no") {
        secondPage.drawText("X", {
          x: secondPagePositions.wholesaleNo.x,
          y: secondPagePositions.wholesaleNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.wholesale === "yes") {
        secondPage.drawText("X", {
          x: secondPagePositions.wholesaleYes.x,
          y: secondPagePositions.wholesaleYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Handle import on second page
      if (data.import === "no") {
        secondPage.drawText("X", {
          x: secondPagePositions.importNo.x,
          y: secondPagePositions.importNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.import === "yes") {
        secondPage.drawText("X", {
          x: secondPagePositions.importYes.x,
          y: secondPagePositions.importYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Handle export on second page
      if (data.export === "no") {
        secondPage.drawText("X", {
          x: secondPagePositions.exportNo.x,
          y: secondPagePositions.exportNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.export === "yes") {
        secondPage.drawText("X", {
          x: secondPagePositions.exportYes.x,
          y: secondPagePositions.exportYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Fill address and contact details
      if (data.companyAddress) {
        secondPage.drawText(data.companyAddress, {
          x: secondPagePositions.companyAddress.x,
          y: secondPagePositions.companyAddress.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Handle postal address
      if (data.hasPostalAddress === "no") {
        secondPage.drawText("X", {
          x: secondPagePositions.postalAddressNo.x,
          y: secondPagePositions.postalAddressNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.hasPostalAddress === "yes") {
        secondPage.drawText("X", {
          x: secondPagePositions.postalAddressYes.x,
          y: secondPagePositions.postalAddressYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.poBoxAddress) {
          secondPage.drawText(data.poBoxAddress, {
            x: secondPagePositions.poBoxAddress.x,
            y: secondPagePositions.poBoxAddress.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Fill contact details
      if (data.telephone1) {
        secondPage.drawText(data.telephone1, {
          x: secondPagePositions.telephone1.x,
          y: secondPagePositions.telephone1.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.telephone2) {
        secondPage.drawText(data.telephone2, {
          x: secondPagePositions.telephone2.x,
          y: secondPagePositions.telephone2.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.faxNumber) {
        secondPage.drawText(data.faxNumber, {
          x: secondPagePositions.faxNumber.x,
          y: secondPagePositions.faxNumber.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.website) {
        secondPage.drawText(data.website, {
          x: secondPagePositions.website.x,
          y: secondPagePositions.website.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.email) {
        secondPage.drawText(data.email, {
          x: secondPagePositions.email.x,
          y: secondPagePositions.email.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.messageBox) {
        secondPage.drawText(data.messageBox, {
          x: secondPagePositions.messageBox.x,
          y: secondPagePositions.messageBox.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Fill employee counts
      if (data.fullTimeEmployees) {
        secondPage.drawText(data.fullTimeEmployees.toString(), {
          x: secondPagePositions.fullTimeEmployees.x,
          y: secondPagePositions.fullTimeEmployees.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.partTimeEmployees) {
        secondPage.drawText(data.partTimeEmployees.toString(), {
          x: secondPagePositions.partTimeEmployees.x,
          y: secondPagePositions.partTimeEmployees.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }
      
      // Fill third page fields
      // Legal form selection
      if (data.legalForm) {
        let checkboxX, checkboxY;
        
        switch(data.legalForm) {
          case 'britishLtd':
            checkboxX = thirdPagePositions.britishLtdCheckbox.x;
            checkboxY = thirdPagePositions.britishLtdCheckbox.y;
            break;
          case 'germanGmbh':
            checkboxX = thirdPagePositions.germanGmbhCheckbox.x;
            checkboxY = thirdPagePositions.germanGmbhCheckbox.y;
            break;
          case 'belgianBvba':
            checkboxX = thirdPagePositions.belgianBvbaCheckbox.x;
            checkboxY = thirdPagePositions.belgianBvbaCheckbox.y;
            break;
          case 'frenchSarl':
            checkboxX = thirdPagePositions.frenchSarlCheckbox.x;
            checkboxY = thirdPagePositions.frenchSarlCheckbox.y;
            break;
          case 'antilleanNv':
            checkboxX = thirdPagePositions.antilleanNvCheckbox.x;
            checkboxY = thirdPagePositions.antilleanNvCheckbox.y;
            break;
          case 'other':
            checkboxX = thirdPagePositions.otherCompanyCheckbox.x;
            checkboxY = thirdPagePositions.otherCompanyCheckbox.y;
            break;
        }

        // Draw the X mark for the selected legal form
        thirdPage.drawText("X", {
          x: checkboxX,
          y: checkboxY,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        // If "other" is selected, fill in the text
        if (data.legalForm === "other" && data.otherLegalFormText) {
          thirdPage.drawText(data.otherLegalFormText, {
            x: thirdPagePositions.otherCompanyText.x,
            y: thirdPagePositions.otherCompanyText.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Company name
      if (data.companyName) {
        thirdPage.drawText(data.companyName, {
          x: thirdPagePositions.companyName.x,
          y: thirdPagePositions.companyName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Tax authority status
      if (data.knownToTax === "no") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.taxAuthorityNo.x,
          y: thirdPagePositions.taxAuthorityNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.knownToTax === "yes") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.taxAuthorityYes.x,
          y: thirdPagePositions.taxAuthorityYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.taxNumber) {
          thirdPage.drawText(data.taxNumber, {
            x: thirdPagePositions.taxNumber.x,
            y: thirdPagePositions.taxNumber.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Foreign registration details
      if (data.foreignRegistrationNumber) {
        thirdPage.drawText(data.foreignRegistrationNumber, {
          x: thirdPagePositions.foreignRegistrationNumber.x,
          y: thirdPagePositions.foreignRegistrationNumber.y,
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

      if (data.registrationLocation) {
        thirdPage.drawText(data.registrationLocation, {
          x: thirdPagePositions.registrationLocation.x,
          y: thirdPagePositions.registrationLocation.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Formal registration status
      if (data.formallyRegistered === "no") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.foreignRegNo.x,
          y: thirdPagePositions.foreignRegNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.formallyRegistered === "yes") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.foreignRegYes.x,
          y: thirdPagePositions.foreignRegYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.registrationDate) {
          thirdPage.drawText(data.registrationDate, {
            x: thirdPagePositions.registrationDate.x,
            y: thirdPagePositions.registrationDate.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }

        if (data.originalRegistrationDate) {
          thirdPage.drawText(data.originalRegistrationDate, {
            x: thirdPagePositions.originalRegistrationDate.x,
            y: thirdPagePositions.originalRegistrationDate.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }

      // EEA company status
      if (data.eeaCompany === "yes") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.eeaCompanyYes.x,
          y: thirdPagePositions.eeaCompanyYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.eeaCompany === "no") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.eeaCompanyNo.x,
          y: thirdPagePositions.eeaCompanyNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        // Foreign business location
        if (data.foreignBusiness === "no") {
          thirdPage.drawText("X", {
            x: thirdPagePositions.foreignBusinessNo.x,
            y: thirdPagePositions.foreignBusinessNo.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });
        } else if (data.foreignBusiness === "yes") {
          thirdPage.drawText("X", {
            x: thirdPagePositions.foreignBusinessYes.x,
            y: thirdPagePositions.foreignBusinessYes.y,
            size: 12,
            font: checkboxFont,
            color: rgb(0, 0, 0)
          });

          if (data.foreignAddress) {
            thirdPage.drawText(data.foreignAddress, {
              x: thirdPagePositions.foreignAddress.x,
              y: thirdPagePositions.foreignAddress.y,
              size: 10,
              color: rgb(0, 0, 0)
            });
          }
        }
      }

      // Additional company details
      if (data.countryOfIncorporation) {
        thirdPage.drawText(data.countryOfIncorporation, {
          x: thirdPagePositions.countryOfIncorporation.x,
          y: thirdPagePositions.countryOfIncorporation.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.registeredOffice) {
        thirdPage.drawText(data.registeredOffice, {
          x: thirdPagePositions.registeredOffice.x,
          y: thirdPagePositions.registeredOffice.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.issuedCapital) {
        thirdPage.drawText(data.issuedCapital, {
          x: thirdPagePositions.issuedCapital.x,
          y: thirdPagePositions.issuedCapital.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 4 - Signature (on third page)
      if (data.signatureName) {
        thirdPage.drawText(data.signatureName, {
          x: thirdPagePositions.signatureName.x,
          y: thirdPagePositions.signatureName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.signatureDate) {
        thirdPage.drawText(data.signatureDate, {
          x: thirdPagePositions.signatureDate.x,
          y: thirdPagePositions.signatureDate.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      // Section 5 - Non-Mailing-Indicator (on fourth page)
      if (data.nonMailing) {
        fourthPage.drawText("X", {
          x: fourthPagePositions.nonMailingCheckbox.x,
          y: fourthPagePositions.nonMailingCheckbox.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Section 6 - Waadi (on fourth page)
      if (data.waadi === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.waadiNo.x,
          y: fourthPagePositions.waadiNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.waadi === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.waadiYes.x,
          y: fourthPagePositions.waadiYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Section 7 - Other forms (on fourth page)
      // 7.1 Partners/Directors registration
      if (data.partnersRegistered === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.partnersRegisteredNo.x,
          y: fourthPagePositions.partnersRegisteredNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.partnersRegistered === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.partnersRegisteredYes.x,
          y: fourthPagePositions.partnersRegisteredYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // 7.2 Supervisory board members
      if (data.supervisoryBoard === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.supervisoryBoardNo.x,
          y: fourthPagePositions.supervisoryBoardNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.supervisoryBoard === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.supervisoryBoardYes.x,
          y: fourthPagePositions.supervisoryBoardYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // 7.3 Multiple branches
      if (data.multipleBranches === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.multipleBranchesNo.x,
          y: fourthPagePositions.multipleBranchesNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.multipleBranches === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.multipleBranchesYes.x,
          y: fourthPagePositions.multipleBranchesYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // 7.4 Administrator
      if (data.administrator === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.administratorNo.x,
          y: fourthPagePositions.administratorNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.administrator === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.administratorYes.x,
          y: fourthPagePositions.administratorYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // 7.5 Power of attorney
      if (data.powerOfAttorney === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.powerOfAttorneyNo.x,
          y: fourthPagePositions.powerOfAttorneyNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.powerOfAttorney === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.powerOfAttorneyYes.x,
          y: fourthPagePositions.powerOfAttorneyYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Save the modified PDF
      console.log('Saving PDF...');
      const filledPdfBytes = await pdfDoc.save();
      
      // Create a blob for preview/download
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Store the form data and PDF bytes for later use when downloading
      setFormData({
        data,
        pdfBytes: filledPdfBytes
      });
      
      console.log('PDF generated and ready for preview/download');
      
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError("Error processing PDF: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRegeneratePdf = () => {
    // Clear the download URL to show the form again
    setDownloadUrl(null);
    // Keep the form data so user doesn't have to re-enter everything
    setIsProcessing(false);
    console.log('Regenerating PDF - form reset for editing');
  };

  const handleDownloadClick = () => {
    if (!downloadUrl || !formData) return;
    setShowConfirmPopup(true);
  };

  const cancelDownload = () => {
    console.log('Download cancelled by user');
    setShowConfirmPopup(false);
  };

  const handlePdfDownload = async () => {
    if (!formData) return;
    
    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create a unique filename
      const timestamp = new Date().toISOString();
      const fileName = `${user.id}/form-6-${Date.now()}.pdf`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('form-6')
        .upload(fileName, formData.pdfBytes, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Error uploading PDF: ${uploadError.message}`);
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('form_6_submissions')
        .insert({
          user_id: user.id,
          form_type: 'form_6',
          file_path: fileName,
          submission_date: timestamp,
          form_data: {
            company_name: formData.data.companyName,
            trade_name: formData.data.singleTradeName || formData.data.multipleTradeName,
            email: formData.data.email,
            registration_type: formData.data.companyType,
            starting_date: formData.data.startingDate,
            company_activities: formData.data.companyActivities,
            registered_office: formData.data.registeredOffice,
            contact_details: {
              telephone1: formData.data.telephone1,
              telephone2: formData.data.telephone2,
              website: formData.data.website,
              email: formData.data.email
            },
            address: formData.data.companyAddress,
            legal_form: formData.data.legalForm,
            employees: {
              full_time: formData.data.fullTimeEmployees,
              part_time: formData.data.partTimeEmployees
            }
          },
          status: 'completed'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Error saving form metadata: ${dbError.message}`);
      }

      // Trigger download in browser
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'KVK_Registration_Form.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Close the popup
      setShowConfirmPopup(false);
      
      console.log('PDF saved to Supabase and downloaded');
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setError("Error downloading PDF: " + error.message);
      setShowConfirmPopup(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="registration-form">
      <h1>KVK Company Registration</h1>
      
      {isLoadingData && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading your company data from branch registration...</p>
        </div>
      )}
      
      {dataLoaded && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>Form automatically populated with company info, contact details, and employee data from branch registration!</p>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="kvk-form">
        <div className="form-section company-type">
        <h2>Company Registration Type</h2>
        
          <div className="form-field radio-field">
            <label>
              <input 
                type="radio" 
                value="new" 
                {...register("companyType")} 
              />
              <span>A new company</span>
            </label>
          </div>
          
          <div className="form-field radio-field">
            <label>
              <input 
                type="radio" 
                value="continuation" 
                {...register("companyType")} 
              />
              <span>Continuation of an existing company</span>
            </label>
          </div>
        </div>
        
        {companyType === "new" && (
          <div className="form-field">
            <label>Official starting date of the company</label>
            <input {...register("startingDate")} placeholder="DD-MM-YYYY" />
          </div>
        )}
        
        {companyType === "continuation" && (
          <div className="form-section continuation-details">
            <div className="form-field">
              <label>The (previous) name of the company is</label>
              <input {...register("companyName", { required: true })} />
              {errors.companyName && <span className="error">This field is required</span>}
            </div>
            
            <div className="form-field">
              <label>The company has its registered office in</label>
              <input {...register("registeredOffice", { required: true })} />
              {errors.registeredOffice && <span className="error">This field is required</span>}
            </div>
            
            <div className="form-field">
              <label>The Chamber of Commerce number of the company is</label>
              <input {...register("chamberNumber", { required: true })} />
              {errors.chamberNumber && <span className="error">This field is required</span>}
            </div>
            
            <div className="form-field">
              <label>The continuation date of the company is</label>
              <input {...register("continuationDate")} placeholder="DD-MM-YYYY" />
            </div>
            
            <div className="form-field">
              <label>The original starting date of this company was</label>
              <input {...register("originalStartingDate")} placeholder="DD-MM-YYYY" />
            </div>
          </div>
        )}

        <div className="form-section trade-names">
          <h2>Details of the company/principal place of business in the Netherlands</h2>
          <div className="section-content">
        <h2>Will the company be operating in the Netherlands under one or several trade names?</h2>
            
            <div className="form-field radio-field">
              <label>
                <input 
                  type="radio" 
                  value="one" 
                  {...register("tradeNameType")} 
                />
                <span>One name</span>
              </label>
            </div>
            
            {watch("tradeNameType") === "one" && (
              <div className="form-field indent">
                <label>This trade name is</label>
                <input {...register("singleTradeName")} />
              </div>
            )}
            
            <div className="form-field radio-field">
              <label>
                <input 
                  type="radio" 
                  value="several" 
                  {...register("tradeNameType")} 
                />
                <span>Several names</span>
              </label>
            </div>
            
            {watch("tradeNameType") === "several" && (
              <div className="form-field indent">
                <label>These trade names are</label>
                <textarea {...register("multipleTradeName")} rows="3" />
              </div>
            )}
          </div>
        </div>
        
        <div className="form-section company-details">
          <h2>Company Activities and Business Details</h2>
          
          <div className="form-field">
            <label>Provide a short description of the company's actual activities, services and/or products</label>
            <textarea 
              {...register("companyActivities")} 
              rows="3" 
              placeholder="e.g., 'wholesaler in outer clothing' instead of 'clothing sales'"
            />
          </div>

          <div className="form-field">
            <label>If there are several business activities, services and/or products, indicate the most important one</label>
            <input {...register("mostImportantActivity")} />
          </div>

          <div className="form-field">
            <label>Does the company sell products to consumers? (retail trade)</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("retailTrade")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("retailTrade")} 
                />
                <span>Yes</span>
              </label>
            </div>

            {watch("retailTrade") === "yes" && (
              <div className="form-field indent">
                <label>These products are sold:</label>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" {...register("retailShopKiosk")} />
                    <span>in a shop or kiosk</span>
                  </label>
                  <label>
                    <input type="checkbox" {...register("retailMarket")} />
                    <span>at the market</span>
                  </label>
                  <label>
                    <input type="checkbox" {...register("retailStreetTrading")} />
                    <span>via street trading</span>
                  </label>
                  <label>
                    <input type="checkbox" {...register("retailOnline")} />
                    <span>online</span>
                  </label>
                  <label>
                    <input type="checkbox" {...register("retailFromHome")} />
                    <span>from home</span>
                  </label>
                  <label>
                    <input type="checkbox" {...register("retailMailOrder")} />
                    <span>through mail order</span>
                  </label>
                  <label>
                    <input type="checkbox" {...register("retailOther")} />
                    <span>otherwise, namely:</span>
                    <input 
                      type="text" 
                      {...register("retailOtherText")} 
                      className="inline-input"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Does the company sell products to other companies? (wholesale)</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("wholesale")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("wholesale")} 
                />
                <span>Yes</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>Does the company import products?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("import")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("import")} 
                />
                <span>Yes</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>Does the company export products?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("export")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("export")} 
                />
                <span>Yes</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-section address-details">
          <h2>Company Address and Contact Details</h2>
          
          <div className="form-field">
            <label>The address of the company in the Netherlands</label>
            <input 
              {...register("companyAddress")} 
              placeholder="Enter complete address"
            />
            <small>In the case of several branches: provide information for the principal place of business in the Netherlands</small>
          </div>

          <div className="form-field">
            <label>Does the company have a separate postal address?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("hasPostalAddress")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("hasPostalAddress")} 
                />
                <span>Yes</span>
              </label>
            </div>

            {watch("hasPostalAddress") === "yes" && (
              <div className="form-field indent">
                <label>The P.O. Box/mailing address is</label>
                <input {...register("poBoxAddress")} />
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Contact Information</label>
            <small>In the case of several branches: information for the principal place of business</small>
            
            <div className="contact-group">
              <div className="form-field">
                <label>Telephone number 1</label>
                <input {...register("telephone1")} defaultValue="0" />
              </div>
              
              <div className="form-field">
                <label>Telephone number 2</label>
                <input {...register("telephone2")} defaultValue="0" />
              </div>
              
              <div className="form-field">
                <label>Fax number</label>
                <input {...register("faxNumber")} defaultValue="0" />
              </div>
              
              <div className="form-field">
                <label>Internet address (www-address)</label>
                <input {...register("website")} />
              </div>
              
              <div className="form-field">
                <label>Email address</label>
                <input {...register("email")} type="email" />
              </div>
              
              <div className="form-field">
                <label>Message box name</label>
                <input {...register("messageBox")} />
                <small>By registering the Message Box name in the Commercial Register, the non-resident legal entity/company is known to be sufficiently accessible for receiving electronic messages of public authorities in the 'Message Box for businesses'.</small>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>How many persons work full-time (15 hours or more per week) in the company?</label>
            <div className="employee-count">
              <input 
                {...register("fullTimeEmployees")} 
                type="number" 
                min="0"
              />
              <span>persons</span>
            </div>
          </div>

          <div className="form-field">
            <label>How many persons work part-time (fewer than 15 hours per week) in the company?</label>
            <div className="employee-count">
              <input 
                {...register("partTimeEmployees")} 
                type="number" 
                min="0"
              />
              <span>persons</span>
            </div>
          </div>
        </div>
        
        <div className="form-section company-details">
          <h2>Details of the non-resident legal entity/company</h2>
          
          <div className="form-field">
            <label>What is the legal form of the company?</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  value="britishLtd" 
                  {...register("legalForm")} 
                />
                <span>British Private Limited Company</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="germanGmbh" 
                  {...register("legalForm")} 
                />
                <span>German GmbH</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="belgianBvba" 
                  {...register("legalForm")} 
                />
                <span>Belgian BVBA</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="frenchSarl" 
                  {...register("legalForm")} 
                />
                <span>French SARL</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="antilleanNv" 
                  {...register("legalForm")} 
                />
                <span>Antillean Public Limited Company (Naamloze Vennootschap)</span>
              </label>
              <label>
                <input 
                  type="radio" 
                  value="other" 
                  {...register("legalForm")} 
                />
                <span>Other, namely:</span>
                {watch("legalForm") === "other" && (
                  <input 
                    {...register("otherLegalFormText")} 
                    className="inline-input"
                  />
                )}
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>What is the name of the legal entity/company?</label>
            <input {...register("companyName")} />
          </div>

          <div className="form-field">
            <label>Is the legal entity/company already known to the Tax Authorities (Belastingdienst)?</label>
            <div className="radio-field">
              <label>
                <input type="radio" value="no" {...register("knownToTax")} />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input type="radio" value="yes" {...register("knownToTax")} />
                <span>Yes</span>
              </label>
            </div>
            {watch("knownToTax") === "yes" && (
              <div className="form-field indent">
                <label>Namely under the number</label>
                <input {...register("taxNumber")} />
              </div>
            )}
          </div>

          <div className="form-field">
            <label>What is the foreign registration number of the legal entity/company?</label>
            <input {...register("foreignRegistrationNumber")} />
          </div>

          <div className="form-field">
            <label>Name of the register</label>
            <input {...register("registerName")} />
          </div>

          <div className="form-field">
            <label>Name of the registering institution</label>
            <input {...register("registeringInstitution")} />
          </div>

          <div className="form-field">
            <label>Town/city and country of the registering institution</label>
            <input {...register("registrationLocation")} />
            <small>See notes for the documentation you are required to bring.</small>
          </div>

          <div className="form-field">
            <label>Is the company formally registered abroad?</label>
            <div className="radio-field">
              <label>
                <input type="radio" value="no" {...register("formallyRegistered")} />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input type="radio" value="yes" {...register("formallyRegistered")} />
                <span>Yes</span>
              </label>
            </div>
            {watch("formallyRegistered") === "yes" && (
              <div className="form-field indent">
                <div className="form-field">
                  <label>Since</label>
                  <input {...register("registrationDate")} placeholder="DD-MM-YYYY" />
                </div>
                <div className="form-field">
                  <label>Original registration date of the legal entity/company abroad</label>
                  <input {...register("originalRegistrationDate")} placeholder="DD-MM-YYYY" />
                </div>
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Are you registering a foreign EEA company with divided share capital?</label>
            <div className="radio-field">
              <label>
                <input type="radio" value="yes" {...register("eeaCompany")} />
                <span>Yes</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input type="radio" value="no" {...register("eeaCompany")} />
                <span>No</span>
              </label>
            </div>
          </div>

          {watch("eeaCompany") === "no" && (
            <div className="form-field">
              <label>Is the company's principal place of business located abroad?</label>
              <div className="radio-field">
                <label>
                  <input type="radio" value="no" {...register("foreignBusiness")} />
                  <span>No</span>
                </label>
              </div>
              <div className="radio-field">
                <label>
                  <input type="radio" value="yes" {...register("foreignBusiness")} />
                  <span>Yes</span>
                </label>
              </div>
              {watch("foreignBusiness") === "yes" && (
                <div className="form-field indent">
                  <label>The foreign address is</label>
                  <input {...register("foreignAddress")} />
                </div>
              )}
            </div>
          )}

          <div className="form-field">
            <label>The country or state where the legal entity/company was incorporated is</label>
            <input {...register("countryOfIncorporation")} />
          </div>

          <div className="form-field">
            <label>The registered office is in</label>
            <input {...register("registeredOffice")} />
          </div>

          <div className="form-field">
            <label>The issued capital amounts to</label>
            <input {...register("issuedCapital")} />
            <small>See notes</small>
          </div>
        </div>

        {/* Section 4 - Signature */}
        <div className="form-section signature">
          <h2>4. Signature</h2>
          <div className="form-field">
            <label>The undersigned declares that this form has been completed truthfully</label>
            <div className="signature-fields">
              <div className="form-field">
                <label>Surname and initial(s)</label>
                <input {...register("signatureName")} />
              </div>
              <div className="form-field">
                <label>Date</label>
                <input {...register("signatureDate")} placeholder="DD-MM-YYYY" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 - Non-Mailing-Indicator */}
        <div className="form-section non-mailing">
          <h2>5. Non-Mailing-Indicator</h2>
          <div className="form-field">
            <label>
              <input 
                type="checkbox" 
                {...register("nonMailing")} 
              />
              <span>Our business/organisation does not wish to receive unsolicited advertising by mail or door-to-door sales at the registered address.</span>
            </label>
          </div>
        </div>

        {/* Section 6 - Information under the Act Waadi */}
        <div className="form-section waadi">
          <h2>6. Information under the Act Waadi</h2>
          <div className="form-field">
            <label>Does the company/legal person make manpower available in the sense of the Act Waadi? (non-business)</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("waadi")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("waadi")} 
                />
                <span>Yes</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 7 - Other forms to be completed */}
        <div className="form-section other-forms">
          <h2>7. Other forms to be completed</h2>
          
          {/* 7.1 Partners/Directors registration */}
          <div className="form-field">
            <label>Have you registered all partners/directors using the correct registration form? (form Nos. 10/11 respectively)</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("partnersRegistered")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("partnersRegistered")} 
                />
                <span>Yes</span>
              </label>
            </div>
            <small>If you have not received the necessary form(s), you can download them from KVK.nl or request them from the Chamber of Commerce.</small>
          </div>

          {/* 7.2 Supervisory board */}
          <div className="form-field">
            <label>Does the legal entity have supervisory board members?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("supervisoryBoard")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("supervisoryBoard")} 
                />
                <span>Yes</span>
              </label>
            </div>
            {watch("supervisoryBoard") === "yes" && (
              <small>Register each supervisory board member using the 'Registration of a legal entity official' form (No. 11).</small>
            )}
          </div>

          {/* 7.3 Multiple branches */}
          <div className="form-field">
            <label>Does the company of the legal entity have more than one branch in the Netherlands?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("multipleBranches")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("multipleBranches")} 
                />
                <span>Yes</span>
              </label>
            </div>
            {watch("multipleBranches") === "yes" && (
              <small>Register each branch using the 'Registration of a company branch' form (No. 9).</small>
            )}
          </div>

          {/* 7.4 Administrator */}
          <div className="form-field">
            <label>Does the company have an administrator in the Netherlands?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("administrator")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("administrator")} 
                />
                <span>Yes</span>
              </label>
            </div>
            {watch("administrator") === "yes" && (
              <small>Register the administrator using the 'Registration of authorised persons' form (No. 13).</small>
            )}
          </div>

          {/* 7.5 Power of attorney */}
          <div className="form-field">
            <label>Have any other persons been granted power of attorney by the legal entity or company?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("powerOfAttorney")} 
                />
                <span>No</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("powerOfAttorney")} 
                />
                <span>Yes</span>
              </label>
            </div>
            {watch("powerOfAttorney") === "yes" && (
              <small>If desired, register these persons using the 'Registration of authorised persons' form (No. 13).</small>
            )}
          </div>
        </div>
        
        <div className="note-box">
          <p><strong>Note:</strong> This form will generate a PDF with your information overlaid on top of the official KVK form. 
          The form is non-editable after generation. For an official submission, please print, sign, and submit it to KVK.</p>
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
                  <p>You can download, preview, or regenerate your completed form below.</p>
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
                  
                  <button 
                    onClick={handleRegeneratePdf}
                    className="regenerate-button"
                    disabled={isProcessing}
                    style={{ backgroundColor: '#2196f3', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none' }}
                  >
                    Regenerate PDF
                  </button>
                </div>
              </div>
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

export default KVKRegistrationForm;
