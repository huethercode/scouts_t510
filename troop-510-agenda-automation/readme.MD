# Troop 510 Committee Meeting Automation

A zero-touch Google Workspace automation designed to streamline monthly Scout Troop committee reporting. 

This script connects Google Forms, Google Sheets, Google Calendar (via an imported TroopMaster feed), and Google Docs. It automatically requests subcommittee reports, aggregates the data, generates beautifully formatted meeting agendas, and emails the completed documents to the Committee Chair.

## Features
* **Dynamic Form Generation:** Automatically builds a Google Form linked to a tracking spreadsheet with forced paragraph blocks and page breaks.
* **Calendar Integration:** Scans all user calendars (including secondary/imported feeds like TroopMaster) to find upcoming events titled "Committee Meeting."
* **Smart Lookback Window:** Only pulls form responses submitted within the 10 days leading up to the target meeting to prevent pulling old data.
* **Auto-Filing & Generation:** Automatically creates `[YYYY]-[MM]_committee_meeting` folders in Google Drive, deletes outdated draft agendas, and generates clean copies based on a master template.
* **Header & Body Injection:** Replaces `<<TAGS>>` in both the document body and headers with the latest subcommittee updates, or "No update" if no report was submitted.
* **On-Demand Updates:** Injects a custom `Troop 510 Menu` directly into the Google Sheets UI to allow for one-click manual regeneration of the agenda for last-minute submissions.

## Prerequisites
1. **Google Drive Folder:** A master folder to house the monthly sub-folders.
2. **Google Doc Template:** A document containing `<<TAGS>>` matching the subcommittee array in the script, plus `<<CURRENT_MEETING_DATE>>` and `<<NEXT_MEETING_DATE>>`.
3. **Google Calendar:** An event titled exactly `Committee Meeting` (can be on a subscribed calendar).

## Setup Instructions
1. Create a new Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Clear the default code and paste the contents of `src/Code.js`.
4. Update the `MASTER_FOLDER_ID` and `TEMPLATE_DOC_ID` constants at the top of the file with your specific Google Drive IDs.
5. Run the `buildTroopForm()` function once from the editor to generate the linked Google Form.
6. Set up a daily time-driven trigger in the Apps Script dashboard pointed at `runDailyCalendarCheck`.

## How It Works
1. **Trigger:** The daily trigger checks if a "Committee Meeting" is exactly 10 days away. 
2. **Action:** If found, it pulls responses from the Google Sheet submitted in the last 10 days.
3. **Drafting:** It duplicates the master template, injects the data into the designated tags, and saves it in the current month's folder. It also pre-generates the next month's agenda with empty placeholders.
4. **Notification:** It emails the Committee Chair with direct HTML links to the Form, the current Drafted Agenda, the next month's Drafted Agenda, and the raw Data Sheet.
