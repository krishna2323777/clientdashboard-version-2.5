import { rgb } from 'pdf-lib';

/**
 * Maps form data to PDF fields for Form 11
 * @param {PDFDocument} pdfDoc - The PDF document to modify
 * @param {Object} data - The form data from the UI
 * @returns {PDFDocument} The modified PDF document
 */
export const mapFormDataToPdf = async (pdfDoc, data) => {
  try {
    // Get all pages from the PDF
    const pages = pdfDoc.getPages();
    console.log("Total PDF pages:", pages.length);
    const firstPage = pages[0];
    const secondPage = pages[1];
    const thirdPage = pages.length > 2 ? pages[2] : null;
    const fourthPage = pages.length > 3 ? pages[3] : null;
    const fifthPage = pages.length > 4 ? pages[4] : null;
    const sixthPage = pages.length > 5 ? pages[5] : null;
    const seventhPage = pages.length > 6 ? pages[6] : null;
    const eighthPage = pages.length > 7 ? pages[7] : null;
    const ninthPage = pages.length > 8 ? pages[8] : null;
    const tenthPage = pages.length > 9 ? pages[9] : null;
    const eleventhPage = pages.length > 10 ? pages[10] : null;
    const twelfthPage = pages.length > 11 ? pages[11] : null;
    
    console.log("Pages available:", {
      firstPage: !!firstPage,
      secondPage: !!secondPage,
      thirdPage: !!thirdPage,
      fourthPage: !!fourthPage,
      fifthPage: !!fifthPage,
      sixthPage: !!sixthPage,
      seventhPage: !!seventhPage,
      eighthPage: !!eighthPage,
      ninthPage: !!ninthPage,
      tenthPage: !!tenthPage,
      eleventhPage: !!eleventhPage,
      twelfthPage: !!twelfthPage
    });
    // At the start of mapFormDataToPdf:
console.log("PDF document info:", {
  pageCount: pages.length,
  page5Present: !!pages[4],
  page5Size: pages[4]?.getSize(),
  mediaBox: pages[4]?.getMediaBox()
});
// Inside the mapFormDataToPdf function:

console.log("Page availability check:", {
  fourthPage: !!fourthPage,
  fifthPage: !!fifthPage,
  section4MoreOfficials: data.section4MoreOfficials,
  section4MoreOfficialsType: data.section4MoreOfficialsType
});

    
    // Load fonts
    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
    
    // Define the positions for text (x,y coordinates)
    const firstPagePositions = {
      // Section 1 - Legal entity details
      section1legalEntityName: { x: 310, y: 255 },
      section1registeredOffice: { x: 310, y: 221 },
      section1registeredNo: { x: 305, y: 195 },
      section1registeredYes: { x: 305, y: 170 },
      section1kvkNumber: { x: 330, y: 150 }
    };
    
    const secondPagePositions = {
      // Section 2 - Legal personality
      section2naturalPersonCheckbox: { x: 305, y: 687 },
      section2legalEntityCheckbox: { x: 305, y: 663 },
      
      // Section 3 - Natural person details
      section3surname: { x: 310, y: 500 },
      section3givenNames: { x: 310, y: 460 },
      section3citizenServiceNumber: { x: 310, y: 425 },
      section3dateOfBirth: { x: 310, y: 390 },
      section3placeOfBirth: { x: 310, y: 353 },
      section3countryOfBirth: { x: 310, y: 316 },
      section3genderMale: { x: 306, y: 290 },
      section3genderFemale: { x: 306, y: 278 },
      section3privateAddress: { x: 310, y: 245 }
    };
    
    const thirdPagePositions = pages.length > 2 ? {
      // Section 4 - Position held by official
      section4supervisoryBoardMember: { x: 305, y: 470 },
      section4liquidator: { x: 305, y: 458 },
      section4soleShareholderOnly: { x: 305, y: 446 },
      section4director: { x: 305, y: 422 },
      section4directorWithBoardNo: { x: 322, y: 387 },
      section4directorWithBoardYes: { x: 322, y: 375 },
      section4executiveDirector: { x: 340, y: 362},
      section4nonExecutiveDirector: { x: 340, y: 350 },
      
      // Is this official the sole shareholder
      section4shareholderNo: { x: 305, y: 327 },
      section4shareholderYes: { x: 305, y: 315 },
      section4shareholderDate: { x: 330, y: 295 },
      
      // Statutory title
      section4statutoryTitleNo: { x: 305, y: 218 },
      section4statutoryTitleYes: { x: 305, y: 206 },
      section4statutoryTitle: { x: 330, y: 185 }
    } : {};
    
    const fourthPagePositions = pages.length > 3 ? {
      //section 4.4 Authority
      section4noAuthority: { x: 305, y: 710 },
      section4soleAuthority: { x: 305, y: 698 },
      section4jointAuthority: { x: 305, y: 687 },
      
      //section 4.5 Position start date
      section4positionStartDate: { x: 310, y: 660 },
      
      // section 4.6 More officials
      section4moreOfficialsNo: { x: 305, y: 627 },
      section4moreOfficialsYes: { x: 305, y: 603 },
      section4moreOfficialsNatural: { x: 322, y: 590 },
      section4moreOfficialsEntity: { x: 322, y: 573 },
      
      // Section 5 - Additional natural person
      section5Surname: { x: 310, y: 390 },
      section5GivenNames: { x: 310, y: 353 },
      section5BSN: { x: 310, y: 320 },
      section5DateOfBirth: { x: 310, y: 283 },
      section5PlaceOfBirth: { x: 310, y: 245 },
      section5CountryOfBirth: { x: 310, y: 212 },
      section5GenderMale: { x: 306, y: 183 },
      section5GenderFemale: { x: 306, y: 170 },
      section5PrivateAddress: { x: 310, y: 135 }
    } : {};
    
    const fifthPagePositions = pages.length > 4 ? {
      // Update coordinates based on actual PDF
      section6SupervisoryBoardMember: { x: 305, y: 459 }, // Adjust these coordinates
      section6Liquidator: { x: 305, y: 447 },
      section6SoleShareholderOnly: { x: 305, y: 435},
      section6Director: { x: 305, y: 411 },
      section6DirectorWithBoardNo: { x: 322, y: 374 },
      section6DirectorWithBoardYes: { x: 322, y: 362 },
      section6ExecutiveDirector: { x: 340, y: 351 },
      section6NonExecutiveDirector: { x: 340, y: 339 },

      section6ShareholderNo: { x: 305, y: 315 },
      section6ShareholderYes: { x: 305, y: 302 },
      section6ShareholderDate: { x: 330, y: 285 },

      section6StatutoryTitleNo: { x: 305, y: 207 },
      section6StatutoryTitleYes: { x: 305, y: 195 },
      section6StatutoryTitle: { x: 330, y: 175 }
    } : {};
    
    const sixthPagePositions = pages.length > 5 ? {
      // Additional authority
      section6NoAuthority: { x: 305, y: 710 },
      section6SoleAuthority: { x: 305, y: 698 },
      section6JointAuthority: { x: 305, y: 687 },
      
      // Additional position start date
      section6PositionStartDate: { x: 310, y: 660 },
      
      // Additional more officials - section 6.6
      section6MoreOfficialsNo: { x: 305, y: 627 },
      section6MoreOfficialsYes: { x: 305, y: 603 },
      section6MoreOfficialsNaturalPerson: { x: 322, y: 590 },
      section6MoreOfficialsEntity: { x: 322, y: 560 },
      
      // Section 7 - Partnership/Legal entity details
      section7EntityName: { x: 322, y: 460 },
      section7EntityAddress: { x: 322, y: 410 },
      section7EntityKvkNumber: { x: 322, y: 350 },
      
      // section 7.3 Registration details abroad
      section7ForeignRegNumber: { x: 322, y: 220 },
      section7RegisterName: { x: 322, y: 190 },
      section7RegisteringAuthority: { x: 322, y: 140 }
    }: {};
      

    const seventhPagePositions = pages.length > 6 ? {
      // Section 7.4 - Signature on behalf of partnership/legal entity
      section7SignatureName: { x: 322, y: 695 },
      
      // Section 8 - Position held by the official (for partnership/legal entity)
      section8PositionSupervisoryBoardMember: { x: 305, y: 446 },
      section8PositionLiquidator: { x: 305, y: 435 },
      section8PositionSoleShareholder: { x: 305, y: 423 },
      section8PositionDirector: { x: 305, y: 398 },
      section8PositionDirectorWithBoardNo: { x: 322, y: 363 },
      section8PositionDirectorWithBoardYes: { x: 322, y: 350 },
      section8PositionExecutiveDirector: { x: 340, y: 339 },
      section8PositionNonExecutiveDirector: { x: 340, y: 327 },
      
      // Is official also sole shareholder
      section8IsShareholderNo: { x: 305, y: 303 },
      section8IsShareholderYes: { x: 305, y: 290 },
      section8ShareholderDate: { x: 325, y: 270},
      
      // Statutory title
      section8HasStatutoryTitleNo: { x: 305, y: 195 },
      section8HasStatutoryTitleYes: { x: 305, y: 183 },
      section8StatutoryTitle: { x: 323, y: 165 }
    } : {};
    
    const eighthPagePositions = pages.length > 7 ? {
      // Section 8.4 - Authority
      section8AuthorityNone: { x: 305, y: 710 },
      section8AuthoritySole: { x: 305, y: 698 },
      section8AuthorityJoint: { x: 305, y: 687 },
      
      // 8.5 Position start date
      section8PositionStartDate: { x: 310, y: 660 },
      
      // More officials
      section8MoreOfficialsNo: { x: 305, y: 627 },
      section8MoreOfficialsYes: { x: 305, y: 603 },
      section8MoreOfficialsNaturalPerson: { x: 322, y: 590 },
      section8MoreOfficialsEntity: { x: 322, y: 560 },
      
      // Section 9 - Details for a partnership/legal entity
      section9EntityName: { x: 310, y: 455 },
      section9EntityAddress: { x: 310, y: 400 },
      section9EntityKvkNumber: { x: 310, y: 350 },
      
      // Registration details abroad
      section9ForeignRegNumber: { x: 310, y: 210 },
      section9RegisterName: { x: 310, y: 175 },
      section9RegisteringAuthority: { x: 310, y: 135 }
    } : {};
    
    const ninthPagePositions = pages.length > 8 ? {
      // Section 9.4 - Signature on behalf of partnership/legal entity
      section9SignatureName: { x: 310, y: 693 },
      
      // Section 10 - Position held by the official (for second entity)
      section10PositionSupervisoryBoardMember: { x: 305, y: 447 },
      section10PositionLiquidator: { x: 305, y: 435 },
      section10PositionSoleShareholder: { x: 305, y: 423 },
      section10PositionDirector: { x: 305, y: 398 },
      section10PositionDirectorWithBoardNo: { x: 322, y: 320 },
      section10PositionDirectorWithBoardYes: { x: 322, y: 350 },
      section10PositionExecutiveDirector: { x: 340, y: 338 },
      section10PositionNonExecutiveDirector: { x: 340, y: 327 },
      
      // Is official also sole shareholder
      section10IsShareholderNo: { x: 305, y: 303 },
      section10IsShareholderYes: { x: 305, y: 290 },
      section10ShareholderDate: { x: 325, y: 270 },
      
      // Statutory title
      section10HasStatutoryTitleNo: { x: 305, y: 195 },
      section10HasStatutoryTitleYes: { x: 305, y: 183 },
      section10StatutoryTitle: { x: 325, y: 165 }
    } : {};
    
    const tenthPagePositions = pages.length > 9 ? {
      // Section 10.4 - Authority
      section10AuthorityNone: { x: 305, y: 710 },
      section10AuthoritySole: { x: 305, y: 700 },
      section10AuthorityJoint: { x: 305, y: 687 },
      
      // Position start date
      section10PositionStartDate: { x: 322, y: 660 },
      
      // More officials
      section10MoreOfficialsNo: { x: 305, y: 627 },
      section10MoreOfficialsYes: { x: 305, y: 603 },
      section10MoreOfficialsEntity: { x: 322, y: 590 },
      
      // Section 11 - Signature
      section11SignatureName: { x: 430, y: 430 },
      section11SignatureEmail: { x: 430, y: 400 },
      section11SignaturePhone: { x: 430, y: 370 },
      section11SignatureDate: { x: 430, y: 340 }
    } : {};
    
    const eleventhPagePositions = pages.length > 10 ? {
      // Section 12 - UBO
      section12UboNo: { x: 305, y: 690 },
      section12UboYes: { x: 305, y: 670 }
    } : {};
    
 
    
    // Draw text and checkboxes based on the data
    // Section 1 - Legal entity details
    if (data.section1LegalEntityName) {
      firstPage.drawText(data.section1LegalEntityName, {
        x: firstPagePositions.section1legalEntityName.x,
        y: firstPagePositions.section1legalEntityName.y,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
    
    if (data.section1RegisteredOffice) {
      firstPage.drawText(data.section1RegisteredOffice, {
        x: firstPagePositions.section1registeredOffice.x,
        y: firstPagePositions.section1registeredOffice.y,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
    
    // Registration status
    if (data.section1IsRegistered === "no") {
      firstPage.drawText("X", {
        x: firstPagePositions.section1registeredNo.x,
        y: firstPagePositions.section1registeredNo.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    } else if (data.section1IsRegistered === "yes") {
      firstPage.drawText("X", {
        x: firstPagePositions.section1registeredYes.x,
        y: firstPagePositions.section1registeredYes.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
      
      if (data.section1KvkNumber) {
        firstPage.drawText(data.section1KvkNumber, {
          x: firstPagePositions.section1kvkNumber.x,
          y: firstPagePositions.section1kvkNumber.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    
    // Section 2 - Legal personality
    if (data.section2NaturalPersonCheckbox?.includes("natural")) {
      secondPage.drawText("X", {
        x: secondPagePositions.section2naturalPersonCheckbox.x,
        y: secondPagePositions.section2naturalPersonCheckbox.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    }
    
    if (data.section2LegalEntityCheckbox?.includes("entity")) {
      secondPage.drawText("X", {
        x: secondPagePositions.section2legalEntityCheckbox.x,
        y: secondPagePositions.section2legalEntityCheckbox.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    }
    
    // Section 3 - Natural person details (only if legal personality is natural)
    if (data.section2NaturalPersonCheckbox?.includes("natural")) {
      if (data.section3Surname) {
        secondPage.drawText(data.section3Surname, {
          x: secondPagePositions.section3surname.x,
          y: secondPagePositions.section3surname.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section3GivenNames) {
        secondPage.drawText(data.section3GivenNames, {
          x: secondPagePositions.section3givenNames.x,
          y: secondPagePositions.section3givenNames.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section3CitizenServiceNumber) {
        secondPage.drawText(data.section3CitizenServiceNumber, {
          x: secondPagePositions.section3citizenServiceNumber.x,
          y: secondPagePositions.section3citizenServiceNumber.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section3DateOfBirth) {
        secondPage.drawText(data.section3DateOfBirth, {
          x: secondPagePositions.section3dateOfBirth.x,
          y: secondPagePositions.section3dateOfBirth.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section3PlaceOfBirth) {
        secondPage.drawText(data.section3PlaceOfBirth, {
          x: secondPagePositions.section3placeOfBirth.x,
          y: secondPagePositions.section3placeOfBirth.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section3CountryOfBirth) {
        secondPage.drawText(data.section3CountryOfBirth, {
          x: secondPagePositions.section3countryOfBirth.x,
          y: secondPagePositions.section3countryOfBirth.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Gender
      if (data.section3Gender === "male") {
        secondPage.drawText("X", {
          x: secondPagePositions.section3genderMale.x,
          y: secondPagePositions.section3genderMale.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section3Gender === "female") {
        secondPage.drawText("X", {
          x: secondPagePositions.section3genderFemale.x,
          y: secondPagePositions.section3genderFemale.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section3PrivateAddress) {
        secondPage.drawText(data.section3PrivateAddress, {
          x: secondPagePositions.section3privateAddress.x,
          y: secondPagePositions.section3privateAddress.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    
    // Section 4 - Position held (on second page)
    if (thirdPage) {
      // Position checkboxes
      if (data.section4Position) {
        if (data.section4Position === "supervisoryBoardMember") {
          thirdPage.drawText("X", {
            x: thirdPagePositions.section4supervisoryBoardMember.x,
            y: thirdPagePositions.section4supervisoryBoardMember.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section4Position === "liquidator") {
          thirdPage.drawText("X", {
            x: thirdPagePositions.section4liquidator.x,
            y: thirdPagePositions.section4liquidator.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section4Position === "soleShareholder") {
          thirdPage.drawText("X", {
            x: thirdPagePositions.section4soleShareholderOnly.x,
            y: thirdPagePositions.section4soleShareholderOnly.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section4Position === "director") {
          thirdPage.drawText("X", {
            x: thirdPagePositions.section4director.x,
            y: thirdPagePositions.section4director.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
          
          // Director with board
          if (data.section4DirectorWithBoard === "yes") {
            thirdPage.drawText("X", {
              x: thirdPagePositions.section4directorWithBoardYes.x,
              y: thirdPagePositions.section4directorWithBoardYes.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
            
            // Director type
            if (data.section4DirectorType === "executive") {
              thirdPage.drawText("X", {
                x: thirdPagePositions.section4executiveDirector.x,
                y: thirdPagePositions.section4executiveDirector.y,
                size: 8,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0)
              });
            } else if (data.section4DirectorType === "nonExecutive") {
              thirdPage.drawText("X", {
                x: thirdPagePositions.section4nonExecutiveDirector.x,
                y: thirdPagePositions.section4nonExecutiveDirector.y,
                size: 8,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0)
              });
            }
          } else if (data.section4DirectorWithBoard === "no") {
            thirdPage.drawText("X", {
              x: thirdPagePositions.section4directorWithBoardNo.x,
              y: thirdPagePositions.section4directorWithBoardNo.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          }
        }
      }
      
      // Is also shareholder
      if (data.section4IsShareholder === "no") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.section4shareholderNo.x,
          y: thirdPagePositions.section4shareholderNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section4IsShareholder === "yes") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.section4shareholderYes.x,
          y: thirdPagePositions.section4shareholderYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
        
        if (data.section4ShareholderDate) {
          thirdPage.drawText(data.section4ShareholderDate, {
            x: thirdPagePositions.section4shareholderDate.x,
            y: thirdPagePositions.section4shareholderDate.y,
            size: 8,
            font: helveticaFont,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // Statutory title
      if (data.section4HasStatutoryTitle === "no") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.section4statutoryTitleNo.x,
          y: thirdPagePositions.section4statutoryTitleNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section4HasStatutoryTitle === "yes") {
        thirdPage.drawText("X", {
          x: thirdPagePositions.section4statutoryTitleYes.x,
          y: thirdPagePositions.section4statutoryTitleYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
        
        if (data.section4StatutoryTitle) {
          thirdPage.drawText(data.section4StatutoryTitle, {
            x: thirdPagePositions.section4statutoryTitle.x,
            y: thirdPagePositions.section4statutoryTitle.y,
            size: 8,
            font: helveticaFont,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Authority
      if (fourthPage && data.section4OfficialAuthority) {
        if (data.section4OfficialAuthority === "none") {
          fourthPage.drawText("X", {
            x: fourthPagePositions.section4noAuthority.x,
            y: fourthPagePositions.section4noAuthority.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section4OfficialAuthority === "sole") {
          fourthPage.drawText("X", {
            x: fourthPagePositions.section4soleAuthority.x,
            y: fourthPagePositions.section4soleAuthority.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section4OfficialAuthority === "joint") {
          fourthPage.drawText("X", {
            x: fourthPagePositions.section4jointAuthority.x,
            y: fourthPagePositions.section4jointAuthority.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // Position start date
      if (fourthPage && data.section4positionStartDate) {
        fourthPage.drawText(data.section4positionStartDate, {
          x: fourthPagePositions.section4positionStartDate.x,
          y: fourthPagePositions.section4positionStartDate.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // More officials
      if (fourthPage && data.section4MoreOfficials === "no") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.section4moreOfficialsNo.x,
          y: fourthPagePositions.section4moreOfficialsNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (fourthPage && data.section4MoreOfficials === "yes") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.section4moreOfficialsYes.x,
          y: fourthPagePositions.section4moreOfficialsYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
        
        // Type of more officials
        if (data.section4MoreOfficialsType) {
          if (data.section4MoreOfficialsType.includes("natural")) {
            fourthPage.drawText("X", {
              x: fourthPagePositions.section4moreOfficialsNatural.x,
              y: fourthPagePositions.section4moreOfficialsNatural.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          }
          
          if (data.section4MoreOfficialsType.includes("entity")) {
            fourthPage.drawText("X", {
              x: fourthPagePositions.section4moreOfficialsEntity.x,
              y: fourthPagePositions.section4moreOfficialsEntity.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          }
        }
      }
    }
    
    // Section 5 - Additional natural person details
    if (fourthPage && data.section4MoreOfficials === "yes" && data.section4MoreOfficialsType && data.section4MoreOfficialsType.includes("natural")) {
      console.log("Attempting to map section 6 data");
    console.log("Fifth page positions:", fifthPagePositions);
      // Additional natural person
      if (data.section5Surname) {
        fourthPage.drawText(data.section5Surname, {
          x: fourthPagePositions.section5Surname.x,
          y: fourthPagePositions.section5Surname.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section5GivenNames) {
        fourthPage.drawText(data.section5GivenNames, {
          x: fourthPagePositions.section5GivenNames.x,
          y: fourthPagePositions.section5GivenNames.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section5BSN) {
        fourthPage.drawText(data.section5BSN, {
          x: fourthPagePositions.section5BSN.x,
          y: fourthPagePositions.section5BSN.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section5DateOfBirth) {
        fourthPage.drawText(data.section5DateOfBirth, {
          x: fourthPagePositions.section5DateOfBirth.x,
          y: fourthPagePositions.section5DateOfBirth.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section5PlaceOfBirth) {
        fourthPage.drawText(data.section5PlaceOfBirth, {
          x: fourthPagePositions.section5PlaceOfBirth.x,
          y: fourthPagePositions.section5PlaceOfBirth.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section5CountryOfBirth) {
        fourthPage.drawText(data.section5CountryOfBirth, {
          x: fourthPagePositions.section5CountryOfBirth.x,
          y: fourthPagePositions.section5CountryOfBirth.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Additional gender
      if (data.section5Gender === "male") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.section5GenderMale.x,
          y: fourthPagePositions.section5GenderMale.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section5Gender === "female") {
        fourthPage.drawText("X", {
          x: fourthPagePositions.section5GenderFemale.x,
          y: fourthPagePositions.section5GenderFemale.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section5PrivateAddress) {
        fourthPage.drawText(data.section5PrivateAddress, {
          x: fourthPagePositions.section5PrivateAddress.x,
          y: fourthPagePositions.section5PrivateAddress.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    
    // Section 6 - Additional position details
    if (fourthPage && fifthPage && data.section4MoreOfficials === "yes" && data.section4MoreOfficialsType && data.section4MoreOfficialsType.includes("natural")) {
      // Map additional position fields to PDF
      console.log("Additional position data:", {
        position: data.section6Position,
        directorType: data.section6DirectorType,
        isDirectorWithBoard: data.section6DirectorWithBoard,
        isShareholder: data.section6IsShareholder,
        hasStatutoryTitle: data.section6HasStatutoryTitle,
        authority: data.section6OfficialAuthority,
        positionStartDate: data.section6PositionStartDate
      });
      
      // Additional position checkboxes
      if (data.section6Position === "supervisoryBoardMember") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6SupervisoryBoardMember.x,
          y: fifthPagePositions.section6SupervisoryBoardMember.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section6Position === "liquidator") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6Liquidator.x,
          y: fifthPagePositions.section6Liquidator.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section6Position === "soleShareholder") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6SoleShareholderOnly.x,
          y: fifthPagePositions.section6SoleShareholderOnly.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }

      if (data.section6Position === "director") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6Director.x,
          y: fifthPagePositions.section6Director.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });

        // Director with board
        if (data.section6DirectorWithBoard === "yes") {
          fifthPage.drawText("X", {
            x: fifthPagePositions.section6DirectorWithBoardYes.x,
            y: fifthPagePositions.section6DirectorWithBoardYes.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });

          // Director type
          if (data.section6DirectorType === "executive") {
            fifthPage.drawText("X", {
              x: fifthPagePositions.section6ExecutiveDirector.x,
              y: fifthPagePositions.section6ExecutiveDirector.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          } else if (data.section6DirectorType === "nonExecutive") {
            fifthPage.drawText("X", {
              x: fifthPagePositions.section6NonExecutiveDirector.x,
              y: fifthPagePositions.section6NonExecutiveDirector.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          }
        } else if (data.section6DirectorWithBoard === "no") {
          fifthPage.drawText("X", {
            x: fifthPagePositions.section6DirectorWithBoardNo.x,
            y: fifthPagePositions.section6DirectorWithBoardNo.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // Additional authority
    
      
      // Additional Position Start Date
    
      // Additional Is Shareholder
      if (data.section6IsShareholder === "yes") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6ShareholderYes.x,
          y: fifthPagePositions.section6ShareholderYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } 
      else if (data.section6IsShareholder === "no") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6ShareholderNo.x,
          y: fifthPagePositions.section6ShareholderNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }

      if (data.section6ShareholderDate) {
        fifthPage.drawText(data.section6ShareholderDate, {
          x: fifthPagePositions.section6ShareholderDate.x,
          y: fifthPagePositions.section6ShareholderDate.y,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Additional Has Statutory Title
      if (data.section6HasStatutoryTitle === "yes") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6StatutoryTitleYes.x,
          y: fifthPagePositions.section6StatutoryTitleYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section6HasStatutoryTitle === "no") {
        fifthPage.drawText("X", {
          x: fifthPagePositions.section6StatutoryTitleNo.x,
          y: fifthPagePositions.section6StatutoryTitleNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
      if (data.section6StatutoryTitle) {
        fifthPage.drawText(data.section6StatutoryTitle, {
          x: fifthPagePositions.section6StatutoryTitle.x,
          y: fifthPagePositions.section6StatutoryTitle.y,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    //page 6
    if (sixthPage) {
      // Authority
      if (data.section6OfficialAuthority) {
        if (data.section6OfficialAuthority === "none") {
          sixthPage.drawText("X", {
            x: sixthPagePositions.section6NoAuthority.x,
            y: sixthPagePositions.section6NoAuthority.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section6OfficialAuthority === "sole") {
          sixthPage.drawText("X", {
            x: sixthPagePositions.section6SoleAuthority.x,
            y: sixthPagePositions.section6SoleAuthority.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section6OfficialAuthority === "joint") {
          sixthPage.drawText("X", {
            x: sixthPagePositions.section6JointAuthority.x,
            y: sixthPagePositions.section6JointAuthority.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // Section 6.5 Position start date
      if (data.section6PositionStartDate) {
        sixthPage.drawText(data.section6PositionStartDate, {
          x: sixthPagePositions.section6PositionStartDate.x,
          y: sixthPagePositions.section6PositionStartDate.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Section 6.6 More officials
      if (data.section6MoreOfficials === "no") {
        sixthPage.drawText("X", {
          x: sixthPagePositions.section6MoreOfficialsNo.x,
          y: sixthPagePositions.section6MoreOfficialsNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section6MoreOfficials === "yes") {
        sixthPage.drawText("X", {
          x: sixthPagePositions.section6MoreOfficialsYes.x,
          y: sixthPagePositions.section6MoreOfficialsYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
        
        // Type of more officials
        if (data.section6MoreOfficialsType) {
          if (data.section6MoreOfficialsType.includes("natural")) {
            sixthPage.drawText("X", {
              x: sixthPagePositions.section6MoreOfficialsNaturalPerson.x,
              y: sixthPagePositions.section6MoreOfficialsNaturalPerson.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          }
          
          if (data.section6MoreOfficialsType.includes("entity")) {
            sixthPage.drawText("X", {
              x: sixthPagePositions.section6MoreOfficialsEntity.x,
              y: sixthPagePositions.section6MoreOfficialsEntity.y,
              size: 8,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0)
            });
          }
        }
      }
      
      // Section 7 - Partnership/Legal entity details
      if (data.section7EntityName) {
        sixthPage.drawText(data.section7EntityName, {
          x: sixthPagePositions.section7EntityName.x,
          y: sixthPagePositions.section7EntityName.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section7EntityAddress) {
        sixthPage.drawText(data.section7EntityAddress, {
          x: sixthPagePositions.section7EntityAddress.x,
          y: sixthPagePositions.section7EntityAddress.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section7EntityKvkNumber) {
        sixthPage.drawText(data.section7EntityKvkNumber, {
          x: sixthPagePositions.section7EntityKvkNumber.x,
          y: sixthPagePositions.section7EntityKvkNumber.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Section 7.3 - Registration details abroad
      if (data.section7ForeignRegNumber) {
        sixthPage.drawText(data.section7ForeignRegNumber, {
          x: sixthPagePositions.section7ForeignRegNumber.x,
          y: sixthPagePositions.section7ForeignRegNumber.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section7RegisterName) {
        sixthPage.drawText(data.section7RegisterName, {
          x: sixthPagePositions.section7RegisterName.x,
          y: sixthPagePositions.section7RegisterName.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      if (data.section7RegisteringAuthority) {
        sixthPage.drawText(data.section7RegisteringAuthority, {
          x: sixthPagePositions.section7RegisteringAuthority.x,
          y: sixthPagePositions.section7RegisteringAuthority.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    
   
    if (seventhPage && data.section7SignatureName) {
      seventhPage.drawText(data.section7SignatureName, {
        x: seventhPagePositions.section7SignatureName.x,
        y: seventhPagePositions.section7SignatureName.y,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
    
    // Section 8 - Position held by the legal entity
    if (seventhPage && data.section8Position) {
      if (data.section8Position === "supervisoryBoardMember") {
        seventhPage.drawText("X", {
          x: seventhPagePositions.section8PositionSupervisoryBoardMember.x,
          y: seventhPagePositions.section8PositionSupervisoryBoardMember.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section8Position === "liquidator") {
        seventhPage.drawText("X", {
          x: seventhPagePositions.section8PositionLiquidator.x,
          y: seventhPagePositions.section8PositionLiquidator.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section8Position === "soleShareholder") {
        seventhPage.drawText("X", {
          x: seventhPagePositions.section8PositionSoleShareholder.x,
          y: seventhPagePositions.section8PositionSoleShareholder.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section8Position === "director") {
        seventhPage.drawText("X", {
          x: seventhPagePositions.section8PositionDirector.x,
          y: seventhPagePositions.section8PositionDirector.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    // Inside the section where you handle Section 8 positions on seventh page
if (seventhPage && data.section8Position === "director") {
  // Director position checkbox was already handled above

  if (data.section8DirectorWithBoard === "no") {
    seventhPage.drawText("X", {
      x: seventhPagePositions.section8PositionDirectorWithBoardNo.x,
      y: seventhPagePositions.section8PositionDirectorWithBoardNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section8DirectorWithBoard === "yes") {
    seventhPage.drawText("X", {
      x: seventhPagePositions.section8PositionDirectorWithBoardYes.x,
      y: seventhPagePositions.section8PositionDirectorWithBoardYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    // Director type when board is present
    if (data.section8DirectorType === "executive") {
      seventhPage.drawText("X", {
        x: seventhPagePositions.section8PositionExecutiveDirector.x,
        y: seventhPagePositions.section8PositionExecutiveDirector.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    } else if (data.section8DirectorType === "nonExecutive") {
      seventhPage.drawText("X", {
        x: seventhPagePositions.section8PositionNonExecutiveDirector.x,
        y: seventhPagePositions.section8PositionNonExecutiveDirector.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    }
  }
}
// Section 8 - Shareholder status and statutory title
if (seventhPage && data.section8Position) {
  // Is shareholder
  if (data.section8IsShareholder === "no") {
    seventhPage.drawText("X", {
      x: seventhPagePositions.section8IsShareholderNo.x,
      y: seventhPagePositions.section8IsShareholderNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section8IsShareholder === "yes") {
    seventhPage.drawText("X", {
      x: seventhPagePositions.section8IsShareholderYes.x,
      y: seventhPagePositions.section8IsShareholderYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    // Draw shareholder date if yes
    if (data.section8ShareholderDate) {
      seventhPage.drawText(data.section8ShareholderDate, {
        x: seventhPagePositions.section8ShareholderDate.x,
        y: seventhPagePositions.section8ShareholderDate.y,
        size: 8,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
  }

  // Statutory title
  if (data.section8HasStatutoryTitle === "no") {
    seventhPage.drawText("X", {
      x: seventhPagePositions.section8HasStatutoryTitleNo.x,
      y: seventhPagePositions.section8HasStatutoryTitleNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section8HasStatutoryTitle === "yes") {
    seventhPage.drawText("X", {
      x: seventhPagePositions.section8HasStatutoryTitleYes.x,
      y: seventhPagePositions.section8HasStatutoryTitleYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    // Draw statutory title if yes
    if (data.section8StatutoryTitle) {
      seventhPage.drawText(data.section8StatutoryTitle, {
        x: seventhPagePositions.section8StatutoryTitle.x,
        y: seventhPagePositions.section8StatutoryTitle.y,
        size: 8,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
  }
}
    
    // Section 9 - Details for the second legal entity
    // Section 8.4 - Authority and More Officials
if (eighthPage && data.section8Position) {
  // Authority
  if (data.section8OfficialAuthority === "none") {
    eighthPage.drawText("X", {
      x: eighthPagePositions.section8AuthorityNone.x,
      y: eighthPagePositions.section8AuthorityNone.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section8OfficialAuthority === "sole") {
    eighthPage.drawText("X", {
      x: eighthPagePositions.section8AuthoritySole.x,
      y: eighthPagePositions.section8AuthoritySole.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section8OfficialAuthority === "joint") {
    eighthPage.drawText("X", {
      x: eighthPagePositions.section8AuthorityJoint.x,
      y: eighthPagePositions.section8AuthorityJoint.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  }

  // Position start date
  if (data.section8PositionStartDate) {
    eighthPage.drawText(data.section8PositionStartDate, {
      x: eighthPagePositions.section8PositionStartDate.x,
      y: eighthPagePositions.section8PositionStartDate.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }

  // More officials
  if (data.section8MoreOfficials === "no") {
    eighthPage.drawText("X", {
      x: eighthPagePositions.section8MoreOfficialsNo.x,
      y: eighthPagePositions.section8MoreOfficialsNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section8MoreOfficials === "yes") {
    eighthPage.drawText("X", {
      x: eighthPagePositions.section8MoreOfficialsYes.x,
      y: eighthPagePositions.section8MoreOfficialsYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    // Type of more officials
    if (data.section8MoreOfficialsType) {
      if (data.section8MoreOfficialsType.includes("natural")) {
        eighthPage.drawText("X", {
          x: eighthPagePositions.section8MoreOfficialsNaturalPerson.x,
          y: eighthPagePositions.section8MoreOfficialsNaturalPerson.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
      if (data.section8MoreOfficialsType.includes("entity")) {
        eighthPage.drawText("X", {
          x: eighthPagePositions.section8MoreOfficialsEntity.x,
          y: eighthPagePositions.section8MoreOfficialsEntity.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
    }
  }
}

// Section 9 - Details for a partnership/legal entity
if (eighthPage) {
  if (data.section9EntityName) {
    eighthPage.drawText(data.section9EntityName, {
      x: eighthPagePositions.section9EntityName.x,
      y: eighthPagePositions.section9EntityName.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }

  if (data.section9EntityAddress) {
    eighthPage.drawText(data.section9EntityAddress, {
      x: eighthPagePositions.section9EntityAddress.x,
      y: eighthPagePositions.section9EntityAddress.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }

  if (data.section9EntityKvkNumber) {
    eighthPage.drawText(data.section9EntityKvkNumber, {
      x: eighthPagePositions.section9EntityKvkNumber.x,
      y: eighthPagePositions.section9EntityKvkNumber.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }

  // Registration details abroad
  if (data.section9ForeignRegNumber) {
    eighthPage.drawText(data.section9ForeignRegNumber, {
      x: eighthPagePositions.section9ForeignRegNumber.x,
      y: eighthPagePositions.section9ForeignRegNumber.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }

  if (data.section9RegisterName) {
    eighthPage.drawText(data.section9RegisterName, {
      x: eighthPagePositions.section9RegisterName.x,
      y: eighthPagePositions.section9RegisterName.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }

  if (data.section9RegisteringAuthority) {
    eighthPage.drawText(data.section9RegisteringAuthority, {
      x: eighthPagePositions.section9RegisteringAuthority.x,
      y: eighthPagePositions.section9RegisteringAuthority.y,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    });
  }
}
if (ninthPage && data.section9SignatureName) {
  ninthPage.drawText(data.section7SignatureName, {
    x: ninthPagePositions.section9SignatureName.x,
    y: ninthPagePositions.section9SignatureName.y,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0)
  });
}

    
    // Section 10 - Position for the second legal entity
    if (ninthPage && data.section10PositionType) {
      if (data.section10PositionType === "supervisoryBoardMember") {
        ninthPage.drawText("X", {
          x: ninthPagePositions.section10PositionSupervisoryBoardMember.x,
          y: ninthPagePositions.section10PositionSupervisoryBoardMember.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section10PositionType === "liquidator") {
        ninthPage.drawText("X", {
          x: ninthPagePositions.section10PositionLiquidator.x,
          y: ninthPagePositions.section10PositionLiquidator.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section10PositionType === "soleShareholder") {
        ninthPage.drawText("X", {
          x: ninthPagePositions.section10PositionSoleShareholder.x,
          y: ninthPagePositions.section10PositionSoleShareholder.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section10PositionType === "director") {
        ninthPage.drawText("X", {
          x: ninthPagePositions.section10PositionDirector.x,
          y: ninthPagePositions.section10PositionDirector.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    // Section 10 - Director board details
if (ninthPage && data.section10PositionType === "director") {
  // Director with board
  if (data.section10DirectorWithBoard === "no") {
    ninthPage.drawText("X", {
      x: ninthPagePositions.section10PositionDirectorWithBoardNo.x,
      y: ninthPagePositions.section10PositionDirectorWithBoardNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } else if (data.section10DirectorWithBoard === "yes") {
    ninthPage.drawText("X", {
      x: ninthPagePositions.section10PositionDirectorWithBoardYes.x,
      y: ninthPagePositions.section10PositionDirectorWithBoardYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    // Director type when board is present
    if (data.section10DirectorType === "executive") {
      ninthPage.drawText("X", {
        x: ninthPagePositions.section10PositionExecutiveDirector.x,
        y: ninthPagePositions.section10PositionExecutiveDirector.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    } else if (data.section10DirectorType === "nonExecutive") {
      ninthPage.drawText("X", {
        x: ninthPagePositions.section10PositionNonExecutiveDirector.x,
        y: ninthPagePositions.section10PositionNonExecutiveDirector.y,
        size: 8,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
    }
  }
}

  // Shareholder status
  if (data.section10IsShareholder === "no") {
    ninthPage.drawText("X", {
      x: ninthPagePositions.section10IsShareholderNo.x,
      y: ninthPagePositions.section10IsShareholderNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } 
  else if (data.section10IsShareholder === "yes") {
    ninthPage.drawText("X", {
      x: ninthPagePositions.section10IsShareholderYes.x,
      y: ninthPagePositions.section10IsShareholderYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    if (data.section10ShareholderDate) {
      ninthPage.drawText(data.section10ShareholderDate, {
        x: ninthPagePositions.section10ShareholderDate.x,
        y: ninthPagePositions.section10ShareholderDate.y,
        size: 8,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
  }

  // Statutory title
  if (data.section10HasStatutoryTitle === "no") {
    ninthPage.drawText("X", {
      x: ninthPagePositions.section10HasStatutoryTitleNo.x,
      y: ninthPagePositions.section10HasStatutoryTitleNo.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });
  } 
  else if (data.section10HasStatutoryTitle === "yes") {
    ninthPage.drawText("X", {
      x: ninthPagePositions.section10HasStatutoryTitleYes.x,
      y: ninthPagePositions.section10HasStatutoryTitleYes.y,
      size: 8,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    });

    if (data.section10StatutoryTitle) {
      ninthPage.drawText(data.section10StatutoryTitle, {
        x: ninthPagePositions.section10StatutoryTitle.x,
        y: ninthPagePositions.section10StatutoryTitle.y,
        size: 8,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
  }

    
    // Signature (always present on the last page)
    const signaturePage = pages[pages.length - 1];
    if (signaturePage && data.section11SignatureName) {
      signaturePage.drawText(data.section11SignatureName, {
        x: tenthPage ? tenthPagePositions.section11SignatureName?.x : 430,
        y: tenthPage ? tenthPagePositions.section11SignatureName?.y : 150,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
    
    if (signaturePage && data.section11SignatureDate) {
      signaturePage.drawText(data.section11SignatureDate, {
        x: tenthPage ? tenthPagePositions.section11SignatureDate?.x : 430,
        y: tenthPage ? tenthPagePositions.section11SignatureDate?.y : 120,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
    }
     // Page 10 - Second entity authority and signature
     if ( tenthPage) {
      // Second entity authority
      if (data.section10OfficialAuthority) {
        if (data.section10OfficialAuthority === "none") {
          tenthPage.drawText("X", {
            x: tenthPagePositions.section10AuthorityNone.x,
            y: tenthPagePositions.section10AuthorityNone.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section10OfficialAuthority=== "sole") {
          tenthPage.drawText("X", {
            x: tenthPagePositions.section10AuthoritySole.x,
            y: tenthPagePositions.section10AuthoritySole.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        if (data.section10OfficialAuthority === "joint") {
          tenthPage.drawText("X", {
            x: tenthPagePositions.section10AuthorityJoint.x,
            y: tenthPagePositions.section10AuthorityJoint.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // Second entity position start date
      if (data.section10positionStartDate) {
        tenthPage.drawText(data.section10positionStartDate, {
          x: tenthPagePositions.section10PositionStartDate.x,
          y: tenthPagePositions.section10PositionStartDate.y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      }
      
      // Second entity more officials
      if (data.section10MoreOfficials=== "no") {
        tenthPage.drawText("X", {
          x: tenthPagePositions.section10MoreOfficialsNo.x,
          y: tenthPagePositions.section10MoreOfficialsNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.section10MoreOfficials=== "yes") {
        tenthPage.drawText("X", {
          x: tenthPagePositions.section10MoreOfficialsYes.x,
          y: tenthPagePositions.section10MoreOfficialsYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
        
        if (data.section10MoreOfficials && data.section10MoreOfficialsType.includes("entity")) {
          tenthPage.drawText("X", {
            x: tenthPagePositions.section10MoreOfficialsEntity.x,
            y: tenthPagePositions.section10MoreOfficialsEntity.y,
            size: 8,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0)
          });
        }
      }
    }
    
    // Page 11 - UBO details
    if (eleventhPage) {
      // UBO indicators
      if (data.hasUBO === "no") {
        eleventhPage.drawText("X", {
          x: eleventhPagePositions.section12UboNo.x,
          y: eleventhPagePositions.section12UboNo.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      } else if (data.hasUBO === "yes") {
        eleventhPage.drawText("X", {
          x: eleventhPagePositions.section12UboYes.x,
          y: eleventhPagePositions.section12UboYes.y,
          size: 8,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0)
        });
      }
    }
    
    return pdfDoc;
    
  } catch (error) {
    console.error("Error in PDF data mapping:", error);
    throw error;
  }
}; 