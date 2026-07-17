import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const reportsSource = readFileSync(new URL("../src/reports.js", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

test("detailed pack contains exactly six report templates", () => {
  assert.equal((reportsSource.match(/data-report="0[1-6]"/g) || []).length, 6);
});

test("AI workflow report contains the complete governance fields", () => {
  for (const field of ["Business result", "Trigger", "Required inputs", "Proposed AI task", "Human approval", "Accountable owner", "Exception route", "Success metric"]) {
    assert.match(reportsSource, new RegExp(field));
  }
});

test("report pack keeps facts, assessments and hypotheses separate", () => {
  assert.match(reportsSource, /ctx\.t\("facts"\)/);
  assert.match(reportsSource, /ctx\.t\("assessment"\)/);
  assert.match(reportsSource, /ctx\.t\("hypothesis"\)/);
});

test("financial impact remains conditional on supplied baselines", () => {
  assert.match(reportsSource, /opportunity === null/);
  assert.match(reportsSource, /not a guaranteed gain/);
});

test("public demo does not claim that a CSM was notified", () => {
  assert.match(reportsSource, /does not transmit client data or notify a CSM/);
  assert.match(appSource, /the CSM was not notified/);
  assert.doesNotMatch(appSource, /Submission confirmed for CSM review/);
});

test("reports are described as case-generated drafts, not fixed sample PDFs", () => {
  assert.match(reportsSource, /generated from the form answers in this case/);
  assert.match(reportsSource, /Final PDFs are exported only after CSM review and approval/);
  assert.match(reportsSource, /GENERATED FROM THIS CASE/);
  assert.doesNotMatch(appSource, /separate bilingual PDF deliverables/);
});

test("continue validates the visible form and saved model", () => {
  assert.match(appSource, /app\.querySelector\(`\[data-form=/);
  assert.match(appSource, /activeForm\.querySelectorAll\("\[required\]"\)/);
  assert.match(appSource, /!visibleFormIsValid \|\| !validate\(state\.activeStep\)/);
});

test("diagnostic ratings do not ask for repeated evidence notes or sources", () => {
  const ratingSection = appSource.slice(
    appSource.indexOf("function ratingRow"),
    appSource.indexOf("function workflowCandidateForm"),
  );
  assert.doesNotMatch(ratingSection, /evidence-fields|evidencePath|Evidence note/);
  assert.doesNotMatch(reportsSource, /Evidence note|Evidence confidence/);
});

test("header uses the official Vimigo website logo asset", () => {
  assert.match(appSource, /vimigo\.io\/wp-content\/uploads\/2025\/10\/Logo\.png/);
  assert.match(appSource, /alt="Vimigo"/);
});

test("hero score ring keeps a perfect square aspect ratio", () => {
  assert.match(stylesSource, /\.score-orbit\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s);
  assert.doesNotMatch(stylesSource, /\.score-orbit\s*\{[^}]*min-height:/s);
});
