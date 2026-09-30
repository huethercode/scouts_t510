# Unit Committee Meeting Automation

A zero-touch Google Workspace automation designed to completely streamline monthly Scout Troop committee reporting. 

This project connects Google Forms, Google Sheets, Google Calendar (including imported Scoutbook/TroopMaster feeds), and Google Docs. It aggregates monthly subcommittee reports, prevents data overlap, generates beautifully formatted meeting agendas for both the current and upcoming month, and emails the completed documents directly to the Committee Chair or Secretary.

## ✨ Features
* **Dual-Month Generation:** Automatically generates a fully populated agenda for the current month's meeting, alongside a clean, pre-formatted draft for the *next* month's meeting.
* **Smart 10-Day Lookback Window:** Strictly pulls form responses submitted within the 10 days leading up to a specific committee meeting date, ensuring old data from previous months is never accidentally injected.
* **Live Form Dashboard Sync:** The Google Form automatically updates its own help text to show exactly what is currently filed in the system for each role, acting as a real-time dashboard for the committee.
* **QR Code Generation:** If a subcommittee chair submits a URL to a Google Doc (for long or complex reports), the script automatically generates a 75x75 QR Code and a clickable link on the printed agenda.
* **Dynamic Instructions:** Automatically pushes the correct Google Drive folder link for the *current* month directly into the Form's instructions so chairs know exactly where to save their files.
* **Universal Calendar Integration:** Scans all user calendars (including secondary/imported unit feeds) to find upcoming events titled exactly "Committee Meeting."
* **On-Demand Updates UI:** Injects a custom menu directly into the Google Sheets toolbar, allowing the administrator to manually regenerate the agenda with one click when last-minute reports are submitted.

---

##  Step-by-Step Setup Guide

Follow these steps to duplicate this automation for your own unit.

### Step 1: Set Up Google Drive
1. Create a new folder in Google Drive to hold all your monthly meeting folders (e.g., "Monthly Committee Agendas").
2. Look at the URL in your browser. It will look like `https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j?usp=sharing`.
3. Copy the string of random letters and numbers (`1A2b3C4d5E6f7G8h9I0j`). This is your **Master Folder ID**. Save it for Step 4.

### Step 2: Create the Agenda Template
1. Create a new Google Doc. 
2. Format your standard agenda. (You can copy the provided `templates/Agenda_Template_Example.md` into this document to get started).
3. Ensure every subcommittee has a specific tag in the document formatted exactly like `<<Role_Report>>`. 
4. Include `<<CURRENT_MEETING_DATE>>` and `<<NEXT_MEETING_DATE>>` where appropriate (headers are supported).
5. Copy the ID from the document's URL (the random string between `/d/` and `/edit`). This is your **Template Doc ID**. Save it for Step 4.

### Step 3: Set Up the Master Spreadsheet
1. Create a completely blank new Google Sheet. This will become your master database where all form responses are caught and stored.
2. In the top menu of this blank sheet, click **Extensions > Apps Script**.

### Step 4: Configure the Script
1. Delete the default code in the editor and paste the entire contents of `src/Code.js` from this repository.
2. At the very top of the script, paste your IDs from Steps 1 and 2:
   ```javascript
   const MASTER_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; 
   const TEMPLATE_DOC_ID = 'YOUR_TEMPLATE_ID_HERE';

Click the Save (floppy disk) icon.

###  Step 5: Build the Form & Link the Sheet
1. Still inside the Apps Script editor, look at the top toolbar. Select `buildTroopForm` from the function dropdown menu.
2. Click `Run`. (Google will ask you to authorize the script permissions. Click Advanced > Go to script).
3. The script will automatically generate the Google Form and link it directly to your blank Google Sheet.
4. Close the Apps Script window and refresh your Google Sheet. You will now see a new tab titled "Form Responses 1" with all the column headers perfectly built.

### Step 6: Calendar Preparation
1. For the script to know when to run, you must have an event on your Google Calendar titled exactly Committee Meeting. The script searches 60 days into the future, so ensure you have recurring events set up.

### Step 7: Automate the Triggers & Sync
1. The Daily Calendar Check: In the Apps Script editor, click the Clock Icon (Triggers) on the left menu. Click + Add Trigger. Set it to run `runDailyCalendarCheck` via a Time-driven -> Day timer between Midnight to 1am. Click Save.
2. The Live Form Sync: Go back to your Google Sheet. At the top menu, click Troop 510 Menu > Activate Live Form Sync. (You only ever have to click this once. It tells the sheet to automatically update the Google Form every time someone submits a new answer).

## Administrator Usage Guide
Once the system is set up, it requires almost zero maintenance. Here is how to run the workflow month-to-month.

### Phase 1: The Call for Reports (12–14 Days Before Meeting)
1. Send an email to your committee asking for their updates.
2. Provide the link to your Google Form. (This link is permanent and never changes).
3. Remind them that if they have a complex report (budget tables, specific formatting, long paragraphs), they should create a Google Doc in the shared folder provided in the Form's description, and submit only the URL to the form.

### Phase 2: QR Codes & Complex Documents
If a user submits only a web link (e.g., https://docs.google.com/document/...) into their form box, the system will automatically convert it into a 75x75 pixel QR Code on the printed agenda.

Note: It must be only the link. If they type "Here is my report: https...", it will paste as plain text.

### Phase 3: The Live Dashboard
When a committee member clicks the form link, they will see exactly what the system currently has on file for their role under the "CURRENTLY FILED REPORT" section. If they submit a new response, the form will instantly update itself to display their new text for the next person who looks at it.

### Phase 4: Automatic Generation (10 Days Before Meeting)
Exactly 10 days before the scheduled meeting, the system will run overnight. You will receive an automated email containing links to:

- The Master Google Form.
- The newly generated Current Month's Agenda (populated with recent reports).
- The Next Month's Agenda (a blank template for future use).
- The Master Spreadsheet containing raw data.

### Phase 5: Handling Last-Minute Updates
If a subcommittee chair submits their report after the agenda has been generated, do not copy and paste their text into the Google Doc manually.

1. Open the Responses Google Sheet.
2. Click Troop 510 Menu > Generate Latest Agenda (Current Month) at the top of the sheet.
3. The system will instantly delete the outdated draft, generate a brand new one with the late submission included, and email you the updated link.

Tip: To fix a typo in someone's report, fix it directly in the Google Sheet and click this button to regenerate the agenda.
