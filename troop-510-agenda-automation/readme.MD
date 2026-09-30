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

## 🛠️ Step-by-Step Setup Guide

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
