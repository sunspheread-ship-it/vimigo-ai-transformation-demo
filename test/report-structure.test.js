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

test("client journey uses SME assessment language instead of medical wording", () => {
  assert.match(appSource, /Pre-Event Business Assessment/);
  assert.match(appSource, /企业活动前评估表/);
  assert.match(appSource, /现场企业转型评估工作表/);
  assert.doesNotMatch(appSource, /客户活动前诊断表|病患|医疗敏感资料/);
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

test("report pack offers six direct PDF download buttons without ZIP or print", () => {
  assert.match(reportsSource, /reportLabels/);
  assert.match(reportsSource, /data-download-report/);
  assert.match(reportsSource, /no ZIP file and no print screen/);
  assert.match(appSource, /downloadReportPdf\(reportNumber, button\)/);
  assert.match(appSource, /outputPdf\("blob"\)/);
  assert.match(appSource, /link\.download = `\$\{reportNumber\} - \$\{title\} - \$\{company\}\.pdf`/);
  assert.doesNotMatch(reportsSource, /data-download-all|\.zip/);
  assert.doesNotMatch(appSource, /window\.print\(\)|window\.JSZip/);
});

test("PDF generation is globally queued and protects page-break content", () => {
  assert.match(appSource, /let pdfDownloadInProgress = false/);
  assert.match(appSource, /if \(pdfDownloadInProgress\)/);
  assert.match(appSource, /querySelectorAll\("\[data-download-report\]"\)/);
  for (const selector of [".report-section-head", ".mechanism-chain", ".requirement-list li", "thead", "tr"]) {
    assert.ok(appSource.includes(`"${selector}"`));
  }
  assert.match(stylesSource, /\.pdf-export-report tr\s*\{[^}]*break-inside:\s*avoid/s);
  assert.match(reportsSource, /function addReportPageBreaks/);
  assert.match(reportsSource, /class="pdf-page-break"/);
  assert.match(stylesSource, /\.pdf-export-report \.pdf-page-break\s*\{[^}]*display:\s*block/s);
  assert.match(appSource, /function alignPdfSectionsToPages/);
  assert.match(appSource, /pagebreak:\s*\{\s*mode:\s*\[\]\s*\}/);
});

test("report page exposes only the six primary PDF download controls", () => {
  const headerFunction = reportsSource.slice(
    reportsSource.indexOf("function reportHeader"),
    reportsSource.indexOf("function reportMeta"),
  );
  assert.doesNotMatch(headerFunction, /data-download-report/);
  assert.equal((reportsSource.match(/data-download-report=/g) || []).length, 1);
});

test("Chinese PDF templates localise titles, tables and approval language", () => {
  for (const text of [
    "AI 企业转型评分报告",
    "企业当前转型阶段报告",
    "评估维度",
    "当前情况解读",
    "发布前必须由 CSM 确认",
    "实施批准关卡",
    "管理层决策",
  ]) {
    assert.match(reportsSource, new RegExp(text));
  }
  assert.match(reportsSource, /localizeReportHtml/);
});

test("mobile keeps clear and sample controls accessible", () => {
  assert.match(stylesSource, /\.top-actions\s*\{[^}]*grid-template-columns:\s*auto minmax\(0, 1fr\) minmax\(0, 1fr\)/s);
  assert.match(stylesSource, /\.top-actions > \.ghost\s*\{[^}]*display:\s*block/s);
});

test("direct PDF clone carries its own print-style formatting class", () => {
  assert.match(appSource, /clone\.classList\.add\("pdf-export-report"\)/);
  assert.match(stylesSource, /\.pdf-export-report\.report-sheet/);
  assert.match(stylesSource, /\.pdf-export-report \.report-meta/);
  assert.doesNotMatch(stylesSource, /\.pdf-export-stage \.report-sheet/);
});

test("workflow candidates use one required entry with optional expansion to three", () => {
  assert.match(appSource, /data-add-bottleneck/);
  assert.match(appSource, /data-remove-bottleneck/);
  assert.match(appSource, /bottlenecks\.length < 3/);
  assert.match(appSource, /Add another bottleneck \(optional\)/);
  assert.match(appSource, /Start with the single most important bottleneck/);
  assert.match(reportsSource, /candidateCount = state\.diagnostic\.bottlenecks\.length/);
});

test("header offers a confirmed clear-all action that creates blank client data", () => {
  assert.match(appSource, /data-clear/);
  assert.match(appSource, /Clear all data/);
  assert.match(appSource, /createEmptyState\(state\.language\)/);
  assert.match(appSource, /stageRatings = empty\.diagnostic\.stageRatings\.map\(\(\) => null\)/);
  assert.match(appSource, /empty\.diagnostic\.bottlenecks = \[blankWorkflowCandidate\(\)\]/);
  assert.match(appSource, /This cannot be undone/);
});
