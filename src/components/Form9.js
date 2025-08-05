// src/components/KVKRegistrationForm.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDocument, rgb } from 'pdf-lib';
import axios from 'axios';
import './Form9.css'; // Import the CSS file
import { supabase } from './SupabaseClient';

function Form9() {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const isRegistered = watch("isRegistered");
  const branchType = watch("branchType");
  
  const pdfUrl = process.env.PUBLIC_URL + '/assets/kvk-form1.pdf';

  // Fetch data from branch_registration_data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: branchData, error: branchError } = await supabase
            .from('branch_registration_data')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (branchData) {
            // Company information
            if (branchData.company_name) {
              setValue('companyName', branchData.company_name);
            }
            
            if (branchData.principal_place_of_business) {
              setValue('principalPlaceOfBusiness', branchData.principal_place_of_business);
            }
            
            if (branchData.reg_number) {
              setValue('registrationNumber', branchData.reg_number);
              setValue('isRegistered', 'yes');
            }
            
            // Branch information
            if (branchData.branch_starting_date) {
              setValue('startingDate', branchData.branch_starting_date);
            }
            
            if (branchData.is_continuation_of_existing_branch) {
              setValue('branchType', 'continuation');
              if (branchData.company_name) {
                setValue('previousBranchName', branchData.company_name);
              }
              if (branchData.registered_office) {
                setValue('registeredOffice', branchData.registered_office);
              }
              if (branchData.reg_number) {
                setValue('chamberNumber', branchData.reg_number);
              }
              if (branchData.branch_starting_date) {
                setValue('continuationDate', branchData.branch_starting_date);
                setValue('originalStartingDate', branchData.branch_starting_date);
              }
            } else {
              setValue('branchType', 'new');
            }
            
            // Business activities
            if (branchData.activities_description) {
              setValue('businessDescription', branchData.activities_description);
            }
            
            if (branchData.main_activity) {
              setValue('mostImportantActivity', branchData.main_activity);
            }
            
            if (branchData.trade_names) {
              setValue('singleTradeName', branchData.trade_names);
              setValue('tradeNameType', 'one');
            }
            
            // Branch address
            if (branchData.branch_address) {
              setValue('branchAddress', branchData.branch_address);
            }
            
            // Contact details
            if (branchData.branch_phone) {
              setValue('telephone1', branchData.branch_phone);
            }
            
            if (branchData.branch_email) {
              setValue('email', branchData.branch_email);
            }
            
            if (branchData.branch_website) {
              setValue('website', branchData.branch_website);
            }
            
            // Employee information
            if (branchData.full_time_employees !== undefined && branchData.full_time_employees !== null) {
              setValue('fullTimeEmployees', branchData.full_time_employees);
            }
            
            if (branchData.part_time_employees !== undefined && branchData.part_time_employees !== null) {
              setValue('partTimeEmployees', branchData.part_time_employees);
            }
            
            setDataLoaded(true);
          } else {
            // Fallback to other tables if no branch data
            const { data: companyData, error: companyError } = await supabase
              .from('company_info')
              .select('*')
              .eq('user_id', user.id)
              .single();

            const { data: userData, error: userError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (companyData) {
              if (companyData.company_name) {
                setValue('companyName', companyData.company_name);
              }
              if (companyData.business_activity) {
                setValue('businessDescription', companyData.business_activity);
                setValue('mostImportantActivity', companyData.business_activity);
              }
              if (companyData.reg_number) {
                setValue('registrationNumber', companyData.reg_number);
                setValue('isRegistered', 'yes');
              }
            }

            if (userData) {
              if (userData.address) {
                setValue('principalPlaceOfBusiness', userData.address);
                setValue('branchAddress', userData.address);
              }
              if (userData.phone) {
                setValue('telephone1', userData.phone);
              }
              if (userData.email) {
                setValue('email', userData.email);
              }
            }
            
            setDataLoaded(true);
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
  
  const onSubmit = async (data) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Store form data for later use when downloading
      setFormData(data);

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
      
      const firstPagePositions = {
        // Section 1 - Company details
        companyName: { x: 360, y: 470 },
        principalPlaceOfBusiness: { x: 360, y: 425 },
        registeredNo: { x: 150, y: 385 },
        registeredYes: { x: 158, y: 375 },
        registrationNumber: { x: 360, y: 375 },
        
        // Section 2 - New branch or continuation
        newBranchCheckbox: { x: 150, y: 285 },
        startingDate: { x: 360, y: 285 },
        continuationCheckbox: { x: 150, y: 240 },
        previousBranchName: { x: 360, y: 200 },
        registeredOffice: { x: 360, y: 178},
        chamberNumber: { x: 360, y: 148},
        continuationDate: { x: 360, y:120 },
        originalStartingDate: { x: 360, y: 90 }
      };
      const secondPagePositions = {
        // Section 3.1 - Principal place of business
        principalYes: { x: 345, y: 780 },
        principalNo: { x: 345, y: 770 },
        
        // Section 3.2 - Trade names
        oneNameCheckbox: { x: 150, y: 745 },
        severalNamesCheckbox: { x: 150, y: 708 },
        singleTradeName: { x: 360, y: 745 },
        multipleTradeNames: { x: 360, y: 708 },
        
        // Section 3.3 - Business description
        businessDescription: { x: 160, y: 600},
        
        // Section 3.4 - Most important activity
        mostImportantActivity: { x: 360, y: 515},
        
        // Section 3.5 - Retail trade
        retailNo: { x: 150, y: 465},
        retailYes: { x: 160, y: 455 },
        retailShopKiosk: { x: 345, y: 445 },
        retailFromHome: { x: 345, y: 435 },
        retailMailOrder: { x: 345, y: 425 },
        retailOtherwise: { x: 345, y: 418  },
        retailOtherwiseText: { x: 360, y: 405 },
        
        // Section 3.6 - Wholesale
        wholesaleNo: { x: 345, y: 385 },
        wholesaleYes: { x: 345, y: 375 },
        
        // Section 3.7 - Import
        importNo: { x: 345, y: 355 },
        importYes: { x: 345, y: 345},
        
        // Section 3.8 - Export
        exportNo: { x: 345, y: 330 },
        exportYes: { x: 345, y: 320 },
        
        // Section 3.9 - Branch address
        branchAddress: { x: 360, y: 300 },
        
        // Section 3.10 - P.O. Box
        poBoxNo: { x: 150, y: 230 },
        poBoxYes: { x: 160, y: 220 },
        poBoxAddress: { x: 360, y: 220 },
        
        // Section 3.11 - Contact details
        telephone1: { x: 360, y: 140 },
        telephone2: { x: 360, y: 113},
        faxNumber: { x: 360, y: 87 },
        website: { x: 360, y: 52},
        email: { x: 360, y: 25}
      };

      const thirdPagePositions = {
        // Section 3.12 - Employee counts
        fullTimeEmployees: { x: 360, y: 790 },
        partTimeEmployees: { x: 360, y: 760 },
        
        // Section 4 - Signature
        signatureName: { x: 360, y: 680 },
        signatureDate: { x: 360, y: 650 },
        signatureField: { x: 360, y: 500 },
        
        // Section 5 - Other forms
        authorizedPersonNo: { x: 150, y: 455 },
        authorizedPersonYes: { x: 160, y: 445 }
      };
      const checkboxFont = await pdfDoc.embedFont('Helvetica-Bold');
      
      // Section 1 - Company details
      if (data.companyName) {
        firstPage.drawText(data.companyName, {
          x: firstPagePositions.companyName.x,
          y: firstPagePositions.companyName.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (data.principalPlaceOfBusiness) {
        firstPage.drawText(data.principalPlaceOfBusiness, {
          x: firstPagePositions.principalPlaceOfBusiness.x,
          y: firstPagePositions.principalPlaceOfBusiness.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }
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
            // Section 2 - New branch or continuation
            if (data.branchType === "new") {
              firstPage.drawText("X", {
                x: firstPagePositions.newBranchCheckbox.x,
                y: firstPagePositions.newBranchCheckbox.y,
                size: 12,
                font: checkboxFont,
                color: rgb(0, 0, 0)
              });
              
              if (data.startingDate) {
                firstPage.drawText(data.startingDate, {
                  x: firstPagePositions.startingDate.x,
                  y: firstPagePositions.startingDate.y,
                  size: 10,
                  color: rgb(0, 0, 0)
                });
              }
            } else if (data.branchType === "continuation") {
              firstPage.drawText("X", {
                x: firstPagePositions.continuationCheckbox.x,
                y: firstPagePositions.continuationCheckbox.y,
                size: 12,
                font: checkboxFont,
                color: rgb(0, 0, 0)
              });
              
              if (data.previousBranchName) {
                firstPage.drawText(data.previousBranchName, {
                  x: firstPagePositions.previousBranchName.x,
                  y: firstPagePositions.previousBranchName.y,
                  size: 10,
                  color: rgb(0, 0, 0)
                });
              }
              
              if (data.registeredOffice) {
                firstPage.drawText(data.registeredOffice, {
                  x: firstPagePositions.registeredOffice.x,
                  y: firstPagePositions.registeredOffice.y,
                  size: 10,
                  color: rgb(0, 0, 0)
                });
              }
              
              if (data.chamberNumber) {
                firstPage.drawText(data.chamberNumber, {
                  x: firstPagePositions.chamberNumber.x,
                  y: firstPagePositions.chamberNumber.y,
                  size: 10,
                  color: rgb(0, 0, 0)
                });
              }
              
              if (data.continuationDate) {
                firstPage.drawText(data.continuationDate, {
                  x: firstPagePositions.continuationDate.x,
                  y: firstPagePositions.continuationDate.y,
                  size: 10,
                  color: rgb(0, 0, 0)
                });
              }
              
              if (data.originalStartingDate) {
                firstPage.drawText(data.originalStartingDate, {
                  x: firstPagePositions.originalStartingDate.x,
                  y: firstPagePositions.originalStartingDate.y,
                  size: 10,
                  color: rgb(0, 0, 0)
                });
              }
            }
                  // Section 3.1 - Principal place of business
      if (data.isPrincipal === "yes") {
        secondPage.drawText("X", {
          x: secondPagePositions.principalYes.x,
          y: secondPagePositions.principalYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.isPrincipal === "no") {
        secondPage.drawText("X", {
          x: secondPagePositions.principalNo.x,
          y: secondPagePositions.principalNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }

      // Section 3.2 - Trade names
      if (data.tradeNameType === "one") {
        secondPage.drawText("X", {
          x: secondPagePositions.oneNameCheckbox.x,
          y: secondPagePositions.oneNameCheckbox.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.singleTradeName) {
          secondPage.drawText(data.singleTradeName, {
            x: secondPagePositions.singleTradeName.x,
            y: secondPagePositions.singleTradeName.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      } else if (data.tradeNameType === "several") {
        secondPage.drawText("X", {
          x: secondPagePositions.severalNamesCheckbox.x,
          y: secondPagePositions.severalNamesCheckbox.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });

        if (data.multipleTradeNames) {
          secondPage.drawText(data.multipleTradeNames, {
            x: secondPagePositions.multipleTradeNames.x,
            y: secondPagePositions.multipleTradeNames.y,
            size: 10,
            color: rgb(0, 0, 0)
          });
        }
      }
            // Section 3.3 - Business description
            if (data.businessDescription) {
              secondPage.drawText(data.businessDescription, {
                x: secondPagePositions.businessDescription.x,
                y: secondPagePositions.businessDescription.y,
                size: 10,
                color: rgb(0, 0, 0)
              });
            }
      
            // Section 3.4 - Most important activity
            if (data.mostImportantActivity) {
              secondPage.drawText(data.mostImportantActivity, {
                x: secondPagePositions.mostImportantActivity.x,
                y: secondPagePositions.mostImportantActivity.y,
                size: 10,
                color: rgb(0, 0, 0)
              });
            }
      
            // Section 3.5 - Retail trade
            if (data.retail === "no") {
              secondPage.drawText("X", {
                x: secondPagePositions.retailNo.x,
                y: secondPagePositions.retailNo.y,
                size: 12,
                font: checkboxFont,
                color: rgb(0, 0, 0)
              });
            } else if (data.retail === "yes") {
              secondPage.drawText("X", {
                x: secondPagePositions.retailYes.x,
                y: secondPagePositions.retailYes.y,
                size: 12,
                font: checkboxFont,
                color: rgb(0, 0, 0)
              });
      
              if (data.retailShopKiosk) {
                secondPage.drawText("X", {
                  x: secondPagePositions.retailShopKiosk.x,
                  y: secondPagePositions.retailShopKiosk.y,
                  size: 12,
                  font: checkboxFont,
                  color: rgb(0, 0, 0)
                });
              }
      
              if (data.retailFromHome) {
                secondPage.drawText("X", {
                  x: secondPagePositions.retailFromHome.x,
                  y: secondPagePositions.retailFromHome.y,
                  size: 12,
                  font: checkboxFont,
                  color: rgb(0, 0, 0)
                });
              }
      
              if (data.retailMailOrder) {
                secondPage.drawText("X", {
                  x: secondPagePositions.retailMailOrder.x,
                  y: secondPagePositions.retailMailOrder.y,
                  size: 12,
                  font: checkboxFont,
                  color: rgb(0, 0, 0)
                });
              }
      
              if (data.retailOtherwise) {
                secondPage.drawText("X", {
                  x: secondPagePositions.retailOtherwise.x,
                  y: secondPagePositions.retailOtherwise.y,
                  size: 12,
                  font: checkboxFont,
                  color: rgb(0, 0, 0)
                });
      
                if (data.retailOtherwiseText) {
                  secondPage.drawText(data.retailOtherwiseText, {
                    x: secondPagePositions.retailOtherwiseText.x,
                    y: secondPagePositions.retailOtherwiseText.y,
                    size: 10,
                    color: rgb(0, 0, 0)
                  });
                }
              }
            }
                  // Section 3.6 - Wholesale
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

      // Section 3.7 - Import
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

      // Section 3.8 - Export
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

      // Section 3.9 - Branch address
      if (data.branchAddress) {
        secondPage.drawText(data.branchAddress, {
          x: secondPagePositions.branchAddress.x,
          y: secondPagePositions.branchAddress.y,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }
            // Section 3.10 - P.O. Box
            if (data.hasPoBox === "no") {
              secondPage.drawText("X", {
                x: secondPagePositions.poBoxNo.x,
                y: secondPagePositions.poBoxNo.y,
                size: 12,
                font: checkboxFont,
                color: rgb(0, 0, 0)
              });
            } else if (data.hasPoBox === "yes") {
              secondPage.drawText("X", {
                x: secondPagePositions.poBoxYes.x,
                y: secondPagePositions.poBoxYes.y,
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
      
            // Section 3.11 - Contact details
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
                  // Section 3.12 - Employee counts
      if (data.fullTimeEmployees) {
        console.log('Drawing full-time employees:', data.fullTimeEmployees);
        thirdPage.drawText(data.fullTimeEmployees.toString(), {
          x: thirdPagePositions.fullTimeEmployees.x,
          y: thirdPagePositions.fullTimeEmployees.y,
          size: 12,
          color: rgb(0, 0, 0)
        });
      }

      if (data.partTimeEmployees) {
        console.log('Drawing part-time employees:', data.partTimeEmployees);
        thirdPage.drawText(data.partTimeEmployees.toString(), {
          x: thirdPagePositions.partTimeEmployees.x,
          y: thirdPagePositions.partTimeEmployees.y,
          size: 12,
          color: rgb(0, 0, 0)
        });
      }

      // Section 4 - Signature
      if (data.signatureName) {
        console.log('Drawing signature name:', data.signatureName);
        thirdPage.drawText(data.signatureName, {
          x: thirdPagePositions.signatureName.x,
          y: thirdPagePositions.signatureName.y,
          size: 12,
          color: rgb(0, 0, 0)
        });
      }

      if (data.signatureDate) {
        console.log('Drawing signature date:', data.signatureDate);
        thirdPage.drawText(data.signatureDate, {
          x: thirdPagePositions.signatureDate.x,
          y: thirdPagePositions.signatureDate.y,
          size: 12,
          color: rgb(0, 0, 0)
        });
      }

      // Section 5 - Other forms
      if (data.hasAuthorizedPerson === "no") {
        console.log('Drawing authorized person no');
        thirdPage.drawText("X", {
          x: thirdPagePositions.authorizedPersonNo.x,
          y: thirdPagePositions.authorizedPersonNo.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.hasAuthorizedPerson === "yes") {
        console.log('Drawing authorized person yes');
        thirdPage.drawText("X", {
          x: thirdPagePositions.authorizedPersonYes.x,
          y: thirdPagePositions.authorizedPersonYes.y,
          size: 12,
          font: checkboxFont,
          color: rgb(0, 0, 0)
        });
      }
      const filledPdfBytes = await pdfDoc.save();

      
      // PDF generation code...
      // This is a placeholder for the actual PDF generation code
      
      // Create a URL for the PDF
      // Only create blob URL, don't save to Supabase yet
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

  const handleDownloadClick = () => {
    if (!downloadUrl || !formData) return;
    setShowConfirmPopup(true);
  };
  const handlePdfDownload = async () => {
    try {
      setIsProcessing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get PDF blob
      const pdfBlob = await (await fetch(downloadUrl)).blob();
      
      // Create a unique filename
      const timestamp = new Date().toISOString();
      const fileName = `${user.id}/form-9-${Date.now()}.pdf`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('form-9')
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
        .from('form_9_submissions')
        .insert({
          user_id: user.id,
          form_type: 'form_9',
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
      downloadLink.download = 'form-9.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Close confirmation popup
      setShowConfirmPopup(false);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(`Error downloading PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };


  const cancelDownload = () => {
    setShowConfirmPopup(false);
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
      <h1>Form-9 Branch Registration Form</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoadingData && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading your branch registration data...</p>
        </div>
      )}
      
      {dataLoaded && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>Form automatically populated with your branch registration data!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1 - Company details */}
        <div className="form-section">
          <h2>1. Company details</h2>
          
          <div className="form-field">
            <label>1.1 Details of the company registering a branch</label>
            <div className="sub-field">
              <label>legal name of the company</label>
              <input {...register("companyName")} />
              {errors.companyName && <span className="error">This field is required</span>}
            </div>
            
            <div className="sub-field">
              <label>principal place of business</label>
              <input {...register("principalPlaceOfBusiness")} />
              {errors.principalPlaceOfBusiness && <span className="error">This field is required</span>}
            </div>
          </div>
          
          <div className="form-field">
            <label>1.2 Is the company already registered in the Dutch Business Register?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("isRegistered")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("isRegistered")} 
                />
                <span>yes</span>
              </label>
            </div>
            
            {isRegistered === "yes" && (
              <div className="sub-field indent">
                <label>KVK number</label>
                <input {...register("registrationNumber")} />
              </div>
            )}
          </div>
        </div>

        {/* Section 2 - New branch or continuation */}
        <div className="form-section">
          <h2>2. New branch, or continuation of an existing branch</h2>
          
          <div className="form-field">
            <label>2.1 Does this registration concern a new branch, or the continuation of an existing branch?</label>
            
            <div className="radio-field">
            <label>
              <input 
                type="radio" 
                value="new" 
                  {...register("branchType")} 
              />
                <span>a new branch</span>
            </label>
              {branchType === "new" && (
                <div className="sub-field indent">
                  <label>official starting date of the branch</label>
                  <input {...register("startingDate")} placeholder="DD-MM-YYYY" />
                  <div className="note">
                    Go to question 3, Branch Details
                  </div>
                </div>
              )}
          </div>
          
            <div className="radio-field">
            <label>
              <input 
                type="radio" 
                value="continuation" 
                  {...register("branchType")} 
              />
                <span>continuation of an existing branch</span>
            </label>
              
              {branchType === "continuation" && (
                <div className="continuation-details indent">
                  <div className="sub-field">
                    <label>the (previous) name of the branch is</label>
                    <input {...register("previousBranchName")} />
                  </div>
                  
                  <div className="sub-field">
                    <label>the registered office of this branch is in</label>
                    <input {...register("registeredOffice")} />
                  </div>
                  
                  <div className="sub-field">
                    <label>the Chamber of Commerce number of the branch is</label>
                    <input {...register("chamberNumber")} />
                  </div>
                  
                  <div className="sub-field">
                    <label>the continuation date of the branch is</label>
                    <input {...register("continuationDate")} placeholder="DD-MM-YYYY" />
                  </div>
                  
                  <div className="sub-field">
                    <label>the original starting date of this branch was</label>
                    <input {...register("originalStartingDate")} placeholder="DD-MM-YYYY" />
                    <div className="note">
                      If this original date is not known to you, KVK will enter it for you.
                      The person from whom you are taking over must also register the continuation. He/she should contact the Chamber for this purpose.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Section 3 - Branch Details */}
        <div className="form-section">
          <h2>3. Branch Details</h2>
          
          {/* Section 3.1 - Principal place of business */}
          <div className="form-field">
            <label>3.1 Is this branch the principal place of business?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("isPrincipal")} 
                />
                <span>yes</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("isPrincipal")} 
                />
                <span>no</span>
              </label>
            </div>
          </div>

          {/* Section 3.2 - Trade names */}
          <div className="form-field">
            <label>3.2 Does the branch have one or several trade names?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="one" 
                  {...register("tradeNameType")} 
                />
                <span>one name</span>
              </label>
              {watch("tradeNameType") === "one" && (
                <div className="sub-field indent">
                  <label>this trade name is</label>
                  <input {...register("singleTradeName")} />
                </div>
              )}
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="several" 
                  {...register("tradeNameType")} 
                />
                <span>several names</span>
              </label>
              {watch("tradeNameType") === "several" && (
                <div className="sub-field indent">
                  <label>these trade names are</label>
                  <textarea {...register("multipleTradeNames")} rows="3" />
                </div>
              )}
            </div>
          </div>

          {/* Section 3.3 - Business description */}
          <div className="form-field">
            <label>3.3 Provide a short description of the actual business activities, services and/or products.</label>
            <div className="note">
              For example:
              <ul>
                <li>'wholesaler in outer clothing' instead of 'clothing sales'</li>
                <li>'management consultancy firm' instead of 'consultancy firm'</li>
              </ul>
            </div>
            <textarea {...register("businessDescription")} rows="4" />
          </div>

          {/* Section 3.4 - Most important activity */}
          <div className="form-field">
            <label>3.4 If there are several business activities, services and/or products, indicate the most important one</label>
            <input {...register("mostImportantActivity")} />
          </div>

          {/* Section 3.5 - Retail trade */}
          <div className="form-field">
            <label>3.5 Does the branch sell products to consumers? (retail trade)</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("retail")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("retail")} 
                />
                <span>yes</span>
              </label>
              {watch("retail") === "yes" && (
                <div className="sub-field indent">
                  <label>these products are sold</label>
                  <div className="checkbox-group">
                    <label>
                      <input type="checkbox" {...register("retailShopKiosk")} />
                      <span>in a shop or kiosk</span>
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
                      <input type="checkbox" {...register("retailOtherwise")} />
                      <span>otherwise, namely:</span>
                      {watch("retailOtherwise") && (
                        <input 
                          {...register("retailOtherwiseText")} 
                          className="inline-input"
                        />
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        
          {/* Section 3.6 - Wholesale */}
            <div className="form-field">
            <label>3.6 Does the branch sell products to other companies? (wholesale)</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("wholesale")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("wholesale")} 
                />
                <span>yes</span>
              </label>
            </div>
            </div>
            
          {/* Section 3.7 - Import */}
            <div className="form-field">
            <label>3.7 Does the branch import products?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("import")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("import")} 
                />
                <span>yes</span>
              </label>
            </div>
            </div>
            
          {/* Section 3.8 - Export */}
            <div className="form-field">
            <label>3.8 Does the branch export products?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("export")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("export")} 
                />
                <span>yes</span>
              </label>
            </div>
            </div>
            
          {/* Section 3.9 - Branch address */}
            <div className="form-field">
            <label>3.9 The address of this branch is</label>
            <textarea {...register("branchAddress")} rows="3" />
            <div className="note">
              Notes on 3.9: If the business address is not the same as the private address of one of the partners/board members, you must provide proof that you are allowed to use this address for your business, e.g. by submitting a copy of the lease or supporting documents from the land register.
            </div>
            </div>
            
          {/* Section 3.10 - P.O. Box */}
            <div className="form-field">
            <label>3.10 Does the branch have a separate P.O. Box or mailing address?</label>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("hasPoBox")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("hasPoBox")} 
                />
                <span>yes</span>
              </label>
              {watch("hasPoBox") === "yes" && (
                <div className="sub-field indent">
                  <label>the P.O. Box/mailing address is</label>
                  <textarea {...register("poBoxAddress")} rows="3" />
                  <div className="note">
                    Notes on 3.10: It is possible that mail for the branch will need to be sent to an address other than the address of the branch, e.g. to a P.O. Box, a private address, or to the address of the principal place of business. If this is the case, enter the relevant address here.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3.11 - Contact details */}
          <div className="form-field">
            <label>3.11 What is the telephone number, fax number (if applicable) and email address of the branch?</label>
            <div className="contact-details">
              <div className="sub-field">
                <label>telephone number 1</label>
                <input {...register("telephone1")} />
              </div>
              <div className="sub-field">
                <label>telephone number 2</label>
                <input {...register("telephone2")} />
              </div>
              <div className="sub-field">
                <label>fax number</label>
                <input {...register("faxNumber")} />
              </div>
              <div className="sub-field">
                <label>internet address (www-address)</label>
                <input {...register("website")} />
              </div>
              <div className="sub-field">
                <label>email address</label>
                <input {...register("email")} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 3.12 - Employee counts */}
        <div className="form-section">
          <h3>3.12 Number of employees</h3>
          <div className="note">
            In addition to those persons employed by the company, you should also count:
            <ul>
              <li>director(s) who work at the company</li>
              <li>hired workers and temporary workers</li>
              <li>family members also working at the company</li>
            </ul>
          </div>
          
          <div className="form-field">
            <label>How many persons work full-time (15 hours or more per week) at the branch?</label>
            <input 
              type="number" 
              {...register("fullTimeEmployees")} 
              min="0"
            />
          </div>

          <div className="form-field">
            <label>How many persons work part-time (fewer than 15 hours per week) at the branch?</label>
            <input 
              type="number" 
              {...register("partTimeEmployees")} 
              min="0"
            />
          </div>
        </div>

        {/* Section 4 - Signature */}
        <div className="form-section">
          <h2>4. Signature</h2>
          
          <div className="form-field">
            <label>4.1 The undersigned declares that this form has been completed truthfully.</label>
            <div className="note">
              This form may only be signed by:
              <ul>
                <li>the owner of a sole proprietorship</li>
                <li>one of the partners of a commercial/limited partnership (v.o.f./c.v.)</li>
                <li>one of the partners of a partnership</li>
                <li>a board member of a legal entity</li>
                <li>a civil-law notary</li>
              </ul>
              <p><strong>Proof of identity of the undersigned</strong></p>
              <p>The person signing this form must attach a copy of valid proof of identity.</p>
              <p>The following documents are accepted as proof of identity:</p>
              <ul>
                <li>passport</li>
                <li>Dutch driving licence</li>
                <li>European identity card</li>
                <li>alien's identity card</li>
              </ul>
            </div>

            <div className="signature-fields">
              <div className="sub-field">
                <label>surname and initial(s)</label>
                <input {...register("signatureName")} />
              </div>
              
              <div className="sub-field">
                <label>date</label>
                <input 
                  {...register("signatureDate")} 
                  placeholder="DD-MM-YYYY"
                />
              </div>

              <div className="sub-field">
                <label>signature</label>
                <div className="signature-box">
                  <span className="signature-x">x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 - Other forms */}
        <div className="form-section">
          <h2>5. Other forms to be completed</h2>
          
          <div className="form-field">
            <label>5.1 Has an authorised person been appointed for this branch?</label>
            <div className="note">
              Notes on 5.1:
              <p>The company can appoint an authorised representative, allowing that person to perform certain actions on behalf of the branch without having to request permission each time.</p>
            </div>
            
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="no" 
                  {...register("hasAuthorizedPerson")} 
                />
                <span>no</span>
              </label>
            </div>
            <div className="radio-field">
              <label>
                <input 
                  type="radio" 
                  value="yes" 
                  {...register("hasAuthorizedPerson")} 
                />
                <span>yes</span>
              </label>
              {watch("hasAuthorizedPerson") === "yes" && (
                <div className="note indent">
                  <p>See notes</p>
                  <ul>
                    <li>If desired, register these persons using the 'Registration of authorised persons' form (No. 13).</li>
                    <li>If you have not received the necessary form(s), you can download them from KVK.nl or request them from the Chamber of Commerce.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          {!downloadUrl ? (
            <button
              type="submit"
              className="generate-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Preparing PDF...' : 'Generate PDF'}
            </button>
          ) : (
            <>
              <div className="pdf-success-box">
                <div className="pdf-success-icon">✓</div>
                <div className="pdf-success-message">
                  <h3>Your PDF is ready!</h3>
                  <p>You can download or preview your completed form below.</p>
                  <p className="pdf-note">Note: The PDF will be saved to your account when you download it</p>
                </div>
                <div className="pdf-success-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
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

export default Form9;