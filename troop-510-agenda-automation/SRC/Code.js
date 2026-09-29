const MASTER_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; 
const TEMPLATE_DOC_ID = 'YOUR_TEMPLATE_ID_HERE';

// ==========================================
// CUSTOM MENU IN GOOGLE SHEETS
// ==========================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Troop 510 Menu')
      .addItem('Generate Latest Agenda (Current Month)', 'manualGenerateCurrent')
      .addToUi();
}

function manualGenerateCurrent() {
  const today = new Date();
  const twoMonthsFromNow = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000));
  const calendars = CalendarApp.getAllCalendars();
  
  let currentMeetingDate = null; 

  for (let i = 0; i < calendars.length; i++) {
    const events = calendars[i].getEvents(today, twoMonthsFromNow, {search: 'Committee Meeting'});
    if (events.length > 0) {
      currentMeetingDate = events[0].getStartTime();
      break;
    }
  }
  
  if (currentMeetingDate) {
    const currentAgendaUrl = generateAgenda(currentMeetingDate, true);
    sendHtmlEmail(currentAgendaUrl, "#", currentMeetingDate, null); 
    SpreadsheetApp.getUi().alert("Agenda Updated! Check your email for the new link.");
  } else {
    SpreadsheetApp.getUi().alert("Error: Could not find an upcoming Committee Meeting on the calendar.");
  }
}

// ==========================================
// 1. RUN THIS ONCE TO BUILD THE FORM
// ==========================================
function buildTroopForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (ss.getFormUrl()) {
    Logger.log("A form is already attached to this sheet. If you want to rebuild it, you must unlink the current form from the sheet first.");
    return;
  }

  const form = FormApp.create('Troop 510 Monthly Subcommittee Reports');
  form.setDescription('Welcome to the new streamlined reporting process! \n\nPlease select your subcommittee and submit your monthly report for the upcoming committee meeting at the American Legion. Your answers will be automatically added to the meeting agenda.');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  form.setAllowResponseEdits(true); 

  const subcommittees = [
    { name: "Safety Minute", tag: "safety_minutes" },
    { name: "Secretary (Meeting Minutes Link)", tag: "previous meetings minutes" },
    { name: "Scoutmaster (Boy Troop)", tag: "Scoutmaster_mcconnell_Report" },
    { name: "Scoutmaster (Girl Troop)", tag: "Scoutmaster_cain_Report" }, 
    { name: "Membership", tag: "Membership_Report" },
    { name: "Recruiting", tag: "Recruiting_Report" },
    { name: "Training", tag: "Training_Report" },
    { name: "Treasurer", tag: "Treasurer_Report" },
    { name: "Fall Wreaths", tag: "Fall_wreaths_Report" },
    { name: "Fall Popcorn", tag: "Popcorn_Report" },
    { name: "Egg My Yard", tag: "EggMyYard_Report" },
    { name: "Advancement", tag: "Advancement_Report" },
    { name: "Eagle Coordinator", tag: "Eagle_Report" },
    { name: "Awards", tag: "Awards_Report" },
    { name: "Outdoor Program", tag: "Outdoor_Report" },
    { name: "Service Opportunities", tag: "Service_Report" },
    { name: "Fun Committee", tag: "Fun_Report" },
    { name: "Announcements / Other Business", tag: "Announcement_Report" } 
  ];

  const mcItem = form.addListItem().setTitle('Select your Subcommittee / Role').setRequired(true);
  const choices = [];
  
  const standardPrompt = "Please provide your update in this box. To keep things simple, consider addressing:\n• What did you accomplish?\n• What are you working on?\n• Do you need help with any problems?\n• Any future plans or announcements?";

  subcommittees.forEach(sub => {
    const pageBreak = form.addPageBreakItem().setTitle(sub.name).setGoToPage(FormApp.PageNavigationType.SUBMIT);
    const question = form.addParagraphTextItem().setTitle(sub.tag).setRequired(true);
    question.setHelpText(sub.tag === "previous meetings minutes" ? "Please paste ONLY the Google Doc link to last month's approved meeting minutes so it can generate a QR code." : standardPrompt);
    choices.push(mcItem.createChoice(sub.name, pageBreak));
  });

  mcItem.setChoices(choices);
  Logger.log('Form built successfully!');
}

// ==========================================
// 2. THE AUTOMATED DAILY CALENDAR TRIGGER
// ==========================================
function runDailyCalendarCheck() {
  ensureTwoMonthsFoldersExist();
  
  const today = new Date();
  const tenDaysFromNow = new Date(today.getTime() + (10 * 24 * 60 * 60 * 1000));
  
  const calendars = CalendarApp.getAllCalendars();
  let foundMeeting = false;

  for (let i = 0; i < calendars.length; i++) {
    const events = calendars[i].getEventsForDay(tenDaysFromNow, {search: 'Committee Meeting'});
    if (events.length > 0) {
      const currentMeetingDate = events[0].getStartTime();
      const currentAgendaUrl = generateAgenda(currentMeetingDate, true);
      
      const nextMeetingDate = getNextMeetingDateObj(currentMeetingDate);
      let nextAgendaUrl = "#";
      if (nextMeetingDate) {
        nextAgendaUrl = generateAgenda(nextMeetingDate, false);
      }

      sendHtmlEmail(currentAgendaUrl, nextAgendaUrl, currentMeetingDate, nextMeetingDate);
      foundMeeting = true;
      break; 
    }
  }
  
  if (!foundMeeting) {
    Logger.log("No Committee Meeting found 10 days from now across any calendar.");
  }
}

// ==========================================
// 3. RUN THIS TO TEST EVERYTHING RIGHT NOW
// ==========================================
function testRunNow() {
  ensureTwoMonthsFoldersExist();
  const today = new Date();
  
  const twoMonthsFromNow = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000));
  const calendars = CalendarApp.getAllCalendars();
  
  let currentMeetingDate = today; 
  let found = false;

  for (let i = 0; i < calendars.length; i++) {
    const events = calendars[i].getEvents(today, twoMonthsFromNow, {search: 'Committee Meeting'});
    if (events.length > 0) {
      currentMeetingDate = events[0].getStartTime();
      found = true;
      break;
    }
  }
  
  const currentAgendaUrl = generateAgenda(currentMeetingDate, true);
  
  const nextMeetingDate = getNextMeetingDateObj(currentMeetingDate);
  let nextAgendaUrl = "#";
  if (nextMeetingDate) {
    nextAgendaUrl = generateAgenda(nextMeetingDate, false);
  }

  sendHtmlEmail(currentAgendaUrl, nextAgendaUrl, currentMeetingDate, nextMeetingDate);
}

// ==========================================
// BACKGROUND PROCESSES (DO NOT RUN DIRECTLY)
// ==========================================
function ensureTwoMonthsFoldersExist() {
  const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
  const today = new Date();
  
  createFolderIfNotExists(masterFolder, today);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  createFolderIfNotExists(masterFolder, nextMonth);
}

function createFolderIfNotExists(parentFolder, dateObj) {
  const year = dateObj.getFullYear();
  const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0'); 
  const folderName = `${year}-${monthStr}_committee_meeting`; 
  
  const folders = parentFolder.getFoldersByName(folderName);
  if (!folders.hasNext()) {
    parentFolder.createFolder(folderName);
  }
}

function formatMeetingDate(dateObj) {
  if (!dateObj) return "[Date Not Found]";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}

function getNextMeetingDateObj(currentMeetingDate) {
  const searchStart = new Date(currentMeetingDate.getTime() + (24 * 60 * 60 * 1000));
  const searchEnd = new Date(searchStart.getTime() + (60 * 24 * 60 * 60 * 1000));
  const calendars = CalendarApp.getAllCalendars();
  
  for (let i = 0; i < calendars.length; i++) {
    const events = calendars[i].getEvents(searchStart, searchEnd, {search: 'Committee Meeting'});
    if (events.length > 0) {
      return events[0].getStartTime();
    }
  }
  return null;
}

function getNextMeetingDateFormatted(currentMeetingDate) {
  const nextDate = getNextMeetingDateObj(currentMeetingDate);
  if (nextDate) return formatMeetingDate(nextDate);
  return "[No meeting found in next 60 days]";
}

// Updated to accept isCurrentMonth flag to control form updating
function generateAgenda(meetingDate, isCurrentMonth = true) {
  const year = meetingDate.getFullYear();
  const monthStr = String(meetingDate.getMonth() + 1).padStart(2, '0');
  const folderName = `${year}-${monthStr}_committee_meeting`; 
  
  const docName = `${year}.${Utilities.formatDate(meetingDate, "CST", "MM.dd")} - Meeting Agenda`;

  const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
  
  const folderIterator = masterFolder.getFoldersByName(folderName);
  let targetFolder;
  if (folderIterator.hasNext()) {
    targetFolder = folderIterator.next();
  } else {
    targetFolder = masterFolder.createFolder(folderName);
  }

  // UPDATE FORM INSTRUCTIONS DYNAMICALLY
  if (isCurrentMonth) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formUrl = ss.getFormUrl();
    if (formUrl) {
      const form = FormApp.openByUrl(formUrl);
      form.setDescription(`Welcome to the new streamlined reporting process!\n\n📂 COMPLEX REPORTS & DOCUMENTS:\nIf your report requires specific formatting or is very long, please create a Google Doc in this month's shared folder: \n${targetFolder.getUrl()}\n\nOnce created, simply paste ONLY the link to your document into your section below. The system will automatically convert your link into a QR code for the printed agenda!\n\nOtherwise, just type your plain text update below.`);
    }
  }

  const existingDocs = targetFolder.getFilesByName(docName);
  while (existingDocs.hasNext()) {
    existingDocs.next().setTrashed(true);
  }

  const templateDoc = DriveApp.getFileById(TEMPLATE_DOC_ID);
  const newDoc = templateDoc.makeCopy(docName, targetFolder);
  const doc = DocumentApp.openById(newDoc.getId());
  const body = doc.getBody();
  const header = doc.getHeader();

  const formattedCurrentDate = formatMeetingDate(meetingDate);
  if (header) {
    header.replaceText("<<CURRENT_MEETING_DATE>>", formattedCurrentDate);
  }
  body.replaceText("<<CURRENT_MEETING_DATE>>", formattedCurrentDate);
  
  const nextMeetingFormatted = getNextMeetingDateFormatted(meetingDate);
  body.replaceText("<<NEXT_MEETING_DATE>>", nextMeetingFormatted);

  const today = new Date();
  const daysUntilMeeting = (meetingDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
  const isPending = daysUntilMeeting > 20;
  
  const tags = [
    "safety_minutes", "previous meetings minutes", "Scoutmaster_mcconnell_Report", "Scoutmaster_cain_Report",
    "Membership_Report", "Recruiting_Report", "Training_Report", "Treasurer_Report", 
    "Fall_wreaths_Report", "Popcorn_Report", "EggMyYard_Report", "Advancement_Report", 
    "Eagle_Report", "Awards_Report", "Outdoor_Report", "Service_Report", "Fun_Report", "Announcement_Report"
  ];

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0]; 
  
  let latestResponses = {};
  const tenDaysBeforeMeeting = new Date(meetingDate.getTime() - (10 * 24 * 60 * 60 * 1000));

  if (!isPending) {
    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][0]); 
      if (timestamp >= tenDaysBeforeMeeting) {
        for (let j = 1; j < headers.length; j++) { 
          if (data[i][j] !== "") {
            latestResponses[headers[j]] = data[i][j];
          }
        }
      }
    }
  }

  tags.forEach(tag => {
    if (isPending) {
      body.replaceText(`<<${tag}>>`, "[Pending next month's submissions]");
      return; 
    }

    let reportText = String(latestResponses[tag] || "No update").trim();
    
    // Check if the response is strictly a single URL
    const isUrl = /^https?:\/\/[^\s]+$/.test(reportText);

    if (isUrl) {
      let found = body.findText(`<<${tag}>>`);
      while (found) {
        let textElem = found.getElement().asText();
        let start = found.getStartOffset();
        let end = found.getEndOffsetInclusive();
        
        // Remove the <<TAG>> text entirely
        textElem.deleteText(start, end);
        
        let p = textElem.getParent().asParagraph();
        
        // Use QuickChart API with reduced size (75x75)
        let qrUrl = "https://quickchart.io/qr?size=75&text=" + encodeURIComponent(reportText);
        try {
          let blob = UrlFetchApp.fetch(qrUrl).getBlob();
          let inlineImage = p.appendInlineImage(blob);
          
          // Explicitly lock the dimensions in the document
          inlineImage.setWidth(75);
          inlineImage.setHeight(75);
          
          // Add a clickable link next to the QR code for digital viewers
          let linkText = p.appendText("  🔗 Link to Document");
          linkText.setLinkUrl(reportText);
        } catch(e) {
           // Fallback just in case the API fails
           p.appendText(reportText);
        }
        
        // Check if there are other instances of the same tag
        found = body.findText(`<<${tag}>>`, found);
      }
    } else {
      // Standard text replacement
      body.replaceText(`<<${tag}>>`, reportText);
    }
  });
  
  doc.saveAndClose();
  return newDoc.getUrl();
}

function sendHtmlEmail(currentAgendaUrl, nextAgendaUrl, currentMeetingDate, nextMeetingDate) {
  const email = Session.getActiveUser().getEmail();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const formUrl = ss.getFormUrl() || "Form not created yet. Run buildTroopForm() first.";
  const sheetUrl = ss.getUrl();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentMeetingDate.getMonth()];
  const nextMonthName = nextMeetingDate ? monthNames[nextMeetingDate.getMonth()] : "Next Month";

  let nextAgendaHtml = nextAgendaUrl !== "#" 
    ? `<a href="${nextAgendaUrl}" style="color: #1a73e8;">Drafted Agenda (${nextMonthName})</a> <br><span style="font-size: 12px; color: #666;">(Pre-generated with clean placeholders)</span>`
    : `<span style="color: red;">No calendar event found for next month.</span>`;

  let htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #003F87;">Troop 510 Agenda Workflow Executed</h2>
      <p>Your automated workflow for the upcoming American Legion committee meetings has run successfully.</p>
      
      <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">Your Action Links</h3>
      <ul>
        <li style="margin-bottom: 15px;">
          <strong>Send to Committee:</strong> <a href="${formUrl}" style="color: #1a73e8; font-weight: bold;">Master Subcommittee Report Form</a>
          <br><span style="font-size: 12px; color: #666;">(This form description has been dynamically updated with the link to the ${currentMonthName} Google Drive folder.)</span>
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Current Month:</strong> <a href="${currentAgendaUrl}" style="color: #1a73e8;">Drafted Agenda (${currentMonthName})</a>
          <br><span style="font-size: 12px; color: #666;">(Recent form responses and QR codes have been injected)</span>
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Next Month Prep:</strong> ${nextAgendaHtml}
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Raw Data:</strong> <a href="${sheetUrl}" style="color: #1a73e8;">Responses Spreadsheet</a>
        </li>
      </ul>
      
      <hr style="border: 0; height: 1px; background: #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;"><em>Note: The current and next month's folders are confirmed active in Google Drive. To manually override responses, edit the Google Sheet directly and run the trigger via the custom menu.</em></p>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: `[Troop 510] ${currentMonthName} & ${nextMonthName} Agenda Links`,
    htmlBody: htmlBody
  });
}
