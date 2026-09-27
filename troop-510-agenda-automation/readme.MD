# Unit Committee Meeting Automation

A zero-touch Google Workspace automation designed to completely streamline monthly Scout Troop committee reporting. 

This project connects Google Forms, Google Sheets, Google Calendar (including imported Scoutbook/TroopMaster feeds), and Google Docs. It aggregates monthly subcommittee reports, prevents data overlap, generates beautifully formatted meeting agendas for both the current and upcoming month, and emails the completed documents directly to the Committee Chair.

## Features
* **Dynamic Form Generation:** Automatically builds a Google Form linked to a tracking spreadsheet with forced paragraph blocks and page breaks. Users can edit their responses after submission.
* **Dual-Month Generation:** Automatically generates a fully populated agenda for the current month's meeting, alongside a clean, pre-formatted draft for the *next* month's meeting.
* **Smart 10-Day Lookback Window:** Strictly pulls form responses submitted within the 10 days leading up to a specific committee meeting date, ensuring old data from previous months is never accidentally injected.
* **Auto-Filing & Formatting Protection:** Automatically creates `[YYYY]-[MM]_committee_meeting` folders in Google Drive. If a draft already exists, it safely deletes the old version and regenerates a fresh one from the template to guarantee zero formatting errors.
* **Header & Body Injection:** Replaces `<<TAGS>>` in both the document body and headers with the latest subcommittee updates, falling back to a clean "No update" if no report was submitted.
* **Universal Calendar Integration:** Scans all user calendars (including secondary/imported unit feeds) to find upcoming events titled exactly "Committee Meeting."
* **On-Demand Updates UI:** Injects a custom menu directly into the Google Sheets toolbar, allowing the Chair to manually regenerate the agenda with one click when last-minute reports are submitted.

---

## Step-by-Step Setup Guide

Follow these steps to duplicate this automation for your own unit.

### Step 1: Set Up Google Drive
1. Create a new folder in Google Drive to hold all your monthly meeting folders (e.g., "Monthly Committee Agendas").
2. Look at the URL in your browser. It will look like `https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j?usp=sharing`.
3. Copy the string of random letters and numbers (`1A2b3C4d5E6f7G8h9I0j`). This is your **Master Folder ID**. Save it for Step 3.

### Step 2: Create the Agenda Template
1. Create a new Google Doc. 
2. Format your standard agenda. (You can copy the provided `templates/Agenda_Template_Example.md` into this document to get started).
3. Ensure every subcommittee has a specific tag in the document formatted exactly like `<<Role_Report>>`. 
4. Include `<<CURRENT_MEETING_DATE>>` and `<<NEXT_MEETING_DATE>>` where appropriate (headers are supported).
5. Copy the ID from the document's URL (the random string between `/d/` and `/edit`). This is your **Template Doc ID**. Save it for Step 3.

### Step 3: Set Up the Spreadsheet & Script
1. Create a new Google Sheet (e.g., "Committee Report Responses").
2. In the top menu, click **Extensions > Apps Script**.
3. Delete the default code and paste the entire contents of `src/Code.js` from this repository.
4. At the very top of the script, paste your IDs from Steps 1 and 2:
   ```javascript
   const MASTER_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; 
   const TEMPLATE_DOC_ID = 'YOUR_TEMPLATE_ID_HERE';

   ```

5. Click the **Save** (floppy disk) icon.

### Step 4: Build the Form

1. Still inside the Apps Script editor, look at the top toolbar. Select `buildTroopForm` from the function dropdown menu.
2. Click **Run**. (Google will ask you to authorize the script permissions. Click Advanced > Go to script).
3. Once it finishes, go back to your Google Sheet. You will see a new tab with form responses, and under **Tools > Manage Form**, you can view the live form it just created.
4. *Optional:* If you want to customize the names/roles of the subcommittees, modify the `subcommittees` array in the `buildTroopForm` function before running it.

### Step 5: Calendar Preparation

For the script to know when to run, you must have an event on your Google Calendar titled exactly **Committee Meeting**.

* This can be on your primary personal calendar, or on a secondary subscribed calendar (like a live feed from TroopMaster or Scoutbook).
* The script searches 60 days into the future, so ensure you have recurring events set up.

### Step 6: Automate the Triggers

1. In the Apps Script editor, click the **Clock Icon (Triggers)** on the left-hand navigation bar.
2. Click **+ Add Trigger** in the bottom right corner.
3. Configure the trigger exactly like this:
* **Choose which function to run:** `runDailyCalendarCheck`
* **Choose which deployment should run:** `Head`
* **Select event source:** `Time-driven`
* **Select type of time based trigger:** `Day timer`
* **Select time of day:** `Midnight to 1am` (or preferred early morning time).


4. Click **Save**.

---

## How to Use the System Day-to-Day

* **Emailing the Committee:** Send the link to the generated Google Form to your committee members. They will use this exact same link every single month.
* **Automatic Generation:** 10 days before any "Committee Meeting" on your calendar, the script will automatically run overnight. It will generate the folder, duplicate the template, inject the data, and send you an email with easy-access links to the final document.
* **Handling Late Submissions:** If a volunteer submits their report the day before the meeting, open your Google Sheet. Click **Unit Menu > Generate Latest Agenda (Current Month)** at the top. The script will instantly grab their new text, replace the old draft, and email you the updated agenda link.
