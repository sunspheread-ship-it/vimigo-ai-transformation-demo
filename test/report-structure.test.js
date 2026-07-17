import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const reportsSource = readFileSync(new URL("../src/reports.js", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");

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
