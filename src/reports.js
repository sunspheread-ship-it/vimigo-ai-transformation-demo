const esc = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ],
  );

const stageProfiles = {
  boss: {
    en: "The owner decides, chases and rescues most important work. Knowledge and authority remain concentrated.",
    zh: "老板仍负责大部分重要决策、追踪与救火，知识和权限高度集中。",
  },
  process: {
    en: "Core processes are emerging, but ownership, performance linkage and management data are not yet consistently connected.",
    zh: "核心流程已经开始建立，但责任、绩效连接和管理数据仍未稳定连结。",
  },
  performance: {
    en: "Goals, key actions, results, accountability and rewards are becoming connected through a management rhythm.",
    zh: "目标、关键行动、结果、责任与奖励正通过管理节奏逐步连接。",
  },
  data: {
    en: "Management uses timely information to review performance, correct variance and make operating decisions.",
    zh: "管理层使用及时资料复盘绩效、纠正偏差并作出营运决策。",
  },
  ai: {
    en: "Governed AI workflows assist execution while people retain judgement, relationships and final accountability.",
    zh: "受治理的 AI 流程协助执行，同时由人保留判断、关系处理和最终责任。",
  },
};

const nextStageRequirements = {
  boss: [
    "Document the critical repeatable processes.",
    "Assign decision rights and accountable owners.",
    "Create a weekly review with visible exceptions.",
  ],
  process: [
    "Connect goals to weekly key actions and named owners.",
    "Define result metrics, baselines and corrective-action rules.",
    "Connect fair recognition or rewards to verified results.",
  ],
  performance: [
    "Standardise data definitions and reporting cut-offs.",
    "Create timely exception visibility for management.",
    "Use data consistently for review, correction and resource decisions.",
  ],
  data: [
    "Select narrow, repeatable workflows with reliable data.",
    "Define AI tasks, human approval, exceptions and audit evidence.",
    "Pilot, measure and approve scaling only after risk validation.",
  ],
  ai: [
    "Strengthen governance, auditability and exception learning.",
    "Review workflow value, risk and human accountability quarterly.",
    "Scale only the workflows that show verified operating benefit.",
  ],
};

const osImpact = {
  direction:
    "Unclear priorities spread management attention and make trade-offs inconsistent.",
  performance:
    "Weak execution linkage creates activity without dependable accountability or results.",
  money:
    "Teams may optimise activity without knowing its effect on revenue, margin, cash or cost.",
  reward:
    "Inconsistent recognition weakens trust and reduces reinforcement of the right behaviour.",
  talent:
    "Unclear role fit and capability gaps increase owner intervention and execution variance.",
  aiExecution:
    "Uncontrolled AI use creates quality, privacy, accountability and adoption risk.",
};

const r = (language, en, zh) => (language === "zh" ? zh : en);
const score100 = (rating) => Number(rating || 0) * 20;
const pending = (language) =>
  r(language, "Requires CSM validation", "需要 CSM 验证");

function reportHeader(number, title, subtitle) {
  return `<header class="report-head"><span>${number}</span><div><small>CONFIDENTIAL · GENERATED FROM THIS CASE · CSM APPROVAL REQUIRED</small><h2>${title}</h2><p>${esc(subtitle)}</p></div><button class="ghost" data-print="${number}">Preview / Save draft PDF</button></header>`;
}

function reportMeta(state, language) {
  const status = state.submitted
    ? r(
        language,
        "Submitted for CSM review - not approved",
        "已提交 CSM 审核，但尚未批准",
      )
    : r(language, "Draft - CSM approval required", "草稿 - 必须由 CSM 批准");
  return `<div class="report-meta"><span><b>${r(language, "Company", "公司")}</b>${esc(state.pre.company)}</span><span><b>${r(language, "Industry", "行业")}</b>${esc(state.pre.industry)}</span><span><b>${r(language, "Version", "版本")}</b>0.1</span><span><b>${r(language, "Status", "状态")}</b>${status}</span><span><b>${r(language, "Review date", "复盘日期")}</b>${esc(state.plan.reviewDate || pending(language))}</span></div>`;
}

function factStrip(t) {
  return `<div class="source-legend"><span><i class="fact"></i>${t.facts}</span><span><i class="assess"></i>${t.assessment}</span><span><i class="hyp"></i>${t.hypothesis}</span></div>`;
}

function section(title, intro = "") {
  return `<header class="report-section-head"><h3>${title}</h3>${intro ? `<p>${intro}</p>` : ""}</header>`;
}

function table(headers, rows, className = "") {
  return `<div class="detail-table-wrap"><table class="detail-table ${className}"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function reportFooter(number, state, language) {
  return `<footer class="report-footer"><span>Vimigo AI Transformation Day · Report ${number} of 6</span><span>${esc(state.pre.company)} · Version 0.1</span><span>${r(language, "Confidential · Release only after CSM approval", "机密 · 仅限 CSM 批准后发布")}</span></footer>`;
}

function mechanismChain(state, language) {
  const steps = [
    [r(language, "Current bottleneck", "当前瓶颈"), state.pre.problem],
    [r(language, "Vimigo mechanism", "Vimigo 机制"), state.plan.primaryProduct],
    [
      r(language, "Changed employee behaviour", "员工行为改变"),
      state.plan.weeklyAction,
    ],
    [r(language, "Measurable indicator", "衡量指标"), state.plan.metric],
    [r(language, "90-day target", "90 天目标"), state.pre.target],
  ];
  return `<div class="mechanism-chain">${steps.map(([label, value], index) => `<div><small>${index + 1} · ${label}</small><b>${esc(value || pending(language))}</b></div>`).join("")}</div>`;
}

function detailedScoreReport(ctx) {
  const { state, score, stageName, guidance, osKeys, language, t } = ctx;
  const interpretation = (item, rating) =>
    rating <= 2 ? item.one : rating >= 5 ? item.five : item.three;
  const stageRows = guidance.stages[language].map((item, index) => {
    const rating = state.diagnostic.stageRatings[index];
    return [
      esc(item.title),
      `<b>${rating}/5</b><small>${score100(rating)}/100</small>`,
      esc(interpretation(item, rating)),
    ];
  });
  const osRows = osKeys.map((key) => [
    esc(guidance.os[language][key].title),
    `<b>${state.diagnostic.osRatings[key]}/5</b><small>${score100(state.diagnostic.osRatings[key])}/100</small>`,
    esc(guidance.os[language][key].description),
  ]);
  const constraints = [
    ...guidance.stages[language].map((item, index) => ({
      name: item.title,
      rating: state.diagnostic.stageRatings[index],
      impact: item.description,
    })),
    ...osKeys.map((key) => ({
      name: guidance.os[language][key].title,
      rating: state.diagnostic.osRatings[key],
      impact: osImpact[key],
    })),
  ]
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 3);
  return `<article class="report-sheet detailed-report" data-report="01">${reportHeader("01", "AI Transformation Score Report", state.pre.company)}${reportMeta(state, language)}${factStrip(t)}<div class="score-hero"><div><small>${r(language, "Overall transformation score", "企业转型总评分")}</small><strong>${score.overall}</strong><span>/100</span><b>${stageName}</b></div><p>${r(language, "The score indicates the current operating maturity; it does not guarantee future performance. Recommendations require CSM review and client validation.", "此评分反映当前营运成熟度，并不保证未来绩效。所有建议必须经过 CSM 审核与客户验证。")}</p></div><div class="breakdown"><p>Maturity assessment <b>${score.maturity}/100 · 40%</b></p><p>Six OS average <b>${score.os}/100 · 60%</b></p></div>${section(r(language, "Executive interpretation", "执行摘要"))}<div class="finding-grid"><div class="fact-card"><small>${t.facts}</small><b>${esc(state.pre.problem)}</b><p>${esc(state.pre.baseline)} → ${esc(state.pre.target)}</p><em>${esc(state.pre.dataSource)}</em></div><div class="assessment-card"><small>${t.assessment}</small><b>${stageName} · ${score.overall}/100</b><p>${r(language, "The immediate constraint is consistent execution, ownership and timely correction across the selected workflow.", "当前主要限制是所选流程中的一致执行、明确责任与及时纠偏。")}</p></div><div class="hypothesis-card"><small>${t.hypothesis}</small><b>${esc(state.plan.primaryProduct)}</b><p>${esc(state.plan.expectedResult)}</p><em>${r(language, "Validate during the 90-day plan", "须在 90 天计划中验证")}</em></div></div>${section(r(language, "Transformation maturity component detail", "转型成熟度评分明细"), r(language, "The report uses the rating selected during the facilitated workshop.", "报告采用现场引导工作坊中选择的评分。"))}${table(["Dimension", "Score", "Current interpretation"], stageRows)}${section(r(language, "Six OS component detail", "六大 OS 评分明细"))}${table(["Operating system", "Score", "Management question"], osRows)}${section(r(language, "Top three performance constraints", "三大绩效限制"))}<div class="priority-list">${constraints.map((item, index) => `<section><span>0${index + 1}</span><div><b>${esc(item.name)} · ${item.rating}/5</b><p><strong>${t.assessment}:</strong> ${esc(item.impact)}</p></div></section>`).join("")}</div>${section(r(language, "How Vimigo is expected to increase performance", "Vimigo 如何提升绩效"), r(language, "This is a proposed causal chain, not a guaranteed outcome.", "这是建议的因果链，并非保证结果。"))}${mechanismChain(state, language)}${section(r(language, "Method, limitations and approval decisions", "方法、限制与批准事项"))}<div class="two-detail-columns"><aside class="method"><b>Methodology</b><p>Overall score = 40% maturity assessment + 60% Six OS average. Each 1-5 rating converts to 20-100.</p></aside><aside class="decision-box"><b>CSM must confirm before release</b><ul><li>The selected ratings match the workshop discussion.</li><li>Baseline and target definitions are comparable.</li><li>The three constraints reflect management priorities.</li><li>Projected outcomes are labelled as hypotheses.</li></ul></aside></div>${reportFooter("01", state, language)}</article>`;
}

function stageReport(ctx) {
  const { state, stageKey, stageName, guidance, language, t } = ctx;
  const stageRows = guidance.stages[language].map((item, index) => {
    const rating = state.diagnostic.stageRatings[index];
    const interpretation =
      rating <= 2 ? item.one : rating >= 5 ? item.five : item.three;
    return [esc(item.title), `<b>${rating}/5</b>`, esc(interpretation)];
  });
  const blockers = guidance.stages[language]
    .map((item, index) => ({
      item,
      index,
      rating: state.diagnostic.stageRatings[index],
    }))
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 3);
  const requirements = nextStageRequirements[stageKey];
  return `<article class="report-sheet detailed-report" data-report="02">${reportHeader("02", "Current Transformation Stage Report", stageName)}${reportMeta(state, language)}${factStrip(t)}<div class="stage-banner"><small>${r(language, "Current transformation stage", "当前转型阶段")}</small><strong>${stageName}</strong><p>${stageProfiles[stageKey][language]}</p></div>${section(r(language, "Maturity profile", "成熟度分析"))}${table(["Dimension", "Rating", "Current interpretation"], stageRows)}${section(r(language, "Three blockers holding back the next stage", "阻碍进入下一阶段的三大因素"))}<div class="three-cards">${blockers.map(({ item, index, rating }) => { const interpretation = rating <= 2 ? item.one : rating >= 5 ? item.five : item.three; return `<section><small>PRIORITY ${index + 1}</small><b>${esc(item.title)} · ${rating}/5</b><p>${esc(interpretation)}</p></section>`; }).join("")}</div>${section(r(language, "Requirements before progressing", "进入下一阶段前的要求"), r(language, "These are CSM conclusions based on the maturity model and require management agreement.", "以下为 CSM 根据成熟度模型作出的结论，必须获得管理层同意。"))}<ol class="requirement-list">${requirements.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>${section(r(language, "30-day stage-readiness actions", "30 天阶段准备行动"))}${table(
    ["Action", "Accountable owner", "Completion indicator", "Review point"],
    [
      [
        esc(state.plan.day1),
        esc(state.pre.executionOwner),
        "Definitions, owners and source list approved",
        "Day 1",
      ],
      [
        esc(state.plan.weeklyAction),
        esc(state.plan.owner),
        `Weekly review record using ${esc(state.plan.metric)}`,
        "Weekly",
      ],
      [
        esc(state.plan.day30),
        esc(state.plan.owner),
        "First operating result and exception log",
        "Day 30",
      ],
    ],
  )}<aside class="decision-box"><b>${r(language, "Stage decision", "阶段决定")}</b><p>${r(language, "Do not move the company to a higher stage until the required operating results are consistently demonstrated.", "在持续展现所需营运结果前，不应把公司列为更高阶段。")}</p></aside>${reportFooter("02", state, language)}</article>`;
}

function osReport(ctx) {
  const { state, guidance, osKeys, language, t } = ctx;
  const ranked = osKeys
    .map((key) => ({ key, rating: state.diagnostic.osRatings[key] }))
    .sort((a, b) => a.rating - b.rating);
  const rows = osKeys.map((key) => [
    esc(guidance.os[language][key].title),
    `<b>${state.diagnostic.osRatings[key]}/5</b><small>${score100(state.diagnostic.osRatings[key])}/100</small>`,
    esc(guidance.os[language][key].description),
    esc(osImpact[key]),
  ]);
  return `<article class="report-sheet detailed-report" data-report="03">${reportHeader("03", "Six OS Gap Radar Report", r(language, "Six operating systems scored from 1 to 5", "六大营运系统按 1 至 5 分评分"))}${reportMeta(state, language)}${factStrip(t)}<div class="os-bars">${osKeys.map((key) => `<div><span>${esc(guidance.os[language][key].title)}</span><i><b style="width:${state.diagnostic.osRatings[key] * 20}%"></b></i><strong>${state.diagnostic.osRatings[key]}/5</strong></div>`).join("")}</div>${section(r(language, "Six OS diagnostic detail", "六大 OS 诊断明细"))}${table(["OS", "Score", "Management question", "Likely business impact"], rows)}${section(r(language, "First three OS areas requiring attention", "优先改善的三大 OS"))}<div class="priority-list">${ranked
    .slice(0, 3)
    .map(({ key, rating }, index) => {
      const hypothesis = state.plan.hypotheses[index];
      return `<section><span>0${index + 1}</span><div><b>${esc(guidance.os[language][key].title)} · ${rating}/5</b><p><strong>Gap:</strong> ${esc(osImpact[key])}</p><p><strong>90-day validation action:</strong> ${esc(hypothesis?.validation || pending(language))}</p><p><strong>Owner:</strong> ${esc(state.diagnostic.bottlenecks[index]?.owner || state.plan.owner)} · <strong>Metric:</strong> ${esc(hypothesis?.metric || state.plan.metric)}</p></div></section>`;
    })
    .join(
      "",
    )}</div>${section(r(language, "Cross-OS dependency analysis", "跨 OS 依赖分析"))}<div class="dependency-grid"><div><b>Direction → Performance</b><p>Priorities must become owned weekly actions before the strategy can affect results.</p></div><div><b>Performance → Money</b><p>Actions must connect to commercial drivers before improvement can be quantified.</p></div><div><b>Reward → Talent</b><p>Fair reinforcement and role clarity are required to sustain the expected behaviour.</p></div><div><b>AI Execution → All OS</b><p>AI should strengthen existing operating systems through governed workflows, not operate as a separate seventh system.</p></div></div>${reportFooter("03", state, language)}</article>`;
}

function workflowReport(ctx) {
  const { state, language, t } = ctx;
  const candidateCount = state.diagnostic.bottlenecks.length;
  const portfolioRows = state.diagnostic.bottlenecks.map((item, index) => [
    `0${index + 1}`,
    esc(item.issue),
    esc(item.owner),
    esc(item.readiness),
    esc(item.metric),
    esc(item.risk),
  ]);
  const cards = state.diagnostic.bottlenecks
    .map(
      (item, index) =>
        `<section class="workflow-detail"><header><span>0${index + 1}</span><div><small>${t.hypothesis} · NOT IMPLEMENTED</small><h3>${esc(item.issue)}</h3><p>${esc(item.impact)}</p></div></header>${table(
          ["Governance field", "Structured draft"],
          [
            ["Business result", esc(item.impact)],
            ["Trigger", esc(item.trigger)],
            ["Required inputs", esc(item.inputs)],
            ["Proposed AI task", esc(item.aiTask)],
            ["Human approval", esc(item.humanApproval)],
            ["Accountable owner", esc(item.owner)],
            ["Exception route", esc(item.exceptions)],
            ["Success metric", esc(item.metric)],
          ],
          "vertical-table",
        )}<div class="workflow-assessment"><div><b>Readiness</b><p>${esc(item.readiness)}</p></div><div><b>Primary risk</b><p>${esc(item.risk)}</p></div><div><b>Expected operational benefit</b><p>${esc(item.impact)}</p></div></div><aside class="warning">Candidate only. Data access, privacy, approved rules, exception handling and test acceptance must be confirmed before implementation.</aside></section>`,
    )
    .join("");
  return `<article class="report-sheet detailed-report" data-report="04">${reportHeader("04", "Top Three AI Workflow Priority Report", `${candidateCount} candidate workflow${candidateCount === 1 ? "" : "s"} captured · readiness and risk review required`)}${reportMeta(state, language)}${factStrip(t)}${section(r(language, "Portfolio priority summary", "流程优先级摘要"), r(language, `The workshop captured ${candidateCount} distinct priority workflow${candidateCount === 1 ? "" : "s"}, up to a maximum of three. Priority reflects workshop selection, not technical approval or completed implementation.`, `工作坊记录了 ${candidateCount} 个不同的优先工作流程（最多三个）。优先级来自工作坊选择，并不代表技术批准或已经实施。`))}${table(["Priority", "Business problem", "Owner", "Readiness", "Success metric", "Primary risk"], portfolioRows)}${cards}${section(r(language, "Implementation approval gate", "实施批准关卡"))}<div class="decision-box"><ul><li>Confirm lawful and approved access to every required data source.</li><li>Approve response rules, human decisions and exception routes.</li><li>Define a test set, baseline, target and rollback procedure.</li><li>Name an accountable business owner; technology does not own the result.</li><li>Record audit evidence and review the result before scaling.</li></ul></div>${reportFooter("04", state, language)}</article>`;
}

function masterPlanReport(ctx) {
  const { state, guidance, osKeys, language, t } = ctx;
  const priorities = osKeys
    .map((key) => ({ key, rating: state.diagnostic.osRatings[key] }))
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 3);
  const rhythmRows = [
    [
      "Weeks 1-4",
      "Align and launch",
      esc(state.plan.day1),
      esc(state.plan.owner),
      "Approved definitions, owners and baseline",
    ],
    [
      "Weeks 5-8",
      "Stabilise execution",
      esc(state.plan.day30),
      esc(state.plan.owner),
      esc(state.plan.metric),
    ],
    [
      "Weeks 9-12",
      "Optimise and correct",
      esc(state.plan.day60),
      esc(state.pre.executionOwner),
      "Exception trend and corrective-action log",
    ],
    [
      "Week 13",
      "Validate and decide",
      esc(state.plan.day90),
      esc(state.pre.decisionMaker),
      "Verified result and scale/stop decision",
    ],
  ];
  return `<article class="report-sheet detailed-report" data-report="05">${reportHeader("05", "90-Day AI Performance Transformation Master Plan", state.pre.direction)}${reportMeta(state, language)}${factStrip(t)}${section(r(language, "Strategy-to-execution cascade", "从战略到执行的连接"))}${table(
    ["Level", "Approved statement", "Owner / source"],
    [
      [
        "12-month direction",
        esc(state.pre.direction),
        esc(state.pre.decisionMaker),
      ],
      ["90-day must-win result", esc(state.plan.result), esc(state.plan.owner)],
      ["Current baseline", esc(state.pre.baseline), esc(state.pre.dataSource)],
      ["90-day target", esc(state.pre.target), esc(state.plan.metric)],
      [
        "Reward / recognition",
        esc(state.plan.reward),
        esc(state.pre.decisionMaker),
      ],
    ],
  )}<div class="target-card"><small>90-DAY MUST-WIN RESULT</small><h3>${esc(state.plan.result)}</h3><p><b>Accountable owner:</b> ${esc(state.plan.owner)} · <b>Metric:</b> ${esc(state.plan.metric)}</p><p><b>Fixed weekly key action:</b> ${esc(state.plan.weeklyAction)}</p></div>${section(r(language, "Day 1 / 30 / 60 / 90 checkpoints", "第 1／30／60／90 天检查点"))}<div class="timeline">${[1, 30, 60, 90].map((day) => `<section><strong>Day ${day}</strong><p>${esc(state.plan[`day${day}`])}</p></section>`).join("")}</div>${section(r(language, "13-week operating rhythm", "13 周执行节奏"))}${table(["Period", "Management purpose", "Key action", "Accountable owner", "Evidence / metric"], rhythmRows)}${section(r(language, "Top three OS workstreams", "三大 OS 工作流"))}${table(
    ["Priority OS", "Current score", "90-day focus", "Owner", "Measure"],
    priorities.map(({ key, rating }, index) => [
      esc(guidance.os[language][key].title),
      `${rating}/5`,
      esc(state.plan.hypotheses[index]?.validation),
      esc(state.diagnostic.bottlenecks[index]?.owner || state.plan.owner),
      esc(state.plan.hypotheses[index]?.metric),
    ]),
  )}${section(r(language, "Weekly management review agenda", "每周管理复盘议程"))}<ol class="requirement-list"><li>Confirm the result metric and data cut-off.</li><li>Review completed and missed key actions by owner.</li><li>Review workflow exceptions, risks and customer-impact cases.</li><li>Decide one corrective action with an owner and due date.</li><li>Recognise verified behaviour or results using the agreed rule.</li><li>Record decisions and carry unresolved items into the next review.</li></ol><aside class="decision-box"><b>Day 90 decision</b><p>Management decides whether to stop, continue as DIY, activate a narrow Vimigo workspace, or approve deeper implementation. No expansion is automatic.</p></aside>${reportFooter("05", state, language)}</article>`;
}

function productReport(ctx) {
  const { state, opportunity, language, t } = ctx;
  const hypothesisRows = state.plan.hypotheses
    .slice(0, 3)
    .map((item, index) => [
      `0${index + 1}`,
      esc(item.opportunity),
      esc(item.assumption),
      esc(item.upside),
      esc(item.validation),
      esc(item.metric),
    ]);
  const financial =
    opportunity === null
      ? `<p>${r(language, "Financial impact is not yet quantified because sufficient baseline data was not supplied. Confirm lead volume, conversion, average transaction value and other relevant cost or capacity baselines before calculation.", "由于未提供足够基线资料，目前无法量化财务影响。计算前必须确认线索量、转化率、平均交易额及相关成本或产能基线。")}</p>`
      : `<p><b>Indicative monthly revenue opportunity: RM ${opportunity.toLocaleString()}</b></p><p>Formula: monthly volume × (target conversion - current conversion) × average transaction value. This is a scenario based on client-supplied data, not a guaranteed gain.</p>`;
  const optionalRoutes = [
    [
      "Starter Workspace",
      "Only after activation is commercially confirmed; test one goal, three actions, one result and one reward for 30 days.",
    ],
    [
      "Vimigo for CEO 5.0",
      "Consider later if the primary constraint remains leadership direction and management-system discipline.",
    ],
    [
      "CVO Program",
      "Consider later if the company needs sustained review, coordination and transformation ownership.",
    ],
    [
      "Vimigo for AI Team",
      "Consider later only when a governed AI workflow is approved for design and implementation.",
    ],
  ].filter(([name]) => name !== state.plan.primaryProduct);
  return `<article class="report-sheet detailed-report" data-report="06">${reportHeader("06", "Business Model & Vimigo Product-Matching Report", `Primary route: ${state.plan.primaryProduct}`)}${reportMeta(state, language)}${factStrip(t)}<div class="primary-route"><small>ONE PRIMARY NEXT MOVE</small><h3>${esc(state.plan.primaryProduct)}</h3><p><b>Why this route fits:</b> ${esc(state.plan.productReason)}</p><p><b>Expected operating result:</b> ${esc(state.plan.expectedResult)}</p><p><b>Owner:</b> ${esc(state.plan.owner)} · <b>Review date:</b> ${esc(state.plan.reviewDate)}</p><aside>This is a recommendation for management validation, not proof that the product has been activated or implemented.</aside></div>${section(r(language, "How the recommended route is expected to improve performance", "建议路径如何提升绩效"))}${mechanismChain(state, language)}${section(r(language, "Maximum three business-model improvement opportunities", "最多三项商业模式改善机会"))}${table(["Priority", "Opportunity", "Assumption", "Expected upside", "Validation action", "Metric"], hypothesisRows)}${section(r(language, "Financial impact assessment", "财务影响评估"))}<aside class="financial">${financial}</aside>${section(r(language, "Scope boundary and optional later stages", "范围边界与后续可选阶段"))}${table(
    [
      "Optional later route",
      "Decision trigger - not an immediate recommendation",
    ],
    optionalRoutes.map(([name, trigger]) => [esc(name), esc(trigger)]),
  )}<div class="decision-box"><b>Management decision required</b><ul><li>Approve or reject the primary route.</li><li>Confirm commercial scope, activation status and responsible owner.</li><li>Approve the 30-day or 90-day validation metric.</li><li>Keep all later products outside the immediate recommendation until a verified need exists.</li></ul></div>${reportFooter("06", state, language)}</article>`;
}

export function buildDetailedReports(ctx) {
  const language = ctx.state.language;
  const t = {
    facts: ctx.t("facts"),
    assessment: ctx.t("assessment"),
    hypothesis: ctx.t("hypothesis"),
  };
  const full = { ...ctx, language, t };
  const reports = [
    detailedScoreReport(full),
    stageReport(full),
    osReport(full),
    workflowReport(full),
    masterPlanReport(full),
    productReport(full),
  ];
  const intro = r(
    language,
    "Six personalised consulting drafts generated from the form answers in this case. Final PDFs are exported only after CSM review and approval.",
    "六份详细顾问报告草稿。每份报告包含证据、分析、行动、负责人、指标和批准关卡。 ",
  );
  const downloadTitle = r(
    language,
    "Download the complete six-file report pack",
    "下载完整六份报告",
  );
  const downloadHelp = r(
    language,
    "One ZIP download containing six separately named PDF files (01-06).",
    "一次下载 ZIP 压缩包，内含六份独立命名的 PDF（01-06）。",
  );
  const downloadLabel = r(
    language,
    "Download all 6 PDFs (.zip)",
    "下载全部 6 份 PDF（ZIP）",
  );
  return `<section class="reports-shell"><header class="screen-header"><span>04</span><div><p>VIMIGO AI TRANSFORMATION DAY</p><h1>${r(language, "Six Detailed Reports", "六份详细报告")}</h1><small>${intro}</small></div></header>${ctx.state.submitted ? `<div class="confirmation">✓ ${ctx.t("confirmed")}</div>` : ""}<div class="report-index">${reports.map((_, i) => `<a href="#report-${i + 1}">0${i + 1}</a>`).join("")}</div><div class="download-pack"><div><b>${downloadTitle}</b><p>${downloadHelp}</p><small data-download-status aria-live="polite"></small></div><button type="button" class="primary" data-download-all>${downloadLabel}</button></div>${reports.map((report, i) => report.replace('class="report-sheet', `id="report-${i + 1}" class="report-sheet`)).join("")}<div class="submit-bar"><div><b>${ctx.state.submitted ? ctx.t("confirmed") : r(language, "PUBLIC DEMO - LOCAL SAVE ONLY", "公开示范 - 仅本机保存")}</b><p>${r(language, "This GitHub demo does not transmit client data or notify a CSM. Use the private pilot link for real submissions.", "此 GitHub 示范不会传送客户资料，也不会通知 CSM。真实提交必须使用私人试点链接。")}</p></div><button class="primary" data-submit ${ctx.state.submitted ? "disabled" : ""}>${ctx.t("submit")}</button></div></section>`;
}
