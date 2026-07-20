import {
  calculateScore,
  estimateRevenueOpportunity,
  getStage,
} from "./scoring.js";
import { initialState, osKeys } from "./sample-data.js";
import { buildDetailedReports } from "./reports.js";

const STORAGE_KEY = "vimigo-transformation-demo-v2";
const workflowFields = [
  "issue",
  "impact",
  "trigger",
  "inputs",
  "aiTask",
  "humanApproval",
  "owner",
  "exceptions",
  "metric",
  "readiness",
  "risk",
];

function blankWorkflowCandidate() {
  return Object.fromEntries(workflowFields.map((field) => [field, ""]));
}
const copy = {
  en: {
    demo: "PUBLIC DEMO · DATA STAYS ON THIS DEVICE",
    title: "One evidence-led diagnosis. Six decision-ready reports.",
    subtitle:
      "A practical RM980 Transformation Day journey—from client input to a CSM-approved 90-day action map.",
    journey: "Journey",
    pre: "Pre-Diagnostic",
    diagnostic: "Onsite Diagnostic",
    plan: "90-Day Plan",
    reports: "Six Reports",
    start: "Start the client journey",
    score: "Transformation score",
    confidence: "Evidence confidence",
    stage: "Current stage",
    client: "Client before event",
    together: "Client + CSM onsite",
    management: "Management approval",
    csm: "CSM-controlled delivery",
    preTitle: "Client Pre-Diagnostic",
    preIntro:
      "Complete before Transformation Day. Do not enter employee, patient or medical data.",
    company: "Company name",
    industry: "Industry",
    participants: "Participants and roles",
    decisionMaker: "Final decision-maker",
    executionOwner: "90-day execution owner",
    direction: "Measurable 12-month direction",
    problem: "Most important business bottleneck",
    baseline: "Current baseline",
    target: "90-day target",
    dataSource: "Evidence source",
    monthlyVolume: "Monthly lead / transaction volume",
    conversionRate: "Current conversion rate (%)",
    targetConversionRate: "Target conversion rate (%)",
    averageValue: "Average transaction value (RM)",
    consent:
      "I confirm this information may be used for the Vimigo diagnosis and reviewed by the assigned CSM.",
    diagTitle: "Facilitated Diagnostic Workbook",
    diagIntro:
      "Read each explanation, compare the score anchors, then select the rating that best matches the company today.",
    stageAssessment: "Transformation maturity assessment",
    osAssessment: "Six OS maturity",
    evidenceNote: "Evidence note",
    evidenceSource: "Evidence source",
    planTitle: "Management-approved 90-Day Plan",
    planIntro:
      "Choose one primary next step. Optional later stages remain separate.",
    result: "90-day must-win result",
    weeklyAction: "Weekly key action",
    metric: "Measurement indicator",
    reward: "Reward / recognition",
    owner: "Accountable owner",
    product: "Primary Vimigo route",
    reason: "Why this route fits",
    expected: "Expected result",
    reviewDate: "Review date",
    continue: "Continue",
    save: "Saved on this device",
    required: "Please complete the highlighted required fields.",
    method: "Methodology",
    methodText:
      "Overall score = 40% maturity assessment + 60% Six OS average. Each 1–5 rating converts to 20–100.",
    evidenceText:
      "Confidence is Low below 50%, Medium at 50–79%, and High at 80% or above.",
    submit: "Save demo review pack",
    confirmed: "Saved on this device only - the CSM was not notified",
    reset: "Reload sample",
    clear: "Clear all data",
    print: "Print / Save this PDF",
    facts: "Verified client facts",
    assessment: "CSM assessment",
    hypothesis: "Hypothesis requiring validation",
    notQuantified:
      "Financial impact is not yet quantified because sufficient baseline data was not supplied.",
  },
  zh: {
    demo: "公开示范 · 资料只保存在此装置",
    title: "一次以证据为基础的诊断，产出六份可决策报告。",
    subtitle:
      "RM980 企业转型日实战流程：从客户输入，到 CSM 审核通过的 90 天行动地图。",
    journey: "流程总览",
    pre: "活动前诊断",
    diagnostic: "现场诊断",
    plan: "90天计划",
    reports: "六份报告",
    start: "开始客户流程",
    score: "企业转型总评分",
    confidence: "证据可信度",
    stage: "当前阶段",
    client: "客户活动前填写",
    together: "客户与 CSM 现场完成",
    management: "管理层确认",
    csm: "CSM 审核后交付",
    preTitle: "客户活动前诊断表",
    preIntro: "请在活动前完成。不要输入员工、病患或医疗敏感资料。",
    company: "公司名称",
    industry: "行业",
    participants: "参与者与职位",
    decisionMaker: "最终决策者",
    executionOwner: "90天执行负责人",
    direction: "可衡量的12个月方向",
    problem: "最重要的业务瓶颈",
    baseline: "当前基线",
    target: "90天目标",
    dataSource: "证据来源",
    monthlyVolume: "每月线索／交易数量",
    conversionRate: "当前转化率（%）",
    targetConversionRate: "目标转化率（%）",
    averageValue: "平均交易价值（RM）",
    consent: "我确认以上资料可用于 Vimigo 企业诊断，并由指定 CSM 审核。",
    diagTitle: "现场诊断工作表",
    diagIntro: "请阅读每项说明和评分标准，再选择最符合公司现况的分数。",
    stageAssessment: "企业转型成熟度",
    osAssessment: "六大 OS 成熟度",
    evidenceNote: "证据说明",
    evidenceSource: "证据来源",
    planTitle: "管理层确认的90天计划",
    planIntro: "只选择一个主要下一步；后续阶段必须分开说明。",
    result: "90天必须达成的结果",
    weeklyAction: "每周关键行动",
    metric: "衡量指标",
    reward: "奖励／认可",
    owner: "负责人",
    product: "主要 Vimigo 路径",
    reason: "为何适合",
    expected: "预期结果",
    reviewDate: "复盘日期",
    continue: "继续",
    save: "已保存在此装置",
    required: "请完成标示的必填项目。",
    method: "评分方法",
    methodText:
      "总分 = 40% 企业成熟度 + 60% 六大 OS 平均分。每个 1–5 评分转换为 20–100。",
    evidenceText:
      "证据可信度：低于50%为 Low，50–79%为 Medium，80%以上为 High。",
    submit: "保存示范审核资料",
    confirmed: "仅保存在此装置 - CSM 尚未收到通知",
    reset: "重新载入示范",
    clear: "清空所有资料",
    print: "打印／储存此报告",
    facts: "已核实的客户事实",
    assessment: "CSM 评估",
    hypothesis: "需要验证的假设",
    notQuantified: "由于客户未提供足够基线资料，目前无法量化财务影响。",
  },
};

const labels = {
  stages: {
    en: [
      "Owner dependence",
      "Process and SOP clarity",
      "KPI–action–owner–reward linkage",
      "Timely management data",
      "Governed AI workflows",
    ],
    zh: [
      "老板依赖程度",
      "流程与SOP清晰度",
      "KPI、行动、负责人和奖励连接",
      "管理数据及时性",
      "受治理的AI流程",
    ],
  },
  os: {
    direction: "Direction OS",
    performance: "Performance OS",
    money: "Money OS",
    reward: "Reward OS",
    talent: "Talent OS",
    aiExecution: "AI Execution OS",
  },
  stageNames: {
    en: {
      boss: "Boss-Driven",
      process: "Process-Driven",
      performance: "Performance-Driven",
      data: "Data-Driven",
      ai: "AI-Driven",
    },
    zh: {
      boss: "老板驱动",
      process: "流程驱动",
      performance: "绩效驱动",
      data: "数据驱动",
      ai: "AI驱动",
    },
  },
};

const assessmentGuidance = {
  stages: {
    en: [
      {
        title: "Owner dependence",
        description:
          "How much daily progress, decisions and problem-solving still depend on the owner personally.",
        one: "The business slows or stops without the owner.",
        three:
          "Managers handle routine work, but the owner still rescues important issues.",
        five: "The team runs through clear authority, ownership and escalation rules.",
      },
      {
        title: "Process and SOP clarity",
        description:
          "How clearly important work is documented, understood and followed across the company.",
        one: "Work depends on memory and individual habits.",
        three: "Some SOPs exist, but adoption and ownership are inconsistent.",
        five: "Critical SOPs are clear, used, owned and regularly improved.",
      },
      {
        title: "KPI-action-owner-reward linkage",
        description:
          "Whether every important result is connected to measurable actions, an accountable owner and a fair consequence or reward.",
        one: "KPIs, actions, ownership and rewards are disconnected.",
        three:
          "The links exist in some teams but are not reviewed consistently.",
        five: "Results, actions, owners and rewards are visibly linked and reviewed.",
      },
      {
        title: "Timely management data",
        description:
          "Whether leaders receive reliable information early enough to make decisions and correct performance.",
        one: "Data is late, incomplete or disputed.",
        three: "Reports exist but require manual work and arrive periodically.",
        five: "Decision-ready data is reliable, timely and used in management reviews.",
      },
      {
        title: "Governed AI workflows",
        description:
          "Whether AI-assisted work has approved data, clear human decisions, accountable owners, exception handling and audit evidence.",
        one: "AI use is absent or ad hoc with no controls.",
        three:
          "Pilots exist, but controls and ownership are only partly defined.",
        five: "AI workflows are governed, measured and operated with human approval.",
      },
    ],
    zh: [
      {
        title: "老板依赖程度",
        description:
          "公司日常推进、决策和解决问题，有多少仍必须由老板本人处理。",
        one: "老板不在，公司就放慢或停下来。",
        three: "主管可处理日常工作，但重要问题仍要老板救火。",
        five: "团队依据清楚的权限、责任和升级机制独立运作。",
      },
      {
        title: "流程与 SOP 清晰度",
        description: "关键工作是否被清楚记录、理解，并在公司内一致执行。",
        one: "工作依靠个人记忆和习惯。",
        three: "已有部分 SOP，但执行与责任人并不一致。",
        five: "关键 SOP 清楚、被采用、有负责人并持续改善。",
      },
      {
        title: "KPI、行动、负责人和奖励连接",
        description:
          "每个重要结果是否连接到可衡量行动、明确负责人，以及公平的结果或奖励。",
        one: "KPI、行动、责任和奖励彼此分开。",
        three: "部分团队已连接，但没有稳定复盘。",
        five: "结果、行动、负责人和奖励透明连接并定期复盘。",
      },
      {
        title: "管理数据及时性",
        description: "管理层能否及时取得可靠资料，用来决策和纠正表现。",
        one: "资料延迟、不完整或经常有争议。",
        three: "已有报告，但依赖人工整理并只在特定周期出现。",
        five: "资料可靠、及时，并真正用于管理复盘和决策。",
      },
      {
        title: "受治理的 AI 工作流程",
        description:
          "AI 工作是否具备获准数据、人工决策点、责任人、异常处理和审计证据。",
        one: "没有 AI，或只是零散使用且没有管控。",
        three: "已有试点，但管控和责任只定义了一部分。",
        five: "AI 流程有治理、可衡量，并保留人工批准。",
      },
    ],
  },
  os: {
    en: {
      direction: {
        title: "Direction OS",
        description:
          "Where exactly is the company going in the next 12 months, and what must be achieved in the next 90 days?",
        one: "Direction is unclear or exists only in the owner's head.",
        three:
          "Leaders know the direction, but team alignment and measures are uneven.",
        five: "Direction is measurable, cascaded into 90-day priorities and reviewed.",
      },
      performance: {
        title: "Performance OS",
        description:
          "How does the team convert goals into habits, key actions, results and accountability?",
        one: "Goals, actions and owners are not managed consistently.",
        three:
          "KPIs exist, but weekly execution and follow-through are uneven.",
        five: "Goals drive owned weekly actions, visible results and corrective reviews.",
      },
      money: {
        title: "Money OS",
        description:
          "Which actions truly affect revenue, margin, cash flow or operating cost?",
        one: "Commercial drivers are unknown or not measured.",
        three:
          "Financial numbers exist, but actions are weakly linked to outcomes.",
        five: "Key money drivers have baselines, owners, targets and regular reviews.",
      },
      reward: {
        title: "Reward OS",
        description:
          "What does an employee receive after achieving the agreed result, and is the rule transparent and fair?",
        one: "Rewards are unclear, subjective or disconnected from results.",
        three:
          "Some rewards are linked, but rules or consistency are incomplete.",
        five: "Rewards and recognition are transparent, fair and linked to results.",
      },
      talent: {
        title: "Talent OS",
        description:
          "Who owns the work, who fits each role, and who needs development?",
        one: "Roles, ownership and capability gaps are unclear.",
        three: "Roles exist, but fit, ownership or development is uneven.",
        five: "Role fit, accountable ownership and development priorities are clear.",
      },
      aiExecution: {
        title: "AI Execution OS",
        description:
          "What should AI do, what must remain human-owned, and how will exceptions and results be controlled?",
        one: "AI use is ad hoc with no approved workflow or control.",
        three:
          "AI pilots exist with partial data, approval and ownership rules.",
        five: "Governed AI workflows have owners, human approval, metrics and audit trails.",
      },
    },
    zh: {
      direction: {
        title: "方向 OS",
        description: "公司未来 12 个月要去哪里，接下来 90 天必须完成什么？",
        one: "方向不清楚，或只存在老板脑中。",
        three: "领导层知道方向，但团队对齐和衡量方式不一致。",
        five: "方向可衡量，并分解成 90 天优先事项和定期复盘。",
      },
      performance: {
        title: "绩效 OS",
        description: "团队如何把目标转化成习惯、关键行动、结果和责任？",
        one: "目标、行动和负责人没有被一致管理。",
        three: "已有 KPI，但每周执行和跟进不稳定。",
        five: "目标带动有负责人的每周行动、可见结果和纠偏复盘。",
      },
      money: {
        title: "金钱 OS",
        description: "哪些行动真正影响营收、利润、现金流或营运成本？",
        one: "不清楚商业驱动因素，也没有衡量。",
        three: "已有财务数字，但行动与结果的连接较弱。",
        five: "关键金钱驱动因素有基线、负责人、目标和定期复盘。",
      },
      reward: {
        title: "奖励 OS",
        description: "员工达成约定结果后会得到什么，规则是否透明和公平？",
        one: "奖励不清楚、主观，或与结果没有连接。",
        three: "部分奖励已连接，但规则或执行仍不完整。",
        five: "奖励与认可透明、公平，并与结果直接连接。",
      },
      talent: {
        title: "人才 OS",
        description: "谁负责工作、谁适合哪个岗位，以及谁需要发展？",
        one: "岗位、责任和能力缺口不清楚。",
        three: "已有岗位，但适配、责任或发展并不一致。",
        five: "岗位适配、责任人和发展优先事项都很清楚。",
      },
      aiExecution: {
        title: "AI 执行 OS",
        description:
          "哪些工作交给 AI、哪些必须由人负责，以及如何处理异常和衡量结果？",
        one: "AI 使用零散，没有获准流程或管控。",
        three: "已有 AI 试点，但数据、批准和责任规则只完成一部分。",
        five: "AI 流程有负责人、人工批准、指标和审计记录。",
      },
    },
  },
};

let state = loadState();
let validationError = "";
const app = document.querySelector("#app");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createEmptyState(language = "en") {
  const empty = clone(initialState);
  empty.language = language;
  empty.activeStep = "pre";
  empty.submitted = false;

  Object.keys(empty.pre).forEach((key) => {
    empty.pre[key] = typeof empty.pre[key] === "boolean" ? false : "";
  });

  empty.diagnostic.stageRatings = empty.diagnostic.stageRatings.map(() => null);
  empty.diagnostic.osRatings = Object.fromEntries(
    osKeys.map((key) => [key, null]),
  );
  empty.diagnostic.bottlenecks = [blankWorkflowCandidate()];

  Object.keys(empty.plan).forEach((key) => {
    if (key === "hypotheses") {
      empty.plan.hypotheses = empty.plan.hypotheses.map((item) =>
        Object.fromEntries(Object.keys(item).map((field) => [field, ""])),
      );
    } else {
      empty.plan[key] = typeof empty.plan[key] === "boolean" ? false : "";
    }
  });
  return empty;
}
function esc(value) {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ],
  );
}
function loadState() {
  try {
    const base = clone(initialState);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...base,
      ...saved,
      pre: { ...base.pre, ...(saved.pre || {}) },
      diagnostic: {
        ...base.diagnostic,
        ...(saved.diagnostic || {}),
        osRatings: {
          ...base.diagnostic.osRatings,
          ...(saved.diagnostic?.osRatings || {}),
        },
        bottlenecks:
          Array.isArray(saved.diagnostic?.bottlenecks) &&
          saved.diagnostic.bottlenecks.length
            ? saved.diagnostic.bottlenecks
                .slice(0, 3)
                .map((item) => ({ ...blankWorkflowCandidate(), ...item }))
            : base.diagnostic.bottlenecks,
      },
      plan: {
        ...base.plan,
        ...(saved.plan || {}),
        hypotheses: base.plan.hypotheses.map((item, index) => ({
          ...item,
          ...(saved.plan?.hypotheses?.[index] || {}),
        })),
      },
    };
  } catch {
    return clone(initialState);
  }
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function tr(key) {
  return copy[state.language][key] || key;
}
function setPath(path, value) {
  const parts = path.split(".");
  let cursor = state;
  parts.slice(0, -1).forEach((part) => {
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
  persist();
}
function metrics() {
  const ratings = [
    ...state.diagnostic.stageRatings,
    ...Object.values(state.diagnostic.osRatings),
  ];
  const assessed = ratings.every(
    (value) => Number(value) >= 1 && Number(value) <= 5,
  );
  const score = assessed
    ? calculateScore(
        state.diagnostic.stageRatings,
        state.diagnostic.osRatings,
      )
    : { maturity: 0, os: 0, overall: 0 };
  return {
    score,
    stageKey: assessed ? getStage(score.overall) : "boss",
    assessed,
  };
}

function brand() {
  return `<img src="https://vimigo.io/wp-content/uploads/2025/10/Logo.png" alt="Vimigo" width="257" height="58">`;
}
function header() {
  return `<header class="topbar"><a class="brand" href="#" data-step="journey">${brand()}<span>AI Transformation Day</span></a><div class="top-actions"><span class="demo-badge">${tr("demo")}</span><div class="lang-switch" aria-label="Language"><button data-lang="en" class="${state.language === "en" ? "active" : ""}">EN</button><button data-lang="zh" class="${state.language === "zh" ? "active" : ""}">中文</button></div><button class="ghost clear-data" data-clear>${tr("clear")}</button><button class="ghost" data-reset>${tr("reset")}</button></div></header>`;
}
function nav() {
  const items = [
    ["journey", "00", "journey"],
    ["pre", "01", "pre"],
    ["diagnostic", "02", "diagnostic"],
    ["plan", "03", "plan"],
    ["reports", "04", "reports"],
  ];
  return `<nav class="step-nav" aria-label="Journey">${items.map(([step, no, key]) => `<button data-step="${step}" class="${state.activeStep === step ? "active" : ""}"><small>${no}</small><span>${tr(key)}</span></button>`).join("")}</nav>`;
}
function layout(content) {
  return `${header()}${nav()}<main>${content}</main><footer class="site-footer">${brand()}<span>Diagnosis first · Human approval · Measurable execution</span></footer>`;
}
function input(path, label, options = {}) {
  const value = path.split(".").reduce((obj, key) => obj?.[key], state);
  const type = options.type || "text";
  const control = options.multiline
    ? `<textarea data-path="${path}" ${options.required ? "required" : ""}>${esc(value)}</textarea>`
    : `<input data-path="${path}" type="${type}" value="${esc(value)}" ${options.required ? "required" : ""} />`;
  return `<label class="field"><span>${esc(label)}${options.required ? " *" : ""}</span>${control}</label>`;
}
function screenHeader(number, title, intro) {
  return `<header class="screen-header"><span>${number}</span><div><p>VIMIGO AI TRANSFORMATION DAY</p><h1>${title}</h1><small>${intro}</small></div></header>`;
}

function journeyScreen() {
  const { score, stageKey, assessed } = metrics();
  const stageName = assessed
    ? labels.stageNames[state.language][stageKey]
    : state.language === "en"
      ? "Not assessed"
      : "尚未评估";
  return `<section class="hero"><div><p class="eyebrow">FROM DIAGNOSIS TO EXECUTION</p><h1>${tr("title")}</h1><p>${tr("subtitle")}</p><button class="primary" data-step="pre">${tr("start")} →</button></div><div class="score-orbit"><div><small>${tr("score")}</small><strong>${assessed ? score.overall : "—"}</strong><span>${assessed ? "/100" : ""}</span><b>${stageName}</b></div></div></section>
  <section class="journey-grid">${[
    ["01", tr("client"), tr("pre")],
    ["02", tr("together"), tr("diagnostic")],
    ["03", tr("management"), tr("plan")],
    ["04", tr("csm"), tr("reports")],
  ]
    .map(
      ([n, a, b]) =>
        `<article><span>${n}</span><small>${a}</small><h2>${b}</h2></article>`,
    )
    .join("")}</section>
  <section class="promise"><div><strong>6</strong><span>${state.language === "en" ? "personalised PDF report drafts generated from the completed form" : "根据已完成表格生成的六份个性化 PDF 报告草稿"}</span></div><p>${state.language === "en" ? "The reports use the answers entered in this case. Final client PDFs are exported only after CSM review and approval." : "报告内容来自本个案填写的资料。只有在 CSM 审核并批准后，系统才会导出最终客户 PDF。"}</p></section>`;
}

function preScreen() {
  return `<section class="page-shell">${screenHeader("01", tr("preTitle"), tr("preIntro"))}<form class="form-grid" data-form="pre">
  <fieldset><legend>A · ${tr("company")}</legend><div class="two-col">${input("pre.company", tr("company"), { required: true })}${input("pre.industry", tr("industry"), { required: true })}${input("pre.participants", tr("participants"), { required: true })}${input("pre.decisionMaker", tr("decisionMaker"), { required: true })}${input("pre.executionOwner", tr("executionOwner"), { required: true })}</div></fieldset>
  <fieldset><legend>B · Business direction</legend>${input("pre.direction", tr("direction"), { required: true, multiline: true })}${input("pre.problem", tr("problem"), { required: true, multiline: true })}<div class="two-col">${input("pre.baseline", tr("baseline"), { required: true })}${input("pre.target", tr("target"), { required: true })}${input("pre.dataSource", tr("dataSource"), { required: true })}</div></fieldset>
  <fieldset><legend>C · Baseline metrics</legend><div class="four-col">${input("pre.monthlyVolume", tr("monthlyVolume"), { type: "number" })}${input("pre.conversionRate", tr("conversionRate"), { type: "number" })}${input("pre.targetConversionRate", tr("targetConversionRate"), { type: "number" })}${input("pre.averageValue", tr("averageValue"), { type: "number" })}</div><p class="help">${state.language === "en" ? "Financial opportunity is calculated only when sufficient baseline data is supplied." : "只有在提供足够基线数据时，系统才会估算财务机会。"}</p></fieldset>
  <label class="consent"><input type="checkbox" data-path="pre.consent" ${state.pre.consent ? "checked" : ""}/><span>${tr("consent")}</span></label>${formFooter("diagnostic")}</form></section>`;
}

function ratingRow(guidance, path) {
  const rating = path.split(".").reduce((obj, key) => obj?.[key], state);
  const selectLabel =
    state.language === "en"
      ? "Select the score that best matches the current reality"
      : "请选择最符合公司现况的评分";
  return `<article class="rating-row"><div class="rating-question"><strong>${esc(guidance.title)}</strong><p class="assessment-definition">${esc(guidance.description)}</p><div class="score-anchors"><span><b>1</b>${esc(guidance.one)}</span><span><b>3</b>${esc(guidance.three)}</span><span><b>5</b>${esc(guidance.five)}</span></div><small class="select-score-label">${selectLabel}</small><div class="rating-buttons">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-rating-path="${path}" data-value="${n}" class="${Number(rating) === n ? "active" : ""}" aria-label="${esc(guidance.title)} ${n}">${n}</button>`).join("")}</div></div></article>`;
}

function workflowCandidateForm(item, index) {
  const base = `diagnostic.bottlenecks.${index}`;
  const removeLabel =
    state.language === "en"
      ? `Remove bottleneck ${index + 1}`
      : `删除瓶颈 ${index + 1}`;
  const candidateTitle =
    state.language === "en"
      ? index === 0
        ? "Primary AI workflow candidate"
        : "Additional AI workflow candidate"
      : index === 0
        ? "首要 AI 工作流程候选"
        : "额外 AI 工作流程候选";
  const candidateNote =
    state.language === "en"
      ? index === 0
        ? "Required - begin with the most important bottleneck"
        : "Optional - include only if this is a distinct bottleneck"
      : index === 0
        ? "必填——从最重要的瓶颈开始"
        : "选填——仅添加不同且重要的瓶颈";
  return `<section class="workflow-candidate-form"><header><span>0${index + 1}</span><div><b>${candidateTitle}</b><small>${candidateNote}</small></div>${index > 0 ? `<button type="button" class="ghost remove-candidate" data-remove-bottleneck="${index}" aria-label="${removeLabel}">${state.language === "en" ? "Remove" : "删除"}</button>` : ""}</header><div class="two-col">${input(`${base}.issue`, "Business problem", { required: true })}${input(`${base}.impact`, "Business impact", { required: true })}${input(`${base}.trigger`, "Workflow trigger", { required: true })}${input(`${base}.inputs`, "Required inputs / data", { required: true, multiline: true })}${input(`${base}.aiTask`, "Proposed AI task", { required: true, multiline: true })}${input(`${base}.humanApproval`, "Human approval point", { required: true, multiline: true })}${input(`${base}.owner`, "Accountable owner", { required: true })}${input(`${base}.exceptions`, "Exception route", { required: true, multiline: true })}${input(`${base}.metric`, "Success metric", { required: true })}${input(`${base}.readiness`, "Readiness assessment", { required: true })}${input(`${base}.risk`, "Primary risk", { required: true, multiline: true })}</div></section>`;
}

function diagnosticScreen() {
  const { score, stageKey, assessed } = metrics();
  const guide = assessmentGuidance;
  const stageName = assessed
    ? labels.stageNames[state.language][stageKey]
    : state.language === "en"
      ? "Not assessed"
      : "尚未评估";
  const scoringIntro =
    state.language === "en"
      ? "Use the descriptions below before choosing. A higher score always means the capability is more established, repeatable and less dependent on individuals."
      : "请先阅读每项说明再评分。分数越高，代表该能力越成熟、越能重复执行，也越不依赖个人。";
  const canAddBottleneck = state.diagnostic.bottlenecks.length < 3;
  const remainingSlots = 3 - state.diagnostic.bottlenecks.length;
  const addButton = canAddBottleneck
    ? `<button type="button" class="add-candidate" data-add-bottleneck><span>＋</span>${state.language === "en" ? "Add another bottleneck (optional)" : "添加另一个瓶颈（选填）"}<small>${state.language === "en" ? `${remainingSlots} additional slot${remainingSlots === 1 ? "" : "s"} available` : `还可添加 ${remainingSlots} 项`}</small></button>`
    : `<p class="candidate-limit">${state.language === "en" ? "Maximum of three bottlenecks reached." : "已达到最多三个瓶颈。"}</p>`;
  return `<section class="page-shell">${screenHeader("02", tr("diagTitle"), tr("diagIntro"))}<div class="diagnostic-summary"><div><span>${tr("score")}</span><strong>${assessed ? `${score.overall}/100` : "—"}</strong></div><div><span>${tr("stage")}</span><strong>${stageName}</strong></div></div><div class="assessment-intro"><b>${state.language === "en" ? "How to answer" : "评分方法"}</b><p>${scoringIntro}</p><span>1 = ${state.language === "en" ? "weak / absent" : "薄弱／没有"}</span><span>3 = ${state.language === "en" ? "partly established" : "部分建立"}</span><span>5 = ${state.language === "en" ? "embedded and consistent" : "成熟并稳定执行"}</span></div><form data-form="diagnostic"><fieldset><legend>A · ${tr("stageAssessment")}</legend>${guide.stages[state.language].map((item, index) => ratingRow(item, `diagnostic.stageRatings.${index}`)).join("")}</fieldset><fieldset><legend>B · ${tr("osAssessment")}</legend>${osKeys.map((key) => ratingRow(guide.os[state.language][key], `diagnostic.osRatings.${key}`)).join("")}</fieldset><fieldset><legend>C · ${state.language === "en" ? "Business bottlenecks and AI workflow candidates (up to 3)" : "业务瓶颈与 AI 工作流程候选（最多 3 项）"}</legend><p class="help">${state.language === "en" ? "Start with the single most important bottleneck. Add a second or third only when each is distinct and useful. Every added candidate must be completed before continuing." : "先填写一个最重要的瓶颈。只有在其他瓶颈明确且有价值时，才添加第二或第三项。每个已添加的候选都必须填写完整后才能继续。"}</p>${state.diagnostic.bottlenecks.map(workflowCandidateForm).join("")}${addButton}</fieldset>${formFooter("plan")}</form></section>`;
}

function hypothesisForm(item, index) {
  const base = `plan.hypotheses.${index}`;
  return `<section class="hypothesis-form"><span>0${index + 1}</span><div class="two-col">${input(`${base}.opportunity`, "Business-model opportunity", { required: true })}${input(`${base}.assumption`, "Assumption requiring validation", { required: true, multiline: true })}${input(`${base}.upside`, "Expected upside", { required: true, multiline: true })}${input(`${base}.validation`, "Validation action", { required: true, multiline: true })}${input(`${base}.metric`, "Validation metric", { required: true })}</div></section>`;
}

function planScreen() {
  const products = [
    "Vimigo for CEO 5.0",
    "Vimigo For Team 2.0",
    "CVO Program",
    "Vimigo for AI Team",
    "Starter Workspace",
  ];
  return `<section class="page-shell">${screenHeader("03", tr("planTitle"), tr("planIntro"))}<form data-form="plan"><fieldset><legend>A · 90-Day execution</legend>${input("plan.result", tr("result"), { required: true, multiline: true })}<div class="two-col">${input("plan.weeklyAction", tr("weeklyAction"), { required: true, multiline: true })}${input("plan.metric", tr("metric"), { required: true })}${input("plan.reward", tr("reward"), { required: true })}${input("plan.owner", tr("owner"), { required: true })}</div><div class="roadmap">${[1, 30, 60, 90].map((day) => input(`plan.day${day}`, `Day ${day}`, { required: true, multiline: true })).join("")}</div></fieldset><fieldset><legend>B · One primary next move</legend><label class="field"><span>${tr("product")} *</span><select data-path="plan.primaryProduct" required><option value="" ${state.plan.primaryProduct ? "" : "selected"} disabled>${state.language === "en" ? "Select a primary route" : "请选择主要路径"}</option>${products.map((p) => `<option ${state.plan.primaryProduct === p ? "selected" : ""}>${p}</option>`).join("")}</select></label>${input("plan.productReason", tr("reason"), { required: true, multiline: true })}${input("plan.expectedResult", tr("expected"), { required: true, multiline: true })}<div class="two-col">${input("plan.reviewDate", tr("reviewDate"), { type: "date", required: true })}${input("plan.owner", tr("owner"), { required: true })}</div></fieldset><fieldset><legend>C · Business-model opportunities</legend><p class="help">Maximum three opportunities. Each must state the assumption, expected upside, validation action and metric.</p>${state.plan.hypotheses.slice(0, 3).map(hypothesisForm).join("")}</fieldset>${formFooter("reports", true)}</form></section>`;
}

function reportHeader(number, title, subtitle) {
  return `<header class="report-head"><span>${number}</span><div><small>CONFIDENTIAL · CSM APPROVAL REQUIRED</small><h2>${title}</h2><p>${subtitle}</p></div><button class="ghost" data-download-report="${number}">Download PDF</button></header>`;
}
function factStrip() {
  return `<div class="source-legend"><span><i class="fact"></i>${tr("facts")}</span><span><i class="assess"></i>${tr("assessment")}</span><span><i class="hyp"></i>${tr("hypothesis")}</span></div>`;
}
function reportsScreen() {
  const { score, confidence, stageKey } = metrics();
  const stageName = labels.stageNames[state.language][stageKey];
  const opportunity = estimateRevenueOpportunity(state.pre);
  const sortedOs = osKeys
    .map((key) => ({ key, value: state.diagnostic.osRatings[key] }))
    .sort((a, b) => a.value - b.value);
  const reports = [
    `<article class="report-sheet" data-report="01">${reportHeader("01", "AI Transformation Score Report", state.pre.company)}${factStrip()}<div class="report-score"><strong>${score.overall}</strong><span>/100</span><b>${stageName}</b></div><div class="breakdown"><p>Maturity assessment <b>${score.maturity}/100 · 40%</b></p><p>Six OS average <b>${score.os}/100 · 60%</b></p><p>${tr("confidence")} <b>${confidence.level.toUpperCase()} · ${confidence.percentage}%</b></p></div><aside class="method"><b>${tr("method")}</b><p>${tr("methodText")}</p><p>${tr("evidenceText")}</p></aside><div class="mechanism"><b>${tr("facts")}</b><p>${esc(state.pre.problem)}</p><b>${tr("assessment")}</b><p>${esc(state.plan.primaryProduct)} → ${esc(state.plan.expectedResult)} → ${esc(state.plan.metric)} → ${esc(state.pre.target)}</p></div></article>`,
    `<article class="report-sheet" data-report="02">${reportHeader("02", "Current Transformation Stage Report", stageName)}${factStrip()}<div class="stage-banner"><small>${tr("stage")}</small><strong>${stageName}</strong><p>${state.language === "en" ? "The company is building the link between goals, weekly execution, reliable data and accountable ownership." : "公司正建立目标、每周执行、可靠数据与责任人的连接。"}</p></div><h3>Evidence supporting this stage</h3><ul>${state.diagnostic.stageEvidence.map((item) => `<li>${esc(item.note)} <small>— ${esc(item.source)}</small></li>`).join("")}</ul><h3>Requirements for the next stage</h3><p>${esc(state.plan.weeklyAction)} Measure through ${esc(state.plan.metric)}.</p></article>`,
    `<article class="report-sheet" data-report="03">${reportHeader("03", "Six OS Gap Radar Report", `${tr("confidence")}: ${confidence.level.toUpperCase()}`)}${factStrip()}<div class="os-bars">${osKeys.map((key) => `<div><span>${labels.os[key]}</span><i><b style="width:${state.diagnostic.osRatings[key] * 20}%"></b></i><strong>${state.diagnostic.osRatings[key]}/5</strong></div>`).join("")}</div><h3>Priority gaps</h3><div class="three-cards">${sortedOs
      .slice(0, 3)
      .map(
        ({ key, value }) =>
          `<section><b>${labels.os[key]} · ${value}/5</b><p>${esc(state.diagnostic.osEvidence[key].note)}</p><small>${esc(state.diagnostic.osEvidence[key].source)}</small></section>`,
      )
      .join("")}</div></article>`,
    `<article class="report-sheet" data-report="04">${reportHeader("04", "Top Three AI Workflow Priority Report", "Candidate workflows · not yet implemented")}${factStrip()}<div class="workflow-reports">${state.diagnostic.bottlenecks.map((b, index) => `<section><span>0${index + 1}</span><h3>${esc(b.issue)}</h3><dl><dt>Business impact</dt><dd>${esc(b.impact)}</dd><dt>AI task</dt><dd>Classify, summarise and recommend the next action using approved business rules.</dd><dt>Human approval</dt><dd>${esc(b.owner)} approves exceptions and customer-facing actions.</dd><dt>Success metric</dt><dd>${index === 0 ? esc(state.plan.metric) : "Baseline and 90-day target to be validated"}</dd></dl><p class="warning">Candidate only—implementation readiness, data access and risk controls require validation.</p></section>`).join("")}</div></article>`,
    `<article class="report-sheet" data-report="05">${reportHeader("05", "90-Day AI Performance Transformation Master Plan", state.pre.direction)}${factStrip()}<div class="target-card"><small>90-DAY MUST-WIN RESULT</small><h3>${esc(state.plan.result)}</h3><p><b>${tr("owner")}:</b> ${esc(state.plan.owner)} · <b>${tr("metric")}:</b> ${esc(state.plan.metric)}</p><p><b>${tr("reward")}:</b> ${esc(state.plan.reward)}</p></div><div class="timeline">${[1, 30, 60, 90].map((day) => `<section><strong>Day ${day}</strong><p>${esc(state.plan[`day${day}`])}</p></section>`).join("")}</div><aside class="method"><b>Weekly review</b><p>${esc(state.plan.weeklyAction)}</p></aside></article>`,
    `<article class="report-sheet" data-report="06">${reportHeader("06", "Business Model & Vimigo Product-Matching Report", `Primary route: ${state.plan.primaryProduct}`)}${factStrip()}<div class="primary-route"><small>ONE PRIMARY NEXT MOVE</small><h3>${esc(state.plan.primaryProduct)}</h3><p><b>Why:</b> ${esc(state.plan.productReason)}</p><p><b>Expected result:</b> ${esc(state.plan.expectedResult)}</p><p><b>${tr("owner")}:</b> ${esc(state.plan.owner)} · <b>${tr("reviewDate")}:</b> ${esc(state.plan.reviewDate)}</p></div><h3>Business-model hypotheses</h3><div class="three-cards">${state.plan.hypotheses
      .slice(0, 3)
      .map(
        (item) =>
          `<section><b>${esc(item.opportunity)}</b><p>${esc(item.assumption)}</p><small>Validate: ${esc(item.validation)} · Metric: ${esc(item.metric)}</small></section>`,
      )
      .join(
        "",
      )}</div><aside class="financial"><b>Financial opportunity</b><p>${opportunity === null ? tr("notQuantified") : `Indicative monthly revenue opportunity: RM ${opportunity.toLocaleString()}. This is a hypothesis, not a guaranteed result.`}</p></aside></article>`,
  ];
  return `<section class="reports-shell">${screenHeader("04", tr("reports"), state.language === "en" ? "Six separate drafts. CSM review and approval are mandatory before delivery." : "六份独立草稿。交付前必须由 CSM 审核批准。")}${state.submitted ? `<div class="confirmation">✓ ${tr("confirmed")}</div>` : ""}<div class="report-index">${reports.map((_, i) => `<a href="#report-${i + 1}">0${i + 1}</a>`).join("")}</div>${reports.map((report, i) => report.replace('class="report-sheet"', `id="report-${i + 1}" class="report-sheet"`)).join("")}<div class="submit-bar"><div><b>${state.submitted ? tr("confirmed") : "CSM REVIEW GATE"}</b><p>${state.language === "en" ? "Nothing is released automatically. Delivery remains manual during the pilot." : "系统不会自动发送报告。试点期间由 CSM 手动交付。"}</p></div><button class="primary" data-submit ${state.submitted ? "disabled" : ""}>${tr("submit")}</button></div></section>`;
}

function detailedReportsScreen() {
  const { score, stageKey, assessed } = metrics();
  return buildDetailedReports({
    state,
    score,
    stageKey,
    stageName: assessed
      ? labels.stageNames[state.language][stageKey]
      : state.language === "en"
        ? "Not assessed"
        : "尚未评估",
    opportunity: estimateRevenueOpportunity(state.pre),
    guidance: assessmentGuidance,
    osKeys,
    t: tr,
  });
}

function formFooter(next, final = false) {
  return `${validationError ? `<p class="form-error">${tr("required")}</p>` : ""}<footer class="form-footer"><span>✓ ${tr("save")}</span><button type="button" class="primary" data-continue="${next}" data-final="${final}">${tr("continue")} →</button></footer>`;
}
function render() {
  document.documentElement.lang = state.language === "zh" ? "zh-Hans" : "en";
  const screens = {
    journey: journeyScreen,
    pre: preScreen,
    diagnostic: diagnosticScreen,
    plan: planScreen,
    reports: detailedReportsScreen,
  };
  app.innerHTML = layout(screens[state.activeStep]());
}

function safeFileName(value, fallback = "Vimigo report") {
  const cleaned = String(value || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();
  return (cleaned || fallback).slice(0, 100);
}

async function downloadReportPdf(reportNumber, button) {
  const status = app.querySelector("[data-download-status]");
  const originalMarkup = button.innerHTML;
  let stage;

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  try {
    if (!window.html2pdf) {
      throw new Error("The PDF generator did not load. Please refresh and try again.");
    }

    const report = app.querySelector(`[data-report="${reportNumber}"]`);
    if (!report) {
      throw new Error(`Report ${reportNumber} was not found.`);
    }

    const matchingButtons = [
      ...app.querySelectorAll(`[data-download-report="${reportNumber}"]`),
    ];
    matchingButtons.forEach((item) => {
      item.disabled = true;
    });
    const company = safeFileName(state.pre.company, "Client company");
    const title = safeFileName(
      report.querySelector(".report-head h2")?.textContent,
      `Report ${reportNumber}`,
    );

    button.textContent = `Creating PDF ${reportNumber}...`;
    setStatus(`Preparing ${reportNumber} - ${title}`);

    stage = document.createElement("div");
    stage.className = "pdf-export-stage";
    const clone = report.cloneNode(true);
    clone.classList.add("pdf-export-report");
    clone.removeAttribute("id");
    clone.querySelectorAll("button").forEach((item) => item.remove());
    stage.append(clone);
    document.body.append(stage);

    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: [7, 7, 9, 7],
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            ".report-head",
            ".report-meta",
            ".finding-grid > div",
            ".priority-list section",
            ".workflow-detail",
            ".decision-box",
            "tr",
          ],
        },
      })
      .from(clone)
      .outputPdf("blob");

    const downloadUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${reportNumber} - ${title} - ${company}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    setStatus(`Complete: Report ${reportNumber} downloaded as a PDF.`);
  } catch (error) {
    console.error(error);
    setStatus(`Download failed: ${error.message}`);
  } finally {
    if (stage) stage.remove();
    app
      .querySelectorAll(`[data-download-report="${reportNumber}"]`)
      .forEach((item) => {
        item.disabled = false;
      });
    button.innerHTML = originalMarkup;
  }
}
function validate(step) {
  const hypothesisFields = [
    "opportunity",
    "assumption",
    "upside",
    "validation",
    "metric",
  ];
  const required = {
    pre: [
      state.pre.company,
      state.pre.industry,
      state.pre.participants,
      state.pre.decisionMaker,
      state.pre.executionOwner,
      state.pre.direction,
      state.pre.problem,
      state.pre.baseline,
      state.pre.target,
      state.pre.dataSource,
      state.pre.consent,
    ],
    diagnostic: [
      ...state.diagnostic.stageRatings,
      ...Object.values(state.diagnostic.osRatings),
      ...state.diagnostic.bottlenecks.flatMap((item) =>
        workflowFields.map((field) => item[field]),
      ),
    ],
    plan: [
      state.plan.result,
      state.plan.weeklyAction,
      state.plan.metric,
      state.plan.reward,
      state.plan.owner,
      state.plan.day1,
      state.plan.day30,
      state.plan.day60,
      state.plan.day90,
      state.plan.primaryProduct,
      state.plan.productReason,
      state.plan.expectedResult,
      state.plan.reviewDate,
      ...state.plan.hypotheses
        .slice(0, 3)
        .flatMap((item) => hypothesisFields.map((field) => item[field])),
    ],
  };
  return (required[step] || []).every((value) => String(value ?? "").trim());
}
app.addEventListener("input", (event) => {
  const path = event.target.dataset.path;
  if (!path) return;
  const value =
    event.target.type === "number"
      ? Number(event.target.value)
      : event.target.value;
  setPath(path, value);
});
app.addEventListener("change", (event) => {
  const path = event.target.dataset.path;
  if (!path) return;
  setPath(
    path,
    event.target.type === "checkbox"
      ? event.target.checked
      : event.target.value,
  );
  if (event.target.type === "checkbox" || event.target.tagName === "SELECT")
    render();
});
app.addEventListener("click", (event) => {
  if (event.target.closest("[data-add-bottleneck]")) {
    if (state.diagnostic.bottlenecks.length < 3) {
      state.diagnostic.bottlenecks.push(blankWorkflowCandidate());
      persist();
      render();
      requestAnimationFrame(() => {
        app
          .querySelectorAll(".workflow-candidate-form")
          .item(state.diagnostic.bottlenecks.length - 1)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    return;
  }
  const removeBottleneck = event.target.closest("[data-remove-bottleneck]");
  if (removeBottleneck && state.diagnostic.bottlenecks.length > 1) {
    const index = Number(removeBottleneck.dataset.removeBottleneck);
    const label = state.diagnostic.bottlenecks[index]?.issue || `0${index + 1}`;
    const confirmed = window.confirm(
      state.language === "en"
        ? `Remove this optional bottleneck?\n\n${label}`
        : `确定删除这个选填瓶颈吗？\n\n${label}`,
    );
    if (confirmed) {
      state.diagnostic.bottlenecks.splice(index, 1);
      persist();
      render();
    }
    return;
  }
  const downloadReportButton = event.target.closest("[data-download-report]");
  if (downloadReportButton) {
    downloadReportPdf(
      downloadReportButton.dataset.downloadReport,
      downloadReportButton,
    );
    return;
  }
  const lang = event.target.closest("[data-lang]")?.dataset.lang;
  if (lang) {
    state.language = lang;
    persist();
    render();
    return;
  }
  if (event.target.closest("[data-clear]")) {
    const confirmed = window.confirm(
      state.language === "en"
        ? "Clear all saved answers and start a blank client form? This cannot be undone."
        : "确定清空所有已保存资料并开始新的空白客户表格吗？此操作无法撤销。",
    );
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY);
      state = createEmptyState(state.language);
      validationError = "";
      persist();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }
  if (event.target.closest("[data-reset]")) {
    localStorage.removeItem(STORAGE_KEY);
    state = clone(initialState);
    render();
    return;
  }
  const step = event.target.closest("[data-step]")?.dataset.step;
  if (step) {
    event.preventDefault();
    state.activeStep = step;
    validationError = "";
    persist();
    render();
    window.scrollTo({ top: 0 });
    return;
  }
  const rating = event.target.closest("[data-rating-path]");
  if (rating) {
    setPath(rating.dataset.ratingPath, Number(rating.dataset.value));
    render();
    return;
  }
  const next = event.target.closest("[data-continue]")?.dataset.continue;
  if (next) {
    const activeForm = app.querySelector(`[data-form="${state.activeStep}"]`);
    const visibleFormIsValid = activeForm
      ? [...activeForm.querySelectorAll("[required]")].every((field) =>
          field.type === "checkbox"
            ? field.checked
            : String(field.value ?? "").trim(),
        )
      : true;
    if (!visibleFormIsValid || !validate(state.activeStep)) {
      validationError = tr("required");
      render();
      return;
    }
    validationError = "";
    state.activeStep = next;
    persist();
    render();
    window.scrollTo({ top: 0 });
    return;
  }
  if (event.target.closest("[data-submit]")) {
    state.submitted = true;
    persist();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
render();
