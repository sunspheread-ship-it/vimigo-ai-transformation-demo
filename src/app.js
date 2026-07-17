import { calculateEvidenceConfidence, calculateScore, estimateRevenueOpportunity, getStage } from "./scoring.js";
import { initialState, osKeys } from "./sample-data.js";

const STORAGE_KEY = "vimigo-transformation-demo-v2";
const copy = {
  en: {
    demo: "PUBLIC DEMO · DATA STAYS ON THIS DEVICE",
    title: "One evidence-led diagnosis. Six decision-ready reports.",
    subtitle: "A practical RM980 Transformation Day journey—from client input to a CSM-approved 90-day action map.",
    journey: "Journey", pre: "Pre-Diagnostic", diagnostic: "Onsite Diagnostic", plan: "90-Day Plan", reports: "Six Reports",
    start: "Start the client journey", score: "Transformation score", confidence: "Evidence confidence", stage: "Current stage",
    client: "Client before event", together: "Client + CSM onsite", management: "Management approval", csm: "CSM-controlled delivery",
    preTitle: "Client Pre-Diagnostic", preIntro: "Complete before Transformation Day. Do not enter employee, patient or medical data.",
    company: "Company name", industry: "Industry", participants: "Participants and roles", decisionMaker: "Final decision-maker", executionOwner: "90-day execution owner",
    direction: "Measurable 12-month direction", problem: "Most important business bottleneck", baseline: "Current baseline", target: "90-day target", dataSource: "Evidence source",
    monthlyVolume: "Monthly lead / transaction volume", conversionRate: "Current conversion rate (%)", targetConversionRate: "Target conversion rate (%)", averageValue: "Average transaction value (RM)",
    consent: "I confirm this information may be used for the Vimigo diagnosis and reviewed by the assigned CSM.",
    diagTitle: "Facilitated Diagnostic Workbook", diagIntro: "Every rating requires an evidence note or source. Missing evidence lowers confidence, not the rating.",
    stageAssessment: "Transformation maturity assessment", osAssessment: "Six OS maturity", evidenceNote: "Evidence note", evidenceSource: "Evidence source",
    planTitle: "Management-approved 90-Day Plan", planIntro: "Choose one primary next step. Optional later stages remain separate.",
    result: "90-day must-win result", weeklyAction: "Weekly key action", metric: "Measurement indicator", reward: "Reward / recognition", owner: "Accountable owner",
    product: "Primary Vimigo route", reason: "Why this route fits", expected: "Expected result", reviewDate: "Review date",
    workspace: "Starter Workspace has been commercially confirmed", workspaceName: "Workspace name",
    continue: "Continue", save: "Saved on this device", required: "Please complete the highlighted required fields.",
    method: "Methodology", methodText: "Overall score = 40% maturity assessment + 60% Six OS average. Each 1–5 rating converts to 20–100.",
    evidenceText: "Confidence is Low below 50%, Medium at 50–79%, and High at 80% or above.",
    submit: "Confirm for CSM review", confirmed: "Submission confirmed for CSM review", reset: "Reload sample", print: "Print / Save this PDF",
    facts: "Verified client facts", assessment: "CSM assessment", hypothesis: "Hypothesis requiring validation", notQuantified: "Financial impact is not yet quantified because sufficient baseline data was not supplied.",
  },
  zh: {
    demo: "公开示范 · 资料只保存在此装置",
    title: "一次以证据为基础的诊断，产出六份可决策报告。",
    subtitle: "RM980 企业转型日实战流程：从客户输入，到 CSM 审核通过的 90 天行动地图。",
    journey: "流程总览", pre: "活动前诊断", diagnostic: "现场诊断", plan: "90天计划", reports: "六份报告",
    start: "开始客户流程", score: "企业转型总评分", confidence: "证据可信度", stage: "当前阶段",
    client: "客户活动前填写", together: "客户与 CSM 现场完成", management: "管理层确认", csm: "CSM 审核后交付",
    preTitle: "客户活动前诊断表", preIntro: "请在活动前完成。不要输入员工、病患或医疗敏感资料。",
    company: "公司名称", industry: "行业", participants: "参与者与职位", decisionMaker: "最终决策者", executionOwner: "90天执行负责人",
    direction: "可衡量的12个月方向", problem: "最重要的业务瓶颈", baseline: "当前基线", target: "90天目标", dataSource: "证据来源",
    monthlyVolume: "每月线索／交易数量", conversionRate: "当前转化率（%）", targetConversionRate: "目标转化率（%）", averageValue: "平均交易价值（RM）",
    consent: "我确认以上资料可用于 Vimigo 企业诊断，并由指定 CSM 审核。",
    diagTitle: "现场诊断工作表", diagIntro: "每项评分必须附证据说明或来源。缺少证据只会降低可信度，不会暗中更改评分。",
    stageAssessment: "企业转型成熟度", osAssessment: "六大 OS 成熟度", evidenceNote: "证据说明", evidenceSource: "证据来源",
    planTitle: "管理层确认的90天计划", planIntro: "只选择一个主要下一步；后续阶段必须分开说明。",
    result: "90天必须达成的结果", weeklyAction: "每周关键行动", metric: "衡量指标", reward: "奖励／认可", owner: "负责人",
    product: "主要 Vimigo 路径", reason: "为何适合", expected: "预期结果", reviewDate: "复盘日期",
    workspace: "Starter Workspace 已获得商业确认", workspaceName: "Workspace 名称",
    continue: "继续", save: "已保存在此装置", required: "请完成标示的必填项目。",
    method: "评分方法", methodText: "总分 = 40% 企业成熟度 + 60% 六大 OS 平均分。每个 1–5 评分转换为 20–100。",
    evidenceText: "证据可信度：低于50%为 Low，50–79%为 Medium，80%以上为 High。",
    submit: "确认交给 CSM 审核", confirmed: "已确认交给 CSM 审核", reset: "重新载入示范", print: "打印／储存此报告",
    facts: "已核实的客户事实", assessment: "CSM 评估", hypothesis: "需要验证的假设", notQuantified: "由于客户未提供足够基线资料，目前无法量化财务影响。",
  },
};

const labels = {
  stages: {
    en: ["Owner dependence", "Process and SOP clarity", "KPI–action–owner–reward linkage", "Timely management data", "Governed AI workflows"],
    zh: ["老板依赖程度", "流程与SOP清晰度", "KPI、行动、负责人和奖励连接", "管理数据及时性", "受治理的AI流程"],
  },
  os: {
    direction: "Direction OS", performance: "Performance OS", money: "Money OS", reward: "Reward OS", talent: "Talent OS", aiExecution: "AI Execution OS",
  },
  stageNames: {
    en: { boss: "Boss-Driven", process: "Process-Driven", performance: "Performance-Driven", data: "Data-Driven", ai: "AI-Driven" },
    zh: { boss: "老板驱动", process: "流程驱动", performance: "绩效驱动", data: "数据驱动", ai: "AI驱动" },
  },
};

let state = loadState();
let validationError = "";
const app = document.querySelector("#app");

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function loadState() {
  try { return { ...clone(initialState), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return clone(initialState); }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function tr(key) { return copy[state.language][key] || key; }
function setPath(path, value) {
  const parts = path.split("."); let cursor = state;
  parts.slice(0, -1).forEach((part) => { cursor = cursor[part]; });
  cursor[parts.at(-1)] = value;
  persist();
}
function evidenceItems() { return [...state.diagnostic.stageEvidence, ...osKeys.map((key) => state.diagnostic.osEvidence[key])]; }
function metrics() {
  const score = calculateScore(state.diagnostic.stageRatings, state.diagnostic.osRatings);
  const confidence = calculateEvidenceConfidence(evidenceItems());
  return { score, confidence, stageKey: getStage(score.overall) };
}

function brand() { return `<span class="brand-mark"><i></i><i></i><i></i></span><strong>vimigo</strong>`; }
function header() {
  return `<header class="topbar"><a class="brand" href="#" data-step="journey">${brand()}<span>AI Transformation Day</span></a><div class="top-actions"><span class="demo-badge">${tr("demo")}</span><div class="lang-switch" aria-label="Language"><button data-lang="en" class="${state.language === "en" ? "active" : ""}">EN</button><button data-lang="zh" class="${state.language === "zh" ? "active" : ""}">中文</button></div><button class="ghost" data-reset>${tr("reset")}</button></div></header>`;
}
function nav() {
  const items = [["journey", "00", "journey"], ["pre", "01", "pre"], ["diagnostic", "02", "diagnostic"], ["plan", "03", "plan"], ["reports", "04", "reports"]];
  return `<nav class="step-nav" aria-label="Journey">${items.map(([step, no, key]) => `<button data-step="${step}" class="${state.activeStep === step ? "active" : ""}"><small>${no}</small><span>${tr(key)}</span></button>`).join("")}</nav>`;
}
function layout(content) { return `${header()}${nav()}<main>${content}</main><footer class="site-footer">${brand()}<span>Diagnosis first · Human approval · Measurable execution</span></footer>`; }
function input(path, label, options = {}) {
  const value = path.split(".").reduce((obj, key) => obj?.[key], state);
  const type = options.type || "text";
  const control = options.multiline
    ? `<textarea data-path="${path}" ${options.required ? "required" : ""}>${esc(value)}</textarea>`
    : `<input data-path="${path}" type="${type}" value="${esc(value)}" ${options.required ? "required" : ""} />`;
  return `<label class="field"><span>${esc(label)}${options.required ? " *" : ""}</span>${control}</label>`;
}
function screenHeader(number, title, intro) { return `<header class="screen-header"><span>${number}</span><div><p>VIMIGO AI TRANSFORMATION DAY</p><h1>${title}</h1><small>${intro}</small></div></header>`; }

function journeyScreen() {
  const { score, confidence, stageKey } = metrics();
  return `<section class="hero"><div><p class="eyebrow">FROM DIAGNOSIS TO EXECUTION</p><h1>${tr("title")}</h1><p>${tr("subtitle")}</p><button class="primary" data-step="pre">${tr("start")} →</button></div><div class="score-orbit"><div><small>${tr("score")}</small><strong>${score.overall}</strong><span>/100</span><b>${labels.stageNames[state.language][stageKey]}</b></div><aside><span>${tr("confidence")}</span><strong>${confidence.level.toUpperCase()}</strong><small>${confidence.percentage}% evidence supplied</small></aside></div></section>
  <section class="journey-grid">${[["01",tr("client"),tr("pre")],["02",tr("together"),tr("diagnostic")],["03",tr("management"),tr("plan")],["04",tr("csm"),tr("reports")]].map(([n,a,b])=>`<article><span>${n}</span><small>${a}</small><h2>${b}</h2></article>`).join("")}</section>
  <section class="promise"><div><strong>6</strong><span>${state.language === "en" ? "separate bilingual PDF deliverables" : "份独立双语 PDF 成果"}</span></div><p>${state.language === "en" ? "No performance figure is shown unless it comes from client data or cited evidence." : "除非数据来自客户输入或明确证据，否则报告不会显示任何绩效数字。"}</p></section>`;
}

function preScreen() {
  return `<section class="page-shell">${screenHeader("01", tr("preTitle"), tr("preIntro"))}<form class="form-grid" data-form="pre">
  <fieldset><legend>A · ${tr("company")}</legend><div class="two-col">${input("pre.company",tr("company"),{required:true})}${input("pre.industry",tr("industry"),{required:true})}${input("pre.participants",tr("participants"),{required:true})}${input("pre.decisionMaker",tr("decisionMaker"),{required:true})}${input("pre.executionOwner",tr("executionOwner"),{required:true})}</div></fieldset>
  <fieldset><legend>B · Business direction</legend>${input("pre.direction",tr("direction"),{required:true,multiline:true})}${input("pre.problem",tr("problem"),{required:true,multiline:true})}<div class="two-col">${input("pre.baseline",tr("baseline"),{required:true})}${input("pre.target",tr("target"),{required:true})}${input("pre.dataSource",tr("dataSource"),{required:true})}</div></fieldset>
  <fieldset><legend>C · Baseline metrics</legend><div class="four-col">${input("pre.monthlyVolume",tr("monthlyVolume"),{type:"number"})}${input("pre.conversionRate",tr("conversionRate"),{type:"number"})}${input("pre.targetConversionRate",tr("targetConversionRate"),{type:"number"})}${input("pre.averageValue",tr("averageValue"),{type:"number"})}</div><p class="help">${state.language === "en" ? "Financial opportunity is calculated only when sufficient baseline data is supplied." : "只有在提供足够基线数据时，系统才会估算财务机会。"}</p></fieldset>
  <label class="consent"><input type="checkbox" data-path="pre.consent" ${state.pre.consent ? "checked" : ""}/><span>${tr("consent")}</span></label>${formFooter("diagnostic")}</form></section>`;
}

function ratingRow(label, path, evidence, evidencePath) {
  const rating = path.split(".").reduce((obj,key)=>obj?.[key],state);
  return `<article class="rating-row"><div><strong>${esc(label)}</strong><div class="rating-buttons">${[1,2,3,4,5].map(n=>`<button type="button" data-rating-path="${path}" data-value="${n}" class="${Number(rating)===n?"active":""}" aria-label="${esc(label)} ${n}">${n}</button>`).join("")}</div></div><div class="evidence-fields">${input(`${evidencePath}.note`,tr("evidenceNote"),{required:true})}${input(`${evidencePath}.source`,tr("evidenceSource"),{required:true})}</div></article>`;
}
function diagnosticScreen() {
  const { score, confidence, stageKey } = metrics();
  return `<section class="page-shell">${screenHeader("02",tr("diagTitle"),tr("diagIntro"))}<div class="diagnostic-summary"><div><span>${tr("score")}</span><strong>${score.overall}/100</strong></div><div><span>${tr("stage")}</span><strong>${labels.stageNames[state.language][stageKey]}</strong></div><div><span>${tr("confidence")}</span><strong>${confidence.level.toUpperCase()} · ${confidence.percentage}%</strong></div></div><form data-form="diagnostic"><fieldset><legend>A · ${tr("stageAssessment")}</legend>${labels.stages[state.language].map((label,index)=>ratingRow(label,`diagnostic.stageRatings.${index}`,state.diagnostic.stageEvidence[index],`diagnostic.stageEvidence.${index}`)).join("")}</fieldset><fieldset><legend>B · ${tr("osAssessment")}</legend>${osKeys.map(key=>ratingRow(labels.os[key],`diagnostic.osRatings.${key}`,state.diagnostic.osEvidence[key],`diagnostic.osEvidence.${key}`)).join("")}</fieldset>${formFooter("plan")}</form></section>`;
}

function planScreen() {
  const products=["Vimigo for CEO 5.0","Vimigo For Team 2.0","CVO Program","Vimigo for AI Team","Starter Workspace"];
  return `<section class="page-shell">${screenHeader("03",tr("planTitle"),tr("planIntro"))}<form data-form="plan"><fieldset><legend>A · 90-Day execution</legend>${input("plan.result",tr("result"),{required:true,multiline:true})}<div class="two-col">${input("plan.weeklyAction",tr("weeklyAction"),{required:true,multiline:true})}${input("plan.metric",tr("metric"),{required:true})}${input("plan.reward",tr("reward"),{required:true})}${input("plan.owner",tr("owner"),{required:true})}</div><div class="roadmap">${[1,30,60,90].map(day=>input(`plan.day${day}`,`Day ${day}`,{required:true,multiline:true})).join("")}</div></fieldset><fieldset><legend>B · One primary next move</legend><label class="field"><span>${tr("product")} *</span><select data-path="plan.primaryProduct">${products.map(p=>`<option ${state.plan.primaryProduct===p?"selected":""}>${p}</option>`).join("")}</select></label>${input("plan.productReason",tr("reason"),{required:true,multiline:true})}${input("plan.expectedResult",tr("expected"),{required:true,multiline:true})}<div class="two-col">${input("plan.reviewDate",tr("reviewDate"),{type:"date",required:true})}${input("plan.owner",tr("owner"),{required:true})}</div></fieldset><fieldset><legend>C · Starter Workspace gate</legend><label class="consent"><input type="checkbox" data-path="plan.workspaceConfirmed" ${state.plan.workspaceConfirmed?"checked":""}/><span>${tr("workspace")}</span></label>${state.plan.workspaceConfirmed?input("plan.workspaceName",tr("workspaceName"),{required:true}):`<p class="help">${state.language==="en"?"Workspace setup remains hidden until commercial activation is confirmed.":"只有在商业启动确认后，Workspace 设置才会开放。"}</p>`}</fieldset>${formFooter("reports",true)}</form></section>`;
}

function reportHeader(number,title,subtitle){return `<header class="report-head"><span>${number}</span><div><small>CONFIDENTIAL · CSM APPROVAL REQUIRED</small><h2>${title}</h2><p>${subtitle}</p></div><button class="ghost" data-print="${number}">${tr("print")}</button></header>`;}
function factStrip(){return `<div class="source-legend"><span><i class="fact"></i>${tr("facts")}</span><span><i class="assess"></i>${tr("assessment")}</span><span><i class="hyp"></i>${tr("hypothesis")}</span></div>`;}
function reportsScreen(){
  const {score,confidence,stageKey}=metrics(); const stageName=labels.stageNames[state.language][stageKey];
  const opportunity=estimateRevenueOpportunity(state.pre); const sortedOs=osKeys.map(key=>({key,value:state.diagnostic.osRatings[key]})).sort((a,b)=>a.value-b.value);
  const reports=[
    `<article class="report-sheet" data-report="01">${reportHeader("01","AI Transformation Score Report",state.pre.company)}${factStrip()}<div class="report-score"><strong>${score.overall}</strong><span>/100</span><b>${stageName}</b></div><div class="breakdown"><p>Maturity assessment <b>${score.maturity}/100 · 40%</b></p><p>Six OS average <b>${score.os}/100 · 60%</b></p><p>${tr("confidence")} <b>${confidence.level.toUpperCase()} · ${confidence.percentage}%</b></p></div><aside class="method"><b>${tr("method")}</b><p>${tr("methodText")}</p><p>${tr("evidenceText")}</p></aside><div class="mechanism"><b>${tr("facts")}</b><p>${esc(state.pre.problem)}</p><b>${tr("assessment")}</b><p>${esc(state.plan.primaryProduct)} → ${esc(state.plan.expectedResult)} → ${esc(state.plan.metric)} → ${esc(state.pre.target)}</p></div></article>`,
    `<article class="report-sheet" data-report="02">${reportHeader("02","Current Transformation Stage Report",stageName)}${factStrip()}<div class="stage-banner"><small>${tr("stage")}</small><strong>${stageName}</strong><p>${state.language==="en"?"The company is building the link between goals, weekly execution, reliable data and accountable ownership.":"公司正建立目标、每周执行、可靠数据与责任人的连接。"}</p></div><h3>Evidence supporting this stage</h3><ul>${state.diagnostic.stageEvidence.map(item=>`<li>${esc(item.note)} <small>— ${esc(item.source)}</small></li>`).join("")}</ul><h3>Requirements for the next stage</h3><p>${esc(state.plan.weeklyAction)} Measure through ${esc(state.plan.metric)}.</p></article>`,
    `<article class="report-sheet" data-report="03">${reportHeader("03","Six OS Gap Radar Report",`${tr("confidence")}: ${confidence.level.toUpperCase()}`)}${factStrip()}<div class="os-bars">${osKeys.map(key=>`<div><span>${labels.os[key]}</span><i><b style="width:${state.diagnostic.osRatings[key]*20}%"></b></i><strong>${state.diagnostic.osRatings[key]}/5</strong></div>`).join("")}</div><h3>Priority gaps</h3><div class="three-cards">${sortedOs.slice(0,3).map(({key,value})=>`<section><b>${labels.os[key]} · ${value}/5</b><p>${esc(state.diagnostic.osEvidence[key].note)}</p><small>${esc(state.diagnostic.osEvidence[key].source)}</small></section>`).join("")}</div></article>`,
    `<article class="report-sheet" data-report="04">${reportHeader("04","Top Three AI Workflow Priority Report","Candidate workflows · not yet implemented")}${factStrip()}<div class="workflow-reports">${state.diagnostic.bottlenecks.map((b,index)=>`<section><span>0${index+1}</span><h3>${esc(b.issue)}</h3><dl><dt>Business impact</dt><dd>${esc(b.impact)}</dd><dt>AI task</dt><dd>Classify, summarise and recommend the next action using approved business rules.</dd><dt>Human approval</dt><dd>${esc(b.owner)} approves exceptions and customer-facing actions.</dd><dt>Success metric</dt><dd>${index===0?esc(state.plan.metric):"Baseline and 90-day target to be validated"}</dd></dl><p class="warning">Candidate only—implementation readiness, data access and risk controls require validation.</p></section>`).join("")}</div></article>`,
    `<article class="report-sheet" data-report="05">${reportHeader("05","90-Day AI Performance Transformation Master Plan",state.pre.direction)}${factStrip()}<div class="target-card"><small>90-DAY MUST-WIN RESULT</small><h3>${esc(state.plan.result)}</h3><p><b>${tr("owner")}:</b> ${esc(state.plan.owner)} · <b>${tr("metric")}:</b> ${esc(state.plan.metric)}</p><p><b>${tr("reward")}:</b> ${esc(state.plan.reward)}</p></div><div class="timeline">${[1,30,60,90].map(day=>`<section><strong>Day ${day}</strong><p>${esc(state.plan[`day${day}`])}</p></section>`).join("")}</div><aside class="method"><b>Weekly review</b><p>${esc(state.plan.weeklyAction)}</p></aside></article>`,
    `<article class="report-sheet" data-report="06">${reportHeader("06","Business Model & Vimigo Product-Matching Report",`Primary route: ${state.plan.primaryProduct}`)}${factStrip()}<div class="primary-route"><small>ONE PRIMARY NEXT MOVE</small><h3>${esc(state.plan.primaryProduct)}</h3><p><b>Why:</b> ${esc(state.plan.productReason)}</p><p><b>Expected result:</b> ${esc(state.plan.expectedResult)}</p><p><b>${tr("owner")}:</b> ${esc(state.plan.owner)} · <b>${tr("reviewDate")}:</b> ${esc(state.plan.reviewDate)}</p></div><h3>Business-model hypotheses</h3><div class="three-cards">${state.plan.hypotheses.slice(0,3).map(item=>`<section><b>${esc(item.opportunity)}</b><p>${esc(item.assumption)}</p><small>Validate: ${esc(item.validation)} · Metric: ${esc(item.metric)}</small></section>`).join("")}</div><aside class="financial"><b>Financial opportunity</b><p>${opportunity===null?tr("notQuantified"):`Indicative monthly revenue opportunity: RM ${opportunity.toLocaleString()}. This is a hypothesis, not a guaranteed result.`}</p></aside></article>`,
  ];
  return `<section class="reports-shell">${screenHeader("04",tr("reports"),state.language==="en"?"Six separate drafts. CSM review and approval are mandatory before delivery.":"六份独立草稿。交付前必须由 CSM 审核批准。")}${state.submitted?`<div class="confirmation">✓ ${tr("confirmed")}</div>`:""}<div class="report-index">${reports.map((_,i)=>`<a href="#report-${i+1}">0${i+1}</a>`).join("")}</div>${reports.map((report,i)=>report.replace("class=\"report-sheet\"",`id="report-${i+1}" class="report-sheet"`)).join("")}<div class="submit-bar"><div><b>${state.submitted?tr("confirmed"):"CSM REVIEW GATE"}</b><p>${state.language==="en"?"Nothing is released automatically. Delivery remains manual during the pilot.":"系统不会自动发送报告。试点期间由 CSM 手动交付。"}</p></div><button class="primary" data-submit ${state.submitted?"disabled":""}>${tr("submit")}</button></div></section>`;
}

function formFooter(next,final=false){return `${validationError?`<p class="form-error">${tr("required")}</p>`:""}<footer class="form-footer"><span>✓ ${tr("save")}</span><button type="button" class="primary" data-continue="${next}" data-final="${final}">${tr("continue")} →</button></footer>`;}
function render(){
  document.documentElement.lang=state.language==="zh"?"zh-Hans":"en";
  const screens={journey:journeyScreen,pre:preScreen,diagnostic:diagnosticScreen,plan:planScreen,reports:reportsScreen};
  app.innerHTML=layout(screens[state.activeStep]());
}
function validate(step){
  const required={pre:[state.pre.company,state.pre.industry,state.pre.participants,state.pre.decisionMaker,state.pre.executionOwner,state.pre.direction,state.pre.problem,state.pre.baseline,state.pre.target,state.pre.dataSource,state.pre.consent],diagnostic:evidenceItems().map(item=>item.note||item.source),plan:[state.plan.result,state.plan.weeklyAction,state.plan.metric,state.plan.reward,state.plan.owner,state.plan.day1,state.plan.day30,state.plan.day60,state.plan.day90,state.plan.primaryProduct,state.plan.productReason,state.plan.expectedResult,state.plan.reviewDate]};
  if(step==="plan"&&state.plan.workspaceConfirmed) required.plan.push(state.plan.workspaceName);
  return (required[step]||[]).every(value=>String(value??"").trim());
}
app.addEventListener("input",(event)=>{
  const path=event.target.dataset.path; if(!path)return;
  const value=event.target.type==="number"?Number(event.target.value):event.target.value; setPath(path,value);
});
app.addEventListener("change",(event)=>{
  const path=event.target.dataset.path; if(!path)return;
  setPath(path,event.target.type==="checkbox"?event.target.checked:event.target.value);
  if(event.target.type==="checkbox"||event.target.tagName==="SELECT")render();
});
app.addEventListener("click",(event)=>{
  const lang=event.target.closest("[data-lang]")?.dataset.lang;
  if(lang){state.language=lang;persist();render();return;}
  if(event.target.closest("[data-reset]")){localStorage.removeItem(STORAGE_KEY);state=clone(initialState);render();return;}
  const step=event.target.closest("[data-step]")?.dataset.step;
  if(step){event.preventDefault();state.activeStep=step;validationError="";persist();render();window.scrollTo({top:0});return;}
  const rating=event.target.closest("[data-rating-path]");
  if(rating){setPath(rating.dataset.ratingPath,Number(rating.dataset.value));render();return;}
  const next=event.target.closest("[data-continue]")?.dataset.continue;
  if(next){if(!validate(state.activeStep)){validationError=tr("required");render();return;}validationError="";state.activeStep=next;persist();render();window.scrollTo({top:0});return;}
  const report=event.target.closest("[data-print]")?.dataset.print;
  if(report){document.body.dataset.printReport=report;window.print();delete document.body.dataset.printReport;return;}
  if(event.target.closest("[data-submit]")){state.submitted=true;persist();render();window.scrollTo({top:0,behavior:"smooth"});}
});
window.addEventListener("afterprint",()=>delete document.body.dataset.printReport);
render();
