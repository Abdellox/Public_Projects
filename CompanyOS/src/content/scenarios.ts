import type { Scenario } from "./types";

export const scenarios: Scenario[] = [
  {
    slug: "sales-drop",
    title: "Sales dropped 20% this quarter",
    hook: "The quarterly numbers are in, and revenue missed plan by a fifth. Now what?",
    intro:
      "A sudden sales decline is one of the most revealing moments in company life — it exposes how well departments actually share information, and whether leadership reacts with analysis or panic.",
    whatHappened: [
      "Finance closes the quarter and flags that bookings came in ~20% below forecast.",
      "Leadership calls an emergency review before deciding anything public-facing.",
      "Every department suddenly discovers its numbers matter to everyone else.",
    ],
    departmentsInvolved: [
      { name: "Sales", concern: "Which reps, regions, and segments underperformed — and why? Pipeline coverage for next quarter?" },
      { name: "Marketing", concern: "Did lead volume or quality fall? Which channels stopped converting?" },
      { name: "Product", concern: "Are we losing to a competitor's new feature? Is churn concentrated around a weak area?" },
      { name: "Customer Success", concern: "Are existing customers downsizing or signaling dissatisfaction early?" },
      { name: "Finance", concern: "Cash impact: does the annual plan still hold? Do we reforecast or cut burn?" },
    ],
    dataToInvestigate: [
      "New vs renewal revenue split — is this an acquisition problem or retention problem?",
      "Win/loss rates by segment, region, and competitor mentioned",
      "Pipeline creation trends: did deals stop entering months ago?",
      "Lead-to-customer conversion rate by channel",
      "Churn and downgrade patterns among existing accounts",
      "Pricing changes or competitor launches coinciding with the drop",
    ],
    decisionMakers: [
      "CRO owns the recovery plan and any sales-territory changes.",
      "CMO reallocates channel budget if acquisition metrics explain it.",
      "CEO decides whether this is execution noise (fix quietly) or strategy failure (change course).",
      "CFO approves revised forecasts, spending freezes, or hiring pauses.",
    ],
    possibleActions: [
      "Tighten pipeline hygiene and refocus reps on best-converting segments",
      "Shift marketing budget toward historically highest-ROI channels",
      "Launch win-back campaigns to lapsed customers (cheaper than new logos)",
      "Freeze non-critical hiring until visibility improves",
      "Accelerate roadmap items tied to documented competitive losses",
      "Communicate transparently internally to prevent rumor-driven attrition",
    ],
    takeaway:
      "Diagnose before treating: a sales drop caused by retention needs completely different medicine than one caused by lead flow. The fastest companies instrument leading indicators so drops never arrive as surprises.",
  },
  {
    slug: "major-customer-leaving",
    title: "A major customer is leaving",
    hook: "Your biggest account — 15% of revenue — just sent a non-renewal notice.",
    intro:
      "Losing a whale account threatens more than revenue: it can trigger covenant issues, morale spirals, and copycat departures. How a company responds reveals whether it has real customer relationships or just contracts.",
    whatHappened: [
      "Customer Success receives notice that the account will not renew at contract end.",
      "The account team scrambles to understand reasons while leadership assesses financial exposure.",
      "Executives decide whether to fight for the account, let it go gracefully, or renegotiate terms.",
    ],
    departmentsInvolved: [
      { name: "Customer Success", concern: "What went wrong in the relationship — and is it fixable? Health-score history review." },
      { name: "Executive", concern: "Strategic concessions: how much discount/attention is this account worth?" },
      { name: "Sales", concern: "Renewal negotiation; also protecting other at-risk lookalike accounts." },
      { name: "Product", concern: "If product gaps caused this, which fixes are feasible pre-renewal date?" },
      { name: "Finance", concern: "Revenue concentration risk disclosure; updated forecasts and cost plans." },
    ],
    dataToInvestigate: [
      "Usage trends over 12 months: when did engagement start declining?",
      "Support ticket history: recurring pain themes, unresolved escalations",
      "Executive relationship strength: who inside the customer still advocates for us?",
      "Competitive situation: replacement vendor, switching costs, internal politics",
      "Contract terms: notice periods, termination clauses, remaining commitments",
      "Revenue concentration: how dependent are we on this single account overall?",
    ],
    decisionMakers: [
      "VP Customer Success leads save-play execution and honest post-mortems.",
      "CEO may join executive-level conversations for strategic accounts.",
      "CFO models scenarios: full loss vs partial retention vs delayed departure.",
      "Board gets informed if concentration risk crosses reporting thresholds.",
    ],
    possibleActions: [
      "Launch structured save-play: executive sponsor, gap remediation plan, success milestones",
      "Negotiate phased transition instead of cliff-edge exit",
      "Conduct blameless post-mortem feeding findings into product and CS playbooks",
      "Audit similar accounts sharing the same risk pattern",
      "Reduce concentration risk long-term via segment diversification targets",
    ],
    takeaway:
      "Whale losses are rarely surprises — health signals appear quarters earlier. Companies that act on leading indicators treat departures as recoverable; those that don't negotiate from desperation.",
  },
  {
    slug: "product-launch-failed",
    title: "A product launch failed",
    hook: "Six months of work shipped last month. Adoption is 4%. Everyone's pointing fingers.",
    intro:
      "Failed launches hurt most because they invalidate assumptions, not effort. The healthy response separates 'we built the wrong thing' from 'we built the right thing badly' — they demand opposite fixes.",
    whatHappened: [
      "Feature/product ships on time but adoption, activation, or revenue land far below projections.",
      "Post-launch review is scheduled; teams brace for blame rather than learning.",
      "Leadership must decide: iterate, reposition, sunset, or double investment.",
    ],
    departmentsInvolved: [
      { name: "Product", concern: "Was the problem real and the solution wrong, or diagnosis itself flawed? Research quality audit." },
      { name: "Engineering", concern: "Technical performance issues suppressing usage? Instrumentation gaps hiding truth?" },
      { name: "Marketing", concern: "Did messaging reach the right audience? Was positioning compelling or confusing?" },
      { name: "Sales / CS", concern: "Field feedback: what do actual users say? Are champions emerging anywhere?" },
    ],
    dataToInvestigate: [
      "Funnel breakdown: awareness → trial → activation → retained. Where exactly do users vanish?",
      "Qualitative interviews: why do the few active users stay? Why do abandoners leave?",
      "Segment analysis: is any niche adopting enthusiastically (pivot signal)?",
      "Discoverability: do users know the feature exists within the core workflow?",
      "Performance data: load times, errors, mobile experience suppressing engagement?",
    ],
    decisionMakers: [
      "Head of Product owns the iterate-vs-sunset recommendation with evidence.",
      "CTO weighs technical reinvestment against maintenance drag.",
      "CEO decides resource allocation: persistence budget vs graceful shutdown.",
      "Teams agree on kill criteria upfront to avoid zombie projects.",
    ],
    possibleActions: [
      "Run focused user research sprint before touching the roadmap again",
      "Reposition feature into different workflow where demand already exists",
      "Improve discoverability: in-app prompts, onboarding flows, documentation",
      "Set strict sunset criteria with dates — decisions need deadlines",
      "Publish blameless post-mortem so lessons outlive the project",
    ],
    takeaway:
      "Great companies fail cheaply and learn loudly. The goal isn't avoiding failed launches — it's ensuring each failure upgrades the organization's understanding of its customers.",
  },
  {
    slug: "costs-increased",
    title: "Costs increased significantly",
    hook: "Cloud bill up 40%, vendor renewals spiking, office lease resetting. Margins just vanished.",
    intro:
      "Cost inflation arrives slowly then suddenly: small increases compound across hundreds of line items until margins compress visibly. The response tests whether a company knows the difference between fat and muscle.",
    whatHappened: [
      "Finance's variance report shows expense lines consistently exceeding budget for consecutive months.",
      "Gross margin compression triggers alarm because it threatens the year's profitability commitments.",
      "Leadership launches cost review with a mandate: find structural savings, not cosmetic cuts.",
    ],
    departmentsInvolved: [
      { name: "Finance", concern: "Which categories drive the increase? One-time vs structural? Updated forecast implications." },
      { name: "Procurement", concern: "Vendor consolidation, renegotiation windows, alternative sourcing options." },
      { name: "Engineering", concern: "Cloud spend optimization: rightsizing, reserved instances, wasteful services." },
      { name: "Operations", concern: "Process efficiency: automation opportunities, facility utilization." },
      { name: "HR", concern: "If workforce actions loom: legal compliance, severance planning, morale management." },
    ],
    dataToInvestigate: [
      "Cost decomposition: fixed vs variable, direct vs overhead, trend per unit of output",
      "Unit economics shift: did cost-per-customer rise faster than value delivered?",
      "SaaS license utilization audit — typical firms waste 20–30% of seats",
      "Vendor contract calendar: which renewals offer renegotiation leverage soon?",
      "Headcount ratio versus revenue growth trajectory",
    ],
    decisionMakers: [
      "CFO owns the cost-reduction program and margin recovery targets.",
      "Department heads propose cuts within their domains with business-case evidence.",
      "CEO arbitrates conflicts — every department believes its budget is sacred.",
      "Board expects margin recovery narrative at next update.",
    ],
    possibleActions: [
      "Renegotiate top-10 vendor contracts with consolidated volume leverage",
      "Implement FinOps practices: tagging, budgets, anomaly alerts on cloud spend",
      "Kill zombie projects and orphaned subscriptions nobody defends",
      "Restructure pricing to pass through input-cost increases where market allows",
      "Sequence cuts carefully: irreversible damage from layoff mistakes exceeds savings",
    ],
    takeaway:
      "Sustainable margin recovery comes from structural efficiency, not across-the-board percentage cuts that amputate muscle equally with fat. Companies that instrument costs continuously never face panic reviews.",
  },
  {
    slug: "international-expansion",
    title: "The company wants to expand internationally",
    hook: "The board approved exploring Europe. Suddenly everything is more complicated.",
    intro:
      "International expansion multiplies organizational complexity overnight: new regulations, languages, payment methods, time zones, and cultural expectations. Done deliberately, it opens massive markets; done casually, it burns cash building beachheads that collapse.",
    whatHappened: [
      "Domestic growth is strong but saturating; leadership identifies international markets as the next engine.",
      "A target market analysis phase begins before committing significant resources.",
      "Departments discover their processes assume one country, one language, one currency.",
    ],
    departmentsInvolved: [
      { name: "Executive", concern: "Market selection criteria, entry mode (direct/partner/acquisition), risk appetite." },
      { name: "Legal", concern: "Entity setup, GDPR/data-residency compliance, local labor law, IP protection." },
      { name: "Finance", concern: "Currency exposure, tax structures, transfer pricing, localized pricing economics." },
      { name: "Marketing", concern: "Localization beyond translation: positioning, channels, cultural fit." },
      { name: "HR", concern: "Local hiring compliance, compensation benchmarks, employer-of-record options." },
      { name: "Product", concern: "Localization scope, regional feature expectations, support coverage hours." },
    ],
    dataToInvestigate: [
      "Market sizing: TAM reachable given language/regulatory constraints",
      "Competitor landscape including local incumbents with home advantage",
      "Willingness-to-pay differences requiring pricing adaptation",
      "Regulatory burden comparison across candidate countries",
      "Operational readiness: support timezone coverage, localization capacity",
    ],
    decisionMakers: [
      "CEO sponsors the initiative; often appoints a dedicated expansion lead.",
      "Board approves capital allocation for entity setup and initial headcount.",
      "Functional VPs own localization of their domains with milestone accountability.",
      "Country manager (once hired) owns local execution end-to-end.",
    ],
    possibleActions: [
      "Enter one beachhead market deeply rather than three superficially",
      "Use employer-of-record services to hire compliantly before entities exist",
      "Localize pricing, payments, and legal terms before marketing spend",
      "Hire local country manager early — expat-led entries routinely misread markets",
      "Define explicit success criteria and exit thresholds to prevent sunk-cost escalation",
    ],
    takeaway:
      "Expansion succeeds through sequencing, not simultaneous everywhere-ness. The companies that thrive abroad treat each market as a new product launch demanding discovery, not a translation exercise.",
  },
  {
    slug: "hiring-rapidly",
    title: "The company is hiring rapidly",
    hook: "Fifty open requisitions, onboarding running weekly, culture feeling... thinner?",
    intro:
      "Rapid hiring feels like winning — demand is real, investors are happy. But scaling headcount 2× in a year stress-tests every process the company has. Culture, quality, and productivity all dilute unless managed deliberately.",
    whatHappened: [
      "Growth funding or demand surge triggers aggressive headcount plans across multiple departments.",
      "Recruiting scales up while onboarding, management capacity, and documentation lag behind.",
      "Early signs appear: longer ramp times, duplicated work, inconsistent quality bars.",
    ],
    departmentsInvolved: [
      { name: "HR", concern: "Recruiting capacity, interviewer training, onboarding logistics at volume, offer calibration." },
      { name: "Finance", concern: "Burn impact of salary commitments, hiring-plan discipline against runway." },
      { name: "Engineering/Product", concern: "Interviewer time drain, codebase comprehension, mentorship ratios." },
      { name: "Operations/IT", concern: "Equipment, seating, system access provisioning at weekly cohorts." },
      { name: "Executive", concern: "Org design keeping spans sane; leadership bench growing ahead of needs." },
    ],
    dataToInvestigate: [
      "Time-to-hire and offer-acceptance trends as volume strains quality",
      "New-hire ramp curves: weeks to first meaningful contribution by cohort",
      "Manager span-of-control distribution — who's drowning?",
      "90-day attrition: are hires failing or fleeing?",
      "Quality indicators: defect rates, support escalations during scale-up",
    ],
    decisionMakers: [
      "CHRO owns hiring infrastructure scaling and bar consistency.",
      "CFO enforces hiring-plan discipline linking requisitions to budget.",
      "Department heads own interviewer availability despite delivery pressure.",
      "CEO sets cultural tone: speed vs selectivity trade-off made explicit.",
    ],
    possibleActions: [
      "Invest in structured interviewing before volume — unstructured interviews collapse at scale",
      "Build cohort-based onboarding with buddy systems and 30/60/90 frameworks",
      "Promote or hire managers ahead of the curve; every 8 ICs need leadership",
      "Document tribal knowledge proactively — hallway osmosis stops working past ~50 people",
      "Track quality-of-hire metrics, not just quantity, monthly",
    ],
    takeaway:
      "Companies don't scale by hiring fast; they scale by keeping quality, culture, and clarity intact while hiring fast. Infrastructure must precede headcount, not chase it.",
  },
  {
    slug: "preparing-for-ipo",
    title: "The company is preparing for an IPO",
    hook: "Bankers are in the building, controls teams are multiplying, and everything now takes longer.",
    intro:
      "Going public transforms a private company into one accountable to markets quarterly. The 12–24 month preparation rewires finance, legal, and communication norms — often frustrating veterans while professionalizing the machine.",
    whatHappened: [
      "Board and executives decide the company is ready: sufficient scale, predictable metrics, credible growth story.",
      "Investment banks, auditors, and lawyers engage; the S-1 registration drafting marathon begins.",
      "Company-wide discipline shifts: everything measurable becomes reported, everything reported becomes scrutinized.",
    ],
    departmentsInvolved: [
      { name: "Finance", concern: "Auditable statements, internal controls (SOX), revenue-recognition precision, guidance capability." },
      { name: "Legal", concern: "Registration documents, governance restructuring, equity cleanup, risk-factor disclosures." },
      { name: "Executive", concern: "Narrative construction, roadshow preparation, lock-up dynamics, post-IPO operating rhythm." },
      { name: "HR", concern: "RSU liquidity communications, retention amid vesting events, compensation benchmarking against public peers." },
      { name: "IR / Comms", concern: "Investor relations function birth, quiet-period rules, disclosure controls." },
    ],
    dataToInvestigate: [
      "Financial statement auditability: can numbers survive external scrutiny unadjusted?",
      "Key-person risk and succession documentation for disclosure",
      "Metric definitions: are ARR/churn calculations defensible under examination?",
      "Equity cap table cleanliness: option grants, 409A valuations, convertible notes",
      "Comparable public company multiples shaping valuation expectations",
    ],
    decisionMakers: [
      "CEO and CFO front the process, bankers selection, and final timing call.",
      "Board approves the IPO decision, valuation range, and governance changes.",
      "Underwriters advise on size, pricing, and roadshow positioning.",
      "SEC ultimately approves the registration statement effectiveness.",
    ],
    possibleActions: [
      "Stand up SOX-compliant internal controls 18+ months before listing",
      "Practice quarterly earnings calls internally to build guidance muscle",
      "Clean up cap table and convert complex instruments early",
      "Prepare employees for RSU taxation realities — surprises breed resentment",
      "Build IR infrastructure: earnings calendars, disclosure committees, quiet-period training",
    ],
    takeaway:
      "An IPO isn't a finish line — it's a permanent operating-model upgrade. Companies that treat preparation as transformation (rather than paperwork) emerge stronger regardless of listing-day pop.",
  },
];

export const scenarioBySlug = (slug: string) =>
  scenarios.find((s) => s.slug === slug);
