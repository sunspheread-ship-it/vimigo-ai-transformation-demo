# Vimigo AI Transformation Day Pilot

This public repository contains the device-local demonstration hosted on GitHub Pages. It does not transmit client data.

The Google Apps Script pilot for real client cases, CSM review, AI-assisted drafts and six approved PDF exports is maintained separately and must remain private.

## Public demonstration

The public demo is plain HTML, CSS and JavaScript with no build step. It includes bilingual forms, transparent scoring, evidence confidence, local save-and-resume, mobile layouts and six separate print-ready report previews.

Run `npm test` to verify the scoring rules. Serve the repository root over HTTP for local browser testing.

## Google Workspace pilot deployment

1. Create a private Google Sheet owned by the pilot delivery account.
2. Create a bound Apps Script project and copy the separately maintained private pilot files into it.
3. Run `setupPilotWorkbook` once and approve the requested Google scopes.
4. In Apps Script Project Settings, add the Script Properties `OPENAI_API_KEY` and `CSM_NOTIFICATION_EMAIL`. Use one CSM email address, or separate multiple addresses with commas. Optionally set `OPENAI_MODEL`; the default is `gpt-5.6-luna` for cost-sensitive drafting.
   Optionally set `RETENTION_DAYS`; the pilot defaults to 180 days and never accepts a value below 30.
5. Deploy the project as a Web App that executes as the deploying user and is accessible to anyone with the link.
6. Use the **Vimigo Pilot** Sheet menu to create an expiring client case link.
7. A real submission is written to the private Sheet, marked `SUBMITTED`, locked against further client edits and emailed to the configured CSM with its case ID and Sheet review link.
8. After submission, generate drafts, review/edit every report, approve all six, then export the six PDFs.

If the notification address is missing or email delivery fails, the case remains safely recorded in the private Sheet. The client sees that the CSM was not notified and is asked to quote the case ID to the delivery team.

Do not publish the Sheet, Script Property values, client links or report folders. Delivery stays manual during the pilot.

## Pilot controls

- Client case tokens are stored only as SHA-256 hashes.
- Links expire and submissions lock after final confirmation; a CSM can explicitly reopen a case.
- Spreadsheet-formula prefixes are neutralised before storage.
- AI receives structured case data only and must return exactly six schema-constrained report drafts.
- AI drafts cannot be exported until all six report rows are marked approved.
- Reports label facts, CSM assessments and hypotheses requiring validation.
- The portal warns clients not to enter employee, patient, medical or other sensitive personal data.
- The CSM menu lists cases past the retention period and requires the exact confirmation phrase before deleting Sheet records and moving report folders to trash.

Commercial terms, SST, venue, timing, software access and programme inclusions must be management-approved before client use.
